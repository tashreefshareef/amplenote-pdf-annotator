/**
 * Builds the HTML string returned by `renderEmbed`.
 *
 * The toolbar already reserves the slot where Phase 2's four single-click color buttons
 * go — the spec is explicit that they must be top-level toolbar buttons, not a dropdown
 * or sidebar, so the layout is designed for them from the start.
 *
 * SCRIPT LOADING — two live failures are baked into the shape of this file:
 *
 * 1. The viewer must NOT be attached as an `onload="..."` attribute. Its source is full
 *    of double quotes, which terminate the HTML attribute at the first one, so it never
 *    runs at all. The symptom is indistinguishable from a hang: the static "Loading..."
 *    markup just sits there.
 *
 * 2. PDF.js must NOT be a plain `<script src>` here. Amplenote re-executes the embed's
 *    inline scripts immediately while an external script is still downloading, so the
 *    viewer ran before the library existed. The viewer therefore loads PDF.js itself
 *    and waits for onload — the sequence proven to work in the live app.
 */
import { CDN } from "../constants.js";
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
  .pdfa-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid var(--pdfa-border); background: var(--pdfa-toolbar); flex: 0 0 auto; flex-wrap: wrap; }
  .pdfa-toolbar button { font: inherit; padding: 4px 9px; border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit; border-radius: 5px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
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

  /* Text layer: invisible glyphs positioned exactly over the canvas. It must stay
     selectable — this is what Phase 2 reads selection geometry from. Mirrors PDF.js's
     own pdf_viewer.css; deviate from it carefully.

     --scale-factor is set per page in JS to match the render scale. It is NOT declared
     here: a static value silently offsets every span from the glyph it covers, which
     presents as selection hitting the wrong text or nothing at all.

     OPACITY GOES ON THE CONTAINER, and the selection colour is OPAQUE. This ordering
     matters and is not cosmetic. Span boxes are slightly taller than their glyphs, so
     spans on consecutive lines overlap; if each painted its own translucent selection,
     the alpha would compound and leave dark seams between lines. Group opacity forces
     the browser to composite all spans into one buffer first, then fade the result —
     giving the flat, even selection the native viewers show. */
  .pdfa-textlayer { position: absolute; inset: 0; overflow: hidden; line-height: 1;
    text-align: initial; text-size-adjust: none; forced-color-adjust: none;
    transform-origin: 0 0; opacity: 0.3; }
  .pdfa-textlayer > span { color: transparent; position: absolute; white-space: pre;
    cursor: text; transform-origin: 0% 0%; }
  .pdfa-textlayer > span::selection { background: #1a73e8; }
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
 * @param {string} options.lightDarkMode   "light" | "dark"
 */
export function buildEmbedHtml({ attachmentUUID, attachmentName = "", page = null, lightDarkMode = "light" } = {}) {
  const theme = THEMES[lightDarkMode] || THEMES.light;
  // The library URL travels in the config because the viewer loads PDF.js itself —
  // see the ordering note above.
  const config = {
    attachmentUUID,
    page,
    pdfJsSrc: CDN.pdfJs,
    workerSrc: CDN.pdfJsWorker,
  };

  return `<style>:root{${theme}}${STYLES}</style>
<div id="pdfa-root">
  <div class="pdfa-toolbar">
    <!-- Identifies this viewer at a glance. Amplenote renders its OWN PDF preview for
         an attachment, and both can sit in the same note looking broadly similar; a
         reader had no reliable way to tell which one they were interacting with. -->
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-sep"></span>
    <button id="pdfa-prev" title="Previous page">&#8249;</button>
    <span class="pdfa-label" id="pdfa-page-label">– / –</span>
    <button id="pdfa-next" title="Next page">&#8250;</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" title="Zoom out">&#8722;</button>
    <span class="pdfa-label" id="pdfa-zoom-label">125%</span>
    <button id="pdfa-zoom-in" title="Zoom in">+</button>
    <span class="pdfa-sep"></span>
    <!-- Phase 2 mounts the four single-click highlight color buttons here. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-spacer"></span>
    <span class="pdfa-name">${escapeHtml(attachmentName)}</span>
  </div>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
</div>
<script>window.__PDFA_CONFIG = ${safeJson(config)};<\/script>
<script>(${viewerMain.toString()})();<\/script>`;
}
