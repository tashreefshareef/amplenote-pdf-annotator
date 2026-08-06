// Amplenote PDF Annotator - v0.1.0
// GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
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

  // src/constants.js
  var CDN = {
    pdfJs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    pdfJsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    pdfLib: "https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js"
  };
  var CORS_PROXY = "https://plugins.amplenote.com/cors-proxy";
  function proxiedURL(attachmentURL) {
    const url = new URL(CORS_PROXY);
    url.searchParams.set("apiurl", attachmentURL);
    return url.toString();
  }

  // src/attachments.js
  var PDF_MIME = "application/pdf";
  function pdfAttachments(attachments) {
    if (!Array.isArray(attachments)) return [];
    return attachments.filter((a) => a && a.type === PDF_MIME && a.uuid);
  }
  async function choosePdfAttachment(app, noteUUID) {
    const all = await app.getNoteAttachments({ uuid: noteUUID });
    const pdfs = pdfAttachments(all);
    if (pdfs.length === 0) return null;
    if (pdfs.length === 1) return pdfs[0];
    const result = await app.prompt("Which PDF do you want to annotate?", {
      inputs: [
        {
          label: "PDF",
          type: "radio",
          options: pdfs.map((a) => ({ label: a.name, value: a.uuid })),
          value: pdfs[0].uuid
        }
      ]
    });
    if (result === null || result === void 0) return null;
    const chosenUUID = Array.isArray(result) ? result[0] : result;
    return pdfs.find((a) => a.uuid === chosenUUID) || null;
  }
  async function fetchableAttachmentURL(app, attachmentUUID) {
    if (!attachmentUUID) throw new Error("fetchableAttachmentURL: attachmentUUID required");
    const signed = await app.getAttachmentURL(attachmentUUID);
    if (!signed) throw new Error(`No URL returned for attachment ${attachmentUUID}`);
    return proxiedURL(signed);
  }

  // src/embed-args.js
  function parseEmbedArgs(arg) {
    const empty = { attachmentUUID: null, page: null, x: null, y: null, highlightId: null };
    if (!arg || typeof arg !== "string") return empty;
    let params;
    try {
      params = new URLSearchParams(arg.replace(/^\?/, ""));
    } catch {
      return empty;
    }
    const num = (key) => {
      const raw = params.get(key);
      if (raw === null || raw.trim() === "") return null;
      const value = Number(raw);
      return Number.isFinite(value) ? value : null;
    };
    const page = num("page");
    return {
      attachmentUUID: params.get("att") || null,
      // Pages are 1-based in every user-facing context; reject 0 and negatives rather
      // than silently scrolling somewhere unexpected.
      page: page !== null && page >= 1 ? Math.floor(page) : null,
      x: num("x"),
      y: num("y"),
      highlightId: params.get("hl") || null
    };
  }
  function buildEmbedArgs({ attachmentUUID, page, x, y, highlightId } = {}) {
    const params = new URLSearchParams();
    if (attachmentUUID) params.set("att", attachmentUUID);
    if (Number.isFinite(page) && page >= 1) params.set("page", String(Math.floor(page)));
    if (Number.isFinite(x)) params.set("x", String(x));
    if (Number.isFinite(y)) params.set("y", String(y));
    if (highlightId) params.set("hl", highlightId);
    return params.toString();
  }
  function buildEmbedMarkup(pluginUUID, args = {}, aspectRatio = 1.2) {
    if (!pluginUUID) throw new Error("buildEmbedMarkup: pluginUUID required");
    const query = buildEmbedArgs(args);
    const target = query ? `plugin://${pluginUUID}?${query}` : `plugin://${pluginUUID}`;
    return `<object data="${target}" data-aspect-ratio="${aspectRatio}" />`;
  }
  function hasEmbedFor(noteContent, pluginUUID, attachmentUUID = null) {
    if (!noteContent || !pluginUUID) return false;
    if (!noteContent.includes(`plugin://${pluginUUID}`)) return false;
    if (!attachmentUUID) return true;
    return noteContent.includes(`att=${attachmentUUID}`);
  }

  // src/actions/annotate-pdf.js
  async function annotatePdf(app, noteUUID, pluginUUID) {
    const attachment = await choosePdfAttachment(app, noteUUID);
    if (!attachment) {
      const all = await app.getNoteAttachments({ uuid: noteUUID });
      const hasAny = Array.isArray(all) && all.length > 0;
      if (!hasAny || !all.some((a) => a && a.type === "application/pdf")) {
        await app.alert(
          "No PDF attachments on this note.\n\nAttach a PDF with the paperclip button in the note toolbar, then run this again."
        );
      }
      return null;
    }
    const content = await app.getNoteContent({ uuid: noteUUID });
    if (hasEmbedFor(content, pluginUUID, attachment.uuid)) {
      await app.alert(`"${attachment.name}" is already open in this note \u2014 scroll to the viewer.`);
      return attachment.uuid;
    }
    await app.insertNoteContent(
      { uuid: noteUUID },
      `
${buildEmbedMarkup(pluginUUID, { attachmentUUID: attachment.uuid })}
`,
      { atEnd: true }
    );
    return attachment.uuid;
  }

  // src/embed-call.js
  async function attachmentName(app, attachmentUUID) {
    try {
      const list = await app.getNoteAttachments({ uuid: app.context.noteUUID });
      const match = Array.isArray(list) && list.find((a) => a && a.uuid === attachmentUUID);
      return match ? match.name : "";
    } catch {
      return "";
    }
  }
  function parseEmbedPayload(payload) {
    if (payload && typeof payload === "object") return payload;
    if (typeof payload !== "string") return {};
    const trimmed = payload.trim();
    if (!trimmed.startsWith("{")) return { action: trimmed };
    try {
      return JSON.parse(trimmed);
    } catch {
      return { action: trimmed };
    }
  }
  async function handleEmbedCallSerialized(app, payload) {
    return JSON.stringify(await handleEmbedCall(app, parseEmbedPayload(payload)));
  }
  async function handleEmbedCall(app, payload) {
    const request = parseEmbedPayload(payload);
    switch (request.action) {
      case "getPdfUrl": {
        const attachmentUUID = request.attachmentUUID;
        if (!attachmentUUID) return { error: "No attachment specified for this viewer." };
        try {
          const url = await fetchableAttachmentURL(app, attachmentUUID);
          return { url, name: await attachmentName(app, attachmentUUID) };
        } catch (err) {
          return { error: `Could not load the PDF: ${err.message}` };
        }
      }
      case "ping":
        return { ok: true };
      default:
        return { error: `Unknown embed action: ${String(request.action)}` };
    }
  }

  // src/embed/viewer.js
  function viewerMain() {
    var cfg = window.__PDFA_CONFIG || {};
    var els = {
      root: document.getElementById("pdfa-root"),
      pages: document.getElementById("pdfa-pages"),
      status: document.getElementById("pdfa-status"),
      pageLabel: document.getElementById("pdfa-page-label"),
      zoomLabel: document.getElementById("pdfa-zoom-label")
    };
    var state = { doc: null, scale: 1.25, pageCount: 0, current: 1, rendering: false, textSpans: 0 };
    function status(message, isError) {
      els.status.textContent = message || "";
      els.status.style.display = message ? "block" : "none";
      els.status.className = isError ? "pdfa-status pdfa-error" : "pdfa-status";
    }
    function callPlugin(payload) {
      return new Promise(function(resolve, reject) {
        try {
          if (typeof window.callAmplenotePlugin !== "function") {
            throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");
          }
          resolve(window.callAmplenotePlugin(JSON.stringify(payload)));
        } catch (err) {
          reject(err);
        }
      }).then(function(raw) {
        if (raw && typeof raw === "object") return raw;
        if (typeof raw !== "string") throw new Error("Empty reply from the plugin");
        try {
          return JSON.parse(raw);
        } catch {
          throw new Error("Unreadable reply from the plugin: " + String(raw).slice(0, 120));
        }
      });
    }
    function renderPage(page, index) {
      var viewport = page.getViewport({ scale: state.scale });
      var wrap = document.createElement("div");
      wrap.className = "pdfa-page";
      wrap.dataset.page = String(index);
      wrap.style.width = viewport.width + "px";
      wrap.style.height = viewport.height + "px";
      var canvas = document.createElement("canvas");
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = viewport.width + "px";
      canvas.style.height = viewport.height + "px";
      wrap.appendChild(canvas);
      var textLayer = document.createElement("div");
      textLayer.className = "pdfa-textlayer";
      textLayer.style.width = viewport.width + "px";
      textLayer.style.height = viewport.height + "px";
      textLayer.style.setProperty("--scale-factor", String(state.scale));
      wrap.appendChild(textLayer);
      els.pages.appendChild(wrap);
      var ctx = canvas.getContext("2d");
      ctx.scale(dpr, dpr);
      return page.render({ canvasContext: ctx, viewport }).promise.then(function() {
        return page.getTextContent();
      }).then(function(textContent) {
        var divs = [];
        return window.pdfjsLib.renderTextLayer({
          textContent,
          container: textLayer,
          viewport,
          textDivs: divs
        }).promise.then(function() {
          state.textSpans += divs.length;
        });
      });
    }
    function renderAll() {
      if (state.rendering) return Promise.resolve();
      state.rendering = true;
      els.pages.innerHTML = "";
      state.textSpans = 0;
      status("Rendering...");
      var chain = Promise.resolve();
      for (var i = 1; i <= state.pageCount; i++) {
        (function(pageNum) {
          chain = chain.then(function() {
            return state.doc.getPage(pageNum).then(function(page) {
              return renderPage(page, pageNum);
            });
          });
        })(i);
      }
      return chain.then(function() {
        if (state.textSpans === 0) {
          status("No selectable text found - this PDF may be a scan.", true);
        } else {
          status("");
        }
        state.rendering = false;
        updateLabels();
      }).catch(function(err) {
        state.rendering = false;
        status("Failed to render: " + err.message, true);
      });
    }
    function updateLabels() {
      els.pageLabel.textContent = state.current + " / " + state.pageCount;
      els.zoomLabel.textContent = Math.round(state.scale * 100) + "%";
    }
    function goToPage(pageNum) {
      var target = Math.min(Math.max(1, pageNum), state.pageCount);
      var el = els.pages.querySelector('[data-page="' + target + '"]');
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      state.current = target;
      updateLabels();
    }
    function setZoom(scale) {
      state.scale = Math.min(Math.max(0.4, scale), 4);
      renderAll();
    }
    function trackScroll() {
      var pages = els.pages.querySelectorAll(".pdfa-page");
      var best = state.current;
      var bestDist = Infinity;
      for (var i = 0; i < pages.length; i++) {
        var dist = Math.abs(pages[i].getBoundingClientRect().top - 60);
        if (dist < bestDist) {
          bestDist = dist;
          best = Number(pages[i].dataset.page);
        }
      }
      if (best !== state.current) {
        state.current = best;
        updateLabels();
      }
    }
    function loadPdfJs() {
      return new Promise(function(resolve, reject) {
        if (window.pdfjsLib) return resolve(window.pdfjsLib);
        var tag = document.createElement("script");
        tag.src = cfg.pdfJsSrc;
        tag.onload = function() {
          if (window.pdfjsLib) resolve(window.pdfjsLib);
          else reject(new Error("PDF.js loaded but did not register itself."));
        };
        tag.onerror = function() {
          reject(new Error("Could not load PDF.js from the CDN."));
        };
        document.head.appendChild(tag);
      });
    }
    function boot() {
      status("Loading PDF...");
      loadPdfJs().then(function(pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = cfg.workerSrc;
        return callPlugin({ action: "getPdfUrl", attachmentUUID: cfg.attachmentUUID });
      }).then(function(result) {
        if (!result || !result.url) {
          throw new Error(result && result.error || "Could not resolve the PDF URL");
        }
        if (result.name) {
          document.querySelector(".pdfa-name").textContent = result.name;
        }
        return fetch(result.url);
      }).then(function(response) {
        if (!response.ok) throw new Error("Download failed (HTTP " + response.status + ")");
        return response.arrayBuffer();
      }).then(function(bytes) {
        return window.pdfjsLib.getDocument({ data: bytes }).promise;
      }).then(function(doc) {
        state.doc = doc;
        state.pageCount = doc.numPages;
        return renderAll();
      }).then(function() {
        if (cfg.page) goToPage(cfg.page);
      }).catch(function(err) {
        status(err.message || String(err), true);
      });
    }
    try {
      document.getElementById("pdfa-prev").onclick = function() {
        goToPage(state.current - 1);
      };
      document.getElementById("pdfa-next").onclick = function() {
        goToPage(state.current + 1);
      };
      document.getElementById("pdfa-zoom-in").onclick = function() {
        setZoom(state.scale + 0.25);
      };
      document.getElementById("pdfa-zoom-out").onclick = function() {
        setZoom(state.scale - 0.25);
      };
      els.root.querySelector(".pdfa-scroll").addEventListener("scroll", trackScroll);
      boot();
    } catch (err) {
      status("Viewer failed to start: " + (err && err.message ? err.message : err), true);
    }
  }

  // src/embed/html.js
  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function safeJson(value) {
    return JSON.stringify(value).replace(/</g, "\\u003c");
  }
  var STYLES = `
  * { box-sizing: border-box; }
  body { margin: 0; font: 13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
  #pdfa-root { display: flex; flex-direction: column; height: 100vh; background: var(--pdfa-bg); color: var(--pdfa-fg); }
  .pdfa-toolbar { display: flex; align-items: center; gap: 6px; padding: 6px 8px; border-bottom: 1px solid var(--pdfa-border); background: var(--pdfa-toolbar); flex: 0 0 auto; flex-wrap: wrap; }
  .pdfa-toolbar button { font: inherit; padding: 4px 9px; border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit; border-radius: 5px; cursor: pointer; line-height: 1.2; }
  .pdfa-toolbar button:hover { background: var(--pdfa-btn-hover); }
  .pdfa-label { min-width: 62px; text-align: center; opacity: .85; font-variant-numeric: tabular-nums; }
  .pdfa-sep { width: 1px; align-self: stretch; background: var(--pdfa-border); margin: 0 4px; }
  .pdfa-spacer { flex: 1 1 auto; }
  .pdfa-name { opacity: .7; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pdfa-scroll { flex: 1 1 auto; overflow: auto; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .pdfa-page { position: relative; box-shadow: 0 1px 6px rgba(0,0,0,.28); background: #fff; flex: 0 0 auto; }
  .pdfa-page canvas { display: block; }
  .pdfa-status { padding: 10px 12px; text-align: center; opacity: .8; }
  .pdfa-error { color: var(--pdfa-error); opacity: 1; white-space: pre-wrap; }

  /* Text layer: invisible glyphs positioned exactly over the canvas. It must stay
     selectable \u2014 this is what Phase 2 reads selection geometry from.

     --scale-factor is set per page in JS to match the render scale. It is NOT declared
     here: a static value silently offsets every span from the glyph it covers, which
     presents as selection hitting the wrong text or nothing at all. */
  .pdfa-textlayer { position: absolute; inset: 0; overflow: hidden; line-height: 1; }
  .pdfa-textlayer > span { color: transparent; position: absolute; white-space: pre;
    cursor: text; transform-origin: 0% 0%; }
  .pdfa-textlayer > span::selection { background: rgba(0, 100, 255, .4); }
`;
  var THEMES = {
    light: `--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e;`,
    dark: `--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5;`
  };
  function buildEmbedHtml({ attachmentUUID, attachmentName: attachmentName2 = "", page = null, lightDarkMode = "light" } = {}) {
    const theme = THEMES[lightDarkMode] || THEMES.light;
    const config = {
      attachmentUUID,
      page,
      pdfJsSrc: CDN.pdfJs,
      workerSrc: CDN.pdfJsWorker
    };
    return `<style>:root{${theme}}${STYLES}</style>
<div id="pdfa-root">
  <div class="pdfa-toolbar">
    <button id="pdfa-prev" title="Previous page">&#8249;</button>
    <span class="pdfa-label" id="pdfa-page-label">\u2013 / \u2013</span>
    <button id="pdfa-next" title="Next page">&#8250;</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" title="Zoom out">&#8722;</button>
    <span class="pdfa-label" id="pdfa-zoom-label">125%</span>
    <button id="pdfa-zoom-in" title="Zoom in">+</button>
    <span class="pdfa-sep"></span>
    <!-- Phase 2 mounts the four single-click highlight color buttons here. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-spacer"></span>
    <span class="pdfa-name">${escapeHtml(attachmentName2)}</span>
  </div>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
</div>
<script>window.__PDFA_CONFIG = ${safeJson(config)};<\/script>
<script>(${viewerMain.toString()})();<\/script>`;
  }

  // src/plugin.js
  var plugin = {
    noteOption: {
      "Annotate PDF": async function(app, noteUUID) {
        return annotatePdf(app, noteUUID, app.context.pluginUUID);
      }
    },
    /**
     * Amplenote passes embed parameters as a single query string, e.g. "att=abc&page=3".
     */
    renderEmbed: function(app, ...args) {
      const { attachmentUUID, page } = parseEmbedArgs(args[0]);
      if (!attachmentUUID) {
        return `<p style="font:13px sans-serif;padding:12px">
        This viewer isn't linked to a PDF. Re-run <b>Annotate PDF</b> from the note menu.
      </p>`;
      }
      return buildEmbedHtml({
        attachmentUUID,
        page,
        lightDarkMode: app.context.lightDarkMode
      });
    },
    onEmbedCall: async function(app, ...args) {
      return handleEmbedCallSerialized(app, args[0]);
    }
  };
  var plugin_default = plugin;
  return __toCommonJS(plugin_exports);
})();

  return __pluginModule.default;
})()
