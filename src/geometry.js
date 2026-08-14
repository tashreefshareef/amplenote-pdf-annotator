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
   * Split a slice of text into runs of non-whitespace, as {start, end} offset pairs.
   *
   * This is what stops a highlight painting past the end of its sentence, and the reason
   * is worth writing down because two earlier fixes aimed at the wrong thing.
   *
   * `range.getClientRects()` reports one rect per LINE BOX, not per glyph. Whenever
   * several visual lines share one block - which happens in the text layer of a real,
   * designed PDF - the browser paints every non-final line's selection out to the full
   * width of that block, and only the last line hugs its text. Measured directly in a
   * browser: a 400px block wrapping into two lines returns rects of 398.2px and 132.7px.
   * That is exactly the reported symptom, where the mid-paragraph lines ran to the edge
   * of the page and the closing line looked right.
   *
   * Clipping those rects to the SPANS does nothing, because the over-wide span is the
   * block. Trimming trailing whitespace does nothing either - PDF.js has already
   * stripped it. The only reliable boundary is the glyphs themselves, so the caller
   * measures one rect per word: a word cannot contain a line break, so its rect is
   * always tight around real characters.
   *
   * `mergeLineRects` then rejoins the words of a line into a single band, since an
   * inter-word gap is far smaller than the line height, while a column gutter is not.
   */
  function textTokenRanges(text, start, end) {
    var source = String(text == null ? "" : text);
    var from = Math.max(0, start === undefined ? 0 : start);
    var to = Math.min(source.length, end === undefined ? source.length : end);
    var isSpace = function (ch) {
      return ch === "" || /\s/.test(ch);
    };

    var out = [];
    var i = from;
    while (i < to) {
      while (i < to && isSpace(source.charAt(i))) i++;
      if (i >= to) break;
      var tokenStart = i;
      while (i < to && !isSpace(source.charAt(i))) i++;
      out.push({ start: tokenStart, end: i });
    }
    return out;
  }

  /**
   * Reassemble the text of a selection that may span several DOM text-layer nodes -
   * one per PDF.js text item - WITHOUT assuming a space belongs at every node boundary.
   *
   * PDF.js can render a single WORD as two adjacent items with no space glyph on either
   * side - a kerning pair, common in justified text - so a caller that just joins one
   * word per node with a fixed " " turns "are" into "ar e" whenever that happens.
   * Reported live on a real exam PDF's exported highlight. A space belongs between two
   * tokens only when the SOURCE actually had whitespace there: either inside a single
   * node (textTokenRanges only ever splits on real whitespace, so a second token within
   * one node is always preceded by some) or carried across a node boundary because the
   * earlier node's slice ended in whitespace or the later one's began with it.
   *
   * AND A LINE BREAK IS NOT WHITESPACE IN A PDF. The rule above - "a space belongs only
   * where the source had one" - is right about spaces and blind about lines: a PDF's
   * content stream has no newline characters at all, it just starts drawing the next run
   * at a lower baseline, so two items on two different LINES look exactly like a kerning
   * pair to a character-only test. Reported live from an exported highlight over a
   * numbered list: "with only one / correct option" came back as "onecorrect option",
   * "carrying / 2 marks each" as "carrying2 marks each", and with every break gone the
   * whole nine-item list arrived as one run-on paragraph. So each slice also carries
   * WHERE ITS BASELINE IS, and a change of baseline emits a real "\n" - the one piece of
   * structure the character stream cannot express on its own.
   *
   * The tolerance is half the item's own height rather than a fixed number of points,
   * because the thing it has to tell apart scales with the type: a superscript or an
   * inline fraction is nudged a couple of points off its neighbours' baseline and is
   * still the same line, while the next line down is a whole line-height away. Half an
   * em separates those two at any font size, where a fixed threshold that works for
   * 10pt body text either splits superscripts in a 24pt heading or merges the lines of a
   * 6pt footnote.
   *
   * Kept separate from measureSelection (viewer.js), which needs a live DOM to pair each
   * token with a rect and so can't be unit tested directly - this half of the decision
   * has no DOM dependency and can be.
   *
   * @param slices [{ text, from, to, line, lineSize }] - one entry per DOM text node the
   *   selection intersects, IN SELECTION ORDER; `text` is that node's full value,
   *   [from, to) the portion the selection covers. Include a node even when its geometry
   *   can't be resolved (no PDF.js item), so its whitespace still counts toward the next
   *   gap - such a node simply carries no `line`, and an absent `line` never breaks,
   *   since "I don't know where this sits" must not be read as "somewhere else".
   *   `line` is the item's baseline in PDF user space (`item.transform[5]`), `lineSize`
   *   its height, `x` its left edge (`item.transform[4]`) and `xEnd` its right one; all
   *   optional, and without them this behaves exactly as it used to.
   * @returns the reassembled text, with "\n" at each line boundary.
   */
  function joinSelectionSlices(slices) {
    var out = "";
    var pendingGap = false;
    // Deliberately NOT "the previous slice's line" - a slice with no line of its own
    // leaves this untouched, so the comparison is always against the last KNOWN baseline
    // rather than resetting to nothing every time an unresolvable node goes past.
    var lastLine = null;
    var lastLineSize = 0;
    // The right edge of the last item whose geometry was known, for the carriage-return
    // test below. Tracked like lastLine, and for the same reason.
    var lastXEnd = null;
    // Survives a slice that contributes no tokens, so a break between two known lines
    // isn't swallowed by an empty node that happens to sit between them.
    var pendingBreak = false;
    var pendingCaret = false;

    for (var i = 0; i < slices.length; i++) {
      var slice = slices[i];
      if (slice.line !== null && slice.line !== undefined) {
        var size = slice.lineSize || lastLineSize || 0;
        var tolerance = Math.max(size / 2, 0.5);
        if (lastLine !== null && Math.abs(slice.line - lastLine) > tolerance) {
          // A moved baseline alone does not make a new line. Stacked notation moves it
          // too: a fraction draws its numerator and denominator at the same x, one above
          // the other, and the bar between them is a vector rule that never reaches the
          // text layer at all. Breaking on the baseline alone turned every such fraction
          // into three lines and shredded the prose around it.
          //
          // What a real line break also does is RETURN - it resumes left of where the
          // previous item ended, while stacked notation stays put or advances. Require
          // both. Compared against the previous item's right edge rather than its start,
          // because a numbered list sets every line at the same left margin: comparing
          // starts would see no movement and never break, which is the bug this whole
          // baseline mechanism exists to fix.
          //
          // With either x unknown this falls back to the baseline alone, so every caller
          // that predates x behaves exactly as it did.
          // Two ems of the type in hand. One is not enough: a denominator wider than its
          // numerator is centred under it and so starts left of it, by up to about an em
          // of the small type a fraction is set in. A carriage return is an order of
          // magnitude larger - a wrapped line returns most of the column width - so the
          // gap between "centred" and "returned" is wide enough not to need tuning. The
          // cost of being generous is a wrap inside a column barely two ems wide, which
          // holds single characters rather than the prose this is protecting.
          var returned =
            lastXEnd === null || slice.x === null || slice.x === undefined
              ? true
              : lastXEnd - slice.x > Math.max(size * 2, 1);
          if (returned) {
            pendingBreak = true;
          } else if (
            slice.line > lastLine &&
            // Superscripts are set in smaller type. Without this, coming back UP from a
            // denominator to the body baseline looks identical to rising into a
            // superscript, and "[- 1 3, is" acquired a caret before its comma.
            slice.lineSize &&
            lastLineSize &&
            slice.lineSize < lastLineSize &&
            !stacksBelow(slices, i)
          ) {
            // Raised, with the text returning to its own baseline afterwards rather than
            // a denominator arriving underneath: a superscript. "^" is the one piece of
            // this notation that CAN be carried across, since the character exists and
            // the direction is unambiguous - unlike a fraction bar, which is a vector
            // rule with no character to recover.
            pendingCaret = true;
          } else {
            // Stacked, not wrapped - so keep the glyphs apart. Joining them flat is the
            // one outcome worse than a garbled quote: a fraction with 1 over 3 becomes
            // the number 13, and "domain is [-1/3, 1/3]" arrives as "[-13, 13]", wrong
            // and with nothing about it looking wrong. A space cannot be mistaken for
            // notation that survived.
            pendingGap = true;
          }
        }
        lastLine = slice.line;
        lastLineSize = slice.lineSize || lastLineSize;
      }
      if (slice.xEnd !== null && slice.xEnd !== undefined) lastXEnd = slice.xEnd;

      var tokens = textTokenRanges(slice.text, slice.from, slice.to);
      for (var t = 0; t < tokens.length; t++) {
        // The break replaces the space rather than joining it - a line boundary already
        // separates the words, and "word\n word" would indent every wrapped line.
        var breakBefore = out.length > 0 && t === 0 && pendingBreak;
        var caretBefore = !breakBefore && out.length > 0 && t === 0 && pendingCaret;
        var spaceBefore =
          !breakBefore &&
          !caretBefore &&
          out.length > 0 &&
          (t > 0 || pendingGap || tokens[t].start > slice.from);
        out +=
          (breakBefore ? "\n" : caretBefore ? "^" : spaceBefore ? " " : "") +
          slice.text.slice(tokens[t].start, tokens[t].end);
        pendingBreak = false;
        pendingCaret = false;
      }

      pendingGap = tokens.length
        ? slice.to > tokens[tokens.length - 1].end
        : slice.to > slice.from
          ? true
          : pendingGap;
    }
    return out;
  }

  /**
   * Does the next placed item sit directly UNDER slices[i], rather than beside it?
   *
   * That is the whole difference between a fraction's numerator and a superscript. Both
   * are raised off the running baseline by more than the line tolerance, and neither can
   * be told from the other by looking at itself - only by what follows. A numerator has a
   * denominator arriving below it at the same x; a superscript is followed by the text
   * resuming its own baseline further right.
   *
   * Called only for an item already known to be raised. Unknown geometry answers "no",
   * which routes to the plain space - the conservative outcome, since a wrongly inserted
   * "^" asserts notation that was never there.
   */
  function stacksBelow(slices, i) {
    var here = slices[i];
    if (here.xEnd === null || here.xEnd === undefined) return false;
    for (var j = i + 1; j < slices.length; j++) {
      var next = slices[j];
      if (next.line === null || next.line === undefined) continue;
      if (next.line >= here.line) return false;
      if (next.x === null || next.x === undefined) return false;
      // Under, not after. A denominator is centred beneath its numerator and so begins
      // before the numerator ENDS; text resuming the line begins after it. Measuring
      // against the right edge separates them cleanly, where "is it nearby" cannot -
      // the word following a superscript starts about as close to it as a denominator
      // sitting underneath does.
      return next.x < here.xEnd;
    }
    return false;
  }

  /**
   * Collapse a word's own client rects into a single bounding box.
   *
   * `Range.getClientRects()` on a SINGLE word can return more than one rect - a browser
   * quirk seen for words containing a descender (g, p, y, j, q), where one rect covers
   * the main glyph body and a second, short one covers the part that dips below the
   * baseline. Left unmerged, that second rect has little vertical overlap with the
   * first, so the line-clustering in mergeLineRects reads it as its own separate line -
   * which paints as a thin colored underline beneath exactly the words that have
   * descenders. Confirmed against a real report: every affected word ("Aggravated",
   * "damage", "person", "registered") has one.
   *
   * Safe to union unconditionally: PDF.js text-layer nodes never contain a line break,
   * so a single word's Range can only ever be on one physical line - multiple rects for
   * it are necessarily a same-line rendering artifact, never two real lines to keep
   * apart. Degenerate rects (the zero-width phantom rects PDF.js also emits between
   * spans - visible directly in a live capture as e.g. `{x:-30, width:0}`) are excluded
   * so they cannot drag the bounding box out to somewhere the word never was.
   */
  function unionClientRects(list) {
    var left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
    for (var i = 0; i < (list ? list.length : 0); i++) {
      var r = list[i];
      if (!isVisibleRect(r)) continue;
      left = Math.min(left, r.left);
      top = Math.min(top, r.top);
      right = Math.max(right, r.left + r.width);
      bottom = Math.max(bottom, r.top + r.height);
    }
    if (!isFinite(left)) return null;
    return { left: left, top: top, width: right - left, height: bottom - top };
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

  /**
   * Map a DOM sub-selection within ONE text-layer item into that item's OWN native
   * coordinate space (a PDF.js text-content item's `transform`/`width`/`height`, taken
   * straight from `page.getTextContent()`) - by computing what FRACTION of the item's
   * own rendered CSS box the sub-selection covers, then applying that same fraction to
   * the item's native box. This is a deliberate second path alongside
   * `clientRectsToPdfRects`, not a replacement for it: that function converts through
   * the page-level viewport transform, which this one avoids for exactly one reason,
   * below.
   *
   * WHY THIS EXISTS. PDF.js applies a per-item horizontal `scaleX` CSS transform
   * whenever the browser's substitute font renders a run of text at a different width
   * than the PDF's own embedded font would have - correcting that ONE item's total
   * rendered width back to the true PDF width. The compensation is exact for the WHOLE
   * item, but not necessarily uniform per character, since different fonts don't share
   * the same relative letter-widths. A PARTIAL selection within that item - exactly
   * what selecting one word out of a longer line produces - converted through the
   * page's viewport transform alone can therefore land at a slightly wrong width, and
   * by how much depends on which font the VIEWER's browser happened to substitute. This
   * was confirmed live: the identical highlight, on the identical PDF, measured
   * correctly in one browser and overshot in another - the CSS width was correct in
   * both (`scaleX` did its job), but the FRACTION of it covered by a partial-item
   * selection wasn't. Normalizing against the item's OWN rendered box, instead of the
   * page's global transform, cancels that per-item distortion out regardless of which
   * font substitution caused it. Same technique as obsidian-pdf-plus's
   * `src/lib/highlights/geometry.ts` (the `computeHighlightRectForItemFromTextLayer`
   * fallback, used there when PDF.js's non-standard per-character data isn't
   * available - which is always, for the stock PDF.js this embed loads from a CDN).
   *
   * @param itemBox {x1,y1,x2,y2} the item's own box, in ITS coordinate space - for a
   *   PDF.js text-content item, x1,y1 = item.transform[4],[5] and x2,y2 = x1+item.width,
   *   y1+item.height.
   * @param parentRect the item's own rendered CSS box (e.g. a live
   *   getBoundingClientRect() on the text-layer div PDF.js built for this item) - any
   *   {left,top,right,bottom}-shaped rect.
   * @param subRect the sub-selection's own rendered CSS box, a subset of parentRect,
   *   same shape.
   * @returns {x,y,width,height} in itemBox's coordinate space, or null if parentRect has
   *   no area to take a fraction of.
   */
  function itemRelativeRect(itemBox, parentRect, subRect) {
    var parentWidth = parentRect.right - parentRect.left;
    var parentHeight = parentRect.bottom - parentRect.top;
    if (parentWidth <= 0 || parentHeight <= 0) return null;

    var itemWidth = itemBox.x2 - itemBox.x1;
    var itemHeight = itemBox.y2 - itemBox.y1;

    var left = itemBox.x1 + ((subRect.left - parentRect.left) / parentWidth) * itemWidth;
    var right = itemBox.x2 - ((parentRect.right - subRect.right) / parentWidth) * itemWidth;
    var bottom = itemBox.y1 + ((subRect.bottom - parentRect.bottom) / parentHeight) * itemHeight;
    var top = itemBox.y2 - ((parentRect.top - subRect.top) / parentHeight) * itemHeight;

    return { x: left, y: bottom, width: right - left, height: top - bottom };
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
   * Tidy the reassembled quote without destroying its shape.
   *
   * This used to be a flat `/\s+/g -> " "`, from before joinSelectionSlices existed, when
   * the text came straight off the DOM selection and every run of whitespace was noise.
   * It is now the LAST step of a pipeline that has just worked out where the line breaks
   * are (see joinSelectionSlices), and collapsing "\s" as one class threw that away
   * again - the highlight was flattened to a single line before anything downstream could
   * use it, which is why an exported numbered list arrived as one run-on item. Horizontal
   * whitespace collapses; newlines survive.
   *
   * Blank lines go too: nothing in a PDF's text layer produces a meaningful one (a
   * paragraph gap is space on the page, not an empty text run), and an empty line inside
   * an exported blockquote closes the quote where it stands.
   */
  function normalizeQuoteText(text) {
    return String(text === null || text === undefined ? "" : text)
      .replace(/\r\n?/g, "\n")
      // Every whitespace character EXCEPT a newline - a plain \s+ here is the old bug.
      .replace(/[^\S\n]+/g, " ")
      .replace(/ ?\n ?/g, "\n")
      .replace(/\n+/g, "\n")
      .trim();
  }

  /**
   * Grow a stored highlight rect vertically to the line box the text actually occupies.
   *
   * WHY THIS IS NEEDED AT ALL. A stored rect comes from PDF text extraction, which gives
   * an ascender-to-baseline box: measured against rendered ink in the harness, the
   * ascenders start about 0.23 of the way down it and the BASELINE lands at about 1.08 -
   * past its bottom edge - with descenders continuing to 1.23. So the painted band both
   * sat a few pixels high and cut the tails off every g, y, p and j. Reported as a gap
   * between wrapped lines, which is the same defect seen from the other side: a band
   * shorter than its line leaves the leading unpainted.
   *
   * The line boxes are the TEXT LAYER's own span rects - the same boxes the browser
   * paints when you drag a selection over those words. Matching them is what makes an
   * applied highlight sit exactly where the blue selection sat a moment earlier, which is
   * the only definition of "right" here that does not need a magic number: no ratio is
   * chosen, no leading is assumed, and a heading or a table cell with its own line height
   * is handled because its spans are simply taller.
   *
   * SELECTED BY THE RECT'S MIDLINE, not by its top edge. The stored rect is offset upward
   * (see above), so its top can sit above the span that contains its text - matching on
   * the top would pick up the line ABOVE on tightly-set text. The midline is solidly
   * inside the line it belongs to.
   *
   * ONLY THE VERTICAL CHANGES. The horizontal extent stays the stored rect's, because
   * that is the run of text the user actually selected - a span is a whole text run and
   * is usually wider than the selection inside it.
   *
   * @param rect       {x,y,width,height} in the overlay's coordinate space.
   * @param lineBoxes  [{top,bottom,left,right}] for the page, same space. May be empty or
   *                   null - a scanned page has no text layer at all.
   * @returns a new rect, or the SAME one when nothing matches, so a page whose text layer
   *   has not been built yet still paints its highlights rather than losing them.
   */
  function expandRectToLineBox(rect, lineBoxes) {
    if (!rect || !lineBoxes || !lineBoxes.length) return rect;

    var midY = rect.y + rect.height / 2;
    var left = rect.x;
    var right = rect.x + rect.width;
    var top = null;
    var bottom = null;

    for (var i = 0; i < lineBoxes.length; i++) {
      var b = lineBoxes[i];
      if (midY < b.top || midY > b.bottom) continue;
      // Touching at an edge is not overlapping - a span that merely abuts the end of the
      // selection is on the same line but outside it, and must not stretch the band.
      if (b.right <= left || b.left >= right) continue;
      top = top === null ? b.top : Math.min(top, b.top);
      bottom = bottom === null ? b.bottom : Math.max(bottom, b.bottom);
    }

    if (top === null) return rect;
    // EXACTLY the union, not a union with the stored rect. The stored rect's top sits
    // about 0.7px ABOVE the span's on measured text, so keeping it would make the band
    // fractionally taller than the browser's own selection - and matching that selection
    // is the entire point of this function. A stored rect taller than its spans is not a
    // case that arises: it is merged from word rects measured inside those same spans.
    return { x: rect.x, y: top, width: rect.width, height: bottom - top };
  }

  return {
    clientRectToLocal: clientRectToLocal,
    rectFromCorners: rectFromCorners,
    roundRect: roundRect,
    isVisibleRect: isVisibleRect,
    textTokenRanges: textTokenRanges,
    joinSelectionSlices: joinSelectionSlices,
    unionClientRects: unionClientRects,
    clientRectsToPdfRects: clientRectsToPdfRects,
    pdfRectToViewportRect: pdfRectToViewportRect,
    itemRelativeRect: itemRelativeRect,
    mergeLineRects: mergeLineRects,
    rectContainsPoint: rectContainsPoint,
    hitTestHighlights: hitTestHighlights,
    normalizeQuoteText: normalizeQuoteText,
    expandRectToLineBox: expandRectToLineBox,
  };
}

// Module-facing bindings. Same function objects the embed gets - see the header note.
const geometry = createGeometry();

export const clientRectToLocal = geometry.clientRectToLocal;
export const rectFromCorners = geometry.rectFromCorners;
export const roundRect = geometry.roundRect;
export const isVisibleRect = geometry.isVisibleRect;
export const textTokenRanges = geometry.textTokenRanges;
export const joinSelectionSlices = geometry.joinSelectionSlices;
export const unionClientRects = geometry.unionClientRects;
export const clientRectsToPdfRects = geometry.clientRectsToPdfRects;
export const pdfRectToViewportRect = geometry.pdfRectToViewportRect;
export const expandRectToLineBox = geometry.expandRectToLineBox;
export const itemRelativeRect = geometry.itemRelativeRect;
export const mergeLineRects = geometry.mergeLineRects;
export const rectContainsPoint = geometry.rectContainsPoint;
export const hitTestHighlights = geometry.hitTestHighlights;
export const normalizeQuoteText = geometry.normalizeQuoteText;
