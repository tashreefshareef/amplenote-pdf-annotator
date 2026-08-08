/**
 * Tests for building the markdown exported back into an Amplenote note.
 *
 * These pin the format findings from export.js's own header: the
 * `==text<!-- {"cycleColor":"N"} -->==` color syntax, the "double-quoted block"
 * interpretation (a markdown blockquote AND literal quote marks), and the DECOUPLED
 * marker+link heading - a colored `==●<!--json-->==` marker followed by a separate
 * plain `[PDF name](url)` link, since a highlight/mark span and a markdown link were
 * confirmed live not to compose in either nesting order. If any of these turn out wrong
 * once tested live, these are the tests to update alongside the fix.
 */
import { createExportBuilder, buildDeepLink, buildHighlightBlock, buildExportAllContent } from "../src/export.js";
import { parseEmbedArgs } from "../src/embed-args.js";

const PLUGIN_UUID = "plugin-uuid-1";
const ATT_UUID = "attach-1";

const highlight = (overrides = {}) => ({
  id: "hl-abc123",
  page: 3,
  color: "yellow",
  quoteText: "the highlighted text",
  note: null,
  rects: [{ x: 10, y: 700, width: 100, height: 12 }],
  ...overrides,
});

const CYCLE_TABLE = { coral: 12, yellow: 14, green: 15, blue: 18 };

describe("buildDeepLink", () => {
  // Scenario: the core round-trip - a deep link must carry enough to reopen the exact
  // highlight, and parseEmbedArgs (embed-args.js) must be able to read it back.
  test("encodes attachment, page and highlight id as a plugin:// query string", () => {
    const url = buildDeepLink(PLUGIN_UUID, ATT_UUID, 3, "hl-abc123");
    expect(url).toBe(`plugin://${PLUGIN_UUID}?att=${ATT_UUID}&page=3&hl=hl-abc123`);
  });

  // Scenario: THE thing that makes a clicked link able to go anywhere at all - without
  // the source note's uuid, linkTarget (src/actions/link-target.js) has no note to
  // app.navigate to. A `plugin://` link is routed to linkTarget, not renderEmbed
  // (confirmed live and via Amplenote's own docs - see export.js's file header).
  test("encodes the source note uuid so linkTarget knows where to navigate", () => {
    const url = buildDeepLink(PLUGIN_UUID, ATT_UUID, 3, "hl-abc123", "note-42");
    expect(url).toContain("note=note-42");
    expect(parseEmbedArgs(url.split("?")[1]).noteUUID).toBe("note-42");
  });

  // Scenario: a bare plugin link (no attachment yet) must not produce a stray "?".
  test("omits the query string entirely when nothing is provided", () => {
    expect(buildDeepLink(PLUGIN_UUID, null, null, null)).toBe(`plugin://${PLUGIN_UUID}`);
  });

  // Scenario: page 0 or negative is not a valid 1-based page - must be dropped rather
  // than producing a link that jumps somewhere nonsensical.
  test("omits an invalid page number", () => {
    expect(buildDeepLink(PLUGIN_UUID, ATT_UUID, 0, "hl-1")).not.toContain("page=");
    expect(buildDeepLink(PLUGIN_UUID, ATT_UUID, -1, "hl-1")).not.toContain("page=");
  });

  // Scenario: special characters in an attachment uuid or highlight id must not corrupt
  // the query string - URLSearchParams handles this, but it is worth pinning.
  test("percent-encodes values that need it", () => {
    const url = buildDeepLink(PLUGIN_UUID, "att with space", 1, "hl&1");
    expect(url).toContain("att=att+with+space");
    expect(url).toContain("hl=hl%261");
  });
});

describe("buildHighlightBlock", () => {
  // Scenario: THE core format - a colored marker (the highlight+HTML-comment syntax,
  // carrying no link) immediately followed by a plain link with the PDF's name, then the
  // quoted text, then the note, each on distinguishable lines.
  test("builds the three-line block: colored marker + link, quote, note", () => {
    const block = buildHighlightBlock(
      "Suzuki Access Insurance 2025-2026.pdf",
      PLUGIN_UUID,
      ATT_UUID,
      highlight({ note: "worth double-checking at renewal" }),
      14,
      "note-42"
    );
    const lines = block.split("\n");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toBe(
      `==●<!-- {"cycleColor":"14"} -->== [Suzuki Access Insurance 2025-2026.pdf](plugin://${PLUGIN_UUID}?att=${ATT_UUID}&page=3&hl=hl-abc123&note=note-42)`
    );
    expect(lines[1]).toBe('> "the highlighted text"');
    expect(lines[2]).toBe("worth double-checking at renewal");
  });

  // Scenario: a highlight with no note must not leave a stray empty third line - the
  // note is genuinely absent, not present-and-blank.
  test("omits the note line entirely when there is no note", () => {
    const block = buildHighlightBlock("paper.pdf", PLUGIN_UUID, ATT_UUID, highlight({ note: null }), 14);
    expect(block.split("\n")).toHaveLength(2);
  });

  // Scenario: THE hazard the spec's own wording ("colored link") would have missed -
  // there is no plain colored-link syntax in Amplenote, and a highlight/mark span cannot
  // contain a markdown link at all (confirmed live, in both nesting orders - see the
  // file header). Color and link are separate constructs: the marker uses the
  // ==...<!-- {"cycleColor"} -->== wrapper with NO space after the opening == (confirmed
  // live, whitespace there silently disables the formatting), and the link right after
  // it is left completely plain.
  test("colors a marker, then leaves the link plain, with no leading space in the marker", () => {
    const block = buildHighlightBlock("paper.pdf", PLUGIN_UUID, ATT_UUID, highlight(), 18);
    const heading = block.split("\n")[0];
    expect(heading).toMatch(/^==\S/); // no space after the opening ==
    expect(heading).toMatch(/<!-- \{"cycleColor":"18"\} -->== \[paper\.pdf\]\(/);
  });

  // Scenario: PDF filenames routinely contain brackets - "[DRAFT] Report.pdf" - which
  // would prematurely close the plain link's [text] segment if not escaped.
  test("escapes a closing bracket in the PDF name", () => {
    const block = buildHighlightBlock("[DRAFT] Report.pdf", PLUGIN_UUID, ATT_UUID, highlight(), 14);
    expect(block).toContain("[DRAFT\\] Report.pdf]");
  });

  // Scenario: the highlighted text and the note must be clearly distinguishable from
  // each other - spec §4's explicit requirement. The quote is blockquoted AND literally
  // quoted; the note is neither, so the two can never be visually confused.
  test("keeps the quote and the note structurally distinct", () => {
    const block = buildHighlightBlock(
      "paper.pdf",
      PLUGIN_UUID,
      ATT_UUID,
      highlight({ quoteText: "quoted material", note: "a plain remark" }),
      14
    );
    const lines = block.split("\n");
    expect(lines[1]).toMatch(/^> "/); // the quote: blockquoted and double-quoted
    expect(lines[2]).not.toMatch(/^>/); // the note: neither
    expect(lines[2]).not.toMatch(/^"/);
  });
});

describe("buildExportAllContent", () => {
  const three = [
    highlight({ id: "hl-a", page: 1, color: "coral", quoteText: "first", rects: [{ x: 0, y: 700, width: 10, height: 10 }] }),
    highlight({ id: "hl-b", page: 2, color: "green", quoteText: "second", rects: [{ x: 0, y: 700, width: 10, height: 10 }] }),
    highlight({ id: "hl-c", page: 1, color: "blue", quoteText: "third", rects: [{ x: 0, y: 650, width: 10, height: 10 }] }),
  ];

  // Scenario: every highlight, no filter, joined as separate blocks.
  test("includes every highlight when no color filter is given", () => {
    const content = buildExportAllContent("paper.pdf", PLUGIN_UUID, ATT_UUID, three, CYCLE_TABLE, null);
    expect(content).toContain("first");
    expect(content).toContain("second");
    expect(content).toContain("third");
  });

  // Scenario: THE color filter requirement - only the requested colors appear.
  test("includes only the highlights matching the color filter", () => {
    const content = buildExportAllContent("paper.pdf", PLUGIN_UUID, ATT_UUID, three, CYCLE_TABLE, ["green"]);
    expect(content).toContain("second");
    expect(content).not.toContain("first");
    expect(content).not.toContain("third");
  });

  // Scenario: a filter matching nothing must produce an empty result, not throw or
  // fall back to "everything".
  test("returns an empty string when the filter matches nothing", () => {
    const content = buildExportAllContent("paper.pdf", PLUGIN_UUID, ATT_UUID, three, CYCLE_TABLE, ["yellow"]);
    expect(content).toBe("");
  });

  // Scenario: sorted the way a reader moves through the document - page order, then
  // top-to-bottom on the page - not the order highlights were created in. "third" (page
  // 1, lower on the page) must come after "first" (page 1, higher) but before "second"
  // (page 2), even though it was passed in last.
  test("orders blocks by page then position, not input order", () => {
    const content = buildExportAllContent("paper.pdf", PLUGIN_UUID, ATT_UUID, three, CYCLE_TABLE, null);
    const order = ["first", "third", "second"].map((w) => content.indexOf(w));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  // Scenario: blocks must be separated by a blank line, or consecutive highlights'
  // blockquotes visually run together as one continuous quote.
  test("separates blocks with a blank line", () => {
    const content = buildExportAllContent("paper.pdf", PLUGIN_UUID, ATT_UUID, three.slice(0, 2), CYCLE_TABLE, null);
    expect(content).toContain("\n\n==●");
  });

  // Scenario: no highlights at all (a PDF nobody has annotated yet) must not throw -
  // "export all" is reachable from a toolbar button regardless of state.
  test("returns an empty string for no highlights", () => {
    expect(buildExportAllContent("paper.pdf", PLUGIN_UUID, ATT_UUID, [], CYCLE_TABLE, null)).toBe("");
  });

  // Scenario: every block in an "export all" run needs the SAME source note uuid - they
  // all came from the same note's embed - so linkTarget can navigate back correctly no
  // matter which exported link in the batch gets clicked.
  test("propagates the source note uuid to every block", () => {
    const content = buildExportAllContent(
      "paper.pdf",
      PLUGIN_UUID,
      ATT_UUID,
      three,
      CYCLE_TABLE,
      null,
      "note-42"
    );
    const occurrences = content.split("note=note-42").length - 1;
    expect(occurrences).toBe(three.length);
  });
});

describe("createExportBuilder", () => {
  // Scenario: the embed cannot import this module - it gets the factory's SOURCE
  // injected into the page and calls it there, the same pattern as geometry.js and
  // annotations.js. If the factory ever closed over module scope, the module-level
  // exports would keep working while the embed copy threw a ReferenceError only
  // visible in the live app.
  test("produces a working, self-contained copy of the API", () => {
    const builder = createExportBuilder();
    const block = builder.buildHighlightBlock("paper.pdf", PLUGIN_UUID, ATT_UUID, highlight(), 14);
    expect(block).toContain("the highlighted text");
  });

  // Scenario: the factory's source is serialized into an inline script tag. A literal
  // closing script tag anywhere in it - even inside a comment - terminates the embed's
  // script block early and breaks the whole viewer.
  test("has a source safe to inline in a script tag", () => {
    expect(createExportBuilder.toString()).not.toContain("</" + "script");
  });
});
