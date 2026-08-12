/**
 * Tests for the temporary markdown-dump diagnostic. Delete alongside the action.
 *
 * It creates and writes a note, so it falls under the same T&C coverage requirement as
 * every other note-modifying action (spec §5.2) even though it is throwaway.
 */
import {
  dumpMarkdown,
  fenceFor,
  DUMP_HEADING,
  SECTIONS_HEADING,
} from "../src/actions/dump-markdown.js";
import { PDF_MIME } from "../src/attachments.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const appWith = (content, attachments = []) =>
  createMockApp({ notes: [{ uuid: "note-1", name: "Research", content, attachments }] });

describe("fenceFor", () => {
  // Scenario: ordinary prose — the usual three backticks are enough.
  test("uses three backticks for content with none of its own", () => {
    expect(fenceFor("# Hello\nplain text")).toBe("```");
  });

  // Scenario: the real case this exists for. Stored highlight JSON lives in a ``` block,
  // so a three-backtick wrapper would be closed by the note's own fence and the rest of
  // the dump would spill out as prose the editor is free to reformat.
  test("outgrows a fenced block already inside the content", () => {
    expect(fenceFor("text\n```json\n{}\n```\n")).toBe("````");
  });

  test("outgrows the longest run, not the first", () => {
    expect(fenceFor("``a\n`````\nb")).toBe("``````");
  });

  test("handles empty and missing content without throwing", () => {
    expect(fenceFor("")).toBe("```");
    expect(fenceFor(undefined)).toBe("```");
  });
});

describe("dumpMarkdown", () => {
  // Scenario: the happy path — content is copied verbatim into a separate note, inside a
  // fence, with the attachment list alongside it for correlation.
  test("writes the content and attachment list to a NEW note", async () => {
    const app = appWith("# Research\nbody", [
      mockAttachment({ name: "rent.pdf", uuid: "att-1", type: PDF_MIME }),
    ]);

    const dumpUUID = await dumpMarkdown(app, "note-1");

    expect(dumpUUID).not.toBe("note-1");
    const dump = app._notes.get(dumpUUID).content;
    expect(dump).toContain(DUMP_HEADING);
    expect(dump).toContain("# Research\nbody");
    expect(dump).toContain("rent.pdf | application/pdf | att-1");
  });

  // Scenario: the note under inspection must come back byte-identical. Modifying it
  // would destroy the very thing being measured.
  test("never modifies the note being inspected", async () => {
    const app = appWith("# Research\nbody");

    await dumpMarkdown(app, "note-1");

    expect(app._notes.get("note-1").content).toBe("# Research\nbody");
  });

  // Scenario: a note whose own content is fenced — the wrapper has to outgrow it or the
  // dump is truncated at exactly the point that matters.
  test("wraps fenced content in a longer fence", async () => {
    const app = appWith("before\n```json\n{}\n```\nafter");

    const dump = app._notes.get(await dumpMarkdown(app, "note-1")).content;

    expect(dump).toContain("````\nbefore");
    expect(dump).toContain("after\n````");
  });

  // Scenario: nothing to dump. Creating an empty debug note would just be litter.
  test("says so and creates nothing when the note is empty", async () => {
    const app = appWith("");

    expect(await dumpMarkdown(app, "note-1")).toBeNull();
    expect(app.createNote).not.toHaveBeenCalled();
    expect(app._calls.alerts[0]).toMatch(/empty/i);
  });

  // Scenario: attachment lookup returns [] (documented) rather than a list.
  test("renders a placeholder when the note has no attachments", async () => {
    const app = appWith("body", []);

    const dump = app._notes.get(await dumpMarkdown(app, "note-1")).content;

    expect(dump).toContain("(none)");
  });
});

/**
 * Added for a live bug: linkTarget navigates to a section anchor so the mobile app scrolls
 * the note to the PDF, and a deep link was landing at the bottom of the note - the
 * signature of an anchor naming no section. Neither the anchor format nor the section
 * object's shape is documented, so this dump is how the real values get read.
 */
describe("the section dump", () => {
  // Scenario: the raw getNoteSections output has to reach the dump note verbatim, since
  // the unknown is precisely which fields exist and what an anchor really looks like.
  test("includes the note's sections as JSON", async () => {
    const app = createMockApp({
      notes: [{ uuid: "note-1", name: "Research", content: "# Reading list\n\nprose" }],
    });

    await dumpMarkdown(app, "note-1");

    const dumped = app._calls.insertedContent[0].content;
    expect(dumped).toContain(SECTIONS_HEADING);
    expect(dumped).toContain('"text": "Reading list"');
  });

  // Scenario: a host with no getNoteSections, or one that throws, must still produce the
  // markdown half of the dump - a diagnostic that fails whole is no diagnostic.
  test("says so rather than failing when sections cannot be read", async () => {
    const app = createMockApp({
      notes: [{ uuid: "note-1", name: "Research", content: "# Title\n\nprose" }],
    });
    app.getNoteSections = async () => {
      throw new Error("nope");
    };

    await dumpMarkdown(app, "note-1");

    const dumped = app._calls.insertedContent[0].content;
    expect(dumped).toContain("getNoteSections threw: nope");
    expect(dumped).toContain("# Title");
  });
});
