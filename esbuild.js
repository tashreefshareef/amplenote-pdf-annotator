/**
 * Build: src/  →  dist/plugin.js
 *
 * Why this exists (see spec §2): an Amplenote plugin is a single self-contained JS
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
const OUT_FILE = `${OUT_DIR}/plugin.js`;

const result = await esbuild.build({
  entryPoints: ["src/plugin.js"],
  bundle: true,
  format: "iife",
  globalName: "__pluginModule",
  platform: "browser",
  target: "es2020",
  // Readable output: this gets pasted into a note where a human may need to eyeball it,
  // and minified code makes the "did Grammarly corrupt my code block" failure (spec §8)
  // impossible to diagnose.
  minify: false,
  write: false,
});

const bundled = result.outputFiles[0].text;
const version = JSON.parse(readFileSync("package.json", "utf8")).version;

const output = `// Amplenote PDF Annotator - v${version}
// GENERATED FILE - do not edit. Edit src/ and run \`npm run build\`.
// Paste the entire contents of this file into the plugin note's code block.
(() => {
${bundled}
  return __pluginModule.default;
})()
`;

/**
 * The output must be pure ASCII.
 *
 * This file's delivery mechanism is a clipboard paste into a note's code block, and
 * clipboards do not reliably preserve encoding — a real paste through clip.exe turned
 * an em-dash into "a€"". esbuild already escapes non-ASCII inside string literals, so
 * the usual culprit is a comment. Fail the build rather than ship mojibake into
 * someone's plugin note.
 */
const nonAscii = [...output].filter((ch) => ch.charCodeAt(0) > 127);
if (nonAscii.length) {
  const unique = [...new Set(nonAscii)].join(" ");
  console.error(`Build failed: ${nonAscii.length} non-ASCII character(s) in output: ${unique}`);
  console.error("Replace them with ASCII equivalents (- for dashes, ... for ellipses).");
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, output, "utf8");

const kb = (Buffer.byteLength(output, "utf8") / 1024).toFixed(1);
console.log(`Built ${OUT_FILE} (${kb} kB)`);
