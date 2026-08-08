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
import { dumpMarkdown } from "./actions/dump-markdown.js";
import { insertViewer } from "./actions/insert-viewer.js";
import { linkTarget } from "./actions/link-target.js";
import { handleEmbedCallSerialized } from "./embed-call.js";
import { buildEmbedHtml } from "./embed/html.js";
import { parseEmbedArgs } from "./embed-args.js";

const plugin = {
  noteOption: {
    "Annotate PDF": async function (app, noteUUID) {
      // `app.context.pluginUUID` identifies this plugin's own note, which is what
      // `plugin://` markup must point at.
      return annotatePdf(app, noteUUID, app.context.pluginUUID);
    },

    // TEMPORARY - remove once we know how an attachment chip is represented in markdown.
    // See src/actions/dump-markdown.js.
    "Debug: dump note markdown": async function (app, noteUUID) {
      return dumpMarkdown(app, noteUUID);
    },
  },

  /**
   * Typing `{PDF Annotator}` in a note drops a viewer at THAT spot, instead of appending
   * to the bottom like the note-menu option must. Amplenote substitutes this return value
   * for the expression in place - the only cursor-positioned write the API offers.
   *
   * Declared as a bare function, not a `{ keyword: fn }` map: the documented form is
   * `insertText(app)` with the keyword defaulting to the plugin's name, and the map form
   * is unverified here.
   */
  insertText: async function (app) {
    return insertViewer(app, app.context.noteUUID, app.context.pluginUUID);
  },

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
    const { attachmentUUID, page, highlightId, collapsed } = parseEmbedArgs(args[0]);

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
    });
  },

  onEmbedCall: async function (app, ...args) {
    return handleEmbedCallSerialized(app, args[0]);
  },
};

export default plugin;
