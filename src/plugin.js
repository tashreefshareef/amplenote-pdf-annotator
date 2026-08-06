/**
 * The Amplenote plugin object.
 *
 * Keep this file THIN. Every action here should immediately delegate to a pure,
 * importable function in src/actions/ that takes `app` as its first parameter.
 * Logic written inline here (or welded into an embed HTML string) cannot be reached
 * by the Jest suite, and an untestable action is a T&C compliance problem, not just
 * a style preference. See spec §5.2 and §8.
 *
 * Built by esbuild into dist/plugin.js as a single expression. Do not paste THIS file
 * into Amplenote — paste the build output.
 */
import { annotatePdf } from "./actions/annotate-pdf.js";

const plugin = {
  noteOption: {
    "Annotate PDF": async function (app, noteUUID) {
      return annotatePdf(app, noteUUID);
    },
  },
};

export default plugin;
