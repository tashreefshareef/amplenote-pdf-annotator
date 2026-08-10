/**
 * Color lookups. Pure functions, no `app` dependency - the easiest things in the
 * codebase to test, and Phase 5's export correctness depends entirely on them.
 */
import {
  HIGHLIGHT_COLORS,
  DEFAULT_COLOR_ID,
  DEFAULT_TOOLBAR_COLOR_IDS,
  TOOLBAR_COLOR_SLOTS,
} from "./constants.js";

/**
 * Normalize user/stored input: an id ("yellow"), a hex ("#F3DE6C"), or the label
 * ("Yellow"). Id and hex are what the code stores; the label is here because the color
 * setting is TYPED by a human (see parseToolbarColorIds) and "Yellow" is what they see on
 * the swatch's tooltip. A leading `#` is optional for the same reason.
 */
export function findColor(idOrHex) {
  if (!idOrHex) return null;
  const needle = String(idOrHex).trim().toLowerCase();
  const hex = needle.startsWith("#") ? needle : "#" + needle;
  return (
    HIGHLIGHT_COLORS.find(
      (c) => c.id === needle || c.hex.toLowerCase() === hex || c.label.toLowerCase() === needle
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

/**
 * Which colors get the toolbar's four circles, from the typed `Highlight colors` setting.
 *
 * Amplenote hands every setting back as a plain string and gives the user no picker, so
 * this has to forgive what someone will actually type: any separator that reads as one
 * (comma, semicolon, whitespace), ids or labels or hexes, any case, `#` optional.
 *
 * THE FALLBACK IS THE POINT. An empty, misspelled or nonsense setting returns the spec's
 * four rather than a shorter list or an empty one - a toolbar with no colors is a viewer
 * that cannot highlight anything, which is a far worse outcome than ignoring a typo. For
 * the same reason a partly-valid list keeps the names it recognized instead of throwing
 * the whole thing out: "yellow, purpel, blue" is three swatches, not zero.
 *
 * Duplicates collapse (two identical circles are a bug, not a choice) and anything past
 * TOOLBAR_COLOR_SLOTS is dropped - see that constant for why the cap is not negotiable.
 *
 * @returns {string[]} ids, in the order given, never empty.
 */
export function parseToolbarColorIds(setting) {
  const ids = [];
  for (const token of String(setting == null ? "" : setting).split(/[,;\s]+/)) {
    const color = findColor(token);
    if (color && ids.indexOf(color.id) === -1) ids.push(color.id);
    if (ids.length === TOOLBAR_COLOR_SLOTS) break;
  }
  return ids.length ? ids : DEFAULT_TOOLBAR_COLOR_IDS.slice();
}

/**
 * The full entries for those ids, for handing to the embed.
 *
 * Separate from parseToolbarColorIds so the ids can be stored/compared as data while the
 * viewer gets objects it can paint - and so a caller that already has ids (a test, a
 * future per-note override) does not have to re-parse a string to resolve them.
 */
export function toolbarColors(setting) {
  return parseToolbarColorIds(setting).map((id) => findColor(id));
}

/**
 * The color a fresh selection gets. The configured default when the user kept it, else
 * the first swatch in their bar - never a color with no circle, which would leave the
 * toolbar showing nothing as active and no way to get back to it.
 */
export function defaultColorIdFor(toolbarIds) {
  const ids = toolbarIds && toolbarIds.length ? toolbarIds : DEFAULT_TOOLBAR_COLOR_IDS;
  return ids.indexOf(DEFAULT_COLOR_ID) !== -1 ? DEFAULT_COLOR_ID : ids[0];
}
