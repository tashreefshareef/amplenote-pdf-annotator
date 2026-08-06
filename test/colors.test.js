/**
 * Tests for the highlight color table and its lookups.
 *
 * Why these matter: Phase 5 must color each exported deep-link with the Amplenote
 * cycle color matching its highlight, and Phase 4 must write the matching RGB into the
 * native PDF annotation. Both read from this one table, so a wrong entry silently
 * corrupts every export. These tests pin the spec §4 values in place.
 */
import { HIGHLIGHT_COLORS } from "../src/constants.js";
import { findColor, defaultColor, cycleIndexFor, rgbFor } from "../src/colors.js";

describe("highlight color table", () => {
  // Scenario: the spec requires at least 4 colors, and names exactly these 4.
  test("exposes exactly the four colors required by the spec", () => {
    expect(HIGHLIGHT_COLORS).toHaveLength(4);
    expect(HIGHLIGHT_COLORS.map((c) => c.hex)).toEqual([
      "#F3998C",
      "#F4DE6C",
      "#BBE077",
      "#84B6D9",
    ]);
  });

  // Scenario: each hex maps to the cycle index given in the bounty note. A wrong
  // index here means exported links render in the wrong color and fail acceptance.
  test("maps each hex to its Amplenote cycle-color index", () => {
    expect(cycleIndexFor("#F3998C")).toBe(12);
    expect(cycleIndexFor("#F4DE6C")).toBe(14);
    expect(cycleIndexFor("#BBE077")).toBe(15);
    expect(cycleIndexFor("#84B6D9")).toBe(18);
  });

  // Scenario: stored highlights may reference a color by id, while UI/PDF code deals
  // in hex. Both must resolve to the same entry.
  test("resolves a color by id or by hex, case-insensitively", () => {
    expect(findColor("yellow")).toBe(findColor("#F4DE6C"));
    expect(findColor("#f4de6c")).toBe(findColor("#F4DE6C"));
    expect(findColor("  BLUE  ")).toBe(findColor("#84B6D9"));
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
