// Amplenote PDF Annotator — v0.1.0
// GENERATED FILE — do not edit. Edit src/ and run `npm run build`.
// Paste the entire contents of this file into the plugin note's code block.
(() => {
var __pluginModule = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/plugin.js
  var plugin_exports = {};
  __export(plugin_exports, {
    default: () => plugin_default
  });

  // src/actions/annotate-pdf.js
  async function annotatePdf(app, noteUUID) {
    await app.alert(
      "PDF Annotator is installed and wired up.\n\nPhase 0: this confirms the note option fires. PDF selection and the annotator embed land in Phase 1."
    );
    return noteUUID;
  }

  // src/plugin.js
  var plugin = {
    noteOption: {
      "Annotate PDF": async function(app, noteUUID) {
        return annotatePdf(app, noteUUID);
      }
    }
  };
  var plugin_default = plugin;
  return __toCommonJS(plugin_exports);
})();

  return __pluginModule.default;
})()
