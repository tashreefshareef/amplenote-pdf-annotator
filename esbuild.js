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

/**
 * Compress the embed stylesheet on its way into the bundle.
 *
 * WHY A PLUGIN AND NOT JUST TIDIER CSS. src/embed/styles.js exports the stylesheet as a
 * template literal, and esbuild has no idea that string is CSS - `minify: true` compresses
 * the JS around it and ships the string byte for byte. That put 33.5k characters into a
 * note capped at 100k, 22k of them comments, at a point where the whole bundle had about
 * 1k of headroom left. Minifying here recovers roughly a quarter of the note.
 *
 * The transform is esbuild's own CSS minifier rather than a regex: a regex that strips
 * "comments" also eats the "//" inside a url(), and one that collapses whitespace joins
 * selectors across a newline. This parses the CSS properly or fails loudly.
 *
 * JSON.stringify, not a re-emitted template literal, so a backtick or a "${" that someone
 * later writes into the CSS cannot escape the string and silently corrupt the bundle.
 *
 * THE MATCH IS ASSERTED. If styles.js is ever reshaped - renamed export, a second
 * declaration, a helper alongside it - this must fail the build rather than quietly pass
 * the file through unminified and let the note creep back over its cap months later.
 */
const minifyStylesheet = {
  name: "minify-embed-stylesheet",
  setup(build) {
    build.onLoad({ filter: /[\\/]embed[\\/]styles\.js$/ }, async (args) => {
      const source = readFileSync(args.path, "utf8");
      const match = source.match(/export const STYLES = `([\s\S]*?)\n`;\s*$/);
      if (!match) {
        throw new Error(
          "minify-embed-stylesheet: src/embed/styles.js no longer ends in a single " +
            "`export const STYLES = \\`...\\`;`. Fix this plugin's pattern rather than " +
            "removing it, or the stylesheet ships unminified and the note creeps over 100k."
        );
      }
      const { code } = await esbuild.transform(match[1], { loader: "css", minify: true });
      cssSaving = match[1].length - code.length;
      return { contents: `export const STYLES = ${JSON.stringify(code)};`, loader: "js" };
    });
  },
};

/**
 * Strip the embed markup's HTML comments on their way into the bundle.
 *
 * SAME BLIND SPOT AS THE STYLESHEET, found the same way - by measuring the note against
 * its cap. esbuild's minifier removes JS comments, so the long explanations in viewer.js
 * cost the note nothing; the ones in src/embed/html.js are `<!-- ... -->` INSIDE a
 * template literal, which is string data to a JS minifier and ships byte for byte. There
 * were 7,908 characters of them - 8% of a note capped at 100k - at a point where the
 * bundle had about 1,000 characters of headroom left.
 *
 * A regex over the module source, unlike the stylesheet's real CSS parser, so it is
 * deliberately narrow: only `<!--`/`-->` pairs, nothing about whitespace. Collapsing
 * indentation would save more and would also change rendering, because whitespace between
 * inline elements is a text node the browser lays out.
 *
 * TWO ASSERTIONS, for the two ways this can silently stop working: no comments found at
 * all (the file was reshaped, and the note quietly creeps back over its cap), and a `${}`
 * inside a comment (an interpolation would be deleted with it, which would remove real
 * markup rather than an explanation).
 */
const stripEmbedMarkupComments = {
  name: "strip-embed-markup-comments",
  setup(build) {
    build.onLoad({ filter: /[\\/]embed[\\/]html\.js$/ }, (args) => {
      const source = readFileSync(args.path, "utf8");
      const comments = source.match(/<!--[\s\S]*?-->/g) || [];
      if (!comments.length) {
        throw new Error(
          "strip-embed-markup-comments: no HTML comments found in src/embed/html.js. " +
            "Fix this plugin's pattern rather than removing it, or the markup's comments " +
            "ship in the note and it creeps over 100k."
        );
      }
      const interpolated = comments.find((c) => c.includes("${"));
      if (interpolated) {
        throw new Error(
          "strip-embed-markup-comments: an HTML comment in src/embed/html.js contains a " +
            "template interpolation, which stripping it would delete:\n" +
            interpolated.slice(0, 200)
        );
      }
      htmlSaving = comments.reduce((n, c) => n + c.length, 0);
      return { contents: source.replace(/<!--[\s\S]*?-->/g, ""), loader: "js" };
    });
  },
};

/** Reported at the end of the build, so a regression in the above is visible. */
let cssSaving = 0;
let htmlSaving = 0;
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
  // Minified. Was deliberately readable (minify: false) for a while, on the theory a
  // human might need to eyeball the pasted code directly in Amplenote - but an
  // unminified ~92k-character, 2000+ line note turned out to make the PLUGIN NOTE ITSELF
  // hang the whole browser tab for minutes just to open it (reported live; the note was
  // at ~93% of Amplenote's own 100k-character cap). That cost is paid on every open, not
  // just when something needs debugging - and the actual source for debugging is src/ in
  // git, not the generated paste, which this file's own header already says not to edit.
  // Minifying trades "readable if you scroll into the pasted block" for "the note is
  // actually usable," which is the right trade given the paste was never meant to be
  // the place you read from.
  minify: true,
  // Escape non-ASCII inside string literals rather than emitting them raw. The output
  // travels through clipboards and note storage of uncertain encoding; a stray em-dash
  // in a user-facing message once arrived in Amplenote as mojibake.
  charset: "ascii",
  plugins: [minifyStylesheet, stripEmbedMarkupComments],
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
console.log(`  stylesheet minified: ${cssSaving.toLocaleString("en-US")} characters saved`);
console.log(`  markup comments stripped: ${htmlSaving.toLocaleString("en-US")} characters saved`);
