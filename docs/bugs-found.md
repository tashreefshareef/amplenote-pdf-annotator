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

## A highlight's width was correct in one browser and wrong in another

**Symptom:** the identical highlight, on the identical PDF, rendered correctly in one
browser and visibly overshot past its own text - extending into blank space with no
glyphs under it at all - in another. Extensive numeric investigation on the "wrong"
browser (word-by-word measurement, same-moment DOM comparison of a highlight against its
own text span) kept coming back internally consistent, which made no sense until the
browser itself turned out to be the variable.

**Cause:** the capture code measured a text selection by taking the DOM's rendered pixel
rect (`Range.getClientRects()`) and converting it through the PDF page's viewport
transform - a single, uniform, page-level scale. That transform has no way to know about
a DIFFERENT correction PDF.js applies per text item: when the browser's substitute font
renders a run of text at a different width than the PDF's own embedded font would have,
PDF.js applies a per-item horizontal `scaleX` CSS transform to correct that item's total
rendered width back to the true PDF width. The correction is exact for the WHOLE item,
but not necessarily uniform per character, since different fonts don't share the same
relative letter-widths. A PARTIAL selection within that item - selecting one word out of
a longer line, the normal case - inherits the item's overall scale correction without
inheriting its accuracy, and by how much depends on which font the browser happened to
substitute for that specific PDF's embedded font. Different browsers make different
substitution choices, so the same document measures differently on each.

**Fix:** stop trusting the page-level transform for anything narrower than a whole text
item. Instead, compute what FRACTION of the item's own rendered CSS box a partial
selection covers, then apply that fraction to the item's own native size and position -
taken from the text-extraction API's own metadata (PDF.js: `item.transform`,
`item.width`, `item.height` from `page.getTextContent()`), not from the DOM at all. This
cancels the per-item font-substitution distortion regardless of which font caused it,
because the fraction and the item's true size come from the same font-substitution-free
source. Ported from a mature prior art implementation
([obsidian-pdf-plus](https://github.com/RyotaUshio/obsidian-pdf-plus)'s
`src/lib/highlights/geometry.ts`, specifically its
`computeHighlightRectForItemFromTextLayer` fallback - used there whenever
per-character glyph data isn't available, which for a stock, CDN-loaded PDF.js build is
always) rather than re-derived from scratch, since a hand-rolled version of an already
subtle coordinate transform is exactly how three earlier bugs in this project happened.

**General lesson:** a "linear transform + measure the DOM" approach to converting
screen geometry back to a document's native coordinate space is only as accurate as the
DOM's own rendering - and text rendering is not guaranteed pixel-faithful to the source
document, especially across different fonts, font-substitution logic, and subpixel
rounding, which varies by browser and even by browser version. Whenever the source
format's own parser exposes native positioning metadata for the same content (here:
PDF.js's per-text-item `transform`/`width`/`height`, extracted directly from the PDF's
content stream), prefer normalizing DOM measurements against THAT as ground truth over
trusting a page-level viewport/screen transform applied to raw DOM pixels - particularly
for anything narrower than one atomic unit of the source format's own text runs, where a
per-run rendering correction can silently distort a sub-run measurement. Comparing
against an existing, mature implementation of the same problem surfaced this in minutes;
guessing at increasingly specific hypotheses without one had already taken several
rounds and produced two wrong diagnoses.

Commit: `e3a9de1`

---

## Hand-built PDF annotations need an explicit /AP or Adobe's tools show nothing

**Symptom:** a PDF with programmatically-added highlight annotations displayed them
correctly in Chrome, PDF.js and a third-party viewer (PDFGear) - but the SAME file
opened in Adobe's tools showed no highlights at all. The annotations were genuinely in
the file (present in the object graph, correct `/QuadPoints` and `/C`), just invisible in
one specific family of renderer.

**Cause:** `/QuadPoints` + `/C` alone describe *where* a Highlight annotation is and
*what color* it is, not what to actually paint. Rendering an appearance from those two
fields when no `/AP` (appearance stream) is present is optional per spec (ISO 32000-1
12.5.5) - Chrome, PDF.js-based tools, and PDFGear synthesize one; Adobe's renderers do
not, and fall back to drawing nothing rather than guessing.

**Fix:** build the `/AP /N` Form XObject by hand: a small content stream that fills one
rectangle per quad in the annotation's color, wrapped in an isolated graphics state
carrying `/BM /Multiply` (the blend mode the spec itself recommends for Highlight
annotations, and the same one already used for the on-screen rendering, so the download
matches what the user saw). Setting the Form's `BBox` to the same numbers as the
annotation's own `/Rect`, with the library's default identity `Matrix`, maps the
content 1:1 onto the annotation with no second coordinate transform to derive.

**General lesson:** never assume that data alone is enough to make a hand-built PDF
object visible in every reader - many annotation and form-field types have an *optional*
appearance-generation step that different renderers implement inconsistently, and the
strictest reader in your target set (often Adobe's own) will not fill that gap for you.
If you're building annotations at the object-dictionary level (bypassing your library's
high-level API, which is itself a sign the library doesn't consider your case common), an
explicit appearance stream is not an optimization - it's the only way to get consistent
behavior across renderers. Test against more than one reader family before calling a
hand-built PDF feature done.

**Verification note:** confirmed both ways used elsewhere in this log - a Jest suite
decoding the appearance stream's actual operators (via the library's own
decompress-and-read path, not a regex over raw PDF bytes) to check the color, rectangle
count and blend mode are correct, and a live download in a real browser re-parsed with
the same library to confirm the file on disk matches. Still not confirmed by opening the
downloaded file in Adobe's own tools directly - that needs a human with Acrobat.

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

## A selection-driven UI gated on `mouseup` is dead on touch, while taps keep working

**Symptom:** on Android, long-pressing text in the viewer selected it natively — blue
range, drag handles, everything — but the four color buttons never appeared, so no
highlight could be created at all. The plugin's entire purpose was unreachable on a
phone. Confusingly, *tapping an existing highlight* opened its popover and recoloring
worked fine, which made it look like a selection bug rather than an event bug.

**Cause:** capture ran from a single `mouseup` listener. A tap synthesizes a full
`mousedown`/`mouseup`/`click` sequence, which is why everything tap-driven kept working;
a long-press-to-select gesture does not, and dragging a selection handle afterwards
produces no mouse events at all. So the one gesture that mattered was the one gesture
that delivered nothing.

**Fix:** add `selectionchange` as a second, mouse-free trigger, debounced ~300ms so it
fires when the selection settles rather than on every frame of a handle drag. Three
constraints keep it from disturbing the mouse path:

1. It may only **add** a capture, never clear one. `selectionchange` also fires when the
   browser collapses the selection as a toolbar button is pressed — precisely when the
   held selection is about to be read — so clearing there breaks picking a color on
   *desktop*.
2. It **skips a selection the mouse already captured**, compared by raw DOM text. Without
   this, desktop gets a second capture ~300ms after the first that re-anchors the popover
   away from the pointer.
3. `mouseup` stays scoped to the pages element while `selectionchange` can only live on
   `document` (it has no element-scoped form) — which is what makes constraint 1
   load-bearing rather than stylistic.

**General lesson:** touch does not deliver a degraded version of the mouse event set — it
delivers a *different* one, and the split is per-gesture, not per-device. Taps are
faithfully emulated; press-and-hold, drag-to-select, and handle manipulation are not
emulated at all. So a UI can be *partly* working on touch in a way that misdirects
diagnosis: the working half (taps) is evidence about event synthesis, not about the
feature. Any interaction whose trigger is "the user finished selecting something" needs a
selection-level event, not a pointer-level one. And when adding a second trigger to a
path that already has hard-won ordering subtleties, make the new one strictly additive
and idempotent rather than trying to unify the two — the old path's edge cases are load
bearing even when they look arbitrary.

---

## A deep link can arrive correctly and still look completely broken

**Symptom:** clicking an exported highlight's link opened the right note but appeared to
do nothing else — no scroll to the PDF, no indication of which highlight was meant. The
diagnostic detail came from the report itself: *scrolling to the embed by hand showed it
already sitting on the correct highlight.*

**Cause:** two different things, both invisible from inside the component that "worked".

1. The link's job was split across a boundary. The plugin rewrote the embed's arguments
   and navigated to the note; the embed then scrolled **its own** pages to the highlight.
   Both halves succeeded. Nobody scrolled the **host document** to the embed, so the
   reader stayed where they were — at the bottom of the note, where the exports are.
2. Arriving at the right highlight is not the same as *identifying* it. A page can hold
   several highlights, adjacent and in the same color; the reader came from a link
   promising one specific quote and had no way to tell which one it meant.

**Fix:** focus. The embed is a cross-origin iframe, so it cannot touch its parent with
script — no `scrollIntoView`, no access to the parent scroller. But focus is handled by
the browser rather than by script: focusing an element inside a frame makes every ancestor
document scroll that frame into view, across origins. `tabindex="-1"` makes the container
focusable without joining the tab order, and the focus ring is suppressed since it would
be a meaningless viewer-sized outline. Only ever on a deep-link boot — stealing focus on
an ordinary load would yank the page around for a reader who never asked to go anywhere.
Plus a brief outline animation on the target highlight, so "here" is answerable.

**That fix then shipped and did nothing at all**, which is the more interesting half.

It had been sequenced at the *end* of the boot chain, after the PDF finished rendering.
But PDF.js renders off `requestAnimationFrame`, which browsers pause in a non-compositing
context — and an off-screen embed in a long note is exactly that context, which is
precisely the case that needs scrolling to. The render stalled, and everything sequenced
behind it, including the scroll, never ran. The condition the feature exists to handle was
the same condition that disabled it.

This is the *third* appearance of one root cause in this project, each with a different
symptom: a viewer that hangs on "Rendering...", a smooth scroll that never advances, and
now a feature that silently does nothing. Moving the call to the first line of `boot()`
fixed it — scrolling the host needs no PDF, no highlights and no layout, only a DOM
element that exists the moment the script runs.

`spike/harness.mjs` now emits a page that deliberately omits its rAF shim, so PDF.js
stalls there the way it does off-screen in the real app. The embed sits 1500px down a tall
document; the host must scroll to it while the status still reads "Rendering...".

**General lesson:** when a feature spans a boundary — iframe, process, service — each side
can be individually correct while the *handoff* is missing entirely, and each side's tests
and logs will look clean. The symptom then presents as "nothing happened", which sends you
hunting for something broken instead of something absent. The tell is any report of the
form "it works if I do X manually first": that X is the missing handoff, named precisely.

Second: cross-origin isolation blocks *script*, not the *browser*. Focus, anchor
navigation, and form submission all still cross the boundary because the user agent
performs them. When script access is denied, ask which browser-level behaviours already
do what you need.

Third, and the one that cost an extra round trip: **do not sequence work behind an
expensive operation it does not depend on.** A promise chain reads as "these steps belong
together" when often it only means "I wrote them in this order" — and it converts any
stall in an earlier step into the silent non-execution of every later one. Ask of each
step what it actually needs. Here the answer was "a DOM element", available immediately,
while it was queued behind a multi-megabyte parse and a canvas render. The give-away is a
feature that works in every test and does nothing in production: check whether the thing
in front of it in the chain ever completes under production conditions.

---

## Two writers that both mean "the end of the note" will eventually eat each other

**Symptom:** every highlight the user had exported with "Send to note" vanished the
instant they created one new highlight. Reported with a screenshot showing a dozen
exported blocks; one new highlight erased all of them.

**Cause:** two independent features both wrote to "the bottom of the note".

1. `saveHighlights` creates its managed `# PDF Annotator data` section with
   `insertNoteContent(..., { atEnd: true })` — so that heading becomes the *last* thing in
   the note.
2. `sendToNote` appended each export with `insertNoteContent(..., { atEnd: true })` too —
   which, because of (1), filed it *inside* that section.
3. `saveHighlights` then persists with `replaceNoteContent(..., { section })`, which
   replaces **everything** under the heading.

Each step is individually correct and reads fine in isolation. The bug only exists in the
composition, and only after the section has been created once — so it is invisible on a
fresh note and on any note the user has not yet exported from.

**Fix:** two halves, and the second is the one that matters most.

- *Stop creating it:* exports are the user's content and now go immediately **above** the
  managed section, which is pinned last.
- *Repair what already happened:* fixing the writer does nothing for exports already
  sitting in the blast radius, waiting for the next highlight. `saveHighlights` now
  detects content in the section that the plugin did not put there, lifts it back into
  the body above the heading, and only then writes its payload. The save that would have
  destroyed the data is now the save that rescues it.

**General lesson:** "append to the end" is not a location, it is a *race* — it resolves
against whatever the document looks like at that moment, so two features using it will
sooner or later interleave in an order neither anticipated. Any region a program
rewrites wholesale needs an explicit invariant about what may live there (here: the
managed section stays last, and holds nothing but its own payload), and that invariant
has to be enforced by every writer, not just documented.

The second lesson is about the shape of the fix. When a bug has already corrupted stored
data, "stop doing the bad thing" is only half a fix, and it is the half that helps users
who have not hit it yet. Existing damage needs an explicit repair path, and the natural
place to put it is the operation that used to do the destroying — it already reads the
data, it already knows the correct shape, and it runs exactly when the damage would
otherwise be done.

**Symptom:** the new touch scroll buttons moved the page correctly but their
enabled/disabled state never updated — Up stayed greyed out after scrolling down, which
at the bottom of a document would leave a reader with no way back, since on a phone these
buttons are the *only* way to scroll.

**Cause:** the state was synced from the container's `scroll` event. Measured in a
non-compositing context: `scrollTop` changes and **no scroll event fires at all**. Same
family as the already-documented `requestAnimationFrame` stall — anything the browser
couples to painting can be dropped when nothing is being painted. (`behavior: "smooth"`
was found the same way, and for the same reason: the scroll simply never advanced. An
instant jump with a 15% overlap replaced it.)

**Fix:** the button updates the state itself, immediately after changing `scrollTop`. The
event listener stays for scrolling the control didn't cause (wheel, trackpad), but the
button path no longer depends on it.

**General lesson:** an action and the UI state describing that action's availability
should be updated in the same call stack, not connected through an event round-trip.
Events are the right mechanism for changes you *didn't* initiate; for one you just
performed yourself, routing through an event adds a dependency that buys nothing and can
silently fail. The severity scales with how load-bearing the control is: the same dropped
event is cosmetic on a page-number indicator and a trap on the only available navigation.
And a broader one — a "hidden/backgrounded tab" is not just slower, it is a context where
paint-coupled APIs (rAF, smooth scrolling, scroll events) stop firing entirely, so any of
them on a critical path needs a non-animated fallback.

---

## Chrome tuned at one container width can eat a third of the box at another

**Symptom:** the same embed that used 13% of its height for toolbars on desktop used 40%
on a phone, leaving a strip of PDF shorter than the controls above it — and the toolbar's
overflow button, deliberately grouped left to keep it from wrapping alone, wrapped alone.

**Cause:** every size in the chrome was tuned at one width. The container's height was
also a *fixed ratio of its width*, so a narrower screen shrank the box and grew the
chrome's share of it simultaneously — the two effects compound rather than cancel.

**Fix:** width-keyed media queries for the layout, plus a content scale (here, initial
zoom) computed from the measured container rather than hardcoded. The rule that made the
zoom fix safe: only ever adjust *away* from the existing default, never toward it, so the
already-verified wide case is provably untouched.

**General lesson:** when a container's height is derived from its width, "tune it once at
a typical size" fails in both directions at once and the failure is quadratic, not
linear. Also: media queries inside an iframe key off the *iframe's* box, not the device —
which is usually what you actually want ("this instance is narrow" catches a cramped
desktop sidebar too), and makes a `max-height` query a reliable way to detect a
deliberately-shortened container from CSS alone.

---

## "Copy" produced perfect markdown that a rich-text editor pasted as literal characters

**Symptom:** the Copy button on a highlight put a correctly-formed export block on the
clipboard, and pasting it into an Amplenote note rendered *nothing* — the note showed
literal `==●<!-- {"cycleColor":"12"} -->==`, a raw `[name](plugin://…)`, and `> >`
characters as visible text. The exact same block written through `insertNoteContent`
("Send to note", "Export all") renders correctly, so the format itself was never wrong.

**Cause:** the clipboard only ever carried one flavor. `navigator.clipboard.writeText`
and a `<textarea>` + `execCommand("copy")` both write `text/plain` and nothing else, and
a rich-text editor pastes plain text *literally* — it reads `text/html` when it wants
structure. The format was being validated against the wrong destination the whole time:
every live confirmation of the markdown had gone through the plugin's own write path,
where Amplenote parses markdown, never through a paste, where it does not.

**Fix:** put both flavors on one clipboard write — the markdown as `text/plain` (still
correct for anything that reads markdown), plus an equivalent `text/html` built by
`buildHighlightHtml` in `src/export.js`. Writing two flavors rules out `writeText`
entirely: either `ClipboardItem` + `navigator.clipboard.write`, or a one-shot `copy`
event listener calling `setData` for each flavor and `preventDefault()`, with the
offscreen textarea kept only because `execCommand("copy")` needs a real selection to fire.

Confirmed live afterwards, and it took two more passes to make the pasted marker match
the exported one. The marker is a `●` in a `<mark>`; the HTML flavor styled its
`background-color`, so it rendered as a colored rectangle — while an *exported* block a
few lines above it, built from the same highlight, showed a small colored dot. The
markdown form (`==●<!-- {"cycleColor":"N"} -->==`) colors the **text**, not a background
behind it. Styling the background also left the glyph at the default text color, i.e. a
black dot inside a colored block, which briefly looked like the whole bug.

Then five rounds of guessing at the marker's styling, none of which reproduced what the
markdown path renders (a bare colored dot). The matrix is in api-notes.md #7; the short
version is that a `<mark>` keeps a background box — `background-color:transparent` does
not clear it, only fades it — and a `<span style="color">` is dropped whole. An emoji
swatch survived everything and was rejected on sight as decoration.

**What actually settled it** took one observation: copy an exported block out of Amplenote
and read the `text/html` flavor off the clipboard. Its own markup is

```html
<mark data-text-color="15" style="color: #BBE077;">●</mark>
```

`data-text-color` is the load-bearing part — it names a **text-color** mark, and `15` is
the same cycleIndex the markdown form uses. A `<mark>` without it maps to a **highlight**
mark and arrives wearing that node's box. The last CSS attempt had the style byte-exact
and was missing only the attribute.

**The mistake underneath all five rounds** was treating this as a styling problem. The two
features do not differ in CSS; they enter Amplenote through different doors.
`insertNoteContent` hands over markdown, which Amplenote's own parser turns into a mark
node its stylesheet paints. A paste goes through the editor's HTML handler, which maps
foreign markup onto its document schema and discards the rest — and the schema stores
"text-color mark, index 15", never "`#BBE077`". No CSS was going to decide the rendering.

**General lesson (the useful one):** when a rich-text target renders your content through
a document schema, you are not styling it — you are *nominating a node type*, and the
appearance is downstream of which node the target decides you meant. Guessing at CSS is
guessing at someone else's parseDOM rules, and the failures don't tell you which rule you
missed. The move is to make the target produce the thing you want, copy it, and read the
markup off the clipboard. That was available from the first round and would have replaced
all five. **When output is mapped through a schema you don't control, get a known-good
sample before writing the generator.**

**Second lesson:** when one feature renders through a platform's markdown and another
through pasted HTML, a discrepancy between them is invisible in either output alone. Both
were only obviously different once an exported block and a pasted one sat a few lines
apart in the same note — worth deliberately arranging when two paths are meant to agree.

**Postscript: the marker should never have existed.** All of the above was spent making a
colored `●` render next to a plain link — a workaround for an earlier finding that "a mark
span and a markdown link do not compose in EITHER nesting order". That finding was tested
with the `==...==` shorthand and generalized to marks as a whole, which was too strong.
The explicit `<mark>` element composes with a link perfectly well, and spec §4 had asked
for the *link itself* to be highlighted all along:

```
[<mark style="background-color:#F3998C;">name<!-- {"backgroundCycleColor":"12"} --></mark>](url)
```

Also wrong along the way: the color key. `cycleColor` is text color, `backgroundCycleColor`
is the highlight background, and a text color on a link is invisible because the anchor's
own color wins. The whole dot was built on the text key.

**General lesson:** a negative finding ("X is impossible") deserves more scrutiny than a
positive one, because it silently redirects the design and nothing afterwards re-tests it.
This one was recorded confidently, from real evidence, and was still too broad — two
syntaxes for the same concept behaved differently, and only one was tried. When a
limitation forces a workaround the requirement never asked for, treat that as a signal to
re-derive the limitation, not as a cost of doing business. And the way to settle it was
always available: apply the formatting by hand in the target app and read back what it
serializes, rather than probing candidate syntaxes from the outside.

**Follow-on regression: Copy stopped writing to the clipboard at all, silently.** Reported
as "nothing is copying", with no error message — and the no-message part was itself a bug
hiding the real one. `copyHighlight` built both clipboard flavors *before* `copyToClipboard`
returned a promise, so a throw while assembling them escaped past the `.catch` attached to
the result: no copy, no status, nothing to report. That is indistinguishable from a refused
clipboard write when all you can see is the UI.

Fixed by a commit that changed two things at once, and **which one did it was never
isolated** — recorded that way deliberately rather than tidied into a clean story:

1. Both builders moved inside a `try`, with their own failure message, and
   `copyToClipboard` now resolves with the *name of the route that won* so the status can
   distinguish "copied with formatting" from "copied as plain text".
2. `execCommand` moved to **last**, having briefly been first. It needs a real selection,
   so it focuses and removes an offscreen textarea, which can leave the document unfocused
   and make a later `clipboard.write` reject with "document is not focused" — and in a
   sandboxed iframe it can return `true` having copied nothing, reporting success over an
   empty clipboard. An intermediate commit that put it first did NOT fix the bug, which is
   the evidence that the first hypothesis (below) was not the whole story.

The first hypothesis was gesture burn: `clipboard.write` rejects in the cross-origin
iframe, and awaiting that rejection ends the user gesture, so an `execCommand` fallback in
its `.catch` finds itself already refused. That mechanism is real and worth designing
around, but reordering for it alone did not restore copying.

**General lesson (the one that holds):** a silent failure path costs more than the bug it
hides. An operation assembled in several steps must report which step failed, or every
failure looks identical from the outside and the diagnosis is guesswork — here it cost two
round-trips before the button could say anything at all. **Make it say something first,
then fix what it says.**

**Second:** a fallback chain is only a fallback chain if every branch still has whatever
the first branch might consume. Anything gated on transient user activation (clipboard,
fullscreen, popups, autoplay) burns that activation when awaited, so "try the good one,
fall back to the old one" can become "try both, fail twice" — and only in the restricted
context the fallback existed for, which is the context least likely to be tested. Routes
can also spoil each other in the other direction: the DOM-based one steals focus that the
API-based one requires.

**General lesson:** "copy" and "write through the app's own API" are two different
destinations with two different parsers, and evidence from one says nothing about the
other. A format confirmed live via the write path is not confirmed for paste. More
generally: a single-flavor clipboard write silently discards structure — if the target is
a rich-text editor, the markup has to be on the clipboard *as* `text/html`, because the
editor will never re-parse plain text into it.

---

## Two colors transcribed from the spec were never the platform's actual colors

**Symptom:** none. Nothing looked wrong, nothing was reported, and every test passed —
including one that recomputed each `rgb` triple from its own hex and confirmed they
agreed. Found only by going to fetch a *larger* palette: Amplenote's stylesheet declares
`--palette-color-12: #F2998C` and `--palette-color-14: #F3DE6C`, while
`src/constants.js` had carried `#F3998C` and `#F4DE6C` since the first commit. One digit
apart in the red channel, in two of our four colors. Green and blue matched exactly.

**Cause:** the table came from the bounty note, and only green had ever been round-tripped
through Amplenote itself (`<mark data-text-color="15" style="color: #BBE077;">`, captured
off the clipboard). The file's own comment said as much — "the other three come from the
same bounty-note table, so the table is trustworthy" — which is exactly the inference that
was wrong. One verified row does not vouch for the rows beside it. They were typos in a
human-written document, and we inherited them as constants.

**Why the tests were no help:** they checked *internal* consistency — hex against rgb,
id against hex — which is the shape of test you write when you assume the values are
right and worry about drift. Nothing compared a single value against the platform,
because the platform wasn't a source we'd read; the spec was. A test suite can only catch
disagreement between things it has both of.

**Consequence, once you know:** an exported link asked for a `background-color` that
Amplenote's palette does not contain — the one thing spec §4 explicitly requires it not to
do ("the Amplenote-supported color that corresponds") — and downloaded PDFs carried the
same error into their native annotation colors. Invisible at a glance, wrong on inspection.

**Fix:** read all 55 `--palette-color-N` declarations out of
`assets.amplenote.com/packs/css/note_editor_app-*.css` and take the values from there.
See `docs/api-notes.md` for the palette's structure and for the retrieval trick, which is
the reusable part.

**The general lesson:** **a table transcribed into a spec is a secondary source, and
transcription is where digits die.** When the platform itself declares the values —
in a stylesheet, an API response, its own clipboard output — go read them, even if the
document you were handed looks authoritative and even if a spot-check of one row passed.
The corollary for tests: a test that compares two of *your* constants to each other proves
consistency, not correctness. If a value's authority lives outside your repo, at least one
assertion should quote the outside value verbatim.

## The same content, written two ways, rendered with and without an underline

**Symptom:** two export blocks for the *same* highlight sat a few lines apart in one note.
One had been written by "Export", the other pasted from "Copy". Both were correctly
formatted, both clickable, both the right color — but only the exported one drew an
underline under its link. Reported as a cosmetic inconsistency, with a screenshot.

**Cause:** the two paths built the same idea out of different tokens. The markdown flavor
wrapped the link text in `<mark style="background-color:HEX;">name<!--
{"backgroundCycleColor":"N"} --></mark>`; the HTML flavor emitted the same mark *without*
the comment, because the clipboard path had never needed it. That comment is not a way of
repeating the color — it names Amplenote's **cycle-color node**, and that node renders a
link with an underline. The style-only mark maps to a plainer node. Both persist, both
re-render, so nothing was broken; the two were simply different nodes wearing the same
color.

**Fix:** emit the style-only form from both paths — it is what Amplenote itself stores for
a pasted highlight, so it is a known-good sample rather than a guess. The cycle indices
stay recorded in `src/constants.js` (they are how a colored *text* marker would be
written) but nothing emits them, so the index also came out of the embed's config and the
viewer's color table on the way through.

**What settled it in one step:** dump the note's raw markdown (`getNoteContent`, e.g.
`src/actions/dump-markdown.js`) and diff the two stored lines. They were identical apart
from that comment. Worth noting *why* this dump was more decisive than the usual one:
the note contained a rendering that was right and a rendering that was wrong, side by
side, from the same source data. Arranging that deliberately — get the target to produce
both outcomes in one document, then read back what it stored — turns a styling question
into a one-token diff.

**General lesson:** this is the same schema lesson as the entry above, from the other
direction. There, naming the wrong node meant the color never appeared. Here, naming a
*richer* node meant it appeared **plus decoration nobody asked for**. When markup is
mapped onto a document schema, every attribute that identifies a node type is a request
for that node's entire rendering, not just the property you were reaching for — so the
minimal markup that produces the right result is usually the right markup, and anything
extra is inherited behavior waiting to surprise you. Corollary: when two code paths
produce "the same" output through different parsers, diff what the target *stored*, not
what you sent.

---

## Coordinates emitted into someone else's document, never checked against its bounds

**Symptom:** a note's popup in a downloaded PDF rendered as a tall box parked at the left
margin, overlapping the text, nothing like the small box beside the highlight that the
code asks for. Easy to read as "the reader lays popups out however it likes".

**Cause:** it wasn't the reader improvising for fun — it was improvising because the
request was impossible. The popup rect was built as "8pt right of the highlight, 200pt
wide", with nothing checking the result against the page. A highlight spanning an ordinary
text column (x 72→540 of a 612pt page) therefore asked for a box from x=548 to **x=748, on
a 612pt page** — 136pt off the paper. Most highlights span a column, so most notes did it.
Readers each recover differently, which is why the output looked reader-specific.

**Fix:** clamp the box inside the page, prefer beside-the-highlight and fall back to inside
the right margin, top-align it the way Acrobat does, and size the height to the note (it
does not scroll in most readers) up to a cap. The page's own size is read per page, since
one document can mix portrait and landscape.

**General lesson:** when you write geometry into a format someone else renders, the
document's own bounds are an input, not a formality — and "the renderer ignored my layout"
should be the *second* hypothesis, after "I asked for something that cannot be drawn".
Anything you emit as coordinates deserves a test asserting it lands inside the surface it
is drawn on, because a renderer's fallback is silent and looks like a styling quirk rather
than an error. Note also what made this cheap to settle: the emitter is a pure function
over numbers, so dumping its output for the ordinary case — one column-width highlight —
showed the impossible rect immediately, with no reader involved.

---

## A one-shot instruction stored in the document replayed on every later open

**Symptom:** opening *any* note whose PDF viewer was expanded scrolled the note down to
the embed and left the PDF on a seemingly random page. No link had been clicked — merely
opening the note did it, every time.

**Cause:** a deep link cannot pass arguments to an embed on a note being navigated to, so
`linkTarget` writes `page`/`hl` into that embed's own tag *before* navigating, and the
viewer reads them on boot. That part worked. But nothing ever removed them. Those args
describe an *intent* — "this load should go to highlight X" — and they were stored as
durable document state, so every later open re-read them and faithfully repeated both
consequences: focus the embed (which drags the host note's scroll down to it) and jump the
PDF to a highlight nobody asked for. The "random" page was whichever highlight was linked
last.

**Fix:** clear the args once acted on, in the same branch that acts on them. Cleared at the
top of boot rather than after the render, because the render can stall indefinitely in a
non-compositing context — a clear sequenced behind it would never run in exactly the
off-screen case where the replay is most disruptive. Safe that early because the args were
parsed out of the tag at load, so rewriting the tag cannot affect the load doing the
rewriting. `collapsed` stays untouched: that one really is durable state, and resetting it
would re-collapse a viewer the link had just expanded.

**General lesson:** intent and state look identical once written down, and the only
difference is how long each should survive. A field answering "what should *this
particular load* do" has to be **consumed** — read *and* cleared — or it silently becomes
a standing order. The tell is nasty: the feature works perfectly the first time and
misbehaves every time after, so whoever builds it sees only the working case. Design the
clearing step at the same moment as the writing step, not when someone reports the replay.

---

## A menu anchored to the cursor moves when the button it belongs to does not

**Symptom:** the toolbar's overflow menu landed somewhere different every time — over the
colour swatches, half over them, or below the toolbar's border. Reported as depending on
"the first dot, second dot, or third dot" of the ⋮ glyph, which is exactly what it was.

**Cause:** `showPopover` positioned everything at `clientY + 12`, from the click. That is
right for a popover opened on a text selection or a highlight, where the cursor *is* the
subject. It is wrong for a menu belonging to a button: the glyph is ~18px tall, so the
same button produced an 18px spread of menu positions depending on where inside it you
happened to land.

**Fix:** popovers opened from a fixed control hang from the control instead — right edge
aligned to the button, top measured from the *toolbar's* bottom edge rather than the
button's, so the gap matches the 8px both panels already leave below that same edge. The
anchor is passed down to the three sub-popovers the menu opens, so the card does not jump
as you move through what reads as one menu.

**General lesson:** "where the user clicked" and "what the user clicked" are different
anchors, and a popover helper that only accepts a point silently forces the first. The
cursor is the right anchor only when the thing being acted on is *at* the cursor —
selections, hit-tested objects, right-click menus. Anything hanging off a persistent
control should be positioned from that control's box, because the user's model is that the
menu belongs to the button, and a button that does not move should not produce a menu that
does. The tell is a bug report phrased in terms of *where within a control* someone
clicked.

---

## A rounded scroll container's scrollbar is not clipped to its own border-radius

**Symptom:** the highlights panel's top-right and bottom-right corners rendered square
while the left two stayed round. Nothing was wrong with the radius, the border or the
shadow, and the panel had been correct before it had enough content to scroll.

**Cause:** Chromium does not clip a classic (space-taking) scrollbar to its scroll
container's `border-radius`. The scrollbar is laid out at the padding-box edge and painted
straight over the curve, so the corners mitre on whichever side the scrollbar is on — and
only once there is enough content to produce one, which is why it looks intermittent.

**Fix:** split the two jobs across two elements. The outer card owns the shape and clips
(`border-radius` + `overflow: hidden`); an inner child owns the scrolling. The scrollbar
then lives inside a box whose corners are square anyway, and the card clips the result.

**General lesson:** no property fixes this in place — `scrollbar-width: thin` only makes
the square smaller and `overflow: overlay` is gone — so reaching for one wastes the time
before you accept the structural answer. More generally: **an element that both clips a
shape and scrolls is doing two jobs, and browsers do not composite scrollbars into the
first one.** Any rounded, scrollable, bordered surface wants the split from the start. The
same reasoning applies to a rounded container with a sticky child or a backdrop filter —
whenever a decoration and a scroll region share one box, check which one the engine draws
last.

---

## A verification harness that bundles at startup will confidently measure the old build

**Symptom:** while placing the underline and strikethrough bands, the harness was reporting
placements that did not match the arithmetic in the source. The strike came back 4.16px
above where the formula put it, every time, on every line. The numbers were stable and
reproducible, which is exactly what made them convincing: a flaky reading gets doubted, a
consistent one gets believed.

**Cause:** `npm run harness` bundles the embed **when the server starts**. Rebuilding with
`npm run build` and reloading the page changes nothing — the page is served from the bundle
made at startup. Several rounds of "fix the constant, rebuild, re-measure" were therefore
all measuring the *original* constants. The give-away, once the numbers were taken
seriously rather than the code: the observed band thickness implied a coefficient of 0.14
and the observed centre implied 0.45, which were precisely the two values that had *already
been replaced*. The harness was reporting the previous version faithfully.

**Fix:** restart the harness server after any `src/` change, not just reload the page.

**General lesson:** a measurement tool with its own build step has its own staleness, and a
stale tool does not fail — it answers the question you asked about a program you are no
longer running. Reloading a page feels like refreshing everything, so nothing about the
loop signals that a stage was skipped. Two habits fall out of it. First, when measurements
disagree with arithmetic you can read directly, suspect the *pipeline* before the
arithmetic; the source is right there and can be checked by eye, while the path from source
to running code cannot. Second, when a wrong number is suspiciously round, try to derive it
from the code you *used* to have — reproducing an old value exactly is proof of staleness,
where "it's a bit off" could be anything.

---

## The same popover drew itself two different ways, because its layout was an output of its own measurement

**Symptom:** reported live, with two screenshots of the same control: a highlight's popover
showed its eleven color swatches as ten-plus-a-stranded-one in one, and as a single row of
eleven in the other, with the action buttons shuffled onto different lines to match. Nothing
about the highlight or the popover's contents differed between them. It read as "the dialog
adjusts its structure based on where it appeared".

**Cause:** the card was eighteen children pushed flat into one `flex-wrap: wrap` container
with `max-width: 320px` and no width of its own. A shrink-to-fit box's used width is
*measured* at layout time, and the wrap point is computed from that measurement — so
anything that moved the width by ~17px (the `overflow-y: auto` scrollbar appearing is the
easy one) moved a swatch onto the next line and dragged every button after it. The
structure was not being chosen; it was falling out of an arithmetic the code never named.

**Fix:** name the width (`width: 270px`), give each row its own `flex-wrap: nowrap`
element, and put the colors that no longer fit behind a "+" that opens a fixed 7-column
grid. Nothing in the card can now re-wrap, because nothing in it wraps.

**General lesson:** wrapping is a layout *algorithm*, not a layout *decision*. The moment a
wrapping container is also content-sized, its structure becomes a function of a number
computed at runtime — and every incidental thing that perturbs that number (a scrollbar, a
font that loads late, a 1px border, a longer label in another locale) silently redesigns
the UI. The tell is a bug report about appearance that no content change explains. Tuning
the max-width never fixes this class of bug, because the input to the wrap is the
measurement, not the cap: either pin the width, or lay the thing out in rows/grid tracks
that are declared rather than discovered.

---

## A CSS override that tied on specificity, and lost silently for months

**Symptom:** while fitting the rebuilt popover to a fixed width, the arithmetic said the
row needed 246px and the browser said 252. The three icon-only shape buttons were 40px
wide each, not the 30px their rule specified.

**Cause:** `.pdfa-shape-btn { padding: 6px }` was written to override `.pdfa-btn { padding:
6px 10px }` on a button carrying both classes. Both selectors are one class — a specificity
*tie* — so the later rule in the stylesheet wins, and `.pdfa-btn` is defined further down.
The override had never applied. Its own comment ("drops .pdfa-btn's text padding and
squares up") described an intention the cascade had quietly refused.

**Fix:** `.pdfa-btn.pdfa-shape-btn { padding: 6px }` — outrank the base rule instead of
tying with it. (The same shape, `.pdfa-btn.pdfa-icon-only`, is why the new icon-only
buttons worked first time.)

**It recurred the same day, in the same stylesheet**, which is the best evidence that the
lesson is about the cascade and not about one rule. Hiding the toolbar's shape group and
notes button below a breakpoint used `#pdfa-styles` (tied with the `@media (pointer:
coarse)` block's own `#pdfa-styles`, and lost on order) and `.pdfa-notes-btn` (outranked
outright by `.pdfa-toolbar button.pdfa-icon-btn`). Both stayed visible and the one-row bar
overflowed by 53px. Written as `.pdfa-toolbar #pdfa-styles` and `.pdfa-toolbar
button.pdfa-notes-btn`, both work. Note the shape of the trap: the *later* block was the
more specific one both times, so reading the new rule in isolation tells you nothing.

**General lesson:** "modifier overrides base" is only true if the modifier actually
outranks the base; single-class-vs-single-class is a coin toss decided by file order, and
the loser fails *silently* — no warning, no visual clue, just a control that is a bit
bigger than its rule says. It stays invisible until something downstream depends on the
exact number, which is why it surfaced here only when a fixed width had to be computed
from the parts. Write modifiers as `.base.modifier` when they override the base, and when
a measured size disagrees with the stylesheet, suspect the cascade before the arithmetic.

---

## Four ways to scroll the page failed - the fourth from outside the frame that should have worked

**Symptom:** clicking a deep link to a highlight worked on desktop and half-worked on the
phone. Both landed on the right note with the viewer already scrolled to the right
highlight - but on mobile the reader was left wherever they had been, typically at the
bottom of the note, with the PDF somewhere far above. Scroll to it by hand and it was
already sitting on the correct highlight, which is what made the failure look so narrow:
everything worked except moving the page.

**Cause:** the viewer runs in a cross-origin iframe, so it cannot touch the host page's
scroller with script. The workaround was to use the two mechanisms that cross a frame
boundary without script access - `element.focus()`, which makes every ancestor document
scroll the frame into view, and `element.scrollIntoView()`, whose spec walks out through
the frame's owner element. Both work on desktop. Neither does anything in the mobile app,
most likely because the note there is not a scrollable DOM document at all. A third
attempt at the related gesture problem (a non-passive `touchmove` listener calling
`preventDefault()`, the strongest lever a page has over gesture ownership) lost to the
host too. Three attempts, one shared assumption: that the scroll had to *originate inside
the frame*.

**The fourth attempt:** ask the host to navigate instead of trying to scroll it. The
platform's own API (`app.navigate`) accepts a URL with a section anchor, and the plugin
already knew which note it was targeting - so the deep link resolved the nearest heading
above the embed and navigated to `…/notes/UUID#Section_name`. The host app performs the
scroll; the iframe only supplies a destination. It worked on the first try on Android, on
the build it first shipped in.

**Sequel, the next day:** the same feature then sent readers to the BOTTOM of the note.
The anchor was derived by a rule inferred from the docs' phrase "spaces are replaced with
underscores, along with some other URL-safety transformations" - implemented as
`encodeURIComponent`, which was checked against 88 headings on the platform's own
published notes and matched every one, colons encoded and dots preserved. It was still
wrong: a *published* note is a different renderer that percent-encodes when writing an
href, while the API call being used returns the anchor with punctuation raw
(`The_ISP's_plain_DNS...`). An apostrophe became `%27`, named no section, and an
unresolvable fragment turned out to scroll to the end of the document rather than do
nothing - so the guess was worse than the feature's absence. What settled the encoding
question was dumping the API's own output for a real note - one line of data instead of
another round of inference.

**Second sequel, after the encoding was fixed with a value read straight from the live
app: still broken.** A brand-new note, brand-new PDF, brand-new highlight, freshly
exported - heading text was plain ASCII words, nothing for any encoding scheme to even
disagree about - and it landed at the end of the note again. That ruled out the anchor
string as the variable outright. The decisive test was a controlled one: reapply the
EXACT commit that had been reported working, resync it to the live plugin note, and click
a fresh link on a real device. Same failure, on code that was - by definition - identical
to what had once worked. **That is what finally closed the question: `app.navigate`'s
section-anchor fragment does not reliably resolve on the Android client, independent of
the anchor's correctness and independent of the plugin's own code.** The feature was
reverted. The original "it worked" report is now believed to have been a coincidence of
note structure - a short note with the embed near the top, where a plain open with no
anchor at all would already look identical to a precise scroll.

**General lesson, still true:** when a format is undocumented, "I found a source that
agrees with my guess" is not verification if that source is a *different implementation*
of the same platform. Two renderers can disagree; only the one you are calling is
authoritative. Get the real value out of the exact API you depend on - a single
diagnostic that dumps it costs less than one wrong release. And weigh failure modes
before shipping a guess: a wrong answer that the system acts on confidently (scrolling
somewhere worse) is not the same risk as a missing answer, so the safe fallback is doing
nothing, not guessing.

**General lesson, corrected after the fact:** the earlier version of this entry closed on
"the sandbox cannot reach the host does not imply the host cannot be asked" - true, and
worth keeping, but it stopped one step short. The missing half: **a host API confirmed
working on one client is not confirmed on a different client of the same platform.** The
web app and the Android app are separate implementations behind one documented interface,
and they diverged on exactly this feature - not on a technicality, but completely, in a
way three rounds of "the anchor must be slightly wrong" made look like a string-format
bug instead of a platform-support gap. The tell, in hindsight: every failure landed on
the SAME wrong place (the end of the note) regardless of what the anchor actually said,
which is the signature of a fragment being ignored outright, not one being mismatched.
If a host-level mechanism only gets verified on the surface that's easiest to drive (here,
a desktop browser under automation) and the actual target is a different client (a native
mobile app), that's not verification of the target - it's verification of convenience.
Test on the real device before declaring a cross-boundary trick solved, and stop 2 wrong
guesses in - not 4 - if every failure keeps landing in the identical wrong spot.

Full detail: `docs/api-notes.md` findings 9, 9a and 13.

---

## The same block, emitted in two syntaxes, rendered as three different shapes

**Symptom:** reported live from one note holding three exported highlight blocks. The first
(no note) drew its quote with **one** bar. The second (with a note) drew **two** bars for
the quote and one for the note, as designed. The third, pasted rather than exported, drew
two bars *and* a visible **gap in the outer bar** just above the note. Same builder, same
requirement, three shapes.

**Cause:** two independent defects that only show up in a renderer.

1. The markdown always emitted `> >` for the quote. With a note there is also a `>` line,
   so the outer quote has two children and both levels survive; with no note the outer
   quote's only child is the inner quote, and Amplenote **collapses** that to a single
   blockquote. The emitted markdown said depth 2 and the app drew depth 1 — so the depth
   silently depended on whether a note existed.
2. The clipboard HTML emitted `<blockquote><blockquote>quote</blockquote></blockquote>`
   followed by a *sibling* `<blockquote>note</blockquote>`. That is two adjacent quote
   blocks, not one quote containing two children — so the outer bar was drawn, stopped, and
   started again. The markdown never had this, because its `>` note line is inside the same
   quote the `> >` line opened. The two syntaxes were not expressing the same tree.

**Fix:** nest the quote a second level only when there IS a note to distinguish it from
(which also matches the requirement's own diagram), and put the note inside the same outer
blockquote in the HTML rather than beside it. Both flavours now produce one shape per case.

**General lesson:** when the same content is emitted in two syntaxes for the same renderer,
the thing to compare is not the two strings but the two **trees**, and the only place to
compare them is the renderer. Adjacent containers are not one container with two children,
and a container with a single child of its own type is exactly the shape a normalizer is
most likely to flatten - so an "extra level" that carries meaning cannot be trusted to
survive on its own. Both defects were invisible in unit tests that asserted the emitted
string, and both were obvious in one screenshot of three blocks side by side. If a format
has two writers, write a fixture that renders every case through both of them.

---

## A box's own border vanished on exactly one edge, at exactly one range of widths

**Symptom:** a collapsed viewer's card looked like it was missing its bottom border - top,
left and right present, the fourth edge just gone, on an ordinary note at an ordinary
width. Re-reading the CSS said this was fine: the outer element carries a full four-sided
border, and an inner bar's own `border-bottom` is explicitly suppressed in collapsed mode
specifically so it wouldn't draw a second, redundant line under the outer border. That
CSS-only read was wrong, and stated with more confidence than it had earned - a second
look, live, was needed before that was clear.

**Cause:** the box's height is `data-aspect-ratio="16"` turned into `padding-bottom:
6.25%` on its wrapper, which Amplenote must satisfy from OUTSIDE - an embed cannot resize
its own iframe. At this note's width that resolved to `43.75px`, a fractional value. The
bar's actual content needs a clean `44px`. An iframe hard-clips to whatever height it is
given, independent of any CSS inside it, so the shortfall ate exactly the outermost
pixel - which is precisely where the border lives. Confirmed by adjusting the box's real,
running height directly in the live app rather than trusting arithmetic on paper:
`43.875px` renders a complete border, `43.75px` clips it. That is a difference smaller
than a tenth of a pixel deciding whether a whole line of border is visible - and it is not
a one-off: the SAME clipping happens for any note width where `width / 16` lands between
34 and 44px, which is an ordinary ~544-704px range for a desktop note pane, not a rare
edge case.

**Fix:** lower the ratio (14 in place of 16) so a typical desktop width clears the 44px
floor with real margin (~50px, not ~44px), while staying far below the 34px height where
a *different*, phone-tuned compact layout takes over - so nothing about the already-
verified mobile behavior moves. This narrows the danger band rather than eliminating it
(the band's width is fixed at `10 × ratio` pixels for as long as a single linear ratio
feeds two layout regimes with different height needs); a full fix would mean moving the
34px media-query threshold in step with the ratio, deliberately left alone because that
threshold is tuned against real phone measurements the project's own notes say to treat as
settled, not to be nudged sideways as a side effect of a desktop-only fix.

**General lesson:** a border, unlike a font size or a color, is binary - it draws itself
in full or not at all, so any explanation for "why would part of it be missing" that only
works in degrees (opacity, rounding, contrast) is the wrong shape of explanation. The
right shape here was "the box got less than one pixel of height it needed," which no
amount of reading the CSS rules in isolation was going to surface, because every rule
involved was individually correct - the bug lived in the ARITHMETIC connecting a CSS ratio
to a pixel count, not in any single declaration. When a defect is this precise (one edge,
one range of container sizes) trust a live measurement over a re-read of the source, even
when the re-read looks airtight - and check that measurement across a size *range*, not
one snapshot, since a bug tied to a fractional pixel comes and goes as the container
resizes and a single check can land on either side of it by luck.

---

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
