/**
 * Color lookups. Pure functions, no `app` dependency - the easiest things in the
 * codebase to test, and Phase 5's export correctness depends entirely on them.
 */
import { HIGHLIGHT_COLORS, DEFAULT_COLOR_ID } from "./constants.js";

/** Normalize user/stored input: accepts an id ("yellow") or a hex ("#F4DE6C"). */
export function findColor(idOrHex) {
  if (!idOrHex) return null;
  const needle = String(idOrHex).trim().toLowerCase();
  return (
    HIGHLIGHT_COLORS.find(
      (c) => c.id === needle || c.hex.toLowerCase() === needle
    ) || null
  );
}

/** The color used when none is specified. Never returns null. */
export function defaultColor() {
  return findColor(DEFAULT_COLOR_ID);
}

/**
 * Amplenote cycle-color index for a highlight color, for coloring the exported
 * deep-link (spec section 4). Returns null for unknown colors so callers can decide whether
 * to fall back or surface an error, rather than silently exporting a wrong color.
 */
export function cycleIndexFor(idOrHex) {
  const color = findColor(idOrHex);
  return color ? color.cycleIndex : null;
}

/** 0..1 RGB triple for pdf-lib annotation dictionaries (Phase 4). */
export function rgbFor(idOrHex) {
  const color = findColor(idOrHex);
  return color ? color.rgb : null;
}
