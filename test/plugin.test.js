/**
 * Tests for the plugin object's shape and wiring.
 *
 * Why these matter: a malformed plugin object fails SILENTLY in Amplenote — the option
 * simply never appears in the ⋯ menu and no error is raised anywhere. Asserting the
 * shape here catches that before it costs a paste-and-reload cycle in the live app.
 *
 * Action behaviour is covered in annotate-pdf.test.js; this file only checks that the
 * object exposes what Amplenote looks for and delegates correctly.
 */
import plugin from "../src/plugin.js";
import { PDF_MIME } from "../src/attachments.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const PLUGIN_UUID = "plug-uuid";

function appFixture(attachments = [mockAttachment({ uuid: "att-1", name: "p.pdf", type: PDF_MIME })]) {
  const app = createMockApp({
    notes: [{ uuid: "note-1", name: "Research", content: "", attachments }],
  });
  app.context.pluginUUID = PLUGIN_UUID;
  app.context.noteUUID = "note-1";
  return app;
}

describe("plugin object shape", () => {
  // Scenario: Amplenote reads action names off the object's keys, and this label is
  // what the user clicks. It is named in the spec, so it is pinned.
  test("exposes the 'Annotate PDF' note option", () => {
    expect(typeof plugin.noteOption["Annotate PDF"]).toBe("function");
  });

  // Scenario: the embed surface and its bridge both have to exist, or the viewer
  // renders as a blank box.
  test("exposes renderEmbed and onEmbedCall", () => {
    expect(typeof plugin.renderEmbed).toBe("function");
    expect(typeof plugin.onEmbedCall).toBe("function");
  });

  // Scenario: Amplenote awaits actions; a sync action returning a non-promise breaks
  // error propagation.
  test("note options and onEmbedCall are async", () => {
    for (const fn of Object.values(plugin.noteOption)) {
      expect(fn.constructor.name).toBe("AsyncFunction");
    }
    expect(plugin.onEmbedCall.constructor.name).toBe("AsyncFunction");
  });
});

describe("noteOption delegation", () => {
  // Scenario: the option must pass app.context.pluginUUID through, since that is what
  // the plugin:// embed markup has to point at. Passing the wrong id yields an embed
  // that renders nothing.
  test("passes the plugin uuid into the inserted embed markup", async () => {
    const app = appFixture();

    await plugin.noteOption["Annotate PDF"](app, "note-1");

    expect(app._notes.get("note-1").content).toContain(`plugin://${PLUGIN_UUID}?att=att-1`);
  });
});

describe("renderEmbed", () => {
  // Scenario: normal render — args arrive as a single query string.
  test("renders the viewer for the attachment named in the args", () => {
    const html = plugin.renderEmbed(appFixture(), "att=att-1&page=3");
    expect(html).toContain('"attachmentUUID":"att-1"');
    expect(html).toContain('"page":3');
  });

  // Scenario: an embed inserted without params (or with corrupted ones) must explain
  // itself rather than render an empty frame the user can't diagnose.
  test("shows a recovery message when no attachment is specified", () => {
    const html = plugin.renderEmbed(appFixture(), "");
    expect(html).toMatch(/isn't linked to a PDF/i);
    expect(html).toMatch(/Annotate PDF/);
  });

  // Scenario: theme follows the app.
  test("honours the app's light/dark mode", () => {
    const app = appFixture();
    app.context.lightDarkMode = "dark";
    expect(plugin.renderEmbed(app, "att=att-1")).toContain("--pdfa-bg:#1e2126");
  });

  // Scenario: an exported highlight's deep link (src/export.js, built client-side in
  // the embed) needs this plugin's own note uuid. Missing it here means every exported
  // link points nowhere, only discoverable after actually clicking one in the live app.
  test("passes the plugin's own uuid through for the embed's export deep links", () => {
    const html = plugin.renderEmbed(appFixture(), "att=att-1");
    expect(html).toContain(`"pluginUUID":"${PLUGIN_UUID}"`);
  });
});

describe("onEmbedCall", () => {
  // Scenario: the bridge the viewer depends on for its bytes. The reply must be a
  // JSON STRING — structured objects hang the bridge silently, leaving the viewer
  // stuck on "Loading..." with nothing to diagnose.
  test("replies with a JSON string carrying the proxied PDF URL", async () => {
    const raw = await plugin.onEmbedCall(
      appFixture(),
      JSON.stringify({ action: "getPdfUrl", attachmentUUID: "att-1" })
    );

    expect(typeof raw).toBe("string");
    expect(JSON.parse(raw).url).toContain("cors-proxy");
  });
});
