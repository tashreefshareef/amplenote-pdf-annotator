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

describe("a link clicked on the note the PDF already lives on", () => {
  // Scenario: reported live, and the sharpest clue in the whole investigation - a deep
  // link works from an EXPORTED note but does nothing from a "Send to note" block at the
  // bottom of the PDF's OWN note.
  //
  // Cross-note works because navigating loads the note fresh, so the embed mounts and its
  // boot code runs. Same-note has no navigation at all: app.navigate to the note you are
  // already on is a no-op. And rewriting the note's content underneath a mounted embed
  // does NOT re-mount it - confirmed live - so nothing inside the embed ever re-reads the
  // new args, and the code that scrolls the note to the PDF never runs.
  //
  // The only lever left is to make the embed genuinely go away and come back: write the
  // note without its <object> line, then write it back carrying the new args.
  test("takes the embed out and puts it back, to force a real re-mount", async () => {
    const app = appWithEmbed();
    app.context.noteUUID = NOTE; // the user is already looking at this note

    await call(app, `att=${ATT}&note=${NOTE}&hl=hl-9`);

    const writes = app.replaceNoteContent.mock.calls.map((c) => c[1]);
    expect(writes.length).toBeGreaterThanOrEqual(2);
    // One write in the middle with no viewer in it at all - that is what destroys the
    // DOM node. A single write with different args was already proven insufficient.
    expect(writes.some((w) => !w.includes("plugin://"))).toBe(true);
    // ...and the LAST write must restore it, carrying the clicked highlight.
    const final = writes[writes.length - 1];
    expect(final).toContain("plugin://");
    expect(final).toContain("hl=hl-9");
    // The user's own content is never collateral.
    expect(final).toContain("# Notes");
    expect(final).toContain("more");
  });

  // Scenario: the note must never be left without its viewer. The removal write is only a
  // means to an end, so a failure anywhere after it still has to put the embed back -
  // losing a viewer would be a far worse outcome than a link that failed to scroll.
  test("restores the viewer even if the intermediate write fails", async () => {
    const app = appWithEmbed();
    app.context.noteUUID = NOTE;
    let call_n = 0;
    const real = app.replaceNoteContent.getMockImplementation();
    app.replaceNoteContent.mockImplementation(async (handle, content, opts) => {
      call_n += 1;
      if (call_n === 1) throw new Error("write rejected");
      return real(handle, content, opts);
    });

    await call(app, `att=${ATT}&note=${NOTE}&hl=hl-9`);

    expect(app._notes.get(NOTE).content).toContain("plugin://");
    expect(app._notes.get(NOTE).content).toContain("hl=hl-9");
  });

  // Scenario: navigating to a DIFFERENT note already works - it mounts the embed fresh -
  // so it must not pay for the remount dance. An extra write and a full PDF reload on the
  // path that was never broken would be a regression.
  test("does not disturb the embed when navigating to another note", async () => {
    const app = appWithEmbed();
    app.context.noteUUID = "some-other-note";

    await call(app, `att=${ATT}&note=${NOTE}&hl=hl-9`);

    const writes = app.replaceNoteContent.mock.calls.map((c) => c[1]);
    expect(writes).toHaveLength(1);
    expect(writes[0]).toContain("hl=hl-9");
  });
});
