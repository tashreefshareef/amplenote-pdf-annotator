/**
 * Pure rect/text arithmetic for turning a DOM selection into highlight geometry.
 *
 * Deliberately does NOT reimplement PDF.js's screen<->PDF coordinate transform. Three
 * separate rendering bugs already came from hand-rolled substitutes for PDF.js math
 * (viewer.js, html.js history) - the actual transform stays a call to the live
 * `viewport.convertToPdfPoint()` / `convertToViewportPoint()`, which is passed IN to the
 * functions below as a plain callback. That keeps the transform where PDF.js owns it
 * while leaving everything around it - container-relative rects, corner normalization,
 * line merging, hit-testing - pure and unit testable.
 *
 * WHY THIS FILE HAS AN UNUSUAL SHAPE
 *
 * Every function is defined inside `createGeometry()`, and the module then re-exports
 * the instances by name. The embed's viewer cannot import anything: it is serialized
 * with `.toString()` and injected into the embed HTML. So this factory is injected the
 * same way (see src/embed/html.js) and the viewer reads the result off
 * `window.__PDFA_GEOM`. Defining the functions once, inside a closure that has no
 * module-scope dependencies, means the code the embed runs and the code the Jest suite
 * tests are literally the same source - rather than a tested version here and an
 * untested hand transcription over there.
 *
 * Consequences to respect when editing:
 *   - nothing inside `createGeometry` may reference module scope, or the embed copy
 *     throws a ReferenceError that only shows up in the live app
 *   - the source is serialized into an inline script, comments included, so it must
 *     never contain a literal closing script tag (there is a test guarding this)
 */

export function createGeometry() {
  /** A DOMRect (viewport-relative) expressed relative to a container's own bounding box. */
  function clientRectToLocal(clientRect, containerRect) {
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
  function rectFromCorners(p1, p2) {
    return {
      x: Math.min(p1[0], p2[0]),
      y: Math.min(p1[1], p2[1]),
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
  function roundRect(rect, precision) {
    var f = Math.pow(10, precision === undefined ? 2 : precision);
    var round = function (n) {
      return Math.round(n * f) / f;
    };
    return { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) };
  }

  /** Drop rects with no visible area - a stray zero-size ClientRect at a line wrap. */
  function isVisibleRect(rect) {
    return rect.width > 0.01 && rect.height > 0.01;
  }

  /**
   * Convert a run of viewport-relative DOMRects (what `range.getClientRects()` returns)
   * into PDF user-space rects.
   *
   * `convertToPdfPoint` is PDF.js's own `viewport.convertToPdfPoint` bound to the page
   * being selected in. Both corners go through it, because the transform includes page
   * rotation and the Y-flip - deriving the second corner by adding width/height in PDF
   * units would be exactly the hand-rolled shortcut this module exists to avoid.
   */
  function clientRectsToPdfRects(clientRects, containerRect, convertToPdfPoint) {
    var out = [];
    for (var i = 0; i < clientRects.length; i++) {
      var local = clientRectToLocal(clientRects[i], containerRect);
      if (!isVisibleRect(local)) continue;
      var a = convertToPdfPoint(local.x, local.y);
      var b = convertToPdfPoint(local.x + local.width, local.y + local.height);
      var rect = roundRect(rectFromCorners(a, b));
      if (isVisibleRect(rect)) out.push(rect);
    }
    return out;
  }

  /**
   * The inverse, for drawing: a stored PDF-space rect back to CSS pixels within the
   * rendered page, at whatever zoom is current. `convertToViewportPoint` is PDF.js's.
   */
  function pdfRectToViewportRect(rect, convertToViewportPoint) {
    var a = convertToViewportPoint(rect.x, rect.y);
    var b = convertToViewportPoint(rect.x + rect.width, rect.y + rect.height);
    return rectFromCorners(a, b);
  }

  /** True when two rects overlap vertically enough to be the same line of text. */
  function onSameLine(a, b) {
    var overlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
    return overlap > 0.5 * Math.min(a.height, b.height);
  }

  /**
   * Collapse the per-span rects of one selection into one rect per line.
   *
   * PDF.js emits a separate text-layer span for every text run in the content stream, so
   * a single highlighted line routinely arrives as a dozen adjacent rects. Two reasons
   * to merge them:
   *   - storage: each rect is ~40 characters of JSON against the note's 100k budget
   *   - appearance: adjacent rects leave hairline gaps at every run boundary, which
   *     reads as a broken highlight rather than a continuous one
   *
   * Rects are only joined when the horizontal gap is small relative to the line height,
   * so a genuine column break on the same baseline stays two separate rects instead of
   * one band swallowing the gutter between columns.
   *
   * Output is re-rounded. A union recomputes width and height by subtracting already
   * rounded coordinates, which reintroduces binary float error - a merged rect came out
   * of a live run as height 13.600000000000023, spending 15 characters of the note's
   * budget to say 13.6.
   */
  function mergeLineRects(rects, gapRatio) {
    var ratio = gapRatio === undefined ? 0.6 : gapRatio;
    if (!rects || rects.length < 2) return (rects || []).slice();

    // Top of the page first (PDF Y increases upward, so descending y), then left to right.
    var sorted = rects.slice().sort(function (a, b) {
      return b.y - a.y || a.x - b.x;
    });

    var lines = [];
    for (var i = 0; i < sorted.length; i++) {
      var placed = false;
      for (var l = 0; l < lines.length; l++) {
        if (onSameLine(lines[l][0], sorted[i])) {
          lines[l].push(sorted[i]);
          placed = true;
          break;
        }
      }
      if (!placed) lines.push([sorted[i]]);
    }

    var out = [];
    for (var j = 0; j < lines.length; j++) {
      var line = lines[j].slice().sort(function (a, b) {
        return a.x - b.x;
      });
      var current = null;
      for (var k = 0; k < line.length; k++) {
        var r = line[k];
        if (current === null) {
          current = { x: r.x, y: r.y, width: r.width, height: r.height };
          continue;
        }
        var gap = r.x - (current.x + current.width);
        if (gap <= ratio * Math.max(current.height, r.height)) {
          var right = Math.max(current.x + current.width, r.x + r.width);
          var top = Math.max(current.y + current.height, r.y + r.height);
          current.x = Math.min(current.x, r.x);
          current.y = Math.min(current.y, r.y);
          current.width = right - current.x;
          current.height = top - current.y;
        } else {
          out.push(current);
          current = { x: r.x, y: r.y, width: r.width, height: r.height };
        }
      }
      if (current !== null) out.push(current);
    }
    return out.map(function (r) {
      return roundRect(r);
    });
  }

  /**
   * Point-in-rect with a tolerance, in PDF units. The padding matters: a highlight over
   * a line of 10pt text is ~10 units tall, and clicking it should not demand pixel
   * precision at low zoom.
   */
  function rectContainsPoint(rect, x, y, padding) {
    var p = padding === undefined ? 0 : padding;
    return (
      x >= rect.x - p &&
      x <= rect.x + rect.width + p &&
      y >= rect.y - p &&
      y <= rect.y + rect.height + p
    );
  }

  /**
   * Which highlight, if any, is under a point on a page.
   *
   * Searched newest-first so that when highlights overlap, the one drawn on top is the
   * one acted on - matching what the user sees. This is what makes remove/recolor work
   * without giving highlight rects their own pointer events, which would block text
   * selection over already-highlighted text.
   */
  function hitTestHighlights(highlights, page, x, y, padding) {
    var list = highlights || [];
    for (var i = list.length - 1; i >= 0; i--) {
      var h = list[i];
      if (!h || h.page !== page || !h.rects) continue;
      for (var j = 0; j < h.rects.length; j++) {
        if (rectContainsPoint(h.rects[j], x, y, padding === undefined ? 1 : padding)) return h;
      }
    }
    return null;
  }

  /**
   * Selected text arrives as one string per text-layer span, and PDF.js does not insert
   * spaces between spans that are adjacent on the page but backed by separate text runs
   * in the PDF content stream. Collapse internal whitespace and trim, which is the same
   * normalization applied to the copy-paste path browsers already use for text selection.
   */
  function normalizeQuoteText(text) {
    return String(text === null || text === undefined ? "" : text).replace(/\s+/g, " ").trim();
  }

  return {
    clientRectToLocal: clientRectToLocal,
    rectFromCorners: rectFromCorners,
    roundRect: roundRect,
    isVisibleRect: isVisibleRect,
    clientRectsToPdfRects: clientRectsToPdfRects,
    pdfRectToViewportRect: pdfRectToViewportRect,
    mergeLineRects: mergeLineRects,
    rectContainsPoint: rectContainsPoint,
    hitTestHighlights: hitTestHighlights,
    normalizeQuoteText: normalizeQuoteText,
  };
}

// Module-facing bindings. Same function objects the embed gets - see the header note.
const geometry = createGeometry();

export const clientRectToLocal = geometry.clientRectToLocal;
export const rectFromCorners = geometry.rectFromCorners;
export const roundRect = geometry.roundRect;
export const isVisibleRect = geometry.isVisibleRect;
export const clientRectsToPdfRects = geometry.clientRectsToPdfRects;
export const pdfRectToViewportRect = geometry.pdfRectToViewportRect;
export const mergeLineRects = geometry.mergeLineRects;
export const rectContainsPoint = geometry.rectContainsPoint;
export const hitTestHighlights = geometry.hitTestHighlights;
export const normalizeQuoteText = geometry.normalizeQuoteText;
