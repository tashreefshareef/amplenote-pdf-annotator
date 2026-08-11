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

  // Rescue path, taken only when the section is holding content this plugin did not put
  // there. The section-scoped write below replaces everything under the heading, so
  // anything trapped in there would be destroyed - which is precisely the reported bug,
  // where creating one highlight erased every previously exported highlight. Lifting it
  // out first turns that save into the thing that REPAIRS the note.
  const repaired = liftStrayContentAboveSection(content, body);
  if (repaired !== null) {
    await app.replaceNoteContent(noteHandle, repaired);
    return;
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
 * Locate the managed section's heading line and the line after its last, mirroring the
 * section semantics `replaceNoteContent`'s `section` option relies on. Returns null if
 * the heading isn't in the note at all.
 */
function locateSection(lines, headingText) {
  const headingRe = /^#\s+(.*)$/;
  const start = lines.findIndex((l) => {
    const m = l.match(headingRe);
    return m && m[1].trim() === headingText;
  });
  if (start === -1) return null;

  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^#\s+/.test(lines[i])) {
      end = i;
      break;
    }
  }
  return { start, end };
}

/**
 * Find the content directly under a level-1 heading with this exact text - needed here
 * so load/save agree on what "the section" means without an extra API call. Returns null
 * if the heading doesn't exist in the note at all (as opposed to existing and being
 * empty, which returns "").
 */
function extractSection(noteContent, headingText) {
  if (!noteContent) return null;
  const lines = noteContent.split("\n");
  const at = locateSection(lines, headingText);
  if (!at) return null;
  return lines.slice(at.start + 1, at.end).join("\n").trim();
}

/**
 * Whatever is inside the managed section that this plugin did NOT put there.
 *
 * The section is supposed to hold exactly the intro line and the fenced payload. Anything
 * else got in by being appended to the END of the note while this section was the last
 * heading in it - which is exactly what "Send to note" used to do, silently filing every
 * exported highlight inside the one region that gets wholesale replaced on the next save.
 */
function extractStray(sectionContent) {
  if (!sectionContent) return "";
  let rest = sectionContent;
  const fenced = rest.match(/```(?:json)?\s*\n?[\s\S]*?\n?```/);
  if (fenced) rest = rest.replace(fenced[0], "");
  // The short-lived hidden-comment format, in case an old note is being repaired.
  rest = rest.replace(/<!--\s*PDFA-DATA[\s\S]*?-->/, "");
  rest = rest.replace(SECTION_INTRO, "");
  return rest.trim();
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Does this note already hold an exported block from THIS plugin?
 *
 * Two conditions, both needed. The markdown LINK form (`](plugin://`) is what an export
 * block's heading is; the viewer's own embed tag uses the same scheme as
 * `<object data="plugin://...">`, so a note holding only a viewer still counts as having
 * no exports. And `hl=`, which every exported deep link carries (buildDeepLink in
 * export.js) and nothing else does - a plain link to this plugin, or to any OTHER
 * plugin, is not an export block and must not be mistaken for one.
 *
 * The uuid scoping matters because the consequence of a false positive is silent: the
 * separator is simply never added again, for the life of that note.
 */
function hasExportedBlock(noteContent, pluginUUID) {
  if (!pluginUUID) return noteContent.includes("](plugin://");
  return new RegExp("\\]\\(plugin://" + escapeRegExp(pluginUUID) + "[^)]*[?&]hl=").test(noteContent);
}

/**
 * Is whatever the block is about to be appended after already a boundary?
 *
 * Looks at the region above the managed section - which is pinned last, so it is never
 * the thing a rule would be separating - and asks what the last real line in it is. A
 * `---` there means the note already ends with a rule (the user's own, typically at the
 * end of a piece of writing), and adding ours would stack two rules with a gap between
 * them. Nothing there at all means there is nothing to separate from, and a rule at the
 * top of an otherwise empty note divides nothing.
 */
function alreadySeparated(noteContent) {
  const lines = noteContent.split("\n");
  let limit = lines.findIndex((line) => line.trim() === `# ${STORAGE_SECTION_HEADING}`);
  if (limit === -1) limit = lines.length;
  for (let i = limit - 1; i >= 0; i--) {
    const text = lines[i].trim();
    if (text === "") continue;
    return text === "---";
  }
  return true;
}

/**
 * Prefix a horizontal rule when this is the FIRST highlight sent to a note, so the
 * appended blocks are visibly separated from whatever the user wrote above them.
 *
 * Only the first: later sends land next to their own siblings, where a rule per block
 * would just be repetition.
 *
 * Deliberately not a heading: the separator has to sit in the user's own note body,
 * which may already have its own structure, and a rule imposes nothing on it.
 *
 * @param pluginUUID scopes "is there already an export here?" to this plugin's own
 *   blocks. Optional only so a caller without one degrades to the older, looser test
 *   rather than losing the separator entirely.
 */
export function withExportSeparator(noteContent, markdown, pluginUUID) {
  const content = String(noteContent || "");
  if (hasExportedBlock(content, pluginUUID)) return markdown;
  if (alreadySeparated(content)) return markdown;
  return `---\n\n${markdown}`;
}

/**
 * Put `markdown` immediately ABOVE the managed section, keeping that section last.
 *
 * Returns null when the note has no managed section yet, so the caller can use the
 * cheaper `insertNoteContent(atEnd)` - with no section present, the end of the note is
 * already the right place and there is nothing to write around.
 */
export function insertAboveManagedSection(noteContent, markdown) {
  const lines = (noteContent || "").split("\n");
  const at = locateSection(lines, STORAGE_SECTION_HEADING);
  if (!at) return null;

  const before = lines.slice(0, at.start).join("\n").replace(/\s+$/, "");
  const rest = lines.slice(at.start).join("\n");
  return `${before ? before + "\n\n" : ""}${markdown}\n\n${rest}`;
}

/**
 * Repair a note whose managed section has swallowed the user's own content.
 *
 * Lifts that content back out, to just above the heading where it should have gone, and
 * writes the fresh payload into the now-clean section. Returns null when there is nothing
 * trapped - the overwhelming majority of saves - so the caller keeps using the cheap
 * section-scoped write instead of rewriting the whole note on every highlight.
 *
 * This exists because the bug destroyed data that was already written: fixing the writer
 * stops new exports being filed in the wrong place, but every export a user had already
 * sent is still sitting in the blast radius, waiting for their next highlight.
 */
export function liftStrayContentAboveSection(noteContent, serializedBody) {
  const lines = (noteContent || "").split("\n");
  const at = locateSection(lines, STORAGE_SECTION_HEADING);
  if (!at) return null;

  const stray = extractStray(lines.slice(at.start + 1, at.end).join("\n").trim());
  if (!stray) return null;

  const before = lines.slice(0, at.start).join("\n").replace(/\s+$/, "");
  const after = lines.slice(at.end).join("\n").replace(/^\s+/, "");
  return (
    `${before ? before + "\n\n" : ""}${stray}\n\n` +
    `${lines[at.start]}\n\n${serializedBody}` +
    `${after ? "\n\n" + after : ""}`
  );
}
