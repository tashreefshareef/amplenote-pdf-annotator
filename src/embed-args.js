/**
 * Embed argument encoding.
 *
 * Amplenote passes embed parameters as a QUERY STRING, verified in the live app:
 *   <object data="plugin://UUID?page=3&x=100" />  ->  renderEmbed(app, "page=3&x=100")
 *
 * Built in Phase 1 even though only `att` is used yet, because spec section 7.3 warns that
 * retrofitting the deep-link schema in Phase 5 is the expensive path. The exported
 * highlight links in Phase 5 are just `buildEmbedArgs` with page and coordinates filled.
 *
 * Coordinates are PDF user-space (origin bottom-left), matching the storage model in
 * spec section 3 - never screen pixels.
 */
import {
  ATTACHMENT_SCHEME,
  COLLAPSED_ASPECT_RATIO,
  EXPANDED_ASPECT_RATIO,
} from "./constants.js";

/** The box proportions that match a given collapsed state - see constants.js. */
export function aspectRatioFor(collapsed) {
  return collapsed ? COLLAPSED_ASPECT_RATIO : EXPANDED_ASPECT_RATIO;
}

/**
 * Parse the argument Amplenote hands to `renderEmbed`.
 *
 * Tolerant by design: the arg may be undefined (embed inserted with no params), a bare
 * query string, or one with a leading "?". A malformed value must never throw, or the
 * embed renders as a blank box with no way to diagnose it.
 *
 * Shared by two different consumers with different needs from the same shape:
 * `renderEmbed` (the `<object>` tag's own args - `noteUUID` is always null there, since
 * the embed already gets its note from `app.context.noteUUID` at render time, not from
 * its own tag) and `linkTarget` (an exported highlight's deep link - `noteUUID` is the
 * one thing it needs that the embed tag never carries, since a deep link has to say
 * which note to navigate TO before anything else). One parser for both rather than two,
 * since the query-string shape is otherwise identical.
 *
 * @returns {{attachmentUUID: string|null, page: number|null, x: number|null,
 *            y: number|null, highlightId: string|null, noteUUID: string|null}}
 */
export function parseEmbedArgs(arg) {
  const empty = {
    attachmentUUID: null,
    page: null,
    x: null,
    y: null,
    highlightId: null,
    noteUUID: null,
    collapsed: false,
    attachmentName: "",
  };
  if (!arg || typeof arg !== "string") return empty;

  let params;
  try {
    params = new URLSearchParams(arg.replace(/^\?/, ""));
  } catch {
    return empty;
  }

  const num = (key) => {
    const raw = params.get(key);
    if (raw === null || raw.trim() === "") return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  };

  const page = num("page");

  return {
    attachmentUUID: params.get("att") || null,
    // Pages are 1-based in every user-facing context; reject 0 and negatives rather
    // than silently scrolling somewhere unexpected.
    page: page !== null && page >= 1 ? Math.floor(page) : null,
    x: num("x"),
    y: num("y"),
    highlightId: params.get("hl") || null,
    noteUUID: params.get("note") || null,
    // The viewer's collapsed state has to live in the tag, not just in the embed's DOM:
    // shrinking the box means rewriting the tag anyway, and a re-render must come back up
    // in the state the user left it in rather than springing open again.
    collapsed: params.get("c") === "1",
    // The PDF's display name, baked in when the viewer is inserted rather than looked up.
    // The live `getNoteAttachments` lookup silently returns "" in the embed-call path -
    // confirmed by an export note that came out titled "PDF - Highlights" and highlight
    // links that all read "PDF" - which left every viewer on a note labelled identically.
    // Carrying it in the tag also means a collapsed viewer knows its own name without
    // loading anything.
    attachmentName: params.get("n") || "",
  };
}

/**
 * Build the query string for an embed. Omits empty values so a plain viewer link stays
 * short and readable.
 */
export function buildEmbedArgs({
  attachmentUUID,
  page,
  x,
  y,
  highlightId,
  collapsed,
  attachmentName,
} = {}) {
  const params = new URLSearchParams();
  if (attachmentUUID) params.set("att", attachmentUUID);
  if (collapsed) params.set("c", "1");
  // URLSearchParams percent-encodes this, which matters beyond tidiness: the query ends up
  // inside data="..." in the note markup, so a filename containing a double quote would
  // otherwise terminate the attribute and break the tag.
  if (attachmentName) params.set("n", attachmentName);
  if (Number.isFinite(page) && page >= 1) params.set("page", String(Math.floor(page)));
  if (Number.isFinite(x)) params.set("x", String(x));
  if (Number.isFinite(y)) params.set("y", String(y));
  if (highlightId) params.set("hl", highlightId);
  return params.toString();
}

/**
 * The markup that renders an inline plugin embed in a note body.
 *
 * Inline embeds are the surface we build on: `app.openSidebarEmbed` opens the Peek
 * Viewer, which requires a Pro subscription and shows an upgrade prompt on Personal
 * plans. See docs/api-notes.md.
 */
export function buildEmbedMarkup(pluginUUID, args = {}, aspectRatio = null) {
  if (!pluginUUID) throw new Error("buildEmbedMarkup: pluginUUID required");
  // Defaults to whichever ratio matches the collapsed flag, so the box and the state it
  // encodes can never disagree - an explicit ratio is only for tests and callers that
  // genuinely want a one-off size.
  if (aspectRatio === null) aspectRatio = aspectRatioFor(args.collapsed);
  const query = buildEmbedArgs(args);
  const target = query ? `plugin://${pluginUUID}?${query}` : `plugin://${pluginUUID}`;
  return `<object data="${target}" data-aspect-ratio="${aspectRatio}" />`;
}

/**
 * Splice an embed tag into note content directly beneath the PDF's own attachment chip.
 *
 * The reason this can exist at all: the chip is a plain markdown link,
 * `[name](attachment://UUID)`, sitting at its real position in the body - see
 * ATTACHMENT_SCHEME in src/constants.js for the dump that confirmed it. Amplenote exposes
 * no positional write (`insertNoteContent` offers only `{ atEnd }`), so the caller has to
 * follow this with a whole-note `replaceNoteContent`.
 *
 * Matched on the uuid substring rather than a full link regex on purpose: the chip's exact
 * markdown is undocumented, so anything about the link's shape that isn't the uuid is an
 * assumption waiting to break. The uuid is the one part with a documented meaning.
 *
 * @returns {string|null} updated content, or null if this attachment has no chip in the
 *   body - the caller's cue to fall back to appending, NOT an error. A note can legitimately
 *   hold an attachment with no chip left in the text.
 */
export function insertEmbedAfterChip(noteContent, attachmentUUID, markup) {
  if (!noteContent || !attachmentUUID || !markup) return null;

  const lines = noteContent.split("\n");
  const idx = lines.findIndex((line) => line.includes(`${ATTACHMENT_SCHEME}${attachmentUUID}`));
  if (idx === -1) return null;

  // A blank line either side, so the tag is its own block - the shape that renders. Where
  // the chip is already followed by a blank line, reuse it as the leading one and splice
  // in after it, rather than adding a second: repeatedly annotating and detaching would
  // otherwise leave the note accumulating vertical gaps.
  const next = lines.slice();
  if (lines[idx + 1] === "") {
    next.splice(idx + 2, 0, markup.trim(), "");
  } else {
    next.splice(idx + 1, 0, "", markup.trim(), "");
  }
  return next.join("\n");
}

/** True if note content already embeds this plugin, to avoid inserting duplicates. */
export function hasEmbedFor(noteContent, pluginUUID, attachmentUUID = null) {
  if (!noteContent || !pluginUUID) return false;
  if (!noteContent.includes(`plugin://${pluginUUID}`)) return false;
  if (!attachmentUUID) return true;
  return noteContent.includes(`att=${attachmentUUID}`);
}

/**
 * Remove ONE specific embed's `<object>` line from note content - the counterpart to
 * hasEmbedFor, used when a viewer is explicitly detached (embed-call.js's `removeViewer`
 * action). Matched by this exact attachment's `att=` marker, so it can never touch a
 * different embed for a different PDF on the same note.
 *
 * annotatePdf always inserts the tag as its own line, wrapped in a blank line before and
 * after (`\n<object .../>\n`) - so once the line itself is spliced out, one of the two
 * now-adjacent blank lines is collapsed too, or removal would leave a growing gap each
 * time a viewer is added and removed.
 *
 * @returns {string|null} the updated note content, or null if no matching line was
 *   found (nothing to remove - already gone, or never matched this exact shape).
 */
export function removeEmbedMarkup(noteContent, pluginUUID, attachmentUUID) {
  if (!noteContent || !pluginUUID || !attachmentUUID) return null;

  const lines = noteContent.split("\n");
  const marker = `plugin://${pluginUUID}`;
  const idx = lines.findIndex(
    (line) => line.includes(marker) && line.includes(`att=${attachmentUUID}`)
  );
  if (idx === -1) return null;

  const next = lines.slice();
  next.splice(idx, 1);
  if (next[idx] === "" && next[idx - 1] === "") next.splice(idx, 1);
  return next.join("\n");
}

/**
 * Rewrite ONE specific embed's `<object>` tag to carry new args, merged with whatever it
 * already had - used by the `linkTarget` action (src/actions/link-target.js) so clicking
 * an exported highlight's deep link can make the embed on the TARGET note jump straight
 * to that highlight the moment it next renders, not just open to wherever it last was.
 *
 * There is no documented way to pass embed arguments through `app.navigate` when jumping
 * to a different note (checked against Amplenote's own docs - `updateEmbedArgs` +
 * `renderEmbed` only work "already operating within that embed's context," i.e. for an
 * embed already open in front of the user, not one on a note being navigated to). Baking
 * the target directly into the embed tag's own args - which `renderEmbed` already reads
 * correctly, since that code path is unrelated and unchanged - sidesteps needing such a
 * mechanism to exist at all.
 *
 * Matched by attachment uuid, same as `removeEmbedMarkup` - never touches a different
 * embed for a different PDF on the same note.
 *
 * Also rewrites `data-aspect-ratio` to match the merged `collapsed` flag. The box size and
 * the state it encodes are two representations of one thing, and letting them drift apart
 * would leave a collapsed viewer in a full-height box or vice versa.
 *
 * @param updates {{page?: number, highlightId?: string, collapsed?: boolean}} merged over
 *   the embed's existing args - anything not passed here (notably `attachmentUUID`) is
 *   preserved.
 * @returns {string|null} the updated note content, or null if no matching embed line was
 *   found - the caller's cue to fall back to navigating without a scroll target, rather
 *   than silently doing nothing.
 */
export function updateEmbedArgs(noteContent, pluginUUID, attachmentUUID, updates = {}) {
  if (!noteContent || !pluginUUID || !attachmentUUID) return null;

  const lines = noteContent.split("\n");
  const marker = `plugin://${pluginUUID}`;
  const idx = lines.findIndex(
    (line) => line.includes(marker) && line.includes(`att=${attachmentUUID}`)
  );
  if (idx === -1) return null;

  const line = lines[idx];
  const dataMatch = line.match(/data="(plugin:\/\/[^"]*)"/);
  if (!dataMatch) return null;

  const target = dataMatch[1];
  const queryIndex = target.indexOf("?");
  const currentQuery = queryIndex === -1 ? "" : target.slice(queryIndex + 1);
  const current = parseEmbedArgs(currentQuery);
  const merged = { ...current, attachmentUUID, ...updates };
  const mergedQuery = buildEmbedArgs(merged);
  const newTarget = mergedQuery ? `plugin://${pluginUUID}?${mergedQuery}` : `plugin://${pluginUUID}`;

  const next = lines.slice();
  let updatedLine = line.replace(dataMatch[0], `data="${newTarget}"`);

  // The box has to be resized here too, or the collapsed flag is decorative - an embed
  // cannot resize itself (see constants.js). Hand-edited tags may have lost the attribute
  // entirely, so append it rather than assuming a replace will match.
  const ratio = aspectRatioFor(merged.collapsed);
  const ratioMatch = updatedLine.match(/data-aspect-ratio="[^"]*"/);
  updatedLine = ratioMatch
    ? updatedLine.replace(ratioMatch[0], `data-aspect-ratio="${ratio}"`)
    : updatedLine.replace(/\s*\/>\s*$/, ` data-aspect-ratio="${ratio}" />`);

  next[idx] = updatedLine;
  return next.join("\n");
}

/**
 * Collapse or expand ONE viewer, by rewriting its tag's args AND its box proportions.
 *
 * The whole reason this round-trips to the plugin instead of staying inside the embed:
 * the embed cannot resize its own iframe, so hiding the DOM alone leaves the title bar
 * floating above a tall blank rectangle - the reported bug. See constants.js.
 *
 * @returns {string|null} updated content, or null if this viewer's tag wasn't found.
 */
export function setEmbedCollapsed(noteContent, pluginUUID, attachmentUUID, collapsed) {
  return updateEmbedArgs(noteContent, pluginUUID, attachmentUUID, { collapsed: !!collapsed });
}
