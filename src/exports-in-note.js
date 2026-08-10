/**
 * Finding and editing the highlight blocks that "Send to note" has already written into
 * a note's body.
 *
 * WHY THIS CAN EXIST AT ALL: every exported block leads with a deep link carrying
 * `hl=<highlight id>` (see buildHighlightBlock in src/export.js), so a block is
 * addressable after the fact. Without that id in the markup there would be no way to tell
 * one block from another, and the only honest options would be "never touch what was
 * sent" or "rewrite the whole note".
 *
 * WHY IT IS NEEDED: a sent block used to be a dead snapshot. Recolouring a highlight left
 * its block in the old colour, deleting the highlight left the block behind pointing at an
 * id that no longer resolves, and sending the same highlight twice appended a second copy.
 * Reported live, with a screenshot of the same quote three times in two different colours.
 *
 * WHAT THIS DELIBERATELY WILL NOT DO: it never edits a line it cannot identify as this
 * plugin's own output. Every function locates a block by plugin uuid, attachment uuid AND
 * highlight id, and returns null when there is no match, so a caller cannot accidentally
 * rewrite the user's own prose. The note belongs to the user; only the blocks the plugin
 * wrote are its business.
 *
 * A block is a heading line followed by its quoted lines:
 *
 *   [<mark ...>PDF name<!-- {"backgroundCycleColor":"12"} --></mark>](plugin://...&hl=abc)
 *   > > the highlighted text
 *   >
 *   > the user's note, if any
 *
 * so it ends at the first line that is neither a blockquote line nor blank-inside-the-
 * quote. Plain functions over strings, no app object, so the whole thing is unit-testable.
 */

/** A blockquote line, i.e. part of the block's body rather than the note around it. */
function isQuoteLine(line) {
  return /^\s*>/.test(line);
}

/**
 * Locate one exported block's line range.
 *
 * The heading is matched on all three ids at once. `hl=` is checked with a boundary so
 * `hl=abc` cannot match `hl=abcdef` - highlight ids share a generated prefix, so a
 * substring test really would collide, and the failure would be silently editing the
 * wrong block.
 *
 * @returns {{start: number, end: number}|null} end is EXCLUSIVE.
 */
export function findExportBlock(lines, pluginUUID, attachmentUUID, highlightId) {
  if (!lines || !pluginUUID || !highlightId) return null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes(`](plugin://${pluginUUID}`)) continue;
    if (attachmentUUID && !line.includes(`att=${attachmentUUID}`)) continue;
    if (!new RegExp(`hl=${escapeRegExp(highlightId)}(?![\\w-])`).test(line)) continue;

    let end = i + 1;
    while (end < lines.length && isQuoteLine(lines[end])) end++;
    return { start: i, end };
  }
  return null;
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Every highlight id this note already holds a block for.
 *
 * Lets the viewer show a "remove from note" action ONLY on highlights that are actually
 * in the note - an action that silently does nothing on the others would be worse than no
 * action at all.
 */
export function listExportedHighlightIds(noteContent, pluginUUID, attachmentUUID) {
  if (!noteContent || !pluginUUID) return [];
  const ids = [];
  const lines = String(noteContent).split("\n");
  for (const line of lines) {
    if (!line.includes(`](plugin://${pluginUUID}`)) continue;
    if (attachmentUUID && !line.includes(`att=${attachmentUUID}`)) continue;
    const match = line.match(/[?&]hl=([^&)\s]+)/);
    if (match && ids.indexOf(match[1]) === -1) ids.push(match[1]);
  }
  return ids;
}

/**
 * Drop a block, and the blank line that separated it from its neighbour.
 *
 * The separator rule (see withExportSeparator in storage.js) puts a single `---` above
 * the FIRST block only. Removing the last remaining block therefore has to take that rule
 * with it, or the note keeps a horizontal rule dividing the user's writing from nothing.
 *
 * @returns {string|null} null when there is no such block - the caller's cue that there
 *   was nothing to remove, which is not the same as a failed removal.
 */
export function removeExportBlock(noteContent, pluginUUID, attachmentUUID, highlightId) {
  const lines = String(noteContent || "").split("\n");
  const at = findExportBlock(lines, pluginUUID, attachmentUUID, highlightId);
  if (!at) return null;

  let { start, end } = at;
  // Take one trailing blank line with the block, so removals do not pile up gaps.
  if (end < lines.length && lines[end].trim() === "") end++;

  const next = lines.slice(0, start).concat(lines.slice(end));
  const remaining = listExportedHighlightIds(next.join("\n"), pluginUUID, attachmentUUID);
  return remaining.length ? next.join("\n") : dropTrailingSeparator(next).join("\n");
}

/**
 * Remove the `---` that introduced the export section, once nothing follows it.
 *
 * Scans from the end for the last rule with no exported block after it. Anything else the
 * user wrote is left exactly where it is, including their own horizontal rules earlier in
 * the note - only a trailing one is a candidate.
 */
function dropTrailingSeparator(lines) {
  for (let i = lines.length - 1; i >= 0; i--) {
    const text = lines[i].trim();
    if (text === "") continue;
    if (text === "---") {
      const next = lines.slice(0, i).concat(lines.slice(i + 1));
      // Collapse the blank line the rule was sitting on, so nothing accumulates.
      while (next.length && next[next.length - 1].trim() === "") next.pop();
      return next;
    }
    return lines;
  }
  return lines;
}

/**
 * Swap a block's contents for a freshly built one, in place.
 *
 * Used both by re-sending a highlight (so it refreshes rather than appending a duplicate)
 * and by recolouring one. In place matters: the user may have moved the block, or written
 * around it, and an update that removed and re-appended it would quietly relocate their
 * note's structure to the bottom.
 *
 * @returns {string|null} null when the note holds no block for this highlight.
 */
export function replaceExportBlock(noteContent, pluginUUID, attachmentUUID, highlightId, markdown) {
  const lines = String(noteContent || "").split("\n");
  const at = findExportBlock(lines, pluginUUID, attachmentUUID, highlightId);
  if (!at) return null;

  return lines
    .slice(0, at.start)
    .concat(String(markdown).split("\n"), lines.slice(at.end))
    .join("\n");
}
