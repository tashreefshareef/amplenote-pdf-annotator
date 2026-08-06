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
