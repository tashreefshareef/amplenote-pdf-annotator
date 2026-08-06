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
  },

  /**
   * Amplenote passes embed parameters as a single query string, e.g. "att=abc&page=3".
   */
  renderEmbed: function (app, ...args) {
    const { attachmentUUID, page } = parseEmbedArgs(args[0]);

    if (!attachmentUUID) {
      return `<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`;
    }

    return buildEmbedHtml({
      attachmentUUID,
      page,
      lightDarkMode: app.context.lightDarkMode,
    });
  },

  onEmbedCall: async function (app, ...args) {
    return handleEmbedCallSerialized(app, args[0]);
  },
};

export default plugin;
