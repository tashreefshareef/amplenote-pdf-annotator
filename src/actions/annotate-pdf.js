/**
 * The "Annotate PDF" note option: pick a PDF on the note and open the annotator embed.
 *
 * Standalone function taking `app` as a parameter, per spec section 8 - this is what makes it
 * reachable from the Jest suite, which the bounty T&C requires for actions that modify
 * note data.
 */
import { choosePdfAttachment } from "../attachments.js";
import { buildEmbedMarkup, hasEmbedFor, insertEmbedAfterChip } from "../embed-args.js";

/**
 * @param {object} app        Amplenote app interface
 * @param {string} noteUUID   Note the option was invoked from
 * @param {string} pluginUUID UUID of the plugin note (needed to build `plugin://` markup)
 * @returns {Promise<string|null>} the attachment uuid opened, or null if nothing happened
 */
export async function annotatePdf(app, noteUUID, pluginUUID) {
  const attachment = await choosePdfAttachment(app, noteUUID);

  if (!attachment) {
    // Covers both "no PDFs here" and "user cancelled the picker". Only worth a message
    // in the first case; re-prompting someone who just cancelled is annoying.
    const all = await app.getNoteAttachments({ uuid: noteUUID });
    const hasAny = Array.isArray(all) && all.length > 0;
    if (!hasAny || !all.some((a) => a && a.type === "application/pdf")) {
      await app.alert(
        "No PDF attachments on this note.\n\n" +
          "Attach a PDF with the paperclip button in the note toolbar, then run this again."
      );
    }
    return null;
  }

  const content = await app.getNoteContent({ uuid: noteUUID });

  // Re-running the option shouldn't stack duplicate viewers in the note.
  if (hasEmbedFor(content, pluginUUID, attachment.uuid)) {
    await app.alert(`"${attachment.name}" is already open in this note - scroll to the viewer.`);
    return attachment.uuid;
  }

  const markup = buildEmbedMarkup(pluginUUID, { attachmentUUID: attachment.uuid });

  // Preferred: put the viewer directly beneath the PDF's own attachment chip, so a note
  // with several PDFs reads as several PDFs each followed by its viewer - rather than N
  // chips scattered through the text and N viewers stacked anonymously at the bottom.
  // Costs a whole-note rewrite, since Amplenote has no positional insert.
  const anchored = insertEmbedAfterChip(content, attachment.uuid, markup);
  if (anchored !== null) {
    await app.replaceNoteContent({ uuid: noteUUID }, anchored);
    return attachment.uuid;
  }

  // No chip in the body for this attachment - it can be deleted from the text while the
  // attachment itself lives on. Appending is still correct, and it avoids rewriting the
  // whole note for no placement benefit.
  await app.insertNoteContent({ uuid: noteUUID }, `\n${markup}\n`, { atEnd: true });

  return attachment.uuid;
}
