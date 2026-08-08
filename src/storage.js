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
// A one-line, visible label above the fence, so the section reads as "plugin-managed
// data" at a glance instead of an unexplained code block. Plain text, no JSON inside it,
// so it carries none of the corruption risk described on serialize().
const SECTION_INTRO =
  "*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";

/**
 * Wrap the payload in a fenced code block so it round-trips through Amplenote's editor
 * byte-for-byte.
 *
 * An HTML-comment wrapper was tried instead of the fence, to stop this rendering as a
 * wall of raw JSON in the note - it relied on the same trick src/export.js uses to hide
 * a cycle-color marker inside a highlight span. Confirmed live NOT to generalize:
 * outside that specific span context Amplenote does not strip the comment at all - it
 * rendered as plain visible text, "<!--" and all, arguably worse-looking than a code
 * block. Worse, moving the JSON out of a code fence into ordinary paragraph content is
 * suspected of exposing it to Amplenote's rich-text normalization - the kind of
 * reformatting that only touches "normal" text, never a code block's contents - and is
 * the likely cause of a real bug where recoloring or adding a note made an existing
 * highlight disappear, i.e. silently corrupted JSON by the next time it was read. A code
 * fence is the one construct several editors (Amplenote's own Plugin Builder code block
 * included, per docs/api-notes.md) treat as verbatim, so it stays the only trusted
 * format for this payload.
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
  return `${SECTION_INTRO}\n\`\`\`${FENCE_LANG}\n${json}\n\`\`\``;
}

/**
 * Pull the JSON payload out of the section's rendered content.
 *
 * Tries the fenced-code-block format first (current, and the only format proven safe
 * against Amplenote's editor - see serialize()). Falls back to the short-lived
 * hidden-comment format, in case a note was saved by that version and its JSON is still
 * intact, so it isn't lost outright - the very next save rewrites it in the fenced
 * format. Bare JSON with no wrapper at all (a fresh, empty section) is handled too.
 */
function deserialize(sectionContent) {
  if (!sectionContent) return null;

  const fenced = sectionContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const hidden = !fenced && sectionContent.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/);
  const raw = (fenced ? fenced[1] : hidden ? hidden[1] : sectionContent).trim();
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
 * Drop one attachment's entry entirely, rather than saving it as `[]`. Used when a
 * viewer is explicitly detached (see embed-call.js's `removeViewer` action) - an
 * attachment that no longer exists shouldn't leave even an empty placeholder behind in
 * the managed section forever.
 *
 * A no-op (not an error) if there's no section yet or this attachment has no entry in
 * it - removal is idempotent, same as saveHighlights.
 */
export async function deleteHighlights(app, noteUUID, attachmentUUID) {
  const noteHandle = { uuid: noteUUID };
  const content = await app.getNoteContent(noteHandle);
  const section = extractSection(content, STORAGE_SECTION_HEADING);
  if (section === null) return;

  const existing = deserialize(section) || {};
  if (!(attachmentUUID in existing)) return;

  const rest = { ...existing };
  delete rest[attachmentUUID];

  await app.replaceNoteContent(noteHandle, serialize(rest), {
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
