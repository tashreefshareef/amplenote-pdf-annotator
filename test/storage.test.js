/**
 * Tests for highlight persistence.
 *
 * This is the exact mechanism the bounty T&C requires coverage for (spec section 5.2):
 * a managed section, keyed by attachment id, that must load/save idempotently and
 * never corrupt the user's own note content. The mock's section-scoped
 * `replaceNoteContent` (test/helpers.js) was itself validated against the live API
 * during Phase 1 development, so these tests exercise the same code path Amplenote
 * actually runs.
 */
import { loadHighlights, saveHighlights, deleteHighlights } from "../src/storage.js";
import { createHighlight } from "../src/highlights.js";
import { STORAGE_SECTION_HEADING } from "../src/constants.js";
import { createMockApp } from "./helpers.js";

const NOTE = "note-1";
const ATT_A = "att-aaa";
const ATT_B = "att-bbb";

const sampleHighlight = (overrides = {}) =>
  createHighlight({
    page: 2,
    color: "coral",
    rects: [{ x: 10, y: 700, width: 200, height: 12 }],
    quoteText: "a sample quote",
    ...overrides,
  });

describe("loadHighlights", () => {
  // Scenario: brand-new note, no managed section yet.
  test("returns an empty array when the note has no storage section", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "# Title\nhello" }] });
    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([]);
  });

  // Scenario: the section exists but this specific attachment has never been saved.
  test("returns an empty array for an attachment not yet present in the section", async () => {
    const content = `# Title\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{"${ATT_B}":[]}\n\`\`\``;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });
    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([]);
  });

  // Scenario: a user hand-edited the section into something unparseable. Spec section
  // 7.4 requires this not to crash the plugin.
  test("returns an empty array rather than throwing on corrupted JSON", async () => {
    const content = `# ${STORAGE_SECTION_HEADING}\n\nnot valid json at all {{{`;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });
    await expect(loadHighlights(app, NOTE, ATT_A)).resolves.toEqual([]);
  });

  // Scenario: one bad entry among otherwise-valid ones must not sink the whole load -
  // each entry is independently re-validated through createHighlight.
  test("drops individually malformed highlight entries but keeps valid ones", async () => {
    const good = sampleHighlight({ id: "good-1" });
    const payload = { [ATT_A]: [good, { id: "bad", page: -1, rects: [] }] };
    const content = `# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\``;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    const loaded = await loadHighlights(app, NOTE, ATT_A);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].id).toBe("good-1");
  });
});

describe("saveHighlights", () => {
  // Scenario: first save on a note with no prior plugin data - must create the
  // section, not throw.
  test("creates the managed section on first save", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "# My notes\nhand-written stuff" }] });
    const h = sampleHighlight();

    await saveHighlights(app, NOTE, ATT_A, [h]);

    const finalContent = app._notes.get(NOTE).content;
    expect(finalContent).toContain(`# ${STORAGE_SECTION_HEADING}`);
    expect(finalContent).toContain("My notes");
    expect(finalContent).toContain("hand-written stuff");
  });

  // Scenario: THE core round-trip guarantee - save then load must reproduce exactly
  // what was stored.
  test("round-trips a highlight through save then load unchanged", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const h = sampleHighlight({ id: "hl-roundtrip" });

    await saveHighlights(app, NOTE, ATT_A, [h]);
    const loaded = await loadHighlights(app, NOTE, ATT_A);

    expect(loaded).toEqual([h]);
  });

  // Scenario: multiple PDFs on the same note. Saving one attachment's highlights must
  // not disturb another's, since the spec requires the section be keyed by attachment.
  test("preserves other attachments' highlights when saving one", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const hA = sampleHighlight({ id: "hl-a" });
    const hB = sampleHighlight({ id: "hl-b", page: 5 });

    await saveHighlights(app, NOTE, ATT_A, [hA]);
    await saveHighlights(app, NOTE, ATT_B, [hB]);

    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([hA]);
    expect(await loadHighlights(app, NOTE, ATT_B)).toEqual([hB]);
  });

  // Scenario: idempotency - saving the identical list twice must not duplicate or
  // corrupt anything (spec section 7.4's explicit idempotency requirement).
  test("saving the same highlights twice is idempotent", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const h = sampleHighlight();

    await saveHighlights(app, NOTE, ATT_A, [h]);
    await saveHighlights(app, NOTE, ATT_A, [h]);

    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([h]);
  });

  // Scenario: removing a highlight is just saving a shorter array - confirms deletions
  // persist rather than lingering from a stale section.
  test("saving an empty array clears previously stored highlights", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight()]);
    await saveHighlights(app, NOTE, ATT_A, []);
    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([]);
  });

  // Scenario: THE data-loss bug. Notes are user-typed free text stored inside a fenced
  // code block. A note containing a triple backtick would close that fence early; the
  // reader's non-greedy match would stop at the inner fence, fail to parse, and treat
  // the whole section as corrupt - silently discarding EVERY highlight on the note, not
  // just the one with the awkward note. Backticks are escaped for exactly this reason.
  test("survives a note containing a markdown code fence", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const tricky = sampleHighlight({
      id: "hl-fence",
      note: "run ```npm test``` first",
      quoteText: "quote with ` backtick",
    });
    const plain = sampleHighlight({ id: "hl-plain" });

    await saveHighlights(app, NOTE, ATT_A, [tricky, plain]);
    const loaded = await loadHighlights(app, NOTE, ATT_A);

    // Both highlights survive, and the note text comes back byte-identical.
    expect(loaded).toHaveLength(2);
    expect(loaded[0].note).toBe("run ```npm test``` first");
    expect(loaded[0].quoteText).toBe("quote with ` backtick");
    // No raw backtick is left inside the stored block to break the fence.
    const stored = app._notes.get(NOTE).content;
    const fenceBody = stored.match(/```json\n([\s\S]*?)\n```/)[1];
    expect(fenceBody).not.toContain("`");
  });

  // Scenario: a short HTML-comment-wrapped format was tried briefly to hide the payload
  // from the reading view, then reverted (see storage.js's serialize doc comment) after
  // it turned out not to render as hidden in the live app and is suspected of exposing
  // the JSON to Amplenote's rich-text normalization - a real bug where recoloring or
  // adding a note made an existing highlight silently disappear. A note saved by that
  // short-lived version must still load, so nothing written during that window is lost;
  // the very next save rewrites it in the safe fenced format.
  test("still loads highlights saved in the short-lived hidden-comment format", async () => {
    const h = sampleHighlight({ id: "hl-legacy" });
    const payload = { [ATT_A]: [h] };
    const content = `# ${STORAGE_SECTION_HEADING}\n\n<!-- PDFA-DATA\n${JSON.stringify(payload)}\n-->`;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([h]);
  });

  test("upgrades a note from the hidden-comment format to the fenced format on next save", async () => {
    const h = sampleHighlight({ id: "hl-legacy" });
    const payload = { [ATT_A]: [h] };
    const content = `# ${STORAGE_SECTION_HEADING}\n\n<!-- PDFA-DATA\n${JSON.stringify(payload)}\n-->`;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    await saveHighlights(app, NOTE, ATT_A, [h]);

    const stored = app._notes.get(NOTE).content;
    expect(stored).toContain("```json");
    expect(stored).not.toContain("<!-- PDFA-DATA");
    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([h]);
  });

  // Scenario: negative PDF-space coordinates are common (PDF origin is bottom-left) -
  // plain JSON.stringify/parse handles these natively, but worth pinning as a regression
  // guard given how much this file's serialization has churned.
  test("round-trips negative coordinates without corrupting them", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const h = sampleHighlight({ id: "hl-neg", rects: [{ x: -12.5, y: -3, width: 20, height: 10 }] });

    await saveHighlights(app, NOTE, ATT_A, [h]);
    const loaded = await loadHighlights(app, NOTE, ATT_A);

    expect(loaded[0].rects[0].x).toBe(-12.5);
    expect(loaded[0].rects[0].y).toBe(-3);
  });

  // Scenario: the other characters a user will realistically type into a note. JSON
  // handles these, but a regression to a hand-rolled serializer would not.
  test("round-trips notes containing quotes, backslashes and newlines", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const note = 'He said "no" \\ then\nleft — 100% sure';
    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight({ id: "hl-x", note })]);

    expect((await loadHighlights(app, NOTE, ATT_A))[0].note).toBe(note);
  });

  // Scenario: content the user wrote AFTER the managed section (spec section 7.4's
  // "don't let manual edits corrupt it") must survive a save.
  test("does not disturb note content that follows the managed section", async () => {
    const content = `# Intro\nuser text before\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{}\n\`\`\`\n\n# Conclusions\nuser text after`;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight()]);

    const final = app._notes.get(NOTE).content;
    expect(final).toContain("user text before");
    expect(final).toContain("user text after");
    expect(final.indexOf("user text after")).toBeGreaterThan(final.indexOf("user text before"));
  });
});

describe("deleteHighlights", () => {
  // Scenario: THE point of this function - detaching a viewer (embed-call.js's
  // removeViewer action) must not leave even an empty [] placeholder behind for an
  // attachment that no longer exists.
  test("removes the attachment's entry entirely, not just clears it", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight()]);

    await deleteHighlights(app, NOTE, ATT_A);

    const stored = app._notes.get(NOTE).content;
    // No trace of the attachment's key at all - not even an empty array for it.
    expect(stored).not.toContain(ATT_A);
    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([]);
  });

  // Scenario: multiple PDFs on one note - deleting one attachment's highlights must not
  // disturb another's, same guarantee saveHighlights gives.
  test("preserves other attachments' highlights", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const hB = sampleHighlight({ id: "hl-b" });
    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight({ id: "hl-a" })]);
    await saveHighlights(app, NOTE, ATT_B, [hB]);

    await deleteHighlights(app, NOTE, ATT_A);

    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([]);
    expect(await loadHighlights(app, NOTE, ATT_B)).toEqual([hB]);
  });

  // Scenario: nothing to delete - a fresh note with no managed section at all - must not
  // throw. removeViewer's own attachment lookup already guards against this in practice,
  // but the function itself should be safe called on its own too.
  test("is a no-op when there is no managed section yet", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "# Title\nhello" }] });
    await expect(deleteHighlights(app, NOTE, ATT_A)).resolves.toBeUndefined();
    expect(app._notes.get(NOTE).content).toBe("# Title\nhello");
  });

  // Scenario: an attachment with no entry in an otherwise-populated section - also a
  // no-op, not an error, and must not disturb the entry that IS there.
  test("is a no-op when this attachment has no entry in the section", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content: "" }] });
    const hB = sampleHighlight({ id: "hl-b" });
    await saveHighlights(app, NOTE, ATT_B, [hB]);

    await deleteHighlights(app, NOTE, ATT_A);

    expect(await loadHighlights(app, NOTE, ATT_B)).toEqual([hB]);
  });
});

describe("repairing a section that swallowed the user's content", () => {
  // Scenario: THE reported data-loss bug, from the writer's side. "Send to note" used to
  // append exports at the very end of the note - and since the managed section is created
  // at the end, it was whatever came last, so every export landed inside it. This
  // section-scoped save replaces everything under the heading, so the next highlight the
  // user created wiped every highlight they had exported. Screenshot-confirmed live.
  //
  // A save must now REPAIR such a note: lift the trapped content back into the body above
  // the heading, and leave the managed section holding only its own payload.
  test("lifts exported content out of the section instead of destroying it", async () => {
    const trapped = '==[paper.pdf](url)==\n> "an exported quote"';
    const content =
      `# Reading notes\n\nmy own text\n\n# ${STORAGE_SECTION_HEADING}\n\n` +
      "```json\n{}\n```\n\n" +
      trapped;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    const h = sampleHighlight();
    await saveHighlights(app, NOTE, ATT_A, [h]);

    const final = app._notes.get(NOTE).content;
    // The export survived...
    expect(final).toContain('> "an exported quote"');
    // ...above the heading, not inside the section, so the NEXT save cannot hit it either.
    expect(final.indexOf('> "an exported quote"')).toBeLessThan(
      final.indexOf(`# ${STORAGE_SECTION_HEADING}`)
    );
    // The user's own content is untouched and still first.
    expect(final).toContain("my own text");
    expect(final.indexOf("my own text")).toBeLessThan(final.indexOf('> "an exported quote"'));
    // And the highlight actually saved.
    expect(await loadHighlights(app, NOTE, ATT_A)).toEqual([h]);
  });

  // Scenario: repeated saves must converge, not keep lifting the same block or duplicate
  // it. Once repaired there is nothing stray left, so every later save takes the cheap
  // section-scoped path again.
  test("repairs once and then leaves the note alone", async () => {
    const content =
      `# Notes\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{}\n\`\`\`\n\nstray block`;
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight()]);
    const afterFirst = app._notes.get(NOTE).content;
    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight({ id: "hl-2" })]);
    const afterSecond = app._notes.get(NOTE).content;

    expect((afterFirst.match(/stray block/g) || []).length).toBe(1);
    expect((afterSecond.match(/stray block/g) || []).length).toBe(1);
  });

  // Scenario: content BELOW the managed section (a heading the user added later) is not
  // part of the section and must survive a repair untouched - the repair rewrites the
  // whole note, so everything outside the section is in its blast radius too.
  test("preserves content that follows the managed section", async () => {
    const content =
      `# Notes\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{}\n\`\`\`\n\nstray\n\n` +
      "# Afterwards\n\ntrailing text";
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "N", content }] });

    await saveHighlights(app, NOTE, ATT_A, [sampleHighlight()]);

    const final = app._notes.get(NOTE).content;
    expect(final).toContain("trailing text");
    expect(final).toContain("# Afterwards");
    expect(final.indexOf(`# ${STORAGE_SECTION_HEADING}`)).toBeLessThan(final.indexOf("# Afterwards"));
  });
});
