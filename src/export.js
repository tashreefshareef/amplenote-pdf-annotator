/**
 * Builds the markdown for exporting a highlight (or every highlight) back into an
 * Amplenote note, and the deep-link that reopens the viewer at the exact highlight.
 *
 * FINDINGS THIS FILE DEPENDS ON, neither knowable from the spec alone:
 *
 *   1. Amplenote has no "colored link" markdown as a first-class construct, and - found
 *      live, not documented anywhere - a highlight/mark span and a markdown link do not
 *      compose AT ALL, in either nesting order. Both were tried and both confirmed live,
 *      through the plugin's own write path (app.insertNoteContent via "Send to note" and
 *      "Export all" - a manual paste into Amplenote's editor does NOT reliably trigger
 *      markdown parsing at all, so that route is not valid evidence either way):
 *        - `==[text](url)<!--json-->==` (mark wrapping a link) -> plain, uncolored link.
 *        - `[==text<!--json-->==](url)` (link wrapping a mark) -> ALSO a plain,
 *          uncolored link, identically to the first order.
 *      Since neither order works, color and link are DECOUPLED entirely: a small colored
 *      marker using the exact syntax Amplenote's own docs show working standalone -
 *      `==●<!-- {"cycleColor":"14"} -->==`, the character being disposable filler
 *      text, not a link - immediately followed by a plain, separate `[PDF name](url)`
 *      link. Each piece individually is the one thing proven, more than once, to render
 *      correctly on its own; nothing here asks Amplenote to do the one thing it won't.
 *      Still needs a final live check once shipped - the marker itself was never
 *      isolated and tested alone, only ever in combination with a link.
 *   2. The bounty's "double-quoted block" has no worked example anywhere - not in the
 *      spec, not in the live requirements note (checked directly). Interpreted here as
 *      literally both senses at once: a markdown blockquote (`>`, matching Amplenote's
 *      GFM-based syntax) around the highlighted text, ALSO wrapped in literal double
 *      quotes - satisfying "double-quoted" either way it's read. Confirmed live: this
 *      part renders correctly (blockquote formatting, literal quote marks visible).
 *
 * The four cycle-color indices (12/14/15/18) are the bounty's own stated values
 * (constants.js), used as given - independent verification against the live color
 * chart was attempted but inconclusive for one of the four (see docs/bugs-found.md
 * if that entry exists, or the session notes); worth the same live sanity check.
 *
 * WHY THIS FILE HAS THE SAME SHAPE AS geometry.js AND annotations.js
 *
 * "Copy" writes straight to the clipboard from inside the embed, and "Export all" /
 * "Send to note" both need the exact same block text the embed already has everything
 * to build (the highlight, the PDF's name, the plugin's own UUID) - no reason to round
 * -trip that assembly through the plugin bridge, which only reliably carries strings
 * anyway. So this factory is injected into the embed via `.toString()`, the same
 * pattern as the other two, read back off `window.__PDFA_EXPORT`. It closes over
 * nothing and imports nothing, so the exact same code runs here and in Jest.
 */
export function createExportBuilder() {
  /**
   * Escape the one character that would break `[text](url)` link syntax if it appeared
   * in a PDF's filename - `]` closes the link's text segment early. Nothing else in a
   * filename is markdown-special in this position.
   */
  function escapeLinkText(text) {
    return String(text == null ? "" : text).replace(/\]/g, "\\]");
  }

  /**
   * The query string travels through `URLSearchParams`, same technique as
   * `buildEmbedArgs` (src/embed-args.js) - not imported from there, because this whole
   * module has to run with no imports at all (see the file header). Keeping the same
   * technique in both places, even duplicated, is what keeps them from silently
   * drifting apart if the encoding ever needs to change.
   */
  function buildDeepLink(pluginUUID, attachmentUUID, page, highlightId) {
    var params = new URLSearchParams();
    if (attachmentUUID) params.set("att", attachmentUUID);
    if (Number.isFinite(page) && page >= 1) params.set("page", String(Math.floor(page)));
    if (highlightId) params.set("hl", highlightId);
    var query = params.toString();
    return "plugin://" + pluginUUID + (query ? "?" + query : "");
  }

  /**
   * One highlight's export block - see the file header for the format's reasoning.
   *
   *   ==●<!-- {"cycleColor":"N"} -->== [PDF name](deep link)
   *   > "the highlighted text"
   *   the user's note, if any
   *
   * The color and the link are two SEPARATE constructs on the same line, not one
   * construct trying to be both - a highlight/mark span cannot contain a markdown link
   * in either nesting order (confirmed live, see the file header). The marker character
   * itself carries the color; the link right after it carries the PDF name and stays
   * fully plain, which is the one combination proven to render correctly.
   *
   * @param pdfName        the attachment's display name - required element per spec §4.
   * @param pluginUUID     this plugin's own note uuid, for the `plugin://` link.
   * @param attachmentUUID which PDF the deep link should open.
   * @param highlight      { id, page, quoteText, note, color }.
   * @param cycleIndex     Amplenote cycle-color index matching the highlight's color.
   */
  function buildHighlightBlock(pdfName, pluginUUID, attachmentUUID, highlight, cycleIndex) {
    var url = buildDeepLink(pluginUUID, attachmentUUID, highlight.page, highlight.id);
    var linkText = escapeLinkText(pdfName || "PDF");
    // The filler character inside the colored marker is disposable - it exists only to
    // give the ==...== span something to color, never to be read as meaningful text.
    var marker = '==●<!-- {"cycleColor":"' + cycleIndex + '"} -->==';
    var heading = marker + " [" + linkText + "](" + url + ")";
    var quote = '> "' + (highlight.quoteText || "") + '"';

    var lines = [heading, quote];
    if (highlight.note) lines.push(highlight.note);
    return lines.join("\n");
  }

  /**
   * Sorted the way a reader moves through the document - page, then position on the
   * page - not creation order. Same ordering the highlights panel uses (viewer.js), and
   * for the same reason: a human is going to read this note top to bottom.
   */
  function sortForReading(highlights) {
    return highlights.slice().sort(function (a, b) {
      if (a.page !== b.page) return a.page - b.page;
      var ay = a.rects && a.rects[0] ? a.rects[0].y : 0;
      var by = b.rects && b.rects[0] ? b.rects[0].y : 0;
      return by - ay; // PDF Y increases upward, so higher y is nearer the top.
    });
  }

  /**
   * Every highlight (optionally filtered by color) as one document, blocks separated
   * by a blank line so consecutive blockquotes stay visually and structurally distinct
   * rather than reading as one continuous quote.
   *
   * @param colorFilter Set/array of color ids to include, or null/empty for "all colors".
   * @param colorCycleIndexTable { [colorId]: cycleIndex }.
   * @returns {string} empty string if nothing matches the filter - callers decide how
   *   to handle "nothing to export" rather than this function guessing at a message.
   */
  function buildExportAllContent(
    pdfName,
    pluginUUID,
    attachmentUUID,
    highlights,
    colorCycleIndexTable,
    colorFilter
  ) {
    var filterSet = colorFilter && colorFilter.length ? colorFilter : null;
    var filtered = (highlights || []).filter(function (h) {
      return h && (!filterSet || filterSet.indexOf(h.color) !== -1);
    });
    var sorted = sortForReading(filtered);

    var blocks = sorted.map(function (h) {
      var cycleIndex = colorCycleIndexTable ? colorCycleIndexTable[h.color] : undefined;
      return buildHighlightBlock(pdfName, pluginUUID, attachmentUUID, h, cycleIndex);
    });
    return blocks.join("\n\n");
  }

  return {
    buildDeepLink: buildDeepLink,
    buildHighlightBlock: buildHighlightBlock,
    buildExportAllContent: buildExportAllContent,
  };
}

// Module-facing bindings - same function objects the embed gets. See the header note.
const exportBuilder = createExportBuilder();

export const buildDeepLink = exportBuilder.buildDeepLink;
export const buildHighlightBlock = exportBuilder.buildHighlightBlock;
export const buildExportAllContent = exportBuilder.buildExportAllContent;
