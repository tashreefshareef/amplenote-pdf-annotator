/**
 * Tests for the highlight data model.
 *
 * Why these matter: this is the record every later phase builds on - Phase 4's native
 * PDF annotations and Phase 5's exported links both read straight from these fields.
 * A malformed highlight here corrupts everything downstream, so construction is
 * validated rather than trusted.
 */
import {
  createHighlight,
  withNote,
  withColor,
  highlightsForPage,
  removeHighlight,
  findHighlight,
  updateHighlight,
  generateHighlightId,
} from "../src/highlights.js";

const validArgs = () => ({
  page: 3,
  color: "yellow",
  rects: [{ x: 10, y: 20, width: 100, height: 12 }],
  quoteText: "hello world",
});

describe("createHighlight", () => {
  // Scenario: the happy path matches the storage shape fixed by spec section 3.
  test("builds a record with the exact stored fields", () => {
    const h = createHighlight(validArgs());
    expect(h).toEqual({
      id: expect.any(String),
      page: 3,
      color: "yellow",
      rects: [{ x: 10, y: 20, width: 100, height: 12 }],
      quoteText: "hello world",
      note: null,
    });
  });

  // Scenario: multi-line selections produce more than one rect in a single highlight -
  // the spec's multi-rect model, exercised for real by the pdf-lib spike.
  test("accepts multiple rects for a multi-line selection", () => {
    const h = createHighlight({
      ...validArgs(),
      rects: [
        { x: 10, y: 700, width: 300, height: 14 },
        { x: 10, y: 686, width: 120, height: 14 },
      ],
    });
    expect(h.rects).toHaveLength(2);
  });

  // Scenario: a color id or a hex must both resolve, matching colors.js's own contract.
  test("resolves color by id or hex", () => {
    expect(createHighlight({ ...validArgs(), color: "#F4DE6C" }).color).toBe("yellow");
    expect(createHighlight({ ...validArgs(), color: "yellow" }).color).toBe("yellow");
  });

  // Scenario: an unrecognized color must not silently produce an uncolored or wrongly
  // colored highlight - fall back to the documented default instead.
  test("falls back to the default color for an unknown value", () => {
    expect(createHighlight({ ...validArgs(), color: "chartreuse" }).color).toBe("yellow");
  });

  // Scenario: pages are 1-based; 0, negative, and non-integer pages must be rejected
  // loudly rather than silently stored as a broken deep-link target later.
  test("rejects invalid pages", () => {
    for (const page of [0, -1, 1.5, "3", null, undefined]) {
      expect(() => createHighlight({ ...validArgs(), page })).toThrow(/page/);
    }
  });

  // Scenario: no rects means no geometry to draw or export - must fail construction,
  // not produce a phantom highlight.
  test("rejects empty or missing rects", () => {
    expect(() => createHighlight({ ...validArgs(), rects: [] })).toThrow(/rects/);
    expect(() => createHighlight({ ...validArgs(), rects: undefined })).toThrow(/rects/);
  });

  // Scenario: a rect with NaN/Infinity/missing fields would draw an overlay in a
  // random or invisible place.
  test("rejects malformed rects", () => {
    expect(() => createHighlight({ ...validArgs(), rects: [{ x: 1, y: 2 }] })).toThrow(/rect/);
    expect(() =>
      createHighlight({ ...validArgs(), rects: [{ x: NaN, y: 1, width: 1, height: 1 }] })
    ).toThrow(/rect/);
  });

  // Scenario: an empty quote is legitimate defensive input (upstream capture failure)
  // and must not throw - better an empty-quote highlight than a lost highlight.
  test("coerces a missing quoteText to an empty string rather than throwing", () => {
    expect(createHighlight({ ...validArgs(), quoteText: undefined }).quoteText).toBe("");
  });

  // Scenario: ids are used as React-key-like identifiers for remove/recolor/note
  // operations and must be unique across rapid successive highlights.
  test("generates unique ids when none is supplied", () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateHighlightId()));
    expect(ids.size).toBe(50);
  });

  // Scenario: reconstructing a highlight from storage must reuse its original id, not
  // mint a new one - otherwise every load()/save() cycle silently orphans highlights.
  test("preserves a supplied id instead of generating a new one", () => {
    expect(createHighlight({ ...validArgs(), id: "hl-fixed" }).id).toBe("hl-fixed");
  });
});

describe("withNote / withColor", () => {
  // Scenario: spec section 4 - at most one note per highlight, and it must be editable
  // and removable.
  test("withNote sets, trims, and clears the note without mutating the original", () => {
    const h = createHighlight(validArgs());
    const noted = withNote(h, "  a comment  ");
    expect(noted.note).toBe("a comment");
    expect(h.note).toBeNull(); // original untouched

    const cleared = withNote(noted, "   ");
    expect(cleared.note).toBeNull();
    expect(withNote(noted, null).note).toBeNull();
  });

  // Scenario: recoloring an existing highlight (spec section 4) without touching its
  // geometry or note.
  test("withColor changes only the color", () => {
    const h = withNote(createHighlight(validArgs()), "keep me");
    const recolored = withColor(h, "blue");
    expect(recolored.color).toBe("blue");
    expect(recolored.note).toBe("keep me");
    expect(recolored.rects).toBe(h.rects);
  });

  // Scenario: recoloring to a nonexistent color must fail loudly - silently keeping
  // the old color would look like the UI action did nothing.
  test("withColor rejects an unknown color", () => {
    const h = createHighlight(validArgs());
    expect(() => withColor(h, "mauve")).toThrow(/unknown color/);
  });
});

describe("collection helpers", () => {
  const h1 = createHighlight({ ...validArgs(), page: 1, id: "a" });
  const h2 = createHighlight({ ...validArgs(), page: 2, id: "b" });
  const h3 = createHighlight({ ...validArgs(), page: 1, id: "c" });
  const all = [h1, h2, h3];

  test("highlightsForPage filters by page", () => {
    expect(highlightsForPage(all, 1).map((h) => h.id)).toEqual(["a", "c"]);
    expect(highlightsForPage(all, 99)).toEqual([]);
  });

  test("highlightsForPage tolerates null/undefined input", () => {
    expect(highlightsForPage(null, 1)).toEqual([]);
    expect(highlightsForPage(undefined, 1)).toEqual([]);
  });

  test("removeHighlight drops exactly the matching id", () => {
    const result = removeHighlight(all, "b");
    expect(result.map((h) => h.id)).toEqual(["a", "c"]);
  });

  test("findHighlight returns null for an unknown id", () => {
    expect(findHighlight(all, "nope")).toBeNull();
    expect(findHighlight(all, "b").id).toBe("b");
  });

  // Scenario: the update helper is what remove/recolor/note-edit actions build on -
  // must preserve array order and touch only the target highlight.
  test("updateHighlight replaces one entry in place, preserving order", () => {
    const result = updateHighlight(all, "b", (h) => withColor(h, "green"));
    expect(result.map((h) => h.id)).toEqual(["a", "b", "c"]);
    expect(result[1].color).toBe("green");
    expect(result[0]).toBe(h1); // untouched entries are the same reference
  });

  // Scenario: updating an id that doesn't exist must be a detectable no-op, not a
  // silent success that leaves the caller thinking something changed.
  test("updateHighlight returns the same array reference when the id is not found", () => {
    const result = updateHighlight(all, "missing", (h) => h);
    expect(result).toBe(all);
  });
});
