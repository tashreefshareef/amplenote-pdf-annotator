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
 * CONFIRMED LIVE: clicking an exported link navigates to the source note AND lands on the
 * exact page/highlight, not just the top of the PDF - the rewrite-then-navigate mechanism
 * above, which had no documented precedent anywhere, actually works.
 *
 * With one exception that took three attempts to pin down, because it is invisible unless
 * you test both cases separately: the above only holds when the link leads to a DIFFERENT
 * note. On the note the PDF already lives on there is no navigation, and a rewrite alone
 * does not re-mount a mounted embed, so nothing re-reads the args. See remountEmbed.
 */
import { parseEmbedArgs, updateEmbedArgs, removeEmbedMarkup } from "../embed-args.js";

/**
 * Make the embed mount again from scratch, for a link clicked on the note it already
 * lives on.
 *
 * Confirmed live, and the sharpest clue in the whole investigation: a deep link works
 * from an EXPORTED note but does nothing from a "Send to note" block at the bottom of the
 * PDF's own note. Cross-note works because navigating loads the note fresh, so the embed
 * mounts and its boot code runs. Same-note has no navigation - `app.navigate` to the note
 * you are already on is a no-op - and rewriting the note's content underneath a mounted
 * embed does NOT re-mount it. So the new args are never read, and the code that scrolls
 * the note to the PDF never runs.
 *
 * Changing the args alone was already proven insufficient. The only lever left is to make
 * the element genuinely go away and come back: write the note without its <object> line,
 * then write it back carrying the new args. It costs a visible reload of the viewer, so
 * it is confined to the case that is otherwise broken - navigating to a different note
 * still takes the single-write path.
 *
 * The restore is not optional and not conditional. Losing a viewer would be a far worse
 * outcome than a link that failed to scroll, so it runs whether or not the removal
 * succeeded, and retries once if it fails.
 */
async function remountEmbed(app, noteUUID, updated, attachmentUUID) {
  const handle = { uuid: noteUUID };
  const without = removeEmbedMarkup(updated, app.context.pluginUUID, attachmentUUID);

  if (without !== null) {
    try {
      await app.replaceNoteContent(handle, without);
    } catch {
      // Nothing was removed, so there is nothing to put back - but `updated` still has
      // to be written, which is what the call below does either way.
    }
  }

  try {
    await app.replaceNoteContent(handle, updated);
  } catch {
    // The viewer MUST come back. One retry, then let the caller's own catch report it.
    await app.replaceNoteContent(handle, updated);
  }
}

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
      // Only the same-note case needs the expensive remount - see remountEmbed. A wrong
      // answer here is not dangerous in either direction: guessing "same" when it isn't
      // costs one extra write and a reload, and guessing "different" when it isn't just
      // leaves the behaviour exactly as it is today.
      if (app.context && app.context.noteUUID === noteUUID) {
        await remountEmbed(app, noteUUID, updated, attachmentUUID);
      } else {
        await app.replaceNoteContent({ uuid: noteUUID }, updated);
      }
    }
  } catch {
    // Best-effort only - landing on the right note beats landing nowhere at all.
  }

  await app.navigate(`https://www.amplenote.com/notes/${noteUUID}`);
}
