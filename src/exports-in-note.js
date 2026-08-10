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
 * quote. Plain functions over strings apart from one constant, so it stays unit-testable.
 */
import { STORAGE_SECTION_HEADING } from "./constants.js";

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
    // ONE blank line between the heading and its quote is tolerated, because Amplenote
    // does not store the block the way it was written: the builder emits the heading and
    // the quote on consecutive lines, and the note comes back with a blank between them.
    // Without this the block ended at the heading, so "Remove" deleted the link and left
    // the quoted text sitting in the note under nothing. Reported live, with before and
    // after screenshots.
    //
    // Exactly one, and only when a quote line actually follows. Skipping blanks freely
    // would let the scan run on into a blockquote the USER wrote below the block, and
    // this function deletes what it returns - the cost of over-reaching here is somebody
    // else's writing, so it stays as tight as the observed formatting allows.
    if (end < lines.length && lines[end].trim() === "" && end + 1 < lines.length && isQuoteLine(lines[end + 1])) {
      end++;
    }
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
 * Remove the `---` that introduced the export section, once it introduces nothing.
 *
 * "Nothing" cannot mean "nothing to the end of the note", which is what an earlier version
 * checked: the managed data section is pinned LAST (see storage.js), so in any note this
 * plugin has written to, the final lines are that section and the rule is never the last
 * thing. The separator would have survived every removal and left a rule dividing the
 * user's writing from empty space.
 *
 * So the region examined runs from the rule to the managed heading, or to the end of the
 * note when there is none. Only a rule with nothing but blank lines ahead of it in that
 * region is a candidate, which is what keeps a horizontal rule the USER wrote earlier in
 * their note - with their own text after it - out of scope.
 */
function dropTrailingSeparator(lines) {
  let limit = lines.findIndex((line) => line.trim() === `# ${STORAGE_SECTION_HEADING}`);
  if (limit === -1) limit = lines.length;

  for (let i = limit - 1; i >= 0; i--) {
    const text = lines[i].trim();
    if (text === "") continue;
    if (text !== "---") return lines;

    const next = lines.slice(0, i).concat(lines.slice(i + 1));
    // Collapse the blank lines the rule was sitting between, so repeated send/remove
    // cycles do not leave a growing gap where the export section used to be.
    let at = i;
    while (at < next.length && next[at].trim() === "" && (at === 0 || next[at - 1].trim() === "")) {
      next.splice(at, 1);
    }
    return next;
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
