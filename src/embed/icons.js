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
  // view_sidebar - a page with a distinct left column, for the thumbnails panel. Reads as
  // "a panel down the side of the document", which is what it opens, rather than as a
  // open_in_full - the narrow bar's height control at rest. Its other state
  // (close_fullscreen) is swapped in at runtime from MENU_ICONS, so only this one needs to
  // be in the static markup.
  fitScreen: "M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z",
  // grid or a list (both of which the notes panel's own glyph already implies).
  sidebar:
    "M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 19H4V5h5v14z",
};

/**
 * The same set again, for the popover menus.
 *
 * These travel to the embed in its CONFIG rather than in the markup, because the popovers
 * are built at runtime by viewer.js - which is serialized standalone and can import
 * nothing, so it cannot reach ICONS above. Config is how colors already get there.
 *
 * Only what the menus actually use. Every path added here ships in every embed, and the
 * plugin note has a hard 100k cap (docs/api-notes.md lesson 1).
 */
export const MENU_ICONS = {
  // add_comment - a bubble with a plus. One icon for "Add note" and "Edit note" alike;
  // the label is what distinguishes them, and a highlight has at most one note anyway.
  note: "M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-3 9h-4v4h-2v-4H7V9h4V5h2v4h4v2z",
  copy: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z",
  send: "M2.01 21 23 12 2.01 3 2 10l15 2-15 2z",
  // delete - the destructive pair with .pdfa-remove, which colors it.
  remove: "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z",
  download: "M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z",
  // post_add - a page with a plus, for "export all of this into a note".
  postAdd:
    "M17 19.22H5V7h7V5H5c-1.1 0-2 .9-2 2v12.22c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h-2v7.22zM19 2h-2v3h-3v2h3v3h2V7h3V5h-3V2zM7 9h8v2H7zm0 3v2h8v-2H7zm0 3h5v2H7z",
  // unfold_less - the same glyph Amplenote's own editor toolbar uses to collapse.
  collapse: "M7.41 18.59 8.83 20 12 16.83 15.17 20l1.41-1.41L12 14l-4.59 4.59zm9.18-13.18L15.17 4 12 7.17 8.83 4 7.42 5.41 12 10l4.59-4.59z",
  // THE THREE MARK SHAPES, for the toolbar group and the popover's shape row. Material's
  // border_color, format_underlined and format_strikethrough - the same three verbs any
  // editor's formatting bar uses, so the group reads without a label.
  //
  // border_color rather than one of Material's highlighter glyphs: format_ink_highlighter
  // is a detailed pen at a slant that turns to mush at 18px beside two glyphs made of flat
  // bars, and the tinted bar under this one is the part that says "highlight" anyway. Its
  // bar is drawn as a second subpath inside the same path, since icon() takes one string.
  highlight: "M17.75 7 14 3.25l-10 10V17h3.75l10-10zm2.96-2.96a.996.996 0 0 0 0-1.41L18.37.29a.996.996 0 0 0-1.41 0L15 2.25 18.75 6l1.96-1.96zM2 20h20v3H2z",
  underline: "M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z",
  strike: "M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z",
  // THE NARROW BAR'S ONE EXILE. Below the breakpoint the highlights panel loses its
  // toolbar button and becomes a menu row, so its glyph has to travel too - the same one
  // the bar itself uses (ICONS.listBulleted), repeated here because MENU_ICONS is a
  // separate object and viewer.js can reach only this one.
  list:
    "M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z",
  // THE HEIGHT CONTROL's two states: open_in_full and close_fullscreen, arrows out to the
  // corners and back in. NOT the unfold pair, which was the first attempt and which
  // Collapse already wears - two different controls drawn with the same glyph, one above
  // the other in the same menu, which is what was reported. These read as "make this fill
  // the screen" rather than "expand a section", which is also the truer description.
  fitScreen: "M21 11V3h-8l3.29 3.29-10 10L3 13v8h8l-3.29-3.29 10-10z",
  restoreHeight:
    "M22 3.41 16.71 8.7 20 12h-8V4l3.29 3.29L20.59 2 22 3.41zM3.41 22l5.29-5.29L12 20v-8H4l3.29 3.29L2 20.59 3.41 22z",
  // add / remove - the "+" and "-" inside the mark card's More colors circle. Material's
  // own, the same two paths ICONS already carries for the zoom controls; they are repeated
  // here rather than shared because MENU_ICONS is a separate object that TRAVELS IN CONFIG
  // (see the header) and viewer.js cannot reach ICONS at all.
  add: "M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z",
  minus: "M19 13H5v-2h14v2z",
  // palette - for choosing which colors wear toolbar circles.
  palette:
    "M12 22C6.49 22 2 17.51 2 12S6.49 2 12 2s10 4.04 10 9c0 3.31-2.69 6-6 6h-1.77c-.28 0-.5.22-.5.5 0 .12.05.23.13.33.41.47.64 1.06.64 1.67 0 1.38-1.12 2.5-2.5 2.5zm0-18c-4.41 0-8 3.59-8 8s3.59 8 8 8c.28 0 .5-.22.5-.5a.54.54 0 0 0-.14-.35c-.41-.46-.63-1.05-.63-1.65 0-1.38 1.12-2.5 2.5-2.5H16c2.21 0 4-1.79 4-4 0-3.86-3.59-7-8-7zM6.5 11.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3-4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm5 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3 4a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z",
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
