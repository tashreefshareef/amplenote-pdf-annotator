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
  };
}

/**
 * Build the query string for an embed. Omits empty values so a plain viewer link stays
 * short and readable.
 */
export function buildEmbedArgs({ attachmentUUID, page, x, y, highlightId } = {}) {
  const params = new URLSearchParams();
  if (attachmentUUID) params.set("att", attachmentUUID);
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
export function buildEmbedMarkup(pluginUUID, args = {}, aspectRatio = 1.2) {
  if (!pluginUUID) throw new Error("buildEmbedMarkup: pluginUUID required");
  const query = buildEmbedArgs(args);
  const target = query ? `plugin://${pluginUUID}?${query}` : `plugin://${pluginUUID}`;
  return `<object data="${target}" data-aspect-ratio="${aspectRatio}" />`;
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
 * @param updates {{page?: number, highlightId?: string}} merged over the embed's
 *   existing args - anything not passed here (notably `attachmentUUID`) is preserved.
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
  const mergedQuery = buildEmbedArgs({ ...current, attachmentUUID, ...updates });
  const newTarget = mergedQuery ? `plugin://${pluginUUID}?${mergedQuery}` : `plugin://${pluginUUID}`;

  const next = lines.slice();
  next[idx] = line.replace(dataMatch[0], `data="${newTarget}"`);
  return next.join("\n");
}
