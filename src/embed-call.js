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
import { loadHighlights, saveHighlights, deleteHighlights } from "./storage.js";
import { removeEmbedMarkup } from "./embed-args.js";
import {
  createHighlight,
  removeHighlight,
  updateHighlight,
  withColor,
  withNote,
} from "./highlights.js";

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
 * Load the stored highlights, apply one change, save, and hand back the result.
 *
 * The embed sends an INTENT ("recolor this id"), never its own copy of the list, and
 * every mutation re-reads the note first. Two viewers open on the same note - or one
 * viewer whose in-memory copy went stale after a failed save - therefore cannot clobber
 * each other's highlights with a whole-list overwrite.
 *
 * `mutate` must return a NEW array to signal a real change; returning the array it was
 * given (which `updateHighlight` does for an unknown id) skips the write entirely rather
 * than rewriting the note's managed section for nothing.
 */
async function mutateHighlights(app, attachmentUUID, mutate) {
  const noteUUID = app.context.noteUUID;
  const current = await loadHighlights(app, noteUUID, attachmentUUID);
  const next = mutate(current);
  if (next !== current) {
    await saveHighlights(app, noteUUID, attachmentUUID, next);
  }
  return { highlights: next };
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

    case "loadHighlights": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        return {
          highlights: await loadHighlights(app, app.context.noteUUID, request.attachmentUUID),
        };
      } catch (err) {
        return { error: `Could not load highlights: ${err.message}` };
      }
    }

    case "addHighlight": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        // Validation happens HERE, not in the embed: createHighlight is the tested
        // gatekeeper for the storage shape, and the embed cannot import it. It also
        // assigns the id, so the viewer never has to invent one.
        const highlight = createHighlight(request.highlight || {});
        return await mutateHighlights(app, request.attachmentUUID, (list) =>
          list.concat([highlight])
        );
      } catch (err) {
        return { error: `Could not save the highlight: ${err.message}` };
      }
    }

    case "recolorHighlight": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        return await mutateHighlights(app, request.attachmentUUID, (list) =>
          updateHighlight(list, request.id, (h) => withColor(h, request.color))
        );
      } catch (err) {
        return { error: `Could not change the highlight color: ${err.message}` };
      }
    }

    case "setHighlightNote": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        // One code path for add, edit and remove. `withNote` trims and turns blank text
        // into null, so clearing the box IS removing the note - there is no second
        // "deleteNote" action that could disagree with this one about what empty means.
        return await mutateHighlights(app, request.attachmentUUID, (list) =>
          updateHighlight(list, request.id, (h) => withNote(h, request.note))
        );
      } catch (err) {
        return { error: `Could not save the note: ${err.message}` };
      }
    }

    case "removeHighlight": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        return await mutateHighlights(app, request.attachmentUUID, (list) =>
          removeHighlight(list, request.id)
        );
      } catch (err) {
        return { error: `Could not remove the highlight: ${err.message}` };
      }
    }

    case "sendToNote": {
      if (!request.content) return { error: "Nothing to send." };
      try {
        // atEnd - never disturbs the user's own content above it (spec §4: "probably
        // appended at the bottom of the note").
        await app.insertNoteContent(
          { uuid: app.context.noteUUID },
          "\n" + request.content + "\n",
          { atEnd: true }
        );
        return { ok: true };
      } catch (err) {
        return { error: `Could not add this to the note: ${err.message}` };
      }
    }

    case "removeViewer": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      if (!request.pluginUUID) return { error: "Missing plugin id - cannot locate this viewer." };
      try {
        const noteUUID = app.context.noteUUID;
        const content = await app.getNoteContent({ uuid: noteUUID });
        const updated = removeEmbedMarkup(content, request.pluginUUID, request.attachmentUUID);
        if (updated === null) {
          return { error: "Could not find this viewer's block in the note - it may already be removed." };
        }
        // Whole-note replace, deliberately - the embed tag can sit anywhere the user
        // left it, unlike the highlights section below, which is always the same
        // heading and can go through the safer section-scoped replace.
        await app.replaceNoteContent({ uuid: noteUUID }, updated);
        await deleteHighlights(app, noteUUID, request.attachmentUUID);
        return { ok: true };
      } catch (err) {
        return { error: `Could not remove this viewer: ${err.message}` };
      }
    }

    case "exportAll": {
      if (!request.noteName) return { error: "Missing destination note name." };
      try {
        // A deterministic name is what makes this idempotent: re-running "Export all"
        // finds the SAME note rather than creating a new one every time, and a whole
        // -note replace (no section - this note IS the export, unlike the highlights
        // data section which shares a note with the user's own content) means the
        // destination always reflects exactly the current highlight set, never a
        // growing pile of duplicates from previous runs.
        const existing = await app.findNote({ name: request.noteName });
        const noteUUID = existing ? existing.uuid : await app.createNote(request.noteName);
        await app.replaceNoteContent({ uuid: noteUUID }, request.content || "");
        return { ok: true, noteUUID };
      } catch (err) {
        return { error: `Could not export highlights: ${err.message}` };
      }
    }

    case "ping":
      // Lets the embed verify the bridge before doing real work.
      return { ok: true };

    default:
      return { error: `Unknown embed action: ${String(request.action)}` };
  }
}
