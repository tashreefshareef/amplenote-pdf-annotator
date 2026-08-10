/**
 * Tests for the embed HTML builder.
 *
 * The viewer JS itself can't be unit tested — it needs a real iframe, PDF.js and the
 * plugin bridge. What CAN be checked is that the HTML wrapper is well-formed and safe,
 * which is where the silent, hard-to-debug failures live: a broken script tag or an
 * unescaped filename yields a blank embed with no error anywhere.
 */
import { buildEmbedHtml } from "../src/embed/html.js";
import { CDN, HIGHLIGHT_COLORS, DEFAULT_COLOR_ID } from "../src/constants.js";

describe("buildEmbedHtml", () => {
  const html = (over = {}) =>
    buildEmbedHtml({ attachmentUUID: "att-1", attachmentName: "paper.pdf", ...over });

  // Scenario: the viewer needs its config and the exact library versions verified to
  // work inside the embed.
  test("injects config and the pinned PDF.js library and worker", () => {
    const out = html();
    expect(out).toContain('"attachmentUUID":"att-1"');
    expect(out).toContain(CDN.pdfJs);
    expect(out).toContain(CDN.pdfJsWorker);
  });

  // Scenario: a "</script>" sequence inside injected data would terminate the script
  // element early and break the whole embed. Config JSON must have its "<" escaped.
  test("escapes < in injected JSON so it cannot close the script tag", () => {
    const out = buildEmbedHtml({ attachmentUUID: "a</script><script>alert(1)</script>" });
    expect(out).toContain("\\u003c");
    expect(out).not.toContain("a</script><script>");
  });

  // Scenario: PDF filenames are user-controlled and routinely contain & and quotes.
  // Unescaped, they break the toolbar markup.
  test("escapes the attachment name before putting it in markup", () => {
    const out = html({ attachmentName: 'Tom & "Jerry" <b>.pdf' });
    expect(out).toContain("Tom &amp; &quot;Jerry&quot; &lt;b&gt;.pdf");
    expect(out).not.toContain("<b>.pdf");
  });

  // Scenario: dark mode must actually change the palette, not just be accepted.
  test("applies the dark palette when asked", () => {
    expect(html({ lightDarkMode: "dark" })).toContain("--pdfa-bg:#1e2126");
    expect(html({ lightDarkMode: "light" })).toContain("--pdfa-bg:#f6f7f9");
    // Unknown values fall back rather than producing an unstyled embed.
    expect(html({ lightDarkMode: "sepia" })).toContain("--pdfa-bg:#f6f7f9");
  });

  // Scenario: the deep-link page must reach the viewer's config (spec §7.3).
  test("passes a deep-link page through to the viewer config", () => {
    expect(html({ page: 7 })).toContain('"page":7');
  });

  // Scenario: Phase 5's exported links carry a highlight id, which is more precise than
  // a page. Spec §7.3 warns that retrofitting the deep-link path later is the expensive
  // route, so the id has to reach the viewer now.
  test("passes a deep-link highlight id through to the viewer config", () => {
    expect(html({ highlightId: "hl-abc123" })).toContain('"highlightId":"hl-abc123"');
    expect(html()).toContain('"highlightId":null');
  });

  // Scenario: the panel overlays the pages rather than taking width from them. The
  // embed is often barely wider than a page, so a panel that reflowed the layout would
  // squeeze the PDF every time it opened.
  test("overlays the highlights panel instead of reflowing the pages", () => {
    const out = html();
    const panel = out.match(/\.pdfa-panel\s*\{[^}]*\}/)[0];
    expect(panel).toMatch(/position:\s*absolute/);
    // Inset from the body's edges, not flush with them - flush against the right and
    // bottom it read as bleeding out of the viewer, since nothing marked where the panel
    // stopped and the embed ended. Reported live as "it overflows to the right and
    // bottom" even though the box measured exactly inside the body.
    expect(panel).toMatch(/border-radius/);
    expect(panel).not.toMatch(/right:\s*0/);
    expect(panel).not.toMatch(/bottom:\s*0/);
    // Its containing block must be the body wrapper, not the whole root, or it would
    // cover the toolbar.
    expect(out).toMatch(/\.pdfa-body\s*\{[^}]*position:\s*relative/);
    expect(out).toContain('<div class="pdfa-body">');
  });

  // Scenario: spec §4 requires the highlighted text and the user's note to be clearly
  // distinguishable. In the panel that separation is visual, so it is pinned here.
  test("styles a highlight's note distinctly from its quoted text", () => {
    const out = html();
    const note = out.match(/\.pdfa-hl-note\s*\{[^}]*\}/)[0];
    const quote = out.match(/\.pdfa-hl-quote\s*\{[^}]*\}/)[0];
    expect(note).toMatch(/font-style:\s*italic/);
    expect(note).toMatch(/border-left/);
    expect(quote).not.toMatch(/font-style:\s*italic/);
  });

  // Scenario: the elements the viewer wires up by id must exist, or it throws on boot
  // and the embed renders blank.
  test("contains every element the viewer script binds to", () => {
    const out = html();
    for (const id of [
      "pdfa-root", "pdfa-pages", "pdfa-status", "pdfa-page-label",
      "pdfa-zoom-label", "pdfa-prev", "pdfa-next", "pdfa-zoom-in", "pdfa-zoom-out",
      "pdfa-colors", "pdfa-hint", "pdfa-popover", "pdfa-panel", "pdfa-list-toggle", "pdfa-count",
      "pdfa-more", "pdfa-open", "pdfa-collapsed-count",
      "pdfa-scroll-up", "pdfa-scroll-down",
    ]) {
      expect(out).toContain(`id="${id}"`);
    }
    expect(out).toContain("pdfa-scroll");
    expect(out).toContain("pdfa-name");
  });

  // Scenario: a default-collapsed embed, requiring an "Expand" click before every
  // annotation, was tried and explicitly rejected live - it added a forced extra step to
  // something that should just be there. The embed always starts fully expanded now;
  // collapsing (the SAME markup below, .pdfa-collapsed) is a manual, on-demand toolbar
  // action instead (see viewer.js's collapseViewer), never the initial state.
  test("always starts expanded, never collapsed on initial render", () => {
    // The class name still appears in the <style> block's own selectors regardless -
    // it's specifically the ROOT DIV's opening tag that must not carry it.
    expect(html()).toContain('id="pdfa-root">');
    expect(html({ page: 3 })).toContain('id="pdfa-root">');
    expect(html({ highlightId: "hl-1" })).toContain('id="pdfa-root">');
    // The collapsed bar's own markup is still present - it's what collapseViewer reveals
    // later - just not the state the embed opens into.
    expect(html()).toContain('id="pdfa-open"');
  });

  // Scenario: the spec is explicit that all four colors are top-level toolbar buttons,
  // switchable in a single click - no dropdown, no sidebar. The viewer mounts them from
  // config, so every color has to reach the embed with the hex it will paint.
  test("passes all four highlight colors to the viewer", () => {
    const out = html();
    expect(HIGHLIGHT_COLORS).toHaveLength(4);
    for (const color of HIGHLIGHT_COLORS) {
      expect(out).toContain(`"id":"${color.id}"`);
      expect(out).toContain(`"hex":"${color.hex}"`);
      expect(out).toContain(`"label":"${color.label}"`);
    }
    expect(out).toContain(`"defaultColorId":"${DEFAULT_COLOR_ID}"`);
    // The color buttons sit in the toolbar, not in a panel below it.
    const toolbar = out.match(/<div class="pdfa-toolbar">[\s\S]*?<\/div>/)[0];
    expect(toolbar).toContain('id="pdfa-colors"');
  });

  // Scenario: rgb reaches the embed because Download writes native annotations
  // CLIENT-SIDE, reusing data already loaded rather than round-tripping through the
  // plugin bridge (string-only - see docs/api-notes.md).
  //
  // cycleIndex used to ride along for the export marker and no longer does: it named
  // Amplenote's cycle-color node, which is what underlined every exported link (see
  // export.js's header). Asserted as an absence so it cannot quietly return - the marker
  // is a plain background hex, and the hex is already here for the swatches.
  test("sends rgb for pdf-lib, and no longer sends the cycle index", () => {
    const out = html();
    for (const color of HIGHLIGHT_COLORS) {
      expect(out).toContain(`"rgb":[${color.rgb.join(",")}]`);
      expect(out).toContain(`"hex":"${color.hex}"`);
    }
    expect(out).not.toContain('"cycleIndex"');
  });

  // Scenario: the deep link an exported highlight carries is built from this plugin's
  // own note uuid (src/export.js) - it has to reach the viewer's config the same way
  // attachmentUUID and highlightId already do.
  test("passes the plugin's own uuid through for building export deep links", () => {
    expect(html({ pluginUUID: "plugin-uuid-1" })).toContain('"pluginUUID":"plugin-uuid-1"');
    expect(html()).toContain('"pluginUUID":null');
  });

  // Scenario: the overlay must sit ABOVE the rendered page but BELOW the text layer, or
  // highlighted text stops being selectable - which is exactly where a user wants to
  // re-highlight. It also must not take pointer events, since clicks are resolved by
  // hit-testing stored coordinates instead.
  test("layers the highlight overlay under the text layer and out of the pointer path", () => {
    const out = html();
    const overlay = out.match(/\.pdfa-highlights\s*\{[^}]*\}/)[0];
    expect(overlay).toMatch(/pointer-events:\s*none/);
    // A z-index here would create a stacking context and isolate mix-blend-mode from
    // the canvas it is supposed to blend with.
    expect(overlay).not.toMatch(/z-index/);
    expect(out).toMatch(/\.textLayer\s*\{\s*z-index:\s*2/);
  });

  // Scenario: TWO live-reported bugs, same underlying cause, different scope each time.
  // First: a multi-line highlight showed a darker seam at every line boundary within
  // ITSELF (adjacent line rects of one highlight can genuinely overlap by a pixel or two
  // - descender ink dipping into the next line's ascender space). Fixing that by
  // isolating each highlight's OWN group left the identical seam wherever two DIFFERENT
  // highlights' rects touched (a recolored highlight beside another, two highlights on
  // adjacent lines) - each was its own isolated group, so two groups touching still each
  // multiplied the page independently. The fix has to isolate the WHOLE overlay layer,
  // not any one highlight, so every rect on the page - regardless of which highlight
  // owns it - flattens together once before the single blend against the canvas.
  test("blends the entire highlight overlay as one isolated group, not per highlight or per rect", () => {
    const out = html();
    const layer = out.match(/\.pdfa-highlights\s*\{[^}]*\}/)[0];
    expect(layer).toMatch(/mix-blend-mode:\s*multiply/);
    expect(layer).toMatch(/isolation:\s*isolate/);

    // Nothing INSIDE that layer may carry its own blend mode or isolation, or it
    // re-isolates its own subtree and reintroduces exactly the bug this fixes - a
    // highlight (or a single rect) sealed off from the rest of the layer, doubling the
    // color again wherever it touches a neighbour.
    const group = out.match(/\.pdfa-hl-group\s*\{[^}]*\}/)[0];
    expect(group).not.toMatch(/mix-blend-mode/);
    expect(group).not.toMatch(/isolation/);
    const rect = out.match(/\.pdfa-hl\s*\{[^}]*\}/)[0];
    expect(rect).not.toMatch(/mix-blend-mode/);
  });

  // Scenario: Amplenote renders its OWN PDF preview for an attachment, and both can
  // appear in the same note looking broadly alike. Without a label there is no
  // reliable way — for a user or for testing — to tell which viewer is on screen.
  test("labels itself so it cannot be confused with Amplenote's built-in PDF preview", () => {
    const out = html();
    expect(out).toContain("pdfa-brand");
    expect(out).toContain(">PDF Annotator<");
  });

  // Scenario: reported live, with screenshots of the embed sitting under Amplenote's own
  // editor toolbar - the viewer read as a foreign widget. Two causes, both fixed here.
  //
  // (1) The chrome was drawn in typographic characters - &#8249; &#8250; &#8722; &#8942; -
  // where every icon in the toolbar directly above the embed is Material Icons. That is
  // not a guess about their design: the Amplenote app preloads
  // materialicons-latin-400normal.woff2 and computes "Roboto, sans-serif" on its body.
  // A character and a 24-grid icon differ in weight, optical size and baseline, and no
  // amount of spacing hides it when the two bars are 30px apart.
  test("draws the toolbar in Material Icons rather than typographic characters", () => {
    const out = html();
    const toolbar = out.match(/<div class="pdfa-toolbar">[\s\S]*?<\/div>/)[0];
    for (const entity of ["&#8249;", "&#8250;", "&#8722;", "&#8942;"]) {
      // The comment above names them as history; only the BUTTONS must be free of them.
      expect(toolbar.replace(/<!--[\s\S]*?-->/g, "")).not.toContain(entity);
    }
    expect(toolbar).toContain("<svg");
    // Material's own 24x24 grid, so the glyphs stay optically consistent with the set
    // above them - a 16 or 20 grid would land the strokes on different pixels.
    expect(toolbar).toContain('viewBox="0 0 24 24"');
    // currentColor, so one icon serves the light and dark palettes.
    expect(out).toMatch(/\.pdfa-icon\s*\{[^}]*fill:\s*currentColor/);
    // Icon-only buttons need a name for a screen reader, and the graphic itself must not
    // be announced a second time alongside it.
    for (const label of ["Previous page", "Next page", "Zoom out", "Zoom in", "More actions"]) {
      expect(toolbar).toContain(`aria-label="${label}"`);
    }
    expect(toolbar).toContain('aria-hidden="true"');
  });

  // Scenario: (2) the same report's other half - the type. Amplenote's UI is Roboto, and
  // the embed is a separate document, so the host's copy is not available to it and its
  // asset URL is content-hashed besides. The font must therefore be requested here, and
  // must degrade to the previous stack rather than to a serif if the request is blocked -
  // this is the only asset the plugin loads off the CDN verified against the embed's CSP.
  test("asks for Amplenote's own UI font, with the old stack as the fallback", () => {
    const out = html();
    expect(out).toContain(CDN.robotoCss.replace(/&/g, "&amp;"));
    // A raw & in an href is not a parse error, but it is the kind of thing that becomes
    // one the moment a parameter name collides with an entity - so it is escaped.
    expect(out).not.toContain("wght@400;500&display");
    expect(out).toMatch(/font:\s*13px Roboto,[^;]*"Segoe UI", sans-serif/);
  });

  // Scenario: from the same screenshots - the viewer ran to the edges of its box with
  // only a bottom rule under the toolbar, so nothing said where the note ended and the
  // embed began. Every other embed in a note is a bordered card (PDF++ was the reference
  // put forward). The corners must show the NOTE through, not a white notch, which is
  // what the transparent body is for.
  test("draws the viewer as a bordered card rather than a bare rectangle", () => {
    const out = html();
    const root = out.match(/#pdfa-root \{[^}]*\}/)[0];
    expect(root).toMatch(/border:\s*1px solid var\(--pdfa-border\)/);
    expect(root).toMatch(/border-radius/);
    // Without this the radius is decorative - the toolbar's own square corners paint
    // straight over it.
    expect(root).toMatch(/overflow:\s*hidden/);
    expect(out).toMatch(/body \{[^}]*background:\s*transparent/);
    // The popovers are position:fixed, so that clip must not reach them. Nothing here may
    // establish a containing block for a fixed element (transform, filter, contain) or
    // the color picker gets cut off at the viewer's edge.
    expect(out).not.toMatch(/#pdfa-root \{[^}]*(transform|filter|contain):/);
    // Collapsed, the bar IS the card - its own bottom rule would double the root's border.
    expect(out).toMatch(/\.pdfa-collapsed-mode \.pdfa-collapsed \{[^}]*border-bottom:\s*none/);
  });

  // Scenario: the popovers were the last surface still speaking the old dialect - bordered
  // chips at 12px - while the toolbar and the overflow menu had both moved to borderless
  // controls with a tint on hover. Three button styles in one plugin is the thing that
  // reads as "not designed", so the base button now matches the bar it sits under.
  test("gives popover buttons the toolbar's borderless vocabulary", () => {
    const out = html();
    const btn = out.match(/\n {2}\.pdfa-btn \{[^}]*\}/)[0];
    expect(btn).toMatch(/border:\s*1px solid transparent/);
    expect(btn).toMatch(/background:\s*transparent/);
    // Transparent rather than none, so the primary variant can put a border back without
    // moving anything by a pixel - the same idiom the toolbar buttons use.
    expect(btn).not.toMatch(/border:\s*none/);
    expect(out).toMatch(/\.pdfa-btn:hover \{[^}]*background:\s*var\(--pdfa-btn-hover\)/);
    // Which is exactly what makes the primary one carry weight now that it is the only
    // action in the popover wearing a box.
    expect(out).toMatch(/\.pdfa-btn-primary \{[^}]*border-color:\s*var\(--pdfa-accent\)/);
  });

  // Scenario: found while aligning the popover - viewer.js has been tagging Remove,
  // "Remove viewer..." and its confirm with .pdfa-remove all along, and no rule ever
  // matched it. The action that throws work away rendered identically to Copy. A styleless
  // class is invisible in review precisely because the markup looks correct.
  test("colors the destructive action, which nothing was doing", () => {
    const out = html();
    const rule = out.match(/\.pdfa-remove \{[^}]*\}/)[0];
    expect(rule).toMatch(/color:\s*var\(--pdfa-error\)/);
    // Defined in both palettes, or it is invisible in one of them.
    expect(html({ lightDarkMode: "light" })).toContain("--pdfa-error:");
    expect(html({ lightDarkMode: "dark" })).toContain("--pdfa-error:");
  });

  // Scenario: the popovers are built at runtime by viewer.js, which is serialized
  // standalone and can import nothing - so it cannot reach the icon table the markup uses.
  // The paths have to travel as config, the same way the colors already do.
  test("sends the menu icons to the viewer as config, and builds them in the SVG namespace", () => {
    const out = html();
    expect(out).toMatch(/"icons":\{"note":"M/);
    for (const key of ["copy", "send", "remove", "download", "postAdd", "collapse"]) {
      expect(out).toContain(`"${key}":"M`);
    }
    // createElementNS, not createElement: an <svg> built in the HTML namespace is an
    // unknown element and renders nothing, which looks like a missing icon rather than a
    // bug. Same for the class - .className on an SVG element is a read-only
    // SVGAnimatedString, so assigning to it fails silently.
    expect(out).toContain('createElementNS(ns, "svg")');
    expect(out).not.toMatch(/createElement\("svg"\)/);
    expect(out).toContain('svg.setAttribute("class", "pdfa-icon")');
  });

  // Scenario: the brand colour has to exist in both palettes, or the label is
  // invisible in one of them.
  test("defines an accent colour in both themes", () => {
    expect(html({ lightDarkMode: "light" })).toContain("--pdfa-accent:");
    expect(html({ lightDarkMode: "dark" })).toContain("--pdfa-accent:");
  });

  // Scenario: span boxes on consecutive lines overlap. If the selection colour were
  // translucent, each span would paint its own layer and the alpha would compound into
  // dark seams between lines. Opacity must sit on the CONTAINER (compositing the spans
  // as one group) with an OPAQUE selection colour. Regressing this looks like a subtle
  // rendering blemish rather than a bug, so it is pinned.
  test("fades the text layer as a group, with an opaque selection colour", () => {
    const out = html();
    expect(out).toMatch(/\.textLayer\s*\{[^}]*opacity:\s*0?\.\d+/);
    // The selection rule must not use a translucent colour.
    const selectionRule = out.match(/\.textLayer > span::selection\s*\{[^}]*\}/)[0];
    expect(selectionRule).not.toMatch(/rgba|hsla/);
    expect(selectionRule).toMatch(/background:\s*#[0-9a-f]{3,8}/i);
  });

  // Scenario: if the upstream stylesheet fails to load, `color: transparent` is what
  // stops every glyph being painted a second time over the canvas — which looks like a
  // corrupted PDF rather than a missing CSS file.
  test("keeps text layer glyphs transparent even without the upstream stylesheet", () => {
    expect(html()).toMatch(/\.textLayer > span\s*\{[^}]*color:\s*transparent/);
  });

  // Scenario: the text layer's geometry is coupled to what renderTextLayer emits.
  // Hand-rolled substitutes caused two positioning bugs, so the upstream stylesheet
  // must be linked, and it must come before ours so our overrides win.
  test("links PDF.js's own viewer stylesheet ahead of our overrides", () => {
    const out = html();
    expect(out).toContain(CDN.pdfViewerCss);
    expect(out.indexOf(CDN.pdfViewerCss)).toBeLessThan(out.indexOf("<style>"));
  });

  // Scenario: THE bug that silently broke the first live run. The viewer source is
  // full of double quotes; putting it in an onload="..." attribute truncates it at the
  // first one and it never executes. The symptom is indistinguishable from a hang —
  // the static "Loading..." markup simply stays on screen. It must be invoked from its
  // own script block instead.
  test("invokes the viewer from a script block, never from an inline event attribute", () => {
    const out = html();
    expect(out).not.toMatch(/onload\s*=\s*"/);
    expect(out).not.toMatch(/onerror\s*=\s*"/);
    expect(out).toContain("__PDFA_CONFIG || {}");
  });

  // Scenario: the second live failure. Amplenote re-executes the embed's inline
  // scripts immediately, so an external <script src> is still downloading when the
  // viewer starts and window.pdfjsLib is undefined. The library URL must instead be
  // handed to the viewer, which loads it and waits for onload.
  test("does not use a script src tag for PDF.js; passes the URL in config instead", () => {
    const out = html();
    expect(out).not.toMatch(/<script[^>]+src=/);
    expect(out).toContain(`"pdfJsSrc":"${CDN.pdfJs}"`);
  });

  // Scenario: a CDN failure must be reported, not left as a blank frame.
  test("reports a missing PDF.js library from inside the viewer", () => {
    expect(html()).toContain("Could not load PDF.js from the CDN");
  });

  // Scenario: Phase 4's Download button needs pdf-lib, loaded the same lazy way as
  // PDF.js and for the identical reason - a plain <script src> would still be
  // downloading when Amplenote re-executes the embed's inline scripts. Unlike PDF.js,
  // pdf-lib is loaded only when Download is first clicked, not on boot.
  test("passes pdf-lib's CDN url in config rather than a script src tag", () => {
    const out = html();
    expect(out).not.toMatch(/<script[^>]+src=/);
    expect(out).toContain(`"pdfLibSrc":"${CDN.pdfLib}"`);
    expect(out).toContain("Could not load pdf-lib from the CDN");
  });

  // Scenario: two script blocks — config and the viewer — each properly opened and
  // closed. An unbalanced pair makes the browser swallow the rest of the embed as
  // script text and render nothing.
  test("emits two balanced script blocks", () => {
    const out = html();
    expect((out.match(/<script>/g) || []).length).toBe(2);
    expect((out.match(/<\/script>/g) || []).length).toBe(2);
  });

  // Scenario: the viewer function is serialized into an inline script INCLUDING its
  // comments. A literal closing script tag anywhere in that source — even inside a
  // comment — would terminate the block early and break the whole embed. Easy to
  // reintroduce while documenting script loading, hence the guard.
  test("the serialized viewer source contains no closing script tag", () => {
    const out = html();
    // Everything after the config block is the viewer body plus its own closer.
    const viewerBlock = out.slice(out.indexOf("__PDFA_CONFIG || {}"));
    expect((viewerBlock.match(/<\/script>/g) || []).length).toBe(1);
  });

  // Scenario: the same hazard for the second serialized function. The geometry module's
  // source is injected alongside the config so the embed runs the code the Jest suite
  // covers rather than an untested transcription of it.
  test("injects the tested geometry helpers, with a script-safe source", () => {
    const out = html();
    expect(out).toContain("window.__PDFA_GEOM");
    // The functions the viewer actually calls off that object.
    for (const fn of [
      "clientRectsToPdfRects",
      "pdfRectToViewportRect",
      "mergeLineRects",
      "hitTestHighlights",
      "normalizeQuoteText",
    ]) {
      expect(out).toContain(fn);
    }
    // The config block runs from the start of the document to where the viewer begins.
    const configBlock = out.slice(0, out.indexOf("__PDFA_CONFIG || {}"));
    expect((configBlock.match(/<\/script>/g) || []).length).toBe(1);
  });

  // Scenario: the same hazard for the third serialized function. The pdf-lib annotation
  // writer's source is injected alongside config and geometry so Download runs the code
  // the Jest suite exercises against the real pdf-lib package, not an untested
  // transcription of the spike.
  test("injects the tested annotation writer, with a script-safe source", () => {
    const out = html();
    expect(out).toContain("window.__PDFA_ANNOTATIONS");
    expect(out).toContain("writeHighlightsIntoPdf");
    // Still inside the SAME first script block as config and geometry - no new
    // <script> tag, or "emits two balanced script blocks" above would catch it.
    const configBlock = out.slice(0, out.indexOf("__PDFA_CONFIG || {}"));
    expect((configBlock.match(/<\/script>/g) || []).length).toBe(1);
  });

  // Scenario: the fourth serialized function. The export builder's source is injected
  // alongside config, geometry and the annotation writer so Copy / Send to note /
  // Export all all run the code the Jest suite checks against the bounty's export
  // format requirement, not an untested transcription of it.
  test("injects the tested export builder, with a script-safe source", () => {
    const out = html();
    expect(out).toContain("window.__PDFA_EXPORT");
    expect(out).toContain("buildHighlightBlock");
    const configBlock = out.slice(0, out.indexOf("__PDFA_CONFIG || {}"));
    expect((configBlock.match(/<\/script>/g) || []).length).toBe(1);
  });

  // Scenario: the coordinate transform is PDF.js's, in both directions. Every past
  // positioning bug in this project came from substituting hand-written math for it, so
  // the viewer must be calling the real thing.
  test("the viewer uses PDF.js's own coordinate conversion in both directions", () => {
    const out = html();
    expect(out).toContain("convertToPdfPoint");
    expect(out).toContain("convertToViewportPoint");
  });

  // Scenario: THE mobile blocker, confirmed on Android in the Amplenote app. A long-press
  // selects text natively - handles and all - but no mouseup is ever delivered, so the
  // mouseup listener that drives capture never ran and the colors never appeared:
  // highlighting, the whole point of the plugin, was unreachable on a phone. Taps were
  // fine throughout, which is what isolated it to the mouse events. Capture therefore has
  // to have a second, mouse-free trigger.
  test("captures a selection without a mouseup, for touch", () => {
    const out = html();
    expect(out).toContain('addEventListener("selectionchange"');
    expect(out).toContain("captureSettledSelection");
  });

  // Scenario: the two triggers must not fight. mouseup stays scoped to the pages element
  // - on document it would also fire when the mouse is released on a toolbar button, by
  // which point the browser has collapsed the selection and the pending capture would be
  // thrown away right before a color is picked. selectionchange has no element-scoped
  // form, so it can only live on document, which is exactly why it is forbidden from
  // clearing pending state and why it skips a selection the mouse already captured.
  test("keeps mouseup scoped to the pages, and never lets the touch path clear pending state", () => {
    const out = html();
    expect(out).toContain('els.pages.addEventListener("mouseup", captureSelection)');
    expect(out).not.toContain('document.addEventListener("mouseup"');
    // The identity check that makes the settled capture a no-op once mouseup has won.
    expect(out).toContain("state.lastCapturedText");
    // The settled path only ever adds - the sole setPending(null) calls belong to
    // captureSelection, reached from mouseup.
    const settled = out.match(/function captureSettledSelection\(\)[\s\S]*?\n {2}}/)[0];
    expect(settled).not.toContain("setPending(null)");
    expect(settled).not.toContain("closePopover");
  });

  // Scenario: reported live with screenshots from both desktop and phone - the filename
  // had a row of its own directly beneath Amplenote's attachment chip, which carries the
  // SAME filename, so the name appeared twice within about 30px and cost a full row of a
  // box that is short to begin with. The row is gone; the name survives on the collapsed
  // bar and at the head of the overflow menu, which covers the one case the chip does
  // not (a viewer moved away from its own chip).
  test("does not repeat the filename that Amplenote's own chip already shows", () => {
    const out = html({ attachmentName: "paper.pdf" });
    expect(out).not.toContain("pdfa-filename-bar");
    // Still exactly one place the name is written into the markup, so setAttachmentName
    // keeps a single code path and the export name cannot drift from the displayed one.
    expect(out).toContain('<span class="pdfa-name" hidden>');
    // The collapsed bar keeps its own copy - there is no chip visible when collapsed.
    expect(out).toContain('class="pdfa-collapsed-name"');
    // The overflow menu does NOT. The name briefly moved there when its toolbar row was
    // removed, which just relocated the duplication - the chip is directly above the
    // embed either way - and the menu's width truncated it to an ellipsis besides.
    expect(out).not.toContain("pdfa-menu-name");
  });

  // Scenario: the brand is what distinguishes this viewer from Amplenote's own PDF
  // preview of the same attachment, which can sit in the same note looking broadly
  // alike. It is dropped ONLY on a narrow embed, where a full row costs more than the
  // ambiguity - and there it is still reachable from the overflow menu.
  test("keeps the brand in the toolbar, dropping it only where a row is too expensive", () => {
    const out = html();
    const toolbar = out.match(/<div class="pdfa-toolbar">[\s\S]*?<\/div>/)[0];
    expect(toolbar).toContain('class="pdfa-brand"');
    // Visible by default - only the narrow query may hide it.
    expect(out).not.toMatch(/\n\s*\.pdfa-brand\s*\{[^}]*display:\s*none/);
    const narrow = out.match(/@media \(max-width: 520px\)[\s\S]*?\n {2}\}/)[0];
    expect(narrow).toMatch(/\.pdfa-toolbar \.pdfa-brand\s*\{\s*display:\s*none/);
  });

  // Scenario: the color swatches ARE buttons in this toolbar, so a bare
  // ".pdfa-toolbar button { min-height }" for touch targets caught them too and rendered
  // the four circles as 40x20 ellipses. Found by measuring, not by reading. The swatches
  // get their larger hit area from an ::after overlay instead, which leaves the circle
  // untouched - and the four sit shoulder to shoulder, so those hit areas must not
  // overlap either: a near-miss would silently apply the wrong color.
  test("grows touch targets without deforming the color swatches", () => {
    const out = html();
    const coarse = out.match(/@media \(pointer: coarse\)[\s\S]*?\n {2}\}/)[0];
    expect(coarse).toMatch(/\.pdfa-toolbar button:not\(\.pdfa-color\)\s*\{[^}]*min-height/);
    // The swatch keeps its own size and gains an overlay.
    expect(coarse).not.toMatch(/\.pdfa-color\s*\{[^}]*min-height/);
    expect(coarse).toMatch(/\.pdfa-color::after\s*\{[^}]*position:\s*absolute/);
    // Spread far enough apart that the overlays cannot collide.
    expect(coarse).toMatch(/#pdfa-colors\s*\{[^}]*gap:\s*10px/);
  });

  // Scenario: on Android the host note claims the vertical drag, so the page area could
  // not be scrolled by dragging it at all - while horizontal dragging worked, since
  // nothing competes for that axis. That is decided outside this iframe, so the fix has
  // to be a control that needs no gesture. Touch-only: a wheel and a trackpad are
  // uncontested.
  test("offers gesture-free scroll controls on touch", () => {
    const out = html();
    const nav = out.match(/\.pdfa-scrollnav\s*\{[^}]*\}/)[0];
    expect(nav).toMatch(/display:\s*none/);
    expect(nav).toMatch(/position:\s*absolute/);
    const coarse = out.match(/@media \(pointer: coarse\)[\s\S]*?\n {2}\}/)[0];
    expect(coarse).toMatch(/\.pdfa-scrollnav\s*\{\s*display:\s*flex/);
    // Scrolls the region itself - not scrollIntoView on a page, which would jump a whole
    // page rather than a screenful.
    expect(out).toContain("scrollByScreen");
  });

  // Scenario: two user-facing messages that told people something untrue, found by asking
  // "who else reads this?" rather than by anything failing.
  //
  // The download fallback asserted "this app blocks saving files" on the strength of the
  // pointer being coarse - but touch is not proof of failure. The mobile app swallows the
  // download; Amplenote in a tablet browser saves the file normally, and that reader was
  // being told their download failed while it sat in their downloads folder. Nothing can
  // detect which happened, so the copy has to be conditional.
  //
  // And "Sent to the bottom of this note" stopped being true when exports moved ABOVE the
  // managed data section - the fix for them being wiped by the next save. The message
  // outlived the behaviour it described and sent people looking in the wrong place.
  test("does not claim outcomes it cannot verify, or places it no longer puts things", () => {
    const out = html();
    // Conditional, not a diagnosis.
    expect(out).toContain("If no file appeared");
    expect(out).not.toContain("this app blocks saving files");
    // The export goes above the managed section now, so nothing may promise "the bottom".
    expect(out).not.toMatch(/Sent to the bottom/);
    expect(out).toContain("Added to this note");
  });

  // Scenario: the host note owns the vertical drag inside the embed and will not give it
  // up - CSS (overscroll-behavior), a non-passive touchmove calling preventDefault, and
  // focus were each tried on a real device and none of them moved it, which puts the
  // arbitration above the iframe and out of reach. So these buttons are not a stopgap,
  // they are how scrolling works on touch, and a tap per screenful would BE the reading
  // experience. Holding has to scroll continuously.
  //
  // The click handler still fires at the end of a hold, so it has to know one happened -
  // otherwise every hold ends with an extra screenful jump past what you stopped at.
  test("scrolls continuously while a scroll button is held", () => {
    const out = html();
    expect(out).toContain("bindHoldToScroll");
    const fn = out.match(/function bindHoldToScroll\(btn, direction\)[\s\S]*?\n {2}\}/)[0];
    // Pointer events, so a finger, a mouse and a stylus all take one path.
    expect(fn).toMatch(/["']pointerdown["']/);
    expect(fn).toMatch(/["']pointerup["']/);
    // A repeat that is smaller than a tap's jump - it has to be readable while moving.
    expect(fn).toMatch(/setInterval/);
    expect(fn).toMatch(/scrollByScreen\(direction \* 0\.\d+\)/);
    // Stops at the end of the document rather than spinning against a dead scrollTop.
    expect(fn).toMatch(/if \(btn\.disabled\) return stop\(\)/);
    // And the click after a hold is swallowed.
    expect(fn).toMatch(/if \(held\)/);
    expect(out).toContain("bindHoldToScroll(els.scrollUp, -1)");
    expect(out).toContain("bindHoldToScroll(els.scrollDown, 1)");
  });

  // Scenario: reported live. With the highlights panel open on a phone, any highlight
  // below the fold was unreachable - the panel is a scrollable region inside the embed,
  // so the host note claims its vertical drag for exactly the same reason it claims the
  // pages'. A real problem the moment a PDF has more than two highlights.
  //
  // The two controls already on screen retarget instead of a second pair appearing: the
  // panel covers the full width on a narrow embed, so dedicated buttons would have to
  // live inside it, and "these scroll what you are looking at" is one idea rather than
  // two. Which means they must sit ABOVE the panel, not be hidden behind it as they were.
  test("points those controls at the highlights panel while it is open", () => {
    const out = html();
    expect(out).toContain("activeScroller");
    // The old behaviour - hiding them behind the panel - would make the panel
    // unscrollable again on the one platform that cannot drag it.
    expect(out).not.toMatch(/\.pdfa-panel\.pdfa-open ~ \.pdfa-scrollnav\s*\{\s*display:\s*none/);
    const nav = out.match(/\.pdfa-scrollnav\s*\{[^}]*\}/)[0];
    const panel = out.match(/\.pdfa-panel\s*\{[^}]*\}/)[0];
    const zOf = (rule) => Number((rule.match(/z-index:\s*(\d+)/) || [])[1]);
    expect(zOf(nav)).toBeGreaterThan(zOf(panel));
    // And a gutter so a highlight's text never runs under them - touch only, since a
    // mouse never sees the buttons and must not pay for the space.
    const coarse = out.match(/@media \(pointer: coarse\)[\s\S]*?\n {2}\}/)[0];
    expect(coarse).toMatch(/\.pdfa-panel\.pdfa-open\s*\{[^}]*padding-right/);
  });

  // Scenario: the viewer used to rasterize every page before showing anything, and
  // re-rasterize all of them on every zoom step. Fine for the 3-page files it was built
  // against; brutal for a 50-page one, and worst on a phone - least memory, and (since
  // zoom moved into the overflow menu) the most re-rendering. Pages are now boxed at
  // their true size up front, so the document's geometry is complete immediately, and
  // only pages near the viewport are actually drawn.
  test("sizes every page up front but only draws the ones near the viewport", () => {
    const out = html();
    expect(out).toContain("collectViewports");
    expect(out).toContain("createPageBox");
    expect(out).toContain("ensureVisiblePagesRendered");
    // Measuring every page, rather than assuming page 1's size, is what stops a document
    // with a landscape page or a rotated scan reflowing under the reader as pages land.
    expect(out).toMatch(/for \(var i = 1; i <= state\.pageCount; i\+\+\)[\s\S]{0,200}getPage\(num\)/);
  });

  // Scenario: `viewports` used to mean BOTH "this page's geometry" and "this page has
  // rendered", and the selection capture relied on the second meaning. Lazy rendering
  // fills viewports in for every page at load, so that check would now wave through a
  // page with no text layer at all - a silent break in the one path the whole plugin
  // depends on. The two meanings are separate state now.
  test("gates selection on a page having RENDERED, not merely having geometry", () => {
    const out = html();
    expect(out).toMatch(/if \(!state\.rendered\[pageNum\]\) return setPending\(null\)/);
    expect(out).not.toMatch(/if \(!state\.viewports\[pageNum\]\) return setPending\(null\)/);
  });

  // Scenario: three separate bugs in this project have come from a paint-coupled API
  // silently not running when the embed is not compositing - PDF.js's rAF render, a
  // smooth scrollBy that never advanced, and a deep link that set the page number and
  // then didn't move. An off-screen embed is exactly the state a deep-linked viewer is
  // in, so nothing on a navigation path may depend on a scroll animation.
  test("never uses smooth scrolling, which stalls when the embed is not compositing", () => {
    const out = html();
    expect(out).not.toMatch(/behavior:\s*["']smooth["']/);
  });

  // Scenario: reported live. Clicking an exported highlight's link lands on the right
  // note but leaves the reader where they were - at the bottom, among the exports, with
  // the PDF far above. Scrolling to the embed by hand showed it ALREADY on the right
  // highlight, which is the tell: the deep link arrives and works, and the only missing
  // step is moving the host note.
  //
  // The embed is a cross-origin iframe, so it cannot scroll its parent with script. Focus
  // is the exception - the browser scrolls a frame into view in every ancestor document
  // when something inside it is focused, across origins. Verified in the harness with the
  // embed 1500px down a tall page: focus moved the parent, focus({preventScroll:true})
  // did not, which is what proves the scroll came from the focus call.
  test("can pull the host note down to itself when opened by a deep link", () => {
    const out = html();
    expect(out).toContain("revealSelfInHostNote");
    // Focusable programmatically without joining the tab order.
    expect(out).toMatch(/setAttribute\("tabindex", "-1"\)/);
    // Only ever for a deep link. Stealing focus on an ordinary note load would yank the
    // page around for a reader who never asked to go anywhere - worse with several
    // viewers on one note, which would then fight over it.
    expect(out).toMatch(/if \(cfg\.highlightId \|\| cfg\.page\) \{\s*revealSelfInHostNote\(\);/);
    // AND it must run before the PDF work, not after it. Sequenced after renderAll this
    // silently never fired in the live app: PDF.js renders off requestAnimationFrame,
    // which is paused in a non-compositing context - an off-screen embed, i.e. exactly
    // the case that needs scrolling to. Everything behind the render stalled with it.
    const bootBody = out.match(/function boot\(\)[\s\S]*?loadPdfJs\(\)/)[0];
    expect(bootBody).toContain("revealSelfInHostNote()");
    // The browser's own focus ring would be a meaningless full-viewer outline.
    expect(out).toMatch(/#pdfa-root:focus\s*\{\s*outline:\s*none/);
  });

  // Scenario: REPORTED LIVE - opening any note whose viewer was expanded scrolled the
  // note down to the embed and left the PDF somewhere random. The deep-link args are a
  // one-shot instruction that linkTarget writes into the tag before navigating, but
  // nothing removed them, so the branch above re-fired on every subsequent open.
  test("spends the deep link after acting on it, so a later open does not replay it", () => {
    const out = html();
    // Cleared in the SAME branch that acts on the args - the two have to agree about
    // what a deep-link load is, or the instruction outlives the thing that consumes it.
    expect(out).toMatch(
      /if \(cfg\.highlightId \|\| cfg\.page\) \{[\s\S]*?revealSelfInHostNote\(\);[\s\S]*?clearDeepLinkArgs\(\);\s*\}/
    );
    // And before the PDF work, for the same reason as the reveal: renderAll stalls in a
    // non-compositing context, so anything sequenced behind it never runs in exactly the
    // off-screen case where a stale replay is most disruptive.
    const bootBody = out.match(/function boot\(\)[\s\S]*?loadPdfJs\(\)/)[0];
    expect(bootBody).toContain("clearDeepLinkArgs()");
    // The collapsed flag is durable state in the same tag - clearing it would re-collapse
    // a viewer the link had just expanded.
    expect(out).toMatch(/action: "clearDeepLink"/);
    expect(out).not.toMatch(/action: "clearDeepLink"[\s\S]{0,200}collapsed/);
  });

  // Scenario: the other half of the same report - "it doesn't highlight the actual note".
  // Scrolling to a highlight does not say WHICH one when a page holds several, possibly
  // adjacent and the same color. The cue is an outline rather than a color or opacity
  // change: those already carry meaning on a highlight, and opacity would feed into the
  // multiply blend the rects composite through.
  test("flashes the highlight a deep link pointed at, without restyling it permanently", () => {
    const out = html();
    expect(out).toContain("flashHighlight");
    expect(out).toMatch(/@keyframes pdfa-flash/);
    expect(out).toMatch(/\.pdfa-hl-flash \.pdfa-hl\s*\{[^}]*outline:/);
    // Not a color or opacity change - see above.
    const flash = out.match(/\.pdfa-hl-flash \.pdfa-hl\s*\{[^}]*\}/)[0];
    expect(flash).not.toMatch(/background|opacity/);
    // And it is removed again, so no highlight is left mysteriously marked.
    expect(out).toMatch(/classList\.remove\("pdfa-hl-flash"\)/);
  });

  // Scenario: zoom was moved into the overflow menu for one release, to buy back a 40px
  // toolbar row on a phone. Reverted after use on a real device - a stepper reached
  // through a menu is worse than a second toolbar row, and the row costs proportionally
  // less now the box is taller. Pinned because the saving is tempting enough to be
  // re-proposed: every control stays reachable directly from the toolbar at every width.
  test("keeps zoom in the toolbar at every width", () => {
    const out = html();
    const narrow = out.match(/@media \(max-width: 520px\)[\s\S]*?\n {2}\}/)[0];
    for (const id of ["#pdfa-zoom-in", "#pdfa-zoom-out", "#pdfa-zoom-label", "#pdfa-prev", "#pdfa-next"]) {
      expect(narrow).not.toContain(id);
    }
    expect(out).not.toContain("pdfa-menu-zoom");
  });

  // Scenario: the +/- stepper moves in fixed 25% jumps from wherever fit-to-width landed,
  // so an exact zoom was often unreachable - from a fitted 83% the steps run 58/108/133
  // and 100% simply is not on the list. The percentage is a text field for that reason,
  // and it has to keep behaving like the label it replaced when nobody types in it.
  test("makes the zoom percentage a typable field", () => {
    const out = html();
    const field = out.match(/<input id="pdfa-zoom-label"[\s\S]*?>/)[0];
    // Not type=number: the spinner arrows do not fit this bar, and it rejects the "%"
    // the field's own displayed value invites people to type back.
    expect(field).toContain('type="text"');
    // ...but a phone still gets the numeric keypad.
    expect(field).toContain('inputmode="numeric"');
    expect(field).toMatch(/aria-label="[^"]*[Zz]oom/);
    // Styled back down to a label: no browser-default border, background or width.
    const style = out.match(/\.pdfa-zoom-field \{[^}]*\}/)[0];
    expect(style).toMatch(/background:\s*transparent/);
    expect(style).toMatch(/border:\s*1px solid transparent/);
    expect(style).toMatch(/width:/);
  });

  // Scenario: the viewer wiring behind that field. A typo must never blank the document,
  // and an out-of-range number must land inside the same limits the buttons obey.
  test("commits a typed zoom, and rejects junk instead of blanking the page", () => {
    const out = html();
    // "100%", " 100 " and "87.5" all read as percentages; "1o0" does not (parseFloat
    // alone would take it as 1 and zoom to 1%).
    expect(out).toMatch(/replace\(\/\[\\s%\]\/g, ""\)/);
    expect(out).toContain("/^\\d*\\.?\\d+$/.test(typed)");
    // One clamp for the buttons, the typed value and the initial fit alike.
    expect(out).toMatch(/function clampZoom\(scale\) \{\s*return Math\.min\(Math\.max\(0\.4, scale\), 4\);/);
    expect(out).toContain("var scale = clampZoom(percent / 100);");
    // Enter commits, Escape abandons, blur commits.
    expect(out).toMatch(/addEventListener\("blur", applyZoomInput\)/);
    expect(out).toMatch(/event\.key === "Escape"[\s\S]{0,300}els\.zoomLabel\.value = zoomText\(\)/);
    // And a redraw never overwrites what is being typed.
    expect(out).toContain("if (document.activeElement !== els.zoomLabel) els.zoomLabel.value = zoomText();");
  });

  // Scenario: the collapsed bar's box is width/COLLAPSED_ASPECT_RATIO, and the note
  // markup carrying that ratio is shared across every device - so a bar tuned to 45px at
  // a desktop note width gets 22px on a phone and was being cut in half. The box cannot
  // adapt per device, which leaves compressing the content as the only lever.
  test("compresses the collapsed bar rather than letting a short box clip it", () => {
    const out = html();
    expect(out).toMatch(/@media \(max-height: \d+px\)/);
    const short = out.match(/@media \(max-height: \d+px\)[\s\S]*?\n {2}\}/)[0];
    expect(short).toContain(".pdfa-collapsed");
  });
});
