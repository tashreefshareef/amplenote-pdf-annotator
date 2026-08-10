# Amplenote PDF Annotator

An [Amplenote](https://www.amplenote.com) plugin for highlighting and annotating PDFs
attached to a note. Select text in a PDF, highlight it in one of four colors, attach a
note to any highlight, save everything as **native PDF annotations** inside the file,
and export highlights back into Amplenote notes with deep-links that jump to the exact
page and position.

Built for the Amplenote [plugin bounty program](https://www.amplenote.com/bounty_plugins).

> **Status: Phase 6 (polish), submission not yet started.** The PDF renders in the note
> with a working text layer, zoom and
> page navigation (Phase 1). Highlights work end to end — select text and pick one of
> four colors, either from the toolbar or from the popover that appears at the selection;
> recolor or remove an existing highlight by clicking it (Phase 2). Each highlight takes
> one plain-text note, offered as soon as it's created, and a panel lists every highlight
> and note with click-to-jump (Phase 3). A Download button bakes every highlight and note
> into the PDF as native annotations — real, selectable, reader-editable ones, not
> painted-on rectangles — and downloads the result (Phase 4). A highlight can be copied
> to the clipboard or sent to the note as a deep link whose text carries the highlight's
> own color, in Amplenote's own
> `<mark style="background-color:#HEX;">…<!-- {"backgroundCycleColor":"N"} --></mark>`
> markdown, and an Export button builds a
> "\<PDF name\> - Highlights" note from every highlight (optionally filtered by color),
> each block carrying a `plugin://` deep-link back to its exact page and position
> (Phase 5). Clicking one scrolls the note to the right PDF and flashes the highlight it
> meant, whether the link is on this note or another.
>
> Phase 6 is done bar the plugin note's own instructions cell: the viewer is usable on a
> phone (touch selection, fit-to-width, 40px targets, on-screen scroll controls — the
> Amplenote apps do render embeds, and a desktop-only one is close to unusable there),
> and pages render as they come into view rather than all at once. See
> [`amplenote-pdf-annotator-spec.md`](amplenote-pdf-annotator-spec.md) for the full plan
> and [`docs/bugs-found.md`](docs/bugs-found.md) for what went wrong on the way.

## Known limitations on mobile

Everything else works on a phone — selecting, highlighting, notes, the panel, export and
deep links. These two don't, and both are the same wall: an embed is a sandboxed
cross-origin iframe, so the host application decides what it may do.

**Downloading the annotated PDF is desktop-only.** The Download menu item builds the
annotated file correctly on every platform, but a `download` attribute needs the host app
to act on it and the mobile app doesn't; the Web Share API, which is how a phone would
normally save a file, isn't delegated to the embed either. Rather than appear to succeed
and produce nothing, the viewer says the PDF is ready and where to save it if no file
appeared — conditionally, because a touch device is not proof of failure: Amplenote in a
tablet browser downloads normally, and telling that user their download failed while it
sits in their downloads folder would be worse than saying nothing. Copy, Send to note and
Export all work fine on mobile — it's specifically the file that can't leave.

**Dragging doesn't scroll the viewer, and a deep link doesn't scroll the note to it.**
The host note claims the vertical drag inside the embed; `overscroll-behavior`, a
non-passive `touchmove` calling `preventDefault()`, and focus were each tried against it
on a real device and none of them moved it. Use the ▲/▼ controls on the right edge of the
viewer instead — hold one to keep scrolling. A deep link still opens the right note and
lands the viewer on the right highlight; you scroll down to the viewer yourself.

Both are recorded in [`docs/api-notes.md`](docs/api-notes.md) with what was tried, so they
aren't re-litigated as bugs. Worth knowing why a first-party viewer can do these things
and a plugin can't: it renders in the note's own document, with no boundary to arbitrate.
The sandbox that makes third-party plugins safe to install is the same thing that costs
them the gesture and the file.

## Why there's a build step

An Amplenote plugin is a single self-contained JavaScript expression pasted into one
code block inside a note — no imports, no npm at runtime, no bundler in the sandbox.
Maintaining that as one hand-edited file doesn't scale, so this repo authors normal ES
modules in `src/` and uses esbuild to collapse them into the single expression Amplenote
expects.

`dist/plugin.js` is the paste target. It's committed on purpose — the bounty terms
require the public repo to hold the code that actually runs.

## Getting started

```bash
npm install
```

Then:

```bash
npm run build
```

## Installing into Amplenote

### Recommended: sync from GitHub

Install the [Plugin Builder](https://github.com/alloy-org/plugin-builder) plugin, then
in this plugin's note add a line pointing at this repo and an H1 heading named exactly
`Code block` above the code block:

```
repo: tashreefshareef/amplenote-pdf-annotator/dist/plugin.js
```

Run **Plugin Builder: Refresh** from the note's ⋯ menu and it pulls the latest build
straight from GitHub.

`dist/plugin.js` is shaped to satisfy Plugin Builder's format contract — first line
containing `(() => {`, ending in `})();`, with a top-level `var plugin`. The build
asserts all three, because breaking them makes Plugin Builder silently fall back to its
own import-inliner and write a corrupted code block.

**Do not paste `alloy-org/plugin-builder`'s `build/compiled.js` into its own plugin note
as-is — it will not work.** Verified directly against live Amplenote on 2026-08-06, two
real bugs, both silent (no error, the "Refresh" action just never appears):

1. The raw file ends in `})();` with no `return plugin;` — Plugin Builder's own sync
   logic is what's supposed to append that before writing to a target note, but pasting
   the file manually into Plugin Builder's *own* note skips that step, so its code block
   evaluates to `undefined` instead of a plugin object.
2. Its `noteOption` entries are `{ check, run }` objects. Real Amplenote's dispatcher
   expects `noteOption[label]` to be a plain callable `async function(app, noteUUID)` —
   confirmed against `alloy-org/ai-plugin` (the production reference the bounty T&C
   itself cites), which uses only plain functions, never `{ check, run }`, for
   `noteOption`. An object value is silently skipped.

There's also a third, unrelated bug: `_syncUrlToNote`/`_isAbleToSync` call
`app.notes.find(uuid)` returning a Note object with `.content()` / `.replaceContent()` /
`.insertContent()` methods. That surface doesn't exist on the real `app` — the verified
methods are `app.getNoteContent({uuid})`, `app.replaceNoteContent({uuid}, content, opts)`,
`app.insertNoteContent({uuid}, content, opts)` (see `docs/api-notes.md`). Without a fix
here, "Refresh" would appear in the menu but throw the moment it's clicked.

A patched build with all three fixes is committed at
[`tools/plugin-builder-patched.js`](tools/plugin-builder-patched.js) — paste **that**
into Plugin Builder's own note instead of the upstream file. It changes nothing about
Plugin Builder's actual sync logic; every change is a compatibility shim between its
code and the real Amplenote API, isolated in clearly marked `PATCH (not upstream)`
comments so a future upstream update is easy to diff against.

### Fallback: paste by hand

Copy the entire contents of **`dist/plugin-paste.js`** (not `plugin.js` — that one omits
the final `return plugin` that Plugin Builder adds for you) into the note's code block.

Click **inside** the code block first, press Ctrl+A, and **confirm the selection covers
only the block** before pasting. Clicking slightly outside it makes Ctrl+A select the
whole note, and pasting then destroys the metadata table.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Bundle `src/` → `dist/plugin.js` (GitHub sync target) and `dist/plugin-paste.js` (manual paste) |
| `npm test` | Run the Jest suite |
| `npm run test:watch` | Jest in watch mode |
| `npm run harness` | Serve the viewer standalone at `http://localhost:4173`, no Amplenote needed |
| `npm run spike:annotations` | Generate `spike/out/annotated-sample.pdf` to verify native PDF annotations in external readers |

### The harness

`npm run harness` builds a page containing the exact HTML `renderEmbed` returns, wired to
the real plugin-side handler with an in-memory note standing in for Amplenote. Only two
things are faked: the PDF comes from a local sample instead of Amplenote's CORS proxy,
and the note lives in a JS object. The viewer, the geometry helpers, `embed-call.js`,
`storage.js` and `highlights.js` are all the real code, so a highlight created in the
harness travels the same path it will in the app — `window.__harness.note.content` shows
the markdown that would be written.

This exists because coordinate bugs are only visible against a real PDF.js text layer,
and the alternative loop (build, push, Plugin Builder refresh, reload the note) is far
too slow to debug geometry in. What it **cannot** tell you is whether Amplenote's sandbox
accepts the embed — only the live app answers that, so every phase still ends with a run
in real Amplenote.

`?seed=overlappingHighlights` pre-populates the note with two different-colored
highlights whose rects deliberately touch — the regression fixture for the darker-seam
class of bug (see `docs/bugs-found.md`). Reloading the harness normally resets its
in-memory note, so this seeds at page construction rather than via a runtime call a
reload would just discard.

## Layout

```
src/               Plugin source, authored as ES modules
  plugin.js        The plugin object — kept thin, delegates to actions/
  actions/         One file per action; each takes `app` as its first parameter
  embed-call.js    Everything the embed asks the plugin to do, incl. highlight CRUD
  embed/html.js    Builds the HTML `renderEmbed` returns
  embed/viewer.js  The viewer that runs inside the embed — DOM and PDF.js wiring only
  geometry.js      Pure rect arithmetic; also injected into the embed (see below)
  annotations.js   Writes highlights into a PDF as native annotations (pdf-lib);
                    also injected into the embed, same pattern as geometry.js
  export.js        Builds the exported markdown block and plugin:// deep link for a
                    highlight; also injected into the embed, same pattern as geometry.js
  highlights.js    Highlight data model and validation
  storage.js       The managed note section highlights are persisted into
  colors.js        Highlight color lookups
  constants.js     Color table, CDN versions, storage section name
esbuild.js         Build: src/ → dist/plugin.js
dist/plugin.js     Build output (committed)
test/              Jest suites
  helpers.js       Mock Amplenote `app` object
spike/             Throwaway research scripts and the dev harness
docs/api-notes.md   Verified Amplenote API signatures and platform quirks
docs/bugs-found.md  General web-platform bugs (PDF.js, CSS, DOM) and their fixes -
                     written to transfer to other projects, not just this one
```

## Testing

Plugin actions can't run outside the Amplenote sandbox, so the suite calls them with a
mock `app` object (`test/helpers.js`) that keeps real in-memory note state — write-then-
read-back tests exercise the actual logic rather than asserting on canned values.

This has a design consequence worth knowing before contributing: **action logic must
live in pure, importable functions in `src/` that take `app` as a parameter.** Anything
written inline in the plugin object, or welded into an embed HTML string, is unreachable
from tests. The bounty terms require test coverage of every action that modifies note
data, so untestable code is a compliance problem and not only a style one.

The embed pushes that further. `src/embed/viewer.js` cannot import anything — it is
serialized with `.toString()` and injected into the page — so any logic worth testing
would normally have to be transcribed into it by hand. Instead `src/geometry.js`,
`src/annotations.js` and `src/export.js` each wrap their functions in a factory
(`createGeometry()`, `createAnnotationWriter()`, `createExportBuilder()`) that closes
over nothing, and `src/embed/html.js` injects *that function's source* alongside the
viewer. The embed reads the results off `window.__PDFA_GEOM`, `window.__PDFA_ANNOTATIONS`
and `window.__PDFA_EXPORT`, so the rect arithmetic, the pdf-lib annotation writing and the
exported-markdown building the browser runs are byte-for-byte the code Jest covers —
`annotations.js`'s tests run against the real `pdf-lib` npm package, not a mock of one.
Two rules follow for anything built this way: nothing inside the factory may reference
module scope, and the serialized function may not contain a literal closing `script` tag
anywhere in its source, comments included. There are tests enforcing both, for every
factory that uses this pattern.

```bash
npm test
```

Note: Jest runs in ESM mode, so `jest.fn()` and friends need an explicit
`import { jest } from "@jest/globals"` — the global isn't injected.

## Contributing

1. Edit `src/`, not `dist/`.
2. Add a test for anything that touches note data, with a comment stating the scenario
   it validates.
3. Run `npm test` and `npm run build` before committing, and commit the rebuilt
   `dist/plugin.js` alongside your source change.
4. If you confirm and fix a real bug (not a design decision, an actual "this was
   wrong") in web-platform code — PDF.js, CSS, the DOM, browser selection APIs, the
   markdown-as-storage format — add an entry to
   [`docs/bugs-found.md`](docs/bugs-found.md): symptom, cause, fix, and the general
   lesson stripped of anything Amplenote-specific. Amplenote-platform-only findings
   (API signatures, sandbox quirks) go in `docs/api-notes.md` instead.

## License

MIT — see [LICENSE](LICENSE).
