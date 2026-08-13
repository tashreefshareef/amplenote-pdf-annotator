# Plugin note instructions cell

Copy the section below into the **instructions** row of the plugin note's metadata
table. It's the copy Amplenote shows in the Plugin Directory listing, so it's written for
someone who has never seen the plugin, not for a contributor — contributor-facing detail
stays in `README.md` and `docs/api-notes.md`.

The screenshots referenced below live in `docs/screenshots/` (captured from the live app
against `Maths-SQP.pdf`, a real sample exam paper). Amplenote's table cell takes uploaded
images, not markdown image links, so when you build the instructions cell in the note
editor: paste the text below, then drop each named file in at the point it's referenced.

---

## Instructions cell content (copy from here down)

Highlight and annotate PDFs attached to your notes, in four colors, with notes on any
highlight — and export it all back into Amplenote as linked, colored quotes.

### Open a PDF

Attach a PDF to a note, then run **Annotate PDF** from the note's **⋯** menu. Pick the
attachment if the note has more than one; the viewer opens beneath it.

(Prefer to place the viewer somewhere specific in the note instead of at the bottom? Type
`{PDF Annotator}` at that spot.)

### Highlight and annotate

- **Select text** in the PDF, then pick a color — either from the four circles in the
  toolbar, or the popover that appears right at your selection. That's it; no second
  step. A prompt to add a note appears immediately after.

  ![Toolbar with the four color circles and a live coral highlight](screenshots/01-toolbar-live-highlight.png)

- **Click an existing highlight** to recolor or remove it, or to add/edit/remove its
  note.

  ![Clicking a highlight opens recolor, Add note, copy, send-to-note and delete](screenshots/02-note-actions-popover.png)

- **Underline and strikethrough** are available too, next to the highlight shape —
  same colors, different mark.
- The panel below the toolbar lists every highlight and note in the PDF; click one to
  jump straight to it.

  ![The highlights panel expanded, listing every highlight and note by page](screenshots/03-highlights-panel.png)

### Get your highlights out

- **Download** (⋮ menu) saves the PDF with every highlight and note baked in as real,
  native PDF annotations — selectable and editable in Acrobat, Preview, or any other
  reader, not flattened images.
- **Copy** puts a highlight on your clipboard as a colored Amplenote quote, ready to
  paste anywhere.
- **Send to note** appends that same quote to the bottom of the current note.
- **Export all** (⋮ menu) builds a new "*\<PDF name\>* - Highlights" note containing
  every highlight, optionally filtered to one color.

  ![An exported "Maths-SQP - Highlights" note: five colored quote blocks, each with the PDF link, the highlighted text, and a note where one was added](screenshots/04-exported-highlights-note.png)

Each exported highlight is a colored link back to the PDF, the quoted text, and your
note if you left one — click the small icon at the end of the link (not the text itself
— that's how Amplenote links work) to jump back to the exact page and position.

### Pick your own four colors

By default the toolbar shows coral, yellow, green and blue. To use different ones: in
the viewer, **⋮ → Highlight colors…**, click up to four from the full palette, Save. All
eleven colors stay available for recoloring any highlight regardless of which four are
in the toolbar. Takes effect the next time you open the viewer.

![The Highlight colors picker: four slots above the full eleven-color palette](screenshots/05-highlight-colors-picker.png)

(The ⋮ menu these last two live in — Collapse, Download, Export, Highlight colors,
Remove viewer — for reference: `screenshots/06-viewer-menu-bonus.png`.)

### On mobile

Selecting, highlighting, notes, and export all work the same as desktop. Two things
don't, both because a plugin runs inside a sandboxed frame the phone app doesn't fully
delegate to: downloading the annotated PDF (the viewer will tell you if it can't, rather
than fail silently), and dragging to scroll — use the ▲/▼ buttons on the right edge
instead. A deep link still opens the right note and highlight; you scroll down to it
yourself.

**Fit the viewer to your phone.** An embed can't size itself — its box comes from a
single number stored in the note, the same on every device that note is opened on. On a
narrow screen, an extra button appears in the toolbar next to ⋮: **Fit to this screen**.

![Mobile toolbar in its default state, with the Fit to this screen (expand) icon next to ⋮](screenshots/07-mobile-fit-to-screen-default.jpg)

Tap it once and the box resizes to a comfortable height for *that* phone — the button
then becomes **Restore height** (a compress icon) so you can put it back to the plugin's
default from the same place:

![Mobile toolbar after fitting: the same button now shows Restore height, and the page renders noticeably taller](screenshots/08-mobile-restore-height-fitted.jpg)

It's a one-time action, not a live/automatic fit — tap it again any time your screen
changes (a different phone, a rotated tablet), and it stays exactly as you left it
otherwise, so a phone and a desktop with the same note open don't keep re-adjusting each
other's view. If a note was fitted to a phone and you later open it on a desktop, that
toolbar button won't be there (it's phone-only) — instead the ⋮ menu on desktop grows a
**Restore height** entry, so you can undo a phone-sized box from there too.

---

## Screenshot files

All captured against a real, uploaded exam paper (`Maths-SQP.pdf`) rather than a
generated sample, so highlighted phrases read naturally in context.

| File | Shows | Used for |
|---|---|---|
| `01-toolbar-live-highlight.png` | Toolbar + a live coral highlight | Highlight and annotate |
| `02-note-actions-popover.png` | Click-a-highlight popover: recolor, Add note, copy, send, delete | Highlight and annotate |
| `03-highlights-panel.png` | Expanded highlights/notes panel | Highlight and annotate |
| `04-exported-highlights-note.png` | Exported "*PDF name* - Highlights" note, 5 colored blocks | Get your highlights out |
| `05-highlight-colors-picker.png` | ⋮ → Highlight colors… popover | Pick your own four colors |
| `06-viewer-menu-bonus.png` | The ⋮ menu itself | Referenced, not required |
| `07-mobile-fit-to-screen-default.jpg` | Mobile toolbar, unfitted (Fit to this screen) | On mobile |
| `08-mobile-restore-height-fitted.jpg` | Mobile toolbar, fitted (Restore height), taller page | On mobile |

Two additional captures exist alongside the source files (in
`F:\Screenshots\2026-08\PDF Annotator screenshots\`, not copied into the repo) but aren't
used here: `extra-selection-color-popover-precursor.png` (the color popover before a
highlight is created — a valid but redundant moment right before shot 1) and
`extra-viewer-opened-unclear-state.png` (an ambiguous mid-testing capture). Keep or
discard those at your discretion.
