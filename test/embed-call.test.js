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
    expect(result).toEqual({ highlights: [] });
  });

  // Scenario: the user hand-edited the managed section into nonsense. The viewer must
  // still open (spec section 7.4) rather than refusing to render the PDF.
  test("recovers from a corrupted managed section", async () => {
    const app = appWithNote(`# ${STORAGE_SECTION_HEADING}\n\nnot json {{{`);
    const result = await call(app, { action: "loadHighlights", attachmentUUID: ATT });
    expect(result).toEqual({ highlights: [] });
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
