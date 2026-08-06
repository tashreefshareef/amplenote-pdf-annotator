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
   * One native /Highlight annotation, with an explicit /Popup child when there's a
   * note. Returns the array of refs added (the highlight, plus the popup if present)
   * so the caller can append them to the page's /Annots.
   */
  function buildHighlightAnnotation(PDFLib, pdfDoc, highlight, rgbTriple) {
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

    var highlightRef = pdfDoc.context.register(dict);
    var refs = [highlightRef];

    // See finding 2 above - required whenever there's a note, not optional.
    if (highlight.note) {
      var popupRef = pdfDoc.context.register(
        pdfDoc.context.obj({
          Type: PDFLib.PDFName.of("Annot"),
          Subtype: PDFLib.PDFName.of("Popup"),
          // Sits to the right of the highlight; only shown when a reader opens it.
          Rect: pdfDoc.context.obj([maxX + 8, minY - 60, maxX + 208, minY + 12]),
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
      var refs = buildHighlightAnnotation(PDFLib, pdfDoc, h, rgbTriple);
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
