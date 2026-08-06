/**
 * The PDF viewer that runs INSIDE the embed iframe.
 *
 * This function is serialized with `.toString()` and injected into the embed HTML, so:
 *   - it must be entirely self-contained — no imports, no closure over module scope
 *   - configuration arrives on `window.__PDFA_CONFIG`
 *   - it cannot be unit tested (it needs a real iframe, PDF.js, and a live plugin
 *     bridge), which is exactly why everything decidable lives in src/ modules instead.
 *     Keep this file about DOM and PDF.js wiring only. See spec §8.
 *
 * Phase 1 scope: render every page to canvas with a real text layer over it, plus zoom
 * and page navigation. Highlighting is Phase 2 — but the text layer built here is what
 * makes it possible, so its geometry has to be right.
 */
export function viewerMain() {
  var cfg = window.__PDFA_CONFIG || {};
  var els = {
    root: document.getElementById("pdfa-root"),
    pages: document.getElementById("pdfa-pages"),
    status: document.getElementById("pdfa-status"),
    pageLabel: document.getElementById("pdfa-page-label"),
    zoomLabel: document.getElementById("pdfa-zoom-label"),
  };

  var state = { doc: null, scale: 1.25, pageCount: 0, current: 1, rendering: false };

  function status(message, isError) {
    els.status.textContent = message || "";
    els.status.style.display = message ? "block" : "none";
    els.status.className = isError ? "pdfa-status pdfa-error" : "pdfa-status";
  }

  function callPlugin(payload) {
    return window.callAmplenotePlugin(payload);
  }

  // ---- rendering -----------------------------------------------------------

  function renderPage(page, index) {
    var viewport = page.getViewport({ scale: state.scale });

    var wrap = document.createElement("div");
    wrap.className = "pdfa-page";
    wrap.dataset.page = String(index);
    wrap.style.width = viewport.width + "px";
    wrap.style.height = viewport.height + "px";

    var canvas = document.createElement("canvas");
    // Render at device resolution so text stays crisp; CSS keeps the layout size.
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = viewport.width + "px";
    canvas.style.height = viewport.height + "px";
    wrap.appendChild(canvas);

    // The text layer is the whole point: it gives real selectable text positioned over
    // the canvas, which Phase 2 turns into highlight geometry. Without it we could only
    // draw region boxes, which the spec explicitly rules out.
    var textLayer = document.createElement("div");
    textLayer.className = "pdfa-textlayer";
    textLayer.style.width = viewport.width + "px";
    textLayer.style.height = viewport.height + "px";
    wrap.appendChild(textLayer);

    els.pages.appendChild(wrap);

    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    return page
      .render({ canvasContext: ctx, viewport: viewport })
      .promise.then(function () {
        return page.getTextContent();
      })
      .then(function (textContent) {
        return window.pdfjsLib.renderTextLayer({
          textContent: textContent,
          container: textLayer,
          viewport: viewport,
          textDivs: [],
        }).promise;
      });
  }

  function renderAll() {
    if (state.rendering) return Promise.resolve();
    state.rendering = true;
    els.pages.innerHTML = "";
    status("Rendering…");

    var chain = Promise.resolve();
    for (var i = 1; i <= state.pageCount; i++) {
      (function (pageNum) {
        chain = chain.then(function () {
          return state.doc.getPage(pageNum).then(function (page) {
            return renderPage(page, pageNum);
          });
        });
      })(i);
    }

    return chain
      .then(function () {
        status("");
        state.rendering = false;
        updateLabels();
      })
      .catch(function (err) {
        state.rendering = false;
        status("Failed to render: " + err.message, true);
      });
  }

  // ---- navigation ----------------------------------------------------------

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

  // Keep the page indicator honest as the user scrolls.
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

  // ---- boot ----------------------------------------------------------------

  function boot() {
    status("Loading PDF…");

    window.pdfjsLib.GlobalWorkerOptions.workerSrc = cfg.workerSrc;

    callPlugin({ action: "getPdfUrl", attachmentUUID: cfg.attachmentUUID })
      .then(function (result) {
        if (!result || !result.url) {
          throw new Error((result && result.error) || "Could not resolve the PDF URL");
        }
        if (result.name) {
          document.querySelector(".pdfa-name").textContent = result.name;
        }
        return fetch(result.url);
      })
      .then(function (response) {
        if (!response.ok) throw new Error("Download failed (HTTP " + response.status + ")");
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        return window.pdfjsLib.getDocument({ data: bytes }).promise;
      })
      .then(function (doc) {
        state.doc = doc;
        state.pageCount = doc.numPages;
        return renderAll();
      })
      .then(function () {
        // Deep-link target from the embed args (spec §7.3). Phase 5 exports links
        // carrying page + coordinates; jumping to the page is the half that works now.
        if (cfg.page) goToPage(cfg.page);
      })
      .catch(function (err) {
        status(err.message || String(err), true);
      });
  }

  document.getElementById("pdfa-prev").onclick = function () { goToPage(state.current - 1); };
  document.getElementById("pdfa-next").onclick = function () { goToPage(state.current + 1); };
  document.getElementById("pdfa-zoom-in").onclick = function () { setZoom(state.scale + 0.25); };
  document.getElementById("pdfa-zoom-out").onclick = function () { setZoom(state.scale - 0.25); };
  els.root.querySelector(".pdfa-scroll").addEventListener("scroll", trackScroll);

  boot();
}
