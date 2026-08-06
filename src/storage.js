/**
 * Highlight persistence: a managed JSON section inside the note, keyed by attachment
 * uuid (spec section 7.4) so multiple PDFs on one note don't collide.
 *
 * Uses `replaceNoteContent`'s `{ section: { heading: { text } } }` option - verified
 * today against the live app and exercised for real by Plugin Builder's own sync - to
 * touch only the managed section and never the user's own note content. On first write
 * to a note, the section doesn't exist yet, so save() creates it via insertNoteContent
 * before replacing.
 */
import { STORAGE_SECTION_HEADING } from "./constants.js";
import { createHighlight } from "./highlights.js";

const FENCE_LANG = "json";

/**
 * Wrap the payload in a fenced code block so it round-trips through markdown untouched.
 *
 * Backticks are escaped to their JSON \u escape. This is not cosmetic: user note text is
 * stored inside this fence, and a note containing a triple backtick would close the
 * fence early. The reader's non-greedy match would then stop at that inner fence, parse
 * a truncated string, fail, and treat the whole section as corrupt - silently discarding
 * every highlight on the note. `JSON.parse` turns ` back into a backtick on the way
 * in, so nothing downstream needs to know this happened.
 */
function serialize(payload) {
  const json = JSON.stringify(payload, null, 0).replace(/`/g, "\\u0060");
  return "```" + FENCE_LANG + "\n" + json + "\n```";
}

/**
 * Pull the JSON payload out of the section's rendered content.
 * Amplenote may hand back the fenced block, the bare JSON, or (on a fresh section)
 * empty content - all three are handled rather than assumed.
 */
function deserialize(sectionContent) {
  if (!sectionContent) return null;
  const fenced = sectionContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const raw = (fenced ? fenced[1] : sectionContent).trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    // A hand-edited or corrupted section must not crash the plugin - treat as empty
    // and let the next save overwrite it, per spec section 7.4's idempotency requirement.
    return null;
  }
}

/**
 * Re-validate every stored highlight through createHighlight rather than trusting the
 * JSON blindly. A note a user hand-edited (or an older, differently-shaped payload)
 * must not crash the viewer - drop the bad entries and keep the good ones.
 */
function sanitizeHighlights(list) {
  if (!Array.isArray(list)) return [];
  const out = [];
  for (const h of list) {
    try {
      out.push(createHighlight(h));
    } catch {
      // skip malformed entry
    }
  }
  return out;
}

/**
 * @returns {Promise<object[]>} highlights for this attachment, [] if none stored yet.
 */
export async function loadHighlights(app, noteUUID, attachmentUUID) {
  const content = await app.getNoteContent({ uuid: noteUUID });
  const section = extractSection(content, STORAGE_SECTION_HEADING);
  const payload = deserialize(section);
  if (!payload || typeof payload !== "object") return [];
  return sanitizeHighlights(payload[attachmentUUID]);
}

/**
 * Persist highlights for one attachment, preserving any other attachments' highlights
 * already stored in the same section (spec section 7.4: keyed by attachment id, one
 * section shared across every PDF on the note).
 */
export async function saveHighlights(app, noteUUID, attachmentUUID, highlights) {
  const noteHandle = { uuid: noteUUID };
  const content = await app.getNoteContent(noteHandle);
  const section = extractSection(content, STORAGE_SECTION_HEADING);
  const existing = deserialize(section) || {};
  const payload = { ...existing, [attachmentUUID]: highlights };
  const body = serialize(payload);

  if (section === null) {
    // No managed section yet - create it, then the retry below fills it in. Two
    // round-trips only on the very first save for a note.
    await app.insertNoteContent(noteHandle, `\n\n# ${STORAGE_SECTION_HEADING}\n\n`, {
      atEnd: true,
    });
  }

  await app.replaceNoteContent(noteHandle, body, {
    section: { heading: { text: STORAGE_SECTION_HEADING, level: 1 } },
  });
}

/**
 * Find the content directly under a level-1 heading with this exact text, mirroring
 * the section-lookup semantics `replaceNoteContent`'s `section` option relies on -
 * needed here so load/save agree on what "the section" means without an extra API call.
 * Returns null if the heading doesn't exist in the note at all (as opposed to existing
 * and being empty, which returns "").
 */
function extractSection(noteContent, headingText) {
  if (!noteContent) return null;
  const lines = noteContent.split("\n");
  const headingRe = /^#\s+(.*)$/;
  const startIdx = lines.findIndex((l) => {
    const m = l.match(headingRe);
    return m && m[1].trim() === headingText;
  });
  if (startIdx === -1) return null;

  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^#\s+/.test(lines[i])) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx + 1, endIdx).join("\n").trim();
}
