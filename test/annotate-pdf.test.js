/**
 * Tests for the "Annotate PDF" action and the onEmbedCall bridge.
 *
 * These are the note-modifying actions the bounty T&C specifically requires coverage of
 * (spec §5.2): the action writes embed markup into the user's note.
 */
import { annotatePdf } from "../src/actions/annotate-pdf.js";
import { handleEmbedCall, handleEmbedCallSerialized, parseEmbedPayload } from "../src/embed-call.js";
import { PDF_MIME } from "../src/attachments.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const PLUGIN = "plug-uuid";
const pdf = (name, uuid) => mockAttachment({ name, uuid, type: PDF_MIME });

const appWith = (attachments, content = "", promptQueue = []) =>
  createMockApp({
    notes: [{ uuid: "note-1", name: "Research", content, attachments }],
    promptQueue,
  });

/** How Amplenote renders an attachment chip in note markdown — see constants.js. */
const chip = (name, uuid) => `[${name}](attachment://${uuid})`;

describe("annotatePdf", () => {
  // Scenario: the happy path — one PDF on the note, viewer gets embedded. No chip in the
  // body, so there is nothing to anchor to and appending is correct.
  test("appends embed markup for the chosen PDF when the note has no chip", async () => {
    const app = appWith([pdf("paper.pdf", "att-1")], "# Research\nMy notes.");

    const result = await annotatePdf(app, "note-1", PLUGIN);

    expect(result).toBe("att-1");
    const content = app._notes.get("note-1").content;
    expect(content).toContain(`<object data="plugin://${PLUGIN}?att=att-1"`);
    // The user's own content must survive untouched.
    expect(content).toContain("My notes.");
    expect(app._calls.insertedContent[0].opts).toEqual({ atEnd: true });
  });

  // Scenario: the multi-PDF case. The chip sits mid-note, so the viewer belongs directly
  // beneath it — not at the bottom, several screens away from the thing it renders.
  test("places the viewer directly beneath the PDF's own attachment chip", async () => {
    const app = appWith(
      [pdf("rent.pdf", "att-1")],
      `# Research\n\n${chip("rent.pdf", "att-1")}\n\n## Later section\ntrailing text`
    );

    await annotatePdf(app, "note-1", PLUGIN);

    const lines = app._notes.get("note-1").content.split("\n");
    const chipLine = lines.findIndex((l) => l.includes("attachment://att-1"));
    const embedLine = lines.findIndex((l) => l.includes("plugin://"));
    expect(embedLine).toBeGreaterThan(chipLine);
    // Directly beneath means before the next section, not merely somewhere after.
    expect(embedLine).toBeLessThan(lines.findIndex((l) => l.startsWith("## Later")));
    // Anchoring needs a whole-note rewrite; appending would defeat the placement.
    expect(app.insertNoteContent).not.toHaveBeenCalled();
  });

  // Scenario: two PDFs, two chips in different parts of the note. Each viewer must land
  // under its OWN chip — matching on the wrong uuid would put them both in one place.
  test("anchors each PDF's viewer to its own chip", async () => {
    const app = appWith(
      [pdf("a.pdf", "att-1"), pdf("b.pdf", "att-2")],
      `${chip("a.pdf", "att-1")}\n\nmiddle prose\n\n${chip("b.pdf", "att-2")}\n\nend`,
      ["att-2"]
    );

    await annotatePdf(app, "note-1", PLUGIN);

    const lines = app._notes.get("note-1").content.split("\n");
    const embedLine = lines.findIndex((l) => l.includes("plugin://"));
    expect(embedLine).toBeGreaterThan(lines.findIndex((l) => l.includes("attachment://att-2")));
    expect(embedLine).toBeGreaterThan(lines.findIndex((l) => l.includes("middle prose")));
  });

  // Scenario: everything around the chip must survive the whole-note rewrite intact —
  // rich footnotes and the plugin's own fenced storage section included, which is what a
  // real annotated note looks like.
  test("leaves the rest of the note byte-identical when anchoring", async () => {
    const before =
      `# Title\n\nprose\n\n${chip("rent.pdf", "att-1")} [^1]\n\n` +
      "# PDF Annotator data\n\n```json\n{}\n```\n\n[^1]: extracted page text";
    const app = appWith([pdf("rent.pdf", "att-1")], before);

    await annotatePdf(app, "note-1", PLUGIN);

    const after = app._notes.get("note-1").content;
    // Removing only the inserted embed line must give back exactly the original.
    const restored = after
      .split("\n")
      .filter((l) => !l.includes("plugin://"))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    expect(restored).toBe(before);
  });

  // Scenario: the option is run on a note with no PDF. The user needs to be told what
  // to do, not left with a silent no-op.
  test("explains what to do when the note has no PDFs", async () => {
    const app = appWith([mockAttachment({ type: "image/png", uuid: "i1" })]);

    expect(await annotatePdf(app, "note-1", PLUGIN)).toBeNull();
    expect(app._calls.alerts[0]).toMatch(/No PDF attachments/i);
    expect(app.insertNoteContent).not.toHaveBeenCalled();
  });

  // Scenario: user opens the picker and backs out. Nothing should be written, and
  // nagging them with an alert would be wrong — they cancelled on purpose.
  test("writes nothing and stays quiet when the user cancels the picker", async () => {
    const app = appWith([pdf("a.pdf", "u1"), pdf("b.pdf", "u2")], "", []);

    expect(await annotatePdf(app, "note-1", PLUGIN)).toBeNull();
    expect(app.insertNoteContent).not.toHaveBeenCalled();
    expect(app._calls.alerts).toHaveLength(0);
  });

  // Scenario: running the option twice must not stack duplicate viewers in the note.
  test("does not insert a second embed for a PDF already open", async () => {
    const existing = `<object data="plugin://${PLUGIN}?att=att-1" data-aspect-ratio="1.2" />`;
    const app = appWith([pdf("paper.pdf", "att-1")], `notes\n${existing}`);

    const result = await annotatePdf(app, "note-1", PLUGIN);

    expect(result).toBe("att-1");
    expect(app.insertNoteContent).not.toHaveBeenCalled();
    expect(app._calls.alerts[0]).toMatch(/already open/i);
  });

  // Scenario: a note with two PDFs, one already embedded — the second must still be
  // insertable.
  test("still inserts a viewer for a different PDF in the same note", async () => {
    const existing = `<object data="plugin://${PLUGIN}?att=att-1" data-aspect-ratio="1.2" />`;
    const app = appWith([pdf("a.pdf", "att-1"), pdf("b.pdf", "att-2")], existing, ["att-2"]);

    await annotatePdf(app, "note-1", PLUGIN);

    expect(app._notes.get("note-1").content).toContain("att=att-2");
  });
});

describe("handleEmbedCall", () => {
  const app = () => {
    const a = appWith([pdf("paper.pdf", "att-1")]);
    a.context.noteUUID = "note-1";
    return a;
  };

  // Scenario: the embed's core request — a fetchable URL plus the name for its toolbar,
  // in one round-trip.
  test("returns a proxied URL and the attachment name", async () => {
    const result = await handleEmbedCall(app(), { action: "getPdfUrl", attachmentUUID: "att-1" });

    expect(result.url).toContain("cors-proxy");
    expect(result.name).toBe("paper.pdf");
    expect(result.error).toBeUndefined();
  });

  // Scenario: failures must be RETURNED, not thrown. A rejected promise reaches the
  // embed as an opaque failure with nothing to show the user.
  test("returns an error object rather than throwing when the URL fails", async () => {
    const a = app();
    a.getAttachmentURL = async () => { throw new Error("expired"); };

    const result = await handleEmbedCall(a, { action: "getPdfUrl", attachmentUUID: "att-1" });

    expect(result.error).toMatch(/Could not load the PDF/);
    expect(result.url).toBeUndefined();
  });

  test("reports a missing attachment uuid", async () => {
    expect((await handleEmbedCall(app(), { action: "getPdfUrl" })).error).toMatch(/No attachment/);
  });

  // Scenario: a name lookup failure is cosmetic and must not prevent the PDF loading.
  test("still returns the URL when the name lookup fails", async () => {
    const a = app();
    a.getNoteAttachments = async () => { throw new Error("boom"); };

    const result = await handleEmbedCall(a, { action: "getPdfUrl", attachmentUUID: "att-1" });

    expect(result.url).toContain("cors-proxy");
    expect(result.name).toBe("");
  });

  // Scenario: accepts a bare string action as well as an object payload.
  test("handles a bare string payload and unknown actions", async () => {
    expect(await handleEmbedCall(app(), "ping")).toEqual({ ok: true });
    expect((await handleEmbedCall(app(), { action: "nope" })).error).toMatch(/Unknown embed action/);
    expect((await handleEmbedCall(app(), undefined)).error).toMatch(/Unknown embed action/);
  });
});

describe("embed bridge wire format", () => {
  // Scenario: the bridge silently hangs when structured objects are sent across it —
  // no error, no resolution, viewer stuck on "Loading...". Everything must therefore
  // travel as a JSON string. These tests pin that contract.
  test("parses a JSON string payload into a request object", () => {
    expect(parseEmbedPayload('{"action":"getPdfUrl","attachmentUUID":"a1"}')).toEqual({
      action: "getPdfUrl",
      attachmentUUID: "a1",
    });
  });

  test("accepts a bare action name and passes objects through unchanged", () => {
    expect(parseEmbedPayload("ping")).toEqual({ action: "ping" });
    expect(parseEmbedPayload({ action: "ping" })).toEqual({ action: "ping" });
  });

  // Scenario: malformed JSON must not throw inside onEmbedCall — a rejected bridge
  // call surfaces in the embed as an unexplained hang.
  test("never throws on malformed or missing payloads", () => {
    expect(parseEmbedPayload("{not json")).toEqual({ action: "{not json" });
    expect(parseEmbedPayload(undefined)).toEqual({});
    expect(parseEmbedPayload(42)).toEqual({});
  });

  // Scenario: the reply must be a STRING the viewer can JSON.parse.
  test("returns a JSON string the viewer can parse", async () => {
    const a = appWith([pdf("paper.pdf", "att-1")]);
    a.context.noteUUID = "note-1";

    const raw = await handleEmbedCallSerialized(
      a,
      JSON.stringify({ action: "getPdfUrl", attachmentUUID: "att-1" })
    );

    expect(typeof raw).toBe("string");
    const parsed = JSON.parse(raw);
    expect(parsed.url).toContain("cors-proxy");
    expect(parsed.name).toBe("paper.pdf");
  });

  // Scenario: errors must round-trip as data too, not as a rejection.
  test("serializes errors rather than rejecting", async () => {
    const a = appWith([]);
    a.context.noteUUID = "note-1";
    const parsed = JSON.parse(await handleEmbedCallSerialized(a, '{"action":"getPdfUrl"}'));
    expect(parsed.error).toMatch(/No attachment/);
  });
});

describe("setCollapsed and getViewerSummary embed calls", () => {
  const PLUG = "plug-uuid";
  const tag = (extra = "", ratio = "1.2") =>
    `<object data="plugin://${PLUG}?att=att-1${extra}" data-aspect-ratio="${ratio}" />`;

  const app = (content) => {
    const a = appWith([pdf("paper.pdf", "att-1")], content);
    a.context.noteUUID = "note-1";
    return a;
  };

  // Scenario: the reported bug — collapsing hid the DOM but left a tall blank box, since
  // an embed cannot resize its own iframe. The fix has to reach the note markup.
  test("rewrites the tag's box size when the viewer collapses", async () => {
    const a = app(`prose\n\n${tag()}\n\nmore`);

    const result = await handleEmbedCall(a, {
      action: "setCollapsed",
      collapsed: true,
      attachmentUUID: "att-1",
      pluginUUID: PLUG,
    });

    expect(result.ok).toBe(true);
    const content = a._notes.get("note-1").content;
    expect(content).toContain('data-aspect-ratio="16"');
    expect(content).toContain("c=1");
    // The user's own content must survive the whole-note rewrite.
    expect(content).toContain("prose");
    expect(content).toContain("more");
  });

  test("restores the box size when the viewer expands", async () => {
    const a = app(tag("&c=1", "16"));

    await handleEmbedCall(a, {
      action: "setCollapsed",
      collapsed: false,
      attachmentUUID: "att-1",
      pluginUUID: PLUG,
    });

    expect(a._notes.get("note-1").content).toContain('data-aspect-ratio="1.2"');
  });

  // Scenario: a note with two viewers. Resizing one must not touch the other.
  test("resizes only the viewer that asked", async () => {
    const other = `<object data="plugin://${PLUG}?att=att-2" data-aspect-ratio="1.2" />`;
    const a = app(`${tag()}\n\n${other}`);

    await handleEmbedCall(a, {
      action: "setCollapsed",
      collapsed: true,
      attachmentUUID: "att-1",
      pluginUUID: PLUG,
    });

    expect(a._notes.get("note-1").content).toContain(other);
  });

  // Scenario: the tag is gone (hand-deleted). The embed has already hidden its own DOM,
  // so surfacing an error over a leftover gap would be more confusing than the gap.
  test("reports a quiet failure rather than an error when the tag is missing", async () => {
    const a = app("no embed here");

    const result = await handleEmbedCall(a, {
      action: "setCollapsed",
      collapsed: true,
      attachmentUUID: "att-1",
      pluginUUID: PLUG,
    });

    expect(result).toEqual({ ok: false });
    expect(result.error).toBeUndefined();
  });

  test("refuses without the ids needed to locate the viewer", async () => {
    const a = app(tag());
    expect((await handleEmbedCall(a, { action: "setCollapsed" })).error).toMatch(/No attachment/);
    expect(
      (await handleEmbedCall(a, { action: "setCollapsed", attachmentUUID: "att-1" })).error
    ).toMatch(/plugin id/);
  });

  // Scenario: a viewer that loads collapsed never fetches the PDF, so the collapsed bar
  // would be unlabelled without this — useless on a note holding several viewers.
  test("labels a collapsed viewer without loading the PDF", async () => {
    const a = app(tag("&c=1", "16"));

    const result = await handleEmbedCall(a, {
      action: "getViewerSummary",
      attachmentUUID: "att-1",
    });

    expect(result.name).toBe("paper.pdf");
    expect(result.count).toBe(0);
    expect(a.getAttachmentURL).not.toHaveBeenCalled();
  });
});
