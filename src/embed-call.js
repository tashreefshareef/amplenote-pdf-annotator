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
import {
  loadHighlights,
  saveHighlights,
  deleteHighlights,
  insertAboveManagedSection,
  withExportSeparator,
} from "./storage.js";
import { removeEmbedMarkup, setEmbedCollapsed, updateEmbedArgs } from "./embed-args.js";
import {
  listExportedHighlightIds,
  removeExportBlock,
  replaceExportBlock,
} from "./exports-in-note.js";
import {
  createHighlight,
  removeHighlight,
  updateHighlight,
  withColor,
  withNote,
} from "./highlights.js";

/**
 * Which note this call is about.
 *
 * Prefers the noteUUID the embed sends explicitly - captured once by plugin.js at
 * renderEmbed time, the moment Amplenote is definitively rendering THIS note's embed -
 * over trusting `app.context.noteUUID` fresh on every onEmbedCall. Suspected of going
 * stale specifically when a note is navigated away from and back to: an embed remounts,
 * but onEmbedCall's own context reads the wrong note, so a highlight that is genuinely
 * still saved gets looked up against the wrong note and appears to have vanished.
 * `app.context.noteUUID` stays as a fallback for older cached embed HTML that predates
 * this and never sends its own noteUUID.
 */
function resolveNoteUUID(app, request) {
  return request.noteUUID || app.context.noteUUID;
}

/**
 * Look up an attachment's display name from the note the embed lives in.
 * Never throws - a missing name is cosmetic and must not block loading the PDF.
 */
async function attachmentName(app, noteUUID, attachmentUUID) {
  try {
    const list = await app.getNoteAttachments({ uuid: noteUUID });
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
async function mutateHighlights(app, noteUUID, attachmentUUID, mutate) {
  const current = await loadHighlights(app, noteUUID, attachmentUUID);
  const next = mutate(current);
  if (next !== current) {
    await saveHighlights(app, noteUUID, attachmentUUID, next);
  }
  return { highlights: next };
}

/**
 * Apply an edit to the note's body, for keeping already-sent highlight blocks in step
 * with the highlights themselves (see src/exports-in-note.js).
 *
 * NEVER allowed to fail the action that triggered it. Recolouring a highlight is a
 * highlight operation that also happens to touch the note; if the note write fails the
 * colour change has still happened and is still correct, and reporting an error over it
 * would suggest otherwise. The stale block is a smaller problem than a user believing
 * their recolour did not take.
 *
 * A missing `pluginUUID` is not an error either: it means an embed rendered before this
 * existed is still mounted, and it simply has no block to find.
 *
 * @param edit receives the note's content and returns new content, or null for "no block
 *   of mine in here" - the overwhelmingly common case, and the one that must not write.
 */
async function editNoteBody(app, noteUUID, request, edit) {
  if (!request.pluginUUID) return;
  try {
    const content = await app.getNoteContent({ uuid: noteUUID });
    const updated = edit(content);
    if (updated !== null && updated !== content) {
      await app.replaceNoteContent({ uuid: noteUUID }, updated);
    }
  } catch {
    /* see above - the highlight operation itself already succeeded */
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
        return { url, name: await attachmentName(app, resolveNoteUUID(app, request), attachmentUUID) };
      } catch (err) {
        return { error: `Could not load the PDF: ${err.message}` };
      }
    }

    case "loadHighlights": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
        const highlights = await loadHighlights(app, noteUUID, request.attachmentUUID);
        // Which highlights the note already holds a block for, so the panel can offer
        // "remove from note" ONLY on those. An action that silently does nothing on the
        // rest would be worse than not offering it: the user cannot tell the difference
        // between "removed" and "there was never anything there".
        let sentIds = [];
        if (request.pluginUUID) {
          const content = await app.getNoteContent({ uuid: noteUUID });
          sentIds = listExportedHighlightIds(content, request.pluginUUID, request.attachmentUUID);
        }
        return { highlights, sentIds };
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
        return await mutateHighlights(app, resolveNoteUUID(app, request), request.attachmentUUID, (list) =>
          list.concat([highlight])
        );
      } catch (err) {
        return { error: `Could not save the highlight: ${err.message}` };
      }
    }

    case "recolorHighlight": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
        const result = await mutateHighlights(app, noteUUID, request.attachmentUUID, (list) =>
          updateHighlight(list, request.id, (h) => withColor(h, request.color))
        );
        // A block already sent to the note carried the OLD colour until now - the whole
        // point of the block is that its link is coloured to match, so leaving it was a
        // silent lie about which highlight it came from. `exportBlock` is rebuilt by the
        // viewer in the NEW colour and passed in, keeping export assembly client-side
        // like everything else (see src/export.js's header).
        if (request.exportBlock) {
          await editNoteBody(app, noteUUID, request, (content) =>
            replaceExportBlock(content, request.pluginUUID, request.attachmentUUID, request.id, request.exportBlock)
          );
        }
        return result;
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
        return await mutateHighlights(app, resolveNoteUUID(app, request), request.attachmentUUID, (list) =>
          updateHighlight(list, request.id, (h) => withNote(h, request.note))
        );
      } catch (err) {
        return { error: `Could not save the note: ${err.message}` };
      }
    }

    case "removeHighlight": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
        const result = await mutateHighlights(app, noteUUID, request.attachmentUUID, (list) =>
          removeHighlight(list, request.id)
        );
        // The highlight is gone, so a block still quoting it points its deep link at an id
        // that no longer resolves - a link that looks live and goes nowhere. The block
        // goes with it.
        await editNoteBody(app, noteUUID, request, (content) =>
          removeExportBlock(content, request.pluginUUID, request.attachmentUUID, request.id)
        );
        return result;
      } catch (err) {
        return { error: `Could not remove the highlight: ${err.message}` };
      }
    }

    /**
     * The Highlights panel's per-highlight "remove from note" - deletes the sent block
     * while leaving the highlight itself in the PDF.
     *
     * A dedicated action rather than a flag on removeHighlight, because they are opposite
     * intents: this one keeps the annotation and drops the write-up, and conflating them
     * behind one call is how a click meant to tidy the note ends up erasing the highlight.
     */
    case "removeFromNote": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      if (!request.pluginUUID) return { error: "Missing plugin id - cannot locate the block." };
      if (!request.id) return { error: "No highlight specified." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
        const content = await app.getNoteContent({ uuid: noteUUID });
        const updated = removeExportBlock(content, request.pluginUUID, request.attachmentUUID, request.id);
        // Nothing to remove is a normal outcome, not a failure: the panel offers this only
        // for highlights it believes are in the note, and that belief can be one edit old.
        if (updated === null) return { ok: false };
        await app.replaceNoteContent({ uuid: noteUUID }, updated);
        return { ok: true };
      } catch (err) {
        return { error: `Could not remove it from the note: ${err.message}` };
      }
    }

    case "sendToNote": {
      if (!request.content) return { error: "Nothing to send." };
      try {
        const noteHandle = { uuid: resolveNoteUUID(app, request) };

        // The bottom of the note (spec §4: "probably appended at the bottom") is NOT
        // simply `atEnd` once this plugin has written its managed data section, because
        // that section is created at the end and so becomes whatever is last. Appending
        // then files the export INSIDE it - and saveHighlights replaces that section
        // wholesale on the next highlight, so every export the user had sent silently
        // disappeared the moment they highlighted anything else. Reported live.
        //
        // The user's exports are their content and belong in their note body; the
        // managed section stays pinned last. Costs a read plus a whole-note write, but
        // only on a note that HAS the section - a fresh note still takes the cheap path.
        const content = await app.getNoteContent(noteHandle);

        // Re-sending a highlight REFRESHES its block where it already sits, rather than
        // appending a second copy. Reported live with a screenshot of the same quote three
        // times in two different colours - each send appended, so the note accumulated
        // stale duplicates that all claimed to be the same highlight. Editing in place
        // also means a block the user has moved stays where they put it.
        if (request.highlightId) {
          const replaced = replaceExportBlock(
            content,
            request.pluginUUID,
            request.attachmentUUID,
            request.highlightId,
            request.content
          );
          if (replaced !== null) {
            await app.replaceNoteContent(noteHandle, replaced);
            return { ok: true, replaced: true };
          }
        }

        // Both branches get the separator from the SAME note content, read once above -
        // whether the note has a managed section is unrelated to whether it already
        // holds exports, and deciding that twice from two different reads is how the
        // two paths would end up disagreeing about which send is the first.
        const block = withExportSeparator(content, request.content);
        const rewritten = insertAboveManagedSection(content, block);
        if (rewritten === null) {
          await app.insertNoteContent(noteHandle, "\n" + block + "\n", {
            atEnd: true,
          });
        } else {
          await app.replaceNoteContent(noteHandle, rewritten);
        }
        return { ok: true };
      } catch (err) {
        return { error: `Could not add this to the note: ${err.message}` };
      }
    }

    case "removeViewer": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      if (!request.pluginUUID) return { error: "Missing plugin id - cannot locate this viewer." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
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

    case "getViewerSummary": {
      // What the collapsed bar needs to label itself: the PDF's name and how many
      // highlights it holds. Deliberately does NOT resolve the attachment URL - a viewer
      // that loads collapsed never fetches the PDF, and this is the whole reason it can
      // still say which PDF it is.
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      const noteUUID = resolveNoteUUID(app, request);
      const name = await attachmentName(app, noteUUID, request.attachmentUUID);
      try {
        const highlights = await loadHighlights(app, noteUUID, request.attachmentUUID);
        return { name, count: highlights.length };
      } catch {
        // A missing count is cosmetic; the name alone still identifies the viewer.
        return { name, count: 0 };
      }
    }

    case "setCollapsed": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      if (!request.pluginUUID) return { error: "Missing plugin id - cannot locate this viewer." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
        const content = await app.getNoteContent({ uuid: noteUUID });
        const updated = setEmbedCollapsed(
          content,
          request.pluginUUID,
          request.attachmentUUID,
          request.collapsed
        );
        // Not an error the user needs to see: the embed has already hidden its own DOM,
        // so the only loss is the box not shrinking with it. Reporting a failed note
        // write for what looks like a toggle would be more confusing than the leftover
        // space.
        if (updated === null) return { ok: false };
        // Whole-note replace, same as removeViewer - the tag sits wherever the user left
        // it, which since chip anchoring is anywhere in the body.
        await app.replaceNoteContent({ uuid: noteUUID }, updated);
        return { ok: true };
      } catch (err) {
        return { error: `Could not resize this viewer: ${err.message}` };
      }
    }

    /**
     * Spend a deep link: drop `page`/`hl` from the embed's tag once the viewer has acted
     * on them.
     *
     * linkTarget writes those args into the tag before navigating, because an embed on a
     * note being OPENED cannot be passed arguments any other way. They are an instruction
     * for that one load, but they persist in the note markup, so every later open replays
     * them - the note scrolls itself down to the embed and the PDF jumps to a highlight
     * nobody asked for. Reported live. Clearing them here is what makes the instruction
     * one-shot.
     *
     * `collapsed` is deliberately NOT touched: it is genuine durable state (which is why
     * it lives in the same tag), and resetting it here would re-collapse a viewer the
     * link had just expanded.
     */
    case "clearDeepLink": {
      if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
      if (!request.pluginUUID) return { error: "Missing plugin id - cannot locate this viewer." };
      try {
        const noteUUID = resolveNoteUUID(app, request);
        const content = await app.getNoteContent({ uuid: noteUUID });
        const updated = updateEmbedArgs(content, request.pluginUUID, request.attachmentUUID, {
          page: null,
          highlightId: null,
        });
        // No matching embed line - a hand-edited note, or one whose viewer was removed
        // while this load was in flight. Nothing to clean up and nothing to report.
        if (updated === null) return { ok: false };
        await app.replaceNoteContent({ uuid: noteUUID }, updated);
        return { ok: true };
      } catch (err) {
        return { error: `Could not clear this viewer's deep link: ${err.message}` };
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
