/**
 * Tests for the embed HTML builder.
 *
 * The viewer JS itself can't be unit tested — it needs a real iframe, PDF.js and the
 * plugin bridge. What CAN be checked is that the HTML wrapper is well-formed and safe,
 * which is where the silent, hard-to-debug failures live: a broken script tag or an
 * unescaped filename yields a blank embed with no error anywhere.
 */
import { buildEmbedHtml } from "../src/embed/html.js";
import { CDN } from "../src/constants.js";

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
    ]) {
      expect(out).toContain(`id="${id}"`);
    }
    expect(out).toContain("pdfa-scroll");
    expect(out).toContain("pdfa-name");
  });

  // Scenario: the spec requires the 4 color buttons as top-level toolbar buttons in
  // Phase 2. The mount point is reserved now so the layout doesn't have to change.
  test("reserves a toolbar slot for the Phase 2 color buttons", () => {
    expect(html()).toContain('id="pdfa-colors"');
  });

  // Scenario: if the CDN is unreachable the user must see why, not an empty box.
  test("shows a message when PDF.js fails to load", () => {
    expect(html()).toContain("onerror=");
    expect(html()).toContain("Could not load PDF.js");
  });
});
