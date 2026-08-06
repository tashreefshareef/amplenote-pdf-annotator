/**
 * Highlight data model and validation.
 *
 * Storage shape, fixed by spec section 3:
 *   { id, page, color, rects: [{x, y, width, height}], quoteText, note }
 * Rects are PDF user-space units (origin bottom-left) so they survive zoom changes and
 * map cleanly to both PDF.js rendering and pdf-lib annotations (Phase 4). Never store
 * screen pixels - convert at render time only. See src/embed/geometry.js for that.
 */
import { findColor, defaultColor } from "./colors.js";

/** Rough uuid: good enough for a per-note id, no crypto dependency needed. */
export function generateHighlightId() {
  return "hl-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
}

/**
 * Build a validated highlight record from a raw selection capture.
 * Throws on structurally invalid input - callers are internal (the embed), not user
 * input, so failing loudly beats silently storing a corrupt record that breaks replay.
 */
export function createHighlight({ page, color, rects, quoteText, note = null, id = null }) {
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
