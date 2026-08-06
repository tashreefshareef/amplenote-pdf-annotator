/**
 * Pure rect/text arithmetic for turning a DOM selection into highlight geometry.
 *
 * Deliberately does NOT reimplement PDF.js's screen<->PDF coordinate transform. Three
 * separate rendering bugs already came from hand-rolled substitutes for PDF.js math
 * (viewer.js, html.js history) - the actual transform stays a single call to the live
 * `viewport.convertToPdfPoint()` inside the embed, which is DOM-dependent and therefore
 * lives in embed/viewer.js, not here. This module only handles the arithmetic around
 * that call: making a rect container-relative, and normalizing two arbitrary points
 * (whatever order/flip convertToPdfPoint hands back) into a proper axis-aligned rect.
 */

/** A DOMRect (viewport-relative) expressed relative to a container's own bounding box. */
export function clientRectToLocal(clientRect, containerRect) {
  return {
    x: clientRect.left - containerRect.left,
    y: clientRect.top - containerRect.top,
    width: clientRect.width,
    height: clientRect.height,
  };
}

/**
 * Build an axis-aligned {x,y,width,height} from two corner points, in whatever order
 * and orientation they arrive. PDF space has its origin bottom-left (Y increases
 * upward) while screen space has it top-left (Y increases downward), so which input
 * point ends up numerically smaller depends on the conversion already applied by the
 * caller - min/max sidesteps needing to know that direction here.
 */
export function rectFromCorners(p1, p2) {
  const x = Math.min(p1[0], p2[0]);
  const y = Math.min(p1[1], p2[1]);
  return {
    x,
    y,
    width: Math.abs(p2[0] - p1[0]),
    height: Math.abs(p2[1] - p1[1]),
  };
}

/**
 * Round rect coordinates to keep the stored JSON compact. Highlight storage shares the
 * note's 100k character budget with the user's own content (spec section 7.4 / docs
 * section "Findings that change the design"), and PDF coordinates carry far more
 * decimal precision than a highlight box needs - 2 decimal places is sub-pixel at any
 * reasonable zoom.
 */
export function roundRect(rect, precision = 2) {
  const f = 10 ** precision;
  const round = (n) => Math.round(n * f) / f;
  return { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) };
}

/** Drop rects with no visible area - a stray zero-size ClientRect at a line wrap. */
export function isVisibleRect(rect) {
  return rect.width > 0.01 && rect.height > 0.01;
}

/**
 * Selected text arrives as one string per text-layer span, and PDF.js does not insert
 * spaces between spans that are adjacent on the page but backed by separate text runs
 * in the PDF content stream. Collapse internal whitespace and trim, which is the same
 * normalization applied to the copy-paste path browsers already use for text selection.
 */
export function normalizeQuoteText(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}
