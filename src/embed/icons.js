/**
 * The toolbar's icons - Material Icons, inlined as SVG path data.
 *
 * WHY THIS SET, specifically: Amplenote's own editor toolbar is drawn in Material Icons.
 * That is not inferred from how it looks - the app shell preloads
 * `materialicons-latin-400normal.woff2` and computes `Roboto, sans-serif` on its body.
 * The embed sits directly under that toolbar in the same note, so anything else reads as
 * a foreign widget: the viewer used to draw its controls with typographic characters
 * (&#8249; &#8250; &#8722; &#8942;), which are a different weight, a different optical
 * size and a different vertical alignment from every icon above them.
 *
 * INLINE SVG rather than the icon font Amplenote itself loads:
 *   - the embed is a separate document, so the host's fonts are not available to it and
 *     their asset URLs are content-hashed - it would mean a second webfont of our own
 *   - an icon font that fails to load renders as its ligature TEXT, so a CDN hiccup
 *     leaves the words "chevron_left" sitting in the toolbar. An inline path either
 *     draws or the markup never shipped.
 *   - six glyphs is a few hundred bytes this way against ~40KB for the font
 *
 * The paths are Material Icons' own (Apache 2.0), unmodified, on the standard 24x24 grid
 * so they stay optically consistent with the set above them.
 */
export const ICONS = {
  chevronLeft: "M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",
  chevronRight: "M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",
  remove: "M19 13H5v-2h14v2z",
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  moreVert:
    "M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z",
  listBulleted:
    "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  arrowUp: "M7.41 15.41 12 10.83l4.59 4.58L18 14l-6-6-6 6z",
  arrowDown: "M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z",
};

/**
 * Wrap path data as an inline SVG glyph.
 *
 * `fill` comes from CSS (currentColor), so one icon serves both themes. aria-hidden
 * because every button carrying one also carries an aria-label - without it a screen
 * reader announces the button twice, once for the graphic and once for the label.
 */
export function icon(path) {
  return (
    '<svg class="pdfa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<path d="' +
    path +
    '"></path></svg>'
  );
}
