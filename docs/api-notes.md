# Verified Amplenote API notes

Purpose: one place for **confirmed** method signatures, so nothing in `src/` is built on
a guess. The spec (§1) is explicit — do not guess signatures, look them up.

Sources:
1. Plugin dev guide — https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
2. App interface (LLM markdown) — https://public.amplenote.com/C8TUXf394zsvrGn8NwXgoJ7f.md
3. Actions reference — https://www.amplenote.com/help/developing_amplenote_plugins/actions
4. Markdown reference / cycle colors — https://www.amplenote.com/help/plugin_api_markdown_reference_parse_markdown

**Last verified against source 2 on 2026-08-06.**

## Lessons for the NEXT Amplenote plugin (start here)

Everything below is detailed further down in this file or in `docs/bugs-found.md`; this
is the scannable index specifically for a **different** plugin project, written up after
several of these cost real debugging time (or a live, reported bug) on this one.

1. **A large, unminified plugin code block can hang the browser just to OPEN the plugin
   note - well before Amplenote's 100k-character hard cap.** Reported live: opening the
   plugin definition note (Plugin Builder's sync target, separate from any note embedding
   the plugin's UI) froze the entire tab for 3-4 minutes, every time, at 92,625 characters
   (93% of the cap) as one 2000+-line unminified block. Minifying the build (`esbuild`'s
   `minify: true`) cut it to 52,780 characters and fixed it. **Don't treat "under 100k" as
   "safe" - treat the cap as "won't outright fail," and minify regardless**, unless you
   have a specific reason to want the pasted code human-readable (and even then, weigh it
   against this cost, paid on every open). Verify a minified build still evaluates
   correctly and preserves whatever contract your sync tooling expects (Plugin Builder's
   is documented under "dist/plugin.js is the sync target" below) - don't just eyeball a
   smaller file size.

2. **`window.confirm()` / `alert()` / `prompt()` - the browser-native ones, not
   `app.confirm`/`app.alert`/`app.prompt` - are unreliable inside the embed iframe.**
   Confirmed live: a `window.confirm()` call in embed JS did nothing at all - no dialog,
   no error, the call was silently swallowed, which looked exactly like a dead button.
   Never gate a destructive embed action on a native browser dialog. Build an in-page
   confirm UI instead (a popover, an inline "are you sure" state) - it has no dependency
   on the iframe's dialog permissions. This is presumably a consequence of the embed
   living in its own cross-origin iframe (`plugins.amplenote.com`, see below) rather than
   anything specific to confirm() - budget for OTHER `window.*` dialog/permission APIs
   being similarly restricted until proven otherwise.

3. **A bare `<!-- HTML comment -->` in note content does NOT render hidden.** The
   cycle-color trick (`==text<!-- {"cycleColor":"14"} -->==`, see the markdown-reference
   section below) hides a JSON marker, but ONLY because Amplenote's highlight-span syntax
   specifically consumes it as part of that construct - it is not evidence that Amplenote
   strips HTML comments from markdown generally. Tried generalizing it to hide a
   plugin's own stored JSON as a bare comment elsewhere in a note; confirmed live it
   rendered as plain visible text, `<!--` and all. **Don't generalize a platform-specific
   trick from the one context it's verified in to a new context without a separate live
   check** - the assumption looked reasonable and was wrong.

4. **Keep any machine-readable data a plugin persists in note content inside a fenced
   ` ``` ` code block - don't move it into ordinary paragraph/comment text.** Suspected
   (strong circumstantial evidence, not root-caused with certainty) that Amplenote's
   rich-text editor reformats "normal" note text in ways it does NOT apply inside a code
   fence - moving a plugin's stored JSON out of a fence and into a bare HTML comment
   (see #3) is suspected of exposing it to that reformatting, corrupting it on next read
   and silently losing data. A fenced code block is the one construct multiple editors
   (this one; also Amplenote's own Plugin Builder code block, see the CodeMirror note
   below) treat as verbatim - treat that as a hard requirement for stored data, not a
   formatting nicety.

5. **Don't trust `app.context.noteUUID` (or any per-call context field) fresh on every
   `onEmbedCall` - capture it once and pass it explicitly instead.** Confirmed live:
   switching away from a note and back can leave the embed's plugin-side context pointing
   at a stale note, so a note-scoped read/write silently targets the wrong note - a
   highlight that was genuinely still saved looked up against the wrong note and appeared
   to have vanished. Fix: capture identifiers like this ONCE at `renderEmbed` time (the
   one moment Amplenote is definitively rendering THAT note's embed), thread them through
   the embed's config, and have every subsequent embed→plugin call send them back
   explicitly rather than re-deriving from `app.context` each time.

6. **The embed runs in its own cross-origin iframe (`plugins.amplenote.com`), not the
   host app's origin.** Already the root cause documented below for the CORS fetch
   failure and the script-loading order traps - restated here because items #2 and
   possibly #3 above are also plausible consequences of the same fact. When something
   embed-side behaves differently than a normal web page would, "cross-origin iframe
   restriction" should be an early hypothesis, not a last resort.

7. **Manually pasting text into Amplenote's note editor does NOT reliably trigger
   markdown parsing.** Testing a markdown-formatting question by typing/pasting a test
   string into a scratch note and eyeballing the result is a natural first instinct - it
   is NOT reliable evidence either way here. Confirmed live: pasted lines using
   well-documented, definitely-real syntax (a plain `[text](url)` link, straight from
   Amplenote's own worked example) rendered as inert, unstyled raw text, identically to
   syntax that actually doesn't work. **To test how Amplenote renders markdown, write the
   content through the plugin's own real path instead** - `app.insertNoteContent` /
   `app.replaceNoteContent` (e.g. via a "Send to note" or "Export" action, or any action
   that writes note content) - and look at the result, not a manual paste into the editor.

   **Corollary, confirmed live: a plugin feature that copies markdown to the clipboard for
   the user to paste in cannot work as markdown at all.** A correctly-formed export block
   (verified rendering fine through `insertNoteContent`) pasted into a note as literal
   `==●<!-- ... -->==` / `[text](url)` / `> >` characters. Amplenote's editor is a
   rich-text editor: it reads `text/html` off the clipboard and treats `text/plain` as
   literal text. Any "Copy" that expects to paste as formatted content has to write a
   `text/html` flavor too - which rules out `navigator.clipboard.writeText` (plain-text
   only); use `ClipboardItem` or a `copy`-event listener with `setData` per flavor. See
   `buildHighlightHtml` in src/export.js and `copyToClipboard` in src/embed/viewer.js.

   Confirmed live for the HTML flavor: Amplenote's editor accepts pasted `<blockquote>`
   nesting and a plain `<a href="plugin://...">`.

   **Colored text on paste needs `data-text-color`, not CSS.** Amplenote's own clipboard
   output for a cycle-colored marker, read off the `text/html` flavor after copying an
   exported block out of a note, is:

   ```html
   <mark data-text-color="15" style="color: #BBE077;">●</mark>
   ```

   The attribute is the load-bearing part, and `15` is the same cycleIndex the markdown
   form uses. Amplenote's paste handler reads it to build a **text-color** mark; a bare
   `<mark>` with only inline CSS maps to a **highlight** mark instead and arrives wearing
   that node's background box. Links come back as
   `<a class="link" href="..." rel="noopener noreferrer" target="_self">`, and a plain
   `<a href>` is accepted too.

   Everything below is what was tried BEFORE reading that output - five CSS-only variants,
   none of which can work, because the box is a consequence of the node type and not of
   any style:

   | Pasted | Result |
   |---|---|
   | `<mark style="background-color:X">` | Box in X, glyph left black |
   | `<mark style="background-color:X;color:X">` | Solid box in X |
   | `<mark style="color:X;background-color:transparent">` | Glyph in X, box merely *fainter* - an inline `transparent` does NOT clear the element's own background |
   | `<span style="color:X">` | No box, and no color - the sanitizer drops the span outright |

   The span case is the tell in hindsight: a text-color mark clearly exists in the schema
   (the editor has a text-color control), but its parse rule keys off `data-text-color`,
   so a span carrying only `style="color"` matches nothing and is dropped whole.

   **The framing that wasted five rounds here: this is not a styling problem.** Pasted
   markup is mapped onto Amplenote's document schema, and the schema stores
   "text-color mark, index 15", not "`#BBE077`" - so inline CSS never decides the
   rendering. You are not styling the content, you are nominating a node type and letting
   Amplenote decide what that looks like. **To get markup Amplenote will accept, make
   Amplenote produce the thing first, copy it, and read the `text/html` flavor off the
   clipboard** (a contenteditable div with a `paste` listener dumping
   `clipboardData.getData("text/html")` is enough). One observation gave the answer that
   five CSS guesses could not, and it was available from the start.

   **When matching a pasted element to one the plugin also writes as markdown, check which
   property the markdown form actually paints.** `==x<!-- {"cycleColor":"N"} -->==` colors
   the *text*, not a background behind it - a cycle-colored `●` renders as a small colored
   dot. Reaching for `background-color` in the HTML flavor (the intuitive guess for
   anything named "highlight") produced a colored rectangle sitting a few lines away from
   an exported block showing a plain dot: same plugin, same highlight, two different-
   looking markers. Note also that `<mark>` has a default yellow background of its own, so
   a foreground-only marker needs an explicit `background-color:transparent`.

8. **A colored link IS expressible - use the `<mark>` ELEMENT, and the BACKGROUND key.**

   ```
   [<mark style="background-color:#9AD62A;">text<!-- {"backgroundCycleColor":"26"} --></mark>](url)
   ```

   Two separate facts, each of which independently defeats the obvious attempt:

   - **`cycleColor` sets TEXT color; `backgroundCycleColor` sets the highlight
     background.** They are different keys on the same mark. Applying a *text* color to a
     link changes nothing visible - the anchor's own color wins - while a background shows
     through. So "make this link appear in colour X" means the background key.
   - **The `==...==` shorthand does not compose with a link, but the `<mark>` element
     does.** `==[text](url)<!--json-->==` and `[==text<!--json-->==](url)` both really do
     render as plain uncolored links. It is tempting to conclude "marks and links don't
     compose" and decouple them - a colored character next to a plain link. That
     conclusion is WRONG and cost a working feature here: the element form nests fine.

   **How this was settled, and the method worth reusing:** apply the formatting BY HAND in
   Amplenote with its own toolbar, then read the note back with a markdown dump
   (`getNoteContent`, e.g. src/actions/dump-markdown.js). That returns Amplenote's own
   serialization - which is the answer, not an inference from it. Any question of the form
   "what markdown does Amplenote use for X" is answerable this way in about a minute, and
   no amount of trying candidate syntaxes substitutes for it.

   Note the dump also shows Amplenote serializing colors as the explicit `<mark>` element
   rather than the `==...==` shorthand, even though it accepts both on input.

   **⚠️ AND OMIT THE COMMENT, unless you want the link underlined.** The
   `<!-- {"backgroundCycleColor":"N"} -->` above is not merely a way to say "this color" -
   it names Amplenote's **cycle-color node**, and that node renders a link with an
   underline. An inline `background-color` alone maps to a plainer node: same color, no
   decoration. Both forms persist and both re-render correctly, so this is a choice, not a
   correctness question:

   ```
   [<mark style="background-color:#F4DE6C;">name<!-- {"backgroundCycleColor":"14"} --></mark>](url)   underlined
   [<mark style="background-color:#BBE077;">name</mark>](url)                                          not
   ```

   Found by exporting one highlight and pasting another into the same note, then dumping
   it: the two stored lines were identical apart from that comment. Note what the dump
   gives you here - not just "what markdown does Amplenote use for X", but **a diff
   between two renderings you can see**, which is what isolates a styling difference to a
   single token.

   The general lesson, which is the same one the paste sanitizer teaches (see
   docs/bugs-found.md): **markup you hand Amplenote is mapped onto a document schema, so a
   color attribute is not styling - it is a choice of NODE, and the node arrives with all
   of its own rendering.** Expect to inherit decoration you did not ask for whenever you
   name one.

9. **A clickable `[text](plugin://UUID?args)` markdown link does NOT route to
   `renderEmbed` - it routes to a completely separate, easy-to-miss action called
   `linkTarget`.** `renderEmbed` only ever handles the `<object data="plugin://...">`
   EMBED tag; a plain link using the identical `plugin://` scheme is a different
   mechanism entirely, with its own action (`linkTarget(app, ...args)`, args being the
   query string, same shape as `renderEmbed`/`onEmbedCall`). Confirmed live the hard way:
   a plugin that builds deep-link markdown (e.g. "click to jump back to X") but never
   defines `linkTarget` produces links that just sit there - clicking does nothing, no
   error, nothing to suggest what's missing. **If a plugin generates ANY clickable
   `plugin://` link, it MUST define `linkTarget` too, or the link is decorative.**

   **And the thing that fires `linkTarget` is the PUZZLE-PIECE ICON beside the link, not
   the link's text.** Source 3 states it outright: the action runs when a plugin link is
   "clicked/pressed, either via the link icon in a note or the link icon/text in a Rich
   Footnote popup". Clicking the text of a `plugin://` link does what clicking the text of
   ANY link in the editor does - it opens Amplenote's ordinary link-details popup, showing
   the raw href (`plugin://<uuid>?att=...`) with EDIT DETAILS / CLOSE. That popup is not an
   error and not an "unrecognized link" message: it appears whether or not `linkTarget` is
   defined, so it is NOT the symptom that tells you the action is missing - a dead puzzle
   icon is. Reported as a suspected bug on this plugin's own export links, which were
   working correctly the whole time.

   **That icon is not yours and cannot be changed.** Read out of the live DOM: Amplenote
   wraps your link text and appends a nested `<a class="icon material-icons has-href
   plugin-link">` (~19x24px, empty but for a zero-width space), and its glyph comes from
   the editor's own stylesheet - `.plugin-link::after { content: "extension" }` in the
   Material Icons font, `extension` being Material's puzzle piece. Hardcoded, identical
   for every plugin. In particular **the `icon` row in the plugin note's metadata table
   does NOT feed it**: this plugin's is `picture_as_pdf` and the link still renders a
   puzzle. That field identifies the plugin in Amplenote's own menus; it is not a link
   decoration. Since a plugin only controls the interior of its embed iframe, there is no
   hook - no markup, no CSS - to swap the glyph for something more meaningful. Don't spend
   time looking for one.

   **And the two-click path is a hard constraint, not a missing feature.** Same DOM read:
   the link's text sits inside `contenteditable="true"`, so a click on it MUST place the
   caret - otherwise you could never edit a word that happens to be part of a link - and
   the editor swallows the navigation, offering the href in a popup instead. The injected
   icon carries `contenteditable="false"`, is therefore not editable text, and the browser
   just follows its href: one click. Every link in a note works this way; none of it is
   specific to `plugin://`. So there is no one-click text link to build, and no way to mint
   your own non-editable widget either - you emit markdown, Amplenote maps it onto its own
   node schema (see finding #8), and an attribute like `contenteditable` does not survive
   that mapping. Only nodes Amplenote constructs itself get it.

   Consequence for any plugin that generates deep links: **the target the user has to hit
   is a small icon Amplenote renders, not the text you wrote.** In the editor a deep link
   is inherently a two-step gesture (or one precise click on a ~12px icon), and a user who
   clicks the obvious thing gets a URL popup that reads like a malfunction. Word any UI
   copy accordingly - "click the puzzle icon", not "click the link" - and don't design a
   flow whose success depends on the text click doing anything.

   Separately: `linkTarget` can `app.navigate` to a note
   (`https://www.amplenote.com/notes/NOTE_UUID`, confirmed real), but there is no
   documented way to pass embed arguments alongside that navigation - if the goal is "jump
   to a specific state inside an embed on a different note," the args have to already be
   baked into that note's OWN embed tag before
   navigating there (see `updateEmbedArgs` below), since `updateEmbedArgs`/`renderEmbed`
   only work "already operating within that embed's context" per Amplenote's own docs -
   there's no cross-note equivalent.

   **`app.navigate` also accepts a SECTION anchor - `.../notes/NOTE_UUID#Section_name` -
   and that is the only scroll lever a plugin has that lives outside the embed iframe.**
   Documented in source 2, alongside `.../notes/jots`, `?tag=`, and
   `?highlightTaskUUID=TASK_UUID`. It can only name a HEADING, never an embed, so the
   closest a deep link can aim is the heading above the viewer. The anchor format is
   specified only as "spaces are replaced with underscores, along with some other
   URL-safety transformations" - the transformations are never enumerated, so read the
   real anchor off `app.getNoteSections` (its `heading.href`, added Dec 2023) and treat it
   as opaque rather than deriving one. The section-object shape itself is undocumented, so
   feature-detect. **CONFIRMED ON ANDROID, 2026-08-12: this is what finally scrolls the
   mobile app's note to an embed - see finding 13, where it overturns a limitation three
   in-iframe mechanisms had failed to beat.**

9b. **Amplenote's full color palette is 55 values, declared as `--palette-color-N` CSS
    variables, and it is IDENTICAL in every theme.** They live in
    `assets.amplenote.com/packs/css/note_editor_app-*.css` (hashed filename; read the
    `<link>` hrefs off the page). The set is five bands of eleven, each band running the
    same hues in the same order: 1-11 pastel, **12-22 mid**, 23-33 saturated, 34-44 dark,
    45-55 darkest, with the eleventh of each band a neutral. `data-text-color="15"` and
    `data-background-color="N"` are indexes into this, which is what makes an index
    portable: dedupe every declaration in the file and you get exactly one value per
    index, so none of Amplenote's 26 themes redefines a single one. **12-22 is the band
    that reads as highlighter ink** - strong enough to see over black text, light enough
    to read through - and it is where this plugin's four came from.

    Two retrieval lessons, both of which cost time here:
    - **`document.styleSheets[].cssRules` throws on a cross-origin stylesheet**, and a
      scan that wraps it in `try/catch { continue }` reports "no matches" rather than "I
      couldn't look" - a silent false negative that reads exactly like a real answer.
      Amplenote serves CSS from `assets.amplenote.com` while the app runs on
      `www.amplenote.com`, so every sheet is cross-origin. Fetch the href instead.
    - **Don't fetch a multi-megabyte bundle inside the page to search it.** The editor
      JS is ~6 MB and an in-page `fetch().then(text).search()` hit the CDP evaluate
      timeout twice, which looks like a frozen renderer. `curl` it and grep locally.

9c. **A plugin can WRITE its own settings - `app.setSetting(name, value)` - and that is
    the escape hatch from Amplenote's text-only settings UI.** Settings are declared as
    `setting | Label` rows in the plugin note's metadata table, read as
    `app.settings["Label"]` (always strings), and rendered by Amplenote as a plain text
    input: there is no color picker, no dropdown, no validation. `app.prompt` is no help
    either - its input types are checkbox/date/embed/note/radio/secureText/select/
    string/tags/text, and none of them is a color. **But an embed is arbitrary HTML that
    you control**, so the pattern for any preference that deserves a real UI is: build
    the picker inside the embed, send the result over `onEmbedCall`, and have the plugin
    side write it with `app.setSetting`. Docs say the value "will be synchronized to all
    of the user's devices".

    Two things to design for. **Store what a human would have typed**, not JSON - the
    settings text field stays visible and editable, so the two surfaces have to be two
    views of one value or the field starts showing something that reads as corruption.
    And **treat the write as fallible**: this is the only write into settings, from the
    least-trodden context (an embed), so branch on `typeof app.setSetting !== "function"`
    and catch the call, applying the choice locally either way - losing the click as well
    as the preference is two failures for the price of one. VERIFICATION STATUS: the
    round trip is proven end to end in `npm run harness` (picker -> bridge -> setting ->
    toolbar repaint) but the harness supplies its own `setSetting`, so the DOCUMENTED
    behaviour of the real one is still second-hand. Confirm against the live app before
    relying on the sync-across-devices claim.

10. **An attachment IS present in note markdown, at its real position in the body, as
    `[filename](attachment://ATTACHMENT_UUID)`** - and that uuid is the same one
    `getNoteAttachments` returns. This is documented NOWHERE: the plugin markdown
    reference covers colored text, footnotes, tables, line breaks, collapsible headings
    and tasks, and omits attachments entirely; the app-interface doc only hints at it,
    noting `getNoteAttachments` returns "only attachments that are currently referenced in
    the note". Confirmed by dumping a real note's `getNoteContent` output into a fenced
    block in a scratch note and reading it. **This is the join that lets a plugin position
    content relative to a specific attachment** - without it, a plugin can only append.
    Corollary worth internalizing: **when Amplenote renders something at a position in the
    note, a token for it exists at that position in the markdown** - markdown is the
    note's internal representation, so "the UI shows it there" is good evidence the
    content does too, even for constructs no reference documents. If the PDF's text was
    extracted, the chip line also carries a rich-footnote marker (`[^1]`) whose definition
    holds the extracted text at the bottom of the note - so match on the uuid substring,
    not on a whole-line link regex.

11. **There is no positional write API. `insertNoteContent`'s only documented option is
    `{ atEnd }`** - there is no "insert at offset", no "insert after element". Two ways
    around it, both confirmed working live:
    - **Read, splice, whole-note `replaceNoteContent`.** What #10 enables. Costs a full
      round-trip of the user's entire note through `getNoteContent` -> string surgery ->
      write, so touch exactly one line and leave everything else byte-identical.
    - **The `insertText` action** - the one genuinely cursor-positioned write. The user
      types `{Plugin Name}` where they want the content and Amplenote substitutes the
      action's return string for that expression in place. Easy to miss: it's one of 17
      action types and reads like a text macro, but it's the only API that writes where
      the user is pointing. Note the keyword defaults to the plugin's *name*; return a
      string from `check` to override it.

12. **An embed CANNOT resize itself, so anything that changes its height has to rewrite
    the note.** Amplenote's app-interface doc, verbatim: *"Embeds are fully isolated from
    the hosting application, so they can't be sized dynamically based on the content of
    the embed."* The iframe's height comes from `data-aspect-ratio` on the `<object>` tag
    (width / height - `1.2` renders a box taller than it is wide) and from nothing else.
    There is no resize callback, no postMessage height protocol, and `updateEmbedArgs`
    changes data only, never dimensions. **Consequence: a collapse/expand affordance inside
    an embed does not work the way it does on a normal web page.** Hiding the DOM shrinks
    the *content* and leaves the *box* - a title bar floating above a tall blank rectangle,
    which is exactly how it was reported here. The fix is to rewrite the tag's
    `data-aspect-ratio` in the note and let Amplenote re-render. Two things fall out of
    that, and both are easy to miss until they bite:
    - **The rewrite re-renders the embed**, so any state the collapse depended on is lost.
      Persist that state in the tag's own args (`?c=1`) and re-apply it in `renderEmbed`,
      or the embed springs back open the instant it resizes.
    - **A collapsed embed should skip its expensive load entirely** - but then it has
      nothing to label itself with, since `renderEmbed` gets only the args in the tag. Budget
      for a cheap metadata round-trip that does *not* trigger the expensive path.
    Pick the collapsed ratio knowing it can't be exact: height is width/ratio and the embed's
    width follows the reader's window, so one ratio cannot match a fixed-height bar everywhere.

13. **Embeds DO render in the Amplenote mobile app - and a desktop-only embed is close to
    unusable there.** Confirmed on Android, 2026-08-08: the viewer rendered and its
    tap-driven controls worked. Mobile is a real surface, not a dead end, so budget for it.
    Four things bit at once, and three are not PDF-specific:
    - **Every height tuned at desktop width is proportionally smaller on a phone.** The box
      is `width / data-aspect-ratio` (lesson 12) and the *note markup is shared across
      devices*, so one ratio serves every screen - a bar sized to 45px at a ~720px desktop
      note width gets 22px at a ~358px phone width, and clips. There is no per-device
      escape. The only lever is making the *content* compress into whatever it is given.

      **"Per-device" is therefore always "the device that renders rewrites the note", and
      that is why it must be manual.** There is nowhere else to put the number: settings
      are account-wide, `localStorage` inside the embed cannot change the box, and the box
      is decided by markup both devices read. If each end auto-corrects a ratio it thinks
      is wrong for it, a phone and a desktop with the same note open will each keep
      correcting the other - every lap a real note write, because the rewrite re-renders
      the embed at the far end. Offer it as a control on the device that minds (here: "Fit
      to this screen" on a narrow box, "Restore height" on a wide one that is wearing a
      fitted ratio) and store the chosen ratio in the tag's ARGS, not by reading back
      `data-aspect-ratio` - collapsing overwrites that attribute, so expanding again has to
      restore the choice from somewhere the collapse did not touch.

      The screen a phone actually has is readable from inside the embed: `screen.height` is
      the whole screen in CSS pixels, and `innerWidth` is the box - so the ratio that fills
      ~85% of the screen is `innerWidth / (screen.height * 0.85)`. Measured on a 354px box
      against an 812px screen: 0.51. Validate it plugin-side anyway; the embed is the
      untrusted end of that bridge.
    - **Media queries inside an embed key off the embed's own box, not the device** - the
      iframe viewport IS the box Amplenote hands you. That is a convenience, not a
      limitation: `max-width` means "this viewer is narrow" (and catches a cramped desktop
      sidebar too, which a device check would miss), and `max-height` is a reliable way to
      detect the collapsed box from CSS alone.
    - **A toolbar that fits one row on desktop wraps to three on a phone**, and the wrap
      order is not the grouping you designed - here the overflow button was stranded alone
      on its own row. Chrome that costs 13% of a desktop box can cost 40% of a phone box.
    - **Touch does not deliver the same events.** A tap produces a `click` and everything
      keyed to clicks kept working; a long-press text selection produced NO reaction from a
      `mouseup` listener on the same element. Any embed whose core interaction is
      selection-driven and gated on mouse events should assume it is broken on mobile until
      tested on a device. Resolved here: the selection DOES form natively, handles and
      all, and simply never emits `mouseup` - so a debounced `selectionchange` listener
      is the fix. See docs/bugs-found.md for the constraints that keep it from breaking
      the desktop path.
    - **The host note claims the VERTICAL drag gesture inside the embed; horizontal is
      left alone.** Confirmed on Android: dragging the page area sideways panned the PDF
      normally, dragging it up or down scrolled the *note*, so the embed could not be
      scrolled vertically at all. The asymmetry is the explanation - vertical is the
      note's own scroll axis, and a full-width embed that captured it would trap the
      reader with no way to scroll past, so the app takes it. This is decided outside the
      iframe: `overscroll-behavior` governs only what happens once the inner element
      reaches its end, not who owns the gesture, and there is no CSS from inside that can
      reclaim it. **Budget for gesture-free navigation in any embed taller than its box.**
      Programmatic scrolling is entirely unaffected, so on-screen controls work fine.

      This applies to **every** scrollable region in the embed, not just the main one —
      the highlights panel hit it too, and a panel whose contents cannot be reached is
      useless the moment it holds more than a couple of entries. Enumerate them.

      **Three things were tried against this and all three failed**, so treat it as
      settled rather than re-deriving it: `overscroll-behavior: contain` (governs only
      what happens once the inner element hits its end, never who owns the gesture); a
      **non-passive `touchmove` listener calling `preventDefault()`** — the strongest
      lever a page has over gesture ownership, and the host still won; and focus, which
      does not move the mobile note either. Arbitration happens above the iframe and is
      not reachable from inside it. Plan for on-screen controls from the start, and make
      them hold-to-repeat: if a tap is a screenful, a tap per screenful *is* the reading
      experience.

      Worth knowing why a first-party viewer (Obsidian's, say) can drag-scroll and a
      plugin cannot: that viewer renders in the note's own document, with no boundary to
      arbitrate. The sandbox that makes third-party plugins safe to install is the same
      thing that costs them the gesture. It is a trade, not an oversight — but it does
      cap how native an embed can feel on mobile, and that is worth saying out loud to
      anyone scoping an embed-heavy plugin.
    - **NOTHING INSIDE the embed can scroll the mobile app's note to it - but
      `app.navigate` with a section anchor can, from outside. Solved, 2026-08-12.**

      The failing half first, because it is still true: focusing an element inside the
      frame scrolls the host document on the desktop web app, but does nothing in the
      Android app; `scrollIntoView`, a separate engine path that also crosses the frame
      boundary, was tried alongside it and also does nothing. The likely explanation is
      that the mobile note is not a scrollable DOM document at all, in which case no
      in-iframe mechanism can move it. The symptom was precise and misleading: a deep link
      opened the right note, the viewer was already sitting on the right highlight, and
      the reader was left at the bottom of the note to find the PDF by hand.

      **What works is `app.navigate("…/notes/UUID#Section_name")` (finding 9), aimed at
      the nearest heading ABOVE the embed - so `linkTarget` computes that heading and
      navigates to the section rather than to the note.** Confirmed on Android on the
      first try. The reason it beats three in-iframe mechanisms is not that it is a better
      scroll: it is that the HOST APP performs it. The iframe only asks for a destination,
      via the one host API that takes one.

      Caveats that survive the fix: an anchor can only name a **heading**, never an embed,
      so a note with no heading above its viewer has nothing to aim at and falls back to
      today's behaviour; and how close you land depends on how far the PDF sits below that
      heading.

      **Generalize this before assuming your own embed is stuck**: "the sandbox cannot
      reach the host" is about the DOM, and it does not imply "the host cannot be asked".
      Enumerate the host's own navigation/routing API for an addressable landmark - a
      section, an anchor, a task id, a query parameter - before recording a limitation as
      accepted. The three failed attempts here all shared one assumption (that the scroll
      had to originate inside the frame) and it was the assumption, not the attempts, that
      was wrong.

14. **Rewriting a note's content does NOT re-mount an embed already on screen — so a
    plugin cannot "send" anything to a live embed by editing the note.** `renderEmbed`
    runs when the embed mounts; after that, changing the `<object>` tag's args underneath
    it changes the note but not the running embed. `app.context.updateEmbedArgs` +
    `renderEmbed` are no help either — they only work from *within* that embed's own
    context (i.e. inside its `onEmbedCall`), not from an action.

    This is invisible until you test both cases separately, because navigating to a
    *different* note hides it completely: the note loads, the embed mounts for the first
    time, and it reads the new args on the way up. Here the identical deep link worked
    perfectly from an exported note and did nothing at all from the PDF's own note, which
    is the shape of the bug — **an embed feature that works everywhere except at home.**

    The only lever that reliably forces a fresh mount is making the element genuinely go
    away and come back: write the note without its `<object>` line, then write it back.
    That costs a visible reload of the embed, so confine it to the case that needs it.
    Always restore unconditionally, including after a failed write — leaving a note
    without its viewer is far worse than the feature not working.

    **Design consequence, worth knowing before you need it:** there is no plugin→embed
    push channel at all. If an embed must react to something outside itself, the embed has
    to ask (`callAmplenotePlugin`), because nothing can tell it.

15. **Amplenote's own UI is Roboto + Material Icons, and an embed gets neither for free.**
    Not inferred from screenshots: `amplenote.com` computes `Roboto, sans-serif` on its
    body, and the app shell preloads its own
    `materialicons-latin-400normal-….woff2` alongside its Roboto files — which is why the
    editor toolbar's glyphs are Material Icons (`format_bold`, `expand_more`, `cloud_done`
    and friends). An embed is a **separate document**, so fonts the host page loaded are
    not available to it, and their asset URLs are content-hashed besides — a plugin that
    wants to look native has to request them itself. Reported live on this project as the
    embed toolbar "not feeling native": the cause was typographic characters (`‹ › − ⋮`)
    where the bar 30px above it used 24-grid icons, at a font the rest of the app was not
    using.

    Practical shape that worked: **Roboto as a webfont** (Google Fonts, `display=swap`,
    with the previous system stack kept as the fallback) and the **icons inlined as SVG
    path data** rather than a second webfont — an icon font that fails to load renders its
    ligature *text*, so a CDN hiccup leaves the word `chevron_left` sitting in the toolbar,
    while a missing text font merely falls back.

    ⚠️ **Unverified:** only `cdnjs.cloudflare.com` is confirmed against the embed's CSP
    (see "Embed CSP / CDN loading" below). `fonts.googleapis.com` has not been confirmed
    live, and cdnjs hosts no Roboto package. Keep the fallback stack real so a block costs
    a font rather than a broken toolbar.

16. **A plugin cannot add a tab or panel to the note footer — the strip holding
    Hidden / Completed / Backlinks is Amplenote's own UI, with no extension point.**
    Checked against source 3, which lists every entry point a plugin object may define:
    `appOption`, `dailyJotOption`, `eventOption`, `imageOption`, `insertText`,
    `linkOption`, `linkTarget`, `noteOption`, `onEmbedCall`, `onNavigate`,
    `onNoteCreated`, `onPluginCall`, `renderEmbed`, `replaceText`,
    `suggestTaskTargetNotes`, `taskOption`, `validateSettings`. Every one of them hooks a
    **menu**, a **text/selection event**, a **lifecycle event**, or an **iframe embed** —
    none registers host-app chrome, and the sandbox gives no DOM access to the host page
    to add any (see #6). So the whole set of surfaces a plugin can own is: the inline
    embed (`renderEmbed`), the sidebar embed (**Pro-gated**, see below), the note ⋯ menu
    (`noteOption`), quick-search (`appOption`), and the various per-object menus.

    Worth knowing before designing, because a note-level always-visible panel is a natural
    thing to want for any plugin that accumulates per-note records (an index, a log, a
    list of marks) and it simply isn't on offer. **The substitutes are a panel *inside*
    your own embed, or a managed note you write to** — both of which this project ended up
    using. Generalize the shape of this check, too: when you want a surface, read the
    actions list and ask which of those four kinds it is. If it's none of them, it doesn't
    exist, and no amount of embed-side work reaches it.

## Core types

**`noteHandle`** — an object, minimally `{ uuid: string }`. May also carry `name` and
`tags` when returned from `findNote`. Methods take the handle, **not** a bare uuid
string. `app.context.noteUUID` is a bare string, so wrap it: `{ uuid: app.context.noteUUID }`.

## Verified methods

| Method | Signature | Returns | Notes |
|---|---|---|---|
| `app.getNoteAttachments` | `(noteHandle)` | `Array` of attachments, or `null` if the note doesn't exist | ✅ |
| `app.getAttachmentURL` | `(attachmentUUID: String)` | `String` — a **temporary** URL | ✅ Fetch bytes from this URL. Temporary, so don't cache it across sessions. |
| `app.attachNoteMedia` | `(noteHandle, dataURL)` | `String` URL of the uploaded media | ✅ Throws if the file is too large or on network error. |
| `app.getNoteContent` | `(noteHandle)` | note content as markdown `String` | ✅ |
| `app.insertNoteContent` | `(noteHandle, content, { atEnd })` | **nothing** | ✅ Throws over 100k chars or if the note is readonly. |
| `app.replaceNoteContent` | `(noteHandle, content, { section })` | `boolean` | ✅ See "section" below — important. |
| `app.createNote` | `(name?, tags?, { archive }?)` | `uuid` of the new note | ✅ |
| `app.findNote` | `(noteHandle)` — `{uuid}` or `{name, tags?}` | `noteHandle` with metadata, or `null` | ✅ |
| `app.prompt` | `(message, { inputs, actions })` | entered value(s), **`null` if cancelled**, or action result | ✅ Cancel is `null`, not `undefined`. |
| `app.alert` | `(message, { actions, preface, primaryAction, scrollToEnd })` | `null` if dismissed, `-1` for primary action, else action index/value | ✅ |
| `app.navigate` | `(url: String)` | `boolean` | ✅ Amplenote URL format. |

### `app.context`

| Property | Type | Notes |
|---|---|---|
| `noteUUID` | `String` | uuid of the note the action was invoked from. |
| `embedArgs` | **`Array`** | Available in `onEmbedCall`. It's an array, not an object. |
| `updateEmbedArgs` | `(newArgs)` | **Does NOT trigger a re-render.** Must be followed by `renderEmbed()`. |
| `renderEmbed` | `()` | Re-renders the embed with the current args. |
| `lightDarkMode` | `String` | `"light"` or `"dark"`. |

### Embed ↔ plugin

- `onEmbedCall(app, value)` — the plugin-side handler.
- From inside embed HTML: `window.callAmplenotePlugin(value)` invokes it.

## Findings that change the design

**1. `app.notify` DOES NOT EXIST.** ❌ The mock originally had it, and code calling it
would have thrown at runtime inside the sandbox — with the embed's console as the only
clue. Use `app.alert` for user messaging. Removed from the mock.

**2. Note content is capped at 100k characters.** Both `insertNoteContent` and
`replaceNoteContent` throw above it. This is a real constraint on the persistence
design (spec §7.4): the annotation JSON shares that budget with the user's own note
content. Rough math — a highlight with rects plus quote text runs a few hundred bytes
of JSON, so a heavily annotated long PDF could approach the cap. **Open design question
for Phase 2:** keep the stored JSON compact (short keys, rounded coordinates), and
decide whether the PDF's own native annotations become the source of truth with the
note JSON as a cache. Not blocking Phase 1.

**3. `replaceNoteContent` accepts `{ section: { heading: { text: "..." } } }`** and
replaces only the content under that heading, leaving the heading itself in place. This
is a much better fit for the managed storage section than whole-note replace, and it
directly addresses the spec §7.4 worry about corrupting the user's manual edits — we
never rewrite the whole note.

## Runtime findings (measured in the live app, 2026-08-06)

Probed by installing throwaway code in the real plugin note and running it against a
scratch note. These could not be answered from documentation.

### ✅ Resolved — the embed works, and CDN loading is NOT blocked

The single biggest Phase 1 unknown. Inside a live embed:

```
embed booted
origin=https://plugins.amplenote.com
args=[]
callAmplenotePlugin=function
PDFJS OK v3.11.174
PDFLIB OK
```

- **PDF.js 3.11.174 and pdf-lib 1.17.1 both load from cdnjs.** No CSP block. The §7.5
  worry about inlining libraries is unnecessary.
- **`window.callAmplenotePlugin` is present** as a function, as documented.
- **The embed runs on its own origin, `https://plugins.amplenote.com`** — NOT
  amplenote.com. Everything the embed touches on an Amplenote host is cross-origin.
  This is the root cause of the CORS problem below.

### ⚠️ Inline embeds work; the sidebar embed is Pro-gated

- `app.openSidebarEmbed()` opens the **Peek Viewer, which requires a Pro subscription**.
  On a Personal plan it renders an upgrade prompt instead of the embed. Do not build the
  primary UI on it.
- **Inline embeds work on Personal.** Insert into a note body:
  `<object data="plugin://PLUGIN_NOTE_UUID" data-aspect-ratio="1.5" />`
  This can be written straight into a note with `insertNoteContent`, and it renders.
  This is the surface the annotator should use.
- Embed parameters use **query-string syntax**:
  `plugin://UUID?page=3&x=100` arrives as `renderEmbed(app, "page=3&x=100")` — a single
  string, not structured args. **This is the mechanism for the Phase 5 deep-link** (§7.3),
  so design the link format around a query string.

### ✅ Attachment object shape (confirmed against a real PDF)

```json
[{ "name": "Suzuki Access Insurance 2025-2026.pdf",
   "type": "application/pdf",
   "uuid": "6dc9f8b0-28c3-4891-b435-694620b303cc" }]
```

Exactly three fields: `name | type | uuid`. `type` is the MIME type, so filtering the
picker to PDFs is `type === "application/pdf"`, and `name` is what the picker shows.

### ✅ `callAmplenotePlugin` → `onEmbedCall` round-trip works

The embed called `window.callAmplenotePlugin("geturl")`, the plugin ran
`getNoteAttachments` + `getAttachmentURL` using `app.context.noteUUID`, and the embed
received the URL back. Confirms `app.context.noteUUID` is populated inside `onEmbedCall`.

### ✅ RESOLVED: reading attachment bytes — use Amplenote's CORS proxy

**Direct `fetch()` of the attachment URL fails. Route it through the official proxy:**

```js
const url = await app.getAttachmentURL(attachmentUUID);
const proxyURL = new URL("https://plugins.amplenote.com/cors-proxy");
proxyURL.searchParams.set("apiurl", url);
const response = await fetch(proxyURL);
const bytes = await response.arrayBuffer();   // .text() in the starter; PDFs need bytes
```

Source: [alloy-org/amplenote-embed-starter](https://github.com/alloy-org/amplenote-embed-starter/blob/main/assets/note.md).
Undocumented in the API reference — found only by reading the official starter repo.

**Verified end-to-end in a live embed against a real 1.2 MB attached PDF:**

```
gotS3Url=true
proxyStatus=200
bytes=1231189
numPages=7
textItems=95
sample=<real text extracted from page 1>
```

That single run proves the entire Phase 1 render path:
- the proxy returns **binary** intact (`arrayBuffer`, not just text)
- **PDF.js parses the document** — 7 pages
- **the PDF.js worker loads** from cdnjs (page rendering would fail without it)
- **the text layer works** — 95 text items with real strings, which is what highlight
  selection depends on

**Pinned working versions:** PDF.js **3.11.174** (`pdf.min.js` + `pdf.worker.min.js`,
UMD). Note 4.x ships as `.mjs` ES modules, which need different loading in a plain
`<script>` embed — 3.11.174 is the tested-good combination, so don't bump casually.

#### The original failure, for the record

`getAttachmentURL` returns a presigned AWS S3 URL:

```
https://ample-attachments.s3.us-west-2.amazonaws.com/<noteUUID>/<attachmentUUID>.pdf
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Expires=3600&X-Amz-Signature=...
```

`X-Amz-Expires=3600` — valid one hour. Fetch it fresh per session; never persist it.

Direct `fetch()` fails with "Failed to fetch" from **both** the embed
(`plugins.amplenote.com`) and the plugin action sandbox, because the S3 response carries
no `Access-Control-Allow-Origin`. Not a blanket network block — cdnjs scripts load fine.
**Always go through the proxy.**

`getAttachmentURL` returns a **presigned AWS S3 URL**:

```
https://ample-attachments.s3.us-west-2.amazonaws.com/<noteUUID>/<attachmentUUID>.pdf
  ?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=...&X-Amz-Date=...
  &X-Amz-Expires=3600&X-Amz-SignedHeaders=host&X-Amz-Signature=...
```

`X-Amz-Expires=3600` — the URL is valid for one hour, so it must be re-fetched per
session and never persisted.

**`fetch()` on that URL fails with "Failed to fetch" from BOTH contexts** — the embed
(`plugins.amplenote.com`) and the plugin action sandbox. Tested against a real attached
PDF, so this is no longer a proxy result.

**Why this is severe:** PDF.js loads a document via `fetch`/XHR. If neither context can
read the bytes, the standard render path does not work at all.

**It is not a blanket network block** — cdnjs scripts load fine in the same embed. So it
is specifically an XHR-class restriction: either S3 returns no
`Access-Control-Allow-Origin` for these presigned URLs, or the plugin sandbox CSP
restricts `connect-src`. The two have different owners (S3 bucket policy vs. Amplenote's
CSP) but both require an Amplenote-side change. Could not distinguish them from here —
the embed is a cross-origin iframe, so its console (where a CSP violation would name the
directive) isn't reachable from the parent page.

**Options, roughly in order of preference:**
1. **Ask Lucian.** This is precisely the kind of blocker the spec says to escalate. If
   plugins are intended to read note attachments at all, either the bucket needs a CORS
   rule or there's an undocumented accessor. Worth asking before engineering around it.
2. **Check how existing plugins read attachments** — if any published plugin does, its
   source shows the supported route.
3. **`<iframe src=presignedURL>`** renders the PDF via the browser's built-in viewer with
   no CORS involved, but gives no access to the text layer. Fails the core requirement
   (real text selection), so viable only as a degraded fallback.
4. **File input inside the embed** — the user re-picks the PDF from disk. Works, but the
   UX is poor and it ignores the attachment entirely.

### ❌ `attachNoteMedia` rejects PDFs

| Data URL | Result |
|---|---|
| `data:image/png;base64,...` | ✅ Returns `https://images.amplenote.com/<note>/<uuid>.png` |
| `data:application/pdf;base64,...` | ❌ Throws `NetworkError` |

The docs only say it throws if the file is "too large, or otherwise not allowed" — in
practice PDFs are not allowed. The test PDF was a valid 949-byte pdf-lib document, so
size is not the cause.

**Impact on Phase 4:** the spec's plan to upload the annotated PDF back to the note via
`attachNoteMedia` does not work as written. Re-read §4 though — the actual bounty
requirement is to "offer a way to export/download the PDF with those annotations baked
in." Download via a blob URL satisfies that; uploading back was the spec's own
suggestion, not a requirement. Treat upload-back as dropped unless another path appears.

### Media is not an attachment

`attachNoteMedia` succeeded and returned a URL, but `getNoteAttachments` still returned
`[]`. Media uploaded that way is **not** listed as a note attachment. The two systems are
separate; `getNoteAttachments` covers files added through the paperclip/attach control.

### Correction to the docs table

`getNoteAttachments` returns **`[]`** for an existing note with no attachments — not
`null`. (`null` is presumably reserved for a nonexistent note; not separately verified.)

### Embed script loading — two traps that both look like a hung viewer

Found by debugging a viewer that rendered its static markup and then did nothing. Both
failures are silent: no console error reaches the parent page, because the embed is a
cross-origin iframe.

**1. Amplenote re-executes the embed's inline scripts immediately.** An external
`<script src>` in the returned HTML is still downloading when the inline script after it
runs, so the library is undefined. Don't rely on classic script ordering — have the
embed's own code create the script element and wait for `onload`.

**2. Never attach embed code via an `onload="..."` attribute.** A serialized function's
source is full of double quotes, which terminate the HTML attribute at the first one.
The code silently never runs. Invoke from a `<script>` block instead.

Related: anything serialized into the inline script (including comments) must not
contain a literal closing script tag, or the block terminates early. There is a test
guarding this.

### PDF.js stalls in a hidden tab (not an Amplenote problem, but it looks like one)

Cost real debugging time during Phase 2, and would cost it again. PDF.js drives its
canvas render task off `requestAnimationFrame`, which browsers pause in a hidden or
non-compositing tab. The symptom is the viewer sitting on "Rendering..." forever with the
document parsed, the canvas element sized correctly, and no error anywhere — identical to
a genuine hang.

`document.visibilityState === "hidden"` is the tell. Nothing to fix in the plugin: an
embed in a background browser tab is supposed to wait. It matters only for automation —
`spike/harness.mjs` swaps in a timer when `document.hidden` is true at load, which is why
the harness works headless.

### The embed bridge only reliably carries strings

`window.callAmplenotePlugin(value)` → `onEmbedCall(app, value)` works with strings.
Passing a structured object hung with no error and no resolution. JSON-stringify in both
directions.

### Editing the plugin code block is hostile to automation

The code block is a **CodeMirror** editor with **automatic bracket closing**. Typing
multi-line JS produces surplus closing braces, because a typed `}` does not overtype the
auto-inserted one once a newline intervenes. Same class of hazard as the Grammarly
warning in §8.

Practical workarounds when pasting/typing code in:
- Type the plugin as a **single line** — same-line closers overtype correctly, leaving at
  most one surplus brace at the very end.
- Always verify balance before running: count `{` vs `}` in `.cm-content`.
- Real edits should use the GitHub→Amplenote sync plugin rather than typing.

## Still unverified

| Question | Why it matters | How to resolve |
|---|---|---|
| ~~Attachment object shape~~ | — | ✅ Resolved: `{ name, type, uuid }`. |
| ~~Embed CSP / CDN loading~~ | — | ✅ Resolved: cdnjs works. |
| ~~Reading attachment bytes~~ | — | ✅ Resolved: go through `plugins.amplenote.com/cors-proxy`. |
| ~~PDF.js worker loading~~ | — | ✅ Resolved: worker loads; a 7-page document parsed. |
| ~~Writing the annotated PDF back~~ | — | ✅ **Resolved and confirmed live on desktop, 2026-08-10.** Download-only: `attachNoteMedia` rejects PDFs, and §4's actual requirement is "offer a way to export/download" - upload-back was the spec's own suggestion, not the requirement. `URL.createObjectURL` + a throwaway `<a download>`, client-side in the embed, works inside Amplenote's iframe on the desktop app. **It does nothing at all in the mobile app** - no file, no error, no dialog: a `download` attribute needs the host application to handle it, and an app embedding a webview generally does not. The embed now tries the Web Share API first where it exists (how a phone saves a file anyway; it may still be refused, since Web Share must be delegated to an iframe by the host) and, failing everything, says so in the status bar rather than leaving the user waiting for a file that is never coming. |
| ~~"Double-quoted block" markdown~~ | — | ✅ Resolved: doc 4 confirms Amplenote has no colored-link syntax — a cycle color is markdown-native, `==highlighted text<!-- {"cycleColor": "N"} -->==` (or `backgroundCycleColor`). Original implementation wrapped the link itself in the highlight span; confirmed live that a highlight/mark span and a markdown link do NOT compose at all, in either nesting order (see "A highlight/mark span cannot contain a markdown link" below). `src/export.js` now emits a colored `==●<!-- {"cycleColor":"N"} -->==` marker immediately followed by a plain `[name](url)` link, then a `> "quote"` blockquote line — confirmed live, the marker renders in color and the link stays clickable. |
| ~~Cycle-color indices 12/14/15/18~~ | A wrong index means every exported link is the wrong color — a visible acceptance failure. | ✅ Mechanism confirmed live: distinct marker colors visibly rendered for coral and yellow in the same export (screenshot), consistent with `src/colors.js`'s mapping. Green (15) and blue (18) weren't independently pixel-checked in that pass - worth a quick glance next time either color is exported, but the mechanism itself (not just the guessed indices) is no longer in doubt. |
| **`prompt` radio input shape** | Needed for the "which PDF?" picker. | Check doc 2's `inputs` array detail. |

## Corrections log

Fix `test/helpers.js` **first** when reality differs from the mock, then the source. A
mock that drifts from reality makes green tests meaningless.

- **2026-08-06** — `app.notify` removed; it does not exist in the API.
- **2026-08-06** — `app.prompt` returns `null` on cancel; the mock returned `undefined`.
- **2026-08-06** — `app.context.embedArgs` is an `Array`; the mock had an object.
- **2026-08-06** — `insertNoteContent` returns nothing; the mock returned `true`.
- **2026-08-06** — `getNoteAttachments` takes a `noteHandle`, not a bare uuid string.
- **2026-08-06** — `replaceNoteContent` gained `{ section }` support in the mock.
- **2026-08-10** — finding #9 called the popup a clicked `plugin://` link shows an
  "unrecognized link" popup, implying it signals a missing `linkTarget`. It doesn't: it's
  Amplenote's ordinary link-details popup (the raw href + EDIT DETAILS / CLOSE), shown for
  every link's text click regardless. `linkTarget` is fired by the puzzle-piece icon.
