/**
 * The PDF viewer that runs INSIDE the embed iframe.
 *
 * This function is serialized with `.toString()` and injected into the embed HTML, so:
 *   - it must be entirely self-contained - no imports, no closure over module scope
 *   - configuration arrives on `window.__PDFA_CONFIG`
 *   - the pure rect arithmetic arrives on `window.__PDFA_GEOM` (src/geometry.js,
 *     injected the same way) rather than being reimplemented here
 *   - it cannot be unit tested (it needs a real iframe, PDF.js, and a live plugin
 *     bridge), which is exactly why everything decidable lives in src/ modules instead.
 *     Keep this file about DOM and PDF.js wiring only. See spec section 8.
 *
 * Scope: render every page with a real text layer, zoom and page navigation, the full
 * highlight loop (create, recolor, remove), one plain-text note per highlight, and a
 * panel listing everything.
 *
 * THE POPOVER IS THE CENTRE OF THE UI. One element, four contexts:
 *   - a fresh text selection -> the four colors, so highlighting never requires a trip
 *     to the toolbar
 *   - straight after creating a highlight -> "Add note", because the spec requires that
 *     offer to appear immediately
 *   - an existing highlight -> recolor, add/edit note, remove
 *   - the note editor itself
 * The toolbar colors keep working independently: the spec requires them as top-level
 * single-click buttons, and the popover is a shortcut to them, not a replacement.
 *
 * COORDINATES. Highlights are stored in PDF user space (origin bottom-left) so they
 * survive zoom, per spec section 3. The conversion in BOTH directions is PDF.js's own
 * `viewport.convertToPdfPoint` / `convertToViewportPoint` - never hand-rolled, because
 * three separate coordinate bugs already came from reimplementing that math.
 */
export function viewerMain() {
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
    popover: document.getElementById("pdfa-popover"),
    panel: document.getElementById("pdfa-panel"),
    listToggle: document.getElementById("pdfa-list-toggle"),
    count: document.getElementById("pdfa-count"),
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
    pendingSelection: null,
    // Id of the highlight whose note is being edited, or null. While this is set the
    // popover refuses to close on scroll or an outside click, so a half-typed note
    // cannot be lost by a stray gesture.
    noteEditing: null,
  };

  function status(message, isError) {
    els.status.textContent = message || "";
    els.status.style.display = message ? "block" : "none";
    els.status.className = isError ? "pdfa-status pdfa-error" : "pdfa-status";
  }

  /**
   * Talk to the plugin.
   *
   * The payload is JSON-stringified and the reply is parsed back. Passing structured
   * objects across this bridge hung with no error and no resolution, so strings are
   * the wire format in both directions.
   *
   * Wrapped in a promise so a SYNCHRONOUS throw from callAmplenotePlugin becomes a
   * rejection the caller's .catch can report - otherwise it escapes the chain entirely
   * and the viewer sits on "Loading..." forever with nothing to diagnose.
   */
  function callPlugin(payload) {
    return new Promise(function (resolve, reject) {
      try {
        if (typeof window.callAmplenotePlugin !== "function") {
          throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");
        }
        resolve(window.callAmplenotePlugin(JSON.stringify(payload)));
      } catch (err) {
        reject(err);
      }
    }).then(function (raw) {
      if (raw && typeof raw === "object") return raw;
      if (typeof raw !== "string") throw new Error("Empty reply from the plugin");
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error("Unreadable reply from the plugin: " + String(raw).slice(0, 120));
      }
    });
  }

  // ---- small helpers -------------------------------------------------------

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

  function findHighlight(id) {
    for (var i = 0; i < state.highlights.length; i++) {
      if (state.highlights[i].id === id) return state.highlights[i];
    }
    return null;
  }

  function button(label, className, onClick) {
    var el = document.createElement("button");
    el.className = "pdfa-btn" + (className ? " " + className : "");
    el.textContent = label;
    el.onclick = function (event) {
      event.stopPropagation();
      onClick();
    };
    return el;
  }

  /** A round color swatch. Shared by the toolbar and every popover context. */
  function makeSwatch(color, pressed, onPick, titlePrefix) {
    var btn = document.createElement("button");
    btn.className = "pdfa-color";
    btn.dataset.color = color.id;
    btn.style.background = color.hex;
    btn.title = titlePrefix + " " + color.label;
    btn.setAttribute("aria-label", titlePrefix + " " + color.label);
    btn.setAttribute("aria-pressed", String(!!pressed));
    btn.onclick = function (event) {
      event.stopPropagation();
      onPick(color.id);
    };
    return btn;
  }

  // ---- toolbar colors ------------------------------------------------------

  /**
   * Mount the four color buttons.
   *
   * One click does everything: it makes that color active AND, if text is currently
   * selected, highlights the selection in it. The spec requires switching color to be a
   * single click with no submenu, and requiring a second click to apply would put the
   * step back.
   */
  function mountColorButtons() {
    var list = colorList();
    for (var i = 0; i < list.length; i++) {
      els.colors.appendChild(
        makeSwatch(list[i], list[i].id === state.activeColorId, function (colorId) {
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

  // ---- rendering -----------------------------------------------------------

  function renderPage(page, index) {
    var viewport = page.getViewport({ scale: state.scale });
    state.viewports[index] = viewport;

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

    // Highlight overlay, between the canvas and the text layer. Order matters: it must
    // paint over the page but under the selectable text. See html.js for why it carries
    // no z-index and no pointer events.
    var highlightLayer = document.createElement("div");
    highlightLayer.className = "pdfa-highlights";
    wrap.appendChild(highlightLayer);

    // The text layer is the whole point: it gives real selectable text positioned over
    // the canvas, which the highlight capture below turns into geometry. Without it we
    // could only draw region boxes, which the spec explicitly rules out.
    var textLayer = document.createElement("div");
    // PDF.js's own class name, so its upstream stylesheet applies.
    textLayer.className = "textLayer";
    textLayer.style.width = viewport.width + "px";
    textLayer.style.height = viewport.height + "px";
    // PDF.js 3.x positions text spans relative to this CSS variable. It MUST match the
    // viewport scale - hardcoding it leaves every span offset from the glyph it covers,
    // so clicks and drags hit the wrong text (or nothing) even though the layer exists.
    textLayer.style.setProperty("--scale-factor", String(state.scale));
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
        var divs = [];
        return window.pdfjsLib
          .renderTextLayer({
            textContent: textContent,
            container: textLayer,
            viewport: viewport,
            textDivs: divs,
          })
          .promise.then(function () {
            // Counted so a silently empty text layer is visible in the toolbar rather
            // than presenting as "selection mysteriously does nothing".
            state.textSpans += divs.length;
            // Draw as each page lands rather than after the whole document, so
            // highlights on page 1 appear immediately in a long PDF.
            drawHighlights(index);
          });
      });
  }

  function renderAll() {
    if (state.rendering) return Promise.resolve();
    state.rendering = true;
    closePopover(true);
    els.pages.innerHTML = "";
    state.viewports = {};
    state.textSpans = 0;
    status("Rendering...");

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
        // A PDF with zero selectable spans is a scanned image, not a failure of ours -
        // say so, because "highlighting does nothing" is otherwise baffling.
        if (state.textSpans === 0) {
          status("No selectable text found - this PDF may be a scan.", true);
        } else {
          status("");
        }
        state.rendering = false;
        updateLabels();
      })
      .catch(function (err) {
        state.rendering = false;
        status("Failed to render: " + err.message, true);
      });
  }

  // ---- highlight overlay ---------------------------------------------------

  /** Bind a page's viewport so the geometry helper stays free of PDF.js knowledge. */
  function toViewportPoint(viewport) {
    return function (x, y) {
      return viewport.convertToViewportPoint(x, y);
    };
  }

  /** Redraw one page's overlay, or every page's when called with no argument. */
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

  /** Everything that has to follow a change to the highlight list. */
  function syncHighlights() {
    drawHighlights();
    renderPanel();
    els.count.textContent = String(state.highlights.length);
  }

  // ---- highlights panel ----------------------------------------------------

  /**
   * Sorted the way a reader moves through the document - down the pages, then down each
   * page. Storage order is creation order, which is not what anyone wants to read.
   */
  function sortedHighlights() {
    return state.highlights.slice().sort(function (a, b) {
      if (a.page !== b.page) return a.page - b.page;
      // PDF Y increases upward, so higher y is nearer the top of the page.
      return (b.rects[0] ? b.rects[0].y : 0) - (a.rects[0] ? a.rects[0].y : 0);
    });
  }

  function renderPanel() {
    els.panel.innerHTML = "";

    var title = document.createElement("div");
    title.className = "pdfa-panel-title";
    var label = document.createElement("span");
    label.textContent = "Highlights";
    title.appendChild(label);
    title.appendChild(button("Close", "", function () { togglePanel(false); }));
    els.panel.appendChild(title);

    var list = sortedHighlights();
    if (!list.length) {
      var empty = document.createElement("div");
      empty.className = "pdfa-panel-empty";
      empty.textContent =
        "No highlights yet. Select some text in the PDF and pick a color.";
      els.panel.appendChild(empty);
      return;
    }

    for (var i = 0; i < list.length; i++) {
      els.panel.appendChild(panelRow(list[i]));
    }
  }

  function panelRow(highlight) {
    var row = document.createElement("div");
    row.className = "pdfa-hl-row";
    row.dataset.id = highlight.id || "";
    row.title = "Jump to this highlight";

    var chip = document.createElement("span");
    chip.className = "pdfa-chip";
    chip.style.background = colorHex(highlight.color);
    row.appendChild(chip);

    var body = document.createElement("div");

    var page = document.createElement("div");
    page.className = "pdfa-hl-page";
    page.textContent = "Page " + highlight.page;
    body.appendChild(page);

    var quote = document.createElement("div");
    quote.className = "pdfa-hl-quote";
    quote.textContent =
      highlight.quoteText.length > 160
        ? highlight.quoteText.slice(0, 160) + "..."
        : highlight.quoteText;
    body.appendChild(quote);

    if (highlight.note) {
      var note = document.createElement("div");
      note.className = "pdfa-hl-note";
      note.textContent = highlight.note;
      body.appendChild(note);
    }

    row.appendChild(body);
    row.onclick = function () {
      goToHighlight(highlight);
    };
    return row;
  }

  function togglePanel(open) {
    var next = open === undefined ? !els.panel.classList.contains("pdfa-open") : open;
    els.panel.classList.toggle("pdfa-open", next);
    els.listToggle.setAttribute("aria-pressed", String(next));
    if (next) renderPanel();
  }

  // ---- capturing a selection -----------------------------------------------

  /** Walk up from a selection node to the text layer it belongs to, if any. */
  function textLayerOf(node) {
    var el = node && node.nodeType === 1 ? node : node && node.parentElement;
    while (el) {
      if (el.classList && el.classList.contains("textLayer")) return el;
      el = el.parentElement;
    }
    return null;
  }

  /**
   * Measure a selection one WORD at a time, within a single page's text layer.
   *
   * Not `range.getClientRects()`, which reports one rect per line box: when several
   * visual lines share a block - normal in a real PDF's text layer - every non-final
   * line comes back padded out to the block's full width, and the highlight paints past
   * the end of the sentence. A word cannot contain a line break, so its rect is always
   * tight around real glyphs. See textTokenRanges in geometry.js for the measurements
   * behind this.
   *
   * The quote is built from the same tokens rather than from `selection.toString()`, so
   * the text and the geometry always describe the same words - which matters when a drag
   * crosses a page break and only this page's rects are kept.
   */
  function measureSelection(range, layer) {
    var rects = [];
    var words = [];
    var walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, null);
    var node;

    while ((node = walker.nextNode())) {
      if (!range.intersectsNode(node)) continue;
      var text = node.nodeValue || "";
      var from = node === range.startContainer ? range.startOffset : 0;
      var to = node === range.endContainer ? range.endOffset : text.length;

      var tokens = geom.textTokenRanges(text, from, to);
      for (var t = 0; t < tokens.length; t++) {
        var part = document.createRange();
        part.setStart(node, tokens[t].start);
        part.setEnd(node, tokens[t].end);
        // A single word can come back as more than one rect (a browser quirk for
        // descenders - see unionClientRects). Collapsing to one rect per word here
        // stops that fragment from ever reaching line-clustering, where it would
        // otherwise be misread as a separate line and paint as a stray underline.
        var unioned = geom.unionClientRects(part.getClientRects());
        if (unioned) rects.push(unioned);
        words.push(text.slice(tokens[t].start, tokens[t].end));
      }
    }

    return { rects: rects, text: words.join(" ") };
  }

  function setPending(selection) {
    state.pendingSelection = selection;
    if (!selection) {
      els.hint.textContent = "";
      els.hint.style.display = "none";
      return;
    }
    els.hint.textContent = selection.spilled
      ? "Pick a color (page " + selection.page + " only)"
      : "Pick a color";
    els.hint.style.display = "inline";
  }

  /**
   * Turn the live DOM selection into PDF-space geometry, ready for a color.
   *
   * A selection dragged across a page break also reports rects on the following page.
   * Highlights are per-page - that is how PDF annotations work too, and the spec's
   * one-note-per-highlight rule makes splitting one selection into several highlights
   * confusing - so rects are kept for the page the selection STARTED on, and the hint
   * says which page that is rather than silently dropping the rest.
   */
  function captureSelection(event) {
    // Never let a stray mouseup interrupt someone typing a note.
    if (state.noteEditing) return;

    var sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      setPending(null);
      closePopover();
      return;
    }

    var range = sel.getRangeAt(0);
    var layer = textLayerOf(range.startContainer);
    if (!layer) return setPending(null);

    var wrap = layer.parentElement;
    if (!wrap || !wrap.dataset || !wrap.dataset.page) return setPending(null);

    var pageNum = Number(wrap.dataset.page);
    var viewport = state.viewports[pageNum];
    if (!viewport) return setPending(null);

    var containerRect = wrap.getBoundingClientRect();
    // Only this page's layer is walked, so rects from a page the drag spilled onto are
    // never collected. Comparing the layers is a more direct test of that than guessing
    // from rect positions.
    var spilled = textLayerOf(range.endContainer) !== layer;
    var measured = measureSelection(range, layer);

    var rects = geom.mergeLineRects(
      geom.clientRectsToPdfRects(measured.rects, containerRect, function (x, y) {
        return viewport.convertToPdfPoint(x, y);
      })
    );
    if (!rects.length) return setPending(null);

    // Anchor the popover where the gesture ended. Falling back to the last rect keeps
    // keyboard selection (shift-arrow, ctrl-A) working, which has no pointer position.
    var lastRect = measured.rects.length ? measured.rects[measured.rects.length - 1] : containerRect;
    var anchorX = event && event.clientX ? event.clientX : lastRect.left + lastRect.width / 2;
    var anchorY = event && event.clientY ? event.clientY : lastRect.top + lastRect.height;

    var selection = {
      page: pageNum,
      rects: rects,
      quoteText: geom.normalizeQuoteText(measured.text),
      spilled: spilled,
      anchorX: anchorX,
      anchorY: anchorY,
    };
    setPending(selection);
    openSelectionPopover(selection);
  }

  // ---- mutating highlights -------------------------------------------------

  /**
   * Apply a change optimistically, then let the plugin's answer be the truth.
   *
   * The overlay redraws immediately so the highlight appears under the cursor without
   * waiting for a note write. The plugin re-reads the note, re-validates through
   * createHighlight, and returns the canonical list - which is adopted, because it has
   * the real ids and may include changes made elsewhere. If the write fails the local
   * change is rolled back: the note is the source of truth, and leaving a highlight on
   * screen that was never saved is worse than losing it visibly.
   *
   * @returns {Promise<boolean>} whether the change actually stuck.
   */
  function applyChange(optimistic, request) {
    var previous = state.highlights;
    state.highlights = optimistic;
    syncHighlights();

    return callPlugin(request)
      .then(function (result) {
        if (!result || result.error) {
          throw new Error((result && result.error) || "The plugin did not confirm the change.");
        }
        state.highlights = result.highlights || optimistic;
        syncHighlights();
        status("");
        return true;
      })
      .catch(function (err) {
        state.highlights = previous;
        syncHighlights();
        status(err.message || String(err), true);
        return false;
      });
  }

  function applyHighlight(selection, colorId) {
    // No id: the plugin assigns one through createHighlight, so the id format has a
    // single owner. Until it comes back this highlight draws but cannot be clicked.
    var draft = {
      id: null,
      page: selection.page,
      color: colorId,
      rects: selection.rects,
      quoteText: selection.quoteText,
      note: null,
    };
    var anchorX = selection.anchorX;
    var anchorY = selection.anchorY;

    setPending(null);
    closePopover(true);
    var sel = window.getSelection();
    if (sel && sel.removeAllRanges) sel.removeAllRanges();

    applyChange(state.highlights.concat([draft]), {
      action: "addHighlight",
      attachmentUUID: cfg.attachmentUUID,
      highlight: draft,
    }).then(function (ok) {
      if (!ok) return;
      // Spec section 4: the offer to add a note must appear IMMEDIATELY after creating a
      // highlight. The plugin appends, so the new highlight is the last one back.
      var created = state.highlights[state.highlights.length - 1];
      if (created && created.id) openHighlightPopover(created, anchorX, anchorY, true);
    });
  }

  function recolorHighlight(id, colorId) {
    closePopover(true);
    applyChange(
      state.highlights.map(function (h) {
        return h.id === id ? Object.assign({}, h, { color: colorId }) : h;
      }),
      { action: "recolorHighlight", attachmentUUID: cfg.attachmentUUID, id: id, color: colorId }
    );
  }

  function removeHighlightById(id) {
    closePopover(true);
    applyChange(
      state.highlights.filter(function (h) {
        return h.id !== id;
      }),
      { action: "removeHighlight", attachmentUUID: cfg.attachmentUUID, id: id }
    );
  }

  function saveNote(id, text) {
    var trimmed = String(text == null ? "" : text).trim();
    state.noteEditing = null;
    closePopover(true);
    applyChange(
      state.highlights.map(function (h) {
        return h.id === id ? Object.assign({}, h, { note: trimmed || null }) : h;
      }),
      { action: "setHighlightNote", attachmentUUID: cfg.attachmentUUID, id: id, note: trimmed }
    );
  }

  // ---- the popover ---------------------------------------------------------

  /**
   * Show the popover at a point, in fixed client coordinates.
   *
   * Fixed positioning works because the embed is its own iframe: a click's client
   * coordinates are already relative to this element's containing block, and the whole
   * frame moves as one unit when the surrounding note scrolls.
   */
  function showPopover(children, clientX, clientY, editing) {
    els.popover.innerHTML = "";
    els.popover.classList.toggle("pdfa-editing", !!editing);
    for (var i = 0; i < children.length; i++) els.popover.appendChild(children[i]);

    // Must be visible before measuring - a display:none element has no size.
    els.popover.classList.add("pdfa-open");
    var width = els.popover.offsetWidth;
    var height = els.popover.offsetHeight;
    var left = Math.max(4, Math.min(clientX - width / 2, window.innerWidth - width - 4));
    var top = clientY + 12;
    // Flip above the cursor rather than off the bottom of a short embed.
    if (top + height > window.innerHeight - 4) top = Math.max(4, clientY - height - 12);
    els.popover.style.left = left + "px";
    els.popover.style.top = top + "px";
  }

  /**
   * @param {boolean} force close even while a note is being edited. Everything that is
   * a deliberate dismissal passes true; incidental events (a scroll, a click on blank
   * page) pass nothing, so half-typed text survives them.
   */
  function closePopover(force) {
    if (state.noteEditing && !force) return;
    state.noteEditing = null;
    els.popover.classList.remove("pdfa-open", "pdfa-editing");
    els.popover.innerHTML = "";
  }

  /** Context 1: a fresh selection. Colors only - one click from selection to highlight. */
  function openSelectionPopover(selection) {
    var list = colorList();
    var children = [];
    for (var i = 0; i < list.length; i++) {
      children.push(
        makeSwatch(list[i], list[i].id === state.activeColorId, function (colorId) {
          state.activeColorId = colorId;
          updateColorButtons();
          applyHighlight(selection, colorId);
        }, "Highlight")
      );
    }
    showPopover(children, selection.anchorX, selection.anchorY);
  }

  /** Contexts 2 and 3: an existing highlight, either just created or clicked. */
  function openHighlightPopover(highlight, clientX, clientY, justCreated) {
    var list = colorList();
    var children = [];
    for (var i = 0; i < list.length; i++) {
      children.push(
        makeSwatch(list[i], list[i].id === highlight.color, function (colorId) {
          recolorHighlight(highlight.id, colorId);
        }, "Change to")
      );
    }

    // A highlight has at most one note (spec section 4), so this is one button whose
    // label reflects which of the two operations it is.
    var hasNote = !!highlight.note;
    children.push(
      button(hasNote ? "Edit note" : "Add note", justCreated && !hasNote ? "pdfa-btn-primary" : "", function () {
        openNoteEditor(highlight, clientX, clientY);
      })
    );
    children.push(
      button("Remove", "pdfa-remove", function () {
        removeHighlightById(highlight.id);
      })
    );

    showPopover(children, clientX, clientY);
  }

  /** Context 4: the note editor. One plain-text note, per spec section 4. */
  function openNoteEditor(highlight, clientX, clientY) {
    state.noteEditing = highlight.id;

    var input = document.createElement("textarea");
    input.className = "pdfa-note-input";
    input.rows = 3;
    input.value = highlight.note || "";
    input.placeholder = "Note for this highlight";

    var actions = document.createElement("div");
    actions.className = "pdfa-note-actions";

    // Clearing the box and saving also removes the note, but an explicit control is
    // what the spec asks for and it is far more discoverable.
    if (highlight.note) {
      actions.appendChild(
        button("Delete note", "", function () {
          saveNote(highlight.id, "");
        })
      );
    }
    var spacer = document.createElement("span");
    spacer.className = "pdfa-spacer";
    actions.appendChild(spacer);
    actions.appendChild(
      button("Cancel", "", function () {
        cancelNoteEditing(highlight, clientX, clientY);
      })
    );
    actions.appendChild(
      button("Save", "pdfa-btn-primary", function () {
        saveNote(highlight.id, input.value);
      })
    );

    input.onkeydown = function (event) {
      // Enter alone has to insert a newline - notes are plain text and may be several
      // lines - so the save shortcut needs a modifier.
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        event.stopPropagation();
        saveNote(highlight.id, input.value);
      } else if (event.key === "Escape") {
        event.preventDefault();
        // Must not reach the document handler. Cancelling clears state.noteEditing and
        // reopens the highlight's actions; the document handler, seeing no edit in
        // progress by the time the event bubbles up, would then close what was just
        // reopened - so Escape appeared to dismiss the popover entirely.
        event.stopPropagation();
        cancelNoteEditing(highlight, clientX, clientY);
      }
    };

    showPopover([input, actions], clientX, clientY, true);
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }

  /** Back out of the editor to the highlight's own actions, not to nothing. */
  function cancelNoteEditing(highlight, clientX, clientY) {
    state.noteEditing = null;
    var current = findHighlight(highlight.id) || highlight;
    openHighlightPopover(current, clientX, clientY);
  }

  /**
   * Find the highlight under a click by hit-testing in PDF space.
   *
   * Not done with pointer events on the overlay rects: those would sit under the text
   * layer and, if raised above it, would block text selection over highlighted text -
   * which is exactly where a user wants to re-highlight or extend a selection.
   */
  function onPagesClick(event) {
    if (state.noteEditing) return;

    var sel = window.getSelection();
    // A drag that selected text ends in a click too; that is a selection, not a tap on
    // a highlight, and captureSelection has already handled it.
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

    // A highlight still waiting on its first save has no id yet, so there is nothing to
    // act on. Ignore it for the moment rather than opening a broken popover.
    if (hit && hit.id) openHighlightPopover(hit, event.clientX, event.clientY);
    else closePopover();
  }

  // ---- navigation ----------------------------------------------------------

  function updateLabels() {
    els.pageLabel.textContent = state.current + " / " + state.pageCount;
    els.zoomLabel.textContent = Math.round(state.scale * 100) + "%";
  }

  function scroller() {
    return els.root.querySelector(".pdfa-scroll");
  }

  function goToPage(pageNum) {
    var target = Math.min(Math.max(1, pageNum), state.pageCount);
    var el = els.pages.querySelector('[data-page="' + target + '"]');
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    state.current = target;
    updateLabels();
  }

  /**
   * Scroll a specific highlight into view.
   *
   * Measured through getBoundingClientRect rather than offsetTop: none of the ancestors
   * between a page and the scroller is positioned, so offsetParent is not the element
   * you would assume. This is also the primitive Phase 5's deep-links need.
   */
  function goToHighlight(highlight) {
    var wrap = els.pages.querySelector('.pdfa-page[data-page="' + highlight.page + '"]');
    var viewport = state.viewports[highlight.page];
    if (!wrap || !viewport || !highlight.rects || !highlight.rects.length) return;

    var vr = geom.pdfRectToViewportRect(highlight.rects[0], toViewportPoint(viewport));
    var box = scroller();
    var targetTop = wrap.getBoundingClientRect().top + vr.y;
    // A third of the way down reads better than flush to the top edge.
    box.scrollTop += targetTop - box.getBoundingClientRect().top - box.clientHeight / 3;

    state.current = highlight.page;
    updateLabels();
  }

  function setZoom(scale) {
    state.scale = Math.min(Math.max(0.4, scale), 4);
    renderAll();
  }

  // Keep the page indicator honest as the user scrolls.
  function trackScroll() {
    // The popover is positioned in fixed client coordinates, so it would hang in place
    // over unrelated content once the page moves under it. Not while a note is being
    // typed, though - see closePopover.
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

  // ---- boot ----------------------------------------------------------------

  /**
   * Load PDF.js and resolve once it is actually available.
   *
   * Done here rather than with an external script tag in the embed HTML: Amplenote
   * re-executes the embed's inline scripts immediately, so such a tag is still
   * downloading when the viewer starts and `window.pdfjsLib` is undefined.
   *
   * NOTE: this whole function is serialized into an inline script, comments included.
   * Never write a literal closing script tag anywhere in this file - even inside a
   * comment or string, it would terminate the embed's script block early.
   */
  function loadPdfJs() {
    return new Promise(function (resolve, reject) {
      if (window.pdfjsLib) return resolve(window.pdfjsLib);
      var tag = document.createElement("script");
      tag.src = cfg.pdfJsSrc;
      tag.onload = function () {
        if (window.pdfjsLib) resolve(window.pdfjsLib);
        else reject(new Error("PDF.js loaded but did not register itself."));
      };
      tag.onerror = function () {
        reject(new Error("Could not load PDF.js from the CDN."));
      };
      document.head.appendChild(tag);
    });
  }

  /**
   * Stored highlights are not worth failing the whole viewer over - a PDF that renders
   * without its highlights is still usable, and the error says which half broke.
   */
  function loadHighlights() {
    return callPlugin({ action: "loadHighlights", attachmentUUID: cfg.attachmentUUID })
      .then(function (result) {
        if (!result || result.error) {
          throw new Error((result && result.error) || "No answer from the plugin");
        }
        state.highlights = result.highlights || [];
      })
      .catch(function (err) {
        state.highlights = [];
        status("Could not load saved highlights: " + (err.message || err), true);
      });
  }

  function boot() {
    status("Loading PDF...");

    loadPdfJs()
      .then(function (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = cfg.workerSrc;
        return callPlugin({ action: "getPdfUrl", attachmentUUID: cfg.attachmentUUID });
      })
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
        // Before rendering, so the first page paints with its highlights already on it.
        return loadHighlights();
      })
      .then(function () {
        return renderAll();
      })
      .then(function () {
        syncHighlights();
        // Deep-link target from the embed args (spec section 7.3). A highlight id is
        // more precise than a page, so it wins when both are present.
        var target = cfg.highlightId ? findHighlight(cfg.highlightId) : null;
        if (target) goToHighlight(target);
        else if (cfg.page) goToPage(cfg.page);
      })
      .catch(function (err) {
        status(err.message || String(err), true);
      });
  }

  // Any throw from here on would leave the embed frozen on its initial status with no
  // clue why, so surface it in the UI - the embed's console is not reachable from the
  // parent page.
  try {
    document.getElementById("pdfa-prev").onclick = function () { goToPage(state.current - 1); };
    document.getElementById("pdfa-next").onclick = function () { goToPage(state.current + 1); };
    document.getElementById("pdfa-zoom-in").onclick = function () { setZoom(state.scale + 0.25); };
    document.getElementById("pdfa-zoom-out").onclick = function () { setZoom(state.scale - 0.25); };
    els.listToggle.onclick = function () { togglePanel(); };
    scroller().addEventListener("scroll", trackScroll);

    // Scoped to the page area on purpose. On `document` it would also fire when the user
    // releases the mouse on a toolbar button - and by then the browser has collapsed the
    // selection, so the pending capture would be thrown away just before it is used.
    els.pages.addEventListener("mouseup", captureSelection);
    els.pages.addEventListener("click", onPagesClick);
    document.addEventListener("keydown", function (event) {
      // The editor handles its own Escape, so this only reaches the other contexts.
      if (event.key === "Escape" && !state.noteEditing) closePopover();
    });

    mountColorButtons();
    renderPanel();
    boot();
  } catch (err) {
    status("Viewer failed to start: " + (err && err.message ? err.message : err), true);
  }
}
