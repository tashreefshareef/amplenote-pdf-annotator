/**
 * Mock Amplenote `app` object.
 *
 * This is the load-bearing piece of the whole test strategy. Plugin actions can't run
 * outside the Amplenote sandbox, so the only way to satisfy the T&C's test-coverage
 * requirement (spec §5.2) is to call them with a stand-in `app` and assert on what they
 * did to it.
 *
 * The mock keeps real in-memory note state rather than returning canned values, so
 * round-trip tests (write annotations → read them back) actually exercise the logic.
 *
 * Signatures VERIFIED against the app interface reference on 2026-08-06:
 * https://public.amplenote.com/C8TUXf394zsvrGn8NwXgoJ7f.md
 * See docs/api-notes.md for the full table and the corrections log.
 *
 * Two behaviors below are modeled deliberately because getting them wrong produces
 * bugs that only appear in the real sandbox:
 *   - `prompt` returns null on cancel (not undefined)
 *   - methods take a noteHandle object `{ uuid }`, never a bare uuid string
 *
 * There is intentionally NO `notify` method — it does not exist in the real API, and
 * a mock that provided one would let broken code pass tests and throw in production.
 */

// Under Jest's ESM mode the `jest` global is NOT injected the way it is in CJS —
// it has to be imported explicitly. Test files that call jest.* need this import too.
import { jest } from "@jest/globals";

/**
 * @param {object} options
 * @param {Array} options.notes       Seed notes: { uuid, name, content, attachments }
 * @param {Array} options.promptQueue Values returned by successive app.prompt() calls
 * @param {string} options.lightDarkMode "light" | "dark"
 */
export function createMockApp({ notes = [], promptQueue = [], lightDarkMode = "light" } = {}) {
  const noteMap = new Map(
    notes.map((n) => [
      n.uuid,
      { attachments: [], content: "", tags: [], ...n },
    ])
  );

  // Everything the actions did, so tests can assert on side effects.
  const calls = {
    alerts: [],
    prompts: [],
    createdNotes: [],
    insertedContent: [],
    attachedMedia: [],
    navigations: [],
  };

  /** Real API throws above this; modeled so persistence tests hit the same wall. */
  const MAX_CONTENT_CHARS = 100_000;

  const handleUUID = (noteHandle) =>
    typeof noteHandle === "string" ? noteHandle : noteHandle?.uuid;

  const pending = [...promptQueue];

  const app = {
    context: {
      noteUUID: notes[0]?.uuid ?? null,
      lightDarkMode,
      // An Array, not an object.
      embedArgs: [],
      // Does NOT re-render on its own — renderEmbed() must follow. Tests that assert
      // on the deep-link jump should check both were called, in order.
      updateEmbedArgs: jest.fn(async (...args) => {
        app.context.embedArgs = args;
      }),
      renderEmbed: jest.fn(async () => {}),
    },

    settings: {},

    alert: jest.fn(async (message) => {
      calls.alerts.push(message);
      return true;
    }),

    // Returns the next queued value; null once drained, which models the user
    // cancelling the dialog. The real API returns null on cancel, NOT undefined —
    // code doing `if (result === undefined)` would silently mishandle a cancel.
    prompt: jest.fn(async (message, options) => {
      calls.prompts.push({ message, options });
      return pending.length ? pending.shift() : null;
    }),

    getNoteAttachments: jest.fn(async (noteHandle) => {
      const note = noteMap.get(handleUUID(noteHandle));
      // Real API returns null for a nonexistent note, not an empty array.
      return note ? note.attachments : null;
    }),

    getAttachmentURL: jest.fn(async (attachmentUUID) => {
      return `https://attachments.amplenote.test/${attachmentUUID}`;
    }),

    getNoteContent: jest.fn(async (noteHandle) => {
      return noteMap.get(handleUUID(noteHandle))?.content ?? "";
    }),

    /**
     * Supports the `{ section: { heading: { text } } }` option, which replaces only
     * the content under that heading and leaves the heading itself in place. That is
     * how the managed annotation section gets updated without rewriting — and
     * potentially corrupting — the user's own note content.
     */
    replaceNoteContent: jest.fn(async (noteHandle, content, opts = {}) => {
      const uuid = handleUUID(noteHandle);
      const note = noteMap.get(uuid);
      if (!note) throw new Error(`replaceNoteContent: unknown note ${uuid}`);
      if (content.length > MAX_CONTENT_CHARS) {
        throw new Error("Content exceeds 100k characters");
      }

      const headingText = opts.section?.heading?.text;
      if (!headingText) {
        note.content = content;
        return true;
      }

      const lines = note.content.split("\n");
      const startIdx = lines.findIndex(
        (l) => /^#{1,6}\s/.test(l) && l.replace(/^#{1,6}\s+/, "").trim() === headingText
      );
      if (startIdx === -1) throw new Error(`replaceNoteContent: no section "${headingText}"`);

      // The section runs until the next heading of any level, or end of note.
      let endIdx = lines.length;
      for (let i = startIdx + 1; i < lines.length; i++) {
        if (/^#{1,6}\s/.test(lines[i])) { endIdx = i; break; }
      }

      note.content = [
        ...lines.slice(0, startIdx + 1),
        ...content.split("\n"),
        ...lines.slice(endIdx),
      ].join("\n");
      return true;
    }),

    // Returns nothing in the real API — do not write code that depends on a return.
    insertNoteContent: jest.fn(async (noteHandle, content, opts = {}) => {
      const uuid = handleUUID(noteHandle);
      const note = noteMap.get(uuid);
      if (!note) throw new Error(`insertNoteContent: unknown note ${uuid}`);
      if (content.length > MAX_CONTENT_CHARS) {
        throw new Error("Content exceeds 100k characters");
      }
      calls.insertedContent.push({ uuid, content, opts });
      note.content = opts.atEnd ? note.content + content : content + note.content;
    }),

    createNote: jest.fn(async (name, tags = [], options = {}) => {
      const uuid = `note-${noteMap.size + 1}`;
      noteMap.set(uuid, { uuid, name, tags, content: "", attachments: [] });
      calls.createdNotes.push({ uuid, name, tags, options });
      return uuid;
    }),

    // Accepts { uuid } or { name, tags }.
    findNote: jest.fn(async (noteHandle = {}) => {
      if (noteHandle.uuid) return noteMap.get(noteHandle.uuid) ?? null;
      for (const note of noteMap.values()) {
        if (note.name === noteHandle.name) return note;
      }
      return null;
    }),

    attachNoteMedia: jest.fn(async (noteHandle, dataURL) => {
      const uuid = handleUUID(noteHandle);
      calls.attachedMedia.push({ uuid, dataURL });
      return `https://images.amplenote.test/${uuid}/attachment`;
    }),

    navigate: jest.fn(async (url) => {
      calls.navigations.push(url);
    }),

    // Test-only escape hatches. Not part of the real app interface.
    _notes: noteMap,
    _calls: calls,
  };

  return app;
}

/** A small PDF attachment fixture. */
export function mockAttachment(overrides = {}) {
  return {
    uuid: "attach-1",
    name: "sample.pdf",
    type: "application/pdf",
    ...overrides,
  };
}
