/**
 * Highlight data model and validation.
 *
 * Storage shape, fixed by spec section 3:
 *   { id, page, color, rects: [{x, y, width, height}], quoteText, note }
 * Rects are PDF user-space units (origin bottom-left) so they survive zoom changes and
 * map cleanly to both PDF.js rendering and pdf-lib annotations (Phase 4). Never store
 * screen pixels - convert at render time only. See src/embed/geometry.js for that.
 *
 * `style` was added afterwards, when underline and strikethrough joined highlight, and it
 * is the one field allowed to be MISSING: every mark written before it existed has no
 * style, and normalizeMarkStyle turns that into "highlight" so an old note replays exactly
 * as written. The name of the type stayed "highlight" throughout - renaming it to "mark"
 * would have touched the storage key, the plugin actions and the spec's own vocabulary to
 * buy nothing a reader of this comment does not already know.
 */
import { findColor, defaultColor } from "./colors.js";
import { MARK_STYLES, DEFAULT_MARK_STYLE } from "./constants.js";

/**
 * Resolve a stored or user-supplied shape to a known one.
 *
 * FORGIVING BY DESIGN, exactly like findColor's fallback: this runs on every load, over
 * JSON a user can hand-edit in their own note. An unrecognized shape must paint as a
 * highlight, not drop the mark - losing someone's annotation over a typo in a field they
 * did not know existed is the worse failure by a wide margin.
 */
export function normalizeMarkStyle(style) {
  if (!style) return DEFAULT_MARK_STYLE;
  const needle = String(style).trim().toLowerCase();
  const found = MARK_STYLES.find((s) => s.id === needle || s.label.toLowerCase() === needle);
  return found ? found.id : DEFAULT_MARK_STYLE;
}

/** Rough uuid: good enough for a per-note id, no crypto dependency needed. */
export function generateHighlightId() {
  return "hl-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/**
 * Build a validated highlight record from a raw selection capture.
 * Throws on structurally invalid input - callers are internal (the embed), not user
 * input, so failing loudly beats silently storing a corrupt record that breaks replay.
 */
export function createHighlight({
  page,
  color,
  rects,
  quoteText,
  note = null,
  id = null,
  style = null,
}) {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error(`createHighlight: page must be a positive integer, got ${page}`);
  }
  if (!Array.isArray(rects) || rects.length === 0) {
    throw new Error("createHighlight: rects must be a non-empty array");
  }
  for (const r of rects) {
    if (![r.x, r.y, r.width, r.height].every(Number.isFinite)) {
      throw new Error(`createHighlight: malformed rect ${JSON.stringify(r)}`);
    }
  }
  const resolvedColor = findColor(color) || defaultColor();

  return {
    id: id || generateHighlightId(),
    page,
    color: resolvedColor.id,
    // Always written out, even for a highlight, so the stored shape has one form rather
    // than two - a reader of the JSON never has to know that a missing field means
    // anything. Old records are upgraded on their first load, since every load goes
    // through here (see sanitizeHighlights in storage.js).
    style: normalizeMarkStyle(style),
    rects: rects.map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height })),
    quoteText: String(quoteText || ""),
    note: note ? String(note) : null,
  };
}

/** At most one note per highlight (spec section 4) - returns a new object, never mutates. */
export function withNote(highlight, noteText) {
  const trimmed = noteText == null ? null : String(noteText).trim();
  return { ...highlight, note: trimmed || null };
}

/** Returns a new object with a different color; invalid colors are rejected, not silently dropped. */
export function withColor(highlight, color) {
  const resolved = findColor(color);
  if (!resolved) throw new Error(`withColor: unknown color "${color}"`);
  return { ...highlight, color: resolved.id };
}

/**
 * Returns a new object with a different shape.
 *
 * THROWS on an unknown shape, unlike normalizeMarkStyle, which is the same split withColor
 * already makes and for the same reason: this is a deliberate edit arriving from the
 * viewer, so a shape we do not recognize means the two sides disagree about what exists.
 * Falling back to "highlight" there would silently turn "make this an underline" into
 * "make this a highlight" and look like the click did nothing. Normalizing is for reading
 * a note; rejecting is for writing one.
 */
export function withStyle(highlight, style) {
  const found = MARK_STYLES.find((s) => s.id === style);
  if (!found) throw new Error(`withStyle: unknown mark style "${style}"`);
  return { ...highlight, style: found.id };
}

export function highlightsForPage(highlights, page) {
  return (highlights || []).filter((h) => h.page === page);
}

export function removeHighlight(highlights, id) {
  return (highlights || []).filter((h) => h.id !== id);
}

export function findHighlight(highlights, id) {
  return (highlights || []).find((h) => h.id === id) || null;
}

/**
 * Replace one highlight by id, preserving array order. Returns the original array
 * (same reference) if the id isn't found, so callers can detect a no-op update.
 */
export function updateHighlight(highlights, id, updater) {
  let changed = false;
  const next = (highlights || []).map((h) => {
    if (h.id !== id) return h;
    changed = true;
    return updater(h);
  });
  return changed ? next : highlights;
}
