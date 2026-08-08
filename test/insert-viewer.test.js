/**
 * Tests for the `insertText` action - the cursor-positioned counterpart to "Annotate PDF".
 *
 * Note-modifying, so covered per the bounty T&C (spec §5.2). The contract under test is
 * unusual and worth pinning explicitly: this action does NOT call insertNoteContent at
 * all. Amplenote substitutes the RETURN VALUE for the `{expression}` the user typed, so
 * the return string is the whole write, and every path must return a string.
 */
import { insertViewer } from "../src/actions/insert-viewer.js";
import { PDF_MIME } from "../src/attachments.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const PLUGIN = "plug-uuid";
const pdf = (name, uuid) => mockAttachment({ name, uuid, type: PDF_MIME });

const appWith = (attachments, content = "", promptQueue = []) =>
  createMockApp({
    notes: [{ uuid: "note-1", name: "Research", content, attachments }],
    promptQueue,
  });

describe("insertViewer", () => {
  // Scenario: the happy path — the user typed the expression mid-note, so the markup
  // comes back as the substitution rather than being appended anywhere.
  test("returns embed markup for the chosen PDF instead of appending it", async () => {
    const app = appWith([pdf("paper.pdf", "att-1")], "# Research\nMy notes.");

    const result = await insertViewer(app, "note-1", PLUGIN);

    expect(result).toContain(`<object data="plugin://${PLUGIN}?att=att-1"`);
    // The whole point of this action: it must never write to the note itself, or the
    // viewer would land at the end AND at the cursor.
    expect(app.insertNoteContent).not.toHaveBeenCalled();
    expect(app._notes.get("note-1").content).toBe("# Research\nMy notes.");
  });

  // Scenario: the tag has to be its own block. Returned inline, it would sit inside the
  // paragraph the user was typing in.
  test("wraps the tag in newlines so it lands as its own block", async () => {
    const result = await insertViewer(appWith([pdf("a.pdf", "att-1")]), "note-1", PLUGIN);

    expect(result.startsWith("\n")).toBe(true);
    expect(result.endsWith("\n")).toBe(true);
  });

  // Scenario: expression typed in a note with no PDF attached. Explain the fix, and
  // clear the expression rather than leaving `{PDF Annotator}` sitting in the text.
  test("explains what to do and returns an empty string when the note has no PDFs", async () => {
    const app = appWith([mockAttachment({ type: "image/png", uuid: "i1" })]);

    expect(await insertViewer(app, "note-1", PLUGIN)).toBe("");
    expect(app._calls.alerts[0]).toMatch(/No PDF attachments/i);
  });

  // Scenario: user opens the picker and backs out. The expression must still be cleared,
  // but a deliberate cancel doesn't deserve an alert.
  test("clears the expression quietly when the user cancels the picker", async () => {
    const app = appWith([pdf("a.pdf", "u1"), pdf("b.pdf", "u2")], "", []);

    expect(await insertViewer(app, "note-1", PLUGIN)).toBe("");
    expect(app._calls.alerts).toHaveLength(0);
  });

  // Scenario: a viewer for this PDF already exists further up the note. Two viewers on
  // one PDF would compete over the same stored highlights.
  test("refuses to add a second viewer for a PDF that already has one", async () => {
    const existing = `<object data="plugin://${PLUGIN}?att=att-1" data-aspect-ratio="1.2" />`;
    const app = appWith([pdf("paper.pdf", "att-1")], `notes\n${existing}`);

    expect(await insertViewer(app, "note-1", PLUGIN)).toBe("");
    expect(app._calls.alerts[0]).toMatch(/already has a viewer/i);
  });

  // Scenario: the multi-PDF case this action exists for — a note with two PDFs, one
  // already embedded, and the user placing the second one somewhere specific.
  test("still returns markup for a different PDF in the same note", async () => {
    const existing = `<object data="plugin://${PLUGIN}?att=att-1" data-aspect-ratio="1.2" />`;
    const app = appWith([pdf("a.pdf", "att-1"), pdf("b.pdf", "att-2")], existing, ["att-2"]);

    expect(await insertViewer(app, "note-1", PLUGIN)).toContain("att=att-2");
  });

  // Scenario: `app.context.noteUUID` came back empty. Returning a non-string here would
  // leave undefined behaviour around the user's typed expression.
  test("returns an empty string rather than throwing without a note uuid", async () => {
    expect(await insertViewer(appWith([pdf("a.pdf", "att-1")]), null, PLUGIN)).toBe("");
  });
});
