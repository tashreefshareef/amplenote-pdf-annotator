/**
 * Writes highlights and their notes into a PDF as NATIVE annotations, using pdf-lib.
 *
 * The make-or-break question for the whole project (spec section 7.1) was already
 * answered by spike/pdf-lib-annotations.mjs, and this module is that spike turned into
 * production code. Its findings, carried forward unchanged:
 *
 *   1. Native /Highlight annotations work - selectable and recolorable through a
 *      reader's own UI, not painted-on rectangles.
 *   2. A note-carrying highlight needs an EXPLICIT /Popup child, bidirectionally
 *      linked (highlight./Popup -> popup, popup./Parent -> highlight). Chrome
 *      synthesizes a missing popup and hides the problem; other readers do not, and
 *      the note silently vanishes. Do not "optimize" the popup away.
 *   3. /QuadPoints for one multi-line highlight go in ONE annotation as multiple quad
 *      sets, not as several annotations - that is what keeps a selection spanning N
 *      lines a single thing the user can delete or recolor in one action.
 *   4. Quad order is TL, TR, BL, BR (top row first) - NOT a clockwise winding. Wrong
 *      order renders in some readers and silently vanishes in others.
 *
 * A fifth finding, added after the spike, from a real download opened in Adobe's own
 * tools: /QuadPoints + /C alone is not enough. Chrome and several third-party readers
 * synthesize a default appearance for a Highlight annotation from those two fields, but
 * Adobe's renderers do not - without an explicit /AP (appearance stream), the annotation
 * is simply invisible there, present in the file but never drawn. This is a well-known,
 * spec-documented gap (ISO 32000-1 12.5.5), not an Adobe bug: an appearance stream is
 * optional per the spec, "existing readers may or may not generate one," and Adobe's own
 * products are the strict end of that range. buildHighlightAnnotation therefore builds
 * an /AP /N Form XObject by hand: one filled rectangle per quad, in an isolated graphics
 * state with /BM /Multiply - the SAME blend mode note 12.5.6.19 recommends for Highlight
 * annotations specifically, and the same one the on-screen overlay already uses, so a
 * downloaded file looks like what the user saw in the viewer.
 *
 * WHY THIS FILE HAS THE SAME UNUSUAL SHAPE AS geometry.js
 *
 * Reading the annotated PDF's own bytes back out and re-serializing them has to happen
 * where the PDF's bytes already are: the EMBED, which has them in memory for PDF.js and
 * cannot round-trip a whole file through the plugin bridge (the bridge only reliably
 * carries strings - see docs/api-notes.md - and a multi-megabyte PDF base64-encoded
 * into JSON is not a serious option). The embed cannot import anything, so
 * `createAnnotationWriter` is a factory that closes over nothing, injected into the
 * embed HTML by `.toString()` exactly like `createGeometry`, and read back off
 * `window.__PDFA_ANNOTATIONS`. The embed's copy runs against the CDN-loaded
 * `window.PDFLib` global; Jest imports the real `pdf-lib` npm package (already a
 * devDependency, since the spike used it) and passes its namespace in the same way -
 * so the test suite exercises the exact byte-for-byte code the browser runs, against a
 * real PDF parser, not a mock of one.
 *
 * `PDFLib` is threaded through every function as an explicit parameter rather than
 * imported, for the same reason the geometry helpers take their PDF.js conversion
 * callback as a parameter: the factory must not know or care whether it is running
 * against the npm package or the CDN global.
 */
export function createAnnotationWriter() {
  /** Yellow's RGB triple, duplicated from constants.js rather than imported - this
   * module cannot import anything (see the file header). Used only if a highlight
   * somehow carries a color id with no match in the caller's lookup table; by the time
   * a highlight reaches storage its color has already been validated by
   * createHighlight, so this is a last-resort fallback, not the normal path. */
  var FALLBACK_RGB = [0.957, 0.871, 0.424];

  /**
   * Build the /AP /N Form XObject Adobe's tools require to render the highlight at all
   * (see the file header - finding 5). One filled rectangle per quad, painted with the
   * given color inside an isolated graphics state carrying /BM /Multiply, the blend mode
   * the PDF spec itself recommends for Highlight annotations and the same one the
   * on-screen overlay already uses.
   *
   * BBox is set to the SAME numbers as the annotation's own /Rect, and Matrix is left at
   * pdf-lib's default identity - per the spec's appearance-stream algorithm (12.5.5),
   * that combination maps the form's content directly onto /Rect with no additional
   * transform, so the rectangles below can be drawn in the SAME page-space coordinates
   * used everywhere else in this file, no re-deriving a second coordinate system.
   *
   * @returns {PDFRef} the registered Form XObject, ready to hang off /AP /N.
   */
  function buildAppearanceStream(PDFLib, pdfDoc, rects, rgbTriple, bbox) {
    var gsRef = pdfDoc.context.register(
      pdfDoc.context.obj({
        Type: PDFLib.PDFName.of("ExtGState"),
        BM: PDFLib.PDFName.of("Multiply"),
        // Baked into the appearance itself, not just the annotation's own /CA, since a
        // reader that renders the /AP is not guaranteed to also apply /CA on top of it.
        ca: PDFLib.PDFNumber.of(0.4),
      })
    );

    var operators = [PDFLib.pushGraphicsState(), PDFLib.setGraphicsState("GS0")];
    operators.push(PDFLib.setFillingColor(PDFLib.rgb(rgbTriple[0], rgbTriple[1], rgbTriple[2])));
    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      // Each rect is its own closed subpath; one fill() paints all of them at once
      // (nonzero winding handles disjoint subpaths without needing a union).
      operators.push(PDFLib.moveTo(r.x, r.y));
      operators.push(PDFLib.lineTo(r.x, r.y + r.height));
      operators.push(PDFLib.lineTo(r.x + r.width, r.y + r.height));
      operators.push(PDFLib.lineTo(r.x + r.width, r.y));
      operators.push(PDFLib.closePath());
    }
    operators.push(PDFLib.fill());
    operators.push(PDFLib.popGraphicsState());

    var form = pdfDoc.context.formXObject(operators, {
      BBox: bbox,
      Resources: { ExtGState: { GS0: gsRef } },
    });
    return pdfDoc.context.register(form);
  }

  /**
   * Where a note's popup window sits, in PDF page coordinates.
   *
   * MUST BE ON THE PAGE, which the first version of this was not: it placed the box 8pt
   * to the right of the highlight and 200pt wide, so a highlight spanning an ordinary
   * text column (x 72..540 of a 612pt page) asked for a popup running to x=748 - 136pt
   * past the paper's edge. Every full-width highlight, which is most of them. Readers do
   * not agree on what to do with that: reported live as a tall box parked at the left
   * margin, nothing like the box that was requested.
   *
   * So: to the right of the highlight when the page has room, otherwise pushed back
   * inside the right margin, and top-aligned with the highlight the way Acrobat lays its
   * own popups out. It can overlap the text below - so does every reader's - but it can
   * no longer be off the page.
   *
   * The height follows the note, because this box does not scroll in most readers: a
   * fixed 72pt held about four short lines and quietly clipped anything longer. The line
   * estimate is deliberately rough - the reader picks the font, so nothing here can
   * measure it - and it is CAPPED, since a note long enough to need a full page is better
   * clipped than covering the document it annotates.
   */
  function popupRect(note, bounds, pageWidth, pageHeight) {
    var MARGIN = 8;
    var WIDTH = 220;

    var text = String(note || "");
    var lines = 0;
    var paragraphs = text.split(/\r?\n/);
    for (var i = 0; i < paragraphs.length; i++) {
      // ~45 characters to a line in a 220pt box, at the sort of size readers use.
      lines += Math.max(1, Math.ceil(paragraphs[i].length / 45));
    }
    // 22pt of chrome for the title bar every reader draws, then a line each.
    var height = Math.max(72, Math.min(22 + lines * 14, 260));

    var left = bounds.maxX + MARGIN;
    if (left + WIDTH > pageWidth - MARGIN) left = pageWidth - MARGIN - WIDTH;
    if (left < MARGIN) left = MARGIN;

    var top = bounds.maxY;
    if (top > pageHeight - MARGIN) top = pageHeight - MARGIN;
    var bottom = top - height;
    if (bottom < MARGIN) {
      bottom = MARGIN;
      top = Math.min(bottom + height, pageHeight - MARGIN);
    }

    return [left, bottom, left + WIDTH, top];
  }

  /**
   * One native /Highlight annotation, with an explicit /Popup child when there's a
   * note. Returns the array of refs added (the highlight, plus the popup if present)
   * so the caller can append them to the page's /Annots.
   *
   * `pageSize` is { width, height } - needed only to keep a popup on the page, and
   * defaulted to US Letter for a caller that has no page to hand (the embed always does).
   */
  function buildHighlightAnnotation(PDFLib, pdfDoc, highlight, rgbTriple, pageSize) {
    var rects = highlight.rects;

    // One quad set per rect, all inside a SINGLE annotation dict - see finding 3 above.
    var quadPoints = [];
    var minX = rects[0].x, minY = rects[0].y;
    var maxX = rects[0].x + rects[0].width, maxY = rects[0].y + rects[0].height;

    for (var i = 0; i < rects.length; i++) {
      var r = rects[i];
      var x1 = r.x, x2 = r.x + r.width, y1 = r.y, y2 = r.y + r.height;
      // Top-left, top-right, bottom-left, bottom-right - finding 4 above.
      quadPoints.push(x1, y2, x2, y2, x1, y1, x2, y1);

      minX = Math.min(minX, x1);
      minY = Math.min(minY, y1);
      maxX = Math.max(maxX, x2);
      maxY = Math.max(maxY, y2);
    }

    var dict = pdfDoc.context.obj({
      Type: PDFLib.PDFName.of("Annot"),
      Subtype: PDFLib.PDFName.of("Highlight"),
      // /Rect is the bounding box of every quad, not the quads themselves.
      Rect: pdfDoc.context.obj([minX, minY, maxX, maxY]),
      QuadPoints: pdfDoc.context.obj(quadPoints),
      C: pdfDoc.context.obj(rgbTriple),
      // Printable, and what makes the annotation show up in a reader's comment panel.
      F: PDFLib.PDFNumber.of(4),
      T: PDFLib.PDFString.of("PDF Annotator"),
      M: PDFLib.PDFString.of(new Date().toISOString()),
      // Opacity, so the underlying text stays readable - verified at this value
      // against all four spec colors in the spike.
      CA: PDFLib.PDFNumber.of(0.4),
    });

    if (highlight.note) {
      dict.set(PDFLib.PDFName.of("Contents"), PDFLib.PDFString.of(highlight.note));
    }

    // Finding 5 - without this, the annotation is invisible in Adobe's tools even
    // though it is present in the file and visible in Chrome/PDFGear/PDF.js.
    var apRef = buildAppearanceStream(PDFLib, pdfDoc, rects, rgbTriple, [minX, minY, maxX, maxY]);
    dict.set(PDFLib.PDFName.of("AP"), pdfDoc.context.obj({ N: apRef }));

    var highlightRef = pdfDoc.context.register(dict);
    var refs = [highlightRef];

    // See finding 2 above - required whenever there's a note, not optional.
    if (highlight.note) {
      var popupRef = pdfDoc.context.register(
        pdfDoc.context.obj({
          Type: PDFLib.PDFName.of("Annot"),
          Subtype: PDFLib.PDFName.of("Popup"),
          // Beside the highlight where the page allows, never off it - see popupRect.
          // Only shown when a reader opens it (Open: false below): a popup that opens
          // itself covers the text it is a note about.
          Rect: pdfDoc.context.obj(
            popupRect(
              highlight.note,
              { maxX: maxX, maxY: maxY },
              (pageSize && pageSize.width) || 612,
              (pageSize && pageSize.height) || 792
            )
          ),
          Parent: highlightRef,
          Open: false,
        })
      );
      dict.set(PDFLib.PDFName.of("Popup"), popupRef);
      refs.push(popupRef);
    }

    return refs;
  }

  /** Appends to the page's existing /Annots array, or creates one if this is the first. */
  function appendAnnotationRefs(PDFLib, page, refs) {
    var existing = page.node.get(PDFLib.PDFName.of("Annots"));
    if (existing instanceof PDFLib.PDFArray) {
      for (var i = 0; i < refs.length; i++) existing.push(refs[i]);
    } else {
      page.node.set(PDFLib.PDFName.of("Annots"), page.doc.context.obj(refs));
    }
  }

  /**
   * Load a PDF, write every highlight into it as a native annotation, and return the
   * re-serialized bytes.
   *
   * @param PDFLib          the pdf-lib namespace - the real npm package in Jest, or
   *                        window.PDFLib in the embed.
   * @param pdfBytes        Uint8Array/ArrayBuffer of the SOURCE pdf.
   * @param highlights      stored highlight records: { page, color, rects, note, ... }.
   *                        Any other fields (id, quoteText) are ignored.
   * @param colorRgbTable   { [colorId]: [r,g,b] } 0..1 triples for every known color.
   * @returns {Promise<Uint8Array>}
   */
  async function writeHighlightsIntoPdf(PDFLib, pdfBytes, highlights, colorRgbTable) {
    var pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    var pages = pdfDoc.getPages();
    var list = highlights || [];

    for (var i = 0; i < list.length; i++) {
      var h = list[i];
      if (!h || !h.rects || !h.rects.length) continue;

      // Stale data (a PDF re-attached with fewer pages than when the highlight was
      // made) must not sink the whole export - skip it, keep the rest.
      var page = pages[h.page - 1];
      if (!page) continue;

      var rgbTriple = (colorRgbTable && colorRgbTable[h.color]) || FALLBACK_RGB;
      // The page's own size, so a note's popup can be kept on it - pages within one
      // document can differ (a landscape table, a rotated scan), so this is read per
      // page rather than once.
      var refs = buildHighlightAnnotation(PDFLib, pdfDoc, h, rgbTriple, page.getSize());
      appendAnnotationRefs(PDFLib, page, refs);
    }

    return pdfDoc.save();
  }

  return {
    writeHighlightsIntoPdf: writeHighlightsIntoPdf,
    buildHighlightAnnotation: buildHighlightAnnotation,
    appendAnnotationRefs: appendAnnotationRefs,
  };
}

// Module-facing bindings - same function objects the embed gets. See the header note.
const annotationWriter = createAnnotationWriter();

export const writeHighlightsIntoPdf = annotationWriter.writeHighlightsIntoPdf;
export const buildHighlightAnnotation = annotationWriter.buildHighlightAnnotation;
export const appendAnnotationRefs = annotationWriter.appendAnnotationRefs;
