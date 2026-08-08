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

  // Scenario: rgb (Phase 4, native annotations) and cycleIndex (Phase 5, export
  // markdown) both reach the embed now - both features build their output CLIENT-SIDE,
  // reusing data already loaded rather than round-tripping through the plugin bridge
  // (string-only - see docs/api-notes.md).
  test("sends rgb and cycleIndex to the embed for pdf-lib and export markdown", () => {
    const out = html();
    for (const color of HIGHLIGHT_COLORS) {
      expect(out).toContain(`"rgb":[${color.rgb.join(",")}]`);
      expect(out).toContain(`"cycleIndex":${color.cycleIndex}`);
    }
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
    // And the menu heading it moved to.
    expect(out).toContain("pdfa-menu-name");
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
  // to be a control that needs no gesture. They are touch-only (a wheel and a trackpad
  // are uncontested) and must not float on top of the panel, which goes full width on a
  // narrow embed.
  test("offers gesture-free scroll controls on touch, out of the panel's way", () => {
    const out = html();
    const nav = out.match(/\.pdfa-scrollnav\s*\{[^}]*\}/)[0];
    expect(nav).toMatch(/display:\s*none/);
    expect(nav).toMatch(/position:\s*absolute/);
    const coarse = out.match(/@media \(pointer: coarse\)[\s\S]*?\n {2}\}/)[0];
    expect(coarse).toMatch(/\.pdfa-scrollnav\s*\{\s*display:\s*flex/);
    // Beats the coarse rule on specificity, so it holds regardless of block order.
    expect(out).toMatch(/\.pdfa-panel\.pdfa-open ~ \.pdfa-scrollnav\s*\{\s*display:\s*none/);
    // Scrolls the page area itself - not scrollIntoView on a page, which would jump a
    // whole page rather than a screenful.
    expect(out).toContain("scrollByScreen");
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
