/**
 * Tests for pure rect/text arithmetic.
 *
 * These deliberately do NOT test the PDF.js coordinate transform itself - that stays a
 * direct call to viewport.convertToPdfPoint() inside the embed, which needs a real
 * PDF.js viewport and cannot be unit tested. What's tested here is everything around
 * that call: making a DOMRect container-relative, and normalizing whatever two points
 * convertToPdfPoint hands back into a proper rect.
 */
import {
  clientRectToLocal,
  rectFromCorners,
  roundRect,
  isVisibleRect,
  normalizeQuoteText,
} from "../src/geometry.js";

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
