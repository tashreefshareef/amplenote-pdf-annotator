/**
 * The four highlight colors (spec section 4).
 *
 * `cycleIndex` is the Amplenote cycle-color index used to color the deep-link in an
 * exported highlight block, so the link color matches the highlight color in the PDF.
 *
 * WARNING: these indices are taken from the bounty note and are NOT yet verified
 * against the markdown reference doc. Verify before Phase 5 relies on them:
 * https://www.amplenote.com/help/plugin_api_markdown_reference_parse_markdown
 * Tracked in docs/api-notes.md.
 *
 * `rgb` is the 0..1-normalized form pdf-lib needs for native annotation dictionaries
 * (Phase 4), precomputed here so there is exactly one source of truth per color.
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
