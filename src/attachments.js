/**
 * Attachment discovery and byte access.
 *
 * Attachment objects have exactly three fields, confirmed against the live API:
 *   { name: "file.pdf", type: "application/pdf", uuid: "..." }
 */
import { proxiedURL } from "./constants.js";

export const PDF_MIME = "application/pdf";

/**
 * PDFs only. `getNoteAttachments` returns null for a nonexistent note and [] for a note
 * with none, so both must be handled — callers should always get an array back.
 */
export function pdfAttachments(attachments) {
  if (!Array.isArray(attachments)) return [];
  return attachments.filter((a) => a && a.type === PDF_MIME && a.uuid);
}

/**
 * Let the user choose which PDF to annotate.
 *
 * Skips the dialog when there's exactly one — an unavoidable prompt for a single
 * obvious choice is friction, and the spec's flow is "open the PDF", not "answer a
 * question first".
 *
 * @returns the chosen attachment, or null if there are none or the user cancelled.
 */
export async function choosePdfAttachment(app, noteUUID) {
  const all = await app.getNoteAttachments({ uuid: noteUUID });
  const pdfs = pdfAttachments(all);

  if (pdfs.length === 0) return null;
  if (pdfs.length === 1) return pdfs[0];

  const result = await app.prompt("Which PDF do you want to annotate?", {
    inputs: [
      {
        label: "PDF",
        type: "radio",
        options: pdfs.map((a) => ({ label: a.name, value: a.uuid })),
        value: pdfs[0].uuid,
      },
    ],
  });

  // `prompt` returns null when the user cancels — NOT undefined. Treating a cancel as
  // a default selection would open a file the user didn't ask for.
  if (result === null || result === undefined) return null;

  // Amplenote may hand back the bare value or wrap it in an array of inputs.
  const chosenUUID = Array.isArray(result) ? result[0] : result;
  return pdfs.find((a) => a.uuid === chosenUUID) || null;
}

/**
 * A URL the embed can actually fetch.
 *
 * `getAttachmentURL` returns a presigned S3 link with no CORS headers — fetching it
 * directly fails from both the embed and the plugin sandbox. Everything must go through
 * Amplenote's CORS proxy. See docs/api-notes.md.
 *
 * The presigned URL expires after an hour, so resolve it per session and never cache it.
 */
export async function fetchableAttachmentURL(app, attachmentUUID) {
  if (!attachmentUUID) throw new Error("fetchableAttachmentURL: attachmentUUID required");
  const signed = await app.getAttachmentURL(attachmentUUID);
  if (!signed) throw new Error(`No URL returned for attachment ${attachmentUUID}`);
  return proxiedURL(signed);
}
