/**
 * Tests for embed argument encoding — the deep-link schema.
 *
 * Why these matter: Phase 5's headline requirement is that a link exported into a note
 * reopens the annotator at the exact page and position. That link is nothing but these
 * functions' output, so a round-trip bug here silently produces links that open the
 * wrong place — a visible acceptance failure. Pinned in Phase 1 per spec §7.3.
 */
import {
  headingAboveEmbed,
  parseEmbedArgs,
  buildEmbedArgs,
  buildEmbedMarkup,
  hasEmbedFor,
  insertEmbedAfterChip,
  removeEmbedMarkup,
  setEmbedCollapsed,
  updateEmbedArgs,
  normalizeAspectRatio,
  aspectRatioFor,
} from "../src/embed-args.js";
// Asserted against the constants, never against a literal: the expanded ratio is a
// tuning value that has already been changed once (1.2 -> 1.0, to give the PDF more of
// the box), and a test that hardcodes it fails on the next tune for no real reason.
// Fixtures below deliberately keep the literal 1.2 - there they represent an embed tag
// written by an OLDER version, which is exactly the input these rewriters must handle.
import { EXPANDED_ASPECT_RATIO, COLLAPSED_ASPECT_RATIO } from "../src/constants.js";

describe("parseEmbedArgs", () => {
  // Scenario: the normal case — Amplenote hands renderEmbed the query string from
  // plugin://UUID?att=...&page=3
  test("parses attachment, page, coordinates and highlight id", () => {
    const result = parseEmbedArgs("att=abc-123&page=3&x=100.5&y=250.25&hl=h7");
    expect(result).toEqual({
      attachmentUUID: "abc-123",
      page: 3,
      x: 100.5,
      y: 250.25,
      highlightId: "h7",
      noteUUID: null,
      collapsed: false,
      attachmentName: "",
      aspectRatio: null,
    });
  });

  // Scenario: THE thing that makes a linkTarget click able to navigate anywhere - the
  // source note's uuid, present in an exported deep link but never in the embed tag's
  // own args (renderEmbed already knows its note from app.context.noteUUID).
  test("parses the source note uuid", () => {
    expect(parseEmbedArgs("att=a&note=note-42").noteUUID).toBe("note-42");
  });

  // Scenario: an embed inserted with no parameters at all. Must not throw — a throwing
  // renderEmbed shows an empty box with nothing to diagnose.
  test("returns all-null for undefined, empty, or non-string input", () => {
    const empty = {
      attachmentUUID: null,
      page: null,
      x: null,
      y: null,
      highlightId: null,
      noteUUID: null,
      collapsed: false,
      attachmentName: "",
      aspectRatio: null,
    };
    expect(parseEmbedArgs(undefined)).toEqual(empty);
    expect(parseEmbedArgs("")).toEqual(empty);
    expect(parseEmbedArgs(null)).toEqual(empty);
    expect(parseEmbedArgs(42)).toEqual(empty);
  });

  // Scenario: a leading "?" may or may not be included depending on how the link was
  // built; both must work.
  test("tolerates a leading question mark", () => {
    expect(parseEmbedArgs("?att=xyz").attachmentUUID).toBe("xyz");
  });

  // Scenario: garbage in the page parameter must not scroll somewhere random. Pages
  // are 1-based, so 0 and negatives are invalid, not clamped silently.
  test("rejects non-numeric, zero, and negative pages", () => {
    expect(parseEmbedArgs("page=abc").page).toBeNull();
    expect(parseEmbedArgs("page=0").page).toBeNull();
    expect(parseEmbedArgs("page=-2").page).toBeNull();
    expect(parseEmbedArgs("page=").page).toBeNull();
    expect(parseEmbedArgs("page=4.7").page).toBe(4);
  });

  // Scenario: coordinates are PDF user-space and legitimately fractional; y can be
  // large. They must survive as numbers, not strings.
  test("keeps coordinates as finite numbers, rejecting junk", () => {
    expect(parseEmbedArgs("x=0&y=841.89").x).toBe(0);
    expect(parseEmbedArgs("x=0&y=841.89").y).toBe(841.89);
    expect(parseEmbedArgs("x=NaN").x).toBeNull();
  });
});

describe("buildEmbedArgs", () => {
  // Scenario: THE Phase 5 guarantee — what we write into an exported link must parse
  // back to the same values, or deep-links land on the wrong spot.
  test("round-trips through parseEmbedArgs without loss", () => {
    const original = {
      attachmentUUID: "att-9",
      page: 12,
      x: 72.5,
      y: 640.125,
      highlightId: "hl-abc",
    };
    // buildEmbedArgs never sets `note` - the embed tag gets its own note from
    // app.context.noteUUID, not from its own args (see parseEmbedArgs's doc comment).
    expect(parseEmbedArgs(buildEmbedArgs(original))).toEqual({
      ...original,
      noteUUID: null,
      collapsed: false,
      attachmentName: "",
      aspectRatio: null,
    });
  });

  // Scenario: a plain "open this PDF" link carries no position, and shouldn't be
  // cluttered with empty parameters.
  test("omits absent values", () => {
    expect(buildEmbedArgs({ attachmentUUID: "a1" })).toBe("att=a1");
    expect(buildEmbedArgs({})).toBe("");
  });

  // Scenario: x=0 and y=0 are valid coordinates (bottom-left origin) and must not be
  // dropped by a falsy check.
  test("keeps zero coordinates", () => {
    const args = buildEmbedArgs({ attachmentUUID: "a", x: 0, y: 0 });
    expect(parseEmbedArgs(args).x).toBe(0);
    expect(parseEmbedArgs(args).y).toBe(0);
  });
});

describe("buildEmbedMarkup", () => {
  // Scenario: inline embed markup is what actually renders the viewer in a note.
  test("builds an object tag pointing at the plugin", () => {
    const markup = buildEmbedMarkup("plug-1", { attachmentUUID: "att-1" }, 1.5);
    expect(markup).toBe('<object data="plugin://plug-1?att=att-1" data-aspect-ratio="1.5" />');
  });

  // Scenario: no params — the URL must not end in a dangling "?".
  test("omits the query string entirely when there are no args", () => {
    expect(buildEmbedMarkup("plug-1")).toContain('data="plugin://plug-1"');
  });

  // Scenario: without a plugin uuid the embed would point nowhere and render blank.
  // Fail loudly instead.
  test("throws without a plugin uuid", () => {
    expect(() => buildEmbedMarkup(null)).toThrow(/pluginUUID/);
  });
});

describe("hasEmbedFor", () => {
  const markup = '<object data="plugin://plug-1?att=att-1" data-aspect-ratio="1.2" />';

  // Scenario: re-running "Annotate PDF" must not stack duplicate viewers in the note.
  test("detects an existing embed for the same attachment", () => {
    expect(hasEmbedFor(`notes\n${markup}\nmore`, "plug-1", "att-1")).toBe(true);
  });

  // Scenario: a note can hold viewers for two different PDFs; the second must still
  // be insertable.
  test("does not match a different attachment", () => {
    expect(hasEmbedFor(markup, "plug-1", "att-2")).toBe(false);
  });

  // Scenario: another plugin's embed in the same note is unrelated.
  test("does not match a different plugin", () => {
    expect(hasEmbedFor(markup, "other-plugin", "att-1")).toBe(false);
  });

  test("handles empty content", () => {
    expect(hasEmbedFor("", "plug-1")).toBe(false);
    expect(hasEmbedFor(null, "plug-1")).toBe(false);
  });
});

describe("removeEmbedMarkup", () => {
  const markupA = '<object data="plugin://plug-1?att=att-1" data-aspect-ratio="1.2" />';
  const markupB = '<object data="plugin://plug-1?att=att-2" data-aspect-ratio="1.2" />';

  // Scenario: THE detach guarantee - explicitly removing one viewer must not touch a
  // second, different viewer sitting elsewhere in the same note.
  test("removes only the line for the given attachment, leaving another viewer intact", () => {
    const content = `notes\n\n${markupA}\n\n${markupB}\n\nmore`;
    const result = removeEmbedMarkup(content, "plug-1", "att-1");
    expect(result).not.toContain(markupA);
    expect(result).toContain(markupB);
  });

  // Scenario: annotate-pdf.js always inserts the tag as its own line padded by a blank
  // line before and after - removal must collapse one of them, or every add+remove cycle
  // leaves a growing gap of blank lines behind.
  test("collapses the surrounding blank line so no gap is left behind", () => {
    const content = `# Notes\nhand-written stuff\n\n${markupA}\n\n# Conclusions\nafter`;
    const result = removeEmbedMarkup(content, "plug-1", "att-1");
    expect(result).toBe("# Notes\nhand-written stuff\n\n# Conclusions\nafter");
  });

  // Scenario: nothing to remove - already gone, or this exact combination never existed.
  // Must signal "not found" distinctly from "found and removed nothing changed".
  test("returns null when there is no matching embed", () => {
    expect(removeEmbedMarkup(`notes\n${markupA}`, "plug-1", "att-9")).toBeNull();
    expect(removeEmbedMarkup(`notes\n${markupA}`, "other-plugin", "att-1")).toBeNull();
    expect(removeEmbedMarkup("", "plug-1", "att-1")).toBeNull();
    expect(removeEmbedMarkup(null, "plug-1", "att-1")).toBeNull();
  });
});

describe("updateEmbedArgs", () => {
  const markupA = '<object data="plugin://plug-1?att=att-1" data-aspect-ratio="1.2" />';
  const markupB = '<object data="plugin://plug-1?att=att-2" data-aspect-ratio="1.2" />';

  // Scenario: THE point of this function - linkTarget rewrites the target note's own
  // embed tag so it opens directly at the clicked highlight, not wherever it last was.
  test("merges page and highlightId into the embed's existing args", () => {
    const content = `notes\n\n${markupA}\n\nmore`;
    const result = updateEmbedArgs(content, "plug-1", "att-1", { page: 5, highlightId: "hl-9" });
    expect(result).toContain('data="plugin://plug-1?att=att-1&page=5&hl=hl-9"');
  });

  // Scenario: rewriting one embed's args must not touch a different viewer for a
  // different PDF on the same note - same guarantee removeEmbedMarkup gives.
  test("touches only the matching attachment's embed, leaving another untouched", () => {
    const content = `${markupA}\n\n${markupB}`;
    const result = updateEmbedArgs(content, "plug-1", "att-1", { page: 2 });
    expect(result).toContain(markupB);
    expect(result).not.toContain(markupA);
  });

  // Scenario: an embed tag can already carry other args (from an earlier deep-link
  // navigation) - updating page/highlightId must not silently drop them if not
  // overridden, and must overwrite them cleanly when it is.
  test("overwrites an existing page/highlightId rather than duplicating it", () => {
    const withArgs = '<object data="plugin://plug-1?att=att-1&page=1&hl=hl-old" data-aspect-ratio="1.2" />';
    const result = updateEmbedArgs(withArgs, "plug-1", "att-1", { page: 7, highlightId: "hl-new" });
    expect(result).toContain('data="plugin://plug-1?att=att-1&page=7&hl=hl-new"');
    expect(result).not.toContain("hl-old");
  });

  // Scenario: nothing to update - already gone, or this exact combination never existed.
  // Signals "not found" distinctly, same as removeEmbedMarkup, so the caller (linkTarget)
  // knows to fall back to navigating without a scroll target rather than doing nothing.
  test("returns null when there is no matching embed", () => {
    expect(updateEmbedArgs(`notes\n${markupA}`, "plug-1", "att-9", { page: 1 })).toBeNull();
    expect(updateEmbedArgs(`notes\n${markupA}`, "other-plugin", "att-1", { page: 1 })).toBeNull();
    expect(updateEmbedArgs("", "plug-1", "att-1", { page: 1 })).toBeNull();
    expect(updateEmbedArgs(null, "plug-1", "att-1", { page: 1 })).toBeNull();
  });
});

describe("insertEmbedAfterChip", () => {
  const TAG = '<object data="plugin://plug-1?att=att-1" data-aspect-ratio="1.2" />';
  const chip = (uuid) => `[rent.pdf](attachment://${uuid})`;

  // Scenario: the whole point — the tag lands under the chip, mid-note, not at the end.
  // "Directly after" means the next non-blank line: the tag needs a blank line either
  // side to be its own block.
  test("splices the tag in as the first non-blank line after the chip", () => {
    const result = insertEmbedAfterChip(`intro\n\n${chip("att-1")}\n\noutro`, "att-1", TAG);

    const lines = result.split("\n");
    const chipIdx = lines.findIndex((l) => l.includes("attachment://"));
    expect(lines.slice(chipIdx + 1).find((l) => l !== "")).toBe(TAG);
    expect(lines[lines.length - 1]).toBe("outro");
  });

  // Scenario: the tag must be surrounded by blank lines, or it is not its own block and
  // Amplenote has no reason to render it as an embed.
  test("keeps a blank line on both sides of the tag", () => {
    const lines = insertEmbedAfterChip(`${chip("att-1")}\nbody`, "att-1", TAG).split("\n");

    const tagIdx = lines.indexOf(TAG);
    expect(lines[tagIdx - 1]).toBe("");
    expect(lines[tagIdx + 1]).toBe("");
  });

  // Scenario: the chip sits on a line with other content — a footnote marker, as
  // Amplenote actually writes it for a PDF whose text it extracted.
  test("finds a chip sharing its line with other markdown", () => {
    const result = insertEmbedAfterChip(`${chip("att-1")} [^1]\n\nbody`, "att-1", TAG);
    expect(result).toBe(`${chip("att-1")} [^1]\n\n${TAG}\n\nbody`);
  });

  // Scenario: several PDFs on one note. Matching the wrong uuid would stack every viewer
  // under whichever chip came first.
  test("anchors to the chip with the matching uuid, not the first chip", () => {
    const content = `${chip("att-9")}\n\nmiddle\n\n${chip("att-1")}\n\nend`;

    const lines = insertEmbedAfterChip(content, "att-1", TAG).split("\n");

    expect(lines.indexOf(TAG)).toBeGreaterThan(lines.indexOf("middle"));
  });

  // Scenario: repeated annotate/detach cycles must not leave the note growing blank
  // lines where the tag keeps landing.
  test("does not add a blank line where one already follows the chip", () => {
    const result = insertEmbedAfterChip(`${chip("att-1")}\n\nbody`, "att-1", TAG);
    expect(result).not.toMatch(/\n{3,}/);
  });

  // Scenario: the attachment exists but its chip was deleted from the body. Not an
  // error — the caller falls back to appending rather than refusing to open a viewer.
  test("returns null when this attachment has no chip in the body", () => {
    expect(insertEmbedAfterChip(`${chip("att-9")}\n\nbody`, "att-1", TAG)).toBeNull();
    expect(insertEmbedAfterChip("no chips here", "att-1", TAG)).toBeNull();
  });

  // Scenario: defensive — a missing argument must signal "not found", never throw into
  // an action that would then leave the note half-written.
  test("returns null on missing arguments rather than throwing", () => {
    expect(insertEmbedAfterChip("", "att-1", TAG)).toBeNull();
    expect(insertEmbedAfterChip(null, "att-1", TAG)).toBeNull();
    expect(insertEmbedAfterChip(chip("att-1"), null, TAG)).toBeNull();
    expect(insertEmbedAfterChip(chip("att-1"), "att-1", "")).toBeNull();
  });
});

describe("collapsed state in the embed tag", () => {
  // Scenario: an embed cannot resize its own iframe — Amplenote's docs are explicit that
  // embeds "can't be sized dynamically based on the content of the embed". So the box
  // size lives in the tag, and collapsing must rewrite it. Without this, collapsing left
  // a title bar floating above a tall blank rectangle (reported live).
  test("shrinks the box and records the state when collapsing", () => {
    const content = `<object data="plugin://plug-1?att=att-1" data-aspect-ratio="1.2" />`;

    const result = setEmbedCollapsed(content, "plug-1", "att-1", true);

    expect(result).toContain("c=1");
    expect(result).toContain('data-aspect-ratio="16"');
    expect(result).not.toContain('data-aspect-ratio="1.2"');
  });

  // Scenario: expanding again must restore the full-height box, not just clear the flag.
  test("restores the box when expanding", () => {
    const collapsed = `<object data="plugin://plug-1?att=att-1&c=1" data-aspect-ratio="16" />`;

    const result = setEmbedCollapsed(collapsed, "plug-1", "att-1", false);

    expect(result).not.toContain("c=1");
    expect(result).toContain(`data-aspect-ratio="${EXPANDED_ASPECT_RATIO}"`);
  });

  // Scenario: the flag and the box are two representations of one thing. A tag saying
  // "collapsed" inside a full-height box is the original bug wearing a different hat.
  test("keeps the ratio consistent with the flag through an unrelated update", () => {
    const collapsed = `<object data="plugin://plug-1?att=att-1&c=1" data-aspect-ratio="16" />`;

    const result = updateEmbedArgs(collapsed, "plug-1", "att-1", { page: 4 });

    expect(result).toContain("page=4");
    expect(result).toContain("c=1");
    expect(result).toContain('data-aspect-ratio="16"');
  });

  // Scenario: a hand-edited tag that lost the attribute entirely still has to end up
  // sized, or collapsing it silently does nothing.
  test("adds the attribute when the tag has none", () => {
    const bare = `<object data="plugin://plug-1?att=att-1" />`;
    expect(setEmbedCollapsed(bare, "plug-1", "att-1", true)).toContain('data-aspect-ratio="16"');
  });

  // Scenario: "Fit to this screen" on a phone. The chosen height has to survive in the
  // tag, or the next render puts the box back to the shared default.
  test("round-trips a chosen height through build and parse", () => {
    const query = buildEmbedArgs({ attachmentUUID: "a", aspectRatio: 0.46 });
    expect(query).toContain("ar=0.46");
    expect(parseEmbedArgs(query).aspectRatio).toBe(0.46);
  });

  // Scenario: an untouched viewer's tag must look exactly as it did before this existed -
  // "no ar" has to keep meaning "whatever the default is", or changing the default later
  // stops reaching every existing viewer.
  test("writes no height at all when none was chosen", () => {
    expect(buildEmbedArgs({ attachmentUUID: "a" })).not.toContain("ar=");
    expect(buildEmbedMarkup("plug-1", { attachmentUUID: "a" })).toContain(
      `data-aspect-ratio="${EXPANDED_ASPECT_RATIO}"`
    );
  });

  // Scenario: the ratio is computed INSIDE the embed, from screen.height, which no
  // plugin-side code can vouch for. Junk and out-of-range values mean "use the default",
  // never "use this number anyway".
  test("rejects a height that is junk or out of range, rather than clamping it", () => {
    expect(normalizeAspectRatio(0.46)).toBe(0.46);
    expect(normalizeAspectRatio("0.5")).toBe(0.5);
    expect(normalizeAspectRatio(0.05)).toBeNull();
    expect(normalizeAspectRatio(40)).toBeNull();
    expect(normalizeAspectRatio(NaN)).toBeNull();
    expect(normalizeAspectRatio("tall")).toBeNull();
    expect(normalizeAspectRatio(null)).toBeNull();
    expect(buildEmbedArgs({ attachmentUUID: "a", aspectRatio: 40 })).not.toContain("ar=");
  });

  // Scenario: a fitted viewer gets collapsed. The collapsed box wins - otherwise
  // "collapse" on a phone-fitted viewer produces a full-screen blank rectangle - and the
  // chosen height comes back on expand, because it lives in the args and not in the
  // attribute it happens to be wearing.
  test("lets collapse override a chosen height without forgetting it", () => {
    expect(aspectRatioFor(true, 0.46)).toBe(COLLAPSED_ASPECT_RATIO);
    expect(aspectRatioFor(false, 0.46)).toBe(0.46);
    expect(aspectRatioFor(false, null)).toBe(EXPANDED_ASPECT_RATIO);

    const fitted = `<object data="plugin://plug-1?att=att-1&ar=0.46" data-aspect-ratio="0.46" />`;
    const collapsed = setEmbedCollapsed(fitted, "plug-1", "att-1", true);
    expect(collapsed).toContain(`data-aspect-ratio="${COLLAPSED_ASPECT_RATIO}"`);
    expect(collapsed).toContain("ar=0.46");

    const expanded = setEmbedCollapsed(collapsed, "plug-1", "att-1", false);
    expect(expanded).toContain('data-aspect-ratio="0.46"');
  });

  // Scenario: the flag round-trips, so a re-render after the rewrite comes back up in the
  // state the user left it in rather than springing open again.
  test("round-trips the collapsed flag through build and parse", () => {
    expect(parseEmbedArgs(buildEmbedArgs({ attachmentUUID: "a", collapsed: true })).collapsed).toBe(true);
    expect(parseEmbedArgs(buildEmbedArgs({ attachmentUUID: "a" })).collapsed).toBe(false);
  });

  // Scenario: markup built for a collapsed viewer must be born at the collapsed size.
  test("builds markup at the size matching its collapsed flag", () => {
    expect(buildEmbedMarkup("plug-1", { attachmentUUID: "a", collapsed: true })).toContain(
      `data-aspect-ratio="${COLLAPSED_ASPECT_RATIO}"`
    );
    expect(buildEmbedMarkup("plug-1", { attachmentUUID: "a" })).toContain(
      `data-aspect-ratio="${EXPANDED_ASPECT_RATIO}"`
    );
    // The two must stay distinguishable, or "collapsed" and "expanded" are the same box
    // and every assertion above passes while the feature does nothing.
    expect(COLLAPSED_ASPECT_RATIO).toBeGreaterThan(EXPANDED_ASPECT_RATIO);
  });

  // Scenario: nothing to resize — same "not found" contract as the other tag rewriters.
  test("returns null when the viewer's tag is not in the note", () => {
    expect(setEmbedCollapsed("prose only", "plug-1", "att-1", true)).toBeNull();
  });
});

describe("the PDF name carried in the embed tag", () => {
  // Scenario: the bug this exists for — every exported highlight was labelled "PDF" and
  // the destination note came out titled "PDF - Highlights", because the runtime
  // getNoteAttachments lookup silently returned "". On a note with several PDFs the
  // exported blocks were then impossible to tell apart.
  test("round-trips the name through build and parse", () => {
    const args = buildEmbedArgs({ attachmentUUID: "a", attachmentName: "RENT AGREEMENT 7 8 26.pdf" });
    expect(parseEmbedArgs(args).attachmentName).toBe("RENT AGREEMENT 7 8 26.pdf");
  });

  // Scenario: THE encoding hazard. The query string ends up inside data="..." in the note
  // markup, so an unencoded double quote in a filename would terminate the attribute and
  // break the tag outright — the embed would stop rendering.
  test("encodes a double quote in the filename rather than breaking the tag", () => {
    const markup = buildEmbedMarkup("plug-1", {
      attachmentUUID: "a",
      attachmentName: 'the "final" draft.pdf',
    });

    // Exactly two quote characters in the whole tag pair off as data="..." delimiters,
    // plus the two around data-aspect-ratio - none from the filename.
    expect(markup.match(/"/g)).toHaveLength(4);
    expect(parseEmbedArgs(markup.split("?")[1].split('"')[0]).attachmentName).toBe(
      'the "final" draft.pdf'
    );
  });

  // Scenario: ampersands would otherwise be read as a parameter separator, truncating the
  // name and corrupting everything after it in the query.
  test("survives an ampersand in the filename", () => {
    const args = buildEmbedArgs({ attachmentUUID: "a", attachmentName: "Smith & Jones.pdf", page: 4 });
    expect(parseEmbedArgs(args).attachmentName).toBe("Smith & Jones.pdf");
    expect(parseEmbedArgs(args).page).toBe(4);
  });

  // Scenario: tags written before the name was carried this way must keep working — they
  // just fall back to the runtime lookup, exactly as before.
  test("defaults to empty for a tag that carries no name", () => {
    expect(parseEmbedArgs("att=a").attachmentName).toBe("");
  });

  // Scenario: renaming stays possible — an update must not wipe the name it already had.
  test("preserves the name through an unrelated tag update", () => {
    const content = `<object data="plugin://plug-1?att=att-1&n=paper.pdf" data-aspect-ratio="1.2" />`;
    expect(updateEmbedArgs(content, "plug-1", "att-1", { page: 9 })).toContain("n=paper.pdf");
  });
});

/**
 * The heading above an embed is the note's only addressable landmark near a PDF -
 * `app.navigate` can aim at a section (`.../notes/UUID#Section_name`) but has no way to
 * name an embed. See src/actions/link-target.js for what depends on this.
 */
describe("the heading a viewer sits under", () => {
  const tag = (att) => `<object data="plugin://plug-1?att=${att}" data-aspect-ratio="1.2" />`;

  // Scenario: the section the PDF is actually in is the nearest heading ABOVE it, not the
  // note's title - aiming at the title would land the reader at the top of a long note.
  test("finds the nearest heading above, not the first in the note", () => {
    const content = `# Title\n\nprose\n\n### Sources\n\n${tag("att-1")}\n\nmore`;
    expect(headingAboveEmbed(content, "plug-1", "att-1")).toEqual({ text: "Sources", level: 3 });
  });

  // Scenario: a note whose viewer has nothing above it has no landmark to offer, and the
  // caller has to fall back to navigating to the note itself.
  test("returns null when no heading precedes the embed", () => {
    expect(headingAboveEmbed(`${tag("att-1")}\n\n## After`, "plug-1", "att-1")).toBeNull();
  });

  // Scenario: two PDFs on one note sit in different sections - the heading returned must
  // be the one above THIS attachment's viewer.
  test("answers per attachment when a note holds several viewers", () => {
    const content = `## First\n\n${tag("att-1")}\n\n## Second\n\n${tag("att-2")}`;
    expect(headingAboveEmbed(content, "plug-1", "att-2").text).toBe("Second");
  });

  // Scenario: four spaces makes a line code, not a heading. A "#" inside a code block is
  // not a section and cannot be navigated to.
  test("does not mistake an indented code line for a heading", () => {
    const content = `    # not a heading\n\n${tag("att-1")}`;
    expect(headingAboveEmbed(content, "plug-1", "att-1")).toBeNull();
  });

  // Scenario: an embed this plugin never wrote, or a note that lost its tag.
  test("returns null when the embed is not in the note at all", () => {
    expect(headingAboveEmbed("# Title\n\nprose", "plug-1", "att-1")).toBeNull();
  });

  // Scenario: THE ONE THAT SENDS A DEEP LINK TO THE WRONG PLACE. An exported highlight's
  // heading is a link to this same plugin with this same att= - so a line-level test for
  // "the plugin and this PDF" matches it, and the first match wins. With a block above the
  // viewer, the anchor came from the heading above the BLOCK, so the reader was navigated
  // to wherever their sent blocks live rather than to the PDF.
  const exportBlockLine =
    '[<mark style="background-color:#F3DE6C;">Doc.pdf</mark>]' +
    "(plugin://plug-1?att=att-1&page=1&hl=h1&note=n1)";

  test("ignores an exported highlight's link when it sits above the viewer", () => {
    const content = [
      "# Sent highlights",
      "",
      exportBlockLine,
      "> the highlighted text",
      "",
      "## Where the PDF is",
      "",
      tag("att-1"),
    ].join("\n");

    expect(headingAboveEmbed(content, "plug-1", "att-1")).toEqual({
      text: "Where the PDF is",
      level: 2,
    });
  });

  // Scenario: same cause, worse effect. updateEmbedArgs found the block's line, looked for
  // the `data="..."` it has no reason to carry, and returned null - so the page and
  // highlight a clicked link carries never reached the viewer at all.
  test("still rewrites the viewer's own tag when a block precedes it", () => {
    const content = `${exportBlockLine}\n\n${tag("att-1")}`;
    const updated = updateEmbedArgs(content, "plug-1", "att-1", { page: 7, highlightId: "h9" });

    expect(updated).not.toBeNull();
    const lines = updated.split("\n");
    // The tag took the new args...
    expect(lines[lines.length - 1]).toContain("page=7");
    expect(lines[lines.length - 1]).toContain("hl=h9");
    // ...and the exported block's link is untouched, still pointing at its own highlight.
    expect(lines[0]).toBe(exportBlockLine);
  });

  // Scenario: a note holding only SENT BLOCKS for a PDF has no viewer in it. Counting a
  // block as one made "Annotate PDF" refuse to add the viewer it was asked for.
  test("does not count an exported block as a viewer already present", () => {
    expect(hasEmbedFor(`# Notes\n\n${exportBlockLine}`, "plug-1", "att-1")).toBe(false);
    expect(hasEmbedFor(`# Notes\n\n${exportBlockLine}`, "plug-1")).toBe(false);
    expect(hasEmbedFor(`# Notes\n\n${tag("att-1")}`, "plug-1", "att-1")).toBe(true);
  });
});
