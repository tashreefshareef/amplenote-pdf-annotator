/**
 * The harness's stand-in for Amplenote, bundled into the page by spike/harness.mjs.
 *
 * It wires the REAL plugin-side handler to an in-memory note, so highlight creation,
 * recolor, removal and reload all go through embed-call -> storage -> highlights exactly
 * as they will in the live app. Only `getPdfUrl` is faked, because the CORS proxy it
 * normally returns is Amplenote-only.
 *
 * `window.__harness` is exposed so a browser session can read the note's markdown back
 * and see what was actually persisted.
 */
import { handleEmbedCallSerialized } from "../src/embed-call.js";
import { STORAGE_SECTION_HEADING } from "../src/constants.js";

/**
 * `?seed=overlappingHighlights` pre-populates the note with two DIFFERENT-colored
 * highlights on adjacent lines whose rects deliberately touch by a few PDF units -
 * a regression fixture for the class of bug fixed in commits 9a36261 and the one after
 * it (a darker seam where two highlights meet, first within one highlight's own line
 * rects, then between two separate highlights). Reloading the harness page resets this
 * in-memory note entirely, so seeding at construction time - rather than via a runtime
 * addHighlight call that a reload would immediately discard - is what makes the fixture
 * survive a hard reload during manual verification.
 */
const SEED_FIXTURES = {
  overlappingHighlights: () => {
    const payload = {
      "attach-1": [
        { id: "hl-seed-a", page: 1, color: "blue", rects: [{ x: 72, y: 650, width: 260, height: 14 }], quoteText: "line A", note: null },
        { id: "hl-seed-b", page: 1, color: "green", rects: [{ x: 72, y: 641, width: 260, height: 14 }], quoteText: "line B", note: null },
      ],
    };
    return `# My reading notes\n\nsome text the user wrote\n\n# ${STORAGE_SECTION_HEADING}\n\n\`\`\`json\n${JSON.stringify(payload)}\n\`\`\`\n`;
  },
};

const seedName = new URLSearchParams(location.search).get("seed");
const seedFixture = seedName && SEED_FIXTURES[seedName];
const note = {
  uuid: "note-1",
  content: seedFixture ? seedFixture() : "# My reading notes\n\nsome text the user wrote\n",
};

const app = {
  context: { noteUUID: note.uuid, lightDarkMode: "light" },

  async getNoteContent() {
    return note.content;
  },

  async insertNoteContent(handle, content, opts = {}) {
    note.content = opts.atEnd ? note.content + content : content + note.content;
  },

  // Mirrors the real `{ section: { heading: { text } } }` behavior - replace only what
  // is under that heading, leave the heading and the user's other content alone. Also
  // doubles as the plain full-content replace exportAll uses against its own destination
  // note (a separate in-memory note, routed by handle.uuid).
  async replaceNoteContent(handle, content, opts = {}) {
    const target = Object.values(window.__harness.exportNotes).find((n) => n.uuid === handle.uuid);
    if (target) {
      target.content = content;
      return true;
    }
    const headingText = opts.section && opts.section.heading && opts.section.heading.text;
    if (!headingText) {
      note.content = content;
      return true;
    }
    const lines = note.content.split("\n");
    const start = lines.findIndex(
      (l) => /^#{1,6}\s/.test(l) && l.replace(/^#{1,6}\s+/, "").trim() === headingText
    );
    if (start === -1) throw new Error(`no section "${headingText}"`);
    let end = lines.length;
    for (let i = start + 1; i < lines.length; i++) {
      if (/^#{1,6}\s/.test(lines[i])) {
        end = i;
        break;
      }
    }
    note.content = [
      ...lines.slice(0, start + 1),
      ...content.split("\n"),
      ...lines.slice(end),
    ].join("\n");
    return true;
  },

  async getNoteAttachments() {
    return [{ uuid: "attach-1", name: "sample.pdf", type: "application/pdf" }];
  },

  async getAttachmentURL() {
    return "sample.pdf";
  },

  // Minimal find-or-create stand-in for exportAll's destination note, keyed by name in
  // the same in-memory store as the main note.
  async findNote({ name }) {
    return window.__harness.exportNotes[name] ? { uuid: window.__harness.exportNotes[name].uuid } : null;
  },

  async createNote(name) {
    const uuid = `note-export-${Object.keys(window.__harness.exportNotes).length + 1}`;
    window.__harness.exportNotes[name] = { uuid, name, content: "" };
    return uuid;
  },
};

window.__harness = { note, calls: [], exportNotes: {} };

window.callAmplenotePlugin = async function (payload) {
  const request = JSON.parse(payload);
  window.__harness.calls.push(request);

  if (request.action === "getPdfUrl") {
    return JSON.stringify({ url: "sample.pdf", name: "sample.pdf" });
  }
  return handleEmbedCallSerialized(app, payload);
};
