# Verified Amplenote API notes

Purpose: one place for **confirmed** method signatures, so nothing in `src/` is built on
a guess. The spec (§1) is explicit — do not guess signatures, look them up.

Sources:
1. Plugin dev guide — https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
2. App interface (LLM markdown) — https://public.amplenote.com/C8TUXf394zsvrGn8NwXgoJ7f.md
3. Actions reference — https://www.amplenote.com/help/developing_amplenote_plugins/actions
4. Markdown reference / cycle colors — https://www.amplenote.com/help/plugin_api_markdown_reference_parse_markdown

**Last verified against source 2 on 2026-08-06.**

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

### ❌ BLOCKER: cross-origin fetch of Amplenote-hosted media fails

Fetching `https://images.amplenote.com/...` returned **"Failed to fetch"** from BOTH the
embed context and the plugin action context.

**Caveat — this is a proxy test, not the real one.** It used a media URL from
`attachNoteMedia`, not a URL from `getAttachmentURL`. Attachment URLs are temporary and
may well carry permissive CORS headers precisely because plugins are meant to read them.
**Must be re-tested against a genuine PDF attachment before treating it as fatal.**

If it does hold for real attachments, the fallbacks are: read the bytes in the plugin
context and pass base64 to the embed via `renderEmbed` args or `onEmbedCall` (only viable
if the plugin context can fetch), or fall back to a user-supplied file input inside the
embed.

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
| **Attachment object shape** | Need a uuid for `getAttachmentURL`, plus a name/mime type to filter for PDFs and populate the picker. | **Blocked:** needs a real PDF attachment on a test note. `attachNoteMedia` can't create one and file upload is sandboxed off, so a human must attach it. |
| **CORS on `getAttachmentURL`** | **THE Phase 1 blocker.** A proxy test against `images.amplenote.com` failed from both contexts; unknown whether real attachment URLs behave the same. | Same blocker as above — re-run the probe once a PDF is attached. |
| ~~Embed CSP / CDN loading~~ | — | ✅ Resolved above: cdnjs works. |
| **PDF.js worker loading** | The worker is a separate cross-origin script; it can fail even when the main library loads. | Test alongside the attachment probe. Fallback is `disableWorker`, at a performance cost. |
| **Cycle-color indices 12/14/15/18** | A wrong index means every exported link is the wrong color — a visible acceptance failure. | Check doc 4 before Phase 5. |
| **"Double-quoted block" markdown** | The export format must match the requirements note exactly. | Check doc 4 before Phase 5. |
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
