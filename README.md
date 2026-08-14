# Amplenote PDF Annotator

An [Amplenote](https://www.amplenote.com) plugin for highlighting and annotating PDFs
attached to a note. Select text in a PDF, highlight it in one of four colors, attach a
note to any highlight, save everything as **native PDF annotations** inside the file,
and export highlights back into Amplenote notes with deep-links that jump to the exact
page and position.

Built for the Amplenote [plugin bounty program](https://www.amplenote.com/bounty_plugins).
Feature-complete and in polish; not yet submitted.

![The viewer open on a PDF inside a note, with the highlight toolbar above a live selection](docs/screenshots/01-toolbar-live-highlight.png)

## What it does

- **Renders the PDF in the note** — a real text layer, zoom, and page navigation, with
  pages drawn as they scroll into view rather than all at once.
- **Highlights in four colors** — select text and pick a color from the toolbar or from
  the popover that appears at the selection; click an existing highlight to recolor or
  remove it.
- **Takes a note on any highlight** — one plain-text note, offered as soon as the
  highlight is created. A panel lists every highlight and note, with click-to-jump.
- **Downloads with native annotations** — the Download button bakes every highlight and
  note into the PDF as real, selectable, reader-editable annotations, not painted-on
  rectangles.
- **Copies a highlight into the note** — to the clipboard or straight into the note, as a
  deep link whose text carries the highlight's own color, in Amplenote's own
  `<mark style="background-color:#HEX;">…<!-- {"backgroundCycleColor":"N"} --></mark>`
  markdown.
- **Exports every highlight to its own note** — a "\<PDF name\> - Highlights" note,
  optionally filtered by color, each block carrying a `plugin://` deep link back to its
  exact page and position. Clicking one scrolls to the right PDF and flashes the
  highlight it meant, whether the link is on this note or another.
- **Works on a phone** — touch selection, fit-to-width, 40px targets, and on-screen
  scroll controls, with three exceptions [noted below](#known-limitations-on-mobile).

| The highlights panel | An exported highlights note |
|---|---|
| ![Panel listing every highlight and its note, with click-to-jump](docs/screenshots/03-highlights-panel.png) | ![Exported note, each block deep-linking back to its page](docs/screenshots/04-exported-highlights-note.png) |

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

**One caveat.** Plugin Builder's own published `build/compiled.js` does not work when
pasted into its own plugin note against real Amplenote — three separate incompatibilities,
all of them silent. Paste
[`tools/plugin-builder-patched.js`](tools/plugin-builder-patched.js) into Plugin Builder's
note instead; it fixes all three and changes nothing about the sync logic. See
[what was wrong and why](docs/development.md#plugin-builder-compatibility).

### Fallback: paste by hand

Copy the entire contents of **`dist/plugin-paste.js`** (not `plugin.js` — that one omits
the final `return plugin` that Plugin Builder adds for you) into the note's code block.

Click **inside** the code block first, press Ctrl+A, and **confirm the selection covers
only the block** before pasting. Clicking slightly outside it makes Ctrl+A select the
whole note, and pasting then destroys the metadata table.

## Choosing your four highlight colors

The toolbar carries four color circles. Which four is up to you.

**In the viewer:** ⋮ → **Highlight colors…**. The popover shows your four slots above all
eleven Amplenote colors; click to fill a slot, click a slot to empty it, Save. The toolbar
repaints immediately and the choice follows you to every PDF and every device.

![The highlight colors picker, four slots above the eleven Amplenote colors](docs/screenshots/05-highlight-colors-picker.png)

That requires one row in the plugin note's metadata table, which is what gives the plugin
somewhere to store it:

| setting | Highlight colors |
|---|---|

**Or by hand:** the same value is editable as text in Account Settings → Plugins → PDF
Annotator, since the picker writes exactly what you would have typed:

```
purple, pink, mint, sky
```

Names, labels or hex codes all work (`blue`, `Blue`, `#84B6D9`), in any order — the first
one becomes the color a fresh selection gets. Leave it empty and you get the four the spec
names: coral, yellow, green, blue.

The full eleven are `coral peach yellow green mint sky blue purple orchid pink grey` —
Amplenote's own mid-tone palette (indices 12–22; see `docs/api-notes.md`). **All eleven
stay available** on any existing highlight through the recolor popover, whatever your four
are. The setting decides what's one click away, never what's possible, so changing it can
never strand a highlight you already made.

Two things worth knowing:

- **It applies when a viewer next opens.** An embed already on screen keeps the colors it
  was rendered with — collapse and re-expand it to pick up a change.
- **Four is the cap.** Extra names are ignored rather than honoured; a fifth circle wraps
  the toolbar onto a second row on a phone.

## Formulas in a quoted PDF

Copy, Send to note and Export take their text from the PDF's text layer, and a PDF stores
no formulas — only glyphs at coordinates. A stacked fraction is a numerator and a
denominator drawn one above the other, separated by a **vector rule that is not text at
all**, so there is no `/` anywhere to extract. Superscripts are separate runs at a raised
baseline, frequently stored in a different order from the one they're read in.

So `[−1/3, 1/3]` is quoted as `[− 1 3 , 1 3]`, and `2x²` as `2x 2`. The glyphs are kept
apart on purpose: joined flat, 1 over 3 becomes the number 13, and a quote that is wrong
while looking right is worse than one that is visibly incomplete.

What is guaranteed is that the prose around the notation survives — a quoted question
keeps one line per line of the original instead of breaking apart at every fraction.
Recovering the notation itself would need OCR against the rendered page, which a sandboxed
embed can't do.

## Known limitations on mobile

Everything else works on a phone — selecting, highlighting, notes, the panel, export and
deep links. These three don't, and all of them are the same wall: an embed is a sandboxed
cross-origin iframe, so the host application decides what it may do.

![The viewer fitted to a phone screen](docs/screenshots/07-mobile-fit-to-screen-default.jpg)

**Downloading the annotated PDF is desktop-only.** The Download menu item builds the
annotated file correctly on every platform, but a `download` attribute needs the host app
to act on it and the mobile app doesn't; the Web Share API, which is how a phone would
normally save a file, isn't delegated to the embed either. Rather than appear to succeed
and produce nothing, the viewer says the PDF is ready and where to save it if no file
appeared — conditionally, because a touch device is not proof of failure: Amplenote in a
tablet browser downloads normally, and telling that user their download failed while it
sits in their downloads folder would be worse than saying nothing. Copy, Send to note and
Export all work fine on mobile — it's specifically the file that can't leave.

**Dragging doesn't scroll the viewer.** The host note claims the vertical drag inside the
embed; `overscroll-behavior`, a non-passive `touchmove` calling `preventDefault()`, and
focus were each tried against it on a real device and none of them moved it. Use the ▲/▼
controls on the right edge of the viewer instead — hold one to keep scrolling.

**A deep link opens the right note and the viewer lands on the right highlight — you
scroll down to it yourself.** Nothing inside the embed can move the mobile app's note, and
after a genuinely thorough attempt at a fix from outside the iframe — navigating with a
`…/notes/UUID#Section_name` fragment aimed at the heading above the embed, the platform's
own documented way to scroll a note to a section — it turned out not to be usable on
Android either: confirmed correct anchors, verified against Amplenote's own
`getNoteSections`, still failed to resolve, landing at the bottom of the note instead of
the top. Reapplying the exact code that once appeared to work and retesting it fresh
reproduced the same failure, which rules out a code regression — the mechanism itself
doesn't reliably work on the mobile client. See docs/api-notes.md finding 13 and
docs/bugs-found.md for the full account.

All three are recorded in [`docs/api-notes.md`](docs/api-notes.md) with
what was tried, so they aren't re-litigated as bugs. Worth knowing why a first-party
viewer can do these things and a plugin can't: it renders in the note's own document,
with no boundary to arbitrate. The sandbox that makes third-party plugins safe to install
is the same thing that costs them the gesture, the file, and the auto-scroll.

## Development

```bash
npm install
npm run build
```

[`docs/development.md`](docs/development.md) covers the rest: why there's a build step,
the standalone viewer harness, the repo layout, the testing approach and the constraints
the embed places on it, and the Plugin Builder compatibility fixes.

## Contributing

The full plan lives in
[`amplenote-pdf-annotator-spec.md`](amplenote-pdf-annotator-spec.md), the plugin note's
own instructions cell in [`docs/plugin-instructions.md`](docs/plugin-instructions.md), and
an account of what went wrong along the way in
[`docs/bugs-found.md`](docs/bugs-found.md).

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
