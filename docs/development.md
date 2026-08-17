# Development

How to build, test and extend the plugin. For installing and using it, see the
[README](../README.md).

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

Once per clone, enable the repo's git hooks — `core.hooksPath` is local config, so it
doesn't come with the checkout:

```bash
git config core.hooksPath .githooks
```

That activates `.githooks/commit-msg`, which strips any `Co-Authored-By:` trailer naming
Claude or Anthropic. GitHub reads that trailer as co-authorship and lists the co-author on
the repo; this project credits one person.

## Commands

| Command | What it does |
|---|---|
| `npm run build` | Bundle `src/` → `dist/plugin.js` (GitHub sync target) and `dist/plugin-paste.js` (manual paste) |
| `npm test` | Run the Jest suite |
| `npm run test:watch` | Jest in watch mode |
| `npm run harness` | Serve the viewer standalone at `http://localhost:4173`, no Amplenote needed (`PORT=4174` to move it; `-- --colors "purple, pink, mint, sky"` to try a toolbar palette) |
| `npm run spike:annotations` | Generate `spike/out/annotated-sample.pdf` to verify native PDF annotations in external readers |

## The harness

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
class of bug (see [`bugs-found.md`](bugs-found.md)). Reloading the harness normally resets
its in-memory note, so this seeds at page construction rather than via a runtime call a
reload would just discard.

## Plugin Builder compatibility

`dist/plugin.js` is shaped to satisfy Plugin Builder's format contract — first line
containing `(() => {`, ending in `})();`, with a top-level `var plugin`. The build
asserts all three, because breaking them makes Plugin Builder silently fall back to its
own import-inliner and write a corrupted code block.

**Pasting `alloy-org/plugin-builder`'s `build/compiled.js` into its own plugin note did
not work here** — no error, the "Refresh" action simply never appeared. That symptom was
real and is what `tools/plugin-builder-patched.js` came out of, on 2026-08-06.

**Two of the three explanations written down at the time were wrong, and are retracted
below.** Checked against Amplenote's own reference on 2026-08-15:

- ~~`noteOption` entries must be plain callables; a `{ check, run }` object is silently
  skipped.~~ **Wrong.** The actions reference states that "each action can optionally
  define a `check` function that will be called before displaying the plugin to the
  user." `check` is a documented, supported shape.
- ~~`app.notes.find(uuid)` returning a Note with `.content()` / `.replaceContent()` /
  `.insertContent()` "doesn't exist on the real `app`".~~ **Wrong.** `app.notes` is
  documented as "an alternative — and simpler — way to interact with specific notes",
  `app.notes.find` is listed, and the Note interface has `note.content`,
  `note.replaceContent` and `note.insertContent`. Plugin Builder was using a real API.

The remaining explanation is the plausible one and has **not** been re-tested in
isolation: the compiled file ends in `})();` with no `return plugin;`. Plugin Builder's
own sync logic appends that before writing to a target note, and pasting the file by hand
into Plugin Builder's *own* note skips that step, so the code block evaluates to
`undefined` rather than a plugin object. That would produce exactly the observed silence.

**So treat the patched build as: it works, and one of the three reasons for it stands
up.** The other two patches changed working code to different working code. They are left
in place because that combination is what was actually tested against the live app, not
because the originals were broken — reverting them is safe cleanup for someone with a
test note to hand, not something to do blind before a release.

The wider lesson is in [`api-notes.md`](api-notes.md): a real symptom will happily accept
a wrong explanation, and three fixes shipped together means none of them was tested. Fix
one thing, confirm, then fix the next.

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
