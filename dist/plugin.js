(() => {
  // Amplenote PDF Annotator - v0.1.0
  // GENERATED FILE - do not edit. Edit src/ and run `npm run build`.
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
  var HIGHLIGHT_COLORS = [
    { id: "coral", label: "Coral", hex: "#F3998C", cycleIndex: 12, rgb: [0.953, 0.6, 0.549] },
    { id: "yellow", label: "Yellow", hex: "#F4DE6C", cycleIndex: 14, rgb: [0.957, 0.871, 0.424] },
    { id: "green", label: "Green", hex: "#BBE077", cycleIndex: 15, rgb: [0.733, 0.878, 0.467] },
    { id: "blue", label: "Blue", hex: "#84B6D9", cycleIndex: 18, rgb: [0.518, 0.714, 0.851] }
  ];
  var DEFAULT_COLOR_ID = "yellow";
  var STORAGE_SECTION_HEADING = "PDF Annotator data";
  var CDN = {
    pdfJs: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js",
    pdfJsWorker: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js",
    /**
     * PDF.js's OWN viewer stylesheet, used for the text layer.
     *
     * Hand-rolling those rules caused two separate positioning bugs (a static
     * --scale-factor that broke hit-testing, then group-opacity blotching). The text
     * layer's geometry is tightly coupled to what renderTextLayer emits, so the upstream
     * stylesheet is the reference implementation - use it rather than reimplementing it.
     */
    pdfViewerCss: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf_viewer.min.css",
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
      await app.alert(`"${attachment.name}" is already open in this note - scroll to the viewer.`);
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

  // src/colors.js
  function findColor(idOrHex) {
    if (!idOrHex) return null;
    const needle = String(idOrHex).trim().toLowerCase();
    return HIGHLIGHT_COLORS.find(
      (c) => c.id === needle || c.hex.toLowerCase() === needle
    ) || null;
  }
  function defaultColor() {
    return findColor(DEFAULT_COLOR_ID);
  }

  // src/highlights.js
  function generateHighlightId() {
    return "hl-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }
  function createHighlight({ page, color, rects, quoteText, note = null, id = null }) {
    if (!Number.isInteger(page) || page < 1) {
      throw new Error(`createHighlight: page must be a positive integer, got ${page}`);
    }
    if (!Array.isArray(rects) || rects.length === 0) {
      throw new Error("createHighlight: rects must be a non-empty array");
    }
    for (const r of rects) {
      if (![r.x, r.y, r.width, r.height].every(Number.isFinite)) {
        throw new Error(`createHighlight: malformed rect ${JSON.stringify(r)}`);
      }
    }
    const resolvedColor = findColor(color) || defaultColor();
    return {
      id: id || generateHighlightId(),
      page,
      color: resolvedColor.id,
      rects: rects.map((r) => ({ x: r.x, y: r.y, width: r.width, height: r.height })),
      quoteText: String(quoteText || ""),
      note: note ? String(note) : null
    };
  }
  function withColor(highlight, color) {
    const resolved = findColor(color);
    if (!resolved) throw new Error(`withColor: unknown color "${color}"`);
    return { ...highlight, color: resolved.id };
  }
  function removeHighlight(highlights, id) {
    return (highlights || []).filter((h) => h.id !== id);
  }
  function updateHighlight(highlights, id, updater) {
    let changed = false;
    const next = (highlights || []).map((h) => {
      if (h.id !== id) return h;
      changed = true;
      return updater(h);
    });
    return changed ? next : highlights;
  }

  // src/storage.js
  var FENCE_LANG = "json";
  function serialize(payload) {
    return "```" + FENCE_LANG + "\n" + JSON.stringify(payload, null, 0) + "\n```";
  }
  function deserialize(sectionContent) {
    if (!sectionContent) return null;
    const fenced = sectionContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
    const raw = (fenced ? fenced[1] : sectionContent).trim();
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
  function sanitizeHighlights(list) {
    if (!Array.isArray(list)) return [];
    const out = [];
    for (const h of list) {
      try {
        out.push(createHighlight(h));
      } catch {
      }
    }
    return out;
  }
  async function loadHighlights(app, noteUUID, attachmentUUID) {
    const content = await app.getNoteContent({ uuid: noteUUID });
    const section = extractSection(content, STORAGE_SECTION_HEADING);
    const payload = deserialize(section);
    if (!payload || typeof payload !== "object") return [];
    return sanitizeHighlights(payload[attachmentUUID]);
  }
  async function saveHighlights(app, noteUUID, attachmentUUID, highlights) {
    const noteHandle = { uuid: noteUUID };
    const content = await app.getNoteContent(noteHandle);
    const section = extractSection(content, STORAGE_SECTION_HEADING);
    const existing = deserialize(section) || {};
    const payload = { ...existing, [attachmentUUID]: highlights };
    const body = serialize(payload);
    if (section === null) {
      await app.insertNoteContent(noteHandle, `

# ${STORAGE_SECTION_HEADING}

`, {
        atEnd: true
      });
    }
    await app.replaceNoteContent(noteHandle, body, {
      section: { heading: { text: STORAGE_SECTION_HEADING, level: 1 } }
    });
  }
  function extractSection(noteContent, headingText) {
    if (!noteContent) return null;
    const lines = noteContent.split("\n");
    const headingRe = /^#\s+(.*)$/;
    const startIdx = lines.findIndex((l) => {
      const m = l.match(headingRe);
      return m && m[1].trim() === headingText;
    });
    if (startIdx === -1) return null;
    let endIdx = lines.length;
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^#\s+/.test(lines[i])) {
        endIdx = i;
        break;
      }
    }
    return lines.slice(startIdx + 1, endIdx).join("\n").trim();
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
  async function mutateHighlights(app, attachmentUUID, mutate) {
    const noteUUID = app.context.noteUUID;
    const current = await loadHighlights(app, noteUUID, attachmentUUID);
    const next = mutate(current);
    if (next !== current) {
      await saveHighlights(app, noteUUID, attachmentUUID, next);
    }
    return { highlights: next };
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
      case "loadHighlights": {
        if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
        try {
          return {
            highlights: await loadHighlights(app, app.context.noteUUID, request.attachmentUUID)
          };
        } catch (err) {
          return { error: `Could not load highlights: ${err.message}` };
        }
      }
      case "addHighlight": {
        if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
        try {
          const highlight = createHighlight(request.highlight || {});
          return await mutateHighlights(
            app,
            request.attachmentUUID,
            (list) => list.concat([highlight])
          );
        } catch (err) {
          return { error: `Could not save the highlight: ${err.message}` };
        }
      }
      case "recolorHighlight": {
        if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
        try {
          return await mutateHighlights(
            app,
            request.attachmentUUID,
            (list) => updateHighlight(list, request.id, (h) => withColor(h, request.color))
          );
        } catch (err) {
          return { error: `Could not change the highlight color: ${err.message}` };
        }
      }
      case "removeHighlight": {
        if (!request.attachmentUUID) return { error: "No attachment specified for this viewer." };
        try {
          return await mutateHighlights(
            app,
            request.attachmentUUID,
            (list) => removeHighlight(list, request.id)
          );
        } catch (err) {
          return { error: `Could not remove the highlight: ${err.message}` };
        }
      }
      case "ping":
        return { ok: true };
      default:
        return { error: `Unknown embed action: ${String(request.action)}` };
    }
  }

  // src/geometry.js
  function createGeometry() {
    function clientRectToLocal2(clientRect, containerRect) {
      return {
        x: clientRect.left - containerRect.left,
        y: clientRect.top - containerRect.top,
        width: clientRect.width,
        height: clientRect.height
      };
    }
    function rectFromCorners2(p1, p2) {
      return {
        x: Math.min(p1[0], p2[0]),
        y: Math.min(p1[1], p2[1]),
        width: Math.abs(p2[0] - p1[0]),
        height: Math.abs(p2[1] - p1[1])
      };
    }
    function roundRect2(rect, precision) {
      var f = Math.pow(10, precision === void 0 ? 2 : precision);
      var round = function(n) {
        return Math.round(n * f) / f;
      };
      return { x: round(rect.x), y: round(rect.y), width: round(rect.width), height: round(rect.height) };
    }
    function isVisibleRect2(rect) {
      return rect.width > 0.01 && rect.height > 0.01;
    }
    function clientRectsToPdfRects2(clientRects, containerRect, convertToPdfPoint) {
      var out = [];
      for (var i = 0; i < clientRects.length; i++) {
        var local = clientRectToLocal2(clientRects[i], containerRect);
        if (!isVisibleRect2(local)) continue;
        var a = convertToPdfPoint(local.x, local.y);
        var b = convertToPdfPoint(local.x + local.width, local.y + local.height);
        var rect = roundRect2(rectFromCorners2(a, b));
        if (isVisibleRect2(rect)) out.push(rect);
      }
      return out;
    }
    function pdfRectToViewportRect2(rect, convertToViewportPoint) {
      var a = convertToViewportPoint(rect.x, rect.y);
      var b = convertToViewportPoint(rect.x + rect.width, rect.y + rect.height);
      return rectFromCorners2(a, b);
    }
    function onSameLine(a, b) {
      var overlap = Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y);
      return overlap > 0.5 * Math.min(a.height, b.height);
    }
    function mergeLineRects2(rects, gapRatio) {
      var ratio = gapRatio === void 0 ? 0.6 : gapRatio;
      if (!rects || rects.length < 2) return (rects || []).slice();
      var sorted = rects.slice().sort(function(a, b) {
        return b.y - a.y || a.x - b.x;
      });
      var lines = [];
      for (var i = 0; i < sorted.length; i++) {
        var placed = false;
        for (var l = 0; l < lines.length; l++) {
          if (onSameLine(lines[l][0], sorted[i])) {
            lines[l].push(sorted[i]);
            placed = true;
            break;
          }
        }
        if (!placed) lines.push([sorted[i]]);
      }
      var out = [];
      for (var j = 0; j < lines.length; j++) {
        var line = lines[j].slice().sort(function(a, b) {
          return a.x - b.x;
        });
        var current = null;
        for (var k = 0; k < line.length; k++) {
          var r = line[k];
          if (current === null) {
            current = { x: r.x, y: r.y, width: r.width, height: r.height };
            continue;
          }
          var gap = r.x - (current.x + current.width);
          if (gap <= ratio * Math.max(current.height, r.height)) {
            var right = Math.max(current.x + current.width, r.x + r.width);
            var top = Math.max(current.y + current.height, r.y + r.height);
            current.x = Math.min(current.x, r.x);
            current.y = Math.min(current.y, r.y);
            current.width = right - current.x;
            current.height = top - current.y;
          } else {
            out.push(current);
            current = { x: r.x, y: r.y, width: r.width, height: r.height };
          }
        }
        if (current !== null) out.push(current);
      }
      return out.map(function(r2) {
        return roundRect2(r2);
      });
    }
    function rectContainsPoint2(rect, x, y, padding) {
      var p = padding === void 0 ? 0 : padding;
      return x >= rect.x - p && x <= rect.x + rect.width + p && y >= rect.y - p && y <= rect.y + rect.height + p;
    }
    function hitTestHighlights2(highlights, page, x, y, padding) {
      var list = highlights || [];
      for (var i = list.length - 1; i >= 0; i--) {
        var h = list[i];
        if (!h || h.page !== page || !h.rects) continue;
        for (var j = 0; j < h.rects.length; j++) {
          if (rectContainsPoint2(h.rects[j], x, y, padding === void 0 ? 1 : padding)) return h;
        }
      }
      return null;
    }
    function normalizeQuoteText2(text) {
      return String(text === null || text === void 0 ? "" : text).replace(/\s+/g, " ").trim();
    }
    return {
      clientRectToLocal: clientRectToLocal2,
      rectFromCorners: rectFromCorners2,
      roundRect: roundRect2,
      isVisibleRect: isVisibleRect2,
      clientRectsToPdfRects: clientRectsToPdfRects2,
      pdfRectToViewportRect: pdfRectToViewportRect2,
      mergeLineRects: mergeLineRects2,
      rectContainsPoint: rectContainsPoint2,
      hitTestHighlights: hitTestHighlights2,
      normalizeQuoteText: normalizeQuoteText2
    };
  }
  var geometry = createGeometry();
  var clientRectToLocal = geometry.clientRectToLocal;
  var rectFromCorners = geometry.rectFromCorners;
  var roundRect = geometry.roundRect;
  var isVisibleRect = geometry.isVisibleRect;
  var clientRectsToPdfRects = geometry.clientRectsToPdfRects;
  var pdfRectToViewportRect = geometry.pdfRectToViewportRect;
  var mergeLineRects = geometry.mergeLineRects;
  var rectContainsPoint = geometry.rectContainsPoint;
  var hitTestHighlights = geometry.hitTestHighlights;
  var normalizeQuoteText = geometry.normalizeQuoteText;

  // src/embed/viewer.js
  function viewerMain() {
    var cfg = window.__PDFA_CONFIG || {};
    var geom = window.__PDFA_GEOM || {};
    var els = {
      root: document.getElementById("pdfa-root"),
      pages: document.getElementById("pdfa-pages"),
      status: document.getElementById("pdfa-status"),
      pageLabel: document.getElementById("pdfa-page-label"),
      zoomLabel: document.getElementById("pdfa-zoom-label"),
      colors: document.getElementById("pdfa-colors"),
      hint: document.getElementById("pdfa-hint"),
      popover: document.getElementById("pdfa-popover")
    };
    var state = {
      doc: null,
      scale: 1.25,
      pageCount: 0,
      current: 1,
      rendering: false,
      textSpans: 0,
      // Per-page PDF.js viewport at the CURRENT scale. Rebuilt on every render, and the
      // only thing allowed to convert between PDF space and screen pixels.
      viewports: {},
      highlights: [],
      activeColorId: cfg.defaultColorId || ((cfg.colors || [{}])[0] || {}).id,
      // The last text selection made inside a text layer, already converted to PDF space.
      // Held because clicking a toolbar button collapses the DOM selection before the
      // click handler runs - by then window.getSelection() is empty.
      pendingSelection: null
    };
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
    function colorList() {
      return cfg.colors || [];
    }
    function colorHex(id) {
      var list = colorList();
      for (var i = 0; i < list.length; i++) {
        if (list[i].id === id) return list[i].hex;
      }
      return list.length ? list[0].hex : "#F4DE6C";
    }
    function makeSwatch(color, pressed, onPick, titlePrefix) {
      var btn = document.createElement("button");
      btn.className = "pdfa-color";
      btn.dataset.color = color.id;
      btn.style.background = color.hex;
      btn.title = titlePrefix + " " + color.label;
      btn.setAttribute("aria-label", titlePrefix + " " + color.label);
      btn.setAttribute("aria-pressed", String(!!pressed));
      btn.onclick = function(event) {
        event.stopPropagation();
        onPick(color.id);
      };
      return btn;
    }
    function mountColorButtons() {
      var list = colorList();
      for (var i = 0; i < list.length; i++) {
        els.colors.appendChild(
          makeSwatch(list[i], list[i].id === state.activeColorId, function(colorId) {
            state.activeColorId = colorId;
            updateColorButtons();
            if (state.pendingSelection) applyHighlight(state.pendingSelection, colorId);
          }, "Highlight")
        );
      }
    }
    function updateColorButtons() {
      var btns = els.colors.querySelectorAll(".pdfa-color");
      for (var i = 0; i < btns.length; i++) {
        btns[i].setAttribute("aria-pressed", String(btns[i].dataset.color === state.activeColorId));
      }
    }
    function renderPage(page, index) {
      var viewport = page.getViewport({ scale: state.scale });
      state.viewports[index] = viewport;
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
      var highlightLayer = document.createElement("div");
      highlightLayer.className = "pdfa-highlights";
      wrap.appendChild(highlightLayer);
      var textLayer = document.createElement("div");
      textLayer.className = "textLayer";
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
          drawHighlights(index);
        });
      });
    }
    function renderAll() {
      if (state.rendering) return Promise.resolve();
      state.rendering = true;
      closePopover();
      els.pages.innerHTML = "";
      state.viewports = {};
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
    function toViewportPoint(viewport) {
      return function(x, y) {
        return viewport.convertToViewportPoint(x, y);
      };
    }
    function drawHighlights(pageNum) {
      var selector = pageNum ? '.pdfa-page[data-page="' + pageNum + '"]' : ".pdfa-page";
      var wraps = els.pages.querySelectorAll(selector);
      for (var i = 0; i < wraps.length; i++) {
        var wrap = wraps[i];
        var num = Number(wrap.dataset.page);
        var layer = wrap.querySelector(".pdfa-highlights");
        var viewport = state.viewports[num];
        if (!layer || !viewport) continue;
        layer.innerHTML = "";
        var convert = toViewportPoint(viewport);
        for (var j = 0; j < state.highlights.length; j++) {
          var h = state.highlights[j];
          if (!h || h.page !== num || !h.rects) continue;
          for (var k = 0; k < h.rects.length; k++) {
            var vr = geom.pdfRectToViewportRect(h.rects[k], convert);
            var el = document.createElement("div");
            el.className = "pdfa-hl";
            el.dataset.id = h.id || "";
            el.style.left = vr.x + "px";
            el.style.top = vr.y + "px";
            el.style.width = vr.width + "px";
            el.style.height = vr.height + "px";
            el.style.background = colorHex(h.color);
            layer.appendChild(el);
          }
        }
      }
    }
    function textLayerOf(node) {
      var el = node && node.nodeType === 1 ? node : node && node.parentElement;
      while (el) {
        if (el.classList && el.classList.contains("textLayer")) return el;
        el = el.parentElement;
      }
      return null;
    }
    function setPending(selection) {
      state.pendingSelection = selection;
      if (!selection) {
        els.hint.textContent = "";
        els.hint.style.display = "none";
        return;
      }
      els.hint.textContent = selection.spilled ? "Pick a color (page " + selection.page + " only)" : "Pick a color";
      els.hint.style.display = "inline";
    }
    function captureSelection() {
      var sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) return setPending(null);
      var range = sel.getRangeAt(0);
      var layer = textLayerOf(range.startContainer);
      if (!layer) return setPending(null);
      var wrap = layer.parentElement;
      if (!wrap || !wrap.dataset || !wrap.dataset.page) return setPending(null);
      var pageNum = Number(wrap.dataset.page);
      var viewport = state.viewports[pageNum];
      if (!viewport) return setPending(null);
      var containerRect = wrap.getBoundingClientRect();
      var all = Array.prototype.slice.call(range.getClientRects());
      var onPage = all.filter(function(r) {
        var midY = r.top + r.height / 2;
        return midY >= containerRect.top && midY <= containerRect.bottom;
      });
      var rects = geom.mergeLineRects(
        geom.clientRectsToPdfRects(onPage, containerRect, function(x, y) {
          return viewport.convertToPdfPoint(x, y);
        })
      );
      if (!rects.length) return setPending(null);
      setPending({
        page: pageNum,
        rects,
        quoteText: geom.normalizeQuoteText(sel.toString()),
        spilled: onPage.length !== all.length
      });
    }
    function applyChange(optimistic, request) {
      var previous = state.highlights;
      state.highlights = optimistic;
      drawHighlights();
      return callPlugin(request).then(function(result) {
        if (!result || result.error) {
          throw new Error(result && result.error || "The plugin did not confirm the change.");
        }
        state.highlights = result.highlights || optimistic;
        drawHighlights();
        status("");
      }).catch(function(err) {
        state.highlights = previous;
        drawHighlights();
        status(err.message || String(err), true);
      });
    }
    function applyHighlight(selection, colorId) {
      var draft = {
        id: null,
        page: selection.page,
        color: colorId,
        rects: selection.rects,
        quoteText: selection.quoteText,
        note: null
      };
      setPending(null);
      var sel = window.getSelection();
      if (sel && sel.removeAllRanges) sel.removeAllRanges();
      applyChange(state.highlights.concat([draft]), {
        action: "addHighlight",
        attachmentUUID: cfg.attachmentUUID,
        highlight: draft
      });
    }
    function recolorHighlight(id, colorId) {
      closePopover();
      applyChange(
        state.highlights.map(function(h) {
          return h.id === id ? Object.assign({}, h, { color: colorId }) : h;
        }),
        { action: "recolorHighlight", attachmentUUID: cfg.attachmentUUID, id, color: colorId }
      );
    }
    function removeHighlightById(id) {
      closePopover();
      applyChange(
        state.highlights.filter(function(h) {
          return h.id !== id;
        }),
        { action: "removeHighlight", attachmentUUID: cfg.attachmentUUID, id }
      );
    }
    function openPopover(highlight, clientX, clientY) {
      els.popover.innerHTML = "";
      var list = colorList();
      for (var i = 0; i < list.length; i++) {
        els.popover.appendChild(
          makeSwatch(list[i], list[i].id === highlight.color, function(colorId) {
            recolorHighlight(highlight.id, colorId);
          }, "Change to")
        );
      }
      var remove = document.createElement("button");
      remove.className = "pdfa-remove";
      remove.textContent = "Remove";
      remove.title = "Remove this highlight";
      remove.onclick = function(event) {
        event.stopPropagation();
        removeHighlightById(highlight.id);
      };
      els.popover.appendChild(remove);
      els.popover.classList.add("pdfa-open");
      var width = els.popover.offsetWidth;
      var height = els.popover.offsetHeight;
      var left = Math.max(4, Math.min(clientX - width / 2, window.innerWidth - width - 4));
      var top = clientY + 12;
      if (top + height > window.innerHeight - 4) top = Math.max(4, clientY - height - 12);
      els.popover.style.left = left + "px";
      els.popover.style.top = top + "px";
    }
    function closePopover() {
      els.popover.classList.remove("pdfa-open");
      els.popover.innerHTML = "";
    }
    function onPagesClick(event) {
      var sel = window.getSelection();
      if (sel && !sel.isCollapsed) return;
      var node = event.target;
      var wrap = null;
      while (node && node !== els.pages) {
        if (node.classList && node.classList.contains("pdfa-page")) {
          wrap = node;
          break;
        }
        node = node.parentElement;
      }
      if (!wrap) return closePopover();
      var pageNum = Number(wrap.dataset.page);
      var viewport = state.viewports[pageNum];
      if (!viewport) return closePopover();
      var rect = wrap.getBoundingClientRect();
      var point = viewport.convertToPdfPoint(event.clientX - rect.left, event.clientY - rect.top);
      var hit = geom.hitTestHighlights(state.highlights, pageNum, point[0], point[1], 1);
      if (hit && hit.id) openPopover(hit, event.clientX, event.clientY);
      else closePopover();
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
      closePopover();
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
    function loadHighlights2() {
      return callPlugin({ action: "loadHighlights", attachmentUUID: cfg.attachmentUUID }).then(function(result) {
        if (!result || result.error) {
          throw new Error(result && result.error || "No answer from the plugin");
        }
        state.highlights = result.highlights || [];
      }).catch(function(err) {
        state.highlights = [];
        status("Could not load saved highlights: " + (err.message || err), true);
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
        return loadHighlights2();
      }).then(function() {
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
      els.pages.addEventListener("mouseup", captureSelection);
      els.pages.addEventListener("click", onPagesClick);
      document.addEventListener("keydown", function(event) {
        if (event.key === "Escape") closePopover();
      });
      mountColorButtons();
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
  .pdfa-brand { font-weight: 600; font-size: 12px; letter-spacing: .01em; color: var(--pdfa-accent);
    white-space: nowrap; padding-right: 2px; }
  .pdfa-spacer { flex: 1 1 auto; }
  .pdfa-name { opacity: .7; max-width: 40%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pdfa-scroll { flex: 1 1 auto; overflow: auto; padding: 12px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
  .pdfa-page { position: relative; box-shadow: 0 1px 6px rgba(0,0,0,.28); background: #fff; flex: 0 0 auto; }
  .pdfa-page canvas { display: block; }
  .pdfa-status { padding: 10px 12px; text-align: center; opacity: .8; }
  .pdfa-error { color: var(--pdfa-error); opacity: 1; white-space: pre-wrap; }

  /* TEXT LAYER
     Styling comes from PDF.js's own pdf_viewer.css, linked above. Do not reimplement
     those rules - the layer's geometry is coupled to what renderTextLayer emits, and
     two positioning bugs have already come from hand-rolled substitutes.

     What follows is only (a) a safety net if that stylesheet fails to load, and (b) the
     selection colour, which is ours to choose.

     The safety net matters: without "color: transparent" a failed stylesheet paints
     every glyph a second time on top of the canvas, which looks like a corrupted PDF
     rather than a missing CSS file. (No backticks in this comment - STYLES is itself a
     template literal, and one would terminate it.) */
  .textLayer { position: absolute; inset: 0; overflow: hidden; line-height: 1;
    opacity: 0.3; forced-color-adjust: none; }
  .textLayer > span { color: transparent; position: absolute; white-space: pre;
    cursor: text; transform-origin: 0% 0%; }
  /* Opaque on purpose: the container's opacity fades the layer as a single group, so
     overlapping spans can't compound their alpha into dark seams between lines. */
  .textLayer ::selection { background: #1a73e8; }
  .textLayer > span::selection { background: #1a73e8; }
  /* Above the highlight overlay, so text stays selectable over an existing highlight. */
  .textLayer { z-index: 2; }

  /* HIGHLIGHT OVERLAY
     Sits between the canvas and the text layer, and takes no pointer events at all -
     clicks on a highlight are found by hit-testing the click point against the stored
     PDF-space rects instead. Giving the rects their own pointer events would block text
     selection over anything already highlighted.

     Deliberately NO z-index here: "mix-blend-mode" blends against the backdrop only up
     to the nearest stacking context, and a z-index on this container would create one,
     isolating each rect against a transparent parent instead of the rendered page. DOM
     order (canvas, then this, then the text layer) already gives the right paint order. */
  .pdfa-highlights { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
  .pdfa-hl { position: absolute; border-radius: 2px; mix-blend-mode: multiply; }

  /* The four colors are top-level toolbar buttons, single click, no submenu - an
     explicit spec requirement, not a layout preference. The bare .pdfa-color selector is
     for the popover copies; the descendant one exists only to outrank
     ".pdfa-toolbar button" above, which would otherwise impose its padding. */
  .pdfa-color, .pdfa-toolbar .pdfa-color { width: 20px; height: 20px; padding: 0; border-radius: 50%;
    border: 1px solid rgba(0,0,0,.28); cursor: pointer; font: inherit; }
  .pdfa-color[aria-pressed="true"], .pdfa-toolbar .pdfa-color[aria-pressed="true"] {
    box-shadow: 0 0 0 2px var(--pdfa-toolbar), 0 0 0 4px var(--pdfa-accent); }
  .pdfa-hint { display: none; opacity: .75; font-size: 12px; white-space: nowrap; }

  /* Remove / recolor actions for an existing highlight. Positioned "fixed" because the
     embed is its own iframe, so a click's client coordinates are already relative to
     this element's containing block - no scroll-offset arithmetic to get wrong. */
  .pdfa-popover { position: fixed; display: none; gap: 5px; align-items: center; padding: 6px 8px;
    z-index: 20; background: var(--pdfa-toolbar); color: var(--pdfa-fg);
    border: 1px solid var(--pdfa-border); border-radius: 8px; box-shadow: 0 3px 12px rgba(0,0,0,.3); }
  .pdfa-popover.pdfa-open { display: flex; }
  .pdfa-popover .pdfa-remove { font: inherit; font-size: 12px; padding: 3px 8px; line-height: 1.2;
    border: 1px solid var(--pdfa-border); background: var(--pdfa-btn); color: inherit;
    border-radius: 5px; cursor: pointer; }
  .pdfa-popover .pdfa-remove:hover { background: var(--pdfa-btn-hover); }
`;
  var THEMES = {
    light: `--pdfa-bg:#f6f7f9; --pdfa-fg:#1c1e21; --pdfa-toolbar:#fff; --pdfa-border:#d8dbe0; --pdfa-btn:#fff; --pdfa-btn-hover:#eceef1; --pdfa-error:#b3261e; --pdfa-accent:#1a6fb5;`,
    dark: `--pdfa-bg:#1e2126; --pdfa-fg:#e6e8ea; --pdfa-toolbar:#252930; --pdfa-border:#3a3f47; --pdfa-btn:#2d323a; --pdfa-btn-hover:#3a4049; --pdfa-error:#f2b8b5; --pdfa-accent:#79b8ef;`
  };
  function buildEmbedHtml({ attachmentUUID, attachmentName: attachmentName2 = "", page = null, lightDarkMode = "light" } = {}) {
    const theme = THEMES[lightDarkMode] || THEMES.light;
    const config = {
      attachmentUUID,
      page,
      pdfJsSrc: CDN.pdfJs,
      workerSrc: CDN.pdfJsWorker,
      // Only what the embed needs to draw and label a swatch. cycleIndex and rgb stay on
      // the plugin side - they belong to export (Phase 5) and pdf-lib (Phase 4).
      colors: HIGHLIGHT_COLORS.map((c) => ({ id: c.id, label: c.label, hex: c.hex })),
      defaultColorId: DEFAULT_COLOR_ID
    };
    return `<link rel="stylesheet" href="${CDN.pdfViewerCss}">
<style>:root{${theme}}${STYLES}</style>
<div id="pdfa-root">
  <div class="pdfa-toolbar">
    <!-- Identifies this viewer at a glance. Amplenote renders its OWN PDF preview for
         an attachment, and both can sit in the same note looking broadly similar; a
         reader had no reliable way to tell which one they were interacting with. -->
    <span class="pdfa-brand" title="PDF Annotator plugin">PDF Annotator</span>
    <span class="pdfa-sep"></span>
    <button id="pdfa-prev" title="Previous page">&#8249;</button>
    <span class="pdfa-label" id="pdfa-page-label">- / -</span>
    <button id="pdfa-next" title="Next page">&#8250;</button>
    <span class="pdfa-sep"></span>
    <button id="pdfa-zoom-out" title="Zoom out">&#8722;</button>
    <span class="pdfa-label" id="pdfa-zoom-label">125%</span>
    <button id="pdfa-zoom-in" title="Zoom in">+</button>
    <span class="pdfa-sep"></span>
    <!-- The four single-click highlight color buttons, mounted by the viewer from
         config.colors. Top-level toolbar buttons with no submenu is an explicit spec
         requirement (section 4), which is why the slot is here and not in a panel. -->
    <span id="pdfa-colors"></span>
    <span class="pdfa-hint" id="pdfa-hint"></span>
    <span class="pdfa-spacer"></span>
    <span class="pdfa-name">${escapeHtml(attachmentName2)}</span>
  </div>
  <div class="pdfa-status" id="pdfa-status">Loading...</div>
  <div class="pdfa-scroll"><div id="pdfa-pages"></div></div>
  <!-- Remove / recolor actions, filled in and positioned when a highlight is clicked. -->
  <div class="pdfa-popover" id="pdfa-popover"></div>
</div>
<script>window.__PDFA_CONFIG = ${safeJson(config)};
window.__PDFA_GEOM = (${createGeometry.toString()})();<\/script>
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

  var plugin = __pluginModule.default;
})();
