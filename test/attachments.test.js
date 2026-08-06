/**
 * Tests for attachment discovery and byte access.
 *
 * Why these matter: this is the entry point of the whole plugin. If the picker returns
 * the wrong attachment or the URL isn't proxied, nothing downstream can work — and the
 * proxy failure in particular surfaces only as a generic "Failed to fetch" inside a
 * sandboxed iframe, which is miserable to debug at runtime.
 */
import { pdfAttachments, choosePdfAttachment, fetchableAttachmentURL, PDF_MIME } from "../src/attachments.js";
import { CORS_PROXY } from "../src/constants.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const pdf = (name, uuid) => mockAttachment({ name, uuid, type: PDF_MIME });
const other = (name, uuid, type) => mockAttachment({ name, uuid, type });

describe("pdfAttachments", () => {
  // Scenario: notes hold mixed attachments; the picker must only offer PDFs.
  test("keeps only PDFs", () => {
    const list = [
      pdf("a.pdf", "1"),
      other("b.png", "2", "image/png"),
      other("c.docx", "3", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
      pdf("d.pdf", "4"),
    ];
    expect(pdfAttachments(list).map((a) => a.uuid)).toEqual(["1", "4"]);
  });

  // Scenario: getNoteAttachments returns null for an unknown note and [] for a note
  // with none. Neither may throw — callers always expect an array.
  test("returns an empty array for null, undefined, or non-array input", () => {
    expect(pdfAttachments(null)).toEqual([]);
    expect(pdfAttachments(undefined)).toEqual([]);
    expect(pdfAttachments("nope")).toEqual([]);
  });

  // Scenario: an entry without a uuid can't be fetched, so it must not reach the picker.
  test("drops malformed entries", () => {
    expect(pdfAttachments([null, { type: PDF_MIME }, pdf("ok.pdf", "9")])).toHaveLength(1);
  });
});

describe("choosePdfAttachment", () => {
  const noteWith = (attachments) => [{ uuid: "note-1", name: "N", attachments }];

  // Scenario: one PDF — open it directly. Prompting for a single obvious choice is
  // pure friction.
  test("returns the only PDF without prompting", async () => {
    const app = createMockApp({ notes: noteWith([pdf("only.pdf", "u1")]) });
    const chosen = await choosePdfAttachment(app, "note-1");
    expect(chosen.uuid).toBe("u1");
    expect(app.prompt).not.toHaveBeenCalled();
  });

  // Scenario: several PDFs — ask, and honour the answer.
  test("prompts when there are several and returns the chosen one", async () => {
    const app = createMockApp({
      notes: noteWith([pdf("a.pdf", "u1"), pdf("b.pdf", "u2")]),
      promptQueue: ["u2"],
    });
    const chosen = await choosePdfAttachment(app, "note-1");
    expect(chosen.uuid).toBe("u2");
    expect(app.prompt).toHaveBeenCalledTimes(1);
  });

  // Scenario: cancelling the picker must open nothing. `prompt` returns null on
  // cancel, and treating that as a default selection would open a file the user
  // didn't ask for.
  test("returns null when the user cancels the picker", async () => {
    const app = createMockApp({
      notes: noteWith([pdf("a.pdf", "u1"), pdf("b.pdf", "u2")]),
      promptQueue: [],
    });
    expect(await choosePdfAttachment(app, "note-1")).toBeNull();
  });

  // Scenario: attachments exist but none are PDFs.
  test("returns null when there are no PDFs", async () => {
    const app = createMockApp({ notes: noteWith([other("x.png", "u1", "image/png")]) });
    expect(await choosePdfAttachment(app, "note-1")).toBeNull();
  });

  // Scenario: bare note.
  test("returns null for a note with no attachments", async () => {
    const app = createMockApp({ notes: noteWith([]) });
    expect(await choosePdfAttachment(app, "note-1")).toBeNull();
  });
});

describe("fetchableAttachmentURL", () => {
  // Scenario: THE critical one. The raw presigned S3 URL is not fetchable from any
  // plugin context; it must be wrapped in Amplenote's CORS proxy, with the signature
  // intact inside a single `apiurl` parameter.
  test("wraps the signed URL in the CORS proxy without losing its signature", async () => {
    const app = createMockApp();
    const signed =
      "https://ample-attachments.s3.us-west-2.amazonaws.com/n/f.pdf" +
      "?X-Amz-Expires=3600&X-Amz-Signature=deadbeef";
    app.getAttachmentURL = async () => signed;

    const result = new URL(await fetchableAttachmentURL(app, "att-1"));

    expect(result.origin + result.pathname).toBe(CORS_PROXY);
    expect(result.searchParams.get("apiurl")).toBe(signed);
  });

  // Scenario: a missing uuid would silently proxy "undefined" and fail confusingly
  // later, inside the iframe.
  test("throws without an attachment uuid", async () => {
    const app = createMockApp();
    await expect(fetchableAttachmentURL(app, null)).rejects.toThrow(/attachmentUUID/);
  });

  // Scenario: the URL can legitimately fail to resolve (expired, deleted attachment).
  test("throws when no URL comes back", async () => {
    const app = createMockApp();
    app.getAttachmentURL = async () => null;
    await expect(fetchableAttachmentURL(app, "att-1")).rejects.toThrow(/No URL/);
  });
});
