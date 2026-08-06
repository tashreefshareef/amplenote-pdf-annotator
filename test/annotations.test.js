/**
 * Tests for writing highlights into a PDF as native annotations.
 *
 * These use the REAL `pdf-lib` npm package - the same one the embed loads from a CDN -
 * not a mock. That gives much stronger confidence than asserting on a hand-rolled
 * dictionary shape: every test here builds a real in-memory PDF, writes annotations into
 * it, re-serializes, RE-LOADS the result with pdf-lib, and asserts on what a PDF parser
 * actually reads back - mirroring the verification step the pdf-lib spike itself used
 * (spike/pdf-lib-annotations.mjs), now as asserted tests rather than a console log.
 *
 * What this suite does NOT cover: whether annotations actually PAINT correctly in
 * Acrobat, Preview, or Chrome - that needs a real reader, which Jest cannot drive. What
 * it CAN prove, and does: that the /AP appearance stream this file builds by hand (see
 * "finding 5" in annotations.js's header - Adobe's tools do not synthesize a default
 * appearance from /QuadPoints the way Chrome and PDFGear do, so without an explicit one
 * the annotation is invisible there even though it is present in the file) contains the
 * right operators, colors and blend mode, decoded via pdf-lib's own
 * getContentsString() rather than by regexing raw PDF bytes.
 */
import * as PDFLib from "pdf-lib";
import { createAnnotationWriter, writeHighlightsIntoPdf } from "../src/annotations.js";

const RGB_TABLE = {
  coral: [0.953, 0.6, 0.549],
  yellow: [0.957, 0.871, 0.424],
  green: [0.733, 0.878, 0.467],
  blue: [0.518, 0.714, 0.851],
};

/** A tiny real PDF with N blank pages, built fresh per test so nothing is shared state. */
async function makePdf(pageCount = 1) {
  const doc = await PDFLib.PDFDocument.create();
  for (let i = 0; i < pageCount; i++) doc.addPage([595, 842]); // A4
  return doc.save();
}

const highlight = (overrides = {}) => ({
  page: 1,
  color: "yellow",
  rects: [{ x: 50, y: 700, width: 200, height: 14 }],
  note: null,
  ...overrides,
});

/** Re-load bytes and return the first page's /Annots array, or null if there are none. */
async function annotsOnPage(bytes, pageIndex = 0) {
  const doc = await PDFLib.PDFDocument.load(bytes);
  const annots = doc.getPage(pageIndex).node.get(PDFLib.PDFName.of("Annots"));
  return annots instanceof PDFLib.PDFArray ? annots : null;
}

/**
 * Decode a stream's content into readable operator text. After a save + reload round
 * trip, a Form XObject comes back as a PDFRawStream holding FlateDecode-compressed
 * bytes - its own getContentsString() returns those bytes UNDECODED. decodePDFRawStream
 * is what pdf-lib itself uses internally to undo the filter; .decode() on its result is
 * the actual readable operator string.
 */
function formContentString(stream) {
  return Buffer.from(PDFLib.decodePDFRawStream(stream).decode()).toString("latin1");
}

/** Dereference a PDFRef found inside an /Annots array into its dictionary. */
function resolve(doc, ref) {
  return doc.context.lookup(ref);
}

describe("writeHighlightsIntoPdf", () => {
  // Scenario: the core path - one highlight, no note, must survive a save + reload as
  // a real, well-formed /Highlight annotation.
  test("writes a single highlight as a native /Highlight annotation", async () => {
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight()], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);

    expect(annots).not.toBeNull();
    expect(annots.size()).toBe(1);

    const dict = resolve(doc, annots.get(0));
    expect(dict.get(PDFLib.PDFName.of("Subtype"))).toEqual(PDFLib.PDFName.of("Highlight"));
    expect(dict.get(PDFLib.PDFName.of("Type"))).toEqual(PDFLib.PDFName.of("Annot"));
  });

  // Scenario: THE classic cause of a highlight that renders in some readers and
  // vanishes in others (spike finding 4) - quad order must be TL, TR, BL, BR, not a
  // clockwise winding.
  test("orders QuadPoints as top-left, top-right, bottom-left, bottom-right", async () => {
    const rect = { x: 50, y: 700, width: 200, height: 14 };
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight({ rects: [rect] })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);
    const dict = resolve(doc, annots.get(0));
    const quad = dict.get(PDFLib.PDFName.of("QuadPoints")).asArray().map((n) => n.asNumber());

    expect(quad).toEqual([
      rect.x, rect.y + rect.height, // top-left
      rect.x + rect.width, rect.y + rect.height, // top-right
      rect.x, rect.y, // bottom-left
      rect.x + rect.width, rect.y, // bottom-right
    ]);
  });

  // Scenario: a multi-line selection (spike finding 3) - every line's rect becomes its
  // own quad set, all inside ONE annotation, not split into several. This is what makes
  // a multi-line highlight one thing the user can delete or recolor in a single action.
  test("keeps a multi-rect highlight as ONE annotation with multiple quad sets", async () => {
    const rects = [
      { x: 50, y: 700, width: 300, height: 14 },
      { x: 50, y: 686, width: 120, height: 14 },
    ];
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight({ rects })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);

    expect(annots.size()).toBe(1); // one annotation, not two
    const dict = resolve(doc, annots.get(0));
    const quad = dict.get(PDFLib.PDFName.of("QuadPoints")).asArray();
    expect(quad).toHaveLength(rects.length * 8); // 8 numbers per rect
  });

  // Scenario: /Rect must be the bounding box of every quad in a multi-line highlight,
  // not just the first rect - otherwise a reader may clip or mis-hit-test the highlight.
  test("sets /Rect to the bounding box of all rects, not just the first", async () => {
    const rects = [
      { x: 50, y: 700, width: 100, height: 14 }, // right edge at 150
      { x: 200, y: 680, width: 50, height: 14 }, // right edge at 250, lower y
    ];
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight({ rects })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);
    const dict = resolve(doc, annots.get(0));
    const rect = dict.get(PDFLib.PDFName.of("Rect")).asArray().map((n) => n.asNumber());

    expect(rect).toEqual([50, 680, 250, 714]);
  });

  // Scenario: color must reach the annotation unchanged, so the exported PDF's
  // highlight color matches what the user saw in the viewer.
  test("writes the highlight's color as /C", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight({ color: "blue" })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);
    const dict = resolve(doc, annots.get(0));
    const c = dict.get(PDFLib.PDFName.of("C")).asArray().map((n) => n.asNumber());

    expect(c).toEqual(RGB_TABLE.blue);
  });

  // Scenario: opacity and print/comment-panel visibility, pinned exactly as the spike
  // verified them against real readers.
  test("sets CA opacity and the printable/comment-panel flag", async () => {
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight()], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);
    const dict = resolve(doc, annots.get(0));

    expect(dict.get(PDFLib.PDFName.of("CA")).asNumber()).toBe(0.4);
    expect(dict.get(PDFLib.PDFName.of("F")).asNumber()).toBe(4);
    expect(dict.get(PDFLib.PDFName.of("T")).asString()).toBe("PDF Annotator");
  });

  // Scenario: THE trap the spike exists to prevent (finding 2) - a highlight with a
  // note must carry an explicit, bidirectionally-linked /Popup. Relying on /Contents
  // alone works in Chrome (which synthesizes the popup) and silently fails elsewhere.
  test("gives a note-carrying highlight an explicit, bidirectionally-linked /Popup", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight({ note: "worth remembering" })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);

    expect(annots.size()).toBe(2); // the highlight AND its popup

    const highlightRef = annots.get(0);
    const highlightDict = resolve(doc, highlightRef);
    expect(highlightDict.get(PDFLib.PDFName.of("Contents")).asString()).toBe("worth remembering");

    const popupRef = highlightDict.get(PDFLib.PDFName.of("Popup"));
    const popupDict = resolve(doc, popupRef);
    expect(popupDict.get(PDFLib.PDFName.of("Subtype"))).toEqual(PDFLib.PDFName.of("Popup"));
    // Bidirectional: the popup must point back at the highlight that owns it.
    expect(popupDict.get(PDFLib.PDFName.of("Parent"))).toEqual(highlightRef);
  });

  // Scenario: the inverse - a highlight with NO note must not carry a /Popup or
  // /Contents at all. A phantom empty popup would be visible/clickable for no reason.
  test("omits /Popup and /Contents entirely when there is no note", async () => {
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight({ note: null })], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);

    expect(annots.size()).toBe(1); // no popup object at all
    const dict = resolve(doc, annots.get(0));
    expect(dict.get(PDFLib.PDFName.of("Contents"))).toBeUndefined();
    expect(dict.get(PDFLib.PDFName.of("Popup"))).toBeUndefined();
  });

  // Scenario: THE bug reported live - a downloaded PDF's highlights were invisible in
  // Adobe's own tools, though present in the file and visible in Chrome/PDFGear. Chrome
  // and several third-party readers synthesize a default appearance from /QuadPoints;
  // Adobe's do not (ISO 32000-1 12.5.5 makes an appearance stream optional, and Adobe
  // sits at the strict end of that range). Every highlight must carry an explicit /AP.
  test("gives every highlight an /AP appearance stream, not just /QuadPoints", async () => {
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight()], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const dict = resolve(doc, (await annotsOnPage(bytes)).get(0));

    const ap = dict.get(PDFLib.PDFName.of("AP"));
    expect(ap).toBeDefined();
    const form = doc.context.lookup(ap.get(PDFLib.PDFName.of("N")));
    expect(form.dict.get(PDFLib.PDFName.of("Subtype"))).toEqual(PDFLib.PDFName.of("Form"));
  });

  // Scenario: the appearance's own coordinate system must line up with /Rect, or the
  // painted rectangle would sit somewhere other than where /QuadPoints says the
  // highlight is. Per the spec's appearance algorithm, BBox equal to /Rect with the
  // (default) identity Matrix maps 1:1 with no extra transform - the simplest way to get
  // this right, and the one this file relies on rather than deriving a second transform.
  test("sets the appearance's BBox to the same bounding box as /Rect", async () => {
    const rects = [
      { x: 50, y: 700, width: 100, height: 14 },
      { x: 200, y: 680, width: 50, height: 14 },
    ];
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight({ rects })], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const dict = resolve(doc, (await annotsOnPage(bytes)).get(0));

    const rect = dict.get(PDFLib.PDFName.of("Rect")).asArray().map((n) => n.asNumber());
    const form = doc.context.lookup(dict.get(PDFLib.PDFName.of("AP")).get(PDFLib.PDFName.of("N")));
    const bbox = form.dict.get(PDFLib.PDFName.of("BBox")).asArray().map((n) => n.asNumber());

    expect(bbox).toEqual(rect);
  });

  // Scenario: the appearance must actually paint the SAME color and the SAME rects as
  // the annotation's own /C and /QuadPoints - reading the decoded content stream
  // operators directly is what proves the appearance isn't just present but correct.
  test("paints the appearance in the highlight's own color, one rectangle per quad", async () => {
    const rects = [
      { x: 50, y: 700, width: 100, height: 14 },
      { x: 50, y: 680, width: 60, height: 14 },
    ];
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight({ color: "blue", rects })], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const dict = resolve(doc, (await annotsOnPage(bytes)).get(0));
    const form = doc.context.lookup(dict.get(PDFLib.PDFName.of("AP")).get(PDFLib.PDFName.of("N")));
    const content = formContentString(form);

    // The blue triple, formatted the way pdf-lib's own rg operator writes numbers.
    expect(content).toContain("0.518 0.714 0.851 rg");
    // One closed rectangle path per rect: moveTo -> 3 lineTo -> closePath.
    expect((content.match(/\bm\b/g) || []).length).toBe(2);
    expect((content.match(/\bl\b/g) || []).length).toBe(6);
    expect((content.match(/\bh\b/g) || []).length).toBe(2);
    // A single fill paints every subpath at once, not one fill per rect.
    expect((content.match(/^f$/gm) || []).length).toBe(1);
  });

  // Scenario: THE reason for building the appearance by hand instead of leaving it to a
  // reader's default - the spec recommends Multiply blend mode specifically for
  // Highlight annotations, and it is what makes the underlying text stay readable
  // through the color. It has to live in an ExtGState, since blend mode is not a raw
  // content-stream operator on its own.
  test("sets the appearance's blend mode to Multiply via an ExtGState, opacity included", async () => {
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight()], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    const dict = resolve(doc, (await annotsOnPage(bytes)).get(0));
    const form = doc.context.lookup(dict.get(PDFLib.PDFName.of("AP")).get(PDFLib.PDFName.of("N")));

    const resources = form.dict.get(PDFLib.PDFName.of("Resources"));
    const extGState = doc.context.lookup(resources.get(PDFLib.PDFName.of("ExtGState")).get(PDFLib.PDFName.of("GS0")));
    expect(extGState.get(PDFLib.PDFName.of("BM"))).toEqual(PDFLib.PDFName.of("Multiply"));
    expect(extGState.get(PDFLib.PDFName.of("ca")).asNumber()).toBe(0.4);
    // And the content stream actually invokes it, not just declares it unused.
    expect(formContentString(form)).toContain("/GS0 gs");
  });

  // Scenario: several highlights on the same page must all land in /Annots, not
  // overwrite each other.
  test("appends multiple highlights on one page rather than replacing", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [
        highlight({ color: "coral", rects: [{ x: 50, y: 700, width: 100, height: 14 }] }),
        highlight({ color: "green", rects: [{ x: 50, y: 650, width: 100, height: 14 }] }),
        highlight({ color: "blue", note: "a note", rects: [{ x: 50, y: 600, width: 100, height: 14 }] }),
      ],
      RGB_TABLE
    );
    const annots = await annotsOnPage(bytes);
    // 3 highlights + 1 popup for the blue one's note.
    expect(annots.size()).toBe(4);
  });

  // Scenario: highlights on different pages must land on their own pages, not all
  // bunched onto page 1.
  test("places each highlight on its own page", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(3),
      [highlight({ page: 1 }), highlight({ page: 3 })],
      RGB_TABLE
    );

    expect((await annotsOnPage(bytes, 0)).size()).toBe(1);
    expect(await annotsOnPage(bytes, 1)).toBeNull(); // untouched middle page
    expect((await annotsOnPage(bytes, 2)).size()).toBe(1);
  });

  // Scenario: stale data - a PDF re-attached with fewer pages than when a highlight was
  // made. Must skip that highlight, not throw and lose every other one.
  test("skips a highlight whose page no longer exists in the PDF, keeping the rest", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(1),
      [highlight({ page: 1 }), highlight({ page: 99 })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1); // export didn't crash or add pages
    expect((await annotsOnPage(bytes)).size()).toBe(1);
  });

  // Scenario: defensive - an unknown color id must not crash the export. By the time a
  // highlight reaches storage its color has already been validated by createHighlight,
  // so this is a last-resort fallback, not the normal path.
  test("falls back to a default color rather than throwing on an unrecognized one", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight({ color: "octarine" })],
      RGB_TABLE
    );
    const doc = await PDFLib.PDFDocument.load(bytes);
    const annots = await annotsOnPage(bytes);
    const dict = resolve(doc, annots.get(0));
    expect(dict.get(PDFLib.PDFName.of("C")).asArray()).toHaveLength(3);
  });

  // Scenario: no highlights at all - export must still produce a valid, parseable PDF
  // rather than throwing, since a user might click Download before highlighting anything.
  test("returns a valid, unmodified PDF when there are no highlights", async () => {
    const bytes = await writeHighlightsIntoPdf(PDFLib, await makePdf(), [], RGB_TABLE);
    const doc = await PDFLib.PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBe(1);
    expect(await annotsOnPage(bytes)).toBeNull();
  });

  // Scenario: malformed entries (no rects) in the highlights array must be skipped,
  // not crash the whole export - mirrors storage.js's own tolerance for bad records.
  test("skips a highlight with no rects instead of throwing", async () => {
    const bytes = await writeHighlightsIntoPdf(
      PDFLib,
      await makePdf(),
      [highlight(), { page: 1, color: "yellow", rects: [], note: null }],
      RGB_TABLE
    );
    expect((await annotsOnPage(bytes)).size()).toBe(1);
  });
});

describe("createAnnotationWriter", () => {
  // Scenario: the embed cannot import this module - it gets the factory's SOURCE
  // injected into the page and calls it there, against window.PDFLib instead of the
  // npm package. If the factory ever closed over module scope, the module-level
  // exports would keep working while the embed copy threw a ReferenceError only
  // visible in the live app.
  test("produces a working, self-contained copy of the API", async () => {
    const writer = createAnnotationWriter();
    expect(typeof writer.writeHighlightsIntoPdf).toBe("function");

    const bytes = await writer.writeHighlightsIntoPdf(PDFLib, await makePdf(), [highlight()], RGB_TABLE);
    expect((await annotsOnPage(bytes)).size()).toBe(1);
  });

  // Scenario: the factory's source is serialized into an inline script tag. A literal
  // closing script tag anywhere in it - even inside a comment - terminates the embed's
  // script block early and breaks the whole viewer.
  test("has a source safe to inline in a script tag", () => {
    expect(createAnnotationWriter.toString()).not.toContain("</" + "script");
  });
});
