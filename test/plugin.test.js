/**
 * Tests for the plugin object's shape and its note options.
 *
 * Why these matter: a malformed plugin object fails silently in Amplenote — the option
 * just never appears in the ⋯ menu, with no error to debug. Asserting the shape here
 * catches that before it costs a paste-and-reload cycle.
 */
import plugin from "../src/plugin.js";
import { annotatePdf } from "../src/actions/annotate-pdf.js";
import { createMockApp } from "./helpers.js";

describe("plugin object", () => {
  // Scenario: Amplenote reads action names off the object's keys. The label is
  // user-visible and is what the spec names, so it is pinned.
  test("exposes an 'Annotate PDF' note option", () => {
    expect(typeof plugin.noteOption["Annotate PDF"]).toBe("function");
  });

  // Scenario: every action must be async — Amplenote awaits them, and a sync action
  // that returns a non-promise breaks error propagation.
  test("note options are async functions", () => {
    for (const fn of Object.values(plugin.noteOption)) {
      expect(fn.constructor.name).toBe("AsyncFunction");
    }
  });
});

describe("annotatePdf action", () => {
  // Scenario: Phase 0 milestone — the option fires and reaches the user.
  test("alerts the user and returns the note it was invoked on", async () => {
    const app = createMockApp({ notes: [{ uuid: "note-1", name: "Research" }] });

    const result = await annotatePdf(app, "note-1");

    expect(app.alert).toHaveBeenCalledTimes(1);
    expect(app._calls.alerts[0]).toContain("PDF Annotator");
    expect(result).toBe("note-1");
  });

  // Scenario: the action is reached through the plugin object exactly as Amplenote
  // would call it, confirming the delegation wiring is intact.
  test("is reachable through the plugin object's note option", async () => {
    const app = createMockApp({ notes: [{ uuid: "note-1", name: "Research" }] });

    await plugin.noteOption["Annotate PDF"](app, "note-1");

    expect(app.alert).toHaveBeenCalledTimes(1);
  });
});
