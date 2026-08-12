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
import {
  parseEmbedArgs,
  updateEmbedArgs,
  removeEmbedMarkup,
  headingAboveEmbed,
} from "../embed-args.js";
import { DEBUG_LINKS_SETTING_NAME } from "../constants.js";

const noteUrl = (noteUUID) => `https://www.amplenote.com/notes/${noteUUID}`;

/**
 * The anchor Amplenote gives a heading: spaces become underscores, and NOTHING ELSE
 * CHANGES.
 *
 * Read off the live app (`getNoteSections`) rather than inferred, after inference got it
 * wrong twice. Real values from a real note:
 *
 *   "The ISP's plain DNS beat every encrypted resolver"
 *     -> "The_ISP's_plain_DNS_beat_every_encrypted_resolver"
 *   "Encryption is what costs the time, not the provider"
 *     -> "Encryption_is_what_costs_the_time,_not_the_provider"
 *   "My result isn't a fluke; it's geography"
 *     -> "My_result_isn't_a_fluke;_it's_geography"
 *
 * Apostrophes, commas, semicolons and hyphens all survive verbatim. The docs' "some other
 * URL-safety transformations" turns out to describe nothing that applies here.
 *
 * THE TRAP THIS REPLACES, because it was convincing: `encodeURIComponent` matched every
 * one of 88 headings on Amplenote's own published API notes, colons percent-encoded and
 * dots left alone. But a PUBLISHED note is a different renderer, and it encodes when it
 * writes an href. The app being called does not - so `'` became `%27`, named no section,
 * and the deep link landed at the bottom of the note. Two renderers on one platform
 * disagreed, and only the one actually being called is authoritative.
 *
 * Escapes just the two characters that would otherwise break the URL itself. Anything
 * else is left exactly as the app reports it.
 */
function anchorForHeading(text) {
  const trimmed = String(text || "").trim();
  if (!trimmed) return null;
  return trimmed.replace(/\s+/g, "_").replace(/%/g, "%25").replace(/#/g, "%23");
}

/**
 * A heading line's text as Amplenote would RENDER it - the form its anchor is built from.
 *
 * `headingAboveEmbed` reads raw markdown, so `## **Paper** - [Smith](http://x)` arrives
 * with its markup attached, while `getNoteSections` reports the rendered "Paper - Smith".
 * Comparing the two directly means a formatted heading never matches its own section.
 */
function renderedHeadingText(text) {
  return String(text || "")
    .replace(/<[^>]*>/g, "")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*\*|\*\*|\*|___|__|_|~~|`)/g, "")
    .trim();
}

/**
 * The URL that lands on the section a heading opens, or null.
 *
 * `getNoteSections` is the authority and its `anchor` field is what to read. Confirmed
 * against a live note: every section came back as
 * `{ heading: { anchor, href, level, text } }` with **`href` null** - so the href path
 * this used to prefer never fired, and the derived value was doing all the work while
 * looking like a fallback. Reading `anchor` is what makes a heading with punctuation work
 * at all; deriving is now only for a host that reports no sections.
 *
 * Matched on RENDERED text, because that is the form `heading.text` comes back in while
 * the heading itself was read out of raw markdown.
 */
async function sectionUrl(app, noteUUID, headingText) {
  let sections = null;
  if (typeof app.getNoteSections === "function") {
    try {
      sections = await app.getNoteSections({ uuid: noteUUID });
    } catch {
      // A note whose sections can't be read still navigates - just to its top.
    }
  }

  const wanted = renderedHeadingText(headingText);
  const match = Array.isArray(sections)
    ? sections.find((section) => renderedHeadingText(section?.heading?.text) === wanted)
    : null;

  const reported = match?.heading?.anchor || match?.anchor;
  if (typeof reported === "string" && reported) {
    return {
      url: `${noteUrl(noteUUID)}#${reported.replace(/%/g, "%25").replace(/#/g, "%23")}`,
      source: `anchor reported by getNoteSections (${sectionCount(sections)} sections)`,
    };
  }

  // Some builds may carry a whole href instead - kept because it costs two lines and the
  // section object's shape is documented nowhere.
  const href = match?.heading?.href || match?.href;
  if (typeof href === "string" && href) {
    if (/^https?:\/\//.test(href)) return { url: href, source: "href reported by the host" };
    if (href.startsWith("#")) {
      return { url: `${noteUrl(noteUUID)}${href}`, source: "href fragment from the host" };
    }
  }

  const anchor = anchorForHeading(wanted);
  return {
    url: anchor ? `${noteUrl(noteUUID)}#${anchor}` : null,
    source: match
      ? `section matched but reported no anchor (${sectionCount(sections)} sections)`
      : `NO section matched "${wanted}" (${sectionCount(sections)} sections)`,
  };
}

const sectionCount = (sections) => (Array.isArray(sections) ? sections.length : "no");

/**
 * Navigate to the note, aimed at the PDF's own section rather than the top of the note.
 *
 * WHY, and the limitation it is chipping at: on the desktop web app the embed scrolls the
 * note to itself by taking focus, and a deep link lands on the exact highlight. In the
 * mobile app nothing inside the iframe can move the note at all - focus, `scrollIntoView`
 * and a non-passive `touchmove` were all tried and all lost (docs/api-notes.md #13) - so
 * the reported symptom is: the link opens the right note, the viewer is already sitting on
 * the right highlight, and the reader has to find the PDF by hand.
 *
 * `app.navigate` is the one scroll lever that lives OUTSIDE the iframe, which is what
 * makes this worth trying at all: the app interface reference documents
 * `.../notes/UUID#Section_name` as a navigation target, and the host app - not the embed -
 * is the thing that acts on it. It cannot aim at the embed itself, only at the nearest
 * heading above it, so the best case is "lands on the section holding the PDF" rather than
 * "lands on the PDF". A note with no heading above its viewer gets today's behaviour.
 *
 * CONFIRMED ON ANDROID (2026-08-12), on the first attempt, on the same build where focus
 * and `scrollIntoView` from inside the embed both did nothing: the note scrolls to the
 * PDF and the highlight. The lesson is in docs/bugs-found.md - the three earlier attempts
 * all assumed the scroll had to originate inside the frame, and it was that assumption
 * that was wrong, not the mechanisms.
 *
 * THEN REPORTED BROKEN on a different note: the link landed at the BOTTOM of the note -
 * the managed data section, or the last exported block. An anchor naming no section does
 * not fail quietly; the app appears to answer an unresolvable fragment by dropping the
 * reader at the end of the document, which is further from the target than doing nothing.
 * Two rounds of inference about the anchor format followed, both wrong (see
 * docs/api-notes.md 9a), which is why `DEBUG_LINKS_SETTING_NAME` exists: this path is only
 * reproducible on a phone, where nothing about the decision is otherwise observable.
 *
 * A SECOND SUSPECT is still open, and it is not the anchor: this action rewrites the note
 * twice when the link is clicked on the note the PDF already lives on (see remountEmbed),
 * and `app.navigate` to the note you are already on is a documented no-op. So on the
 * same-note path there may be no navigation to carry a fragment at all, and a mobile
 * editor re-rendering a note replaced underneath it would plausibly land at the end. The
 * report below names which path ran, because that is the fact that separates the two.
 *
 * Best-effort throughout, and it must be: landing on the right note is the promise, and a
 * wrong or unrecognised anchor must never cost that. `navigate` is documented to return
 * false when it fails, so a rejected anchor is retried bare - though note that a fragment
 * the app RESOLVES WRONGLY still returns true, so that retry is not a safety net for this.
 */
async function navigateToEmbed(app, noteUUID, content, attachmentUUID, sameNote) {
  const plain = noteUrl(noteUUID);
  let url = plain;
  let heading = null;
  let source = "no heading above the embed - navigating to the note itself";

  try {
    heading = headingAboveEmbed(content, app.context.pluginUUID, attachmentUUID);
    if (heading) {
      const resolved = await sectionUrl(app, noteUUID, heading.text);
      url = resolved.url || plain;
      source = resolved.source;
    }
  } catch (error) {
    source = `section lookup threw: ${(error && error.message) || error}`;
  }

  await reportDeepLink(app, { sameNote, heading, source, url });

  if ((await app.navigate(url)) === false && url !== plain) await app.navigate(plain);
}

/**
 * Show what this link decided, when `setting | Debug deep links` is on. See that constant.
 *
 * Deliberately BEFORE the navigation rather than after: an alert raised while the app is
 * changing screens is not something to rely on, and the decision is the interesting part.
 * Silent by default and silent if anything here fails - a diagnostic that can break the
 * feature it is diagnosing is worse than none.
 */
async function reportDeepLink(app, { sameNote, heading, source, url }) {
  try {
    const setting = app.settings && app.settings[DEBUG_LINKS_SETTING_NAME];
    if (!setting || String(setting).trim() === "" || String(setting).trim() === "0") return;

    await app.alert(
      "PDF Annotator deep link\n\n" +
        `Path: ${sameNote ? "SAME note (rewrite + remount, navigate is a no-op)" : "different note (navigate)"}\n` +
        `Heading above the embed: ${heading ? `"${heading.text}" (h${heading.level})` : "none found"}\n` +
        `Anchor source: ${source}\n\n` +
        `Navigating to:\n${url}`
    );
  } catch {
    // Never let the report cost the navigation.
  }
}

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

  // Kept outside the try so the navigation below can still find the heading above the
  // embed even if the rewrite half of this fails.
  let content = null;
  // Whether the reader is already looking at the note being linked to. Decides the remount
  // below, and named in the debug report because it is the fact that separates "the anchor
  // is wrong" from "there was no navigation to carry an anchor" - see navigateToEmbed.
  const sameNote = !!(app.context && app.context.noteUUID === noteUUID);

  try {
    content = await app.getNoteContent({ uuid: noteUUID });
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
      if (sameNote) {
        await remountEmbed(app, noteUUID, updated, attachmentUUID);
      } else {
        await app.replaceNoteContent({ uuid: noteUUID }, updated);
      }
    }
  } catch {
    // Best-effort only - landing on the right note beats landing nowhere at all.
  }

  await navigateToEmbed(app, noteUUID, content, attachmentUUID, sameNote);
}
