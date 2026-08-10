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
 *      link. CONFIRMED LIVE working: the marker renders in the highlight's own color
 *      (distinct dot colors visible per highlight, cycle-color mapping visually
 *      consistent across coral and yellow in the same export), the link stays plain and
 *      clickable next to it.
 *   2. The bounty's "double-quoted block" means a doubly-NESTED blockquote, settled
 *      against the requirement's own diagram: the highlighted text sits visibly deeper
 *      than the user's note, i.e. `> >` for the quote and `>` for the note. An earlier
 *      reading - one `>` level plus literal `"` marks, hedging both senses of the phrase
 *      at once - was reported wrong live. There are no literal quote marks: the diagram
 *      shows none, and the nesting is what "double" refers to.
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
   *
   * `sourceNoteUUID` is what makes this link actually GO somewhere. Amplenote routes a
   * clicked `plugin://` link to a dedicated `linkTarget` action (confirmed live and via
   * Amplenote's own docs - NOT the same thing as the `<object data="plugin://...">`
   * embed tag, which `renderEmbed` handles) - `linkTarget` has to navigate to a note via
   * `app.navigate`, and that needs a note uuid from somewhere. Without it here, a clicked
   * export link has no note to go to at all.
   */
  function buildDeepLink(pluginUUID, attachmentUUID, page, highlightId, sourceNoteUUID) {
    var params = new URLSearchParams();
    if (attachmentUUID) params.set("att", attachmentUUID);
    if (Number.isFinite(page) && page >= 1) params.set("page", String(Math.floor(page)));
    if (highlightId) params.set("hl", highlightId);
    if (sourceNoteUUID) params.set("note", sourceNoteUUID);
    var query = params.toString();
    return "plugin://" + pluginUUID + (query ? "?" + query : "");
  }

  /**
   * Prefix every line of a block of text so it survives as one quote level.
   *
   * Splitting matters: quoted PDF text and user notes both legitimately contain newlines,
   * and a single prefix on the first line only would drop every following line straight
   * out of the blockquote. Trailing space is trimmed so a blank line inside the text
   * becomes a bare `>` rather than `> ` with nothing after it.
   */
  function prefixLines(text, prefix) {
    return String(text == null ? "" : text)
      .split(/\r?\n/)
      .map(function (line) {
        return (prefix + " " + line).replace(/[ \t]+$/, "");
      });
  }

  /**
   * One highlight's export block - see the file header for the format's reasoning.
   *
   *   ==●<!-- {"cycleColor":"N"} -->== [PDF name](deep link)
   *   > > the highlighted text
   *   >
   *   > the user's note, if any
   *
   * The lone `>` between them is load-bearing, not spacing. Without it, markdown's lazy
   * continuation pulls the note line back INTO the inner blockquote, so both render at
   * the same depth and the nesting the requirement's diagram shows is lost. Closing the
   * inner quote explicitly is what puts the note one level out.
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
   * @param sourceNoteUUID the note THIS highlight lives on - what `linkTarget` navigates
   *   to when the link is clicked. See buildDeepLink's own comment for why it's required.
   */
  function buildHighlightBlock(pdfName, pluginUUID, attachmentUUID, highlight, cycleIndex, sourceNoteUUID) {
    var url = buildDeepLink(pluginUUID, attachmentUUID, highlight.page, highlight.id, sourceNoteUUID);
    var linkText = escapeLinkText(pdfName || "PDF");
    // The filler character inside the colored marker is disposable - it exists only to
    // give the ==...== span something to color, never to be read as meaningful text.
    var marker = '==●<!-- {"cycleColor":"' + cycleIndex + '"} -->==';
    var heading = marker + " [" + linkText + "](" + url + ")";

    var lines = [heading].concat(prefixLines(highlight.quoteText, "> >"));
    if (highlight.note) {
      lines.push(">");
      lines = lines.concat(prefixLines(highlight.note, ">"));
    }
    return lines.join("\n");
  }

  function escapeHtml(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  /** Newlines inside quoted PDF text / a note have to survive as line breaks in HTML. */
  function htmlParagraph(text) {
    return "<p>" + escapeHtml(text).replace(/\r?\n/g, "<br>") + "</p>";
  }

  /**
   * The SAME block as buildHighlightBlock, as HTML rather than markdown - the clipboard
   * flavor, not a second format anyone reads.
   *
   * WHY THIS EXISTS: Amplenote's editor does not parse markdown out of pasted plain text
   * (docs/api-notes.md finding #7, confirmed again live for the Copy button specifically -
   * the exported block pasted in as literal `==●<!-- ... -->== [name](plugin://...)` and
   * `> >` characters, rendering nothing). Rich-text editors read `text/html` off the
   * clipboard instead, so Copy now puts BOTH flavors there: markdown as `text/plain` for
   * everything else, this as `text/html` for Amplenote.
   *
   * Structure mirrors the markdown exactly - marker + plain link, the quote nested twice,
   * the note one level out - so a pasted block and an exported one look the same.
   *
   * CONFIRMED LIVE: the paste renders - blockquote nesting, a clickable `plugin://`
   * anchor, and inline `color` AND `background-color` on a `<mark>` are all honoured.
   *
   * The marker is a `<span>` coloring the GLYPH, which is what matches the markdown path:
   * `==●<!-- {"cycleColor":"N"} -->==` renders as a small colored DOT, so Amplenote's
   * cycle-color mark paints the text, not a background behind it. Setting
   * background-color instead produced a colored rectangle here while an exported block a
   * few lines above it showed a plain dot - same plugin, same highlight, two
   * different-looking markers.
   *
   * `<mark>` was the obvious element for a thing called a highlight and it is the WRONG
   * one here: it drags along a background of its own that an inline
   * `background-color:transparent` did not override (tried live - the box got fainter,
   * not gone). A span has no such default, and there is nothing to suppress. Amplenote's
   * own editor has a text-color control, so a span carrying `color` has a mark to map onto.
   *
   * With no hex the marker is a bare `●` and no element at all - an uncolored wrapper
   * would only reintroduce the box this is here to avoid.
   */
  function buildHighlightHtml(pdfName, pluginUUID, attachmentUUID, highlight, hex, sourceNoteUUID) {
    var url = buildDeepLink(pluginUUID, attachmentUUID, highlight.page, highlight.id, sourceNoteUUID);
    var marker = hex
      ? '<span style="color:' + escapeHtml(hex) + '">&#9679;</span>'
      : "&#9679;";
    var heading =
      "<p>" + marker + ' <a href="' + escapeHtml(url) + '">' + escapeHtml(pdfName || "PDF") + "</a></p>";

    var quote = "<blockquote><blockquote>" + htmlParagraph(highlight.quoteText) + "</blockquote></blockquote>";
    var note = highlight.note ? "<blockquote>" + htmlParagraph(highlight.note) + "</blockquote>" : "";
    return heading + quote + note;
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
   * @param sourceNoteUUID the note every highlight here lives on - see buildDeepLink.
   * @returns {string} empty string if nothing matches the filter - callers decide how
   *   to handle "nothing to export" rather than this function guessing at a message.
   */
  function buildExportAllContent(
    pdfName,
    pluginUUID,
    attachmentUUID,
    highlights,
    colorCycleIndexTable,
    colorFilter,
    sourceNoteUUID
  ) {
    var filterSet = colorFilter && colorFilter.length ? colorFilter : null;
    var filtered = (highlights || []).filter(function (h) {
      return h && (!filterSet || filterSet.indexOf(h.color) !== -1);
    });
    var sorted = sortForReading(filtered);

    var blocks = sorted.map(function (h) {
      var cycleIndex = colorCycleIndexTable ? colorCycleIndexTable[h.color] : undefined;
      return buildHighlightBlock(pdfName, pluginUUID, attachmentUUID, h, cycleIndex, sourceNoteUUID);
    });
    return blocks.join("\n\n");
  }

  return {
    buildDeepLink: buildDeepLink,
    buildHighlightBlock: buildHighlightBlock,
    buildHighlightHtml: buildHighlightHtml,
    buildExportAllContent: buildExportAllContent,
  };
}

// Module-facing bindings - same function objects the embed gets. See the header note.
const exportBuilder = createExportBuilder();

export const buildDeepLink = exportBuilder.buildDeepLink;
export const buildHighlightBlock = exportBuilder.buildHighlightBlock;
export const buildHighlightHtml = exportBuilder.buildHighlightHtml;
export const buildExportAllContent = exportBuilder.buildExportAllContent;
