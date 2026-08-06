/**
 * Build a standalone harness page for the embed, then serve it.
 *
 *   npm run harness   ->  http://localhost:4173
 *
 * Why this exists: the viewer's selection geometry only means anything in a real browser
 * with a real PDF.js text layer, and the round-trip to Amplenote (build, push, refresh,
 * reload the note) is far too slow a loop to debug coordinates in. This page runs the
 * SAME embed HTML `renderEmbed` returns, against the SAME plugin-side handler, with only
 * two things faked:
 *
 *   - `getPdfUrl` serves a local sample instead of going through Amplenote's CORS proxy
 *   - the note lives in memory instead of in Amplenote
 *
 * Everything else - the viewer, the geometry helpers, embed-call, storage, highlights -
 * is the real code. What it CANNOT tell you is whether Amplenote's sandbox accepts the
 * embed; only the live app answers that. See docs/api-notes.md.
 *
 * Throwaway tooling, not part of the plugin. Output goes to spike/out/, which is
 * gitignored.
 */
import * as esbuild from "esbuild";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join } from "node:path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { buildEmbedHtml } from "../src/embed/html.js";

const OUT = "spike/out/harness";
const PORT = 4173;
mkdirSync(OUT, { recursive: true });

// --- a text-heavy sample PDF ------------------------------------------------
// Two pages on purpose: identical coordinates on different pages must not collide, and
// a selection dragged across the page break is a case the viewer has to handle.
const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

const paragraph = [
  "The quick brown fox jumps over the lazy dog near the riverbank.",
  "Selection geometry has to survive a line wrap, so this paragraph",
  "deliberately runs across several lines of ordinary body text at a",
  "single size, with no unusual spacing anywhere in the run.",
  "",
  "A second paragraph, separated by a blank line, checks that merging",
  "never joins two separate lines into one solid block.",
];

const page1 = pdf.addPage([612, 792]);
page1.drawText("Highlight harness - page one", { x: 72, y: 720, size: 18, font: bold, color: rgb(0.1, 0.1, 0.1) });
paragraph.forEach((line, i) => {
  page1.drawText(line, { x: 72, y: 660 - i * 20, size: 12, font, color: rgb(0.15, 0.15, 0.15) });
});
// Two columns sharing a baseline: merging across the gutter would be visible here.
page1.drawText("Left column text", { x: 72, y: 460, size: 12, font });
page1.drawText("Right column text", { x: 360, y: 460, size: 12, font });

// Trailing whitespace in the content stream, which designed PDFs carry all the time.
// PDF.js makes the text-layer span as wide as the run INCLUDING those spaces, so a
// selection reaches past the last visible glyph and the highlight paints a band running
// off the end of the sentence. Reported from a real insurance PDF; this line reproduces
// it on demand.
page1.drawText("This sentence is padded with trailing spaces.                    ", {
  x: 72,
  y: 420,
  size: 12,
  font,
});
page1.drawText("       Leading spaces pad this one.", { x: 72, y: 400, size: 12, font });

const page2 = pdf.addPage([612, 792]);
page2.drawText("Page two exists to test per-page coordinates", { x: 72, y: 700, size: 14, font: bold });
page2.drawText("Identical coordinates on another page must not collide.", { x: 72, y: 660, size: 12, font });

writeFileSync(join(OUT, "sample.pdf"), await pdf.save());

// --- the bridge -------------------------------------------------------------
await esbuild.build({
  entryPoints: ["spike/harness-bridge.js"],
  bundle: true,
  format: "iife",
  platform: "browser",
  target: "es2020",
  outfile: join(OUT, "bridge.js"),
});

// --- the page ---------------------------------------------------------------
// The bridge must exist before the viewer boots, so it loads ahead of the embed markup.
// In the real app Amplenote provides `callAmplenotePlugin` itself.
const embed = buildEmbedHtml({
  attachmentUUID: "attach-1",
  attachmentName: "sample.pdf",
  lightDarkMode: process.argv.includes("--dark") ? "dark" : "light",
});

// The rAF shim is harness-only. PDF.js drives its canvas render task off
// requestAnimationFrame, which browsers pause in a hidden or non-compositing tab - so
// under headless automation the viewer stalls on "Rendering..." forever with nothing
// wrong in its own code. A timer keeps it moving. Real visible use is untouched.
writeFileSync(
  join(OUT, "index.html"),
  `<!doctype html><html><head><meta charset="utf-8"><title>PDF Annotator harness</title></head>
<body>
<script>
if (document.hidden) {
  window.requestAnimationFrame = function (cb) {
    return setTimeout(function () { cb(performance.now()); }, 16);
  };
}
</script>
<script src="bridge.js"></script>
${embed}
</body></html>`
);

// --- serve ------------------------------------------------------------------
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".pdf": "application/pdf" };

createServer((req, res) => {
  const path = req.url.split("?")[0];
  const file = join(OUT, path === "/" ? "index.html" : path);
  if (!existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file)] || "application/octet-stream" });
  res.end(readFileSync(file));
}).listen(PORT, () => console.log(`harness on http://localhost:${PORT}`));
