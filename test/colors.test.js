/**
 * Tests for the highlight color table and its lookups.
 *
 * Why these matter: Phase 5 must color each exported deep-link with the Amplenote
 * cycle color matching its highlight, and Phase 4 must write the matching RGB into the
 * native PDF annotation. Both read from this one table, so a wrong entry silently
 * corrupts every export. These tests pin the spec §4 values in place.
 */
import {
  HIGHLIGHT_COLORS,
  DEFAULT_TOOLBAR_COLOR_IDS,
  TOOLBAR_COLOR_SLOTS,
} from "../src/constants.js";
import {
  findColor,
  defaultColor,
  cycleIndexFor,
  rgbFor,
  parseToolbarColorIds,
  defaultColorIdFor,
} from "../src/colors.js";

describe("highlight color table", () => {
  // Scenario: the catalog is Amplenote's own mid-tone band, indices 12-22, read out of
  // its stylesheet. The count and the endpoints are a tripwire: a silent edit here
  // changes what every exported link and every downloaded PDF is colored with.
  test("exposes Amplenote's eleven mid-tone colors, in palette order", () => {
    expect(HIGHLIGHT_COLORS).toHaveLength(11);
    expect(HIGHLIGHT_COLORS.map((c) => c.cycleIndex)).toEqual([
      12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
    ]);
  });

  // Scenario: the spec's four must still be the ones a fresh install shows, and they must
  // be real catalog entries - a default naming a color that does not exist is a toolbar
  // that renders short.
  test("defaults to the four colors the spec names", () => {
    expect(DEFAULT_TOOLBAR_COLOR_IDS).toEqual(["coral", "yellow", "green", "blue"]);
    expect(DEFAULT_TOOLBAR_COLOR_IDS).toHaveLength(TOOLBAR_COLOR_SLOTS);
    for (const id of DEFAULT_TOOLBAR_COLOR_IDS) expect(findColor(id)).not.toBeNull();
  });

  // Scenario: each hex maps to its Amplenote palette index. Coral and yellow are the
  // corrected values - `#F3998C`/`#F4DE6C` came from the bounty note's table and are one
  // digit off Amplenote's real `--palette-color-12`/`-14`, so an export using them asked
  // for a color Amplenote does not have.
  test("maps each hex to its Amplenote cycle-color index", () => {
    expect(cycleIndexFor("#F2998C")).toBe(12);
    expect(cycleIndexFor("#F3DE6C")).toBe(14);
    expect(cycleIndexFor("#BBE077")).toBe(15);
    expect(cycleIndexFor("#84B6D9")).toBe(18);
    expect(cycleIndexFor("#F3998C")).toBeNull();
    expect(cycleIndexFor("#F4DE6C")).toBeNull();
  });

  // Scenario: stored highlights reference a color by id, UI/PDF code deals in hex, and
  // the color SETTING is typed by a human who sees labels on the swatches. All three
  // spellings have to land on the same entry.
  test("resolves a color by id, hex, or label, case-insensitively", () => {
    expect(findColor("yellow")).toBe(findColor("#F3DE6C"));
    expect(findColor("#f3de6c")).toBe(findColor("#F3DE6C"));
    expect(findColor("  BLUE  ")).toBe(findColor("#84B6D9"));
    expect(findColor("Purple")).toBe(findColor("#B49EE2"));
    expect(findColor("84B6D9")).toBe(findColor("#84B6D9"));
  });

  // Scenario: an unknown or missing color must not silently resolve to a real color —
  // callers need to distinguish "no color given" from "this specific color".
  test("returns null for unknown, empty, or missing colors", () => {
    expect(findColor("magenta")).toBeNull();
    expect(findColor("")).toBeNull();
    expect(findColor(undefined)).toBeNull();
    expect(cycleIndexFor("#000000")).toBeNull();
    expect(rgbFor("nope")).toBeNull();
  });

  // Scenario: the default must always exist, or the toolbar has no initial state.
  test("default color is one of the four", () => {
    expect(HIGHLIGHT_COLORS).toContain(defaultColor());
  });

  // Scenario: the setting is typed, with no picker and no validation, so the parser has
  // to survive whatever arrives - and above all must never hand back an empty list, which
  // would be a viewer that cannot highlight anything.
  test("parses a typed color setting, forgiving separators, case and spelling", () => {
    expect(parseToolbarColorIds("purple, pink, mint, sky")).toEqual([
      "purple",
      "pink",
      "mint",
      "sky",
    ]);
    expect(parseToolbarColorIds("Purple; #E893BD  green")).toEqual(["purple", "pink", "green"]);
    // A typo costs that one name, not the whole list.
    expect(parseToolbarColorIds("yellow, purpel, blue")).toEqual(["yellow", "blue"]);
    // Duplicates collapse - two identical circles are a bug, not a choice.
    expect(parseToolbarColorIds("blue, #84B6D9, Blue")).toEqual(["blue"]);
    // Past the slot count is dropped rather than wrapping the toolbar onto a second row.
    expect(parseToolbarColorIds("coral peach yellow green mint sky")).toHaveLength(
      TOOLBAR_COLOR_SLOTS
    );
  });

  test("falls back to the spec's four for anything unusable", () => {
    for (const input of ["", "   ", null, undefined, "magenta, chartreuse", 42]) {
      expect(parseToolbarColorIds(input)).toEqual(DEFAULT_TOOLBAR_COLOR_IDS);
    }
    // A copy, not the constant itself - a caller mutating its toolbar list must not
    // rewrite the default for every other viewer in the process.
    expect(parseToolbarColorIds("")).not.toBe(DEFAULT_TOOLBAR_COLOR_IDS);
  });

  // Scenario: the active color must be one the user can actually see in the bar,
  // otherwise the toolbar shows nothing pressed and there is no way to select it again.
  test("active color falls back to the first swatch when the default is not in the bar", () => {
    expect(defaultColorIdFor(["coral", "yellow", "green", "blue"])).toBe("yellow");
    expect(defaultColorIdFor(["purple", "pink"])).toBe("purple");
    expect(defaultColorIdFor([])).toBe("yellow");
  });

  // Scenario: pdf-lib takes 0..1 floats, not 0..255. Passing 0..255 produces
  // annotations that are silently black or invisible in external readers.
  test("rgb triples are normalized to 0..1 and match their hex", () => {
    for (const color of HIGHLIGHT_COLORS) {
      expect(color.rgb).toHaveLength(3);
      for (const channel of color.rgb) {
        expect(channel).toBeGreaterThanOrEqual(0);
        expect(channel).toBeLessThanOrEqual(1);
      }
      // Recompute from the hex and confirm the precomputed values agree.
      const expected = [1, 3, 5].map(
        (i) => Math.round((parseInt(color.hex.slice(i, i + 2), 16) / 255) * 1000) / 1000
      );
      expect(color.rgb).toEqual(expected);
    }
  });
});
