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
  clientRectsToPdfRects,
  pdfRectToViewportRect,
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
        "hitTestHighlights",
        "isVisibleRect",
        "mergeLineRects",
        "normalizeQuoteText",
        "pdfRectToViewportRect",
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
