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
import { loadHighlights, saveHighlights } from "../src/storage.js";
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
