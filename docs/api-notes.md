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

## Still unverified

| Question | Why it matters | How to resolve |
|---|---|---|
| **Attachment object shape** | Need a uuid to call `getAttachmentURL`, and a name/mime type to filter for PDFs and to show in the picker. Docs confirm `uuid` exists but don't list the rest. | Runtime discovery in Phase 1 — log the array from a real note. |
| **CORS on `getAttachmentURL`** | Phase 1 blocker. If the embed can't `fetch()` those bytes, the whole render path changes. | Try it in Phase 1; fallback is round-tripping bytes through `onEmbedCall`. |
| **Embed CSP / CDN loading** | Phase 1 blocker. Can the embed load PDF.js + worker and pdf-lib from cdnjs? | Try it; fallbacks are another CDN, or inlining the library. |
| **Cycle-color indices 12/14/15/18** | A wrong index means every exported link is the wrong color — a visible acceptance failure. | Check doc 4 before Phase 5. |
| **"Double-quoted block" markdown** | The export format must match the requirements note exactly. | Check doc 4 before Phase 5. |
| **Deep-link URL format** | Determines the link written into every exported highlight. | Check docs 1/3 before Phase 5. |
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
