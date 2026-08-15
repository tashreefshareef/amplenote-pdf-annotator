/**
 * TEMPORARY DIAGNOSTIC - delete once the question below is answered.
 *
 * Question: how does a PDF attachment chip appear in a note's markdown?
 *
 * It has to appear SOMEHOW. Amplenote renders the chip at a specific point in the note
 * body (it's an expandable native PDF viewer, not a footer), and markdown is the note's
 * internal representation - so a token for it must sit at that position in the content.
 * But it is documented nowhere: the plugin markdown reference covers colored text,
 * footnotes, tables, line breaks, collapsible headings and tasks, and says nothing about
 * attachments. The app-interface doc only hints at it, noting that `getNoteAttachments`
 * returns "only attachments that are currently referenced in the note".
 *
 * If that token is locatable, "Annotate PDF" can insert the viewer directly beneath its
 * own chip instead of appending to the bottom of the note.
 *
 * Reads the note and writes the result to a SEPARATE new note - never modifies the note
 * being inspected, since the whole point is to see its content unaltered.
 */

/** Anything shorter than this in the dump is a truncation bug, not a short note. */
export const DUMP_HEADING = "Raw markdown";

/**
 * A fence long enough to survive whatever is inside the content.
 *
 * Stored highlight JSON already lives in a ``` block (docs/api-notes.md: machine-readable
 * data must stay fenced), so a 3-backtick wrapper would be closed early by the note's own
 * fence and the rest would leak out as prose - where the editor is free to reformat it,
 * which is exactly the corruption this dump exists to avoid.
 */
export function fenceFor(content) {
  const longest = (String(content || "").match(/`+/g) || []).reduce(
    (max, run) => Math.max(max, run.length),
    0
  );
  return "`".repeat(Math.max(3, longest + 1));
}

/** Heading for the section dump - the second question this action now answers. */
export const SECTIONS_HEADING = "Sections (getNoteSections)";

/**
 * The raw `getNoteSections` output, verbatim.
 *
 * ADDED FOR A LIVE BUG: `linkTarget` navigates to a section anchor so the mobile app
 * scrolls the note to the PDF (src/actions/link-target.js), and a deep link was landing at
 * the bottom of the note instead - the signature of an anchor that names no section. The
 * anchor format is documented only as "spaces are replaced with underscores, along with
 * some other URL-safety transformations", and the section object's own shape is not
 * documented at all, so the only way to stop guessing is to read what the live app
 * actually returns. Dumped as JSON rather than summarized, because the unknown here is
 * precisely which fields exist and what an anchor really looks like.
 */
async function dumpSections(app, noteUUID) {
  if (typeof app.getNoteSections !== "function") {
    return "(this build of Amplenote has no app.getNoteSections)";
  }
  try {
    return JSON.stringify(await app.getNoteSections({ uuid: noteUUID }), null, 2);
  } catch (error) {
    // A dump that half-works still answers the markdown question, which is the other
    // half of this note - so report the failure inline rather than throwing it away.
    return `(getNoteSections threw: ${(error && error.message) || error})`;
  }
}

/**
 * @param {object} app      Amplenote app interface
 * @param {string} noteUUID Note to inspect
 * @returns {Promise<string|null>} uuid of the created dump note, or null if it failed
 */
export async function dumpMarkdown(app, noteUUID) {
  const content = await app.getNoteContent({ uuid: noteUUID });

  if (typeof content !== "string" || content === "") {
    await app.alert("That note came back empty - nothing to dump.");
    return null;
  }

  const attachments = await app.getNoteAttachments({ uuid: noteUUID });
  const list = (Array.isArray(attachments) ? attachments : [])
    .map((a) => `- ${a && a.name} | ${a && a.type} | ${a && a.uuid}`)
    .join("\n");

  const fence = fenceFor(content);
  const dumpUUID = await app.createNote("PDF Annotator debug - note markdown");

  await app.insertNoteContent(
    { uuid: dumpUUID },
    `# Attachments\n\n${list || "- (none)"}\n\n` +
      `# ${SECTIONS_HEADING}\n\n${fence}\n${await dumpSections(app, noteUUID)}\n${fence}\n\n` +
      `# ${DUMP_HEADING}\n\n${fence}\n${content}\n${fence}\n`,
    { atEnd: true }
  );

  await app.alert(
    'Wrote the note\'s raw markdown to a new note: "PDF Annotator debug - note markdown".\n\n' +
      "Open it and look for how the PDF attachment is referenced."
  );

  return dumpUUID;
}
