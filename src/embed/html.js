/**
 * Builds the HTML string returned by `renderEmbed`.
 *
 * The four highlight colors sit as top-level toolbar buttons - the spec is explicit that
 * they must not be a dropdown or a sidebar - and the viewer mounts them from the color
 * table in constants.js so there is one source of truth per color.
 *
 * FOUR FUNCTIONS ARE INJECTED, each by serializing its source:
 *   - `createGeometry()` from src/geometry.js, so the embed runs the SAME rect
 *     arithmetic the Jest suite covers instead of an untested transcription of it
 *   - `createAnnotationWriter()` from src/annotations.js, so Download writes native
 *     PDF annotations with the SAME code Jest exercises against the real pdf-lib
 *     package, not an untested transcription of the pdf-lib spike
 *   - `createExportBuilder()` from src/export.js, so Copy / Send to note / Export all
 *     build the exact markdown Jest checks against the bounty's own layout requirement
 *   - `viewerMain()`, the DOM, PDF.js and pdf-lib wiring
 * None can import anything, and none may contain a literal closing script tag anywhere
 * in its source - comments included. There are tests for all four.
 *
 * SCRIPT LOADING - two live failures are baked into the shape of this file:
 *
 * 1. The viewer must NOT be attached as an `onload="..."` attribute. Its source is full
 *    of double quotes, which terminate the HTML attribute at the first one, so it never
 *    runs at all. The symptom is indistinguishable from a hang: the static "Loading..."
 *    markup just sits there.
 *
 * 2. PDF.js must NOT be a plain `<script src>` here. Amplenote re-executes the embed's
 *    inline scripts immediately while an external script is still downloading, so the
 *    viewer ran before the library existed. The viewer therefore loads PDF.js itself
 *    and waits for onload - the sequence proven to work in the live app.
 */
import { CDN, HIGHLIGHT_COLORS, DEFAULT_COLOR_ID } from "../constants.js";
import { createGeometry } from "../geometry.js";
import { createAnnotationWriter } from "../annotations.js";
import { createExportBuilder } from "../export.js";
import { viewerMain } from "./viewer.js";

/** Escape a value being interpolated into HTML text or an attribute. */
function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Serialize config for injection into a <script> tag.
 *
 * `</` must be broken up: a "</script>" sequence appearing inside string data would
 * terminate the enclosing script element early and corrupt the page. This is the same
 * hazard that makes the literal closing tag below appear as "<\/script>".
 */
function safeJson(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  #pdfa-root { display: flex; flex-direction: column; height: 100vh; background: var(--pdfa-bg); color: var(--pdfa-fg); }
  /* Holds the page scroller and the highlights panel. Positioned so the panel can
     overlay the pages without the toolbar, and without reflowing the PDF - the embed is
     often barely wider than a page, so a panel that stole width would squeeze it. */
  .pdfa-body { position: relative; flex: 1 1 auto; display: flex; min-height: 0; }
  .pdfa-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid var(--pdfa-border); background: var(--pdfa-toolbar); flex: 0 0 auto; flex-wrap: wrap; }
  .pdfa-toolbar button { font: inherit; padding: 4px 9px; border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit; border-radius: 5px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
  .pdfa-toolbar button:disabled { opacity: .5; cursor: default; }
  .pdfa-label { min-width: 62px; text-align: center; opacity: .85; font-variant-numeric: tabular-nums; }
  .pdfa-sep { width: 1px; align-self: stretch; background: var(--pdfa-border); margin: 0 4px; }
  .pdfa-brand { font-weight: 600; font-size: 12px; letter-spacing: .01em; color: var(--pdfa-accent);
    white-space: nowrap; padding-right: 2px; }
  .pdfa-spacer { flex: 1 1 auto; }
  .pdfa-name { opacity: .7; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pdfa-scroll { flex: 1 1 auto; overflow: auto; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .pdfa-page { position: relative; box-shadow: 0 1px 6px rgba(0,0,0,.28); background: #fff; flex: 0 0 auto; }
  .pdfa-page canvas { display: block; }
  .pdfa-status { padding: 10px 12px; text-align: center; opacity: .8; }
  .pdfa-error { color: var(--pdfa-error); opacity: 1; white-space: pre-wrap; }

  /* TEXT LAYER
     Styling comes from PDF.js's own pdf_viewer.css, linked above. Do not reimplement
     those rules - the layer's geometry is coupled to what renderTextLayer emits, and
     two positioning bugs have already come from hand-rolled substitutes.

     What follows is only (a) a safety net if that stylesheet fails to load, and (b) the
     selection colour, which is ours to choose.

     The safety net matters: without "color: transparent" a failed stylesheet paints
     every glyph a second time on top of the canvas, which looks like a corrupted PDF
     rather than a missing CSS file. (No backticks in this comment - STYLES is itself a
     template literal, and one would terminate it.) */
  .textLayer { position: absolute; inset: 0; overflow: hidden; line-height: 1;
    opacity: 0.3; forced-color-adjust: none; }
  .textLayer > span { color: transparent; position: absolute; white-space: pre;
    cursor: text; transform-origin: 0% 0%; }
  /* Opaque on purpose: the container's opacity fades the layer as a single group, so
     overlapping spans can't compound their alpha into dark seams between lines. */
  .textLayer ::selection { background: #1a73e8; }
  .textLayer > span::selection { background: #1a73e8; }
  /* Above the highlight overlay, so text stays selectable over an existing highlight. */
  .textLayer { z-index: 2; }

  /* HIGHLIGHT OVERLAY
     Sits between the canvas and the text layer, and takes no pointer events at all -
     clicks on a highlight are found by hit-testing the click point against the stored
     PDF-space rects instead. Giving the rects their own pointer events would block text
     selection over anything already highlighted.

     Blend mode + isolation live on THIS layer, not on each rect and not per highlight -
     see the comment below for why the scope had to widen twice. DOM order (canvas, then
     this, then the text layer) already gives the right paint order; isolation does not
     change that, it only decides what a descendant's blend mode composites against. */
  .pdfa-highlights { position: absolute; inset: 0; overflow: hidden; pointer-events: none;
    mix-blend-mode: multiply; isolation: isolate; }
  /* Every rect on the page - across EVERY highlight, not just within one - has to
     flatten together before the single multiply pass against the canvas, or two
     overlapping rects double-color wherever they touch.
     Two live reports, same underlying bug, different scope each time:
       1. One highlight's OWN line rects can overlap by a pixel or two - tightly-set
          text can have one line's descender ink dip into the next line's ascender
          space. Fixed first by isolating per HIGHLIGHT (one group per highlight).
       2. That fix left the SAME seam between two DIFFERENT highlights whose rects
          happen to touch at a line boundary (recolor a highlight beside an existing
          one, or two separate highlights on adjacent lines) - each highlight was its
          own isolated group, so two groups touching still each multiplied the page
          independently, compounding right back.
     Isolating the whole layer instead of each highlight fixes both at once: every rect
     on the page composites flat against every other rect first (same or different
     highlight, doesn't matter - two opaque rects overlapping just show whichever
     painted last, no color math), and the FLATTENED result blends against the canvas
     exactly once. The .pdfa-hl-group class below is now purely organizational (keeps a
     highlight's own rects together, carries its id) - it has no blend mode of its own,
     or it would re-isolate its own subtree and undo the point of the wider scope.
     (No backticks anywhere in this comment - STYLES is itself a template literal.) */
  .pdfa-hl-group { position: absolute; inset: 0; }
  .pdfa-hl { position: absolute; border-radius: 2px; }

  /* The four colors are top-level toolbar buttons, single click, no submenu - an
     explicit spec requirement, not a layout preference. The bare .pdfa-color selector is
     for the popover copies; the descendant one exists only to outrank
     ".pdfa-toolbar button" above, which would otherwise impose its padding. */
  .pdfa-color, .pdfa-toolbar .pdfa-color { width: 20px; height: 20px; padding: 0; border-radius: 50%;
    border: 1px solid rgba(0,0,0,.28); cursor: pointer; font: inherit; }
  .pdfa-color[aria-pressed="true"], .pdfa-toolbar .pdfa-color[aria-pressed="true"] {
    box-shadow: 0 0 0 2px var(--pdfa-toolbar), 0 0 0 4px var(--pdfa-accent); }
  .pdfa-hint { display: none; opacity: .75; font-size: 12px; white-space: nowrap; }

  /* Remove / recolor actions for an existing highlight. Positioned "fixed" because the
     embed is its own iframe, so a click's client coordinates are already relative to
     this element's containing block - no scroll-offset arithmetic to get wrong. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg); max-width: 320px; flex-wrap: wrap;
    border: 1px solid var(--pdfa-border); border-radius: 8px; box-shadow: 0 3px 12px rgba(0,0,0,.3); }
  .pdfa-popover.pdfa-open { display: flex; }
  /* The note editor turns the popover into a small column form. */
  .pdfa-popover.pdfa-editing { flex-direction: column; align-items: stretch; width: 274px; }
  /* Export all's color filter: independently-toggled swatches, not the single-select
     behaviour the same .pdfa-color class has everywhere else - the filter is "any
     combination of colors", not "one active color". */
  .pdfa-popover.pdfa-exporting { flex-direction: column; align-items: stretch; width: 220px; }
  .pdfa-export-colors { display: flex; gap: 6px; padding: 2px 0 8px; }
  .pdfa-export-hint { font-size: 12px; opacity: .75; padding-bottom: 6px; }
  .pdfa-note-input { font: inherit; font-size: 12px; width: 100%; resize: vertical; padding: 6px;
    border: 1px solid var(--pdfa-border); border-radius: 5px;
    background: var(--pdfa-bg); color: inherit; }
  .pdfa-note-actions { display: flex; gap: 5px; margin-top: 6px; align-items: center; }
  .pdfa-note-actions .pdfa-spacer { flex: 1 1 auto; }

  .pdfa-btn { font: inherit; font-size: 12px; padding: 3px 9px; line-height: 1.25;
    border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit;
    border-radius: 5px; cursor: pointer; white-space: nowrap; }
  .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  /* Marks the "add a note" offer that the spec requires to appear as soon as a
     highlight is created, so it reads as the suggested next step. */
  .pdfa-btn-primary { border-color: var(--pdfa-accent); color: var(--pdfa-accent); }

  /* HIGHLIGHTS PANEL - the list of every highlight and its note. Groundwork for the
     Phase 5 color filter, which needs somewhere to filter. */
  .pdfa-panel { position: absolute; top: 0; right: 0; bottom: 0; width: 292px; max-width: 85%;
    background: var(--pdfa-toolbar); border-left: 1px solid var(--pdfa-border);
    overflow: auto; padding: 8px; display: none; z-index: 15; }
  .pdfa-panel.pdfa-open { display: block; }
  .pdfa-panel-title { display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; padding: 2px 4px 8px; }
  .pdfa-panel-empty { opacity: .7; padding: 6px 4px; font-size: 12px; line-height: 1.4; }
  .pdfa-hl-row { display: flex; gap: 8px; padding: 7px 6px; border-radius: 6px;
    cursor: pointer; align-items: flex-start; }
  .pdfa-hl-row:hover { background: var(--pdfa-btn-hover); }
  .pdfa-chip { width: 11px; height: 11px; border-radius: 3px; flex: 0 0 auto; margin-top: 3px; }
  .pdfa-hl-page { font-size: 11px; opacity: .6; margin-bottom: 2px; }
  .pdfa-hl-quote { font-size: 12px; line-height: 1.35; }
  /* Italic and indented so a note is never mistaken for the quoted text - the spec is
     explicit that the two must be clearly distinguishable. */
  .pdfa-hl-note { font-size: 12px; line-height: 1.35; opacity: .85; font-style: italic;
    margin-top: 4px; padding-left: 7px; border-left: 2px solid var(--pdfa-border); }
`;

/** Light and dark palettes, driven by `app.context.lightDarkMode`. */
const THEMES = {
  light: `--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;`,
  dark: `--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;`,
};

/**
 * @param {object} options
 * @param {string} options.attachmentUUID  Which PDF to load.
 * @param {string} options.attachmentName  Shown in the toolbar.
 * @param {number|null} options.page       Deep-link target page, if any.
 * @param {string|null} options.highlightId Deep-link target highlight, if any.
 * @param {string} options.lightDarkMode   "light" | "dark"
 * @param {string} options.pluginUUID      This plugin's own note uuid - needed to build
 *   the `plugin://` deep link in an exported highlight (src/export.js).
 */
export function buildEmbedHtml({
  attachmentUUID,
  attachmentName = "",
  page = null,
  highlightId = null,
  lightDarkMode = "light",
  pluginUUID = null,
} = {}) {
  const theme = THEMES[lightDarkMode] || THEMES.light;
  // The library URL travels in the config because the viewer loads PDF.js itself -
  // see the ordering note above.
  const config = {
    attachmentUUID,
    page,
    // Phase 5's exported links carry a highlight id. Scrolling to it is the same
    // primitive the panel already uses, so it costs nothing to honour now - and spec
    // section 7.3 warns that retrofitting the deep-link path later is the expensive way.
    highlightId,
    pluginUUID,
    pdfJsSrc: CDN.pdfJs,
    workerSrc: CDN.pdfJsWorker,
    // Loaded lazily, only when Download is clicked - see viewer.js's loadPdfLib.
    pdfLibSrc: CDN.pdfLib,
    // rgb (Phase 4) and cycleIndex (Phase 5) both now travel to the embed: Download
    // writes native annotations and Copy/Send/Export-all build export markdown, all
    // CLIENT-SIDE, reusing data already loaded rather than round-tripping through the
    // plugin bridge (which only reliably carries strings - see docs/api-notes.md).
    colors: HIGHLIGHT_COLORS.map((c) => ({
      id: c.id,
      label: c.label,
      hex: c.hex,
      rgb: c.rgb,
      cycleIndex: c.cycleIndex,
    })),
    defaultColorId: DEFAULT_COLOR_ID,
  };

  // The upstream stylesheet is linked BEFORE ours so our selection colour and safety
  // net win on equal specificity.
  return `<link rel="stylesheet" href="${CDN.pdfViewerCss}">
<style>:root{${theme}}${STYLES}</style>
<div id="pdfa-root">
  <div class="pdfa-toolbar">
    <!-- Identifies this viewer at a glance. Amplenote renders its OWN PDF preview for
         an attachment, and both can sit in the same note looking broadly similar; a
         reader had no reliable way to tell which one they were interacting with. -->
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-sep"></span>
    <button id="pdfa-prev" title="Previous page">&#8249;</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" title="Next page">&#8250;</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" title="Zoom out">&#8722;</button>
    <span class="pdfa-label" id="pdfa-zoom-label">125%</span>
    <button id="pdfa-zoom-in" title="Zoom in">+</button>
    <span class="pdfa-sep"></span>
    <!-- The four single-click highlight color buttons, mounted by the viewer from
         config.colors. Top-level toolbar buttons with no submenu is an explicit spec
         requirement (section 4), which is why the slot is here and not in a panel. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-hint" id="pdfa-hint"></span>
    <span class="pdfa-sep"></span>
    <button id="pdfa-list-toggle" title="Show highlights and notes">Notes (<span id="pdfa-count">0</span>)</button>
    <span class="pdfa-sep"></span>
    <!-- Bakes every highlight and note into the PDF as native annotations (verified
         against a real pdf-lib reload in the spike) and downloads the result. Spec
         section 4's "export/download the PDF with annotations baked in" - uploading it
         back to the note was the spec's own suggestion, not the requirement, and
         attachNoteMedia rejects PDFs outright (see docs/api-notes.md), so download is
         the whole feature, not a fallback. -->
    <button id="pdfa-download" title="Download this PDF with every highlight and note baked in as a native annotation">Download</button>
    <span class="pdfa-sep"></span>
    <!-- Auto-creates (or updates) a destination note holding every highlight, with a
         color filter - spec section 4's "export all highlights into an auto-created
         destination note, with the ability to filter by highlight color". -->
    <button id="pdfa-export" title="Export highlights to a note, optionally filtered by color">Export</button>
    <span class="pdfa-spacer"></span>
    <span class="pdfa-name">${escapeHtml(attachmentName)}</span>
  </div>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-body">
    <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
    <div class="pdfa-panel" id="pdfa-panel"></div>
  </div>
  <!-- Colors on a fresh selection; recolor / note / remove on an existing highlight;
       the note editor itself. One element, filled in per context by the viewer. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${safeJson(config)};
window.__PDFA_GEOM = (${createGeometry.toString()})();
window.__PDFA_ANNOTATIONS = (${createAnnotationWriter.toString()})();
window.__PDFA_EXPORT = (${createExportBuilder.toString()})();<\/script>
<script>(${viewerMain.toString()})();<\/script>`;
}
