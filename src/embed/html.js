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
import {
  CDN,
  HIGHLIGHT_COLORS,
  DEFAULT_TOOLBAR_COLOR_IDS,
  MARK_STYLES,
  DEFAULT_MARK_STYLE,
} from "../constants.js";
import { defaultColorIdFor } from "../colors.js";
// Its own module so the build can minify it - see the header there. Jest imports this
// path and gets the readable original; only the bundle gets the compressed one.
import { STYLES } from "./styles.js";
import { ICONS, MENU_ICONS, icon } from "./icons.js";
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
 * @param {string} options.noteUUID        The note THIS embed lives in, captured by
 *   plugin.js at renderEmbed time - see the config field below for why.
 * @param {boolean} options.collapsed      Whether the user last left this viewer
 *   collapsed, read from the embed tag's own args.
 */
export function buildEmbedHtml({
  attachmentUUID,
  attachmentName = "",
  page = null,
  highlightId = null,
  lightDarkMode = "light",
  pluginUUID = null,
  noteUUID = null,
  collapsed = false,
  // Which of the catalog's colors get the toolbar's four circles, from the plugin's
  // `Highlight colors` setting (parsed plugin-side - see plugin.js). Defaulted here as
  // well as there so a caller that knows nothing about settings - a test, the harness -
  // still gets the spec's four rather than an empty bar.
  toolbarColorIds = DEFAULT_TOOLBAR_COLOR_IDS,
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
    // Sent back on every embed-call request (see viewer.js) instead of trusting
    // onEmbedCall's own `app.context.noteUUID` to still point at the right note after
    // the embed remounts (switching notes away and back) - suspected of going stale in
    // that scenario, which read as "highlights disappeared" even though they were still
    // correctly saved in the note.
    noteUUID,
    pdfJsSrc: CDN.pdfJs,
    workerSrc: CDN.pdfJsWorker,
    // Loaded lazily, only when Download is clicked - see viewer.js's loadPdfLib.
    pdfLibSrc: CDN.pdfLib,
    // rgb travels with each color because Download writes native annotations CLIENT-SIDE,
    // reusing data already loaded rather than round-tripping through the plugin bridge
    // (which only reliably carries strings - see docs/api-notes.md). The hex serves both
    // the swatch and the exported link's background.
    //
    // cycleIndex used to ride along too, for the export marker. It named Amplenote's
    // cycle-color node, which brought an underline under every exported link - the marker
    // is a plain background hex now, so nothing here needs the index. It stays recorded in
    // constants.js, where the verified mapping is the reference for a colored-TEXT marker.
    //
    // THE WHOLE CATALOG travels, not just the four on the toolbar, and the distinction is
    // load-bearing. This list is what RESOLVES a highlight - the fill drawn on the page,
    // the hex behind an exported link, the rgb written into a downloaded PDF. A note can
    // hold highlights in colors the user has since dropped from their bar, and those must
    // keep rendering in the color they were made in. Send only the four and every one of
    // them fails lookup and gets silently repainted the default (highlights.js normalizes
    // through `findColor(color) || defaultColor()`), which is data loss disguised as a
    // preference change.
    colors: HIGHLIGHT_COLORS.map((c) => ({
      id: c.id,
      label: c.label,
      hex: c.hex,
      rgb: c.rgb,
    })),
    // ...and which of them get circles. Display only - nothing resolves through this.
    toolbarColorIds,
    defaultColorId: defaultColorIdFor(toolbarColorIds),
    // The three mark shapes, for the toolbar group and the popover's shape row. Whole list
    // for the same reason the whole color catalog travels: this is what RESOLVES a stored
    // mark, and a shape missing from it would paint as something the record does not say.
    // Unlike the colors there is no user-configurable subset - three shapes is the set.
    markStyles: MARK_STYLES.map((s) => ({ id: s.id, label: s.label })),
    defaultMarkStyle: DEFAULT_MARK_STYLE,
    // The popovers are built at runtime by viewer.js, which is serialized standalone and
    // can import nothing - so its icons travel as data, the same way the colors do.
    icons: MENU_ICONS,
    // Lets the viewer skip booting PDF.js while collapsed - nothing it renders is visible.
    collapsed,
    // Also in the config, not just the markup above: the viewer needs it as DATA to build
    // export blocks and the destination note's name, not only as text on screen.
    attachmentName,
  };

  // Starts expanded UNLESS this user collapsed this viewer themselves. Defaulting every
  // embed to collapsed - so annotating always began with an extra "Open" click - was
  // tried and explicitly rejected live; honouring a collapse the user chose is the
  // opposite case. The state has to be re-applied here rather than kept in the embed
  // because collapsing rewrites the tag to shrink the box, and that re-renders the embed
  // from scratch.
  return `<link rel="stylesheet" href="${CDN.pdfViewerCss}">
<link rel="stylesheet" href="${escapeHtml(CDN.robotoCss)}">
<style>:root{${theme}}${STYLES}</style>
<div id="pdfa-root"${collapsed ? ' class="pdfa-collapsed-mode"' : ""}>
  <div class="pdfa-collapsed">
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-collapsed-name">${escapeHtml(attachmentName)}</span>
    <span class="pdfa-spacer"></span>
    <span class="pdfa-collapsed-count" id="pdfa-collapsed-count"></span>
    <button id="pdfa-open" class="pdfa-btn pdfa-btn-primary">Expand</button>
  </div>
  <!-- NO BRAND LABEL HERE, deliberately, and it used to be the first thing in this bar.
       It was carrying a real job - Amplenote renders its OWN PDF preview for an
       attachment, both can sit in the same note, and a reader had no reliable way to tell
       which one they were touching. What changed is the bar around it: with page, zoom,
       shape, colour and notes controls in it, the expanded viewer no longer resembles a
       static preview, while the COLLAPSED bar - a thin strip with a filename on it - is
       where that confusion actually lives, and still carries the name above.

       The other half of the reason is width, measured rather than felt: the bar came to
       ~736px against a ~700px note column, so the overflow menu wrapped onto a second
       row. The label was 82px of that, its divider another 15. -->
  <div class="pdfa-toolbar">
    <!-- Material Icons (icons.js), the set Amplenote's own toolbar is drawn in. Icon-only
         buttons, so each carries an aria-label as well as its tooltip. -->
    <!-- Grouped WITH the pager rather than divided from it: both answer "which page am I
         on", so they read as one control and save a divider doing it. -->
    <button id="pdfa-thumbs-toggle" class="pdfa-icon-btn" title="Show page thumbnails"
            aria-label="Show page thumbnails">${icon(ICONS.sidebar)}</button>
    <button id="pdfa-prev" class="pdfa-icon-btn" title="Previous page"
            aria-label="Previous page">${icon(ICONS.chevronLeft)}</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" class="pdfa-icon-btn" title="Next page"
            aria-label="Next page">${icon(ICONS.chevronRight)}</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" class="pdfa-icon-btn" title="Zoom out"
            aria-label="Zoom out">${icon(ICONS.remove)}</button>
    <!-- An input, not the label it looks like. The stepper moves in fixed 25% jumps from
         wherever the initial fit-to-width landed, so an exact zoom - "100%" - was often
         not reachable at all, only bracketed: from a fitted 83% the steps run 58/108/133.
         It still READS as a label (transparent, centred, no spinner) until it is focused,
         so nothing about the toolbar's shape changes for someone who only ever clicks the
         buttons. type=text, not number: number brings spinner arrows this bar has no room
         for and rejects the "%" people naturally type; inputmode gets the numeric keypad
         on a phone anyway. -->
    <input id="pdfa-zoom-label" class="pdfa-label pdfa-zoom-field" type="text"
           inputmode="numeric" autocomplete="off" spellcheck="false"
           aria-label="Zoom level in percent"
           title="Zoom level - type a percentage and press Enter" value="125%">
    <button id="pdfa-zoom-in" class="pdfa-icon-btn" title="Zoom in"
            aria-label="Zoom in">${icon(ICONS.add)}</button>
    <span class="pdfa-sep"></span>
    <!-- WHICH SHAPE the swatches paint: highlight, underline or strikethrough. A group of
         pressed-state buttons holding one active shape, the way Amplenote's own H2 button
         holds "the cursor is in a heading" - not a dropdown. The alternative designs were
         a single button opening a three-item menu (cheaper in bar width, but it hides the
         state that decides what your next click does behind a glyph you have to open a
         menu to read) and two extra verb buttons with no mode at all (which cannot work
         here: a swatch APPLIES on click when there is a selection, so by the time you
         reached the underline button the phrase would already be highlighted).
         Deliberately BEFORE the colors, reading left to right as "underline, in green". -->
    <span id="pdfa-styles"></span>
    <!-- NO DIVIDER between shape and colour. They are two halves of one answer - "an
         underline, in green" - and the bar reads left to right as that sentence. The
         dividers that remain separate things that genuinely are separate; there were six
         of them, which at 15px each (a 1px rule plus its margins) was 90px spent on
         punctuation in a bar that had run out of room. -->
    <!-- The four single-click highlight color buttons, mounted by the viewer from
         config.toolbarColorIds (which four) resolved against config.colors (the whole
         catalog). Top-level toolbar buttons with no submenu is an explicit spec
         requirement (section 4), which is why the slot is here and not in a panel. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-hint" id="pdfa-hint"></span>
    <span class="pdfa-sep"></span>
    <!-- The list glyph replaces the word "Notes"; the count stays, since that is the part
         the word was not carrying. -->
    <button id="pdfa-list-toggle" class="pdfa-icon-btn pdfa-notes-btn"
            title="Show highlights and notes" aria-label="Show highlights and notes"
            >${icon(ICONS.listBulleted)}<span class="pdfa-count" id="pdfa-count">0</span></button>
    <!-- Download, Export and Remove are all occasional, one-off actions - unlike the
         colors (top-level is an explicit spec requirement) or page/zoom/Notes (used
         constantly while reading) - so they live behind one overflow menu instead of
         three permanent buttons competing for space in an embed that's often barely
         wider than a page. Nothing here is spec-mandated to be top-level; this is our
         own toolbar design, not an Amplenote requirement. Grouped with the other
         controls on the left, not off by the filename, so it reads as part of the
         toolbar rather than a stray button wrapped onto its own line. -->
    <button id="pdfa-more" class="pdfa-icon-btn" title="More actions"
            aria-label="More actions">${icon(ICONS.moreVert)}</button>
  </div>
  <!-- The filename used to have a whole row to itself here. It was removed: Amplenote's
       own attachment chip sits immediately above this embed carrying the SAME filename
       (that is where insertViewer places the viewer, directly beneath its chip), so the
       row was showing the name a second time within about 30px of the first - visible on
       both desktop and phone. It cost a full row of the box on every screen to do it.
       The name is still on the collapsed bar, and now heads the overflow menu, so it is
       never more than one tap away for a viewer that has been moved away from its chip.
       Kept as a hidden element rather than deleted so setAttachmentName has one code
       path and the export/download names cannot silently diverge from what is shown. -->
  <span class="pdfa-name" hidden></span>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-body">
    <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
    <!-- Page thumbnails. A floating card OVERLAYING from the left, not a rail that takes
         width: this embed is often barely wider than one page, so a panel that pushed
         would reflow the whole document every time it opened. Same treatment the
         highlights panel arrived at for the same reason - see .pdfa-panel in styles.js.
         It takes turns with that panel rather than sharing the box with it; two cards on
         a 700px embed leave a sliver of page between them. -->
    <!-- The card CLIPS, the child inside it SCROLLS. Two elements rather than one because
         a classic scrollbar is not clipped to its own container's border-radius - see
         .pdfa-panel in styles.js for the whole reason. -->
    <div class="pdfa-thumbs" id="pdfa-thumbs">
      <div class="pdfa-thumbs-scroll" id="pdfa-thumbs-scroll"></div>
    </div>
    <div class="pdfa-panel" id="pdfa-panel">
      <div class="pdfa-panel-scroll" id="pdfa-panel-scroll"></div>
    </div>
    <!-- Touch-only scroll controls. Deliberately AFTER the panel so the sibling
         selector that hides them behind it works - see the CSS. -->
    <div class="pdfa-scrollnav">
      <button id="pdfa-scroll-up" title="Scroll up" aria-label="Scroll up">${icon(ICONS.arrowUp)}</button>
      <button id="pdfa-scroll-down" title="Scroll down" aria-label="Scroll down">${icon(ICONS.arrowDown)}</button>
    </div>
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
