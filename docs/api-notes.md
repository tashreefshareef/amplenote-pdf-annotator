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

8. **A highlight/mark span (`==text==`) cannot contain a markdown link, in EITHER nesting
   order.** Tried both live, through the real write path (see #7 - paste is not valid
   evidence for this either): `==[text](url)<!--json-->==` (mark wrapping a link) and
   `[==text<!--json-->==](url)` (link wrapping a mark) both rendered as a plain,
   completely uncolored link - the mark's color silently dropped in both cases, no error,
   no partial styling. If a plugin needs both a color-coded marker AND a clickable link on
   the same line, DECOUPLE them into two separate constructs next to each other -
   `==●<!-- {"cycleColor":"N"} -->== [text](url)`, a colored throwaway character
   immediately followed by a plain link - rather than trying to make one construct do
   both. Confirmed live: the decoupled form renders correctly, marker in color, link
   plain and clickable.

9. **A clickable `[text](plugin://UUID?args)` markdown link does NOT route to
   `renderEmbed` - it routes to a completely separate, easy-to-miss action called
   `linkTarget`.** `renderEmbed` only ever handles the `<object data="plugin://...">`
   EMBED tag; a plain link using the identical `plugin://` scheme is a different
   mechanism entirely, with its own action (`linkTarget(app, ...args)`, args being the
   query string, same shape as `renderEmbed`/`onEmbedCall`). Confirmed live the hard way:
   a plugin that builds deep-link markdown (e.g. "click to jump back to X") but never
   defines `linkTarget` produces links that just sit there - Amplenote shows its own
   generic "unrecognized link" popup instead of doing anything, no error, nothing to
   suggest what's missing. **If a plugin generates ANY clickable `plugin://` link, it
   MUST define `linkTarget` too, or the link is decorative.** Separately: `linkTarget`
   can `app.navigate` to a note (`https://www.amplenote.com/notes/NOTE_UUID`, confirmed
   real), but there is no documented way to pass embed arguments alongside that
   navigation - if the goal is "jump to a specific state inside an embed on a different
   note," the args have to already be baked into that note's OWN embed tag before
   navigating there (see `updateEmbedArgs` below), since `updateEmbedArgs`/`renderEmbed`
   only work "already operating within that embed's context" per Amplenote's own docs -
   there's no cross-note equivalent.

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
| ~~Writing the annotated PDF back~~ | — | ✅ Resolved as download-only: `attachNoteMedia` rejects PDFs, and §4's actual requirement is "offer a way to export/download" - upload-back was the spec's own suggestion, not the requirement. Implemented via `URL.createObjectURL` + a throwaway `<a download>`, client-side in the embed. Not yet clicked through in live Amplenote (verified in the dev harness against a real pdf-lib CDN load and a re-parsed, correctly-annotated PDF) - still needs a real-app pass to confirm the download dialog itself behaves the same inside Amplenote's iframe. |
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
