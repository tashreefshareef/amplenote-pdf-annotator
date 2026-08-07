/**
 * Tests for embed argument encoding — the deep-link schema.
 *
 * Why these matter: Phase 5's headline requirement is that a link exported into a note
 * reopens the annotator at the exact page and position. That link is nothing but these
 * functions' output, so a round-trip bug here silently produces links that open the
 * wrong place — a visible acceptance failure. Pinned in Phase 1 per spec §7.3.
 */
import {
  parseEmbedArgs,
  buildEmbedArgs,
  buildEmbedMarkup,
  hasEmbedFor,
  removeEmbedMarkup,
} from "../src/embed-args.js";

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
    });
  });

  // Scenario: an embed inserted with no parameters at all. Must not throw — a throwing
  // renderEmbed shows an empty box with nothing to diagnose.
  test("returns all-null for undefined, empty, or non-string input", () => {
    const empty = { attachmentUUID: null, page: null, x: null, y: null, highlightId: null };
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
    expect(parseEmbedArgs(buildEmbedArgs(original))).toEqual(original);
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
