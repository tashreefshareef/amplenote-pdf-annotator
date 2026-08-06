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

  // Scenario: the elements the viewer wires up by id must exist, or it throws on boot
  // and the embed renders blank.
  test("contains every element the viewer script binds to", () => {
    const out = html();
    for (const id of [
      "pdfa-root", "pdfa-pages", "pdfa-status", "pdfa-page-label",
      "pdfa-zoom-label", "pdfa-prev", "pdfa-next", "pdfa-zoom-in", "pdfa-zoom-out",
      "pdfa-colors", "pdfa-hint", "pdfa-popover",
    ]) {
      expect(out).toContain(`id="${id}"`);
    }
    expect(out).toContain("pdfa-scroll");
    expect(out).toContain("pdfa-name");
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

  // Scenario: cycleIndex and rgb belong to export (Phase 5) and pdf-lib (Phase 4), both
  // of which run plugin-side. Shipping them into the embed would invite the viewer to
  // start making export decisions it cannot be tested on.
  test("does not leak export-only color metadata into the embed", () => {
    const out = html();
    expect(out).not.toContain("cycleIndex");
    expect(out).not.toContain('"rgb"');
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

  // Scenario: the coordinate transform is PDF.js's, in both directions. Every past
  // positioning bug in this project came from substituting hand-written math for it, so
  // the viewer must be calling the real thing.
  test("the viewer uses PDF.js's own coordinate conversion in both directions", () => {
    const out = html();
    expect(out).toContain("convertToPdfPoint");
    expect(out).toContain("convertToViewportPoint");
  });
});
