/**
 * Tests for the embed -> plugin bridge.
 *
 * This is where the bounty T&C's coverage requirement (spec section 5.2) bites hardest:
 * every highlight the user creates, recolors or deletes reaches the note through one of
 * these actions, and the embed itself is untestable by construction. If a bug can
 * corrupt a user's note, it can only be caught here.
 *
 * The protocol is deliberately unusual and two properties of it are pinned below:
 *   - errors are RETURNED as `{ error }`, never thrown, because a rejected promise
 *     surfaces in the embed as an opaque failure the user cannot act on
 *   - the wire format is a JSON STRING in both directions; structured objects hung the
 *     bridge silently in the live app
 */
import { handleEmbedCall, handleEmbedCallSerialized, parseEmbedPayload } from "../src/embed-call.js";
import { loadHighlights, saveHighlights } from "../src/storage.js";
import { createHighlight } from "../src/highlights.js";
import { STORAGE_SECTION_HEADING } from "../src/constants.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const NOTE = "note-1";
const ATT = "attach-1";

const appWithNote = (content = "") =>
  createMockApp({
    notes: [{ uuid: NOTE, name: "Reading", content, attachments: [mockAttachment({ uuid: ATT })] }],
  });

/** The raw shape the embed sends - no id, since the plugin assigns it. */
const draft = (overrides = {}) => ({
  page: 1,
  color: "yellow",
  rects: [{ x: 72, y: 700, width: 180, height: 12 }],
  quoteText: "the quick brown fox",
  note: null,
  ...overrides,
});

const call = (app, request) => handleEmbedCall(app, request);

describe("parseEmbedPayload", () => {
  // Scenario: the normal path - the embed JSON-stringifies its request object.
  test("parses a JSON string into a request object", () => {
    expect(parseEmbedPayload('{"action":"ping"}')).toEqual({ action: "ping" });
  });

  // Scenario: a bare action name, which the early probe code used and which costs
  // nothing to keep accepting.
  test("treats a bare string as an action name", () => {
    expect(parseEmbedPayload("ping")).toEqual({ action: "ping" });
  });

  // Scenario: garbage on the wire must not throw - a throw here would surface in the
  // embed as an unexplained hang.
  test("never throws on malformed or missing input", () => {
    expect(parseEmbedPayload("{not json")).toEqual({ action: "{not json" });
    expect(parseEmbedPayload(undefined)).toEqual({});
    expect(parseEmbedPayload(42)).toEqual({});
  });
});

describe("handleEmbedCallSerialized", () => {
  // Scenario: the bridge only reliably carries strings, so the plugin's reply must be
  // serialized. Returning the object directly hung the embed with no error at all.
  test("returns a JSON string the embed can parse back", async () => {
    const app = appWithNote();
    const raw = await handleEmbedCallSerialized(app, JSON.stringify({ action: "ping" }));
    expect(typeof raw).toBe("string");
    expect(JSON.parse(raw)).toEqual({ ok: true });
  });
});

describe("noteUUID resolution (switching notes away and back)", () => {
  // Scenario: THE bug this exists to fix. A user reported highlights disappearing from
  // the viewer specifically after navigating away from a note and back, even though the
  // "PDF Annotator data" section still had them - i.e. a load-time bug, not a save-time
  // one. Suspected cause: onEmbedCall's own app.context.noteUUID goes stale when an
  // embed remounts after a note switch, so a highlight genuinely saved under the right
  // note gets looked up against the wrong one. The fix sends noteUUID explicitly with
  // every request (captured once at renderEmbed time - see plugin.js/viewer.js) rather
  // than trusting app.context.noteUUID fresh on every call.
  test("uses the request's own noteUUID over a stale app.context.noteUUID", async () => {
    const NOTE_B = "note-2";
    const app = createMockApp({
      notes: [
        { uuid: NOTE, name: "A", content: "", attachments: [mockAttachment({ uuid: ATT })] },
        { uuid: NOTE_B, name: "B", content: "" },
      ],
    });
    await saveHighlights(app, NOTE, ATT, [createHighlight(draft())]);

    // Simulate the live bug directly: the plugin's own context still points at a
    // DIFFERENT note, as if it wasn't refreshed after switching back to NOTE.
    app.context.noteUUID = NOTE_B;

    const result = await call(app, { action: "loadHighlights", attachmentUUID: ATT, noteUUID: NOTE });

    expect(result.highlights).toHaveLength(1);
  });

  // Scenario: back-compat - any cached embed HTML from before this fix never sends its
  // own noteUUID at all. Must still work by falling back to app.context.noteUUID.
  test("falls back to app.context.noteUUID when the request sends none", async () => {
    const app = appWithNote("");
    await saveHighlights(app, NOTE, ATT, [createHighlight(draft())]);

    const result = await call(app, { action: "loadHighlights", attachmentUUID: ATT });

    expect(result.highlights).toHaveLength(1);
  });
});

describe("getPdfUrl", () => {
  // Scenario: the embed cannot fetch the attachment itself - the presigned S3 URL has
  // no CORS headers - so it asks the plugin for a proxied one.
  test("returns a proxied URL and the attachment's display name", async () => {
    const app = appWithNote();
    const result = await call(app, { action: "getPdfUrl", attachmentUUID: ATT });

    expect(result.url).toContain("cors-proxy");
    expect(result.url).toContain("apiurl=");
    expect(result.name).toBe("sample.pdf");
  });

  // Scenario: an embed inserted without an attachment parameter. It must say so rather
  // than failing somewhere deeper with a less useful message.
  test("reports a missing attachment as an error, not a throw", async () => {
    const result = await call(appWithNote(), { action: "getPdfUrl" });
    expect(result.error).toMatch(/no attachment/i);
  });

  // Scenario: the name lookup is cosmetic. If it fails, loading the PDF must still
  // work - a viewer with an unlabeled toolbar beats no viewer.
  test("still returns the URL when the name lookup fails", async () => {
    const app = appWithNote();
    app.getNoteAttachments = async () => {
      throw new Error("network");
    };
    const result = await call(app, { action: "getPdfUrl", attachmentUUID: ATT });

    expect(result.url).toContain("cors-proxy");
    expect(result.name).toBe("");
  });
});

describe("addHighlight", () => {
  // Scenario: THE central write. A selection captured in the embed must end up in the
  // note's managed section, readable back by the next session.
  test("persists a new highlight into the note", async () => {
    const app = appWithNote("# Reading notes\nmy own text");
    const result = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });

    expect(result.highlights).toHaveLength(1);
    expect(result.highlights[0].quoteText).toBe("the quick brown fox");
    expect(await loadHighlights(app, NOTE, ATT)).toEqual(result.highlights);
    // The user's own content is untouched.
    expect(app._notes.get(NOTE).content).toContain("my own text");
  });

  // Scenario: the embed deliberately sends no id, so the id format has exactly one
  // owner (createHighlight) instead of being duplicated into untestable embed code.
  test("assigns an id the embed did not supply", async () => {
    const app = appWithNote();
    const result = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    expect(result.highlights[0].id).toMatch(/^hl-/);
  });

  // Scenario: two highlights in a row. The second must not replace the first - the
  // action appends to whatever is already stored.
  test("appends rather than replacing existing highlights", async () => {
    const app = appWithNote();
    await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft({ page: 3, color: "green", quoteText: "second" }),
    });

    const stored = await loadHighlights(app, NOTE, ATT);
    expect(stored).toHaveLength(2);
    expect(stored[1].page).toBe(3);
    expect(stored[1].color).toBe("green");
  });

  // Scenario: a malformed highlight must be refused BEFORE it reaches the note.
  // Validation lives on the plugin side precisely because the embed cannot import the
  // validator, and a corrupt record would break every later load.
  test("rejects a structurally invalid highlight without writing to the note", async () => {
    const app = appWithNote("# Reading\noriginal");
    const before = app._notes.get(NOTE).content;

    const result = await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft({ rects: [] }),
    });

    expect(result.error).toMatch(/could not save the highlight/i);
    expect(app._notes.get(NOTE).content).toBe(before);
  });

  // Scenario: an unknown color must not silently become "no color" or crash - it falls
  // back to the default, which is what createHighlight guarantees.
  test("falls back to the default color for an unrecognized one", async () => {
    const app = appWithNote();
    const result = await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft({ color: "chartreuse" }),
    });
    expect(result.highlights[0].color).toBe("yellow");
  });

  // Scenario: two PDFs on one note. The managed section is keyed by attachment, so
  // highlighting in one must be invisible to the other.
  test("keeps highlights for different attachments apart", async () => {
    const app = appWithNote();
    await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    await call(app, {
      action: "addHighlight",
      attachmentUUID: "attach-2",
      highlight: draft({ quoteText: "other pdf" }),
    });

    expect(await loadHighlights(app, NOTE, ATT)).toHaveLength(1);
    expect((await loadHighlights(app, NOTE, "attach-2"))[0].quoteText).toBe("other pdf");
  });
});

describe("recolorHighlight", () => {
  // Scenario: editing the color of an existing highlight - an explicit spec requirement
  // (section 4).
  test("changes only the targeted highlight's color", async () => {
    const app = appWithNote();
    const a = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft({ quoteText: "untouched" }),
    });
    const targetId = a.highlights[0].id;

    const result = await call(app, {
      action: "recolorHighlight",
      attachmentUUID: ATT,
      id: targetId,
      color: "blue",
    });

    expect(result.highlights.find((h) => h.id === targetId).color).toBe("blue");
    expect(result.highlights.find((h) => h.id !== targetId).color).toBe("yellow");
    // And it survived the write, not just the in-memory copy.
    expect((await loadHighlights(app, NOTE, ATT)).find((h) => h.id === targetId).color).toBe("blue");
  });

  // Scenario: recoloring must not disturb the rest of the record - the rects and the
  // quote are what Phase 4's annotations and Phase 5's export are built from.
  test("preserves rects, quote text and note when recoloring", async () => {
    const app = appWithNote();
    const added = await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft({ note: "worth remembering" }),
    });
    const original = added.highlights[0];

    const result = await call(app, {
      action: "recolorHighlight",
      attachmentUUID: ATT,
      id: original.id,
      color: "coral",
    });

    expect(result.highlights[0]).toEqual({ ...original, color: "coral" });
  });

  // Scenario: an unknown color is a bug in the caller, not user input. Storing it would
  // make the highlight render as nothing, so the write is refused outright.
  test("refuses an unknown color and leaves the stored highlight alone", async () => {
    const app = appWithNote();
    const added = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });

    const result = await call(app, {
      action: "recolorHighlight",
      attachmentUUID: ATT,
      id: added.highlights[0].id,
      color: "octarine",
    });

    expect(result.error).toMatch(/could not change/i);
    expect((await loadHighlights(app, NOTE, ATT))[0].color).toBe("yellow");
  });

  // Scenario: a stale embed acting on a highlight someone already deleted. Nothing to
  // change means nothing to write - the note must not be rewritten for a no-op.
  test("is a no-op for an unknown id and does not rewrite the note", async () => {
    const app = appWithNote();
    await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    const writesBefore = app.replaceNoteContent.mock.calls.length;

    const result = await call(app, {
      action: "recolorHighlight",
      attachmentUUID: ATT,
      id: "hl-does-not-exist",
      color: "blue",
    });

    expect(result.highlights).toHaveLength(1);
    expect(app.replaceNoteContent.mock.calls.length).toBe(writesBefore);
  });
});

describe("setHighlightNote", () => {
  /** Create one highlight and hand back its id. */
  const seed = async (app, overrides) => {
    const added = await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft(overrides),
    });
    return added.highlights[added.highlights.length - 1].id;
  };

  // Scenario: the core Phase 3 flow - attach a plain-text note to an existing highlight.
  test("adds a note to a highlight and persists it", async () => {
    const app = appWithNote();
    const id = await seed(app);

    const result = await call(app, {
      action: "setHighlightNote",
      attachmentUUID: ATT,
      id,
      note: "check this clause against the renewal quote",
    });

    expect(result.highlights[0].note).toBe("check this clause against the renewal quote");
    expect((await loadHighlights(app, NOTE, ATT))[0].note).toBe(
      "check this clause against the renewal quote"
    );
  });

  // Scenario: editing an existing note replaces it. A highlight has AT MOST ONE note
  // (spec section 4), so a second write must overwrite rather than accumulate.
  test("editing replaces the note instead of adding a second one", async () => {
    const app = appWithNote();
    const id = await seed(app);

    await call(app, { action: "setHighlightNote", attachmentUUID: ATT, id, note: "first" });
    const result = await call(app, {
      action: "setHighlightNote",
      attachmentUUID: ATT,
      id,
      note: "second",
    });

    expect(result.highlights[0].note).toBe("second");
    // The record still has exactly one note field, not a list.
    expect(Object.keys(result.highlights[0]).filter((k) => k.startsWith("note"))).toEqual(["note"]);
  });

  // Scenario: removing a note. Clearing the editor and saving is the same operation as
  // pressing "Delete note" - both arrive here as empty text, and both must store null
  // rather than an empty string, so "has a note" stays a single unambiguous check.
  test("clears the note when given empty or whitespace-only text", async () => {
    const app = appWithNote();
    const id = await seed(app);
    await call(app, { action: "setHighlightNote", attachmentUUID: ATT, id, note: "temporary" });

    for (const empty of ["", "   ", null]) {
      const result = await call(app, {
        action: "setHighlightNote",
        attachmentUUID: ATT,
        id,
        note: empty,
      });
      expect(result.highlights[0].note).toBeNull();
    }
  });

  // Scenario: notes are trimmed, so trailing whitespace from a paste does not turn an
  // effectively-empty note into a real one.
  test("trims surrounding whitespace", async () => {
    const app = appWithNote();
    const id = await seed(app);
    const result = await call(app, {
      action: "setHighlightNote",
      attachmentUUID: ATT,
      id,
      note: "   padded   ",
    });
    expect(result.highlights[0].note).toBe("padded");
  });

  // Scenario: a note must not disturb the highlight it belongs to, or any other. The
  // rects and quote are what Phase 4's annotations and Phase 5's export are built from.
  test("touches only the target highlight, leaving geometry intact", async () => {
    const app = appWithNote();
    const first = await seed(app);
    await seed(app, { page: 4, color: "blue", quoteText: "other" });
    const before = (await loadHighlights(app, NOTE, ATT))[0];

    const result = await call(app, {
      action: "setHighlightNote",
      attachmentUUID: ATT,
      id: first,
      note: "mine",
    });

    expect(result.highlights[0]).toEqual({ ...before, note: "mine" });
    expect(result.highlights[1].note).toBeNull();
    expect(result.highlights[1].color).toBe("blue");
  });

  // Scenario: markdown and quote characters in a note must survive the round-trip
  // without corrupting the stored JSON - called out explicitly by the spec's Phase 3
  // test list, and a real hazard since the payload lives inside a fenced code block.
  test("survives markdown, quotes and code fences in the note text", async () => {
    const app = appWithNote();
    const id = await seed(app);
    const awkward = '# heading\n> quote "double" \'single\'\n```js\nconst x = 1;\n```\n- item \\ end';

    await call(app, { action: "setHighlightNote", attachmentUUID: ATT, id, note: awkward });

    // Read back through storage, not from the action's own return value.
    const [stored] = await loadHighlights(app, NOTE, ATT);
    expect(stored.note).toBe(awkward);
    expect(stored.quoteText).toBe("the quick brown fox");
  });

  // Scenario: a stale embed acting on a highlight someone already deleted. Nothing to
  // change means nothing to write.
  test("is a no-op for an unknown id and does not rewrite the note", async () => {
    const app = appWithNote();
    await seed(app);
    const writesBefore = app.replaceNoteContent.mock.calls.length;

    const result = await call(app, {
      action: "setHighlightNote",
      attachmentUUID: ATT,
      id: "hl-gone",
      note: "orphan",
    });

    expect(result.highlights[0].note).toBeNull();
    expect(app.replaceNoteContent.mock.calls.length).toBe(writesBefore);
  });
});

describe("removeHighlight", () => {
  // Scenario: removing a highlight - an explicit spec requirement (section 4).
  test("deletes only the targeted highlight", async () => {
    const app = appWithNote();
    const first = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    await call(app, {
      action: "addHighlight",
      attachmentUUID: ATT,
      highlight: draft({ quoteText: "keep me" }),
    });

    const result = await call(app, {
      action: "removeHighlight",
      attachmentUUID: ATT,
      id: first.highlights[0].id,
    });

    expect(result.highlights).toHaveLength(1);
    expect(result.highlights[0].quoteText).toBe("keep me");
    expect(await loadHighlights(app, NOTE, ATT)).toEqual(result.highlights);
  });

  // Scenario: removing the last highlight must actually clear the section, not leave a
  // stale copy that reappears on the next load.
  test("removing the last highlight leaves nothing stored", async () => {
    const app = appWithNote();
    const added = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    await call(app, { action: "removeHighlight", attachmentUUID: ATT, id: added.highlights[0].id });

    expect(await loadHighlights(app, NOTE, ATT)).toEqual([]);
  });

  // Scenario: a double-click, or two viewers open on the same note. Deleting an already
  // deleted highlight must be harmless.
  test("is harmless for an id that is already gone", async () => {
    const app = appWithNote();
    await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });

    const result = await call(app, { action: "removeHighlight", attachmentUUID: ATT, id: "nope" });
    expect(result.highlights).toHaveLength(1);
  });
});

describe("loadHighlights", () => {
  // Scenario: reopening a note. The viewer asks for what was stored last session.
  test("returns what was previously stored for this attachment", async () => {
    const app = appWithNote();
    const stored = createHighlight(draft({ id: "hl-known" }));
    await saveHighlights(app, NOTE, ATT, [stored]);

    const result = await call(app, { action: "loadHighlights", attachmentUUID: ATT });
    expect(result.highlights).toEqual([stored]);
  });

  // Scenario: a fresh note with no annotations yet - an empty list, not an error, so
  // the viewer opens normally.
  test("returns an empty list for a note with no stored highlights", async () => {
    const result = await call(appWithNote("# Just notes"), { action: "loadHighlights", attachmentUUID: ATT });
    expect(result).toEqual({ highlights: [], sentIds: [] });
  });

  // Scenario: the user hand-edited the managed section into nonsense. The viewer must
  // still open (spec section 7.4) rather than refusing to render the PDF.
  test("recovers from a corrupted managed section", async () => {
    const app = appWithNote(`# ${STORAGE_SECTION_HEADING}\n\nnot json {{{`);
    const result = await call(app, { action: "loadHighlights", attachmentUUID: ATT });
    expect(result).toEqual({ highlights: [], sentIds: [] });
  });
});

describe("sendToNote", () => {
  // Scenario: the core Phase 5 "send to note" action - spec §4's "a button sends that
  // highlight to its correct Amplenote (probably appended at the bottom of the note)".
  test("appends the given content to the end of the source note", async () => {
    const app = appWithNote("# Reading notes\nmy own text");
    const result = await call(app, { action: "sendToNote", content: "==[paper.pdf](url)==\n> \"quote\"" });

    expect(result).toEqual({ ok: true });
    const final = app._notes.get(NOTE).content;
    expect(final).toContain("my own text");
    expect(final).toContain('> "quote"');
    // Appended, not prepended or replacing.
    expect(final.indexOf("my own text")).toBeLessThan(final.indexOf('> "quote"'));
  });

  // Scenario: "append without disturbing existing content" - explicit spec test
  // requirement. Content before AND after the append point must both survive.
  test("does not disturb content already in the note", async () => {
    const app = appWithNote("# Intro\nbefore\n\n# Conclusion\nafter");
    await call(app, { action: "sendToNote", content: "new block" });

    const final = app._notes.get(NOTE).content;
    expect(final).toContain("before");
    expect(final).toContain("after");
    expect(final.indexOf("after")).toBeGreaterThan(final.indexOf("before"));
  });

  // Scenario: nothing to send must be refused before it reaches insertNoteContent,
  // rather than writing an empty/blank block into the note.
  test("refuses to send empty content", async () => {
    const app = appWithNote();
    const result = await call(app, { action: "sendToNote", content: "" });
    expect(result.error).toMatch(/nothing to send/i);
    expect(app.insertNoteContent).not.toHaveBeenCalled();
  });

  // Scenario: DATA LOSS, reported live with a screenshot. The managed data section is
  // created at the end of the note, and "send to note" also appended at the end - so
  // every exported highlight landed INSIDE that section. saveHighlights replaces the
  // whole section by heading, so the next highlight created silently wiped every export
  // the user had sent. The two writes have to agree on an order: exports are the user's
  // content and belong above the plugin's managed data, which stays last.
  test("sends exports ABOVE the managed data section, not into it", async () => {
    const app = appWithNote(
      `# Reading notes\nmy own text\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{}\n\`\`\``
    );

    await call(app, { action: "sendToNote", content: '==[paper.pdf](url)==\n> "quote"' });

    const final = app._notes.get(NOTE).content;
    expect(final).toContain("my own text");
    expect(final).toContain('> "quote"');
    // The export must sit before the managed heading, and the heading must stay last.
    expect(final.indexOf('> "quote"')).toBeLessThan(final.indexOf(`# ${STORAGE_SECTION_HEADING}`));
    expect(final.indexOf("my own text")).toBeLessThan(final.indexOf('> "quote"'));
  });

  // Scenario: the same bug's other half - an export that survives the send must also
  // survive the NEXT highlight. This is the assertion that actually reproduces what was
  // reported: create a highlight after exporting, and the export is gone.
  test("keeps earlier exports when a new highlight is saved", async () => {
    const app = appWithNote(
      `# Reading notes\nmy own text\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{}\n\`\`\``
    );

    await call(app, { action: "sendToNote", content: '==[paper.pdf](url)==\n> "quote"' });
    await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });

    const final = app._notes.get(NOTE).content;
    expect(final).toContain('> "quote"');
    expect(final).toContain("my own text");
  });
});

/**
 * Keeping already-sent blocks in step with the highlights they came from.
 *
 * Before this, a sent block was a dead snapshot: recolouring left it in the old colour,
 * deleting the highlight left an orphan pointing at an id that no longer resolved, and
 * re-sending appended a duplicate. Reported live with a screenshot of one quote appearing
 * three times in two colours.
 */
describe("sent blocks follow their highlights", () => {
  const PLUG = "plug-1";
  const blockFor = (id, color = "#F3998C") =>
    `[<mark style="background-color:${color};">paper.pdf<!-- {"backgroundCycleColor":"12"} --></mark>](plugin://${PLUG}?att=${ATT}&page=1&hl=${id})\n> > the quick brown fox`;

  const appWithSent = async (id) => {
    const app = appWithNote("# Reading notes\nmy own text");
    await call(app, {
      action: "sendToNote",
      content: blockFor(id),
      highlightId: id,
      attachmentUUID: ATT,
      pluginUUID: PLUG,
    });
    return app;
  };

  // Scenario: the reported duplicate. Sending the same highlight again refreshes the
  // block where it sits rather than appending a second copy of the same quote.
  test("re-sending a highlight replaces its block instead of appending another", async () => {
    const app = await appWithSent("hl-a");
    const result = await call(app, {
      action: "sendToNote",
      content: blockFor("hl-a", "#84B6D9"),
      highlightId: "hl-a",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
    });

    const final = app._notes.get(NOTE).content;
    expect(result.replaced).toBe(true);
    expect(final.match(/hl=hl-a/g)).toHaveLength(1);
    expect(final).toContain("#84B6D9");
    expect(final).not.toContain("#F3998C");
  });

  // Scenario: a DIFFERENT highlight still appends - "replace" is per highlight, not a
  // note-wide single-block rule.
  test("a different highlight still appends its own block", async () => {
    const app = await appWithSent("hl-a");
    await call(app, {
      action: "sendToNote",
      content: blockFor("hl-b"),
      highlightId: "hl-b",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
    });

    const final = app._notes.get(NOTE).content;
    expect(final).toContain("hl=hl-a");
    expect(final).toContain("hl=hl-b");
  });

  // Scenario: the block's colour is the whole point of it - it is what ties the write-up
  // back to the highlight in the PDF. Leaving it stale was a quiet lie about which
  // highlight it came from.
  test("recolouring a highlight updates the colour of its sent block", async () => {
    const app = await appWithSent("hl-a");
    await call(app, {
      action: "recolorHighlight",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
      id: "hl-a",
      color: "blue",
      exportBlock: blockFor("hl-a", "#84B6D9"),
    });

    expect(app._notes.get(NOTE).content).toContain("#84B6D9");
  });

  // Scenario: the orphan. A deleted highlight leaves a block whose deep link looks live
  // and resolves to nothing.
  test("deleting a highlight takes its sent block with it", async () => {
    const app = await appWithSent("hl-a");
    await call(app, {
      action: "removeHighlight",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
      id: "hl-a",
    });

    const final = app._notes.get(NOTE).content;
    expect(final).not.toContain("hl=hl-a");
    expect(final).toContain("my own text");
  });

  // Scenario: the panel's own action - drop the write-up, KEEP the annotation. Conflating
  // it with removeHighlight is how a click meant to tidy the note erases a highlight.
  test("removeFromNote deletes the block and leaves the highlight alone", async () => {
    const app = appWithNote("# Reading notes\nmy own text");
    const added = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    const id = added.highlights[0].id;
    await call(app, {
      action: "sendToNote",
      content: blockFor(id),
      highlightId: id,
      attachmentUUID: ATT,
      pluginUUID: PLUG,
    });

    const result = await call(app, {
      action: "removeFromNote",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
      id,
    });

    expect(result).toEqual({ ok: true });
    expect(app._notes.get(NOTE).content).not.toContain(`hl=${id}`);
    expect(await loadHighlights(app, NOTE, ATT)).toHaveLength(1);
  });

  // Scenario: nothing to remove. The panel offers this only for highlights it believes
  // are in the note, and that belief can be one edit old - a quiet no-op, not an error.
  test("removeFromNote reports a quiet failure when the block is already gone", async () => {
    const app = appWithNote("# Reading notes\nmy own text");
    const result = await call(app, {
      action: "removeFromNote",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
      id: "hl-missing",
    });

    expect(result).toEqual({ ok: false });
    expect(result.error).toBeUndefined();
  });

  // Scenario: loadHighlights tells the panel which highlights it may offer the action
  // for. Offering it where there is nothing to remove reads as a broken button.
  test("loadHighlights reports which highlights the note holds a block for", async () => {
    const app = await appWithSent("hl-a");
    const result = await call(app, {
      action: "loadHighlights",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
    });

    expect(result.sentIds).toEqual(["hl-a"]);
  });

  // Scenario: a note write that fails must NOT fail the highlight operation that
  // triggered it. The recolour has already happened and is correct; an error would tell
  // the user it did not take.
  test("a failed note sync does not fail the recolour that triggered it", async () => {
    const app = await appWithSent("hl-a");
    await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    const list = await loadHighlights(app, NOTE, ATT);
    // Break ONLY the note-body sync, not the highlight save that precedes it - both go
    // through replaceNoteContent, and failing it outright would test the wrong thing.
    // The sync is the write carrying the rebuilt block, so key on that.
    const realReplace = app.replaceNoteContent;
    app.replaceNoteContent = async (handle, content) => {
      if (String(content).includes("#84B6D9")) throw new Error("note write failed");
      return realReplace(handle, content);
    };

    const result = await call(app, {
      action: "recolorHighlight",
      attachmentUUID: ATT,
      pluginUUID: PLUG,
      id: list[0].id,
      color: "blue",
      exportBlock: blockFor(list[0].id, "#84B6D9"),
    });

    expect(result.error).toBeUndefined();
    expect(result.highlights[0].color).toBe("blue");
  });

  // Scenario: reported live - the first sent highlight landed directly against the user's
  // own prose with only a blank line, so it read as a continuation of what they had
  // written rather than as appended output.
  test("separates the FIRST sent highlight from the user's own writing with a rule", async () => {
    const app = appWithNote("# Reading notes\nmy own text");
    await call(app, { action: "sendToNote", content: "[block one](plugin://p?att=a)\n> > quote" });

    const final = app._notes.get(NOTE).content;
    expect(final).toContain("---");
    expect(final.indexOf("my own text")).toBeLessThan(final.indexOf("---"));
    expect(final.indexOf("---")).toBeLessThan(final.indexOf("block one"));
  });

  // Scenario: the rule marks a boundary, so there must be exactly ONE of them however
  // many highlights get sent - later blocks sit beside their own siblings, where another
  // rule would just be noise.
  test("does not repeat the rule on later sends", async () => {
    const app = appWithNote("# Reading notes\nmy own text");
    await call(app, { action: "sendToNote", content: "[block one](plugin://p?att=a)\n> > first" });
    await call(app, { action: "sendToNote", content: "[block two](plugin://p?att=a)\n> > second" });

    const final = app._notes.get(NOTE).content;
    expect(final.match(/^---$/gm)).toHaveLength(1);
    expect(final).toContain("block one");
    expect(final).toContain("block two");
  });

  // Scenario: a note that already holds a viewer but no exports is still on its first
  // send. The embed tag carries the same `plugin://` scheme, so a looser check for that
  // string alone would see the viewer and skip the separator for good.
  test("still adds the rule when the note holds a viewer but no exports", async () => {
    const app = appWithNote('# Notes\n<object data="plugin://p?att=a" data-aspect-ratio="1"></object>');
    await call(app, { action: "sendToNote", content: "[block one](plugin://p?att=a)\n> > quote" });

    expect(app._notes.get(NOTE).content).toContain("---");
  });
});

describe("exportAll", () => {
  // Scenario: THE core "export all" requirement - auto-creates a destination note when
  // one doesn't exist yet.
  test("creates the destination note when it does not exist", async () => {
    const app = appWithNote();
    const result = await call(app, {
      action: "exportAll",
      noteName: "paper.pdf - Highlights",
      content: "==[paper.pdf](url)==\n> \"quote one\"",
    });

    expect(result.ok).toBe(true);
    expect(app.createNote).toHaveBeenCalledWith("paper.pdf - Highlights");
    const created = app._notes.get(result.noteUUID);
    expect(created.content).toContain("quote one");
  });

  // Scenario: THE idempotency requirement - re-running "export all" must find the SAME
  // note by its deterministic name, not create a second one.
  test("reuses the existing destination note on a second run rather than duplicating", async () => {
    const app = appWithNote();
    const first = await call(app, {
      action: "exportAll",
      noteName: "paper.pdf - Highlights",
      content: "first run content",
    });
    const second = await call(app, {
      action: "exportAll",
      noteName: "paper.pdf - Highlights",
      content: "second run content",
    });

    expect(second.noteUUID).toBe(first.noteUUID);
    expect(app.createNote).toHaveBeenCalledTimes(1);
    // The SECOND run's content is what the note holds now - a full replace, not an
    // ever-growing append, so re-running never duplicates what was exported before.
    const finalContent = app._notes.get(first.noteUUID).content;
    expect(finalContent).toBe("second run content");
    expect(finalContent).not.toContain("first run content");
  });

  // Scenario: the color filter is applied by the CALLER (export.js, embed-side) before
  // this action ever runs - this action just writes whatever content it is given. This
  // test is here to document that division of responsibility, since it is easy to
  // assume filtering happens plugin-side and duplicate the logic.
  test("writes exactly the content it is given, filtering being the caller's job", async () => {
    const app = appWithNote();
    const result = await call(app, {
      action: "exportAll",
      noteName: "paper.pdf - Highlights",
      content: "only-the-green-ones",
    });
    expect(app._notes.get(result.noteUUID).content).toBe("only-the-green-ones");
  });

  // Scenario: a missing destination note name must be refused, not silently create a
  // note called "undefined" or similar.
  test("refuses to run without a destination note name", async () => {
    const app = appWithNote();
    const result = await call(app, { action: "exportAll", content: "some content" });
    expect(result.error).toMatch(/destination note name/i);
    expect(app.createNote).not.toHaveBeenCalled();
  });

  // Scenario: an empty highlight set (every highlight filtered out, or none exist) must
  // still produce a valid, empty destination note rather than throwing - the toolbar
  // button has no way to know in advance whether the filter will match anything.
  test("creates an empty destination note rather than throwing when there is nothing to export", async () => {
    const app = appWithNote();
    const result = await call(app, { action: "exportAll", noteName: "paper.pdf - Highlights", content: "" });
    expect(result.ok).toBe(true);
    expect(app._notes.get(result.noteUUID).content).toBe("");
  });
});

describe("removeViewer", () => {
  const PLUGIN = "plug-uuid";
  const embedTag = (attUUID) => `<object data="plugin://${PLUGIN}?att=${attUUID}" data-aspect-ratio="1.2" />`;

  // Scenario: THE point of this action - explicit, user-triggered detach removes both
  // halves of a viewer: the <object> line in the note body, and its highlights entry in
  // the managed section. Neither is cleaned up any other way (no "attachment removed"
  // event exists to react to).
  test("removes the embed line and the highlights entry together", async () => {
    const content = `# Notes\n\n${embedTag(ATT)}\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n{}\n\`\`\``;
    const app = appWithNote(content);
    await saveHighlights(app, NOTE, ATT, [createHighlight(draft())]);

    const result = await call(app, { action: "removeViewer", attachmentUUID: ATT, pluginUUID: PLUGIN });

    expect(result.ok).toBe(true);
    const finalContent = app._notes.get(NOTE).content;
    expect(finalContent).not.toContain("plugin://" + PLUGIN);
    expect(await loadHighlights(app, NOTE, ATT)).toEqual([]);
  });

  // Scenario: a note with two viewers - removing one must leave the other's embed AND
  // its highlights completely untouched.
  test("leaves a different viewer on the same note untouched", async () => {
    const ATT_OTHER = "attach-other";
    const content = `# Notes\n\n${embedTag(ATT)}\n\n${embedTag(ATT_OTHER)}`;
    const app = appWithNote(content);
    app._notes.get(NOTE).attachments.push(mockAttachment({ uuid: ATT_OTHER, name: "other.pdf" }));
    const otherHighlight = createHighlight(draft({ quoteText: "the other pdf's text" }));
    await saveHighlights(app, NOTE, ATT_OTHER, [otherHighlight]);

    await call(app, { action: "removeViewer", attachmentUUID: ATT, pluginUUID: PLUGIN });

    expect(app._notes.get(NOTE).content).toContain(embedTag(ATT_OTHER));
    expect(await loadHighlights(app, NOTE, ATT_OTHER)).toEqual([otherHighlight]);
  });

  // Scenario: nothing to remove - already gone, or the note was hand-edited. Reported
  // back as an error the embed can show, not thrown.
  test("reports an error when this viewer's embed line cannot be found", async () => {
    const app = appWithNote("# Notes\nnothing here");
    const result = await call(app, { action: "removeViewer", attachmentUUID: ATT, pluginUUID: PLUGIN });
    expect(result.error).toMatch(/could not find/i);
  });

  test("refuses to run without an attachment or a plugin id", async () => {
    const app = appWithNote(embedTag(ATT));
    expect((await call(app, { action: "removeViewer", pluginUUID: PLUGIN })).error).toMatch(/attachment/i);
    expect((await call(app, { action: "removeViewer", attachmentUUID: ATT })).error).toMatch(/plugin/i);
  });
});

describe("unknown and failing requests", () => {
  // Scenario: a version mismatch between a cached embed and a newer plugin. The action
  // name is echoed so the failure is diagnosable from the embed's status bar alone -
  // the embed's console is not reachable from the parent page.
  test("names the unknown action in the error", async () => {
    const result = await call(appWithNote(), { action: "explode" });
    expect(result.error).toContain("explode");
  });

  // Scenario: every mutating action needs to know which PDF it is acting on. Without
  // it, writing would silently key the data under "undefined".
  test("every highlight action refuses to run without an attachment", async () => {
    const app = appWithNote();
    const actions = [
      "loadHighlights",
      "addHighlight",
      "recolorHighlight",
      "removeHighlight",
      "setHighlightNote",
    ];
    for (const action of actions) {
      const result = await call(app, { action, highlight: draft(), id: "x", color: "blue" });
      expect(result.error).toMatch(/no attachment/i);
    }
    expect(app.replaceNoteContent).not.toHaveBeenCalled();
  });

  // Scenario: the note write itself fails - readonly note, over the 100k limit, network
  // error. The embed must get a message it can show, not a rejected promise.
  test("turns a failed note write into a reportable error", async () => {
    const app = appWithNote();
    app.replaceNoteContent = async () => {
      throw new Error("Content exceeds 100k characters");
    };

    const result = await call(app, { action: "addHighlight", attachmentUUID: ATT, highlight: draft() });
    expect(result.error).toMatch(/100k/);
  });
});
