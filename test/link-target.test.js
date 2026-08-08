/**
 * Tests for the `linkTarget` action - Amplenote's dedicated handler for a clicked
 * `plugin://` link (an exported highlight's deep link), distinct from `renderEmbed`
 * (which only ever handles the `<object data="plugin://...">` embed tag).
 *
 * This is the note-modifying action side of Phase 5's deep-link requirement (spec
 * §5.2): rewriting the target note's embed tag before navigating, so the user lands on
 * the exact highlight, not just the right note.
 */
import { linkTarget } from "../src/actions/link-target.js";
import { createMockApp, mockAttachment } from "./helpers.js";

const PLUGIN = "plug-uuid";
const NOTE = "note-1";
const ATT = "attach-1";

const embedTag = (query) => `<object data="plugin://${PLUGIN}?${query}" data-aspect-ratio="1.2" />`;

const appWithEmbed = (query = `att=${ATT}`) =>
  createMockApp({
    notes: [
      {
        uuid: NOTE,
        name: "Research",
        content: `# Notes\n\n${embedTag(query)}\n\nmore`,
        attachments: [mockAttachment({ uuid: ATT })],
      },
    ],
  });

const call = (app, query) => {
  app.context.pluginUUID = PLUGIN;
  return linkTarget(app, query);
};

describe("linkTarget", () => {
  // Scenario: THE core round-trip - clicking an exported highlight's link must rewrite
  // the target note's embed to carry the clicked page/highlight, then navigate there, so
  // the embed opens directly at the highlight rather than wherever it last was.
  test("rewrites the target note's embed args and navigates to it", async () => {
    const app = appWithEmbed();

    await call(app, `att=${ATT}&page=3&hl=hl-9&note=${NOTE}`);

    const content = app._notes.get(NOTE).content;
    expect(content).toContain(`att=${ATT}&page=3&hl=hl-9`);
    expect(app._calls.navigations).toEqual([`https://www.amplenote.com/notes/${NOTE}`]);
  });

  // Scenario: an embed tag that already carries a different page/highlight (from an
  // earlier deep-link visit) must be overwritten, not accumulated alongside the new one.
  test("overwrites a previously-set page/highlight rather than duplicating it", async () => {
    const app = appWithEmbed(`att=${ATT}&page=1&hl=hl-old`);

    await call(app, `att=${ATT}&page=5&hl=hl-new&note=${NOTE}`);

    const content = app._notes.get(NOTE).content;
    expect(content).toContain("page=5&hl=hl-new");
    expect(content).not.toContain("hl-old");
  });

  // Scenario: a note can hold more than one PDF's embed - rewriting the clicked
  // highlight's target must never touch a different attachment's embed on the same note.
  test("leaves a different attachment's embed on the same note untouched", async () => {
    const otherAtt = "attach-other";
    const app = createMockApp({
      notes: [
        {
          uuid: NOTE,
          name: "Research",
          content: `${embedTag(`att=${ATT}`)}\n\n${embedTag(`att=${otherAtt}`)}`,
          attachments: [mockAttachment({ uuid: ATT }), mockAttachment({ uuid: otherAtt })],
        },
      ],
    });

    await call(app, `att=${ATT}&page=3&hl=hl-9&note=${NOTE}`);

    expect(app._notes.get(NOTE).content).toContain(embedTag(`att=${otherAtt}`));
  });

  // Scenario: THE hazard this whole action exists to guard against - a link exported
  // before the source note's uuid was tracked at all. Must explain itself, not silently
  // do nothing (which would look identical to a dead/broken link with no way to diagnose
  // it) or throw (which the embed bridge can't surface meaningfully either).
  test("alerts rather than silently failing when the link carries no source note", async () => {
    const app = appWithEmbed();

    await call(app, `att=${ATT}&page=3&hl=hl-9`);

    expect(app._calls.alerts).toHaveLength(1);
    expect(app._calls.alerts[0]).toMatch(/note/i);
    expect(app._calls.navigations).toEqual([]);
  });

  // Scenario: best-effort rewrite - a note that was hand-edited (or a link exported for
  // an attachment whose embed was since removed) must not block navigation entirely.
  // Landing on the right note without the exact scroll position beats landing nowhere.
  test("still navigates when the target note has no matching embed to rewrite", async () => {
    const app = createMockApp({ notes: [{ uuid: NOTE, name: "Research", content: "# Notes\nno embed here" }] });

    await call(app, `att=${ATT}&page=3&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([`https://www.amplenote.com/notes/${NOTE}`]);
  });
});
