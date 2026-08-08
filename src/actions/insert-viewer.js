/**
 * The `insertText` action: place a viewer exactly where the cursor is.
 *
 * The counterpart to `annotatePdf` (the note-menu option), which can only ever append -
 * `insertNoteContent`'s sole documented positioning option is `{ atEnd }`, and nothing in
 * Amplenote's API exposes where a PDF's attachment chip sits in the note body, so
 * "put the viewer next to its chip" is not something the plugin can compute. `insertText`
 * sidesteps that entirely by letting the USER pick the spot: Amplenote replaces the typed
 * `{PDF Annotator}` expression with whatever string this returns, wherever it was typed.
 *
 * This is how Obsidian's PDF++ gets inline placement too - the embed lands where you
 * inserted it because you typed it there, not because the plugin located the attachment.
 *
 * Standalone function taking `app` as a parameter, per spec section 8, so the Jest suite can
 * reach it - this writes note content, which the bounty T&C requires coverage of.
 */
import { choosePdfAttachment } from "../attachments.js";
import { buildEmbedMarkup, hasEmbedFor } from "../embed-args.js";

/**
 * Every exit path returns a string, including the ones that do nothing useful. Amplenote
 * substitutes the return value for the `{expression}` the user typed; it is not documented
 * what a non-string return does to that expression, and leaving a stray `{PDF Annotator}`
 * sitting in the note after a cancel would look like a broken action. "" removes it.
 *
 * @param {object} app        Amplenote app interface
 * @param {string} noteUUID   Note the expression was typed in
 * @param {string} pluginUUID UUID of the plugin note (needed to build `plugin://` markup)
 * @returns {Promise<string>} markup to substitute for the expression, or "" for none
 */
export async function insertViewer(app, noteUUID, pluginUUID) {
  if (!noteUUID) return "";

  const attachment = await choosePdfAttachment(app, noteUUID);

  if (!attachment) {
    // Same split as annotatePdf: "no PDFs here" is worth explaining, a deliberate cancel
    // is not.
    const all = await app.getNoteAttachments({ uuid: noteUUID });
    const hasAny = Array.isArray(all) && all.length > 0;
    if (!hasAny || !all.some((a) => a && a.type === "application/pdf")) {
      await app.alert(
        "No PDF attachments on this note.\n\n" +
          "Attach a PDF with the paperclip button in the note toolbar, then type " +
          "{PDF Annotator} again where you want the viewer."
      );
    }
    return "";
  }

  const content = await app.getNoteContent({ uuid: noteUUID });

  // A second embed for the same PDF would fight the first over the same stored
  // highlights. Relocating the existing one instead would mean rewriting the note while
  // the editor still has an active `{expression}` in it - untested interaction, so it is
  // deliberately not attempted here; "Detach viewer" already exists for that.
  if (hasEmbedFor(content, pluginUUID, attachment.uuid)) {
    await app.alert(
      `"${attachment.name}" already has a viewer in this note.\n\n` +
        "Detach that one first if you want to move it here."
    );
    return "";
  }

  // Wrapped in newlines so the tag lands as its own block rather than inline in the
  // middle of the paragraph the expression was typed into - the shape annotatePdf
  // already writes, and the only shape confirmed to render.
  return `\n${buildEmbedMarkup(pluginUUID, { attachmentUUID: attachment.uuid })}\n`;
}
