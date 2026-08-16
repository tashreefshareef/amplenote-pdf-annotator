/**
 * The Amplenote plugin object.
 *
 * Keep this file THIN. Every action delegates immediately to a pure, importable function
 * in src/ that takes `app` as its first parameter. Logic written inline here - or welded
 * into an embed HTML string - cannot be reached by the Jest suite, and an untestable
 * action is a T&C compliance problem, not just a style preference. See spec section 5.2 and section 8.
 *
 * Built by esbuild into dist/plugin.js as a single expression. Do not paste THIS file
 * into Amplenote - paste the build output.
 */
import { annotatePdf } from "./actions/annotate-pdf.js";
import { linkTarget } from "./actions/link-target.js";
import { handleEmbedCallSerialized } from "./embed-call.js";
import { buildEmbedHtml } from "./embed/html.js";
import { parseEmbedArgs } from "./embed-args.js";
import { parseToolbarColorIds } from "./colors.js";
import { COLOR_SETTING_NAME } from "./constants.js";

const plugin = {
  noteOption: {
    "Annotate PDF": async function (app, noteUUID) {
      // `app.context.pluginUUID` identifies this plugin's own note, which is what
      // `plugin://` markup must point at.
      return annotatePdf(app, noteUUID, app.context.pluginUUID);
    },
  },

  /*
   * THERE IS NO `insertText` ACTION, and adding one back will not do what it looks like.
   *
   * It existed to place a viewer at the cursor: the user typed `{PDF Annotator}` where
   * they wanted it and Amplenote substituted this plugin's return string for that
   * expression. Reported live with a screenshot - the returned `<object data="plugin://">`
   * tag arrived in the note as LITERAL TEXT, tag and all, where the identical string
   * written by "Annotate PDF" through `insertNoteContent` renders as a viewer.
   *
   * So `insertText` substitutes text, not note source, and an embed cannot be created
   * through it. Placing one at the expression's position instead would need a whole-note
   * write, which destroys the footnote registering the note's PDF attachment
   * (docs/api-notes.md #17) - the very PDF the viewer is for. With cursor placement off
   * the table the action had no purpose left that "Annotate PDF" does not already serve,
   * so it is gone rather than kept as a second, worse door to the same room.
   */

  // Handles a CLICKED `plugin://` link (an exported highlight's deep link) - distinct
  // from renderEmbed, which only ever handles the <object> embed tag. See
  // src/actions/link-target.js for why both are needed and what each does.
  linkTarget: async function (app, ...args) {
    return linkTarget(app, args[0]);
  },

  /**
   * Amplenote passes embed parameters as a single query string, e.g. "att=abc&page=3".
   */
  renderEmbed: function (app, ...args) {
    const { attachmentUUID, page, highlightId, collapsed, attachmentName, aspectRatio } =
      parseEmbedArgs(args[0]);

    if (!attachmentUUID) {
      return `<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`;
    }

    return buildEmbedHtml({
      attachmentUUID,
      page,
      highlightId,
      // Carried in the tag rather than held in the embed, because collapsing rewrites the
      // tag anyway (to shrink the box) and that rewrite re-renders the embed - so the
      // viewer has to come back up collapsed, not spring open again.
      collapsed,
      // Comes from the tag, so the toolbar and every exported highlight are labelled from
      // the first paint - no round-trip, and no dependence on the runtime attachment
      // lookup that was silently returning "" (see parseEmbedArgs).
      attachmentName,
      // Whether THIS viewer is wearing a height its reader chose. The viewer cannot read
      // its own tag, and it needs to know: on a wide box that is the only thing that makes
      // "Restore height" appear, and on a narrow one it is how "Fit to this screen" knows
      // it has already been used.
      aspectRatio,
      lightDarkMode: app.context.lightDarkMode,
      // Needed to build the `plugin://` deep link in an exported highlight - see
      // src/export.js. Available here the same way annotate-pdf.js already gets it.
      pluginUUID: app.context.pluginUUID,
      // Captured HERE, at the moment Amplenote is definitively rendering THIS note's
      // embed, and threaded through every embed-call request from here on (see
      // viewer.js/embed-call.js) - rather than trusted fresh on `app.context.noteUUID`
      // inside onEmbedCall itself. Suspected root cause of a real bug: switching away
      // from a note and back made an already-saved, still-present highlight vanish from
      // the viewer, consistent with onEmbedCall's own `app.context.noteUUID` reading a
      // stale note id after the embed remounts, causing loadHighlights to look at the
      // wrong note.
      noteUUID: app.context.noteUUID,
      // Which four colors get toolbar circles, from the plugin note's
      // `setting | Highlight colors` row. Read HERE rather than inside the embed because
      // `app.settings` only exists plugin-side, and read on every render rather than
      // cached because that is the only moment the current value can reach a viewer:
      // changing a setting does not re-render an embed that is already mounted, so a new
      // value lands when the viewer next opens (see constants.js).
      toolbarColorIds: parseToolbarColorIds(
        app.settings ? app.settings[COLOR_SETTING_NAME] : null
      ),
    });
  },

  onEmbedCall: async function (app, ...args) {
    return handleEmbedCallSerialized(app, args[0]);
  },
};

export default plugin;
