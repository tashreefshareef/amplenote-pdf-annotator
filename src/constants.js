/**
 * The four highlight colors (spec section 4).
 *
 * `cycleIndex` is Amplenote's own index for each of these colors. NOTHING EMITS IT ANY
 * MORE. An exported link used to carry it as `backgroundCycleColor`, in a comment inside
 * its mark, and that comment is what drew an UNDERLINE under every exported link: it
 * names Amplenote's cycle-color node, which brings its own link decoration with it. The
 * marker is a plain `background-color` hex now (src/export.js) - same color, no
 * decoration, and it is what Amplenote itself stores for a pasted highlight.
 *
 * Kept because the mapping is a verified platform fact rather than plumbing: it is how a
 * colored TEXT marker would have to be written (`data-text-color="N"`), which nothing
 * here needs today. Do not put it back into the export without re-checking the underline.
 *
 * VERIFIED for green: Amplenote's own clipboard output for an exported marker came back
 * as `<mark data-text-color="15" style="color: #BBE077;">`, resolving index 15 to exactly
 * the hex below. The other three come from the same bounty-note table as 15 did, so the
 * table is trustworthy, but only that one has been round-tripped through Amplenote.
 *
 * `rgb` is the 0..1-normalized form pdf-lib needs for native annotation dictionaries
 * (Phase 4), precomputed here so there is exactly one source of truth per color.
 *
 * An emoji `swatch` field lived here briefly, for the marker in Copy's HTML clipboard
 * flavor - the color carried in the character, since styling it kept coming back wrong
 * through Amplenote's paste sanitizer. It was removed as visually unacceptable: an emoji
 * next to a filename reads as decoration, not as a color code, and the approximate hue
 * (coral rendering as plain red) made it worse. See docs/bugs-found.md.
 */
export const HIGHLIGHT_COLORS = [
  { id: "coral", label: "Coral", hex: "#F3998C", cycleIndex: 12, rgb: [0.953, 0.600, 0.549] },
  { id: "yellow", label: "Yellow", hex: "#F4DE6C", cycleIndex: 14, rgb: [0.957, 0.871, 0.424] },
  { id: "green", label: "Green", hex: "#BBE077", cycleIndex: 15, rgb: [0.733, 0.878, 0.467] },
  { id: "blue", label: "Blue", hex: "#84B6D9", cycleIndex: 18, rgb: [0.518, 0.714, 0.851] },
];

export const DEFAULT_COLOR_ID = "yellow";

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
 * measurements agree: COLLAPSED_ASPECT_RATIO 16 renders ~45px at a ~720px desktop note
 * width (720/16), and a 1.2 embed measured ~705x564 in the live app (705/1.2). An earlier
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
 * title bar's height everywhere. 16 gives roughly 45px at a typical desktop note width.
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
export const COLLAPSED_ASPECT_RATIO = 16;

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
