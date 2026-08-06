/**
 * SPIKE — the make-or-break question for this whole project (spec §7.1).
 *
 * Question: can pdf-lib write NATIVE PDF highlight annotations (plus an attached
 * popup note) that open correctly in Acrobat, Preview, and Chrome?
 *
 * pdf-lib has no high-level highlight API, so this builds the annotation dictionaries
 * by hand and attaches them to the page's /Annots array. If this works, Phase 4 is
 * mostly mechanical. If it doesn't, the plan changes before any UI exists.
 *
 * Run:  npm run spike:annotations
 * Then open spike/out/annotated-sample.pdf in Acrobat / Preview / Chrome and check:
 *   1. Four colored highlights appear over the text on page 1.
 *   2. They are real annotations — selectable, listed in the reader's annotation/
 *      comment panel, deletable — NOT painted-on rectangles.
 *   3. The yellow highlight carries a popup note reading "This is the user's note."
 *   4. Colors match the spec palette.
 *
 * A highlight that LOOKS right but is drawn content rather than an annotation is the
 * failure mode to watch for — it would pass a screenshot check and fail acceptance.
 */
import { PDFDocument, StandardFonts, rgb, PDFName, PDFArray, PDFString, PDFNumber } from "pdf-lib";
import { mkdirSync, writeFileSync } from "node:fs";

const COLORS = [
  { label: "Coral", hex: "#F3998C", rgb: [0.953, 0.6, 0.549] },
  { label: "Yellow", hex: "#F4DE6C", rgb: [0.957, 0.871, 0.424] },
  { label: "Green", hex: "#BBE077", rgb: [0.733, 0.878, 0.467] },
  { label: "Blue", hex: "#84B6D9", rgb: [0.518, 0.714, 0.851] },
];

/**
 * Build a native /Highlight annotation dictionary.
 *
 * Key detail: /QuadPoints, not /Rect, defines the highlighted region. The order is
 * counter-intuitive — x1,y1 x2,y2 x3,y3 x4,y4 is TL, TR, BL, BR (top row first),
 * NOT a clockwise winding. Getting this wrong is the classic cause of highlights that
 * render in some readers and vanish in others.
 *
 * All coordinates are PDF user space, origin bottom-left (spec §3).
 */
function createHighlightAnnotation(pdfDoc, { x, y, width, height, color, contents }) {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  const quadPoints = [
    x1, y2, // top-left
    x2, y2, // top-right
    x1, y1, // bottom-left
    x2, y1, // bottom-right
  ];

  const dict = pdfDoc.context.obj({
    Type: PDFName.of("Annot"),
    Subtype: PDFName.of("Highlight"),
    Rect: pdfDoc.context.obj([x1, y1, x2, y2]),
    QuadPoints: pdfDoc.context.obj(quadPoints),
    C: pdfDoc.context.obj(color), // 0..1 RGB
    // Printable + the annotation shows up in reader comment panels.
    F: PDFNumber.of(4),
    T: PDFString.of("PDF Annotator"),
    M: PDFString.of(new Date().toISOString()),
    CA: PDFNumber.of(0.4), // opacity, so underlying text stays readable
  });

  // /Contents is what a reader shows as the annotation's note/popup body.
  if (contents) dict.set(PDFName.of("Contents"), PDFString.of(contents));

  const highlightRef = pdfDoc.context.register(dict);
  const refs = [highlightRef];

  /**
   * An EXPLICIT /Popup child annotation for the note.
   *
   * NOT strictly required: /Contents alone already works in Chrome, which synthesizes
   * a popup and shows it on hover (verified). This is declared anyway for two reasons:
   *   1. Acrobat and Preview populate their comment panels from the annotation tree,
   *      and an explicit popup is the standards-correct structure for a markup
   *      annotation that carries text. Don't rely on every reader synthesizing one.
   *   2. It lets us control the popup's rect and its default open state instead of
   *      inheriting whatever each reader picks.
   *
   * The link is bidirectional: highlight./Popup → popup, popup./Parent → highlight.
   * Readers that only follow one direction will otherwise ignore the note.
   *
   * If this turns out to REGRESS the hover behavior that already works, drop it —
   * /Contents alone is the proven-good fallback.
   */
  if (contents) {
    const popupRef = pdfDoc.context.register(
      pdfDoc.context.obj({
        Type: PDFName.of("Annot"),
        Subtype: PDFName.of("Popup"),
        // Sits to the right of the highlight; only shown when opened.
        Rect: pdfDoc.context.obj([x2 + 8, y1 - 60, x2 + 208, y1 + 12]),
        Parent: highlightRef,
        Open: false,
      })
    );
    dict.set(PDFName.of("Popup"), popupRef);
    refs.push(popupRef);
  }

  return refs;
}

/** Accepts a single ref or an array (a highlight plus its popup). */
function appendAnnotation(page, annotationRefs) {
  const refs = Array.isArray(annotationRefs) ? annotationRefs : [annotationRefs];
  const existing = page.node.get(PDFName.of("Annots"));
  if (existing instanceof PDFArray) {
    for (const ref of refs) existing.push(ref);
  } else {
    page.node.set(PDFName.of("Annots"), page.doc.context.obj(refs));
  }
}

async function main() {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const page = pdfDoc.addPage([595, 842]); // A4

  page.drawText("PDF Annotator — native annotation spike", {
    x: 50, y: 780, size: 16, font, color: rgb(0, 0, 0),
  });

  // Draw four lines of text, then lay a highlight annotation over each one.
  const lines = COLORS.map((c, i) => ({
    text: `Line ${i + 1}: highlighted in ${c.label} (${c.hex}) — this text should sit under a real annotation.`,
    y: 700 - i * 60,
    color: c,
  }));

  for (const line of lines) {
    page.drawText(line.text, { x: 50, y: line.y, size: 10, font, color: rgb(0, 0, 0) });
  }

  for (const line of lines) {
    const textWidth = font.widthOfTextAtSize(line.text, 10);
    const refs = createHighlightAnnotation(pdfDoc, {
      x: 50,
      y: line.y - 3,
      width: textWidth,
      height: 14,
      color: line.color.rgb,
      // Only the yellow one carries a note, matching the spec's "at most one note
      // per highlight, optional" rule.
      contents: line.color.label === "Yellow" ? "This is the user's note." : null,
    });
    appendAnnotation(page, refs);
  }

  // Multi-line highlight: one annotation spanning two lines via multiple quad sets is
  // the real-world case (a selection wrapping across lines). Verify it renders as ONE
  // annotation with two bands, not two separate ones.
  page.drawText("Multi-line selection, first line of the wrapped quote,", {
    x: 50, y: 420, size: 10, font, color: rgb(0, 0, 0),
  });
  page.drawText("and the second line completing it.", {
    x: 50, y: 400, size: 10, font, color: rgb(0, 0, 0),
  });

  const multiQuads = [
    50, 431, 360, 431, 50, 417, 360, 417,
    50, 411, 260, 411, 50, 397, 260, 397,
  ];
  // CONTROL CASE: this one deliberately uses /Contents with NO explicit /Popup, so it
  // A/Bs against the yellow highlight above (which has one). Compare the two in each
  // reader — if they behave identically, the explicit popup is unnecessary ceremony
  // and Phase 4 can skip it.
  const multiRef = pdfDoc.context.register(
    pdfDoc.context.obj({
      Type: PDFName.of("Annot"),
      Subtype: PDFName.of("Highlight"),
      Rect: pdfDoc.context.obj([50, 397, 360, 431]),
      QuadPoints: pdfDoc.context.obj(multiQuads),
      C: pdfDoc.context.obj([0.518, 0.714, 0.851]),
      F: PDFNumber.of(4),
      T: PDFString.of("PDF Annotator"),
      Contents: PDFString.of("A note on a highlight that spans two lines."),
      M: PDFString.of(new Date().toISOString()),
      CA: PDFNumber.of(0.4),
    })
  );
  appendAnnotation(page, multiRef);

  const bytes = await pdfDoc.save();
  mkdirSync("spike/out", { recursive: true });
  writeFileSync("spike/out/annotated-sample.pdf", bytes);

  // Re-open the saved file and count annotations, proving they survived
  // serialization rather than only existing in memory.
  const reloaded = await PDFDocument.load(bytes);
  const annots = reloaded.getPage(0).node.get(PDFName.of("Annots"));
  const count = annots instanceof PDFArray ? annots.size() : 0;

  // 4 single-line highlights + 1 popup (yellow's note) + 1 multi-line highlight.
  const EXPECTED = 6;
  console.log(`Wrote spike/out/annotated-sample.pdf (${(bytes.length / 1024).toFixed(1)} kB)`);
  console.log(`Annotations present after reload: ${count} (expected ${EXPECTED})`);
  if (count !== EXPECTED) console.log("!! Count mismatch — annotations did not survive serialization.");
  console.log("\nA/B to check in each reader:");
  console.log("  Yellow highlight     — note via explicit /Popup (Open false)");
  console.log("  Blue multi-line      — note via /Contents only, reader synthesizes");
  console.log("Both should show their note on hover/click and appear in the reader's");
  console.log("comment panel. If they behave the same, Phase 4 can drop the explicit popup.");
}

main().catch((err) => {
  console.error("SPIKE FAILED:", err);
  process.exit(1);
});
