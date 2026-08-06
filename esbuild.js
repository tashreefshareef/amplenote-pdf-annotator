/**
 * Build: src/  ->  dist/plugin.js
 *
 * Why this exists (see spec section 2): an Amplenote plugin is a single self-contained JS
 * expression pasted into one code block in a note. No imports, no npm at runtime.
 * Editing that as one hand-maintained file is unworkable, so we author normal ES
 * modules in src/ and bundle them down to the single expression Amplenote wants.
 *
 * Output shape matters. Amplenote evaluates the code block and expects the result to
 * be the plugin object. We therefore wrap the whole bundle in an IIFE that RETURNS the
 * default export, so dist/plugin.js is one expression evaluating to the plugin object.
 * That form is safe whether Amplenote evals it, wraps it in `return (...)`, or parses
 * it as an object literal position.
 */
import * as esbuild from "esbuild";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const OUT_DIR = "dist";
/** Sync target for Amplenote Plugin Builder - see the format contract below. */
const SYNC_FILE = `${OUT_DIR}/plugin.js`;
/** Manual clipboard-paste fallback. */
const PASTE_FILE = `${OUT_DIR}/plugin-paste.js`;

const result = await esbuild.build({
  entryPoints: ["src/plugin.js"],
  bundle: true,
  format: "iife",
  globalName: "__pluginModule",
  platform: "browser",
  target: "es2020",
  // Readable output: this gets pasted into a note where a human may need to eyeball it,
  // and minified code makes the "did Grammarly corrupt my code block" failure (spec section 8)
  // impossible to diagnose.
  minify: false,
  // Escape non-ASCII inside string literals rather than emitting them raw. The output
  // travels through clipboards and note storage of uncertain encoding; a stray em-dash
  // in a user-facing message once arrived in Amplenote as mojibake.
  charset: "ascii",
  write: false,
});

const bundled = result.outputFiles[0].text;
const version = JSON.parse(readFileSync("package.json", "utf8")).version;

/**
 * Two artifacts from one bundle, because they have different consumers.
 *
 * dist/plugin.js is the sync target for Amplenote Plugin Builder, whose format contract
 * is strict and undocumented (read from its source, lib/plugin-import-inliner.js):
 *   - the FIRST line must contain "(() => {" - so comments go inside, not above
 *   - the content must END with "})();"
 *   - Plugin Builder rewrites that trailing "})();" into "return plugin;\n})()", so a
 *     variable literally named `plugin` must exist at the IIFE's top level
 * Miss any of these and it silently falls back to its own import-inliner, which mangles
 * an already-bundled file.
 *
 * dist/plugin-paste.js is the same code with the return already applied, for pasting
 * into the code block by hand when sync isn't set up.
 */
const body = `(() => {
  // Amplenote PDF Annotator - v${version}
  // GENERATED FILE - do not edit. Edit src/ and run \`npm run build\`.
${bundled}
  var plugin = __pluginModule.default;`;

const syncOutput = `${body}\n})();\n`;
const pasteOutput = `${body}\n  return plugin;\n})()\n`;

/**
 * The output must be pure ASCII.
 *
 * This file's delivery mechanism is a clipboard paste into a note's code block, and
 * clipboards do not reliably preserve encoding - a real paste through clip.exe turned
 * an em-dash into "a€"". esbuild already escapes non-ASCII inside string literals, so
 * the usual culprit is a comment. Fail the build rather than ship mojibake into
 * someone's plugin note.
 */
const nonAscii = [...pasteOutput].filter((ch) => ch.charCodeAt(0) > 127);
if (nonAscii.length) {
  const unique = [...new Set(nonAscii)].join(" ");
  console.error(`Build failed: ${nonAscii.length} non-ASCII character(s) in output: ${unique}`);
  console.error("Replace them with ASCII equivalents (- for dashes, ... for ellipses).");
  process.exit(1);
}

// Assert the Plugin Builder contract at build time. A violation here is invisible until
// a sync silently produces a corrupted code block in the live plugin note.
const trimmed = syncOutput.trim();
const problems = [];
if (!trimmed.split("\n")[0].includes("(() => {")) problems.push("first line must contain '(() => {'");
if (!/\}\)\(\);$/.test(trimmed)) problems.push("output must end with '})();'");
if (!/^\s*var plugin =/m.test(syncOutput)) problems.push("a top-level `var plugin =` must exist");
if (problems.length) {
  console.error("Build failed: dist/plugin.js breaks the Plugin Builder contract:");
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}

// Amplenote rejects note content over 100k characters, and Plugin Builder checks the
// same limit before writing.
const MAX_NOTE_CHARS = 100_000;
if (pasteOutput.length > MAX_NOTE_CHARS) {
  console.error(`Build failed: output is ${pasteOutput.length} chars, over Amplenote's ${MAX_NOTE_CHARS} limit.`);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(SYNC_FILE, syncOutput, "utf8");
writeFileSync(PASTE_FILE, pasteOutput, "utf8");

const kb = (Buffer.byteLength(pasteOutput, "utf8") / 1024).toFixed(1);
const headroom = Math.round((1 - pasteOutput.length / MAX_NOTE_CHARS) * 100);
console.log(`Built ${SYNC_FILE} + ${PASTE_FILE} (${kb} kB, ${headroom}% under the note limit)`);
