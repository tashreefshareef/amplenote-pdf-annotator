/**
 * The embed stylesheet, alone in its own module so the build can minify it.
 *
 * IT USED TO LIVE IN html.js, and the cost of that was paid in the plugin note. Everything
 * between the backticks below is string data: esbuild strips JS comments from the bundle,
 * but it has no idea this string is CSS, so every comment and every space of indentation
 * shipped verbatim into a note with a hard 100k-character cap. The stylesheet measured
 * 33.5k characters of which 22k were comments, against about 1k of headroom left in the
 * whole bundle - so the file was carrying, in shipped weight, roughly twenty times the
 * space remaining for new features.
 *
 * esbuild.js now intercepts THIS FILE by path and runs the string through esbuild own CSS
 * minifier before bundling (see minifyStylesheet there). That is why the module does
 * nothing but export one template literal: the build extracts it by pattern, and anything
 * else in here - a second export, a helper, an interpolation - would either be dropped or
 * make the pattern ambiguous. Keep it a single literal.
 *
 * SO COMMENTS IN HERE ARE FREE NOW, and they should be used. The rules below encode live
 * findings that are impossible to re-derive from the declarations themselves.
 *
 * NO BACKTICKS ANYWHERE, comments included. This is a template literal, so a backtick in a
 * CSS comment ends the string and the whole module stops parsing - every suite that
 * imports it fails to run, with a missing-semicolon error hundreds of lines from the
 * actual typo. Quoting a property name the way the rest of the codebase does is the
 * natural way to write it and the natural way to break it, so test/source-hazards.test.js
 * asserts the absence rather than trusting review. That guard reads this file as TEXT and
 * imports nothing from it - an assertion living in a suite that imports the module could
 * never run in the one situation it exists for.
 *
 * LOOKING NATIVE (all three from one live report - the viewer "not feeling native" beside
 * Amplenote's own editor toolbar, which sits about 30px above it in the note):
 *
 *   - TYPE. Amplenote's UI is Roboto: amplenote.com computes "Roboto, sans-serif" on its
 *     body and the app preloads its own Roboto files. The embed is a separate document,
 *     so the host's copy is not available to it and its asset URL is content-hashed -
 *     hence the webfont link (CDN.robotoCss). The rest of the stack is what a blocked or
 *     slow request falls back to, and is exactly what the font line used to be.
 *
 *   - ICONS. The same app preloads materialicons-latin-400normal.woff2, so its toolbar
 *     glyphs are Material Icons. Ours were typographic characters - a different weight,
 *     optical size and baseline - which is most of what made the bar look bolted on. They
 *     are inline SVG now; see icons.js for why inline rather than the icon font itself.
 *
 *   - THE CARD. The viewer ran to the edges of its box with a single rule under the
 *     toolbar, so nothing marked where the note ended and the embed began - the same
 *     thing that made the highlights panel read as overflow before it was inset. It is a
 *     bordered, rounded card now, the shape every other embed in a note has.
 *
 *     Two rules carry that and both look optional: "overflow: hidden" on the root is what
 *     makes the radius actually clip the toolbar's square corners, and "background:
 *     transparent" on the body is what lets the four corners outside the radius show the
 *     NOTE through the iframe instead of a white notch. The clip does NOT reach the
 *     popovers - they are position:fixed, so only the viewport clips them, and nothing
 *     here establishes a containing block for a fixed element (no transform, filter or
 *     contain anywhere in this stylesheet). Adding one would silently cut the color
 *     picker off at the viewer's edge.
 */
export const STYLES = `
  * { box-sizing: border-box; }
  /* Roboto is Amplenote's own UI font; the rest is the fallback. See the header. */
  body { margin: 0; background: transparent;
    font: 13px Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  /* A bordered card. overflow and the transparent body above are both load-bearing, and
     nothing here may gain a transform, filter or contain - see the header for all three. */
  #pdfa-root { display: flex; flex-direction: column; height: 100vh; background: var(--pdfa-bg); color: var(--pdfa-fg);
    border: 1px solid var(--pdfa-border); border-radius: 10px; overflow: hidden; }
  /* A MANUAL toggle, applied by viewer.js's collapseViewer/openViewer, and re-applied on
     initial render when the tag says the user left this viewer collapsed - but never a
     default (see buildEmbedHtml's own comment on why a default-collapsed embed, tried
     first, was explicitly rejected: it added a forced extra click before every
     annotation). height:auto here (not the 100vh above) so the collapsed bar takes only
     its own natural height. That alone is NOT enough to close the gap: the iframe's own
     height comes from the tag's data-aspect-ratio, which only the plugin side can change
     - see constants.js. */
  #pdfa-root.pdfa-collapsed-mode { height: auto; }
  #pdfa-root.pdfa-collapsed-mode .pdfa-toolbar,
  #pdfa-root.pdfa-collapsed-mode .pdfa-status,
  #pdfa-root.pdfa-collapsed-mode .pdfa-body { display: none; }
  .pdfa-collapsed { display: none; align-items: center; gap: 8px; padding: 10px 12px;
    background: var(--pdfa-toolbar); border-bottom: 1px solid var(--pdfa-border); }
  /* Collapsed, this bar IS the card - its own rule would draw the bottom edge twice. */
  #pdfa-root.pdfa-collapsed-mode .pdfa-collapsed { border-bottom: none; }
  #pdfa-root.pdfa-collapsed-mode .pdfa-collapsed { display: flex; }
  .pdfa-collapsed-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
    opacity: .85; }
  .pdfa-collapsed-count { opacity: .6; font-size: 12px; white-space: nowrap; }
  /* Holds the page scroller and the highlights panel. Positioned so the panel can
     overlay the pages without the toolbar, and without reflowing the PDF - the embed is
     often barely wider than a page, so a panel that stole width would squeeze it. */
  .pdfa-body { position: relative; flex: 1 1 auto; display: flex; min-height: 0; }
  /* Modelled on Amplenote's own editor toolbar: a plain bar, borderless controls, and a
     rounded tint on hover rather than a box around every button at rest. min-height keeps
     the row a constant height whether or not a swatch is showing its selected ring, which
     is what made the bar appear to grow and shrink as colors were picked. */
  .pdfa-toolbar { display: flex; align-items: center; gap: 4px; padding: 5px 8px; min-height: 38px;
    background: var(--pdfa-toolbar); border-bottom: 1px solid var(--pdfa-border);
    flex: 0 0 auto; flex-wrap: wrap; }
  /* Transparent BORDER rather than none: the button keeps the same box either way, so
     nothing shifts by a pixel when a state adds one back. */
  .pdfa-toolbar button { font: inherit; padding: 5px 9px; border: 1px solid transparent;
    background: transparent; color: inherit; border-radius: 6px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
  .pdfa-toolbar button:disabled { opacity: .4; cursor: default; background: transparent; }
  /* What Amplenote's toolbar does for an active control (its H2 button, with the cursor
     in an H2): hover's own tint, held on. Not the swatches - they carry aria-pressed for
     the selected color, and a grey tint would dirty the color they exist to show. */
  .pdfa-toolbar button[aria-pressed="true"]:not(.pdfa-color) { background: var(--pdfa-btn-hover); }
  /* ICON BUTTONS. A square box around an 18px Material glyph (see icons.js). inline-flex
     plus the svg's own display:block is what kills the inline-layout descender gap that
     otherwise lifts a glyph a pixel off centre.

     "button.pdfa-icon-btn", not ".pdfa-icon-btn": ".pdfa-toolbar button" above is one
     point more specific, so a bare class loses the padding and the buttons come out 38px
     wide around an 18px glyph. Measured, not guessed. */
  .pdfa-toolbar button.pdfa-icon-btn { display: inline-flex; align-items: center;
    justify-content: center; gap: 5px; padding: 6px; }
  .pdfa-icon { display: block; width: 18px; height: 18px; fill: currentColor; opacity: .78; }
  .pdfa-toolbar button:hover .pdfa-icon,
  .pdfa-toolbar button[aria-pressed="true"] .pdfa-icon { opacity: 1; }
  /* The count stays beside the list glyph - it is what the word "Notes" was not saying.
     Tabular figures, so the bar does not shift as the count crosses 10. */
  .pdfa-toolbar button.pdfa-notes-btn { padding: 6px 8px; }
  .pdfa-notes-btn .pdfa-count { font-size: 12px; opacity: .85; font-variant-numeric: tabular-nums; }
  .pdfa-label { min-width: 62px; text-align: center; opacity: .85; font-variant-numeric: tabular-nums; }
  /* The zoom "label" is really an INPUT (see the markup for why), so it has to be talked
     back down into looking like the span it replaced: a browser hands an input its own
     font, border, background and width, none of which belong in this bar. width rather
     than the min-width above, because an input does not size itself to its content -
     .pdfa-label's min-width would leave it at the browser's ~170px default. */
  .pdfa-zoom-field { font: inherit; width: 62px; padding: 5px 4px; border: 1px solid transparent;
    border-radius: 6px; background: transparent; color: inherit; cursor: text; }
  /* The one cue that it is typable at all, and deliberately the SAME hover the - and +
     either side of it use: "these controls respond" stays one idea rather than two. */
  .pdfa-zoom-field:hover { background: var(--pdfa-btn-hover); }
  /* A border, not the browser's outline ring: the ring is drawn OUTWARD from the control
     and this bar's height is set by its contents, so it was clipped by the toolbar edge -
     the same problem the color swatches' selected state already solves this way. */
  .pdfa-zoom-field:focus { outline: none; opacity: 1;
    background: var(--pdfa-toolbar); border-color: var(--pdfa-accent); }
  /* The overflow trigger is now a plain icon button (Material's more_vert, the glyph the
     note menu above this embed uses), so it needs no rule of its own. Its contents render
     as ordinary popover buttons below. */
  /* Short and centred rather than edge to edge: a full-bleed divider is heavier than
     anything Amplenote's toolbar draws, and it was the loudest thing in a borderless bar. */
  .pdfa-sep { width: 1px; height: 20px; align-self: center; background: var(--pdfa-border); margin: 0 5px; }
  /* 500, not 600 - medium is the heaviest weight Amplenote's own UI uses. */
  .pdfa-brand { font-weight: 500; font-size: 12px; letter-spacing: .01em; color: var(--pdfa-accent);
    white-space: nowrap; padding-right: 2px; }
  .pdfa-spacer { flex: 1 1 auto; }
  /* No filename heading in the overflow menu. It was moved there when its own toolbar row
     was removed for duplicating Amplenote's attachment chip - but the chip is right above
     the embed, so the menu copy duplicated it just as much, only truncated to uselessness
     in a 216px card. The collapsed bar still carries the name, which is the one state
     where no chip is in view. */
  /* No align-items: center here on purpose - see the .pdfa-page comment below.

     overscroll-behavior is for touch: the embed is an iframe inside a note that
     scrolls, and on Android a drag over the page area moved the NOTE rather than the
     pages, so the PDF could not be scrolled by dragging it at all (reported live -
     the only gesture that moved it was a long-press drag). "contain" stops a pan
     that reaches this element's end from chaining out to the host note. It cannot
     stop the host from claiming the gesture in the first place, so this is a
     necessary-not-sufficient fix - see docs/api-notes.md. */
  .pdfa-scroll { flex: 1 1 auto; overflow: auto; padding: 12px; display: flex; flex-direction: column; gap: 12px;
    overscroll-behavior: contain; }
  /* Centered via its own auto margins rather than the scroller's align-items: center.
     align-items: center is "unsafe" alignment by spec default - once a page is wider
     than the scroller (past ~100% zoom on a narrow embed), it centers the overflow
     symmetrically, pushing half of it into negative scroll territory that no scrollbar
     can ever reach. Auto margins clamp at zero instead of going negative, so an
     oversized page just left-aligns and stays fully reachable by scrolling, while
     still centering normally whenever it fits. */
  .pdfa-page { position: relative; box-shadow: 0 1px 6px rgba(0,0,0,.28); background: #fff; flex: 0 0 auto; margin: 0 auto; }
  .pdfa-page canvas { display: block; }
  .pdfa-status { padding: 10px 12px; text-align: center; opacity: .8; }
  .pdfa-error { color: var(--pdfa-error); opacity: 1; white-space: pre-wrap; }

  /* TEXT LAYER
     Styling comes from PDF.js's own pdf_viewer.css, linked above. Do not reimplement
     those rules - the layer's geometry is coupled to what renderTextLayer emits, and
     two positioning bugs have already come from hand-rolled substitutes.

     What follows is only (a) a safety net if that stylesheet fails to load, and (b) the
     selection colour, which is ours to choose.

     The safety net matters: without "color: transparent" a failed stylesheet paints
     every glyph a second time on top of the canvas, which looks like a corrupted PDF
     rather than a missing CSS file. (No backticks in this comment - STYLES is itself a
     template literal, and one would terminate it.) */
  .textLayer { position: absolute; inset: 0; overflow: hidden; line-height: 1;
    opacity: 0.3; forced-color-adjust: none; }
  .textLayer > span { color: transparent; position: absolute; white-space: pre;
    cursor: text; transform-origin: 0% 0%; }
  /* Opaque on purpose: the container's opacity fades the layer as a single group, so
     overlapping spans can't compound their alpha into dark seams between lines. */
  .textLayer ::selection { background: #1a73e8; }
  .textLayer > span::selection { background: #1a73e8; }
  /* Above the highlight overlay, so text stays selectable over an existing highlight. */
  .textLayer { z-index: 2; }

  /* HIGHLIGHT OVERLAY
     Sits between the canvas and the text layer, and takes no pointer events at all -
     clicks on a highlight are found by hit-testing the click point against the stored
     PDF-space rects instead. Giving the rects their own pointer events would block text
     selection over anything already highlighted.

     Blend mode + isolation live on THIS layer, not on each rect and not per highlight -
     see the comment below for why the scope had to widen twice. DOM order (canvas, then
     this, then the text layer) already gives the right paint order; isolation does not
     change that, it only decides what a descendant's blend mode composites against. */
  .pdfa-highlights { position: absolute; inset: 0; overflow: hidden; pointer-events: none;
    mix-blend-mode: multiply; isolation: isolate; }
  /* Every rect on the page - across EVERY highlight, not just within one - has to
     flatten together before the single multiply pass against the canvas, or two
     overlapping rects double-color wherever they touch.
     Two live reports, same underlying bug, different scope each time:
       1. One highlight's OWN line rects can overlap by a pixel or two - tightly-set
          text can have one line's descender ink dip into the next line's ascender
          space. Fixed first by isolating per HIGHLIGHT (one group per highlight).
       2. That fix left the SAME seam between two DIFFERENT highlights whose rects
          happen to touch at a line boundary (recolor a highlight beside an existing
          one, or two separate highlights on adjacent lines) - each highlight was its
          own isolated group, so two groups touching still each multiplied the page
          independently, compounding right back.
     Isolating the whole layer instead of each highlight fixes both at once: every rect
     on the page composites flat against every other rect first (same or different
     highlight, doesn't matter - two opaque rects overlapping just show whichever
     painted last, no color math), and the FLATTENED result blends against the canvas
     exactly once. The .pdfa-hl-group class below is now purely organizational (keeps a
     highlight's own rects together, carries its id) - it has no blend mode of its own,
     or it would re-isolate its own subtree and undo the point of the wider scope.
     (No backticks anywhere in this comment - STYLES is itself a template literal.) */
  .pdfa-hl-group { position: absolute; inset: 0; }
  .pdfa-hl { position: absolute; border-radius: 2px; }
  /* UNDERLINE AND STRIKETHROUGH are the same rect, drawn as a band instead of a fill -
     the geometry is computed in viewer.js (markBandRect) because it depends on the line
     height at the current zoom, which CSS here cannot see. Only the radius differs: 2px
     on a ~2px-tall band rounds it into a lozenge with no straight edge left.

     THEY KEEP THE LAYER'S MULTIPLY. That was not the original intent - the plan was to
     exempt them, on the reasoning that only a fill sits under text. Multiply turns out to
     be what both actually want. A strikethrough is drawn straight through the x-height, so
     an opaque bar would hide the very words it is struck through; multiplied, the glyphs
     stay legible underneath, which is the whole point of striking text rather than
     deleting it. An underline is mostly over white paper, where multiply is identity, and
     where a descender dips into it the glyph reads through the band like ink. Exempting
     them would also have meant a second overlay layer with its own isolation, and the
     comment above is a record of how carefully that scope had to be chosen. */
  .pdfa-hl-band { border-radius: 1px; }
  /* The cue for "this is the highlight your link pointed at". Scrolling to it does not
     say WHICH one on a page that holds several, possibly adjacent and the same color.
     An outline, not a color or opacity change: those are what a highlight already uses
     to mean something, so borrowing them would read as "this highlight is different"
     rather than "look here". outline also does not affect layout or feed into the
     multiply blend the rects composite through. */
  @keyframes pdfa-flash {
    0%, 100% { outline-color: transparent; }
    15%, 60% { outline-color: var(--pdfa-accent); }
  }
  .pdfa-hl-flash .pdfa-hl { outline: 2px solid transparent; outline-offset: 1px;
    animation: pdfa-flash 1.3s ease-in-out 2; }
  /* Focused only to make the host note scroll this embed into view (see
     revealSelfInHostNote) - the outline the browser would draw would be a full-viewer
     ring that means nothing to the reader. */
  #pdfa-root:focus { outline: none; }

  /* The four colors are top-level toolbar buttons, single click, no submenu - an
     explicit spec requirement, not a layout preference. The bare .pdfa-color selector is
     for the popover copies; the descendant one exists only to outrank
     ".pdfa-toolbar button" above, which would otherwise impose its padding. */
  .pdfa-color, .pdfa-toolbar .pdfa-color { width: 20px; height: 20px; padding: 0; border-radius: 50%;
    border: 1px solid rgba(0,0,0,.28); cursor: pointer; font: inherit; }
  .pdfa-color:hover, .pdfa-toolbar .pdfa-color:hover { background-clip: padding-box; }
  /* The selected ring is drawn INSIDE the swatch - a 2px accent border with an inset ring
     of the bar's own color holding it off the fill. It used to be two stacked outer
     box-shadows, which added 4px on every side of a 20px circle and pushed the ring past
     the toolbar's edges: the bar looked like the selection was spilling out of it.
     Anything drawn outward from a control sitting in a tight bar has to be paid for by
     the bar's padding, and here the padding is set by the other controls' text. */
  .pdfa-color[aria-pressed="true"], .pdfa-toolbar .pdfa-color[aria-pressed="true"] {
    border: 2px solid var(--pdfa-accent); box-shadow: inset 0 0 0 2px var(--pdfa-toolbar); }
  /* Sits above the four swatches in the selection popover when a drag crossed a page
     break. Its own line (flex-basis 100%) in a popover that is otherwise a single row of
     circles, so the swatches keep their shape and the warning is read before them. */
  .pdfa-spill-hint { flex: 0 0 100%; font-size: 11px; opacity: .75; padding: 0 2px 4px;
    text-align: center; }

  /* Remove / recolor actions for an existing highlight. Positioned "fixed" because the
     embed is its own iframe, so a click's client coordinates are already relative to
     this element's containing block - no scroll-offset arithmetic to get wrong. */
  /* max-height + scroll is what keeps a popover INSIDE the embed. It is fixed-positioned
     in an iframe, so "off the bottom" is not merely ugly - the parent page cannot show
     the overflow and the rest of the menu is simply unreachable. A short embed with a
     six-item menu hit this: showPopover flips above the cursor when it would overflow
     below, but when the menu is taller than the whole viewport there is nowhere to flip
     to, and it clipped. Scrolling is the only answer that always fits.

     Shadow is softer than it was, to sit with Amplenote's own menus rather than shout
     over them; the border is what carries the edge in dark mode, where a shadow reads as
     nothing at all.

     BOTH axes are named. Setting only overflow-y does not leave the other axis alone:
     CSS computes an "overflow: visible" on one axis to "auto" when the other is not
     visible, so a y-only rule quietly buys an x scrollbar too, and any sub-pixel width
     overflow then draws a horizontal bar across the bottom of the menu. Reported live as
     "the slider is unnecessary" - it was, and nothing was actually scrollable sideways. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg); max-width: 320px; flex-wrap: wrap;
    max-height: calc(100vh - 8px); overflow-x: hidden; overflow-y: auto;
    border: 1px solid var(--pdfa-border); border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10); }
  .pdfa-popover.pdfa-open { display: flex; }
  /* The note editor turns the popover into a small column form. */
  .pdfa-popover.pdfa-editing { flex-direction: column; align-items: stretch; width: 274px; }
  /* Export all's color filter: independently-toggled swatches, not the single-select
     behaviour the same .pdfa-color class has everywhere else - the filter is "any
     combination of colors", not "one active color". */
  .pdfa-popover.pdfa-exporting { flex-direction: column; align-items: stretch; width: 220px; }
  /* Same column layout as the filter, wider: eleven 20px swatches plus their gaps need
     ~250px of content box to sit six-and-five rather than in a ragged three rows. */
  .pdfa-popover.pdfa-palette { flex-direction: column; align-items: stretch; width: 274px; }
  /* The toolbar overflow menu (Download / Export / Remove), shaped after Amplenote's own
     note menu: a tight card of full-width rows, left-aligned, no borders at rest, and a
     rounded tint under the row on hover. The gap goes to 0 and the spacing moves into the
     rows themselves, so the hover tint is a continuous band rather than a button with
     visible gutters above and below it. */
  .pdfa-popover.pdfa-menu { flex-direction: column; align-items: stretch; width: 216px; gap: 0; padding: 5px; }
  .pdfa-popover.pdfa-menu .pdfa-btn { justify-content: flex-start; text-align: left; padding: 8px 10px; }
  /* Rows keep their height when the menu hits its max-height, so the overflow SCROLLS
     rather than compressing every row toward illegibility. Without this the column's
     flex children shrink to fit and the cap silently squashes the menu instead of
     letting it scroll - which measures as "fits" while looking broken. */
  .pdfa-popover.pdfa-menu > * { flex: 0 0 auto; }
  .pdfa-popover.pdfa-menu .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  /* ---- THE MARK CARD (openHighlightPopover) --------------------------------
     A FIXED WIDTH AND EXPLICIT ROWS, and both halves of that are load-bearing.

     This card used to be eighteen children pushed flat into .pdfa-popover's wrapping row
     with only a max-width to shape them - three shape buttons, eleven swatches and four
     text buttons - so the wrap point was decided at open time by whatever width the box
     happened to measure. Seventeen pixels either way (the overflow-y scrollbar appearing
     is the usual cause) moved the eleventh swatch onto its own line and shuffled "Add
     note" up beside it: the same highlight drew two visibly different cards. Reported
     live as "it adjusts the structure based on where it appeared", and that is exactly
     what it did.

     A content-sized wrapping box cannot be fixed by tuning the max-width, because the
     input to the wrap is a MEASUREMENT. Naming the width and giving each row its own
     nowrap element is what moves the decision back to design time. The numbers add up
     to the width on purpose - 2 border + 6 padding + 100 (the shape group: three 32px
     buttons 2px apart) + 1 rule + 101 (four 20px swatches, 7px apart) + 32 (the More
     circle in its own button box) + three 6px gaps + 6 padding = 266, and the width is
     270 so there are four pixels of slack for space-between to hand to the gaps.

     A BUTTON HERE IS 32px, NOT 30: an 18px icon, 6px of padding either side, and the
     1px transparent border .pdfa-btn keeps so the primary variant can color one in
     without moving anything. Both attempts at this width forgot that border and both
     overflowed by exactly the 2px per button it costs. Measure the card, do not add up
     the rules.

     THE SLACK IS THE POINT, together with "flex: 0 0 auto" on the row's children. At
     exactly-fits the row is one rounding error from overflowing, and an overflowing
     flex row does not clip the last item politely - it SHRINKS whatever can shrink.
     The first casualty was the 1px divider (down to 0), and what got pushed past the
     card's overflow-x:hidden edge was the "+". Caught by measuring the live card. */
  .pdfa-popover.pdfa-mark { flex-direction: column; flex-wrap: nowrap; align-items: stretch;
    width: 270px; gap: 6px; padding: 6px; }
  .pdfa-mark-row { display: flex; align-items: center; gap: 6px; flex: 0 0 auto; }
  .pdfa-mark-row > * { flex: 0 0 auto; }
  .pdfa-mark-row.pdfa-mark-top { justify-content: space-between; }
  .pdfa-mark-colors { display: flex; align-items: center; gap: 7px; }
  .pdfa-mark-row .pdfa-spacer { flex: 1 1 auto; }
  /* Separates the two questions the card asks - what this mark LOOKS like, and what you
     can DO with it - which used to be carried by .pdfa-shape-row's bottom border back
     when the shape group had a whole line to itself. */
  .pdfa-vrule { width: 1px; align-self: stretch; background: var(--pdfa-border); }
  .pdfa-hrule { height: 1px; flex: 0 0 auto; background: var(--pdfa-border); }
  /* THE SHAPE GROUP: highlight / underline / strikethrough. An inline group now, not a
     full-width row - it shares row 1 with the swatches, and the vertical rule is what
     keeps the two from reading as one undifferentiated strip of controls. */
  .pdfa-shape-row { display: flex; gap: 2px; }
  /* MORE COLORS. A 30px button box around a 20px dashed circle, so it hovers like the
     icon buttons either side of it and its ring is held 11px off the card's edge -
     anything drawn to the very edge of a tight card reads as clipped. Dashed rather
     than filled because it is the one circle in the row that is not a color. */
  .pdfa-more-colors { padding: 5px; border: 1px solid transparent; background: transparent;
    color: inherit; border-radius: 6px; cursor: pointer; display: inline-flex; }
  .pdfa-more-colors:hover { background: var(--pdfa-btn-hover); }
  .pdfa-more-dot { width: 20px; height: 20px; border-radius: 50%; display: flex;
    align-items: center; justify-content: center; border: 1px dashed var(--pdfa-border); }
  .pdfa-more-colors .pdfa-icon { width: 14px; height: 14px; opacity: .7; }
  .pdfa-more-colors:hover .pdfa-icon { opacity: 1; }
  /* THE DRAWER: the catalog MINUS the four already on the strip above, so no color
     appears twice in one card. Seven is what that leaves, and seven fixed columns is
     what stops the grid re-wrapping - the whole defect this card was rebuilt to kill.
     Centred, because a 188px row left-aligned under a 246px strip reads as misaligned
     rather than as a second row of the same thing. */
  .pdfa-drawer { display: none; grid-template-columns: repeat(7, 20px); gap: 8px;
    justify-content: center; padding-top: 2px; }
  .pdfa-drawer.pdfa-open { display: grid; }
  /* Icon-only actions (Copy / Send to note / Remove). They keep their labels as tooltips
     and as their accessible names - see iconButton in viewer.js. */
  .pdfa-btn.pdfa-icon-only { padding: 6px; }
  /* Icon-only, so it drops .pdfa-btn's text padding and squares up. The pressed state is
     the same tint the toolbar uses for its own active control, for the same reason: the
     mark's CURRENT shape has to be readable before you can choose a different one.

     .pdfa-btn.pdfa-shape-btn, not .pdfa-shape-btn: as a single class it TIED with
     .pdfa-btn's "padding: 6px 10px" and lost on source order, so the squaring-up this
     rule describes never happened and the buttons rendered 40px wide. Measured, not
     read - it is invisible until something downstream depends on the width, which the
     mark card's fixed geometry now does. */
  .pdfa-btn.pdfa-shape-btn { padding: 6px; }
  .pdfa-shape-btn[aria-pressed="true"] { background: var(--pdfa-btn-hover); }
  .pdfa-shape-btn[aria-pressed="true"] .pdfa-icon { opacity: 1; }
  .pdfa-export-colors { display: flex; gap: 6px; padding: 2px 0 8px; }
  .pdfa-export-hint { font-size: 12px; opacity: .75; padding-bottom: 6px; }
  /* THE PALETTE PICKER (openPalettePopover). Eleven swatches need to wrap; the export
     filter's row never had to, which is why this is a separate rule rather than a tweak
     to the one above. */
  .pdfa-catalog-row { flex-wrap: wrap; gap: 8px; }
  /* Already on the toolbar: dimmed, not hidden. Seeing what is spoken for is the reason
     to show all eleven at once, and a gap where a color used to be reads as a bug. */
  .pdfa-catalog-row .pdfa-taken { opacity: .3; }
  /* The four slots ARE the toolbar preview, so they are bigger than catalog swatches and
     spaced like the bar itself rather than packed like a palette. */
  .pdfa-slot-row { display: flex; gap: 12px; align-items: center; padding: 2px 0 10px; }
  .pdfa-slot-row .pdfa-slot { width: 24px; height: 24px; }
  /* An empty slot has to read as "a color goes here", which a gap cannot. Dashed ring,
     same diameter as a filled slot so the row does not reflow as slots fill and empty. */
  .pdfa-slot-empty { width: 24px; height: 24px; border-radius: 50%;
    border: 1px dashed var(--pdfa-border); }
  /* Sits under both rows as the consequence of pressing Save, so it gets a rule of its
     own rather than sharing the hints' bottom padding. */
  .pdfa-scope-hint { padding-top: 2px; }
  .pdfa-note-input { font: inherit; font-size: 12px; width: 100%; resize: vertical; padding: 6px;
    border: 1px solid var(--pdfa-border); border-radius: 5px;
    background: var(--pdfa-bg); color: inherit; }
  .pdfa-note-actions { display: flex; gap: 5px; margin-top: 6px; align-items: center; }
  .pdfa-note-actions .pdfa-spacer { flex: 1 1 auto; }

  /* Borderless with a tint on hover, the same vocabulary as the toolbar - these used to
     be bordered chips, which made the plugin speak in three button dialects at once (a
     bar of borderless controls, a menu of borderless rows, and this). The border stays
     as "transparent" rather than going to none so the primary variant can put one back
     without moving anything by a pixel. */
  .pdfa-btn { font: inherit; font-size: 13px; padding: 6px 10px; line-height: 1.25;
    display: inline-flex; align-items: center; gap: 7px;
    border: 1px solid transparent; background: transparent; color: inherit;
    border-radius: 6px; cursor: pointer; white-space: nowrap; }
  .pdfa-btn:hover { background: var(--pdfa-btn-hover); }
  .pdfa-btn:hover .pdfa-icon { opacity: 1; }
  /* Marks the "add a note" offer that the spec requires to appear as soon as a
     highlight is created, so it reads as the suggested next step. Now that the others
     have no border, this one having a whole box to itself is what carries that. */
  .pdfa-btn-primary { border-color: var(--pdfa-accent); color: var(--pdfa-accent); }
  /* The destructive one. viewer.js has been putting this class on Remove, Remove
     viewer... and its confirm all along, and nothing here styled it - so the action that
     discards work looked exactly like Copy. Color only: a filled danger button would be
     the loudest thing in a popover whose other actions are all borderless. */
  .pdfa-remove { color: var(--pdfa-error); }
  .pdfa-remove .pdfa-icon { opacity: .9; }

  /* HIGHLIGHTS PANEL - the list of every highlight and its note. Groundwork for the
     Phase 5 color filter, which needs somewhere to filter. */
  /* A floating card, inset from the body's edges rather than filling them. Flush against
     the right and bottom with only a left border, it read as bleeding out of the viewer -
     nothing marked where the panel stopped and the embed ended, so it looked like
     overflow even though its box was exactly inside the body. The inset plus a full
     border, rounded corners and a shadow is what makes it read as sitting ABOVE the page,
     which is what it actually does.

     max-width leaves the same 8px on the other side, so the card stays inset rather than
     growing flush again on a narrow embed. */
  /* THE SCROLL IS ON AN INNER ELEMENT, and this outer one only clips. Reported live: the
     panel's top-right and bottom-right corners were square while the other two were
     round. The cause is that a classic (space-taking) scrollbar is NOT clipped to its
     scroll container's border-radius in Chromium - it is laid out at the padding-box edge
     and painted straight over the curve, so the corners look mitred exactly on the side
     the scrollbar is on. Nothing about the radius or the border was wrong.

     There is no property that fixes it in place: scrollbar-width only makes the square
     thinner, and overflow:overlay is gone. Splitting the two jobs is the fix - this
     element owns the shape and clips (overflow: hidden), the child inside it owns the
     scrolling, and the scrollbar is then inside a box with square corners of its own.
     The same split is why .pdfa-thumbs below is shaped this way too. */
  .pdfa-panel { position: absolute; top: 8px; right: 8px; bottom: 8px; width: 292px;
    max-width: calc(100% - 16px);
    background: var(--pdfa-toolbar); border: 1px solid var(--pdfa-border); border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10);
    overflow: hidden; display: none; z-index: 15; }
  .pdfa-panel.pdfa-open { display: block; }
  .pdfa-panel-scroll { height: 100%; overflow: auto; padding: 8px; }

  /* PAGE THUMBNAILS. Same floating-card treatment as the panel above and for the same
     reason - it overlays the pages rather than taking width from them, so opening it
     never reflows the document.

     LEFT, where the highlights panel is right. The side is the fastest thing to read
     about a panel: the two take turns, so which one is open has to be obvious before you
     have read a word of it. It also matches where every desktop reader puts thumbnails.

     Narrow on purpose. One thumbnail wide plus its scrollbar is about 124px, against the
     highlights panel's 292 - a list of pictures needs no reading width, and on an embed
     this size every pixel it does not take is page you can still see while using it. */
  /* Clips only; the child scrolls. See .pdfa-panel above for the scrollbar-versus-radius
     reason - this panel has a scrollbar on every document long enough to be worth opening
     it for, so it would show the same square corners on every single use. */
  .pdfa-thumbs { position: absolute; top: 8px; left: 8px; bottom: 8px; width: 124px;
    max-width: calc(100% - 16px);
    background: var(--pdfa-toolbar); border: 1px solid var(--pdfa-border); border-radius: 10px;
    box-shadow: 0 6px 20px rgba(0,0,0,.14), 0 1px 4px rgba(0,0,0,.10);
    overflow: hidden; display: none; z-index: 15; }
  .pdfa-thumbs.pdfa-open { display: block; }
  .pdfa-thumbs-scroll { height: 100%; overflow: auto; overflow-x: hidden; padding: 8px 6px; }
  .pdfa-thumb { display: block; width: 100%; padding: 0; margin-bottom: 10px;
    background: transparent; border: none; font: inherit; color: inherit; cursor: pointer;
    border-radius: 4px; }
  .pdfa-thumb:last-child { margin-bottom: 0; }
  /* The sheet itself. A border rather than a shadow, because a shadow on a 92px card in a
     124px box reads as blur. The background is white regardless of theme - it stands in
     for paper, and a dark placeholder would flash black before the page renders. */
  .pdfa-thumb-sheet { width: 100%; background: #fff; border: 1px solid var(--pdfa-border);
    border-radius: 2px; display: block; overflow: hidden; }
  .pdfa-thumb canvas { display: block; width: 100%; height: 100%; }
  .pdfa-thumb-num { font-size: 11px; opacity: .65; text-align: center; padding-top: 3px;
    font-variant-numeric: tabular-nums; }
  .pdfa-thumb:hover .pdfa-thumb-sheet { border-color: var(--pdfa-accent); }
  .pdfa-thumb:focus-visible { outline: 2px solid var(--pdfa-accent); outline-offset: 2px; }
  /* WHERE YOU ARE. A ring plus a full-strength number - the ring alone was hard to pick
     out against a page whose own content is mostly light, and the number alone is 11px of
     grey in a column of eleven other numbers. */
  .pdfa-thumb[aria-current="true"] .pdfa-thumb-sheet {
    border-color: var(--pdfa-accent); box-shadow: 0 0 0 2px var(--pdfa-accent); }
  .pdfa-thumb[aria-current="true"] .pdfa-thumb-num { opacity: 1; font-weight: 600;
    color: var(--pdfa-accent); }
  .pdfa-panel-title { display: flex; justify-content: space-between; align-items: center;
    font-weight: 600; padding: 2px 4px 8px; }
  .pdfa-panel-empty { opacity: .7; padding: 6px 4px; font-size: 12px; line-height: 1.4; }
  .pdfa-hl-row { display: flex; gap: 8px; padding: 7px 6px; border-radius: 6px;
    cursor: pointer; align-items: flex-start; }
  .pdfa-hl-row:hover { background: var(--pdfa-btn-hover); }
  /* The chip says color AND shape, so it takes its fill from a custom property rather
     than an inline background - the two band variants below need the same color in a
     pseudo-element, which an inline style cannot reach. */
  .pdfa-chip { width: 11px; height: 11px; border-radius: 3px; flex: 0 0 auto; margin-top: 3px;
    background: var(--pdfa-chip-color); }
  /* Same three shapes as the page, shrunk: a filled square, a bar at the bottom, a bar
     through the middle. Small, but it is the only thing in a row of quoted text that can
     say which kind of mark it came from, and a row that only showed color would make two
     marks on the same sentence indistinguishable. */
  .pdfa-chip-band { background: none; border-radius: 0; position: relative; }
  .pdfa-chip-band::after { content: ""; position: absolute; left: 0; right: 0; height: 3px;
    border-radius: 1px; background: var(--pdfa-chip-color); }
  .pdfa-chip-underline::after { bottom: 1px; }
  .pdfa-chip-strike::after { top: 4px; }
  .pdfa-hl-page { font-size: 11px; opacity: .6; margin-bottom: 2px; }
  .pdfa-hl-quote { font-size: 12px; line-height: 1.35; }
  /* Italic and indented so a note is never mistaken for the quoted text - the spec is
     explicit that the two must be clearly distinguishable. */
  .pdfa-hl-note { font-size: 12px; line-height: 1.35; opacity: .85; font-style: italic;
    margin-top: 4px; padding-left: 7px; border-left: 2px solid var(--pdfa-border); }

  /* ON-SCREEN SCROLL CONTROLS
     Reported on Android: a drag over the page area scrolls the NOTE, not the pages,
     so the PDF could not be scrolled vertically at all. Horizontal dragging works
     fine, and that asymmetry is the diagnosis - vertical is the host note's own
     scroll axis, so the app claims that gesture (otherwise a full-width embed would
     trap the scroll and you could never get past it), while nothing competes for
     horizontal. That decision is made outside this iframe and no CSS in here can
     take it back: overscroll-behavior on .pdfa-scroll only governs what happens once
     THIS element hits its end, not who owns the gesture to begin with.

     So the answer is a control that does not depend on a gesture at all. Programmatic
     scrolling is untouched by any of the above, which is why the page buttons in the
     toolbar have kept working throughout. Buttons rather than a slider: a slider needs
     precise dragging on a track barely wider than a finger, and has to sit on top of
     the text it is scrolling. */
  /* Above the highlights panel's own z-index, because these scroll the PANEL while it is
     open - it is unreachable by dragging for exactly the same reason the pages are. */
  .pdfa-scrollnav { display: none; position: absolute; right: 6px; top: 50%;
    transform: translateY(-50%); flex-direction: column; gap: 8px; z-index: 16; }
  .pdfa-scrollnav button { width: 40px; height: 40px; border-radius: 50%; font: inherit;
    font-size: 13px; line-height: 1; cursor: pointer; color: inherit; padding: 0;
    border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); opacity: .85;
    box-shadow: 0 1px 4px rgba(0,0,0,.25);
    display: flex; align-items: center; justify-content: center; }
  /* Bigger than the toolbar's 18px and at full strength - on touch these are the only way
     to scroll at all, so they are a primary control, not one of a bar of secondary ones. */
  .pdfa-scrollnav .pdfa-icon { width: 24px; height: 24px; opacity: 1; }
  .pdfa-scrollnav button:disabled { opacity: .35; }

  /* ---- NARROW EMBEDS -------------------------------------------------------
     Confirmed on a real Android phone running the Amplenote app: embeds DO render
     there, but at a phone note width (~358px) the toolbar wrapped to THREE rows -
     with the overflow button stranded alone on the third, the exact outcome the
     comment on #pdfa-more says it was grouped left to avoid - and the chrome above
     the pages ended up taller than the strip of page left below it.

     The query is on the EMBED's own width, not the device's. The iframe viewport IS
     the box Amplenote gives us, so "narrow here" already means "this viewer is
     narrow" - and it catches a cramped desktop sidebar too, which a device check
     would miss. */
  @media (max-width: 520px) {
    /* Dividers cost ~9px each and stop earning it once the rows wrap: the wrap
       itself is now what groups the controls. */
    .pdfa-sep { display: none; }
    /* There used to be a rule hiding the brand here, back when the expanded toolbar
       carried one. It does not any more - see the comment above .pdfa-toolbar in
       html.js - so the narrow case has nothing left to drop. */
    /* The spacer that corners the overflow button on a wide bar has to go here, or it
       absorbs the free space justify-content below needs to centre the wrapped rows -
       and a lone button pushed hard right on its own row is worse than a centred one. */
    .pdfa-toolbar .pdfa-spacer { display: none; }
    .pdfa-toolbar { gap: 4px; padding: 5px 6px; justify-content: center; }
    .pdfa-label { min-width: 44px; }
    /* Shrinks with the label it sits among - see .pdfa-zoom-field for why the zoom one
       needs a width of its own rather than inheriting the min-width above. Still wide
       enough for the longest value it can hold, "400%". */
    .pdfa-zoom-field { width: 46px; padding: 5px 2px; }
    /* Zoom was moved into the overflow menu here for one release, to buy back a 40px
       toolbar row. Reverted after use on a real phone: a stepper reached through a menu
       is worse than a second toolbar row, and the row costs proportionally less now that
       the box is taller (a phone gets ~358px rather than ~298px). Kept as a note rather
       than deleted silently, so the idea is not re-proposed as if untried. */
    /* Spans the body, since the row it shares is no longer competing with a page - but
       via "left" rather than a 100% width, so it keeps the same 8px inset on every side
       and stays a card. Going full-bleed here is what made it look like overflow. */
    .pdfa-panel { left: 8px; width: auto; max-width: none; }
  }

  /* ---- TOUCH POINTERS ------------------------------------------------------
     Hit areas only - nothing here changes what anything looks like on a mouse.
     The 44px figure is the WCAG 2.5.5 / platform HIG minimum; the toolbar's own
     buttons were 24-26px tall and the color swatches 20px across, with the four
     swatches sitting shoulder to shoulder. */
  @media (pointer: coarse) {
    /* The only place these appear. A mouse has a wheel and a trackpad has two-finger
       scrolling, neither of which the host note competes for. */
    .pdfa-scrollnav { display: flex; }
    /* Room for those buttons down the panel's right edge, so a highlight's text never
       runs underneath them. Only on touch, and only while the panel is open - a mouse
       never sees the buttons at all, so it must not pay for the gutter.

       On the SCROLLING child, not the card: the card clips and has no padding of its own
       now (see .pdfa-panel), so padding here would have done nothing at all. */
    .pdfa-panel.pdfa-open .pdfa-panel-scroll { padding-right: 54px; }
    /* :not(.pdfa-color) is load-bearing. The swatches ARE buttons in this toolbar, so
       without it they inherit min-height and render as 40x20 ellipses - caught by
       measuring, not by reading. They get their bigger hit area from ::after below,
       which leaves the circle alone. */
    .pdfa-toolbar button:not(.pdfa-color) { min-height: 40px; padding: 8px 12px; }
    /* Not a button, so the rule above skips it - and a 26px-tall text field wedged
       between two 40px buttons is both the odd one out and the hardest thing in the
       toolbar to tap accurately. */
    .pdfa-zoom-field { min-height: 40px; }
    /* Square, not the 8px 12px above - an icon button has no text to pad around, and the
       extra width would push a phone's toolbar into another row. */
    .pdfa-toolbar button.pdfa-icon-btn { min-width: 40px; padding: 8px; }
    .pdfa-btn { min-height: 38px; }
    .pdfa-hl-row { padding: 11px 8px; }
    /* A bigger target without a bigger circle: an invisible overlay centred on the
       swatch, reaching past its 20px visual to 42px. Four 44px circles would
       dominate a toolbar that is already the tallest thing in the box on a phone,
       and the swatch's size is what makes it read as a color chip rather than a
       button. */
    .pdfa-color, .pdfa-toolbar .pdfa-color { position: relative; }
    .pdfa-color::after { content: ""; position: absolute; inset: -10px -5px; }
    /* The four swatches sit shoulder to shoulder, so the hit areas above would run
       into each other and a near-miss would apply the wrong color - the one mis-tap
       in this toolbar that silently changes the document. Spreading them gives each
       one room to be 30px wide without touching its neighbour. */
    #pdfa-colors { display: inline-flex; gap: 10px; vertical-align: middle; }
    /* The shape group needs no spreading of its own - each button is already a 40px
       square from the icon-button rule above, so the targets cannot overlap. It is
       declared here only so the three read as one control rather than three loose
       buttons once they are that wide. */
    #pdfa-styles { display: inline-flex; align-items: center; gap: 0; }
    /* THE MARK CARD gets the same treatment as the toolbar, for the same reason: the
       ::after hit areas above reach 5px past each swatch on both sides, so swatches
       7px apart have OVERLAPPING targets and the later one in the DOM wins - a near
       miss silently recolors the mark. 12px is the smallest gap that separates them.
       The width grows by exactly the 15px that adds (see .pdfa-popover.pdfa-mark).

       The drawer's padding does the same job vertically: those hit areas reach 10px
       above and below a 20px circle, so the strip's row and the drawer's need 20px
       between them before a tap in the band can only mean one of the two. */
    .pdfa-popover.pdfa-mark { width: 285px; }
    .pdfa-mark-colors { gap: 12px; }
    .pdfa-drawer { gap: 12px; padding-top: 14px; }
    /* Square targets for the three icon-only actions. Free: row 2's spacer absorbs it,
       so the card's width does not move. */
    .pdfa-btn.pdfa-icon-only { min-width: 38px; justify-content: center; }
    /* The whole collapsed bar becomes the tap target, not just its Expand button.
       The bar's box is sized by data-aspect-ratio as a fraction of the note width
       (see constants.js), so on a phone it is ~22px tall - too short to ever hold a
       44px button. Full-bleed width is what makes it comfortably tappable instead. */
    .pdfa-collapsed { cursor: pointer; }
  }

  /* The collapsed bar, when its box is shorter than the bar's natural height.
     Measured: the bar wants 44px, but width/16 at a 358px phone note width gives
     the iframe only 22px, so it was being cut in half. The box cannot adapt per
     device - data-aspect-ratio is written into the shared note markup, so one value
     has to serve every screen - which leaves compressing the CONTENT as the only
     lever. A height query works here because the iframe viewport is the box. */
  @media (max-height: 34px) {
    .pdfa-collapsed { padding: 0 8px; gap: 6px; font-size: 12px; height: 100%; }
    .pdfa-collapsed .pdfa-btn { padding: 0 8px; min-height: 0; font-size: 11px; }
    .pdfa-collapsed-count { display: none; }
  }
`;
