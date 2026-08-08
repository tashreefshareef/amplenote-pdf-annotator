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

  // Scenario: without this, Amplenote has nothing to route a clicked `plugin://` link
  // to at all - confirmed live, a clicked exported highlight link did nothing but show
  // Amplenote's generic "unrecognized link" popup before this existed.
  test("exposes linkTarget", () => {
    expect(typeof plugin.linkTarget).toBe("function");
  });

  // Scenario: the cursor-positioned entry point. Declared as a bare function rather than
  // a `{ keyword: fn }` map - `insertText(app)` with the keyword defaulting to the plugin
  // name is the documented form, and Amplenote will not find the action if the shape is
  // wrong.
  test("exposes insertText as a plain function", () => {
    expect(typeof plugin.insertText).toBe("function");
  });

  // Scenario: Amplenote awaits actions; a sync action returning a non-promise breaks
  // error propagation.
  test("note options, onEmbedCall, linkTarget and insertText are async", () => {
    for (const fn of Object.values(plugin.noteOption)) {
      expect(fn.constructor.name).toBe("AsyncFunction");
    }
    expect(plugin.onEmbedCall.constructor.name).toBe("AsyncFunction");
    expect(plugin.linkTarget.constructor.name).toBe("AsyncFunction");
    expect(plugin.insertText.constructor.name).toBe("AsyncFunction");
  });
});

describe("insertText delegation", () => {
  // Scenario: unlike noteOption, Amplenote hands insertText no note uuid - it has to come
  // off app.context, and the markup is the RETURN value, not a note write.
  test("reads the note from app.context and returns the markup", async () => {
    const app = appFixture();
    app.context.noteUUID = "note-1";

    const result = await plugin.insertText(app);

    expect(result).toContain(`plugin://${PLUGIN_UUID}?att=att-1`);
    expect(app.insertNoteContent).not.toHaveBeenCalled();
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

  // Scenario: captured HERE, the one moment Amplenote is definitively rendering THIS
  // note's embed, and sent back on every embed-call request from then on - rather than
  // trusting onEmbedCall's own app.context.noteUUID to still be correct after the embed
  // remounts (switching notes away and back). Missing it here reintroduces the bug where
  // a highlight, still genuinely saved, looked up against the wrong note and appeared to
  // have vanished from the viewer.
  test("passes the current note's uuid through so onEmbedCall doesn't have to trust its own context later", () => {
    const html = plugin.renderEmbed(appFixture(), "att=att-1");
    expect(html).toContain('"noteUUID":"note-1"');
  });
});

describe("linkTarget delegation", () => {
  // Scenario: a clicked exported link must actually navigate the user somewhere - the
  // whole point of the deep link. Delegation-only check; link-target.test.js covers the
  // actual rewrite-then-navigate behavior in full.
  test("navigates to the note carried in the link's query string", async () => {
    const app = appFixture();
    app._notes.set("note-2", { uuid: "note-2", content: "", attachments: [] });

    await plugin.linkTarget(app, "att=att-1&page=2&note=note-2");

    expect(app._calls.navigations).toEqual(["https://www.amplenote.com/notes/note-2"]);
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
