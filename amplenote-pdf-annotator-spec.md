# Amplenote PDF Annotator Plugin — Build Spec for Claude Code

## 0. What we're building

A plugin for **Amplenote** (amplenote.com — a notes/tasks app) that lets a user
open a PDF attached to a note, highlight text, attach notes to highlights, and
export those highlights back into Amplenote notes. It is a paid bounty (listed at
$2,000 — note the terms say the amount is "subject to change at any time").
Reference implementations (Obsidian, for UX inspiration only — different platform):
- https://github.com/elias-sundqvist/obsidian-annotator
- Obsidian **PDF++** plugin (larger scope, good prior art)

The official requirements live at:
**https://public.amplenote.com/kZybE6RuRWAtsAo5E5ea8jr8** — treat that note as the
source of truth. The requirements are reproduced in section 4 below, but if there's
any conflict, the live note wins. Questions go to Lucian at Amplenote.

**Shipping the code is only half the job.** The bounty program has its own binding
terms — a mandatory test suite, a public repo, an open-source license, and two
videos — any of which can block payment on their own:
**https://www.amplenote.com/bounty_plugins/terms_conditions**
These are captured in §5. Read §5 before planning your time; they are not optional
polish and they are not all back-loaded to the end.

---

## 1. Read these docs FIRST (before writing any code)

Amplenote's plugin model is unusual. Do not assume it works like a normal web app
or a normal browser extension. Fetch and read these before starting:

1. **Plugin dev guide:** https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
2. **App interface (LLM markdown version — use this one):**
   https://public.amplenote.com/C8TUXf394zsvrGn8NwXgoJ7f.md
3. **Actions reference** (renderEmbed, onEmbedCall, noteOption, etc):
   https://www.amplenote.com/help/developing_amplenote_plugins/actions
4. **Markdown reference / cycle colors** (needed for highlight color mapping and
   the "double-quoted block" export format):
   https://www.amplenote.com/help/plugin_api_markdown_reference_parse_markdown

When you need an exact method signature, fetch doc #2 and search it. Do not
guess signatures.

---

## 2. Critical platform constraints (read carefully — these shape the whole design)

- **A plugin IS a note.** The plugin is defined inside a single Amplenote note that
  contains (a) a metadata **table** (name, description, icon, settings, instructions)
  and (b) a single **code block** holding a JS object literal. That object's keys are
  "actions" (e.g. `noteOption`, `renderEmbed`, `onEmbedCall`, `appOption`).
- **Sandboxed JS. No npm, no Node, no bundler, no imports.** The code block is one
  self-contained object. Third-party libraries (PDF.js, pdf-lib) must be loaded at
  runtime from a CDN **inside the embed HTML**, not `import`ed into the plugin object.
- **The UI surface is `renderEmbed`.** `renderEmbed(app, ...args)` returns an HTML
  string that Amplenote renders in an iframe-like embed inside the note. This is where
  the entire PDF viewer + annotation UI lives. All the PDF.js/canvas/DOM code runs in
  that returned HTML (via `<script>` tags), NOT in the plugin object's action functions.
- **Embed ↔ plugin communication:**
  - Inside the embed HTML, call `window.callAmplenotePlugin(arg)` to invoke the
    plugin's `onEmbedCall(app, arg)` function. This is how the embed asks the plugin
    to do privileged things (read attachments, write to notes, persist data).
  - `app.context.updateEmbedArgs(...)` + `app.context.renderEmbed()` re-render the embed
    with new args. Use for deep-linking (jump to a page/coordinate).
  - `app.context.embedArgs` (in `onEmbedCall`) holds the current embed args.
- **Persistence.** There's no plugin database. Persist annotation data by writing it
  into the note (a hidden/managed section, or note content) via the app interface, and/or
  bake it into the PDF file itself (native PDF annotations — a hard requirement, see §4).
- **No localStorage/sessionStorage** in the embed. Keep working state in JS memory and
  persist through the app interface.
- **Attachments.** Read the note's PDF via the attachment methods on the app interface
  (look up `getNoteAttachments`, and the method that returns the attachment's URL/bytes,
  e.g. `getAttachmentURL` — VERIFY exact names in doc #2). Fetch the bytes, hand them to
  PDF.js as a `Uint8Array`/`ArrayBuffer`.
- **Writing the annotated PDF back / uploading media:** look up `attachNoteMedia`
  (takes a data URL) to upload the re-serialized annotated PDF back to the note.

---

## 3. Tech stack (all CDN-loaded inside the embed)

- **PDF.js** (Mozilla) — render PDF pages to canvas AND render the **text layer**
  (required: the spec needs real text selection, not region boxes). Load `pdf.min.js`
  and set `workerSrc` to the matching CDN worker. Use the text layer's DOM spans to
  capture selected text + its geometry (page index + rects in PDF coordinate space).
- **pdf-lib** — write **native PDF annotations** (highlight annotations + text/popup
  notes) into the file and re-serialize for download. NOTE: pdf-lib's high-level API
  is limited for annotations; you will likely construct annotation dictionaries at a
  lower level. Investigate early — this is the single riskiest dependency (see §7).
- Pin exact versions of both from a CDN (cdnjs / jsDelivr / unpkg). Record the versions
  in a comment so future runs are reproducible.

Coordinate model to standardize on from day one: store every highlight as
`{ id, page, color, rects: [{x, y, width, height}], quoteText, note }` where rects are
in **PDF user-space units** (origin bottom-left) so they survive zoom changes and map
cleanly to both PDF.js rendering and pdf-lib annotations. Convert to/from screen pixels
at render time only.

---

## 4. Requirements (from the July 2026 bounty note — source of truth is the live note)

### Highlights
- Let the user **select text** from a PDF and apply a highlight to it.
- Offer **at least 4 highlight colors**. Use these exact colors — they map to specific
  Amplenote cycle-color indices (needed so the export link color matches, see below):

  | Color | Hex | Amplenote cycle index |
  |-------|-----|-----------------------|
  | Coral/red | `#F3998C` | 12 |
  | Yellow | `#F4DE6C` | 14 |
  | Green | `#BBE077` | 15 |
  | Blue | `#84B6D9` | 18 |

  (These come from the Amplenote cycle-color palette — verify indices against the
  markdown reference doc #4 before relying on them for the link coloring.)
- **Toolbar UX (explicit requirement):** the 4 colors must sit as **top-level buttons in
  the plugin's main toolbar**. Switching color must be a **single click** — no submenu,
  no sidebar, no extra menu step.
- Offer the option to **remove** any highlight.
- Offer the option to **edit the color** of an existing highlight.

### Notes
- After a highlight exists, let the user **add a plain-text note** to it.
- A highlight has **at most one** note.
- The offer to create a note should appear **immediately after** creating a new
  highlight, and also for existing highlights that have no note yet.
- Let the user **edit** and **remove** a note from a highlight.

### Exporting notes & highlights
- Save highlights and notes as **native PDF annotations inside the file itself**, and
  offer a way to **export/download** the PDF with those annotations baked in.
- Let the user **copy a highlight** and **paste it into a real Amplenote** at an
  arbitrary location.
- Let the user **export all highlights into an auto-created destination note**, with the
  ability to **filter by highlight color**.
- On selecting/creating a highlight, a button sends that highlight to its correct
  Amplenote (probably appended at the bottom of the note).
- Every exported highlight must **contain at least these elements**:
  - The **name of the PDF**
  - The **highlighted text**
  - The **user's note, if any**
  - These must be **clearly distinguishable from each other** — especially the highlight
    text vs. the note.
- Every exported highlight must also:
  - Include a **link back to the PDF** that, when clicked in Amplenote, **opens the
    plugin and scrolls to that highlight** (correct page + exact coordinates).
  - Have that link **colored** in the Amplenote cycle color matching the highlight's
    PDF color (per the table above).
  - Be formatted as a **double-quoted block** with this structure:

    ```
    <Link back to the PDF>          ← heading line (the colored deep-link)
    > the highlighted text          ← the quote itself
    the user's "note" (if any)      ← plain text below the quote
    ```

    Confirm the exact Amplenote blockquote markdown ("double-quoted block") in doc #4;
    match the layout in the requirements note precisely.

---

## 5. Program requirements (bounty T&C — payment-blocking, not optional)

Source: https://www.amplenote.com/bounty_plugins/terms_conditions
These are separate from §4. Every one of them can independently cost you the bounty.

### 5.1 Do these BEFORE writing code

- **Register intent.** The bounty is **first come, first serve** — no exclusivity. If
  another author publishes a quality version first, they get paid and you get nothing.
  For a 3–4 week build that's a live risk. Email `support@amplenote.com` describing the
  plugin and your expected publish date; if the claim is credible they annotate the
  plugin's description to deter duplicates. Costs one email. Do it day one.
- **Confirm payment eligibility.** Eligibility is limited to countries the USA can
  legally send payments to, and payout is **PayPal only** unless arranged in advance.
  Confirm your country and PayPal availability with `support@amplenote.com` in the same
  email — before investing weeks of work.
- **Create the public GitHub repo.** Required (see 5.3), and you're pledging to keep it
  alive for 3 years, so use an account you'll still control.

### 5.2 Test suite (MANDATORY — the most commonly missed requirement)

> "For plugins that perform non-trivial modifications to a user's notes, the plugin
> creator must test the functionality of the plugin. The plugin creator has to include a
> file or directory in their repository that contains a test suite covering at least the
> 'actions' of the plugins that modify note data. Tests should be explicit about what
> scenarios they validate (for example by using comments inside the file). The Amplenote
> team reserves the right to refuse rewarding plugin work if the test coverage is not
> deemed sufficient."

This plugin **definitely** qualifies as non-trivial note modification: it creates
destination notes, appends highlights to notes, writes a managed persistence section,
and uploads media via `attachNoteMedia`.

- Reference example cited by Amplenote: https://github.com/alloy-org/ai-plugin/tree/main/test
- That repo's stack (confirmed from its `package.json`) is the pattern to mirror:
  **esbuild** (`node esbuild.js`) bundles `src/` into a single output file, and
  **Jest + jsdom** (`NODE_OPTIONS='--experimental-vm-modules' jest`) tests the actions
  against a **mocked `app` object**. This also solves the "one self-contained code block"
  constraint from §2 without hand-editing a 3,000-line file.
- **Write tests per phase, not at the end.** Retrofitting a suite onto a finished
  sandboxed plugin is painful, and the Phase 5 export actions are precisely what the
  T&C wants covered.
- Every test must state, in a comment, what scenario it validates.

Minimum actions to cover: attachment selection, highlight persistence load/save
(including idempotency and not corrupting manual user edits), copy-highlight,
send-to-note, export-all-with-color-filter, and the exported block's markdown shape.

### 5.3 Repository, license, publication

- **Public GitHub repo** holding the most recent code, **linked from the Amplenote
  plugin page**. You are responsible for keeping repo and plugin page in sync
  permanently — not just at submission.
- **MIT** or another open-source license permitting free modification and distribution.
  Add a `LICENSE` file.
- The plugin **must not charge users** for its functionality.
- Published to the Amplenote Plugin Directory — completion + publication is what makes
  you eligible at all.

### 5.4 Two required videos (1–5 minutes each)

Both are hard requirements and neither is quick to produce — budget real time.

1. **Usage video** — explains the main features and how to use them. Must be made
   public (self-hosted or uploaded to Amplenote's YouTube channel by arrangement), and
   **the plugin page must link to it**.
2. **Code overview video** — walks through the repo structure, documents the plugin's
   main behavior, and explains how others can contribute.

Share both with `hello@amplenote.com`.

### 5.5 Submission and payment mechanics

- **Bounty claim:** email `support@amplenote.com` with a link to the published plugin.
- **Invoice:** email `hello@amplenote.com` with an invoice for the bounty amount
  including a valid PayPal address. Payment lands within 30 days of publication, *after*
  the invoice arrives — so send it promptly.
- You are responsible for PayPal fees and for any taxes.
- (Note: general questions go to Lucian, but the formal claim/invoice route is the two
  addresses above.)

### 5.6 Obligations that continue AFTER payout

- **Bug fixes:** bugs raised in the plugin page's comments must be addressed **within a
  couple of weeks**. Quality standards are enforced post-publication too.
- **3-year persistence pledge:** do not delete your Amplenote account or remove the
  plugin code for **36 months** after receiving the bounty.
- **No royalties.** The bounty is a one-time payment; nothing further is implied.
- Amplenote may keep the plugin in the directory in perpetuity, and may change these
  terms at any time.

---

## 6. Phased build plan

Each phase ends at a **testable milestone**. Do not move on until the milestone works
in the real Amplenote app. Commit at the end of each phase.

### Phase 0 — Scaffold & prove the pipeline (1 day)
- Public GitHub repo, `LICENSE` (MIT), `README.md`.
- Repo layout mirroring the reference plugin (§5.2):
  ```
  src/            readable modules (actions, embed HTML, viewer JS, storage, export)
  esbuild.js      bundles src/ → dist/plugin.js (the text you paste into the note)
  dist/plugin.js  build output
  test/           Jest + jsdom suites, with a mocked `app` object
  test/helpers.js the app mock
  docs/api-notes.md  verified signatures from §1's docs
  ```
- Minimal plugin note: table (name "PDF Annotator", icon `picture_as_pdf`) + a
  `noteOption` "Annotate PDF" that just `app.alert`s.
- Confirm install → toggle on → the option appears in a note's ⋯ menu and fires.
- Stand up the `app` mock and one trivial passing test now, so later phases have
  somewhere to add tests instead of deferring them.
- **Milestone:** the menu option runs on demand, `npm run build` produces a pasteable
  `dist/plugin.js`, and `npm test` runs green. (The menu option was already done
  manually — reproduce it in code so it's version-controlled.)

### Phase 1 — Render a PDF in an embed (2–3 days)
- "Annotate PDF" lists the note's PDF attachments (`getNoteAttachments`), lets the user
  pick one (`app.prompt` radio), stores the choice, opens the annotator embed.
- `renderEmbed` returns HTML that: loads PDF.js from CDN, receives the PDF bytes (via
  `onEmbedCall` round-trip using the verified attachment-URL/bytes method), renders
  **all pages** to canvas with the **text layer** overlaid, plus zoom + page nav.
- **Milestone:** you can open an attached PDF inside the note and read/scroll it, and
  browser text selection highlights real text in the text layer.

### Phase 2 — Create, color, remove, recolor highlights (3–4 days)
- Capture a text selection → derive `{page, rects[], quoteText}` in PDF coordinates.
- Draw the highlight overlay in the chosen color. The 4 colors (#F3998C, #F4DE6C,
  #BBE077, #84B6D9) must be **top-level single-click buttons in the main toolbar** — not
  a dropdown or sidebar (explicit spec requirement).
- Persist highlights to the note (managed section as JSON) via `onEmbedCall`; reload
  them when the embed re-opens.
- Context actions on an existing highlight: remove, change color.
- **Tests (§5.2):** persistence round-trip (save → load → deep-equal); idempotent saves;
  the managed section survives unrelated manual edits elsewhere in the note and never
  clobbers user content; remove and recolor mutate only the target highlight.
- **Milestone:** highlights persist across closing/reopening the note; remove & recolor
  work; survive a page refresh.

### Phase 3 — Notes on highlights (2 days)
- Immediately after a new highlight, prompt to add a plain-text note; also offer it for
  existing note-less highlights.
- One note per highlight; edit and remove.
- Show a notes/highlights list panel (foundation for filtering later).
- **Tests (§5.2):** note add/edit/remove persists correctly; the one-note-per-highlight
  invariant holds; notes containing markdown/quote characters survive the round-trip
  without corrupting the stored JSON.
- **Milestone:** full highlight+note CRUD, all persisted.

### Phase 4 — Native PDF annotations + download (4–6 days, highest risk)
- With pdf-lib, write each highlight as a native **Highlight annotation** and each note
  as an associated **Text/Popup annotation**, at the correct page + coordinates.
- Re-serialize and let the user download the annotated PDF; also offer to upload it back
  to the note via `attachNoteMedia`.
- Verify annotations open correctly in **external readers** (Acrobat, Preview, Chrome).
- **Tests (§5.2):** coordinate conversion (PDF user-space ↔ screen) is lossless across
  zoom levels and page rotations; the generated annotation dictionary has the required
  keys for each color; `attachNoteMedia` is called with a well-formed data URL.
- **Milestone:** downloaded PDF shows the highlights/notes as real annotations in other
  apps. **Spike this in Phase 0/1 in parallel** — if pdf-lib can't do it cleanly,
  you need to know early (see §7).

### Phase 5 — Export highlights to notes + deep-link back (3–4 days)
- "Copy highlight" → paste into any note at an arbitrary location.
- "Export all" → auto-create a destination note; filter by color.
- "Send to note" button → append the highlight to the source note (bottom).
- Each exported highlight is a **double-quoted block** containing the PDF name, the
  highlighted text, and the note (if any) — clearly distinguishable from each other —
  with a **link back to the PDF** as the heading line that re-opens the plugin and
  scrolls to the exact page+coordinates (implement via embed args: the link target
  carries page+coords; on open, `updateEmbedArgs` + `renderEmbed` jump there). Color the
  link with the matching Amplenote cycle color (#F3998C→12, #F4DE6C→14, #BBE077→15,
  #84B6D9→18). Match the exact block layout in §4.
- **Tests (§5.2 — this phase carries the heaviest test obligation, since every action
  here modifies note data):** the exported block's markdown matches the §4 layout
  exactly; PDF name, quote text, and note are each present and distinguishable; the
  deep-link encodes page + coords and parses back to the same values; color→cycle-index
  mapping is correct for all four colors; the color filter includes/excludes the right
  highlights; "export all" creates the destination note once and doesn't duplicate on
  re-run; "send to note" appends without disturbing existing content.
- **Milestone:** clicking an exported link in Amplenote opens the annotator and scrolls
  to the precise highlight.

### Phase 6 — Polish (2–3 days)
- Dark/light mode (`app.context.lightDarkMode`), loading/error states, large-PDF
  performance (lazy-render pages), multi-PDF notes, empty states.
- Fill the plugin note's **instructions** cell (with screenshots) so the directory
  listing looks good.
- Test-suite pass: confirm coverage of every note-modifying action, and that each test
  states its scenario in a comment (§5.2).

### Phase 7 — Submission (2–3 days — budget for it, the videos are not quick)

Nothing here is optional; see §5. Work through it as a checklist:
- [ ] Public GitHub repo pushed, current, and **linked from the plugin page**
- [ ] `LICENSE` (MIT) committed
- [ ] `npm test` green; coverage sufficient per §5.2
- [ ] Published to the Amplenote Plugin Directory
- [ ] **Usage video** (1–5 min) recorded, made public, **linked from the plugin page**
- [ ] **Code overview video** (1–5 min) recorded
- [ ] Both videos shared with `hello@amplenote.com`
- [ ] Bounty claim emailed to `support@amplenote.com` with the plugin link
- [ ] Invoice (with PayPal address) emailed to `hello@amplenote.com`
- [ ] Acceptance confirmed against the live requirements note
- **Milestone:** claim submitted with every §5 obligation satisfied.

---

## 7. Known hard problems — deal with these deliberately

1. **Native PDF annotations (Phase 4) is the make-or-break risk.** pdf-lib does not
   expose a clean high-level highlight-annotation API; you'll likely build annotation
   dictionaries manually and attach them to each page's `/Annots`. **Spike this on a
   throwaway PDF during Phase 1**, before building the whole UI on an assumption that
   might not hold. If pdf-lib proves too limited, evaluate alternatives early.
2. **Text-selection geometry.** Mapping a DOM text-layer selection to accurate PDF
   user-space rects (across multiple lines, and at any zoom) is fiddly. Normalize to PDF
   coordinates immediately; never store screen pixels.
3. **Deep-link round-trip.** The exported link must re-open the embed and scroll to exact
   coordinates. Design the embed-args schema for this in Phase 1 (even if unused yet) so
   Phase 5 isn't a retrofit.
4. **Persistence format.** Decide the on-note storage format once (a managed JSON section
   keyed by attachment id), and make load/save idempotent. Don't let the human's manual
   note edits corrupt it.
5. **Sandbox CSP / CDN loading.** Confirm the embed can load PDF.js + its worker and
   pdf-lib from your chosen CDN. If a CDN is blocked, try another; worst case inline the
   library text. Validate this in Phase 1.

---

## 8. Testing loop (how to iterate)

Two separate loops — the manual one for UI work, the automated one for the T&C.

### Manual (in-app)
- Dev in the browser app (amplenote.com) — DevTools (F12) is your debugger; the embed
  runs in its own context, so check the embed frame's console.
- After editing the plugin code: run the build, then paste `dist/plugin.js` into the
  plugin note (or use the GitHub→Amplenote sync plugin to push from the repo), then
  re-run the plugin. The plugin's metadata/name lives in the note's table; the logic
  lives in the code block.
- Keep a dedicated test note with a few varied PDFs attached (short, long, scanned,
  text-heavy) and re-run after each phase.
- **Disable Grammarly / similar extensions on the plugin note** — they inject characters
  into the code block and silently break compilation.

### Automated (Jest, required by §5.2)
- `npm test` runs the suite against a **mocked `app` object** — no Amplenote needed.
  This is what makes the note-modifying actions testable at all, since they can't run
  outside the sandbox.
- Keep action logic in pure, importable functions in `src/` that take `app` as a
  parameter. Anything welded into the embed's HTML string is untestable — a design
  constraint, not a preference.
- Every test comments the scenario it validates (explicit T&C requirement).

## 9. Definition of done (bounty acceptance)

**Functional**
- Every bullet in §4 works against the live requirements note
- Native annotations verify in external PDF readers (Acrobat, Preview, Chrome)
- Deep-links round-trip to the exact page + coordinates

**Program requirements (§5) — each one independently blocks payment**
- Jest test suite covering all note-modifying actions, each test commenting its scenario
- Public GitHub repo, in sync with the plugin page and linked from it
- MIT `LICENSE` committed
- Published to the Plugin Directory with instructions + screenshots
- Usage video (1–5 min), public, linked from the plugin page
- Code overview video (1–5 min)
- Both videos sent to `hello@amplenote.com`
- Claim to `support@amplenote.com`; invoice with PayPal address to `hello@amplenote.com`

Confirm acceptance with Lucian before considering it closed — and remember §5.6: bug
reports in the plugin comments stay your responsibility after payout.
