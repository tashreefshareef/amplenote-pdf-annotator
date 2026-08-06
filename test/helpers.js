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
 * IMPORTANT: method names and signatures here are provisional. They must be checked
 * against the app interface reference before Phase 1 builds on them:
 * https://public.amplenote.com/C8TUXf394zsvrGn8NwXgoJ7f.md
 * Any correction goes here first, then to docs/api-notes.md.
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
    notifications: [],
    createdNotes: [],
    insertedContent: [],
    attachedMedia: [],
    navigations: [],
  };

  const pending = [...promptQueue];

  const app = {
    context: {
      noteUUID: notes[0]?.uuid ?? null,
      lightDarkMode,
      embedArgs: {},
      updateEmbedArgs: jest.fn(async (args) => {
        app.context.embedArgs = { ...app.context.embedArgs, ...args };
      }),
      renderEmbed: jest.fn(async () => {}),
    },

    settings: {},

    alert: jest.fn(async (message) => {
      calls.alerts.push(message);
      return true;
    }),

    // Returns the next queued value; undefined once the queue is drained, which
    // models the user cancelling the dialog.
    prompt: jest.fn(async (message, options) => {
      calls.prompts.push({ message, options });
      return pending.length ? pending.shift() : undefined;
    }),

    notify: jest.fn(async (message) => {
      calls.notifications.push(message);
    }),

    getNoteAttachments: jest.fn(async (noteUUID) => {
      return noteMap.get(noteUUID)?.attachments ?? [];
    }),

    getNoteContent: jest.fn(async ({ uuid }) => {
      return noteMap.get(uuid)?.content ?? "";
    }),

    replaceNoteContent: jest.fn(async ({ uuid }, content) => {
      const note = noteMap.get(uuid);
      if (!note) throw new Error(`replaceNoteContent: unknown note ${uuid}`);
      note.content = content;
      return true;
    }),

    insertNoteContent: jest.fn(async ({ uuid }, content, opts = {}) => {
      const note = noteMap.get(uuid);
      if (!note) throw new Error(`insertNoteContent: unknown note ${uuid}`);
      calls.insertedContent.push({ uuid, content, opts });
      note.content = opts.atEnd ? note.content + content : content + note.content;
      return true;
    }),

    createNote: jest.fn(async (name, tags = []) => {
      const uuid = `note-${noteMap.size + 1}`;
      noteMap.set(uuid, { uuid, name, tags, content: "", attachments: [] });
      calls.createdNotes.push({ uuid, name, tags });
      return uuid;
    }),

    findNote: jest.fn(async ({ name }) => {
      for (const note of noteMap.values()) {
        if (note.name === name) return note;
      }
      return null;
    }),

    attachNoteMedia: jest.fn(async ({ uuid }, dataURL) => {
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
