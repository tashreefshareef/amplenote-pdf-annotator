/**
 * `onEmbedCall` request handling.
 *
 * The embed cannot reach the app interface, and it cannot fetch the attachment URL
 * directly either - so every privileged operation is a message to the plugin. Kept in
 * its own module, separate from the plugin object, so it is testable (spec section 8).
 *
 * Protocol: the embed sends `{ action, ...params }` and always gets an object back.
 * Errors are RETURNED, not thrown - a rejected promise surfaces in the embed as an
 * opaque failure, whereas `{ error }` can be shown to the user.
 */
import { fetchableAttachmentURL } from "./attachments.js";

/**
 * Look up an attachment's display name from the note the embed lives in.
 * Never throws - a missing name is cosmetic and must not block loading the PDF.
 */
async function attachmentName(app, attachmentUUID) {
  try {
    const list = await app.getNoteAttachments({ uuid: app.context.noteUUID });
    const match = Array.isArray(list) && list.find((a) => a && a.uuid === attachmentUUID);
    return match ? match.name : "";
  } catch {
    return "";
  }
}

/**
 * Normalize whatever crossed the embed bridge into a request object.
 *
 * The payload arrives as a JSON string. Structured objects were tried first and the
 * bridge hung silently - no error, no resolution - so the wire format is deliberately
 * a plain string in both directions. A bare action name is also accepted.
 */
export function parseEmbedPayload(payload) {
  if (payload && typeof payload === "object") return payload;
  if (typeof payload !== "string") return {};
  const trimmed = payload.trim();
  if (!trimmed.startsWith("{")) return { action: trimmed };
  try {
    return JSON.parse(trimmed);
  } catch {
    return { action: trimmed };
  }
}

/**
 * Bridge entry point: takes the raw payload, returns a JSON STRING.
 *
 * Strings are the only format observed to survive the round-trip reliably.
 */
export async function handleEmbedCallSerialized(app, payload) {
  return JSON.stringify(await handleEmbedCall(app, parseEmbedPayload(payload)));
}

export async function handleEmbedCall(app, payload) {
  const request = parseEmbedPayload(payload);

  switch (request.action) {
    case "getPdfUrl": {
      const attachmentUUID = request.attachmentUUID;
      if (!attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        const url = await fetchableAttachmentURL(app, attachmentUUID);
        // The embed only knows the uuid, so send the display name along with it rather
        // than making the viewer issue a second round-trip just to label its toolbar.
        return { url, name: await attachmentName(app, attachmentUUID) };
      } catch (err) {
        return { error: `Could not load the PDF: ${err.message}` };
      }
    }

    case "ping":
      // Lets the embed verify the bridge before doing real work.
      return { ok: true };

    default:
      return { error: `Unknown embed action: ${String(request.action)}` };
  }
}
