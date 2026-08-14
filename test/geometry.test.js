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
  joinSelectionSlices,
  unionClientRects,
  clientRectsToPdfRects,
  pdfRectToViewportRect,
  itemRelativeRect,
  mergeLineRects,
  rectContainsPoint,
  hitTestHighlights,
  normalizeQuoteText,
  expandRectToLineBox,
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

describe("joinSelectionSlices", () => {
  // Scenario: THE bug. Reported live on a real exam PDF - "are" exported as "ar e".
  // PDF.js had split the word across two adjacent text items (a kerning pair, common in
  // justified text) with no space glyph on either side, and the old
  // `words.join(" ")` inserted one anyway just because they came from separate DOM
  // nodes. No space belongs here because the source had none.
  test("does not insert a space between two items that split one word", () => {
    const slices = [
      { text: "ar", from: 0, to: 2 },
      { text: "e", from: 0, to: 1 },
    ];
    expect(joinSelectionSlices(slices)).toBe("are");
  });

  // Scenario: a genuine word gap, encoded as trailing whitespace on the earlier item -
  // exactly how PDF.js represents a real space between two text-layer spans.
  test("keeps the space when the earlier slice's text trails whitespace", () => {
    const slices = [
      { text: "questions ", from: 0, to: 10 },
      { text: "carrying", from: 0, to: 8 },
    ];
    expect(joinSelectionSlices(slices)).toBe("questions carrying");
  });

  // Scenario: the same real gap, but encoded as leading whitespace on the later item
  // instead - PDF.js is not consistent about which side of a boundary the space lands
  // on, so both must work.
  test("keeps the space when the later slice's text leads with whitespace", () => {
    const slices = [
      { text: "questions", from: 0, to: 9 },
      { text: " carrying", from: 0, to: 9 },
    ];
    expect(joinSelectionSlices(slices)).toBe("questions carrying");
  });

  // Scenario: a node that is pure whitespace (its own separate text-layer span) still
  // produces exactly one space, not zero and not two.
  test("collapses a whitespace-only node between two words to a single space", () => {
    const slices = [
      { text: "questions", from: 0, to: 9 },
      { text: "   ", from: 0, to: 3 },
      { text: "carrying", from: 0, to: 8 },
    ];
    expect(joinSelectionSlices(slices)).toBe("questions carrying");
  });

  // Scenario: two tokens inside the SAME node - the tokenizer only ever splits on real
  // whitespace, so a second token in one slice is always a genuine word boundary.
  test("puts a space between two tokens found within the same slice", () => {
    const slices = [{ text: "brown fox", from: 0, to: 9 }];
    expect(joinSelectionSlices(slices)).toBe("brown fox");
  });

  // Scenario: the very first word must never get a leading space, however its slice's
  // [from,to) window is shaped.
  test("never leads with a space, even if the first slice starts mid-whitespace", () => {
    const slices = [{ text: "  fox", from: 0, to: 5 }];
    expect(joinSelectionSlices(slices)).toBe("fox");
  });

  // Scenario: honours the same [from,to) windowing as textTokenRanges - a selection that
  // starts or ends mid-node must not pull in text outside the drag. Only the first and
  // last node of a real selection are ever cropped like this; the trailing space stays
  // inside the first slice's window, same as a real DOM Range would include it.
  test("only reassembles the selected portion of each slice", () => {
    const slices = [
      { text: "alpha beta ", from: 6, to: 11 },
      { text: "gamma delta", from: 0, to: 5 },
    ];
    expect(joinSelectionSlices(slices)).toBe("beta gamma");
  });

  // Scenario: no slices, or slices with nothing selected, produce empty text rather than
  // throwing.
  test("returns an empty string for no slices or all-empty slices", () => {
    expect(joinSelectionSlices([])).toBe("");
    expect(joinSelectionSlices([{ text: "abc", from: 1, to: 1 }])).toBe("");
  });

  // Scenario: THE second bug, the mirror image of the first. A PDF stores no newline -
  // it just starts drawing lower down - so a line break is invisible to a test that only
  // looks at characters, and two lines fused into "onecorrect". Reported live from an
  // exported nine-item numbered list that arrived as one run-on paragraph.
  test("breaks the line when the next slice sits on a lower baseline", () => {
    const slices = [
      { text: "with only one", from: 0, to: 13, line: 700, lineSize: 10 },
      { text: "correct option", from: 0, to: 14, line: 688, lineSize: 10 },
    ];
    expect(joinSelectionSlices(slices)).toBe("with only one\ncorrect option");
  });

  // Scenario: the kerning-pair case from the top of this block, now with baselines on it -
  // the break must not fire for two items that are simply beside each other.
  test("does not break between two items sharing a baseline", () => {
    const slices = [
      { text: "ar", from: 0, to: 2, line: 700, lineSize: 10 },
      { text: "e", from: 0, to: 1, line: 700, lineSize: 10 },
    ];
    expect(joinSelectionSlices(slices)).toBe("are");
  });

  // Scenario: a superscript or an inline fraction is nudged off its neighbours' baseline
  // and is still the same line. The tolerance scales with the type so this holds at any
  // font size, rather than being tuned to 10pt body text.
  test("treats a superscript's raised baseline as the same line", () => {
    const slices = [
      { text: "x", from: 0, to: 1, line: 700, lineSize: 10 },
      { text: "2", from: 0, to: 1, line: 703, lineSize: 6 },
      { text: " plus", from: 0, to: 5, line: 700, lineSize: 10 },
    ];
    expect(joinSelectionSlices(slices)).toBe("x2 plus");
  });

  // Scenario: a break replaces the space rather than joining it, or every wrapped line in
  // an exported quote would arrive indented by one character.
  test("does not leave a space beside the break it inserts", () => {
    const slices = [
      { text: "questions ", from: 0, to: 10, line: 700, lineSize: 10 },
      { text: "carrying", from: 0, to: 8, line: 688, lineSize: 10 },
    ];
    expect(joinSelectionSlices(slices)).toBe("questions\ncarrying");
  });

  // Scenario: a node whose PDF.js item could not be resolved carries no baseline. Unknown
  // must not read as "a new line" - and it must not reset the comparison either, or the
  // break either side of it is lost.
  test("an unplaceable node neither breaks the line nor hides a real break", () => {
    expect(
      joinSelectionSlices([
        { text: "one", from: 0, to: 3, line: 700, lineSize: 10 },
        { text: " ", from: 0, to: 1 },
        { text: "two", from: 0, to: 3, line: 700, lineSize: 10 },
      ])
    ).toBe("one two");

    expect(
      joinSelectionSlices([
        { text: "one", from: 0, to: 3, line: 700, lineSize: 10 },
        { text: "", from: 0, to: 0 },
        { text: "two", from: 0, to: 3, line: 688, lineSize: 10 },
      ])
    ).toBe("one\ntwo");
  });

  // Scenario: the break is owed by the first token that actually gets emitted. An empty
  // node sitting on the new line must not swallow it.
  test("holds the break across a slice that contributes no tokens", () => {
    const slices = [
      { text: "one", from: 0, to: 3, line: 700, lineSize: 10 },
      { text: "", from: 0, to: 0, line: 688, lineSize: 10 },
      { text: "two", from: 0, to: 3, line: 688, lineSize: 10 },
    ];
    expect(joinSelectionSlices(slices)).toBe("one\ntwo");
  });

  // Scenario: a break can never lead the output, however the first slices are shaped.
  test("never leads with a break", () => {
    const slices = [
      { text: "  ", from: 0, to: 2, line: 700, lineSize: 10 },
      { text: "fox", from: 0, to: 3, line: 688, lineSize: 10 },
    ];
    expect(joinSelectionSlices(slices)).toBe("fox");
  });

  // Scenario: slices with no baselines at all are the old call shape - every existing
  // caller and every test above must behave exactly as it did.
  test("behaves as before when no slice carries a baseline", () => {
    const slices = [
      { text: "ar", from: 0, to: 2 },
      { text: "e ", from: 0, to: 2 },
      { text: "questions", from: 0, to: 9 },
    ];
    expect(joinSelectionSlices(slices)).toBe("are questions");
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
        "expandRectToLineBox",
        "textTokenRanges",
        "joinSelectionSlices",
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
  test("collapses horizontal whitespace and trims", () => {
    expect(normalizeQuoteText("  hello   world  ")).toBe("hello world");
  });

  // Scenario: the regression this function used to cause. joinSelectionSlices works out
  // where a PDF's line breaks are - information the character stream does not carry - and
  // a flat /\s+/ collapse here threw it away again one step later, flattening an exported
  // numbered list into a single run-on item.
  test("keeps the line breaks joinSelectionSlices worked out", () => {
    expect(normalizeQuoteText("1.  This paper\n2.  That paper")).toBe("1. This paper\n2. That paper");
  });

  // Scenario: spaces sitting either side of a break would indent the wrapped line in the
  // exported blockquote, and a blank line would close the quote where it stands.
  test("trims around each break and drops blank lines", () => {
    expect(normalizeQuoteText("one \n\n  two   \n \n three")).toBe("one\ntwo\nthree");
  });

  test("normalizes CRLF rather than leaving the CR as a space", () => {
    expect(normalizeQuoteText("one\r\ntwo\rthree")).toBe("one\ntwo\nthree");
  });

  test("handles empty and non-string input without throwing", () => {
    expect(normalizeQuoteText("")).toBe("");
    expect(normalizeQuoteText(null)).toBe("");
    expect(normalizeQuoteText(undefined)).toBe("");
  });
});

/**
 * GROWING A HIGHLIGHT FILL TO ITS LINE BOX.
 *
 * The numbers below are the ones measured in the harness on 15px text at a 25.05px line
 * pitch: a stored rect 13 tall sitting 0.7 above the text's own 17-tall box, whose ink
 * runs from +3 to +16 of the stored rect - i.e. past its bottom edge. That is the shape
 * of the bug, so it is the shape of the fixture.
 */
describe("expandRectToLineBox", () => {
  // A line's text-layer span, and the stored rect the extractor produces for it.
  const line = (top) => ({ top, bottom: top + 17, left: 50, right: 400 });
  const storedFor = (top) => ({ x: 50, y: top - 0.7, width: 300, height: 13 });

  test("grows the band to the line box the browser would select", () => {
    const out = expandRectToLineBox(storedFor(100), [line(100)]);
    expect(out.y).toBeCloseTo(100, 5);
    expect(out.height).toBeCloseTo(17, 5);
  });

  // Scenario: the reported symptom. Two wrapped lines 25.05 apart, each band 13 tall,
  // leaves a 12px strip. Matching the line box takes it to 8.05 - which is exactly what
  // native selection leaves, and is the deal this option makes.
  test("narrows the gap between wrapped lines to native selection's own", () => {
    const boxes = [line(100), line(125.05)];
    const first = expandRectToLineBox(storedFor(100), boxes);
    const second = expandRectToLineBox(storedFor(125.05), boxes);

    const before = storedFor(125.05).y - (storedFor(100).y + storedFor(100).height);
    const after = second.y - (first.y + first.height);
    expect(before).toBeCloseTo(12.05, 2);
    expect(after).toBeCloseTo(8.05, 2);
  });

  // Scenario: the defect underneath the reported one. The stored rect stops above the
  // baseline, so descenders hang outside their own highlight.
  test("covers ink that ran past the stored rect's bottom edge", () => {
    const stored = storedFor(100);
    const inkBottom = stored.y + 16; // measured: ink reaches +16 of a 13-tall rect
    expect(stored.y + stored.height).toBeLessThan(inkBottom);

    const out = expandRectToLineBox(stored, [line(100)]);
    expect(out.y + out.height).toBeGreaterThanOrEqual(inkBottom);
  });

  // Scenario: the rect sits HIGH of its own line. Matching on the top edge would pick up
  // the line above on tightly-set text; the midline cannot.
  test("picks its own line, not the one above, when lines are tightly set", () => {
    const boxes = [line(100), line(114)]; // 14px pitch against a 17px box - they overlap
    const out = expandRectToLineBox(storedFor(114), boxes);
    // Its own line's box - NOT line one's, whose 100..117 the stored rect's top of 113.3
    // sits inside. Matching on the top edge would have produced 100 here.
    expect(out.y).toBe(114);
    expect(out.y + out.height).toBe(131);
  });

  test("leaves the horizontal extent alone - a span is wider than the selection in it", () => {
    const stored = { x: 120, y: 99.3, width: 60, height: 13 };
    const out = expandRectToLineBox(stored, [line(100)]);
    expect(out.x).toBe(120);
    expect(out.width).toBe(60);
  });

  test("unions every span the selection crosses on one line", () => {
    const tall = { top: 96, bottom: 121, left: 200, right: 400 };
    const out = expandRectToLineBox(storedFor(100), [line(100), tall]);
    expect(out.y).toBeCloseTo(96, 5);
    expect(out.y + out.height).toBeCloseTo(121, 5);
  });

  // Scenario: a span that merely abuts the end of the selection is on the same line but
  // outside it, and must not stretch the band sideways-adjacent text into it.
  test("ignores a span that only touches the selection's edge", () => {
    const abutting = { top: 90, bottom: 130, left: 350, right: 500 };
    const stored = { x: 50, y: 99.3, width: 300, height: 13 }; // right edge exactly 350
    const out = expandRectToLineBox(stored, [abutting]);
    expect(out).toBe(stored);
  });

  // Scenario: a scanned page has no text layer at all, and a page can be drawn before
  // its text layer is built. Either way the highlight must still paint.
  test("returns the rect untouched when there are no line boxes", () => {
    const stored = storedFor(100);
    expect(expandRectToLineBox(stored, null)).toBe(stored);
    expect(expandRectToLineBox(stored, [])).toBe(stored);
    expect(expandRectToLineBox(stored, [line(500)])).toBe(stored);
  });

  // Scenario: the band must be the line box EXACTLY, not the line box unioned with the
  // stored rect. The stored top sits ~0.7px above the span's, so keeping it would leave
  // the band fractionally taller than the browser's own selection - which is the one
  // thing this option is defined by.
  test("lands exactly on the line box, not a union with the stored rect", () => {
    const out = expandRectToLineBox(storedFor(100), [line(100)]);
    expect(out.y).toBe(100);
    expect(out.height).toBe(17);
  });

});
