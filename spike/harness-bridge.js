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

const note = { uuid: "note-1", content: "# My reading notes\n\nsome text the user wrote\n" };

const app = {
  context: { noteUUID: note.uuid, lightDarkMode: "light" },

  async getNoteContent() {
    return note.content;
  },

  async insertNoteContent(handle, content, opts = {}) {
    note.content = opts.atEnd ? note.content + content : content + note.content;
  },

  // Mirrors the real `{ section: { heading: { text } } }` behavior - replace only what
  // is under that heading, leave the heading and the user's other content alone.
  async replaceNoteContent(handle, content, opts = {}) {
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
};

window.__harness = { note, calls: [] };

window.callAmplenotePlugin = async function (payload) {
  const request = JSON.parse(payload);
  window.__harness.calls.push(request);

  if (request.action === "getPdfUrl") {
    return JSON.stringify({ url: "sample.pdf", name: "sample.pdf" });
  }
  return handleEmbedCallSerialized(app, payload);
};
