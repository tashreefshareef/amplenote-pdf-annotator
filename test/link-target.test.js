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
    // Aimed at the section the PDF sits in - see the section-anchor tests below.
    expect(app._calls.navigations).toEqual([`https://www.amplenote.com/notes/${NOTE}#Notes`]);
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

/**
 * `app.navigate` is the only scroll lever that lives outside the embed iframe, and the
 * app interface reference documents `.../notes/UUID#Section_name` as a target. It matters
 * on mobile specifically: nothing inside the iframe can move the mobile app's note (focus,
 * scrollIntoView and a non-passive touchmove all lost - docs/api-notes.md #13), so a deep
 * link there opens the right note and leaves the reader to find the PDF by hand. Aiming at
 * the heading above the embed is the closest addressable landmark.
 */
describe("aiming the navigation at the PDF's own section", () => {
  // Scenario: the note's heading above the embed becomes the navigation anchor, so the
  // reader lands at the PDF's section rather than at the top of a long note.
  test("navigates to the heading immediately above the embed", async () => {
    const app = createMockApp({
      notes: [
        {
          uuid: NOTE,
          name: "Research",
          content: `# Top\n\nprose\n\n## Reading list\n\n${embedTag(`att=${ATT}`)}\n\nmore`,
          attachments: [mockAttachment({ uuid: ATT })],
        },
      ],
    });

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    // The NEAREST heading above, not the first one in the note.
    expect(app._calls.navigations).toEqual([
      `https://www.amplenote.com/notes/${NOTE}#Reading_list`,
    ]);
  });

  // Scenario: a heading BELOW the embed is not the section the PDF is in - aiming at it
  // would scroll the reader past the very thing they clicked to see.
  test("ignores headings that come after the embed", async () => {
    const app = createMockApp({
      notes: [
        {
          uuid: NOTE,
          name: "Research",
          content: `${embedTag(`att=${ATT}`)}\n\n## Highlights\n\n> quote`,
          attachments: [mockAttachment({ uuid: ATT })],
        },
      ],
    });

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([`https://www.amplenote.com/notes/${NOTE}`]);
  });

  // Scenario: what getNoteSections reports wins over anything derived here, and is used
  // verbatim. Confirmed live that the field carrying it is `anchor` and that `href` comes
  // back null - preferring href meant the reported value was never read at all.
  test("uses the anchor reported by getNoteSections, verbatim", async () => {
    const app = appWithEmbed();
    app.getNoteSections = async () => [
      { heading: { anchor: "section-42-opaque", href: null, level: 1, text: "Notes" } },
    ];

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([
      `https://www.amplenote.com/notes/${NOTE}#section-42-opaque`,
    ]);
  });

  // Scenario: THE REPORTED BUG, as ground truth from a live note. A heading with an
  // apostrophe or a comma anchors with that punctuation INTACT; percent-encoding it names
  // no section, and the app answers an unresolvable fragment by dropping the reader at the
  // bottom of the note - past the PDF they clicked to reach.
  test("keeps punctuation raw in the anchor, never percent-encoded", async () => {
    const heading = "The ISP's plain DNS beat every encrypted resolver, tested";
    const app = createMockApp({
      notes: [
        {
          uuid: NOTE,
          name: "Research",
          content: `## ${heading}\n\n${embedTag(`att=${ATT}`)}`,
          attachments: [mockAttachment({ uuid: ATT })],
        },
      ],
    });

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([
      `https://www.amplenote.com/notes/${NOTE}` +
        "#The_ISP's_plain_DNS_beat_every_encrypted_resolver,_tested",
    ]);
  });

  // Scenario: the heading is read out of RAW MARKDOWN while getNoteSections reports the
  // RENDERED text, so a formatted heading would never match its own section - and would
  // fall through to a derived anchor carrying literal ** characters.
  test("matches a formatted heading to its section by rendered text", async () => {
    const app = createMockApp({
      notes: [
        {
          uuid: NOTE,
          name: "Research",
          content: `## **Paper** and [Smith](https://x.test)\n\n${embedTag(`att=${ATT}`)}`,
          attachments: [mockAttachment({ uuid: ATT })],
        },
      ],
    });
    app.getNoteSections = async () => [
      {
        heading: { anchor: "Paper_and_Smith", href: null, level: 2, text: "Paper and Smith" },
      },
    ];

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([
      `https://www.amplenote.com/notes/${NOTE}#Paper_and_Smith`,
    ]);
  });

  // Scenario: a host that reports no sections at all still gets an anchor, derived by the
  // measured rule - spaces to underscores, nothing else touched.
  test("derives an anchor by the measured rule when the host reports no sections", async () => {
    const app = appWithEmbed();
    delete app.getNoteSections;

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([`https://www.amplenote.com/notes/${NOTE}#Notes`]);
  });

  // Scenario: landing on the right note is the promise this action makes. An anchor the
  // app rejects (navigate is documented to return false on failure) must cost the scroll,
  // never the navigation.
  test("retries without the anchor when the app rejects it", async () => {
    const app = appWithEmbed();
    const anchored = `https://www.amplenote.com/notes/${NOTE}#Notes`;
    app.navigate.mockImplementation(async (url) => {
      app._calls.navigations.push(url);
      return url !== anchored;
    });

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([anchored, `https://www.amplenote.com/notes/${NOTE}`]);
  });

  // Scenario: every punctuated heading anchors with its punctuation intact - the rule
  // measured off the live app, applied to the characters most likely to appear in a real
  // heading. An earlier build percent-encoded these and landed the reader at the bottom
  // of the note.
  test("anchors punctuated headings without transforming the punctuation", async () => {
    const cases = [
      ["Chapter 3: Results", "Chapter_3:_Results"],
      ["Q&A", "Q&A"],
      ["Notes - draft", "Notes_-_draft"],
      ["Why I'm still using it; briefly", "Why_I'm_still_using_it;_briefly"],
    ];

    for (const [text, anchor] of cases) {
      const app = createMockApp({
        notes: [
          {
            uuid: NOTE,
            name: "Research",
            content: `## ${text}\n\n${embedTag(`att=${ATT}`)}`,
            attachments: [mockAttachment({ uuid: ATT })],
          },
        ],
      });

      await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

      expect(app._calls.navigations).toEqual([
        `https://www.amplenote.com/notes/${NOTE}#${anchor}`,
      ]);
    }
  });

  // Scenario: the host's reported anchor is authoritative however exotic the heading.
  test("anchors an exotic heading from what the host reports", async () => {
    const app = createMockApp({
      notes: [
        {
          uuid: NOTE,
          name: "Research",
          content: `## Chapter 3: Results\n\n${embedTag(`att=${ATT}`)}`,
          attachments: [mockAttachment({ uuid: ATT })],
        },
      ],
    });

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    expect(app._calls.navigations).toEqual([
      `https://www.amplenote.com/notes/${NOTE}#Chapter_3:_Results`,
    ]);
  });

  // Scenario: a section lookup that throws is not a reason to strand the reader.
  test("navigates to the note when the section lookup throws", async () => {
    const app = appWithEmbed();
    app.getNoteSections = async () => {
      throw new Error("sections unavailable");
    };

    await call(app, `att=${ATT}&hl=hl-9&note=${NOTE}`);

    // The derived fallback still applies - the throw only costs the reported href.
    expect(app._calls.navigations).toEqual([`https://www.amplenote.com/notes/${NOTE}#Notes`]);
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
