/**
 * The "Annotate PDF" note option: pick a PDF on the note and open the annotator embed.
 *
 * Standalone function taking `app` as a parameter, per spec §8 — this is what makes it
 * reachable from the Jest suite, which the bounty T&C requires for actions that modify
 * note data.
 */
import { choosePdfAttachment } from "../attachments.js";
import { buildEmbedMarkup, hasEmbedFor } from "../embed-args.js";

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
    await app.alert(`"${attachment.name}" is already open in this note — scroll to the viewer.`);
    return attachment.uuid;
  }

  await app.insertNoteContent(
    { uuid: noteUUID },
    `\n${buildEmbedMarkup(pluginUUID, { attachmentUUID: attachment.uuid })}\n`,
    { atEnd: true }
  );

  return attachment.uuid;
}
