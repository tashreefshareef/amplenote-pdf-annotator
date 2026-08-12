/**
 * 0..1 RGB for pdf-lib, computed from the hex rather than typed beside it.
 *
 * The two used to be written out by hand as "one source of truth per color", which they
 * were not - they were two, and a drifted triple is invisible until someone opens a
 * DOWNLOADED pdf in Acrobat, the most expensive place in this project to find a bug.
 */
function rgbFromHex(hex) {
  return [1, 3, 5].map(
    (i) => Math.round((parseInt(hex.slice(i, i + 2), 16) / 255) * 1000) / 1000
  );
}

/**
 * Amplenote's own mid-tone band, read out of its stylesheet - NOT a palette of our own.
 *
 * `assets.amplenote.com/packs/css/note_editor_app-*.css` declares 55 colors as
 * `--palette-color-N`, in five bands of eleven (pastel, mid, saturated, dark, darkest),
 * each band running the same hues in the same order. Every one of Amplenote's themes -
 * all 26 of them, light and dark - declares the SAME values, checked by deduping every
 * declaration in the file: one value per index, no theme-specific overrides. So an index
 * means one color, everywhere, and this table cannot go stale per theme.
 *
 * Indices 12-22 are the band that reads as highlighter ink: strong enough to see over
 * black text on white paper, light enough to read through. The pastel band above it
 * (1-11) is what Amplenote uses for its own text-background highlights, and the three
 * bands below are progressively darker text colors - all wrong for marking up a page.
 *
 * TWO OF THESE CORRECT A LONG-STANDING ERROR. Coral was `#F3998C` and yellow `#F4DE6C`
 * here for the whole project; Amplenote's real values are `#F2998C` and `#F3DE6C`, one
 * digit apart in the red channel. They came from the bounty note's table, and only green
 * had ever been round-tripped through Amplenote itself (`<mark data-text-color="15"
 * style="color: #BBE077;">`, which is why green and blue were right). Imperceptible on
 * screen, but it made an exported link's `<mark>` a color Amplenote does not actually
 * have, which is precisely what spec section 4 asks it not to be.
 *
 * `cycleIndex` is Amplenote's own index for each color. NOTHING EMITS IT: an exported
 * link used to carry it as `backgroundCycleColor` in a comment inside its mark, and that
 * comment is what drew an UNDERLINE under every exported link - it names Amplenote's
 * cycle-color node, which brings its own link decoration with it. The marker is a plain
 * `background-color` hex now (src/export.js). Kept because it is the join back to the
 * stylesheet above, and because a colored TEXT marker would have to be written with it
 * (`data-text-color="N"`). Do not put it back into the export without re-checking the
 * underline.
 *
 * An emoji `swatch` field lived here briefly, for the marker in Copy's HTML clipboard
 * flavor - the color carried in the character, since styling it kept coming back wrong
 * through Amplenote's paste sanitizer. It was removed as visually unacceptable: an emoji
 * next to a filename reads as decoration, not as a color code, and the approximate hue
 * (coral rendering as plain red) made it worse. See docs/bugs-found.md.
 */
export const HIGHLIGHT_COLORS = [
  ["coral", "Coral", "#F2998C", 12],
  ["peach", "Peach", "#F9B68D", 13],
  ["yellow", "Yellow", "#F3DE6C", 14],
  ["green", "Green", "#BBE077", 15],
  ["mint", "Mint", "#65D2AA", 16],
  ["sky", "Sky", "#87D7E4", 17],
  ["blue", "Blue", "#84B6D9", 18],
  ["purple", "Purple", "#B49EE2", 19],
  ["orchid", "Orchid", "#DA99E0", 20],
  ["pink", "Pink", "#E893BD", 21],
  ["grey", "Grey", "#DFDFDF", 22],
].map(([id, label, hex, cycleIndex]) => ({ id, label, hex, cycleIndex, rgb: rgbFromHex(hex) }));

/**
 * The four that get toolbar circles when the user has not said otherwise - exactly the
 * four spec section 4 names, in its order. The catalog above is what a highlight is
 * ALLOWED to be; this is what fits in the bar.
 *
 * Do not reorder or substitute to taste: a fresh install has to show the spec's palette,
 * because that is what the bounty is graded against. Someone who wants different colors
 * says so in the setting.
 */
export const DEFAULT_TOOLBAR_COLOR_IDS = ["coral", "yellow", "green", "blue"];

/**
 * How many swatches the toolbar can carry. FOUR IS A LAYOUT FACT, not a preference: the
 * touch rules in embed/html.js give each 20px circle a 30px hit area and a 10px gap, and
 * the bar already wraps on a phone at four. Extra ids in the setting are dropped rather
 * than honoured, because the alternative is a toolbar that silently grows a second row.
 */
export const TOOLBAR_COLOR_SLOTS = 4;

/**
 * The plugin-note metadata row this reads: `setting | Highlight colors`. Amplenote hands
 * every setting back as a STRING (app.settings["Highlight colors"]) and offers no picker,
 * so the value is typed - see parseToolbarColorIds in colors.js for what it accepts.
 */
export const COLOR_SETTING_NAME = "Highlight colors";

export const DEFAULT_COLOR_ID = "yellow";

/**
 * The three shapes a mark can take. A mark is a COLOR PLUS A SHAPE: all three reuse the
 * same eleven-color catalog above, the same stored rects, and the same export plumbing -
 * only the paint differs. There is deliberately no separate palette per shape.
 *
 * `pdfSubtype` is the PDF annotation subtype each one writes on Download. All three are
 * native text-markup annotations taking the same /QuadPoints and /C we already build, so
 * a downloaded PDF opens with real, selectable marks in any reader rather than flattened
 * drawings. See src/annotations.js for the appearance streams, which are NOT shared:
 * only the highlight fill sits under text and wants /Multiply.
 *
 * `highlight` MUST be first and MUST be the default. Every highlight stored before this
 * field existed has no `style` at all, and normalizeMarkStyle resolves that to the first
 * entry - so an old note replays exactly as it was written.
 */
export const MARK_STYLES = [
  ["highlight", "Highlight", "Highlight"],
  ["underline", "Underline", "Underline"],
  ["strike", "Strikethrough", "StrikeOut"],
].map(([id, label, pdfSubtype]) => ({ id, label, pdfSubtype }));

/** What a mark with no recorded shape is. See MARK_STYLES on why it cannot change. */
export const DEFAULT_MARK_STYLE = MARK_STYLES[0].id;

/** Marker for the managed note section that stores annotation JSON (spec section 7.4). */
export const STORAGE_SECTION_HEADING = "PDF Annotator data";

/**
 * The link scheme Amplenote uses for an attachment chip in note markdown.
 *
 * Undocumented - the plugin markdown reference omits attachments entirely - but confirmed
 * by dumping a real note's content (src/actions/dump-markdown.js):
 *
 *   [RENT AGREEMENT 7 8 26.pdf](attachment://01344d1c-503f-4415-972f-5e6967f9fa4a) [^1]
 *
 * An ordinary markdown link, sitting at the chip's actual position in the body, whose
 * target uuid is the same one `getNoteAttachments` returns. That join is what lets a
 * viewer be placed beneath its own chip instead of at the end of the note.
 */
export const ATTACHMENT_SCHEME = "attachment://";

/**
 * Embed box proportions, as `data-aspect-ratio`.
 *
 * The box is `width / ratio`, so a LOWER number is a TALLER box. Two independent
 * measurements agree: COLLAPSED_ASPECT_RATIO renders ~45-50px at a ~700-720px desktop
 * note width, and a 1.2 embed measured ~705x564 in the live app (705/1.2). An earlier
 * version of this comment claimed 1.2 was "taller than it is wide", which is the opposite
 * of both measurements - it is about 20% wider than tall. Correcting it because the sign
 * of this relationship is exactly what you need to get right to change the value at all.
 *
 * These exist because an embed CANNOT resize itself. Amplenote's docs are explicit:
 * "Embeds are fully isolated from the hosting application, so they can't be sized
 * dynamically based on the content of the embed." The iframe's height comes from this
 * attribute in the note markup and nothing else - so collapsing the DOM inside the embed
 * shrinks the content but leaves the box, i.e. a title bar above a tall blank rectangle
 * (reported live). The only lever is rewriting the attribute in the note and letting
 * Amplenote re-render, which is what setEmbedCollapsed does.
 *
 * COLLAPSED is a compromise, not a computed fit: the box's height is width/ratio, and the
 * embed's width depends on the reader's window, so no single ratio yields exactly the
 * title bar's height everywhere.
 */
/**
 * Reported live, with screenshots, on both desktop and phone: the box was too short and
 * the PDF got a strip of it. 1.2 was never chosen for content - it was the arbitrary
 * default in the first embed commit and was only ever promoted to a named constant
 * later, and the spec says nothing about embed height.
 *
 * 1.0 makes the box exactly as tall as it is wide: ~705px at a desktop note width
 * (was ~588) and ~358px on a phone (was ~298), about 20% more in both. Deliberately not
 * lower than that - one ratio serves every screen (see below), and at 0.8 a desktop box
 * would be ~880px, taller than a typical browser viewport, so the toolbar and the bottom
 * of the embed could not be on screen at the same time.
 *
 * NOTE: the ratio is baked into each embed's tag when it is written, so changing this
 * only affects newly inserted viewers. An existing one picks it up when its tag is next
 * rewritten - collapsing and re-expanding it is the cheap way to migrate one by hand.
 */
export const EXPANDED_ASPECT_RATIO = 1.0;

/**
 * REPORTED LIVE, then measured: at 16, the collapsed bar's own BOTTOM BORDER was missing -
 * three sides present, the fourth just gone, on an ordinary desktop-width note. Confirmed
 * in the live app rather than guessed from the CSS: at a 700px note width, 700/16 =
 * 43.75px, a FRACTIONAL height, while the bar's content (10px+10px padding, the "Expand"
 * button, line-height) needs a full 44px. Verified the exact boundary by adjusting the
 * live box height in the running app: 43.875px renders a complete border, 43.75px clips
 * it. The iframe hard-clips to whatever height the ratio produces - nothing inside it can
 * compensate, per the note above - so the shortfall eats exactly the outermost pixel,
 * which is where the border lives.
 *
 * Not a one-off: for ANY note width where width/16 lands between 34 and 44px, the same
 * clipping happens - roughly 544px to 704px, an ordinary range for a desktop note pane,
 * not a rare edge case. (34px is where styles.js's own `@media (max-height: 34px)` switches
 * the collapsed bar to a shorter, less-padded layout tuned for phones - below that height
 * this constant is not the thing to change; see that rule instead.)
 *
 * 14 in place of 16 gives ~50px at a 700px note width - real margin above the 44px floor,
 * not just clearing it - while staying far below 34px at phone widths (~358px width /
 * 14 =~ 25.6px, still solidly in the phone-tuned compact layout, so that measured-and-
 * verified mobile behavior is unaffected). It narrows but does not eliminate the danger
 * band (now ~476-616px instead of ~544-704px) - a complete fix would need the 34px
 * media-height threshold above to move in step with this constant, which was left alone
 * on purpose: that threshold is tuned against real mobile measurements the docs say to
 * treat as settled, and changing it deserves its own live phone verification rather than
 * riding along with a desktop-only fix.
 */
export const COLLAPSED_ASPECT_RATIO = 14;

/**
 * The range a viewer may set its own box to, via "Fit to this screen".
 *
 * That control exists because one ratio has to serve every screen (above), and on a phone
 * the same number that gives a comfortable desktop box gives ~342px - about 40% of which
 * was toolbar. A reader who mostly uses one device can now say so; the tag is rewritten
 * with a ratio computed from THAT device's screen, exactly as collapsing rewrites it.
 *
 * The bounds are what keeps a computed number from producing a box nobody asked for. 0.35
 * is ~2.9x the width - a full phone screen and no more; 1.2 is slightly wider than tall,
 * the old default, and the shortest a viewer should be while still claiming to show a
 * page. A value outside the range is rejected rather than clamped when it arrives from the
 * embed (see normalizeAspectRatio): the embed is the untrusted side of that bridge, and a
 * silently clamped junk value would be indistinguishable from a deliberate one.
 */
export const MIN_FIT_ASPECT_RATIO = 0.35;
export const MAX_FIT_ASPECT_RATIO = 1.2;

/**
 * Pinned CDN versions (spec section 3 requires recording these for reproducibility).
 *
 * VERIFIED LOADING inside a live Amplenote embed on 2026-08-06 - these exact URLs
 * parsed a real 7-page PDF, worker and text layer included. Do not bump casually.
 *
 * PDF.js is deliberately held at 3.x: 4.x ships as `.mjs` ES modules, which a plain
 * `<script>` tag in the embed cannot load without a different bootstrap. 3.11.174 is
 * the UMD build and is the combination that is known to work here.
 */
export const CDN = {
  pdfJs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
  pdfJsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
  /**
   * PDF.js's OWN viewer stylesheet, used for the text layer.
   *
   * Hand-rolling those rules caused two separate positioning bugs (a static
   * --scale-factor that broke hit-testing, then group-opacity blotching). The text
   * layer's geometry is tightly coupled to what renderTextLayer emits, so the upstream
   * stylesheet is the reference implementation - use it rather than reimplementing it.
   */
  pdfViewerCss: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",
  pdfLib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
  /**
   * Roboto - Amplenote's OWN UI font, so the embed's chrome reads as part of the app
   * rather than as a foreign box dropped into the note.
   *
   * Not a guess: amplenote.com computes `Roboto, sans-serif` on its body, and the app
   * shell preloads its own `materialicons-latin-400normal` and Roboto files. We cannot
   * reuse theirs - the embed is a separate document, so fonts the host loaded are not
   * available to it, and their asset URLs are content-hashed - hence a public copy.
   *
   * The icons are inlined as SVG instead (see html.js): five glyphs do not justify a
   * second webfont, and an icon font that fails to load leaves stray letters sitting in
   * the toolbar, whereas a font that fails to load here just falls back to the system
   * sans in the stack.
   */
  robotoCss: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;500&display=swap",
};

/**
 * Amplenote's CORS proxy - the ONLY way to read attachment bytes.
 *
 * `getAttachmentURL` hands back a presigned S3 URL that carries no CORS headers, so a
 * direct fetch fails from both the embed and the plugin sandbox. This proxy is not in
 * the API docs; it comes from the official amplenote-embed-starter. See
 * docs/api-notes.md before changing anything here.
 */
export const CORS_PROXY = "https://plugins.amplenote.com/cors-proxy";

/** Build a fetchable URL for an attachment URL returned by `getAttachmentURL`. */
export function proxiedURL(attachmentURL) {
  const url = new URL(CORS_PROXY);
  url.searchParams.set("apiurl", attachmentURL);
  return url.toString();
}
