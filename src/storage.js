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
 * Reserved payload key holding `{ [attachmentUUID]: exportNoteUUID }` - where each PDF's
 * "Export all" went, so the destination is identified by uuid rather than by a name that
 * either side can rename (see loadExportNoteUUID for the failures that motivated it).
 *
 * A reserved key in the existing payload rather than a second managed section: one
 * managed region per note is already the design (spec section 7.4), and this key cannot
 * collide with an attachment uuid.
 */
const EXPORT_NOTES_KEY = "__exportNotes";
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
 * Read the managed payload, apply one change, write it back.
 *
 * Every write to the section goes through here so the section-creation and rescue steps
 * below exist exactly once - they were duplicated across save and delete, which is one
 * copy too many for logic whose failure mode is destroying a user's note.
 *
 * @param mutate receives the current payload (`{}` when there is no section yet) and
 *   returns the payload to store, or `null` for "nothing to do" - which writes nothing
 *   at all, not even the heading, so a no-op delete cannot be what adds a managed
 *   section to a note that never had one.
 */
async function mutatePayload(app, noteUUID, mutate) {
  const noteHandle = { uuid: noteUUID };
  const content = await app.getNoteContent(noteHandle);
  const section = extractSection(content, STORAGE_SECTION_HEADING);
  const existing = deserialize(section) || {};

  const payload = mutate(existing);
  if (payload === null) return;
  const body = serialize(payload);

  if (section === null) {
    // No managed section yet - create it, then the retry below fills it in. Two
    // round-trips only on the very first save for a note.
    await app.insertNoteContent(noteHandle, `\n\n# ${STORAGE_SECTION_HEADING}\n\n`, {
      atEnd: true,
    });
  }

  // A note with TWO managed sections cannot be written safely by section at all: reads
  // take the one that parses and the app's write takes whichever it takes, so the two can
  // point at different places and the highlights go somewhere no load will look. Collapse
  // to one section, by whole-note write, before anything else can depend on which is
  // which. Reported live - see collapseManagedSections.
  const collapsed = collapseManagedSections(content, body);
  if (collapsed !== null) {
    await app.replaceNoteContent(noteHandle, collapsed);
    return;
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
 * Persist highlights for one attachment, preserving any other attachments' highlights
 * already stored in the same section (spec section 7.4: keyed by attachment id, one
 * section shared across every PDF on the note).
 */
export async function saveHighlights(app, noteUUID, attachmentUUID, highlights) {
  await mutatePayload(app, noteUUID, (payload) => ({ ...payload, [attachmentUUID]: highlights }));
}

/**
 * Drop one attachment's entry entirely, rather than saving it as `[]`. Used when a
 * viewer is explicitly detached (see embed-call.js's `removeViewer` action) - an
 * attachment that no longer exists shouldn't leave even an empty placeholder behind in
 * the managed section forever.
 *
 * Takes the export-note pointer with it, for the same reason: a detached viewer has no
 * destination note to remember.
 *
 * A no-op (not an error) if there's no section yet or this attachment has no entry in
 * it - removal is idempotent, same as saveHighlights.
 */
export async function deleteHighlights(app, noteUUID, attachmentUUID) {
  await mutatePayload(app, noteUUID, (payload) => {
    const pointers = payload[EXPORT_NOTES_KEY];
    const hasPointer = pointers && typeof pointers === "object" && attachmentUUID in pointers;
    if (!(attachmentUUID in payload) && !hasPointer) return null;

    const rest = { ...payload };
    delete rest[attachmentUUID];
    if (hasPointer) {
      const restPointers = { ...pointers };
      delete restPointers[attachmentUUID];
      if (Object.keys(restPointers).length) rest[EXPORT_NOTES_KEY] = restPointers;
      else delete rest[EXPORT_NOTES_KEY];
    }
    return rest;
  });
}

/**
 * WHICH NOTE this attachment's "Export all" writes to, remembered by uuid.
 *
 * The destination used to be identified purely by its NAME, recomputed from the PDF's
 * filename on every export and looked up with a vault-wide `findNote({ name })`. A name
 * is not an identity, and three ordinary things broke it, all silently:
 *
 *   - the user renames the destination note -> the next export doesn't find it, creates a
 *     second one, and the renamed note is left holding stale highlights forever
 *   - the user renames the PDF -> same orphan, from the other direction
 *   - two PDFs anywhere in the vault share a filename -> both exports resolve to one note
 *
 * A recorded uuid survives all three. The name lookup stays as the FALLBACK, which is
 * also the migration path: a note exported before this existed has no pointer, gets found
 * by name exactly as it used to be, and is recorded on the way past.
 *
 * @returns {Promise<string|null>} the recorded destination note uuid, or null.
 */
export async function loadExportNoteUUID(app, noteUUID, attachmentUUID) {
  const content = await app.getNoteContent({ uuid: noteUUID });
  const payload = deserialize(extractSection(content, STORAGE_SECTION_HEADING));
  if (!payload || typeof payload !== "object") return null;
  const pointers = payload[EXPORT_NOTES_KEY];
  if (!pointers || typeof pointers !== "object") return null;
  const recorded = pointers[attachmentUUID];
  return typeof recorded === "string" && recorded ? recorded : null;
}

/** Remember where this attachment's export went. Idempotent - an unchanged pointer
 * writes nothing, so a re-export doesn't rewrite the source note for no reason. */
export async function saveExportNoteUUID(app, noteUUID, attachmentUUID, exportNoteUUID) {
  await mutatePayload(app, noteUUID, (payload) => {
    const pointers = payload[EXPORT_NOTES_KEY];
    const current = pointers && typeof pointers === "object" ? pointers : {};
    if (current[attachmentUUID] === exportNoteUUID) return null;
    return { ...payload, [EXPORT_NOTES_KEY]: { ...current, [attachmentUUID]: exportNoteUUID } };
  });
}

/**
 * Replace everything under one level-1 heading in a note, creating that heading at the
 * end if the note doesn't have it yet.
 *
 * The generic form of what saveHighlights does to the managed data section, lives here
 * because the section-locating machinery does (extractSection, and the `{ section: ... }`
 * shape `replaceNoteContent` wants). Copying either into another module is how the two
 * would end up disagreeing about where a section starts and stops.
 *
 * Written for the "export all" destination note, whose whole point is that the export is
 * a REGION of the note and not the note itself - see EXPORT_SECTION_HEADING. Deliberately
 * NOT wired through liftStrayContentAboveSection: that rescue path exists because the
 * managed data section is a JSON payload where anything else is by definition strays, and
 * a section of ordinary prose has no equivalent notion of foreign content.
 *
 * The blank line before the heading is skipped on an empty note, so a freshly created
 * destination doesn't open with a leading gap.
 */
export async function writeSection(app, noteUUID, headingText, body) {
  const noteHandle = { uuid: noteUUID };
  const content = await app.getNoteContent(noteHandle);

  if (extractSection(content, headingText) === null) {
    const lead = content && content.trim() ? "\n\n" : "";
    await app.insertNoteContent(noteHandle, `${lead}# ${headingText}\n\n`, { atEnd: true });
  }

  await app.replaceNoteContent(noteHandle, body, {
    section: { heading: { text: headingText, level: 1 } },
  });
}

/**
 * EVERY level-1 heading with this text, each as { start, end }, mirroring the section
 * semantics `replaceNoteContent`'s `section` option relies on.
 *
 * Plural because a note CAN end up with two of them - confirmed live, from a note whose
 * highlights kept disappearing (see locateSection and collapseManagedSections).
 */
function locateSections(lines, headingText) {
  const headingRe = /^#\s+(.*)$/;
  const found = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headingRe);
    if (!m || m[1].trim() !== headingText) continue;
    if (found.length) found[found.length - 1].end = i;
    found.push({ start: i, end: lines.length });
  }
  // Each section ends at the next heading of ANY name, not just a repeat of this one.
  for (const at of found) {
    for (let i = at.start + 1; i < at.end; i++) {
      if (/^#\s+/.test(lines[i])) {
        at.end = i;
        break;
      }
    }
  }
  return found;
}

/**
 * THE managed section - the one holding the payload, when a note has more than one
 * heading by this name. Returns null if the heading isn't in the note at all.
 *
 * A note really can grow a second `# PDF Annotator data` heading: reported live from a
 * note where every new highlight replaced the previous one. The note held two, the first
 * carrying the JSON and the second empty. Reads came from the first (this function, first
 * match) while the app's own section-scoped WRITE went elsewhere, so every save landed in
 * the empty one and every load returned the same stale payload - which reads on screen as
 * "the last highlight I made just disappeared".
 *
 * Preferring the section that PARSES makes the read side immune to which of the two the
 * app picks. It is not the whole fix - a write still has to be aimed at one of them, which
 * is what collapseManagedSections is for - but it is what stops a duplicate heading from
 * silently emptying a note's highlights on the very next save.
 */
function locateSection(lines, headingText) {
  const all = locateSections(lines, headingText);
  if (!all.length) return null;
  const withPayload = all.find((at) => deserialize(lines.slice(at.start + 1, at.end).join("\n").trim()));
  return withPayload || all[0];
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
/**
 * Collapse a note that has grown MORE THAN ONE managed section back to a single one.
 *
 * Returns null - the normal case - when the note has zero or one, so the caller keeps
 * using the cheap section-scoped write.
 *
 * WHY THIS IS NEEDED AT ALL. Reported live: a note with two `# PDF Annotator data`
 * headings, the first holding the JSON and the second empty, where every new highlight
 * appeared to delete the previous one. Reads take the section that parses (locateSection);
 * the app's own section-scoped write took the other. With reads and writes pointed at
 * different sections, every save landed somewhere no load would ever look, so the viewer
 * kept being handed the same stale list - and each save wrote that stale list plus one.
 *
 * Aiming the write more cleverly is not the fix, because which section
 * `replaceNoteContent({ section })` picks is the app's decision, not ours. Removing the
 * ambiguity is: one heading, and the question cannot be asked again.
 *
 * Everything that is not this plugin's own intro-and-fence is treated as the user's and
 * lifted out above the surviving section, same as liftStrayContentAboveSection does for a
 * single one. The surviving section goes LAST, which is where the design keeps it
 * (insertAboveManagedSection depends on that).
 */
export function collapseManagedSections(noteContent, serializedBody) {
  const lines = (noteContent || "").split("\n");
  const all = locateSections(lines, STORAGE_SECTION_HEADING);
  if (all.length < 2) return null;

  const inSection = (i) => all.some((at) => i >= at.start && i < at.end);
  const kept = lines.filter((_, i) => !inSection(i)).join("\n").replace(/\s+$/, "");
  const strays = all
    .map((at) => extractStray(lines.slice(at.start + 1, at.end).join("\n").trim()))
    .filter(Boolean)
    .join("\n\n");

  const above = [kept, strays].filter(Boolean).join("\n\n");
  return (
    `${above ? above + "\n\n" : ""}# ${STORAGE_SECTION_HEADING}\n\n${serializedBody}`
  );
}

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
