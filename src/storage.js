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

// A one-line, visible label so the heading doesn't read as an empty/broken section once
// the payload itself is hidden below it - see the comment on serialize().
const SECTION_INTRO =
  "*Managed automatically by the PDF Annotator plugin - safe to ignore, don't edit.*";
const COMMENT_OPEN = "<!-- PDFA-DATA";
const COMMENT_CLOSE = "-->";
// Matches one complete JSON string token (key or value), escapes included, so the
// hyphen-escaping in serialize() can be scoped to string content only. Never applied to
// the surrounding JSON syntax, which is where a bare "-" legitimately means a negative
// number (PDF-space coordinates can be negative).
const JSON_STRING_TOKEN = /"(?:[^"\\]|\\.)*"/g;

/**
 * Wrap the payload in an HTML comment instead of a visible fenced code block, so it
 * doesn't render as a wall of raw JSON in the middle of the user's note. Amplenote
 * strips HTML comments from rendered output - already relied on for the exact same
 * behaviour in src/export.js's cycle-color trick (`==text<!-- {...} -->==`), confirmed
 * there against the live app. Worth the same live sanity check here, since this is a new
 * placement for the same trick (directly under a heading, not nested in a `==...==`
 * span) - not yet separately confirmed.
 *
 * Every hyphen inside a JSON STRING is escaped to its \u002d form first - scoped via
 * JSON_STRING_TOKEN so JSON's own negative-number syntax is never touched. This is the
 * same hazard, and the same fix, as the backtick-in-a-fenced-block bug this format
 * replaces (docs/bugs-found.md): user note text is stored inside this wrapper, and a
 * note containing "-->" would close the comment early, corrupting every highlight on the
 * note, not just the one with the awkward note. `JSON.parse` turns \u002d back into a
 * literal "-" automatically, so nothing downstream needs to know this happened.
 */
function serialize(payload) {
  const json = JSON.stringify(payload).replace(JSON_STRING_TOKEN, (token) =>
    token.replace(/-/g, "\\u002d")
  );
  return `${SECTION_INTRO}\n${COMMENT_OPEN}\n${json}\n${COMMENT_CLOSE}`;
}

/**
 * Pull the JSON payload out of the section's rendered content.
 *
 * Tries the hidden-comment format first (current). Falls back to the older visible
 * fenced-code-block format - everything this plugin ever saved before the hidden format
 * existed - so a note saved by an earlier version keeps loading correctly; the very next
 * save upgrades it to the hidden format automatically. Bare JSON with neither wrapper
 * (a fresh, empty section) is handled too, same as before.
 */
function deserialize(sectionContent) {
  if (!sectionContent) return null;

  const hidden = sectionContent.match(/<!--\s*PDFA-DATA\s*\n?([\s\S]*?)-->/);
  const fenced = !hidden && sectionContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  const raw = (hidden ? hidden[1] : fenced ? fenced[1] : sectionContent).trim();
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
