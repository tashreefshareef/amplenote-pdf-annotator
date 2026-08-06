/**
 * Tests for the mock `app` itself.
 *
 * Testing test infrastructure is usually a smell, but this mock carries real logic —
 * notably section-scoped content replacement — that Phase 2's persistence tests will
 * depend on. If the mock's section handling is wrong, every persistence test built on
 * it is green and meaningless. These pin the behaviors that were verified against the
 * real API on 2026-08-06 (see docs/api-notes.md).
 */
import { createMockApp, mockAttachment } from "./helpers.js";

const noteWith = (content) => ({ uuid: "note-1", name: "Research", content });

describe("mock app fidelity", () => {
  // Scenario: the real API has no notify(). If the mock provided one, code calling it
  // would pass tests and then throw inside the Amplenote sandbox.
  test("does not provide app.notify, because the real API has none", () => {
    const app = createMockApp();
    expect(app.notify).toBeUndefined();
  });

  // Scenario: a cancelled prompt returns null, not undefined. Code written against
  // `undefined` would treat a cancel as a valid empty answer.
  test("prompt returns null once the queued answers run out", async () => {
    const app = createMockApp({ promptQueue: ["first"] });
    expect(await app.prompt("pick one")).toBe("first");
    expect(await app.prompt("pick again")).toBeNull();
  });

  // Scenario: methods take a noteHandle object, not a bare uuid string.
  test("getNoteAttachments accepts a noteHandle and returns null for unknown notes", async () => {
    const app = createMockApp({
      notes: [{ uuid: "note-1", name: "Research", attachments: [mockAttachment()] }],
    });
    expect(await app.getNoteAttachments({ uuid: "note-1" })).toHaveLength(1);
    expect(await app.getNoteAttachments({ uuid: "nope" })).toBeNull();
  });

  // Scenario: the 100k cap is real and shared with the user's own note content.
  // Persistence has to fail loudly at the limit, not silently truncate.
  test("rejects content over 100k characters", async () => {
    const app = createMockApp({ notes: [noteWith("")] });
    const huge = "x".repeat(100_001);
    await expect(app.replaceNoteContent({ uuid: "note-1" }, huge)).rejects.toThrow(/100k/);
    await expect(app.insertNoteContent({ uuid: "note-1" }, huge)).rejects.toThrow(/100k/);
  });
});

describe("section-scoped replaceNoteContent", () => {
  const CONTENT = [
    "# My research",
    "Some notes I wrote by hand.",
    "",
    "## PDF Annotator data",
    "old payload",
    "",
    "## Conclusions",
    "Also mine.",
  ].join("\n");

  // Scenario: THE critical persistence guarantee (spec §7.4) — writing the managed
  // section must leave the user's surrounding content untouched.
  test("replaces only the named section, preserving other content and the heading", async () => {
    const app = createMockApp({ notes: [noteWith(CONTENT)] });

    await app.replaceNoteContent({ uuid: "note-1" }, "new payload", {
      section: { heading: { text: "PDF Annotator data" } },
    });

    const result = app._notes.get("note-1").content;
    expect(result).toContain("Some notes I wrote by hand.");
    expect(result).toContain("## PDF Annotator data");
    expect(result).toContain("new payload");
    expect(result).not.toContain("old payload");
    expect(result).toContain("## Conclusions");
    expect(result).toContain("Also mine.");
  });

  // Scenario: a section at the end of the note has no following heading to bound it.
  test("handles a section that runs to the end of the note", async () => {
    const app = createMockApp({
      notes: [noteWith("# Title\nintro\n\n## PDF Annotator data\nold")],
    });

    await app.replaceNoteContent({ uuid: "note-1" }, "new", {
      section: { heading: { text: "PDF Annotator data" } },
    });

    const result = app._notes.get("note-1").content;
    expect(result).toContain("intro");
    expect(result).toContain("new");
    expect(result).not.toContain("old");
  });

  // Scenario: first write to a note that has no managed section yet. Storage code must
  // create the heading rather than assume it exists — this is the error it will see.
  test("throws when the section does not exist", async () => {
    const app = createMockApp({ notes: [noteWith("# Title\njust prose")] });

    await expect(
      app.replaceNoteContent({ uuid: "note-1" }, "payload", {
        section: { heading: { text: "PDF Annotator data" } },
      })
    ).rejects.toThrow(/no section/);
  });

  // Scenario: without a section option it's a whole-note replace, per the real API.
  test("replaces the whole note when no section is given", async () => {
    const app = createMockApp({ notes: [noteWith(CONTENT)] });

    await app.replaceNoteContent({ uuid: "note-1" }, "everything gone");

    expect(app._notes.get("note-1").content).toBe("everything gone");
  });
});
