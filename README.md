# Amplenote PDF Annotator

An [Amplenote](https://www.amplenote.com) plugin for highlighting and annotating PDFs
attached to a note. Select text in a PDF, highlight it in one of four colors, attach a
note to any highlight, save everything as **native PDF annotations** inside the file,
and export highlights back into Amplenote notes with deep-links that jump to the exact
page and position.

Built for the Amplenote [plugin bounty program](https://www.amplenote.com/bounty_plugins).

> **Status: Phase 0.** Scaffold, build pipeline, and test harness are in place. The
> annotator itself starts at Phase 1. See
> [`amplenote-pdf-annotator-spec.md`](amplenote-pdf-annotator-spec.md) for the full plan.

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
| `npm run spike:annotations` | Generate `spike/out/annotated-sample.pdf` to verify native PDF annotations in external readers |

## Layout

```
src/               Plugin source, authored as ES modules
  plugin.js        The plugin object — kept thin, delegates to actions/
  actions/         One file per action; each takes `app` as its first parameter
  colors.js        Highlight color lookups
  constants.js     Color table, CDN versions, storage section name
esbuild.js         Build: src/ → dist/plugin.js
dist/plugin.js     Build output (committed)
test/              Jest suites
  helpers.js       Mock Amplenote `app` object
spike/             Throwaway research scripts, not part of the plugin
docs/api-notes.md  Verified Amplenote API signatures
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

## License

MIT — see [LICENSE](LICENSE).
