# Verified Amplenote API notes

Purpose: one place for **confirmed** method signatures, so nothing in `src/` is built on
a guess. The spec (§1) is explicit — do not guess signatures, look them up.

Sources:
1. Plugin dev guide — https://www.amplenote.com/help/guide_to_developing_amplenote_plugins
2. App interface (LLM markdown) — https://public.amplenote.com/C8TUXf394zsvrGn8NwXgoJ7f.md
3. Actions reference — https://www.amplenote.com/help/developing_amplenote_plugins/actions
4. Markdown reference / cycle colors — https://www.amplenote.com/help/plugin_api_markdown_reference_parse_markdown

## Status

**Nothing below is verified yet.** These are the open questions to answer by reading the
docs above, before Phase 1 writes code against them. Replace each row with the confirmed
signature and mark it verified as you go.

| Need | Assumed name | Verified? | Notes |
|------|--------------|-----------|-------|
| List a note's attachments | `app.getNoteAttachments(noteUUID)` | ❌ | Return shape? Does it include a uuid and a mime type? |
| Get attachment bytes/URL | `app.getAttachmentURL(...)` | ❌ | **Critical for Phase 1.** Bytes directly, or a URL to fetch? If a URL, is it CORS-fetchable from inside the embed? |
| Upload the annotated PDF | `app.attachNoteMedia(note, dataURL)` | ❌ | Data URL only, or Blob? Size limit for a multi-MB PDF? |
| Read note content | `app.getNoteContent({ uuid })` | ❌ | Markdown string? |
| Write note content | `app.replaceNoteContent({ uuid }, content)` | ❌ | Whole-note replace — needed for the managed storage section. |
| Append to a note | `app.insertNoteContent({ uuid }, content, { atEnd: true })` | ❌ | For "send highlight to note". |
| Create the export note | `app.createNote(name, tags)` | ❌ | Returns uuid? Behavior if the name already exists? |
| Prompt the user | `app.prompt(message, { inputs: [...] })` | ❌ | Radio input shape, for picking which PDF. |
| Embed args | `app.context.updateEmbedArgs(...)` + `app.context.renderEmbed()` | ❌ | Exact call order for the deep-link jump. |
| Light/dark | `app.context.lightDarkMode` | ❌ | Values: `"light"` / `"dark"`? |

## Open questions beyond signatures

- **Cycle-color indices.** `src/constants.js` hardcodes 12/14/15/18 from the bounty note.
  Confirm against doc 4 before Phase 5 — a wrong index means every exported link is the
  wrong color, which is a visible acceptance failure.
- **"Double-quoted block".** Confirm the exact markdown Amplenote produces for the
  export format in spec §4. Match the layout in the requirements note precisely.
- **Deep-link format.** What URL scheme opens a plugin embed with arguments? This
  determines the link written into every exported highlight (spec §7.3).
- **Embed CSP.** Can the embed load PDF.js + its worker and pdf-lib from cdnjs?
  Blocking issue for Phase 1; fallbacks are another CDN, or inlining the library text.

## Corrections log

When a real signature differs from what `test/helpers.js` mocks, fix the mock **first**,
then the source. A mock that drifts from reality makes green tests meaningless.

_(empty)_
