/**
 * Tests for pure rect/text arithmetic.
 *
 * These deliberately do NOT test the PDF.js coordinate transform itself - that stays a
 * direct call to viewport.convertToPdfPoint() inside the embed, which needs a real
 * PDF.js viewport and cannot be unit tested. It is passed in as a callback instead, so
 * what IS tested here is everything around it: making a DOMRect container-relative,
 * normalizing whatever two points the transform hands back into a proper rect, merging
 * a line's worth of spans, and hit-testing a click.
 *
 * The fake transform used below is the real one's essential shape - a Y-flip plus a
 * scale - which is what makes the corner-ordering and merge tests meaningful rather
 * than an identity function that would hide a flipped rect.
 */
import {
  createGeometry,
  clientRectToLocal,
  rectFromCorners,
  roundRect,
  isVisibleRect,
  textTokenRanges,
  unionClientRects,
  clientRectsToPdfRects,
  pdfRectToViewportRect,
  itemRelativeRect,
  mergeLineRects,
  rectContainsPoint,
  hitTestHighlights,
  normalizeQuoteText,
} from "../src/geometry.js";

/**
 * Stand-in for PDF.js's viewport transform at a given scale on a page of `pageHeight`
 * PDF units: screen Y grows downward from the top, PDF Y grows upward from the bottom.
 */
const fakeToPdfPoint = (scale, pageHeight) => (x, y) => [x / scale, pageHeight - y / scale];
const fakeToViewportPoint = (scale, pageHeight) => (x, y) => [x * scale, (pageHeight - y) * scale];

describe("clientRectToLocal", () => {
  // Scenario: a selection's viewport-relative ClientRect must become relative to the
  // page wrapper it was drawn in, since that's the coordinate space the PDF conversion
  // step expects.
  test("subtracts the container's origin", () => {
    const clientRect = { left: 150, top: 220, width: 80, height: 14 };
    const containerRect = { left: 100, top: 200 };
    expect(clientRectToLocal(clientRect, containerRect)).toEqual({
      x: 50,
      y: 20,
      width: 80,
      height: 14,
    });
  });

  // Scenario: a selection at the container's exact top-left corner.
  test("handles a rect flush with the container origin", () => {
    expect(clientRectToLocal({ left: 10, top: 10, width: 5, height: 5 }, { left: 10, top: 10 }))
      .toEqual({ x: 0, y: 0, width: 5, height: 5 });
  });
});

describe("rectFromCorners", () => {
  // Scenario: screen-space corners (top-left, bottom-right) - Y increases downward.
  test("builds a rect from top-left and bottom-right ordered points", () => {
    expect(rectFromCorners([10, 20], [110, 34])).toEqual({ x: 10, y: 20, width: 100, height: 14 });
  });

  // Scenario: PDF space flips Y, so after conversion the "first" corner can end up
  // numerically larger than the "second" - min/max must handle either order.
  test("builds the same rect regardless of corner order (PDF Y-flip)", () => {
    // The same rectangle, corners supplied in the opposite order.
    expect(rectFromCorners([110, 34], [10, 20])).toEqual({ x: 10, y: 20, width: 100, height: 14 });
  });

  // Scenario: a degenerate selection (zero width or height) must not produce a
  // negative-size rect.
  test("produces zero, not negative, size for coincident points", () => {
    expect(rectFromCorners([5, 5], [5, 5])).toEqual({ x: 5, y: 5, width: 0, height: 0 });
  });

  // Scenario: corners that are only flipped on one axis (a common case for rotated or
  // mixed-direction selections).
  test("handles corners flipped on only one axis", () => {
    expect(rectFromCorners([10, 34], [110, 20])).toEqual({ x: 10, y: 20, width: 100, height: 14 });
  });
});

describe("roundRect", () => {
  // Scenario: PDF coordinates carry far more precision than a highlight box needs;
  // rounding keeps stored JSON compact against the note's 100k character budget.
  test("rounds to 2 decimal places by default", () => {
    expect(roundRect({ x: 1.23456, y: 2.6789, width: 10.001, height: 5.995 })).toEqual({
      x: 1.23,
      y: 2.68,
      width: 10,
      height: 6,
    });
  });

  test("respects a custom precision", () => {
    expect(roundRect({ x: 1.23456, y: 0, width: 0, height: 0 }, 0)).toEqual({
      x: 1,
      y: 0,
      width: 0,
      height: 0,
    });
  });
});

describe("isVisibleRect", () => {
  test("rejects zero and near-zero size rects", () => {
    expect(isVisibleRect({ width: 0, height: 10 })).toBe(false);
    expect(isVisibleRect({ width: 10, height: 0 })).toBe(false);
    expect(isVisibleRect({ width: 0.001, height: 10 })).toBe(false);
  });

  test("accepts a normal rect", () => {
    expect(isVisibleRect({ width: 50, height: 12 })).toBe(true);
  });
});

describe("textTokenRanges", () => {
  const slice = (text, ranges) => ranges.map((r) => text.slice(r.start, r.end));

  // Scenario: THE fix for highlights painting past the end of a sentence, reported from
  // a real insurance PDF. Rects are measured one word at a time because
  // range.getClientRects() reports one rect per LINE BOX, and whenever several visual
  // lines share a block the browser pads every non-final line's box out to the block's
  // full width. Measured in a browser: a 400px block wrapping into two lines returns
  // 398.2px and 132.7px. A word cannot contain a line break, so its rect is always tight
  // around real glyphs.
  test("splits text into runs of non-whitespace", () => {
    const text = "the quick brown fox";
    expect(slice(text, textTokenRanges(text, 0, text.length))).toEqual([
      "the",
      "quick",
      "brown",
      "fox",
    ]);
  });

  // Scenario: whitespace contributes no token, so no rect is ever measured for the empty
  // space at either end of a selection or between words.
  test("ignores leading, trailing and repeated whitespace", () => {
    const text = "   padded   out  \n\t here  ";
    expect(slice(text, textTokenRanges(text, 0, text.length))).toEqual([
      "padded",
      "out",
      "here",
    ]);
  });

  // Scenario: the normal case - a drag that starts and ends mid-node. Only the selected
  // slice may be measured, including a partially covered word.
  test("honours the start and end bounds, clipping partial words", () => {
    const text = "alpha beta gamma";
    expect(slice(text, textTokenRanges(text, 6, 10))).toEqual(["beta"]);
    expect(slice(text, textTokenRanges(text, 2, 10))).toEqual(["pha", "beta"]);
  });

  // Scenario: a selection covering only whitespace must contribute nothing rather than a
  // zero-width rect.
  test("returns nothing for an empty or whitespace-only range", () => {
    expect(textTokenRanges("   ", 0, 3)).toEqual([]);
    expect(textTokenRanges("abc", 2, 2)).toEqual([]);
    expect(textTokenRanges("", 0, 0)).toEqual([]);
  });

  // Scenario: defensive. Offsets past the end of the text, or missing entirely, must not
  // produce ranges that would throw when handed to Range.setStart.
  test("clamps out-of-range offsets and defaults to the whole string", () => {
    const text = "one two";
    expect(slice(text, textTokenRanges(text, -5, 999))).toEqual(["one", "two"]);
    expect(slice(text, textTokenRanges(text))).toEqual(["one", "two"]);
    for (const r of textTokenRanges(text, -5, 999)) {
      expect(r.start).toBeGreaterThanOrEqual(0);
      expect(r.end).toBeLessThanOrEqual(text.length);
    }
  });

  // Scenario: punctuation belongs to the word it touches. Splitting on it would leave a
  // visible notch in the band between a word and its comma.
  test("keeps punctuation attached to its word", () => {
    const text = "well-known, indeed.";
    expect(slice(text, textTokenRanges(text, 0, text.length))).toEqual([
      "well-known,",
      "indeed.",
    ]);
  });

  // Scenario: the end-to-end consequence. Per-word rects on one line merge back into a
  // single band, so measuring words costs nothing visually - while a column gutter, far
  // wider than a word gap, still stays open.
  test("per-word rects merge back into one band per line", () => {
    const words = [
      { x: 72, y: 700, width: 30, height: 13 },
      { x: 105, y: 700, width: 40, height: 13 },
      { x: 148, y: 700, width: 25, height: 13 },
    ];
    expect(mergeLineRects(words)).toEqual([{ x: 72, y: 700, width: 101, height: 13 }]);
  });
});

describe("unionClientRects", () => {
  const rect = (left, top, width, height) => ({ left, top, width, height });

  // Scenario: THE bug this exists for, reported live: a highlight showed a thin colored
  // underline beneath specific words - every one of them containing a descender (g, p,
  // y, j, q). Range.getClientRects() on a single word can return a second, short rect
  // for the part that dips below the baseline; unmerged, that sliver has too little
  // vertical overlap with the main rect to be read as the same line by mergeLineRects,
  // so it becomes its own tiny "line" and paints as an underline. Unioning the word's
  // own rects before line-clustering removes the sliver entirely.
  test("merges a word's main rect with a short descender sliver into one bounding box", () => {
    const main = rect(100, 700, 42, 13); // the glyph body
    const sliver = rect(102, 711, 8, 3); // the descender's ink, dipping below it
    expect(unionClientRects([main, sliver])).toEqual({
      left: 100,
      top: 700,
      width: 42,
      height: 14, // 711 + 3 - 700
    });
  });

  // Scenario: safe to union unconditionally, because a single word's Range can never
  // legitimately span two different physical lines - PDF.js text-layer nodes contain no
  // embedded line breaks. So however many rects a word produces, they always belong
  // together.
  test("collapses several rects for one word into their bounding box", () => {
    const parts = [rect(100, 700, 20, 13), rect(120, 700, 15, 13), rect(135, 702, 5, 9)];
    expect(unionClientRects(parts)).toEqual({ left: 100, top: 700, width: 40, height: 13 });
  });

  // Scenario: the common case - a word that produced exactly one rect must pass through
  // unchanged, not be needlessly rebuilt.
  test("returns a single rect unchanged", () => {
    expect(unionClientRects([rect(50, 60, 30, 12)])).toEqual({
      left: 50,
      top: 60,
      width: 30,
      height: 12,
    });
  });

  // Scenario: THE hazard this must not reintroduce. PDF.js also emits genuinely
  // zero-size phantom rects between spans - captured directly from a live selection as
  // {x:-30, width:0}. A naive union would drag the bounding box out to wherever that
  // phantom sits, making the highlighted word far wider than it actually is. Degenerate
  // rects must be excluded before the min/max, not included in it.
  test("ignores zero-size phantom rects so they cannot widen the bounding box", () => {
    const real = rect(100, 700, 40, 13);
    const phantom = rect(-30, 700, 0, 0);
    expect(unionClientRects([phantom, real])).toEqual(real);
    expect(unionClientRects([real, phantom])).toEqual(real);
  });

  // Scenario: defensive - if every rect is degenerate (or the list is empty), there is
  // no word to highlight; the caller must be able to tell and skip it rather than
  // receiving a bogus zero-area rect at the origin.
  test("returns null when there is nothing visible to union", () => {
    expect(unionClientRects([])).toBeNull();
    expect(unionClientRects([rect(0, 0, 0, 0)])).toBeNull();
    expect(unionClientRects(null)).toBeNull();
  });

  // Scenario: end-to-end proof that the fix actually closes the reported gap. Two
  // words on one line, the second with a descender sliver like "damage" would produce -
  // unioning each word first, THEN merging across words, must still yield exactly one
  // band for the line, not two.
  test("keeps a line to one band even when one of its words has a descender sliver", () => {
    const word1 = unionClientRects([rect(72, 700, 30, 13)]);
    const word2 = unionClientRects([rect(105, 700, 40, 13), rect(107, 711, 10, 3)]);
    const merged = mergeLineRects(
      [word1, word2].map((r) => ({ x: r.left, y: r.top, width: r.width, height: r.height }))
    );
    expect(merged).toHaveLength(1);
  });
});

describe("clientRectsToPdfRects", () => {
  // Scenario: THE core conversion. A selection's DOMRect is viewport-relative and in
  // screen pixels at the current zoom; what gets stored must be PDF user space, with
  // the origin at the page's bottom-left, so it survives a zoom change.
  test("converts a screen-space selection rect into PDF user space", () => {
    const container = { left: 100, top: 50 };
    // A 200x14 CSS-pixel rect at (150, 64) on screen, rendered at 2x zoom.
    const clientRects = [{ left: 150, top: 64, width: 200, height: 14 }];

    const [rect] = clientRectsToPdfRects(clientRects, container, fakeToPdfPoint(2, 800));

    // Local: x=50, y=14 -> PDF: x=25, top y=793, bottom y=786.
    expect(rect).toEqual({ x: 25, y: 786, width: 100, height: 7 });
  });

  // Scenario: the Y-flip means the converted "top-left" corner is numerically ABOVE the
  // "bottom-right" one. A rect built by subtracting in the wrong order would come out
  // with a negative height - the exact class of coordinate bug this module exists to
  // prevent.
  test("never produces a negative width or height despite the Y-flip", () => {
    const rects = clientRectsToPdfRects(
      [{ left: 0, top: 0, width: 80, height: 20 }],
      { left: 0, top: 0 },
      fakeToPdfPoint(1, 500)
    );
    expect(rects[0].width).toBeGreaterThan(0);
    expect(rects[0].height).toBeGreaterThan(0);
  });

  // Scenario: a selection spanning a line wrap emits stray zero-size ClientRects at the
  // break. Storing them would waste the note's character budget and draw nothing.
  test("drops zero-size rects on both sides of the conversion", () => {
    const rects = clientRectsToPdfRects(
      [
        { left: 0, top: 0, width: 0, height: 14 },
        { left: 0, top: 0, width: 60, height: 0 },
        { left: 0, top: 0, width: 60, height: 14 },
      ],
      { left: 0, top: 0 },
      fakeToPdfPoint(1, 500)
    );
    expect(rects).toHaveLength(1);
  });

  // Scenario: stored coordinates share the note's 100k character budget with the user's
  // own content, so they must arrive already rounded rather than carrying float noise.
  test("rounds the stored coordinates", () => {
    // A scale of 3 makes every converted coordinate a repeating decimal.
    const [rect] = clientRectsToPdfRects(
      [{ left: 0, top: 0, width: 10, height: 10 }],
      { left: 0, top: 0 },
      fakeToPdfPoint(3, 500)
    );
    expect(rect).toEqual({ x: 0, y: 496.67, width: 3.33, height: 3.33 });
  });

  test("returns an empty array for an empty selection", () => {
    expect(clientRectsToPdfRects([], { left: 0, top: 0 }, fakeToPdfPoint(1, 500))).toEqual([]);
  });
});

describe("pdfRectToViewportRect", () => {
  // Scenario: drawing the overlay. A stored PDF rect must land back on the same screen
  // pixels it came from - this is what makes highlights survive zoom.
  test("round-trips a rect back to the screen pixels it came from", () => {
    const container = { left: 0, top: 0 };
    const clientRects = [{ left: 30, top: 40, width: 120, height: 16 }];

    const [pdfRect] = clientRectsToPdfRects(clientRects, container, fakeToPdfPoint(2, 800));
    const screen = pdfRectToViewportRect(pdfRect, fakeToViewportPoint(2, 800));

    expect(screen).toEqual({ x: 30, y: 40, width: 120, height: 16 });
  });

  // Scenario: the same stored rect drawn at a different zoom must scale, not shift.
  test("scales with the zoom level the viewport was built at", () => {
    const pdfRect = { x: 10, y: 100, width: 50, height: 12 };
    const at1 = pdfRectToViewportRect(pdfRect, fakeToViewportPoint(1, 800));
    const at2 = pdfRectToViewportRect(pdfRect, fakeToViewportPoint(2, 800));

    expect(at2.width).toBe(at1.width * 2);
    expect(at2.height).toBe(at1.height * 2);
    expect(at2.x).toBe(at1.x * 2);
  });
});

describe("itemRelativeRect", () => {
  // A text-content item 200 PDF-units wide, 12 tall, whose rendered CSS box is 300px
  // wide (a font-substitution scaleX case: the browser's substitute font would have
  // rendered wider, so PDF.js corrects the WHOLE item to 300px to represent 200 true
  // units - a uniform 1.5x stretch that a partial selection does NOT necessarily share).
  const itemBox = { x1: 1000, y1: 500, x2: 1200, y2: 512 };
  const parentRect = { left: 100, top: 50, right: 400, bottom: 62 }; // 300px x 12px

  // Scenario: selecting the WHOLE item must reproduce itemBox exactly - the identity
  // case every other test's confidence rests on.
  test("returns the item's own box unchanged for a full-item selection", () => {
    const result = itemRelativeRect(itemBox, parentRect, parentRect);
    expect(result).toEqual({ x: 1000, y: 500, width: 200, height: 12 });
  });

  // Scenario: THE bug this function exists to fix, reported live - the identical
  // highlight measured correctly in one browser and overshot in another, because a
  // partial (sub-item) selection converted through the page's viewport transform alone
  // doesn't know about the item's own scaleX compensation. Selecting exactly the first
  // half of the rendered box (150px of 300px) must yield exactly half the item's TRUE
  // PDF width (100 of 200 units) - not half of some viewport-transformed pixel value
  // that never accounts for the stretch.
  test("takes a fraction of the item's own PDF-space width, not the viewport's", () => {
    const firstHalf = { left: 100, top: 50, right: 250, bottom: 62 }; // 150 of 300px
    const result = itemRelativeRect(itemBox, parentRect, firstHalf);
    expect(result.x).toBe(1000);
    expect(result.width).toBe(100);
  });

  // Scenario: a selection that starts mid-item, not just one that's cropped from the
  // right - both the start AND end fractions must be computed independently.
  test("handles a selection that starts and ends mid-item", () => {
    const middleThird = { left: 200, top: 50, right: 300, bottom: 62 }; // px 100-200 of 300
    const result = itemRelativeRect(itemBox, parentRect, middleThird);
    // (100/300)*200 = 66.67 units in from the left edge.
    expect(result.x).toBeCloseTo(1066.67, 1);
    expect(result.width).toBeCloseTo(66.67, 1);
  });

  // Scenario: a sub-selection never extends vertically past its own item in practice
  // (PDF.js text-content items are single lines; a DOM Range within one can only vary
  // horizontally), so height must reproduce the item's own true height even though the
  // formula is written generally enough to handle a cropped case too.
  test("preserves the item's own height when the sub-selection spans it fully", () => {
    const partial = { left: 150, top: 50, right: 220, bottom: 62 };
    const result = itemRelativeRect(itemBox, parentRect, partial);
    expect(result.y).toBe(500);
    expect(result.height).toBe(12);
  });

  // Scenario: defensive - a collapsed or invalid parent box (no rendered area) must not
  // divide by zero and produce Infinity/NaN geometry.
  test("returns null when the parent box has no area", () => {
    expect(itemRelativeRect(itemBox, { left: 10, top: 0, right: 10, bottom: 12 }, parentRect)).toBeNull();
    expect(itemRelativeRect(itemBox, { left: 0, top: 10, right: 100, bottom: 10 }, parentRect)).toBeNull();
  });
});

describe("mergeLineRects", () => {
  // Scenario: PDF.js emits one span per text run, so a single highlighted line arrives
  // as several adjacent rects. Left unmerged they waste storage and draw hairline gaps
  // at every run boundary, which reads as a broken highlight.
  test("merges adjacent rects on the same line into one", () => {
    const rects = [
      { x: 10, y: 700, width: 40, height: 12 },
      { x: 52, y: 700, width: 30, height: 12 },
      { x: 84, y: 700, width: 20, height: 12 },
    ];
    expect(mergeLineRects(rects)).toEqual([{ x: 10, y: 700, width: 94, height: 12 }]);
  });

  // Scenario: a two-line selection must stay two bands, not become one block covering
  // the whitespace between the lines.
  test("keeps separate lines separate", () => {
    const rects = [
      { x: 10, y: 700, width: 100, height: 12 },
      { x: 10, y: 680, width: 60, height: 12 },
    ];
    const merged = mergeLineRects(rects);
    expect(merged).toHaveLength(2);
    // Top line of the page first: PDF Y increases upward, so descending y.
    expect(merged[0].y).toBe(700);
    expect(merged[1].y).toBe(680);
  });

  // Scenario: a two-column page. Both columns share a baseline, but merging across the
  // gutter would paint a band straight through the space between them.
  test("does not merge across a wide gap on the same baseline", () => {
    const rects = [
      { x: 10, y: 700, width: 100, height: 12 },
      { x: 300, y: 700, width: 100, height: 12 },
    ];
    expect(mergeLineRects(rects)).toHaveLength(2);
  });

  // Scenario: rects for the same line rarely have byte-identical y values - a
  // superscript or a different font size shifts them slightly. They should still be
  // treated as one line.
  test("treats vertically overlapping rects as the same line", () => {
    const rects = [
      { x: 10, y: 700, width: 40, height: 12 },
      { x: 51, y: 701.5, width: 40, height: 10 },
    ];
    expect(mergeLineRects(rects)).toHaveLength(1);
  });

  // Scenario: caught in a live browser run. A union recomputes width and height by
  // subtracting already-rounded coordinates, which reintroduces binary float error -
  // a merged rect came back as height 13.600000000000023, spending 15 characters of the
  // note's 100k budget to say 13.6.
  test("re-rounds merged rects instead of leaking float noise into storage", () => {
    const merged = mergeLineRects([
      { x: 71.96, y: 637.04, width: 100.5, height: 13.6 },
      { x: 172.5, y: 637.04, width: 240.32, height: 13.6 },
    ]);
    expect(merged).toHaveLength(1);
    // Every stored number must be short enough to survive JSON.stringify intact.
    for (const value of Object.values(merged[0])) {
      expect(String(value)).toMatch(/^\d+(\.\d{1,2})?$/);
    }
  });

  // Scenario: defensive - a single rect or none at all must pass through untouched.
  test("passes through zero or one rect unchanged", () => {
    expect(mergeLineRects([])).toEqual([]);
    const one = [{ x: 1, y: 2, width: 3, height: 4 }];
    expect(mergeLineRects(one)).toEqual(one);
  });

  // Scenario: merging must not mutate the array the caller still holds - the viewer
  // keeps the unmerged rects around while a selection is pending.
  test("does not mutate its input", () => {
    const rects = [
      { x: 10, y: 700, width: 40, height: 12 },
      { x: 52, y: 700, width: 30, height: 12 },
    ];
    const snapshot = JSON.stringify(rects);
    mergeLineRects(rects);
    expect(JSON.stringify(rects)).toBe(snapshot);
  });
});

describe("rectContainsPoint", () => {
  const rect = { x: 100, y: 200, width: 50, height: 10 };

  test("accepts a point inside and rejects one outside", () => {
    expect(rectContainsPoint(rect, 120, 205)).toBe(true);
    expect(rectContainsPoint(rect, 90, 205)).toBe(false);
    expect(rectContainsPoint(rect, 120, 240)).toBe(false);
  });

  // Scenario: a highlight over 10pt text is only ~10 PDF units tall. Without tolerance,
  // clicking it at low zoom demands more precision than a mouse gives.
  test("honors the padding tolerance", () => {
    expect(rectContainsPoint(rect, 98, 205, 0)).toBe(false);
    expect(rectContainsPoint(rect, 98, 205, 3)).toBe(true);
  });
});

describe("hitTestHighlights", () => {
  const make = (id, page, rect) => ({ id, page, color: "yellow", rects: [rect], quoteText: "" });
  const a = make("a", 1, { x: 100, y: 200, width: 50, height: 10 });
  const b = make("b", 2, { x: 100, y: 200, width: 50, height: 10 });

  // Scenario: clicking a highlight is how remove and recolor are reached, so the click
  // point must resolve to the right record.
  test("finds the highlight under a point on the right page", () => {
    expect(hitTestHighlights([a, b], 1, 120, 205)).toBe(a);
    expect(hitTestHighlights([a, b], 2, 120, 205)).toBe(b);
  });

  // Scenario: identical coordinates on a different page must NOT match - every page has
  // its own coordinate space starting at the same origin.
  test("ignores highlights on other pages", () => {
    expect(hitTestHighlights([a], 3, 120, 205)).toBeNull();
  });

  // Scenario: overlapping highlights. The one drawn last is the one on top, so it is
  // the one the user believes they clicked.
  test("returns the most recently added highlight when they overlap", () => {
    const older = make("older", 1, { x: 100, y: 200, width: 50, height: 10 });
    const newer = make("newer", 1, { x: 110, y: 200, width: 50, height: 10 });
    expect(hitTestHighlights([older, newer], 1, 120, 205).id).toBe("newer");
  });

  // Scenario: a click on blank page area, and defensive handling of a malformed record
  // left behind by a hand-edited note.
  test("returns null for a miss and survives malformed entries", () => {
    expect(hitTestHighlights([a], 1, 500, 500)).toBeNull();
    // The junk entries sit AFTER the good one so the reverse scan actually walks over
    // them before it finds a match.
    expect(hitTestHighlights([a, null, { page: 1 }], 1, 120, 205)).toBe(a);
    expect(hitTestHighlights(null, 1, 0, 0)).toBeNull();
  });
});

describe("createGeometry", () => {
  // Scenario: the embed cannot import this module - it gets the factory's SOURCE
  // injected into the page and calls it there. If the factory ever closed over module
  // scope, the module-level exports would keep working while the embed copy threw a
  // ReferenceError only visible in the live app. Calling it standalone here is what
  // catches that.
  test("produces a working, self-contained copy of the API", () => {
    const geom = createGeometry();
    expect(Object.keys(geom).sort()).toEqual(
      [
        "clientRectToLocal",
        "clientRectsToPdfRects",
        "textTokenRanges",
        "unionClientRects",
        "hitTestHighlights",
        "isVisibleRect",
        "mergeLineRects",
        "normalizeQuoteText",
        "pdfRectToViewportRect",
        "itemRelativeRect",
        "rectContainsPoint",
        "rectFromCorners",
        "roundRect",
      ].sort()
    );
    expect(geom.rectFromCorners([10, 20], [110, 34])).toEqual({
      x: 10,
      y: 20,
      width: 100,
      height: 14,
    });
  });

  // Scenario: the factory's source is serialized into an inline script tag. A literal
  // closing script tag anywhere in it - even inside a comment - terminates the embed's
  // script block early and breaks the whole viewer.
  test("has a source safe to inline in a script tag", () => {
    expect(createGeometry.toString()).not.toContain("</" + "script");
  });
});

describe("normalizeQuoteText", () => {
  // Scenario: PDF.js text-layer spans are separate DOM nodes; joining their
  // textContent naively can leave doubled/irregular whitespace at span boundaries.
  test("collapses internal whitespace and trims", () => {
    expect(normalizeQuoteText("  hello   world  \n  again  ")).toBe("hello world again");
  });

  test("handles empty and non-string input without throwing", () => {
    expect(normalizeQuoteText("")).toBe("");
    expect(normalizeQuoteText(null)).toBe("");
    expect(normalizeQuoteText(undefined)).toBe("");
  });
});
