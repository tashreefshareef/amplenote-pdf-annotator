/**
 * The `linkTarget` plugin action - Amplenote's dedicated handler for a clicked
 * `plugin://` markdown link, e.g. `[PDF name](plugin://UUID?att=...&page=...&hl=...)`.
 *
 * NOT the same thing as `renderEmbed`, which only ever handles the
 * `<object data="plugin://...">` embed tag. Confirmed live (a clicked exported link did
 * nothing but show Amplenote's generic "unrecognized link" popup) and via Amplenote's
 * own docs, not guessed: a plain clickable link routes to `linkTarget` specifically, and
 * without one defined at all, Amplenote has nothing to route the click to.
 *
 * `app.navigate` is the documented way to jump to a note (`https://www.amplenote.com/
 * notes/NOTE_UUID`), but there is no documented way to pass embed arguments alongside
 * it - `app.context.updateEmbedArgs` + `renderEmbed` only work "already operating within
 * that embed's context," i.e. an embed already open in front of the user, not one on a
 * note being navigated to. So landing on the exact highlight, not just the right note,
 * means rewriting that note's OWN embed tag to carry the target page/highlight BEFORE
 * navigating - best-effort: if anything about that fails (a hand-edited note, a link
 * exported before the source note's uuid was tracked - see docs/api-notes.md), the user
 * still lands on the correct note, just not scrolled to the exact spot.
 *
 * CONFIRMED LIVE, both halves: clicking an exported link navigates to the source note
 * AND lands on the exact page/highlight, not just the top of the PDF - the rewrite-then-
 * navigate mechanism above, which had no documented precedent anywhere, actually works.
 */
import { parseEmbedArgs, updateEmbedArgs } from "../embed-args.js";

/**
 * @param app         Amplenote app interface
 * @param queryString the raw string after `plugin://UUID?` - Amplenote hands this to
 *   linkTarget the same way it hands renderEmbed's args (spec section 7.3's format).
 */
export async function linkTarget(app, queryString) {
  const { noteUUID, attachmentUUID, page, highlightId } = parseEmbedArgs(queryString);

  if (!noteUUID) {
    await app.alert(
      "This link doesn't say which note the PDF lives on - it was likely exported by an " +
        "older version of this plugin. Re-export the highlight to get a working link."
    );
    return;
  }

  try {
    const content = await app.getNoteContent({ uuid: noteUUID });
    const updated = updateEmbedArgs(content, app.context.pluginUUID, attachmentUUID, {
      page,
      highlightId,
      // Landing on a collapsed viewer would defeat the link entirely - the whole promise
      // is "click this and see the highlight". Expanding also restores the box's full
      // height, since the two are rewritten together (see updateEmbedArgs).
      collapsed: false,
    });
    // null means no matching embed line was found - nothing to rewrite, not an error.
    // Still navigate; the user lands on the note even without a scroll target.
    if (updated !== null) {
      await app.replaceNoteContent({ uuid: noteUUID }, updated);
    }
  } catch {
    // Best-effort only - landing on the right note beats landing nowhere at all.
  }

  await app.navigate(`https://www.amplenote.com/notes/${noteUUID}`);
}
