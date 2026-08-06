# Bugs found and fixed

Purpose: a log of real bugs hit during this build, written so the **general lesson**
transfers to a different project — not just this one. `docs/api-notes.md` is the
Amplenote-specific counterpart (verified method signatures, this platform's quirks); this
file is for bugs in the surrounding web-platform code (PDF.js, CSS, the DOM, browser
selection APIs, markdown-as-storage) that could just as easily bite a project that has
nothing to do with Amplenote.

Format per entry: **Symptom** (what it looked like) → **Cause** → **Fix** → **General
lesson** (the part worth remembering outside this repo) → commit for full detail.

---

## Overlapping same-color elements with individual `mix-blend-mode` double-darken

**Symptom:** a multi-line highlight showed a visibly darker strip exactly at the boundary
between two lines — long under a long line, short under a short one, tracking the text
precisely enough that it read as an intentional underline rather than a rendering glitch.

**Cause:** each line's highlight rect was its own DOM element with `mix-blend-mode:
multiply` applied individually. Real text can have one line's glyph box (a descender)
overlap the next line's box (an ascender) by a pixel or two — legitimate geometry, not a
bug. Where two elements with their own blend mode overlap, the color gets applied to the
backdrop twice, which for `multiply` means darker each time.

**Fix, round one (incomplete):** blend mode moved to a **group wrapper**, one per
highlight — `mix-blend-mode` + `isolation: isolate` on the wrapper, individual rects left
at the default `normal` blend so overlapping rects of the same highlight paint flat. This
fixed a highlight's own line rects overlapping each other.

**It did not fix the same bug one scope up.** Two *different* highlights whose rects
happened to touch at a line boundary — a recolored highlight beside another, two
highlights on adjacent lines — were still two separate isolated groups, each blending
against the canvas independently. The seam came back, just between highlights instead of
within one.

**Fix, round two (the actual fix):** isolate the whole overlay layer, not any one
highlight. Every rect on the page — across every highlight — now composites flat against
every other rect first (two opaque rects overlapping just show whichever painted last, no
color math), and the flattened result blends against the canvas exactly once. The
per-highlight wrapper still exists, but purely to group a highlight's own rects and carry
its id — it must carry **no blend mode of its own**, or it re-isolates its own subtree and
reintroduces the exact bug one level down.

**General lesson:** when several elements need to look like *one continuous surface* and
you reach for `isolation: isolate` + a group blend mode, ask **how many elements can ever
overlap, not just how many belong to the same logical unit.** Isolating per-unit only
solves within-unit overlap; if two different units (two highlights, two shapes, two
overlapping selections) can also touch, the isolation boundary has to be wide enough to
contain both, or the fix silently narrows the bug rather than closing it. This applies to
any multi-rect highlight, multi-segment progress bar, or overlapping stroke — not just
PDF text — and it's exactly the mistake to check for after fixing the "obvious" scope: did
this fix generalize, or just move the boundary?

**Verification note:** this environment's browser pane doesn't always composite frames
(headless/non-visible tab), so screenshots aren't reliable for confirming a blend-mode
fix. `mix-blend-mode: multiply` and Canvas 2D's `globalCompositeOperation = "multiply"`
implement the identical CSS Compositing spec formula, so reproducing the DOM structure as
canvas draws and comparing `getImageData` pixel values is a legitimate substitute — used
here to prove both rounds numerically:
- same-highlight overlap: `rgb(233,193,46)` buggy vs `rgb(244,222,108)` (exactly the
  source color) fixed
- cross-highlight overlap: `rgb(97,160,101)` (a muddy blend of both colors) buggy vs
  `rgb(187,224,119)` (exactly the later highlight's own color, painted cleanly on top)
  fixed

A repeatable regression fixture for the cross-highlight case is seeded via
`npm run harness -- ` then navigating to `?seed=overlappingHighlights` (see
`spike/harness-bridge.js`) — two different-colored highlights whose rects are constructed
to touch, surviving a reload so the scenario doesn't need re-creating by hand each time.

Commits: `9a36261` (round one, incomplete), `78c4933` (round two, the actual fix)

---

## `Range.getClientRects()` returns more than one rect for a single word

**Symptom:** a highlight showed a thin colored underline beneath specific words. Every
affected word had a descender (g, p, y, j, q).

**Cause:** for a word containing a descender, `Range.getClientRects()` can return two
rects — one for the main glyph body, a second short one for the part dipping below the
baseline. Line-clustering logic downstream (grouping rects into "lines" by vertical
overlap) saw the sliver's low overlap with the main rect and read it as its own separate
line, drawing it as a stray thin band.

**Fix:** collapse a single atomic unit's (here: one word's) rects into one bounding box
*before* handing them to any higher-level clustering. Safe here because a PDF.js
text-layer node never contains an embedded line break, so one word's Range can only be on
one physical line by construction — multiple rects for it are always a same-line
artifact, never two lines to keep apart. Degenerate zero-size rects must be excluded from
the union first, or they drag the bounding box out to wherever they happen to sit.

**General lesson:** never assume a browser selection/range API returns "one rect per
[word/line/token]" — it returns one rect per internal glyph run, which can fragment for
reasons (descenders, kerning, sub-pixel rounding) that have nothing to do with your
data model. If you need one rect per atomic unit, union that unit's own rects yourself;
don't feed raw fragments into logic that assumes rect count means something.

**Verification note:** this quirk isn't reliably reproducible in a synthetic/hand-built
PDF — a `pdf-lib`-authored test PDF has different span geometry than a real
design-tool-exported one. Confirmed by monkey-patching
`Range.prototype.getClientRects` to force the exact fragmentation on a real word, then
checking the resulting highlight was one band, not two — testing the *mechanism*
directly rather than hoping to reproduce the *specific document* that showed it.

Commit: `bcd72ee`

---

## Ruled out on the way there: line-box padding on wrapped text

Before landing on the descender-rect cause above, "a wrapped/`white-space: pre` text
block pads a non-final line's selection rect out to the block's full width" was the
leading hypothesis — it matched the *shape* of the first reported symptom (long band on
a full line, short band on a short one) almost exactly.

**Disproven by direct measurement:** a synthetic block with a short first line and a
much wider block width returned a selection rect tight to the glyphs (63px), not padded
to the block (290px). The hypothesis was plausible and wrong.

**General lesson:** a hypothesis that matches the *pattern* of a symptom is not
confirmation. Measure the actual mechanism in a real browser before writing the fix —
three separate wrong guesses preceded the two real causes above, and each wrong guess
that shipped as a "fix" (see `134419e`, `bcd72ee`) changed nothing for the user because
it targeted a plausible-sounding cause instead of a measured one.

---

## User-typed text stored inside a delimited/fenced block must escape the delimiter

**Symptom:** (caught before shipping, not reported live) a note attached to a highlight
containing a triple backtick would, if saved, corrupt every highlight stored on the same
note — not just the one with the awkward note.

**Cause:** highlight data was serialized as JSON inside a `` ```json ... ``` `` fenced
block for markdown compatibility. User-typed note text lives inside that JSON. A note
containing `` ``` `` closes the fence early; the reader's non-greedy match then stops at
the *inner* fence, fails to parse a truncated payload, and treats the whole section as
corrupt.

**Fix:** escape the delimiter sequence (backtick → its JSON ``` escape) on the way
in; `JSON.parse` reverses it automatically on the way out.

**General lesson:** whenever structured data is wrapped in a delimited text format
(fenced code blocks, XML/HTML comments, heredocs, custom sentinels) *and that format
shares a channel with free-typed user input*, the delimiter itself must be escaped or
rejected — not just "unlikely to occur." A user will eventually paste exactly the string
that breaks your parser, and here the blast radius was total data loss for the section,
not just for the one offending record.

Commit: `d90f31f`

---

## A nested widget's own Escape handler must stop propagation

**Symptom:** pressing Escape while editing a note closed the whole popover instead of
returning to the highlight's action menu (recolor/edit/remove) the editor was opened
from.

**Cause:** the note editor's own `Escape` handler correctly canceled editing and
reopened the parent menu — but the keydown event then bubbled to a `document`-level
handler for the same key, which saw editing already finished and closed what the local
handler had just reopened.

**Fix:** `event.stopPropagation()` in the local handler once it has handled the key.

**General lesson:** in any UI with layered dismiss behavior (a mode within a panel
within a modal, each with its own Escape/outside-click handling), a local key handler
that doesn't stop propagation will have its own effect immediately undone by a broader
handler for the same key, one call stack later in the same event. Easy to miss because
each handler is individually correct — the bug is only visible in the combination.

---

## Cross-reference: general lessons that happened to surface via `docs/api-notes.md`

A few entries in the Amplenote-specific notes file are really platform-agnostic
lessons that happened to be discovered here. Full detail lives there; summarized for
searchability:

| Lesson | Where |
|---|---|
| Don't rely on `<script src>` + immediately-following inline script ordering if anything might re-insert/re-execute the block; create the script element yourself and await `onload`. | api-notes.md § "Embed script loading" |
| Never wire a serialized function into an `onload="..."` HTML attribute — a function's source full of double quotes truncates the attribute at the first one, and it silently never runs. Invoke from a `<script>` block. | api-notes.md § "Embed script loading" |
| A message-passing bridge that hangs with no error on structured objects but works with strings: `JSON.stringify`/`parse` defensively in both directions, even if the API claims to accept arbitrary objects. | api-notes.md § "The embed bridge only reliably carries strings" |
| Reuse a library's own stylesheet for anything whose geometry that library computes (here: PDF.js's text layer), rather than hand-rolling the positioning CSS. Two separate bugs came from reimplementing it. | api-notes.md § "TEXT LAYER" comment in `src/embed/html.js` |
| A canvas-driven render loop (`requestAnimationFrame`) silently stalls in a hidden/non-compositing tab — looks exactly like a hang, nothing wrong in your own code. | api-notes.md § "PDF.js stalls in a hidden tab" |
