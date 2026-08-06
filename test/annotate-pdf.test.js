/**
 * Tests for the "Annotate PDF" action and the onEmbedCall bridge.
 *
 * These are the note-modifying actions the bounty T&C specifically requires coverage of
 * (spec §5.2): the action writes embed markup into the user's note.
 */
import { annotatePdf } from "../src/actions/annotate-pdf.js";
import { handleEmbedCall } from "../src/embed-call.js";
import { PDF_MIME } from "../src/attachments.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const PLUGIN = "plug-uuid";
const pdf = (name, uuid) => mockAttachment({ name, uuid, type: PDF_MIME });

const appWith = (attachments, content = "", promptQueue = []) =>
  createMockApp({
    notes: [{ uuid: "note-1", name: "Research", content, attachments }],
    promptQueue,
  });

describe("annotatePdf", () => {
  // Scenario: the happy path — one PDF on the note, viewer gets embedded.
  test("inserts embed markup at the end of the note for the chosen PDF", async () => {
    const app = appWith([pdf("paper.pdf", "att-1")], "# Research\nMy notes.");

    const result = await annotatePdf(app, "note-1", PLUGIN);

    expect(result).toBe("att-1");
    const content = app._notes.get("note-1").content;
    expect(content).toContain(`<object data="plugin://${PLUGIN}?att=att-1"`);
    // The user's own content must survive untouched.
    expect(content).toContain("My notes.");
    expect(app._calls.insertedContent[0].opts).toEqual({ atEnd: true });
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
