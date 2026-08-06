/**
 * The four highlight colors (spec §4).
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

/** Marker for the managed note section that stores annotation JSON (spec §7.4). */
export const STORAGE_SECTION_HEADING = "PDF Annotator data";

/**
 * Pinned CDN versions (spec §3 requires recording these for reproducibility).
 * Not yet load-tested against the embed's CSP — that is a Phase 1 milestone.
 */
export const CDN = {
  pdfJs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs",
  pdfJsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs",
  pdfLib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js",
};
