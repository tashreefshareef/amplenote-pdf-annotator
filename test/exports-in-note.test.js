/**
 * Tests for locating and editing highlight blocks already sent into a note's body.
 *
 * These exist because a sent block used to be a dead snapshot: recolouring a highlight
 * left its block in the old colour, deleting the highlight left an orphan whose deep link
 * pointed at an id that no longer resolved, and re-sending appended a duplicate. Reported
 * live with a screenshot of the same quote three times in two colours.
 *
 * The risk being managed here is the opposite one, and it is why every case below pins a
 * NEGATIVE as well: these functions edit the user's own note, so anything they cannot
 * positively identify as this plugin's own output has to be left exactly alone.
 */
import {
  findExportBlock,
  listExportedHighlightIds,
  removeExportBlock,
  replaceExportBlock,
} from "../src/exports-in-note.js";

const PLUG = "plug-1";
const ATT = "att-1";

const block = (id, color = "#F3998C", quote = "the quoted text") =>
  `[<mark style="background-color:${color};">paper.pdf<!-- {"backgroundCycleColor":"12"} --></mark>](plugin://${PLUG}?att=${ATT}&page=1&hl=${id})\n> > ${quote}`;

describe("findExportBlock", () => {
  // Scenario: the core lookup - a block among the user's own prose, found by its id.
  test("finds a block and reports the full span of its quoted lines", () => {
    const lines = [
      "# My notes",
      "some prose",
      "",
      `[<mark>paper.pdf</mark>](plugin://${PLUG}?att=${ATT}&page=1&hl=hl-abc)`,
      "> > quoted material",
      ">",
      "> my own remark",
      "",
      "more prose",
    ];
    expect(findExportBlock(lines, PLUG, ATT, "hl-abc")).toEqual({ start: 3, end: 7 });
  });

  // Scenario: THE collision that would silently edit the wrong block. Generated ids share
  // a prefix, so a substring test for "hl=abc" also matches "hl=abcdef" - and the damage
  // would be invisible, since both lines look alike.
  test("does not match an id that merely starts with the one asked for", () => {
    const lines = [`[x](plugin://${PLUG}?att=${ATT}&hl=hl-abcdef)`, "> > quote"];
    expect(findExportBlock(lines, PLUG, ATT, "hl-abc")).toBeNull();
  });

  // Scenario: two viewers on one note. A block belonging to the other PDF must not be
  // found, or removing a highlight in one viewer edits the other's write-up.
  test("ignores a block belonging to a different attachment", () => {
    const lines = [`[x](plugin://${PLUG}?att=other-att&page=1&hl=hl-abc)`, "> > quote"];
    expect(findExportBlock(lines, PLUG, ATT, "hl-abc")).toBeNull();
  });

  // Scenario: the user's own writing must never be mistaken for a block. A line that
  // quotes an id, or a plain markdown link, is not this plugin's output.
  test("ignores prose that merely mentions a highlight id", () => {
    const lines = ["I removed hl=hl-abc yesterday", "> a quote of my own"];
    expect(findExportBlock(lines, PLUG, ATT, "hl-abc")).toBeNull();
  });
});

describe("listExportedHighlightIds", () => {
  // Scenario: drives the panel's "remove from note" affordance, which must appear only
  // where there is something to remove.
  test("lists every highlight the note holds a block for, once each", () => {
    const content = [block("hl-a"), "", block("hl-b"), "", block("hl-a")].join("\n");
    expect(listExportedHighlightIds(content, PLUG, ATT)).toEqual(["hl-a", "hl-b"]);
  });

  test("returns nothing for a note with no exports", () => {
    expect(listExportedHighlightIds("# just prose", PLUG, ATT)).toEqual([]);
    expect(listExportedHighlightIds("", PLUG, ATT)).toEqual([]);
  });

  // Scenario: a note holding only a viewer. The embed tag carries the same plugin://
  // scheme, so a looser scan would report ids that are not exports at all.
  test("does not count the viewer's own embed tag as an export", () => {
    const content = `<object data="plugin://${PLUG}?att=${ATT}&page=2&hl=hl-a" data-aspect-ratio="1" />`;
    expect(listExportedHighlightIds(content, PLUG, ATT)).toEqual([]);
  });
});

describe("removeExportBlock", () => {
  // Scenario: deleting a highlight takes its write-up with it, and leaves everything the
  // user wrote around it exactly where it was.
  test("removes just that block, keeping the user's own content", () => {
    const content = ["# Notes", "before", "", "---", "", block("hl-a"), "", block("hl-b"), ""].join("\n");
    const out = removeExportBlock(content, PLUG, ATT, "hl-a");

    expect(out).toContain("before");
    expect(out).not.toContain("hl=hl-a");
    expect(out).toContain("hl=hl-b");
  });

  // Scenario: the separator marks where sent blocks begin. With none left it divides the
  // user's writing from nothing, so it goes too.
  test("takes the separator with the last remaining block", () => {
    const content = ["# Notes", "before", "", "---", "", block("hl-a")].join("\n");
    const out = removeExportBlock(content, PLUG, ATT, "hl-a");

    expect(out).not.toContain("---");
    expect(out).toContain("before");
  });

  // Scenario: the same rule must NOT eat a horizontal rule the user wrote themselves
  // earlier in the note - only a trailing one, left over from the export section.
  test("leaves the user's own horizontal rules alone", () => {
    const content = ["# Notes", "---", "prose after my own rule", "", "---", "", block("hl-a")].join("\n");
    const out = removeExportBlock(content, PLUG, ATT, "hl-a");

    expect(out).toContain("prose after my own rule");
    expect(out.match(/^---$/gm)).toHaveLength(1);
  });

  // Scenario: nothing to remove is a normal outcome - the panel's view of what is in the
  // note can be one edit stale - and must be distinguishable from a failed removal.
  test("returns null when the note holds no block for that highlight", () => {
    expect(removeExportBlock("# just prose", PLUG, ATT, "hl-a")).toBeNull();
  });
});

describe("replaceExportBlock", () => {
  // Scenario: recolouring, and re-sending. The block is rewritten WHERE IT SITS - a user
  // who moved it, or wrote around it, keeps their structure.
  test("swaps a block in place without moving it", () => {
    const content = ["# Notes", "before", "", block("hl-a", "#F3998C"), "", "after"].join("\n");
    const out = replaceExportBlock(content, PLUG, ATT, "hl-a", block("hl-a", "#84B6D9"));

    expect(out).toContain("#84B6D9");
    expect(out).not.toContain("#F3998C");
    // Still between the two things it was between.
    expect(out.indexOf("before")).toBeLessThan(out.indexOf("#84B6D9"));
    expect(out.indexOf("#84B6D9")).toBeLessThan(out.indexOf("after"));
  });

  // Scenario: a replacement of a different height must not swallow or strand lines.
  test("handles a replacement with more lines than the original", () => {
    const content = [block("hl-a"), "", "after"].join("\n");
    const grown = `${block("hl-a")}\n>\n> a note that was not there before`;
    const out = replaceExportBlock(content, PLUG, ATT, "hl-a", grown);

    expect(out).toContain("a note that was not there before");
    expect(out).toContain("after");
  });

  test("returns null when there is no such block to replace", () => {
    expect(replaceExportBlock("# just prose", PLUG, ATT, "hl-a", block("hl-a"))).toBeNull();
  });
});
