/**
 * Builds the markdown for exporting a highlight (or every highlight) back into an
 * Amplenote note, and the deep-link that reopens the viewer at the exact highlight.
 *
 * FINDINGS THIS FILE DEPENDS ON, neither knowable from the spec alone:
 *
 *   1. A colored link IS expressible, as link-wrapping-mark using the EXPLICIT `<mark>`
 *      element, and the color has to be a BACKGROUND to be visible at all:
 *
 *        [<mark style="background-color:#F3998C;">name</mark>](url)
 *
 *      Read straight out of a note where the formatting had been applied by hand with
 *      Amplenote's own toolbar and dumped back with src/actions/dump-markdown.js, so it
 *      is Amplenote's own serialization rather than anything inferred.
 *
 *      Two separate keys exist and only one of them does anything to a link:
 *      `cycleColor` sets TEXT color, `backgroundCycleColor` sets the highlight
 *      background. Applying a text color to a link changes nothing visible - the
 *      anchor's own color wins - while a highlight shows through. Since the requirement
 *      asks for the link to be "highlighted" in the matching color, this is the
 *      background key, not the text one.
 *
 *      AND THE `<!-- {"backgroundCycleColor":"N"} -->` COMMENT IS BACK, having been
 *      dropped for one release because it draws an UNDERLINE under the exported link.
 *      Reported live at the time: an exported block and a pasted one, same highlight,
 *      same note, one underlined and one not. A dump of that note settled it - the two
 *      stored lines were identical apart from the comment:
 *
 *        [<mark style="background-color:#F4DE6C;">name<!-- {"backgroundCycleColor":"14"}
 *          --></mark>](url)      <- underlined
 *        [<mark style="background-color:#BBE077;">name</mark>](url)   <- not
 *
 *      The comment names Amplenote's cycle-color node, and that node brings its own link
 *      decoration - that part still holds. What changed is which cost turned out to be
 *      bigger. A plain background mark paints the SAME literal hex regardless of the
 *      note's theme; the cycle-color node does not - Amplenote repaints its own reference
 *      chart for cycle color 12 as a muted, dark-appropriate rust in a dark-themed note,
 *      nothing like the bright coral it shows in a light one (compared pixel-for-pixel
 *      against Amplenote's own published light/dark "Index of Cycle Colors" charts). A
 *      fixed inline hex skips that theme handling entirely, so the light-tuned palette
 *      this file uses went straight to illegible white-on-lime-green in a dark-themed
 *      note - reported live, screenshot in hand. An underline is cosmetic; unreadable
 *      link text is not, so the comment is worth restoring even though it re-adds the
 *      decoration.
 *
 *      The cycle indices were already recorded in constants.js the whole time this was
 *      dropped - they never stopped being how a colored TEXT marker would be written
 *      (`data-text-color`), and now they are also how the background one is again.
 *
 *      SUPERSEDES an earlier finding that a mark and a link "do not compose AT ALL, in
 *      either nesting order". That was tested with the `==...==` shorthand
 *      (`==[text](url)<!--json-->==` and `[==text<!--json-->==](url)`, both of which
 *      really do come back plain) and generalized to marks as a whole, which was too
 *      strong: the shorthand and the element are not interchangeable here. It forced a
 *      workaround - a colored `●` next to a plain link - that the requirement never
 *      asked for and that is now gone.
 *   2. The bounty's "double-quoted block" means a doubly-NESTED blockquote, settled
 *      against the requirement's own diagram: the highlighted text sits visibly deeper
 *      than the user's note, i.e. `> >` for the quote and `>` for the note. An earlier
 *      reading - one `>` level plus literal `"` marks, hedging both senses of the phrase
 *      at once - was reported wrong live. There are no literal quote marks: the diagram
 *      shows none, and the nesting is what "double" refers to.
 *
 * The four cycle-color indices (12/14/15/18) are the bounty's own stated values
 * (constants.js). Index 15 is now CONFIRMED to be exactly the green in that table:
 * Amplenote's own clipboard output for an exported marker came back as
 * `<mark data-text-color="15" style="color: #BBE077;">`, resolving the index to the hex
 * we already had. The other three come from the same source.
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
   * Escape what would break the link's `[text]` segment if it appeared in a PDF's
   * filename: `]` closes that segment early, and `<` now matters too because the name no
   * longer sits in plain link text - it sits INSIDE a `<mark>` element, where a stray `<`
   * starts a tag. `&` is deliberately left alone: a bare ampersand in a filename renders
   * fine, and escaping it would show a literal `&amp;` in every name containing one.
   */
  function escapeLinkText(text) {
    return String(text == null ? "" : text)
      .replace(/\]/g, "\\]")
      .replace(/</g, "&lt;");
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
   * The PDF's name wearing the highlight's own color, as the text of the deep link.
   *
   * The `<mark>` is the ELEMENT form, not the `==...==` shorthand, which does not compose
   * with a link, and the color is a BACKGROUND, because a text color on a link is
   * invisible - the anchor's own color wins.
   *
   * The `<!-- {"backgroundCycleColor":"N"} -->` comment names Amplenote's cycle-color
   * node, which brings an underline under the link (file header finding 1) - a cosmetic
   * cost worth paying so Amplenote renders the background itself, in whatever shade its
   * current theme pairs with readable link text. A plain inline hex looked identical in
   * light mode but painted the same literal color in a dark-themed note too, where
   * Amplenote's own reference chart shows this same index rendering much darker - a
   * fixed hex skips that and reads as pale text on a pale background.
   *
   * Falls back to a plain, uncolored name when there is no hex - an uncolored link beats
   * a broken one. Falls back to the inline-only form when there is no cycleIndex either
   * (an older config, or a color missing one), rather than emitting a comment that names
   * nothing.
   */
  function colorizeLinkText(linkText, hex, cycleIndex) {
    if (!hex) return linkText;
    var comment = cycleIndex != null ? '<!-- {"backgroundCycleColor":"' + cycleIndex + '"} -->' : "";
    return '<mark style="background-color:' + hex + ';">' + linkText + comment + "</mark>";
  }

  /**
   * One highlight's export block - see the file header for the format's reasoning.
   *
   *   [<mark style="background-color:#F3998C;">PDF name<!--
   *     {"backgroundCycleColor":"12"} --></mark>](deep link)
   *   > > the highlighted text
   *   >
   *   > the user's note, if any
   *
   * The lone `>` between them is load-bearing, not spacing. Without it, markdown's lazy
   * continuation pulls the note line back INTO the inner blockquote, so both render at
   * the same depth and the nesting the requirement's diagram shows is lost. Closing the
   * inner quote explicitly is what puts the note one level out.
   *
   * THE LINK ITSELF carries the color, which is what spec §4 asks for - "this link should
   * be highlighted in the Amplenote-supported color that corresponds to that highlight's
   * color". An earlier version put a colored `●` next to a plain link instead, on a
   * finding that marks and links cannot compose; that finding was too strong (header),
   * and the dot was a workaround for a limitation that does not exist.
   *
   * @param pdfName        the attachment's display name - required element per spec §4.
   * @param pluginUUID     this plugin's own note uuid, for the `plugin://` link.
   * @param attachmentUUID which PDF the deep link should open.
   * @param highlight      { id, page, quoteText, note, color }.
   * @param hex            the highlight color's hex, worn by the link as a background.
   * @param cycleIndex     that color's Amplenote cycle index, naming the background node
   *   so Amplenote repaints it per-theme (see colorizeLinkText). Omit for a plain,
   *   theme-fixed background instead.
   * @param sourceNoteUUID the note THIS highlight lives on - what `linkTarget` navigates
   *   to when the link is clicked. See buildDeepLink's own comment for why it's required.
   */
  function buildHighlightBlock(pdfName, pluginUUID, attachmentUUID, highlight, hex, cycleIndex, sourceNoteUUID) {
    var url = buildDeepLink(pluginUUID, attachmentUUID, highlight.page, highlight.id, sourceNoteUUID);
    var linkText = colorizeLinkText(escapeLinkText(pdfName || "PDF"), hex, cycleIndex);
    var heading = "[" + linkText + "](" + url + ")";

    // THE EXTRA LEVEL EXISTS TO SEPARATE THE QUOTE FROM THE NOTE, so a highlight with no
    // note does not get it. This used to emit "> >" either way, and Amplenote rendered
    // those two blocks at DIFFERENT depths - a note-less block came back as a single bar,
    // because the app collapses an outer quote whose only child is another quote, while a
    // block with a note kept both. Reported live from a note holding one of each: same
    // export, two different shapes, and nothing in the note explaining why.
    //
    // Single-level is also what spec section 4's own diagram draws ("> the highlighted
    // text"), so this is the app and the requirement agreeing.
    var lines = [heading].concat(prefixLines(highlight.quoteText, highlight.note ? "> >" : ">"));
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
   * the exported block pasted in as its literal markdown characters - the mark syntax and
   * `> >` characters, rendering nothing). Rich-text editors read `text/html` off the
   * clipboard instead, so Copy now puts BOTH flavors there: markdown as `text/plain` for
   * everything else, this as `text/html` for Amplenote.
   *
   * Structure mirrors the markdown exactly - the colored link, the quote nested twice,
   * the note one level out - so a pasted block and an exported one look the same.
   *
   * CONFIRMED LIVE: the paste renders - blockquote nesting, a clickable `plugin://`
   * anchor, and an inline `background-color` on a `<mark>`, which arrives as a colored
   * box. That box is the whole point NOW; it was the bug when this marker was a `●` that
   * was supposed to be a bare colored dot, and a long detour went into trying to remove
   * it. Amplenote maps a pasted `<mark>` onto its HIGHLIGHT node unless the markup names
   * a different one, and a highlighted link is exactly what spec §4 asks for.
   *
   * (For the record, since it cost five rounds to learn: the text-color node is named by
   * `data-text-color="N"`, which Amplenote's own clipboard output carries -
   * `<mark data-text-color="15" style="color: #BBE077;">`. Nothing here needs it, but a
   * future marker wanting colored TEXT rather than a highlight does. The general lesson
   * is in docs/bugs-found.md: pasted markup is mapped onto a document schema, so inline
   * CSS is not styling - it is a hint about WHICH NODE you meant.)
   *
   * STILL A PLAIN INLINE HEX, UNLIKE buildHighlightBlock's markdown form - deliberately,
   * not an oversight. The markdown fix for the dark-mode contrast bug (file header) relies
   * on the confirmed `backgroundCycleColor` JSON-comment syntax; the HTML/paste equivalent
   * would presumably be a `data-background-color="N"` attribute (api-notes.md 9b lists it
   * as an existing index, by inference from the sibling `data-text-color` one), but that
   * has never actually been round-tripped through Amplenote's own clipboard the way
   * `data-text-color` was - and guessing at pasted-markup attributes is the exact mistake
   * that cost five rounds elsewhere in this file. So Copy still carries the theme-fixed
   * background until someone applies a background cycle-color mark by hand in Amplenote
   * and reads back what its clipboard actually serializes.
   */
  function buildHighlightHtml(pdfName, pluginUUID, attachmentUUID, highlight, hex, sourceNoteUUID) {
    var url = buildDeepLink(pluginUUID, attachmentUUID, highlight.page, highlight.id, sourceNoteUUID);
    var name = escapeHtml(pdfName || "PDF");
    var linkText = hex ? '<mark style="background-color: ' + escapeHtml(hex) + ';">' + name + "</mark>" : name;
    var heading = '<p><a href="' + escapeHtml(url) + '">' + linkText + "</a></p>";

    // ONE OUTER BLOCKQUOTE HOLDING BOTH, not a nested quote followed by a sibling one.
    // The old shape emitted <blockquote><blockquote>quote</blockquote></blockquote> and
    // then a separate <blockquote>note</blockquote>, which is two adjacent quote blocks
    // rather than one containing two children - so Amplenote drew the outer bar, stopped,
    // and started it again for the note. Reported live as a gap in the bar beside the line
    // before the note. The markdown flavor never had this: its ">" note line is INSIDE the
    // same quote the "> >" line opened, and this now says the same thing in HTML.
    //
    // And the quote is only nested twice when there IS a note to be distinguished from -
    // matching buildHighlightBlock, where the same highlight pasted and exported used to
    // arrive at two different depths.
    var quoteHtml = htmlParagraph(highlight.quoteText);
    if (!highlight.note) return heading + "<blockquote>" + quoteHtml + "</blockquote>";
    return (
      heading +
      "<blockquote><blockquote>" +
      quoteHtml +
      "</blockquote>" +
      htmlParagraph(highlight.note) +
      "</blockquote>"
    );
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
   * @param colorTable { [colorId]: { hex, cycleIndex } } - hex is the fallback background,
   *   cycleIndex (when present) names Amplenote's own background node so it repaints per
   *   theme instead (see colorizeLinkText).
   * @param sourceNoteUUID the note every highlight here lives on - see buildDeepLink.
   * @returns {string} empty string if nothing matches the filter - callers decide how
   *   to handle "nothing to export" rather than this function guessing at a message.
   */
  function buildExportAllContent(
    pdfName,
    pluginUUID,
    attachmentUUID,
    highlights,
    colorTable,
    colorFilter,
    sourceNoteUUID
  ) {
    var filterSet = colorFilter && colorFilter.length ? colorFilter : null;
    var filtered = (highlights || []).filter(function (h) {
      return h && (!filterSet || filterSet.indexOf(h.color) !== -1);
    });
    var sorted = sortForReading(filtered);

    var blocks = sorted.map(function (h) {
      var color = (colorTable && colorTable[h.color]) || {};
      return buildHighlightBlock(pdfName, pluginUUID, attachmentUUID, h, color.hex, color.cycleIndex, sourceNoteUUID);
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
