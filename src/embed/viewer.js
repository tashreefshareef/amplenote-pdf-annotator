/**
 * The PDF viewer that runs INSIDE the embed iframe.
 *
 * This function is serialized with `.toString()` and injected into the embed HTML, so:
 *   - it must be entirely self-contained - no imports, no closure over module scope
 *   - configuration arrives on `window.__PDFA_CONFIG`
 *   - the pure rect arithmetic arrives on `window.__PDFA_GEOM` (src/geometry.js,
 *     injected the same way) rather than being reimplemented here
 *   - the pdf-lib annotation writer arrives on `window.__PDFA_ANNOTATIONS`
 *     (src/annotations.js, injected the same way), for the same reason
 *   - the export markdown builder arrives on `window.__PDFA_EXPORT`
 *     (src/export.js, injected the same way), for the same reason again
 *   - it cannot be unit tested (it needs a real iframe, PDF.js, and a live plugin
 *     bridge), which is exactly why everything decidable lives in src/ modules instead.
 *     Keep this file about DOM, PDF.js and pdf-lib wiring only. See spec section 8.
 *
 * Scope: render every page with a real text layer, zoom and page navigation, the full
 * highlight loop (create, recolor, remove), one plain-text note per highlight, a panel
 * listing everything, downloading the PDF with every highlight and note baked in as a
 * native annotation, and exporting highlights back into Amplenote notes - copy one to
 * the clipboard, send one to the bottom of the source note, or export every highlight
 * (optionally filtered by color) into an auto-created destination note.
 *
 * THE POPOVER IS THE CENTRE OF THE UI. One element, five contexts:
 *   - a fresh text selection -> the four colors, so highlighting never requires a trip
 *     to the toolbar
 *   - straight after creating a highlight -> "Add note", because the spec requires that
 *     offer to appear immediately
 *   - an existing highlight -> recolor, add/edit note, copy, send to note, remove
 *   - the note editor itself
 *   - "export all"'s color filter - the one context where the swatches are an
 *     independent multi-select instead of "pick one"
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
  var annotations = window.__PDFA_ANNOTATIONS || {};
  var exportBuilder = window.__PDFA_EXPORT || {};
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
    more: document.getElementById("pdfa-more"),
    open: document.getElementById("pdfa-open"),
    scrollUp: document.getElementById("pdfa-scroll-up"),
    scrollDown: document.getElementById("pdfa-scroll-down"),
    collapsedCount: document.getElementById("pdfa-collapsed-count"),
    // The collapsed bar carries its own copy of the filename - renderEmbed has no name to
    // put in the markup (it only knows the attachment uuid), so both name slots start
    // empty and are filled once the name is actually resolved.
    collapsedName: document.querySelector(".pdfa-collapsed-name"),
    name: document.querySelector(".pdfa-name"),
  };

  /** Fill BOTH name slots. Setting only the toolbar's left the collapsed bar unlabelled. */
  function setAttachmentName(name) {
    if (!name) return;
    state.attachmentName = name;
    if (els.name) els.name.textContent = name;
    if (els.collapsedName) els.collapsedName.textContent = name;
  }

  var state = {
    doc: null,
    scale: 1.25,
    pageCount: 0,
    current: 1,
    rendering: false,
    textSpans: 0,
    // Per-page PDF.js viewport at the CURRENT scale. Rebuilt on every render, and the
    // only thing allowed to convert between PDF space and screen pixels.
    //
    // Populated for EVERY page up front, including ones not yet rendered - deep links,
    // hit-testing and the highlights panel all need a page's geometry whether or not its
    // canvas exists yet. It therefore no longer answers "has this page rendered?", which
    // is what `rendered` below is for. That distinction is load-bearing: the selection
    // capture used to test `viewports[n]` to mean "the text layer is ready", and with
    // viewports now filled in early that test would silently pass for a page that has no
    // text layer at all.
    viewports: {},
    // page number -> true once its canvas AND text layer are actually built.
    rendered: {},
    // page number -> true while its render is in flight, so a burst of scroll events
    // cannot start the same page several times over.
    renderingPage: {},
    highlights: [],
    // The SOURCE pdf's own bytes, kept for Download. A deliberately SEPARATE copy from
    // whatever gets handed to pdf.js's getDocument(): some versions transfer ownership
    // of the ArrayBuffer to their worker for performance, which would leave this one
    // detached (byteLength 0) if it were the same object. Cloning once, up front, costs
    // little next to a multi-megabyte PDF and removes the need to know which versions do.
    pdfBytes: null,
    // Seeded from the tag so it is right from the first paint - exports and the
    // destination note's name both read this, and both came out labelled "PDF" back when
    // it could only be filled in by the runtime lookup that was silently failing.
    attachmentName: cfg.attachmentName || "",
    activeColorId: cfg.defaultColorId || ((cfg.colors || [{}])[0] || {}).id,
    // The last text selection made inside a text layer, already converted to PDF space.
    // Held because clicking a toolbar button collapses the DOM selection before the
    // click handler runs - by then window.getSelection() is empty.
    pendingSelection: null,
    // The raw DOM text of whatever pendingSelection was built from. Only job: let the
    // touch capture path tell "the mouse already handled this exact selection" from "a
    // genuinely new one", so the two triggers can coexist without double-capturing.
    // Maintained solely by setPending, so it can never drift from pendingSelection.
    lastCapturedText: "",
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
   *
   * `noteUUID` rides along on EVERY call, injected here once rather than at each call
   * site - it's the note this embed was rendered into (captured by plugin.js at
   * renderEmbed time), sent explicitly so the plugin side never has to trust its own
   * `app.context.noteUUID` being fresh on every onEmbedCall. That trust broke
   * specifically when a note was navigated away from and back to: the embed remounts,
   * but the plugin's own context read a stale note id, so a highlight that was still
   * genuinely saved got looked up against the wrong note and looked like it had vanished.
   */
  function callPlugin(payload) {
    var withNoteUUID = Object.assign({ noteUUID: cfg.noteUUID }, payload);
    return new Promise(function (resolve, reject) {
      try {
        if (typeof window.callAmplenotePlugin !== "function") {
          throw new Error("Plugin bridge unavailable (callAmplenotePlugin missing)");
        }
        resolve(window.callAmplenotePlugin(JSON.stringify(withNoteUUID)));
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

  /**
   * Every color a highlight is allowed to BE - the resolver, not the picker.
   *
   * Anything that turns a stored highlight into pixels or into a hex goes through here,
   * so a highlight made in a color the user has since taken off their toolbar still
   * renders in the color it was made in. See html.js's config comment for what breaks if
   * these two lists are ever collapsed into one.
   */
  function colorList() {
    return cfg.colors || [];
  }

  /** The subset wearing toolbar circles, in the user's own order. */
  function toolbarColors() {
    var ids = cfg.toolbarColorIds || [];
    var list = colorList();
    var out = [];
    for (var i = 0; i < ids.length; i++) {
      for (var j = 0; j < list.length; j++) {
        if (list[j].id === ids[i]) { out.push(list[j]); break; }
      }
    }
    // An unrecognized setting must never leave the bar empty - highlighting would be
    // unreachable. The plugin side already falls back (colors.js), so this only catches a
    // config built by hand.
    return out.length ? out : list.slice(0, 4);
  }

  /**
   * The colors this document's highlights actually use, in catalog order. Empty document
   * falls back to the toolbar's four so the export filter is never a blank row.
   */
  function usedColors() {
    var seen = {};
    for (var i = 0; i < state.highlights.length; i++) seen[state.highlights[i].color] = true;
    var out = colorList().filter(function (c) { return seen[c.id]; });
    return out.length ? out : toolbarColors();
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

  /**
   * A Material Icons glyph from cfg.icons - see icons.js for why the path data arrives as
   * config rather than as markup.
   *
   * createElementNS, not innerHTML or createElement: an <svg> built in the HTML namespace
   * is an unknown element that renders nothing at all, which looks exactly like a missing
   * icon rather than like a bug. setAttribute("class"), for the same reason - .className
   * on an SVG element is a read-only SVGAnimatedString, so assigning to it silently does
   * nothing.
   */
  function iconEl(key) {
    var path = (cfg.icons || {})[key];
    if (!path) return null;
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", "pdfa-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    // The button's own text is the accessible name; without this the graphic is announced
    // as a second, nameless child of it.
    svg.setAttribute("aria-hidden", "true");
    var node = document.createElementNS(ns, "path");
    node.setAttribute("d", path);
    svg.appendChild(node);
    return svg;
  }

  /**
   * A popover button. `iconKey` is optional: menu and action buttons carry an icon, the
   * way Amplenote's own menus do, while form buttons (Save, Cancel, Close) stay plain
   * text - that is the line between the two, not an oversight where one is missing.
   */
  function button(label, className, onClick, iconKey) {
    var el = document.createElement("button");
    el.className = "pdfa-btn" + (className ? " " + className : "");
    var glyph = iconKey ? iconEl(iconKey) : null;
    if (glyph) {
      el.appendChild(glyph);
      var text = document.createElement("span");
      text.textContent = label;
      el.appendChild(text);
    } else {
      el.textContent = label;
    }
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
    var list = toolbarColors();
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

  /**
   * Measure every page without rasterizing any of them.
   *
   * `getPage` only parses a page's dictionary - no canvas, no glyphs - so this is cheap
   * next to rendering, and it is what lets every page box be created at its true size
   * immediately. Sizing placeholders from page 1 instead would have been cheaper still,
   * but any PDF that mixes page sizes or rotations (a landscape table dropped into a
   * portrait report, a rotated scan) would then reflow under the reader as pages render,
   * moving the text they are in the middle of selecting.
   */
  function collectViewports() {
    var jobs = [];
    for (var i = 1; i <= state.pageCount; i++) {
      (function (num) {
        jobs.push(
          state.doc.getPage(num).then(function (page) {
            state.viewports[num] = page.getViewport({ scale: state.scale });
          })
        );
      })(i);
    }
    return Promise.all(jobs);
  }

  /** The empty, correctly-sized box a page occupies before (and after) it renders. */
  function createPageBox(index) {
    var viewport = state.viewports[index];
    var wrap = document.createElement("div");
    wrap.className = "pdfa-page";
    wrap.dataset.page = String(index);
    wrap.style.width = viewport.width + "px";
    wrap.style.height = viewport.height + "px";
    return wrap;
  }

  /**
   * Fill one page box in: canvas, highlight overlay, text layer.
   *
   * Split out from the box itself so the document's full height and every page's position
   * exist from the start, while the expensive part happens only for pages someone can
   * actually see. Before this, opening a PDF rendered every page up front and every zoom
   * step re-rendered all of them - fine for the 3-page files this was built against,
   * brutal for a 50-page one, and worst on a phone, which has both the least memory and
   * (since zoom moved into the overflow menu) the most reason to re-render.
   */
  function renderPageContent(wrap, index) {
    if (state.rendered[index] || state.renderingPage[index]) return Promise.resolve();
    state.renderingPage[index] = true;

    var viewport = state.viewports[index];

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

    var ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);

    var pageRef = null;
    return state.doc
      .getPage(index)
      .then(function (page) {
        pageRef = page;
        return page.render({ canvasContext: ctx, viewport: viewport }).promise;
      })
      .then(function () {
        return pageRef.getTextContent();
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
            // renderTextLayer's textDivs output is index-matched to textContent.items -
            // PDF.js's own documented contract. Attaching each item directly to the div
            // PDF.js built for it is what lets measureSelection reach the item's own
            // PDF-space transform/width/height later, without a second lookup pass.
            for (var d = 0; d < divs.length; d++) {
              divs[d].__pdfaItem = textContent.items[d];
            }
            // Draw as each page lands rather than after the whole document, so
            // highlights on page 1 appear immediately in a long PDF.
            state.rendered[index] = true;
            state.renderingPage[index] = false;
            drawHighlights(index);
            reportTextAvailability();
          });
      })
      ["catch"](function (err) {
        // One page failing must not take the document with it - the rest stays readable,
        // and this page can be retried simply by scrolling away and back.
        state.renderingPage[index] = false;
        status("Failed to render page " + index + ": " + (err.message || err), true);
      });
  }

  /**
   * Render every page near the viewport, and nothing else.
   *
   * The margin is a full screenful on each side, so the next page is already there by the
   * time it is scrolled to rather than appearing blank and filling in late.
   *
   * Positions come from getBoundingClientRect against the scroller's own rect, not
   * offsetTop: nothing between a page and the scroller is positioned, so offsetParent is
   * not the element it looks like it should be - the same trap goToHighlight documents.
   */
  function ensureVisiblePagesRendered() {
    var box = scroller();
    if (!box || !state.doc) return Promise.resolve();

    var boxRect = box.getBoundingClientRect();
    var margin = box.clientHeight;
    var wraps = els.pages.querySelectorAll(".pdfa-page");
    var started = [];

    for (var i = 0; i < wraps.length; i++) {
      var wrap = wraps[i];
      var num = Number(wrap.dataset.page);
      if (state.rendered[num] || state.renderingPage[num]) continue;

      var rect = wrap.getBoundingClientRect();
      var top = rect.top - boxRect.top;
      var bottom = rect.bottom - boxRect.top;
      if (bottom < -margin || top > box.clientHeight + margin) continue;

      started.push(renderPageContent(wrap, num));
    }
    return Promise.all(started);
  }

  /**
   * A PDF with no selectable text is a scan, not a failure of ours - say so, because
   * "highlighting does nothing" is otherwise baffling.
   *
   * Judged only across the pages rendered SO FAR, which is all lazy rendering can know.
   * That is also the more useful reading: it warns while you are looking at an imageless
   * page and clears itself the moment any page with text arrives, rather than staying
   * silent about a document whose first twenty pages are scans.
   */
  function reportTextAvailability() {
    // Says nothing until at least one page has actually finished. Since renderAll now
    // resolves on layout rather than on pixels, an unguarded check would fire while zero
    // pages had rendered and accuse every PDF of being a scan for a moment.
    var done = 0;
    for (var k in state.rendered) {
      if (state.rendered[k]) done++;
    }
    if (!done) return;
    var isScan = state.textSpans === 0;
    status(isScan ? "No selectable text found - this PDF may be a scan." : "", isScan);
  }

  function renderAll() {
    if (state.rendering) return Promise.resolve();
    state.rendering = true;
    closePopover(true);
    status("Rendering...");

    // Where the reader was, as a fraction of the scrollable range. Emptying els.pages
    // collapses the scroller to nothing, which resets scrollTop to 0 - so without this a
    // zoom step dumped you back at page 1. Harmless when every page rendered anyway;
    // actively bad now, because landing at the top also decides which pages get rendered.
    var box = scroller();
    var wasScrollable = box ? box.scrollHeight - box.clientHeight : 0;
    var frac = wasScrollable > 0 ? box.scrollTop / wasScrollable : 0;

    els.pages.innerHTML = "";
    state.viewports = {};
    state.rendered = {};
    state.renderingPage = {};
    state.textSpans = 0;

    return collectViewports()
      .then(function () {
        for (var i = 1; i <= state.pageCount; i++) {
          els.pages.appendChild(createPageBox(i));
        }
        // Restore the reading position BEFORE choosing what to render, or the only pages
        // built would be the ones at the top that nobody is looking at.
        if (box) {
          var nowScrollable = box.scrollHeight - box.clientHeight;
          box.scrollTop = frac * (nowScrollable > 0 ? nowScrollable : 0);
        }

        state.rendering = false;
        updateLabels();
        // The scrollable height just changed, so which of the two controls is at its
        // end may have changed with it - a zoom out can end a document that was
        // scrollable a moment ago.
        syncScrollNav();

        // Resolves HERE, once the document's geometry is final - deliberately NOT after
        // the pages rasterize. Everything downstream of a render (the deep-link jump to a
        // page or highlight, scrolling, hit-testing) needs positions, not pixels, and all
        // of those exist now. Waiting for pixels would put the deep link back behind the
        // one operation that can stall indefinitely when the embed is off-screen, which
        // is the trap this project has now hit three times. Rasterization continues in
        // the background and each page draws itself in as it lands.
        ensureVisiblePagesRendered();
      })
      ["catch"](function (err) {
        state.rendering = false;
        status("Failed to render: " + (err.message || err), true);
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
        if (!h || h.page !== num || !h.rects || !h.rects.length) continue;

        // One blend group per highlight (see the CSS comment on .pdfa-hl-group) - the
        // id lives on the group now, since it identifies the highlight, not any one
        // of its line rects.
        var group = document.createElement("div");
        group.className = "pdfa-hl-group";
        group.dataset.id = h.id || "";

        for (var k = 0; k < h.rects.length; k++) {
          var vr = geom.pdfRectToViewportRect(h.rects[k], convert);
          var el = document.createElement("div");
          el.className = "pdfa-hl";
          el.style.left = vr.x + "px";
          el.style.top = vr.y + "px";
          el.style.width = vr.width + "px";
          el.style.height = vr.height + "px";
          el.style.background = colorHex(h.color);
          group.appendChild(el);
        }

        layer.appendChild(group);
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

    // A row does ONE thing: jump to its highlight. It used to carry a hover trash that
    // un-sent the highlight's exported block while keeping the highlight itself - it
    // worked, but a bare trash on a row can only be read as "delete this row", and its
    // entire effect happened in the note far below the embed, so from here it looked like
    // a no-op that just removed its own icon. Reported live on exactly those terms.
    //
    // Removed rather than relabelled, because the capability was nearly redundant: the
    // popover's Remove already deletes the block along with the highlight (see
    // removeHighlight in embed-call.js), and deleting the block's text in the note by
    // hand is a supported path - the plugin rescans the note and re-syncs by itself.
    // What was left was one saved manual deletion, priced at the most confusing control
    // in the viewer.
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
    // The buttons now point at a different region with a different scroll position, so
    // their enabled state is stale the instant the panel opens or closes. Opening a panel
    // that fits on screen must leave both greyed out, not leave Down looking live because
    // the pages behind it happen to be scrollable.
    syncScrollNav();
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
   * Each word's rect comes from `itemRelativeRect` (geometry.js), not the page's
   * viewport transform - see that function's own comment for the full reasoning, but in
   * short: PDF.js can apply a per-item `scaleX` CSS correction when the browser
   * substitutes a font, exact for the item's TOTAL width but not necessarily uniform per
   * character. A WORD is exactly the partial-item selection that exposes that, which is
   * why the identical highlight measured correctly in one browser and overshot in
   * another - confirmed live. Measuring one rect per word (rather than one per line, via
   * `range.getClientRects()`) is separately what keeps a highlight tight to its own
   * sentence rather than padded to a wrapped line's full block width - see
   * textTokenRanges in geometry.js for that half of the reasoning.
   *
   * The quote is built from the same tokens rather than from `selection.toString()`, so
   * the text and the geometry always describe the same words - which matters when a drag
   * crosses a page break and only this page's rects are kept.
   */
  function measureSelection(range, layer) {
    var rects = [];
    var words = [];
    var lastCssRect = null;
    var walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT, null);
    var node;

    while ((node = walker.nextNode())) {
      if (!range.intersectsNode(node)) continue;
      var text = node.nodeValue || "";
      var from = node === range.startContainer ? range.startOffset : 0;
      var to = node === range.endContainer ? range.endOffset : text.length;

      var div = node.parentElement;
      var item = div && div.__pdfaItem;
      // Every div PDF.js builds gets its item attached in renderPage. No item means no
      // reliable way to place this word in PDF space - skip it rather than guess; a
      // missing word beats a wrongly-sized one.
      if (!item) continue;

      var itemBox = {
        x1: item.transform[4],
        y1: item.transform[5],
        x2: item.transform[4] + item.width,
        y2: item.transform[5] + item.height,
      };
      var parentRect = div.getBoundingClientRect();

      var tokens = geom.textTokenRanges(text, from, to);
      for (var t = 0; t < tokens.length; t++) {
        var part = document.createRange();
        part.setStart(node, tokens[t].start);
        part.setEnd(node, tokens[t].end);
        // A single word can come back as more than one rect (a browser quirk for
        // descenders - see unionClientRects). Collapsing to one rect per word here
        // stops that fragment from ever reaching line-clustering, where it would
        // otherwise be misread as a separate line and paint as a stray underline.
        var subRect = geom.unionClientRects(part.getClientRects());
        if (!subRect) continue;
        // unionClientRects returns {left,top,width,height}; itemRelativeRect needs the
        // full {left,top,right,bottom} shape too, same as a native DOMRect - keeping
        // width/height alongside is what lets this double as the anchor fallback below.
        var subRectFull = {
          left: subRect.left,
          top: subRect.top,
          width: subRect.width,
          height: subRect.height,
          right: subRect.left + subRect.width,
          bottom: subRect.top + subRect.height,
        };

        var pdfRect = geom.itemRelativeRect(itemBox, parentRect, subRectFull);
        if (!pdfRect) continue;

        rects.push(pdfRect);
        words.push(text.slice(tokens[t].start, tokens[t].end));
        lastCssRect = subRectFull;
      }
    }

    return { rects: rects, text: words.join(" "), lastCssRect: lastCssRect };
  }

  function setPending(selection) {
    state.pendingSelection = selection;
    state.lastCapturedText = selection ? selection.rawText || "" : "";
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
    // Confirms the page has finished rendering - and so has every div's __pdfaItem -
    // before trusting a selection inside it. measureSelection no longer needs the
    // viewport itself: itemRelativeRect measures against each word's own text-content
    // item, not the page-level transform. See geometry.js for why.
    //
    // Tests `rendered`, NOT `viewports`: since lazy rendering, every page has a viewport
    // from the moment the document opens, so the old check would wave through a page
    // whose text layer does not exist yet.
    if (!state.rendered[pageNum]) return setPending(null);

    // Only this page's layer is walked, so rects from a page the drag spilled onto are
    // never collected. Comparing the layers is a more direct test of that than guessing
    // from rect positions.
    var spilled = textLayerOf(range.endContainer) !== layer;
    var measured = measureSelection(range, layer);
    var rects = geom.mergeLineRects(measured.rects);
    if (!rects.length) return setPending(null);

    // Anchor the popover where the gesture ended. Falling back to the last measured
    // word's own screen rect keeps keyboard selection (shift-arrow, ctrl-A) working,
    // which has no pointer position.
    var lastRect = measured.lastCssRect || wrap.getBoundingClientRect();
    var anchorX = event && event.clientX ? event.clientX : lastRect.left + lastRect.width / 2;
    var anchorY = event && event.clientY ? event.clientY : lastRect.top + lastRect.height;

    var selection = {
      page: pageNum,
      rects: rects,
      quoteText: geom.normalizeQuoteText(measured.text),
      spilled: spilled,
      anchorX: anchorX,
      anchorY: anchorY,
      // The UNnormalized DOM text, kept only for the identity check in
      // captureSettledSelection - quoteText has been through normalizeQuoteText and so
      // can no longer be compared against a live window.getSelection().
      rawText: String(sel),
    };
    setPending(selection);
    openSelectionPopover(selection);
  }

  /**
   * The touch half of selection capture.
   *
   * Confirmed on Android in the Amplenote app: a long-press selects text natively,
   * handles and all, but NO mouseup ever reaches the listener that drives
   * captureSelection - so the colors never appeared and highlighting, the entire point
   * of the plugin, was unreachable on a phone. Taps were unaffected throughout
   * (tap-to-recolor an existing highlight kept working), which is what narrowed it to
   * the mouse events rather than to the click path or the hit-testing.
   *
   * Three properties keep this from disturbing the mouse path, which is well covered and
   * full of hard-won ordering subtleties:
   *
   *   1. It only ever ADDS a capture. Clearing pending state on an empty selection stays
   *      exclusively with mouseup. That matters because `selectionchange` fires when the
   *      browser collapses the selection as a toolbar button is pressed - the very
   *      moment pendingSelection is about to be read - and clearing there would break
   *      picking a color on DESKTOP, the same trap that keeps the mouseup listener
   *      scoped to els.pages instead of document.
   *   2. It skips a selection the mouse already captured, by comparing raw DOM text. So
   *      on desktop mouseup wins the race and this becomes a no-op, rather than
   *      re-anchoring the popover away from the pointer a moment after it opened.
   *   3. It waits for the selection to SETTLE. `selectionchange` fires continuously
   *      while a handle is dragged; capturing on each one would re-measure and re-anchor
   *      the popover on every frame of the drag.
   */
  var SELECTION_SETTLE_MS = 300;
  var selectionSettleTimer = null;

  function onSelectionChanged() {
    if (state.noteEditing) return;
    if (selectionSettleTimer) clearTimeout(selectionSettleTimer);
    selectionSettleTimer = setTimeout(captureSettledSelection, SELECTION_SETTLE_MS);
  }

  function captureSettledSelection() {
    selectionSettleTimer = null;
    if (state.noteEditing) return;

    var sel = window.getSelection();
    // Property 1: no selection is not our business - see the doc comment above.
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;
    // Anything outside a page's text layer (the note editor, the panel, the note
    // textarea) is somebody else's selection.
    if (!textLayerOf(sel.getRangeAt(0).startContainer)) return;
    // Property 2.
    if (String(sel) === state.lastCapturedText) return;

    // No event, so captureSelection falls back to anchoring on the last measured word's
    // own rect - the path built for keyboard selection, which has no pointer either.
    captureSelection(null);
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
    var recolored = state.highlights.map(function (h) {
      return h.id === id ? Object.assign({}, h, { color: colorId }) : h;
    });
    // Built HERE, from the already-recoloured highlight, and sent along: a block already
    // in the note carries the old colour otherwise, and the colour is the block's whole
    // reason for existing. Assembled client-side like every other export (src/export.js).
    var updated = null;
    for (var i = 0; i < recolored.length; i++) {
      if (recolored[i].id === id) updated = recolored[i];
    }
    applyChange(recolored, {
      action: "recolorHighlight",
      attachmentUUID: cfg.attachmentUUID,
      pluginUUID: cfg.pluginUUID,
      id: id,
      color: colorId,
      exportBlock: updated ? exportBlockFor(updated) : null,
    });
  }

  function removeHighlightById(id) {
    closePopover(true);
    applyChange(
      state.highlights.filter(function (h) {
        return h.id !== id;
      }),
      // pluginUUID so the plugin side can find this highlight's sent block, if any, and
      // take it with the highlight - otherwise its deep link outlives what it points at.
      {
        action: "removeHighlight",
        attachmentUUID: cfg.attachmentUUID,
        pluginUUID: cfg.pluginUUID,
        id: id,
      }
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
   *
   * @param mode "editing" (the note editor), "exporting" (export all's color filter, and
   *   the remove-viewer confirm, which reuses its column layout), or "menu" (the toolbar
   *   overflow menu) switch the popover into a column layout with its own width; omit
   *   for the default single-row layout every other context uses.
   */
  function showPopover(children, clientX, clientY, mode) {
    els.popover.innerHTML = "";
    els.popover.classList.toggle("pdfa-editing", mode === "editing");
    els.popover.classList.toggle("pdfa-exporting", mode === "exporting");
    els.popover.classList.toggle("pdfa-menu", mode === "menu");
    for (var i = 0; i < children.length; i++) els.popover.appendChild(children[i]);

    // Must be visible before measuring - a display:none element has no size.
    els.popover.classList.add("pdfa-open");
    var width = els.popover.offsetWidth;
    var height = els.popover.offsetHeight;
    var left = Math.max(4, Math.min(clientX - width / 2, window.innerWidth - width - 4));
    var top = clientY + 12;
    // Flip above the cursor rather than off the bottom of a short embed.
    if (top + height > window.innerHeight - 4) top = Math.max(4, clientY - height - 12);
    // Flipping is not enough on its own: with a menu taller than the space above the
    // cursor, the flip lands at 4 and the bottom still runs off the embed - and an iframe
    // cannot spill into the host note, so those rows are simply unreachable rather than
    // merely untidy. Pull it back up so the whole box is inside, and let the CSS
    // max-height scroll whatever still cannot fit.
    top = Math.max(4, Math.min(top, window.innerHeight - height - 4));
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
    els.popover.classList.remove("pdfa-open", "pdfa-editing", "pdfa-exporting", "pdfa-menu");
    els.popover.innerHTML = "";
  }

  /**
   * Context 1: a fresh selection. Colors only - one click from selection to highlight.
   *
   * The TOOLBAR's four, not the catalog: this popover is the fast path, and it mirrors
   * the bar so the swatch under your finger is the one you already know. Reaching for a
   * color you highlight in twice a year belongs in the recolor popover below, which is
   * one extra click and no hunting.
   */
  function openSelectionPopover(selection) {
    var list = toolbarColors();
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

  /**
   * Contexts 2 and 3: an existing highlight, either just created or clicked.
   *
   * The WHOLE catalog here, deliberately unlike the toolbar and the selection popover.
   * This is a floating card that can wrap, so it can afford every color, and it is what
   * keeps the four-slot toolbar from making anything unreachable: the setting decides
   * what is one click away, never what is possible. It is also the only place a highlight
   * already wearing a non-toolbar color can show its own swatch as the pressed one.
   */
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
      }, "note")
    );
    // "Copy" and "Send to note" - spec section 4. Not offered on a highlight still
    // waiting on its first save (no id yet - see applyHighlight), same guard the click
    // hit-test already applies before this popover can even open for one.
    children.push(button("Copy", "", function () { copyHighlight(highlight); }, "copy"));
    children.push(button("Send to note", "", function () { sendHighlightToNote(highlight); }, "send"));
    children.push(
      button("Remove", "pdfa-remove", function () {
        removeHighlightById(highlight.id);
      }, "remove")
    );

    showPopover(children, clientX, clientY);
  }

  /**
   * Context 5: "export all"'s color filter. Independently-toggled swatches - the
   * booleans are which colors to INCLUDE, not a single active color - so this cannot
   * reuse the single-select handling every other popover context relies on.
   *
   * The colors ACTUALLY IN THIS DOCUMENT, which is neither of the other two lists. The
   * catalog would offer eleven toggles to filter a note that only ever used two, and the
   * toolbar's four would hide a color the document really contains - so a highlight made
   * before the setting changed could not be filtered for at all.
   */
  function openExportPopover(clientX, clientY) {
    var list = usedColors();
    var active = {};
    for (var i = 0; i < list.length; i++) active[list[i].id] = true;

    var hint = document.createElement("div");
    hint.className = "pdfa-export-hint";
    hint.textContent = "Export highlights to a note";

    var swatchRow = document.createElement("div");
    swatchRow.className = "pdfa-export-colors";
    for (var j = 0; j < list.length; j++) {
      (function (color) {
        var sw = makeSwatch(color, true, function (colorId) {
          active[colorId] = !active[colorId];
          sw.setAttribute("aria-pressed", String(active[colorId]));
        }, "Toggle");
        swatchRow.appendChild(sw);
      })(list[j]);
    }

    var actions = document.createElement("div");
    actions.className = "pdfa-note-actions";
    actions.appendChild(
      button("Create / update note", "pdfa-btn-primary", function () {
        var included = [];
        for (var k = 0; k < list.length; k++) {
          if (active[list[k].id]) included.push(list[k].id);
        }
        // All colors selected is the same as no filter at all - sending null rather
        // than a filter that happens to match everything is the clearer signal.
        exportAllHighlights(included.length === list.length ? null : included);
      })
    );

    showPopover([hint, swatchRow, actions], clientX, clientY, "exporting");
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

    showPopover([input, actions], clientX, clientY, "editing");
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

  function zoomText() {
    return Math.round(state.scale * 100) + "%";
  }

  function updateLabels() {
    els.pageLabel.textContent = state.current + " / " + state.pageCount;
    // Left alone while the reader is typing in it. The zoom label is an input now, and
    // this runs from renderAll and from every scroll that changes the current page - so
    // without the guard, half-typed digits would be overwritten mid-edit by a value the
    // reader is in the middle of replacing.
    if (document.activeElement !== els.zoomLabel) els.zoomLabel.value = zoomText();
  }

  function scroller() {
    return els.root.querySelector(".pdfa-scroll");
  }

  /**
   * Whichever region the scroll buttons should move: the highlights panel while it is
   * open, otherwise the pages.
   *
   * Reported live: with the panel open on a phone, any highlight below the fold was
   * simply unreachable - a real problem the moment a PDF has more than two of them. Same
   * cause as the pages themselves (the host note claims the vertical drag), so it wants
   * the same answer, and the two controls already on screen are the answer. Retargeting
   * them beats a second pair: the panel covers the full width on a narrow embed, so a
   * dedicated set would have to live inside it, and "these scroll what you are looking
   * at" is one idea to learn instead of two.
   */
  function activeScroller() {
    if (els.panel && els.panel.classList.contains("pdfa-open")) return els.panel;
    return scroller();
  }

  /**
   * Build one page immediately, by number.
   *
   * Jumping somewhere names its destination outright, so there is no reason to infer it
   * from scroll positions afterwards - and good reason not to: a smooth scroll has not
   * arrived yet when the caller returns, so measuring visibility then would render
   * whatever is still on screen instead of where the reader is going.
   */
  function renderPageNow(pageNum) {
    var wrap = els.pages.querySelector('.pdfa-page[data-page="' + pageNum + '"]');
    if (wrap) renderPageContent(wrap, pageNum);
  }

  function goToPage(pageNum) {
    var target = Math.min(Math.max(1, pageNum), state.pageCount);
    var wrap = els.pages.querySelector('.pdfa-page[data-page="' + target + '"]');
    renderPageNow(target);

    // Instant, and measured against the scroller's own rect - the same arithmetic
    // goToHighlight uses, and for both of its reasons. Nothing between a page and the
    // scroller is positioned, so offsetTop cannot be trusted; and this used to be
    // a smooth-behaviour scrollIntoView, which silently never advances when the embed
    // is not compositing. That is precisely the state a deep-linked embed is in - still
    // off-screen in the note - so a page link set the page number and then didn't move,
    // while a highlight link worked, because goToHighlight already assigned scrollTop
    // directly. Third time this project has been bitten by a paint-coupled API; the rule
    // by now is that anything on a critical path gets the instant form.
    var box = scroller();
    if (wrap && box) {
      box.scrollTop += wrap.getBoundingClientRect().top - box.getBoundingClientRect().top;
    }
    ensureVisiblePagesRendered();

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

    // The destination is named, so build it outright rather than waiting for a scroll
    // event - this is the deep-link path, where the page being jumped to is exactly the
    // one most likely never to have been rendered.
    renderPageNow(highlight.page);
    ensureVisiblePagesRendered();

    state.current = highlight.page;
    updateLabels();
  }

  // Returns renderAll's promise so a caller can act once the new scale is on screen -
  // the overflow menu's own zoom controls need it, because renderAll closes the popover
  // and they have to put it back.
  /**
   * Scroll the HOST NOTE down to this embed.
   *
   * Reported live: clicking an exported highlight's link lands on the right note but
   * leaves the reader wherever they were - typically at the bottom of the note, where the
   * exports are, with the PDF far above. Scroll to the embed by hand and it is already
   * sitting on the right highlight, which is the tell: the deep link arrives and works,
   * and the only missing step is moving the note itself.
   *
   * The embed cannot do that with script. It is a cross-origin iframe, so the parent
   * document is untouchable - no scrollIntoView, no access to its scroller. But FOCUS is
   * handled by the browser, not by script: focusing an element inside a frame makes every
   * ancestor document scroll that frame into view, across origins. Verified in the
   * harness with the embed 1500px down a tall page - focus moved the parent to it, and
   * focus({preventScroll:true}) left the parent at 0, which is what proves the scroll came
   * from here rather than from something else.
   *
   * Only ever called when this embed was opened BY a deep link, never on an ordinary
   * load: stealing focus and yanking the page around would be hostile on a note that
   * merely happens to contain a viewer, and worse on one containing several.
   */
  function revealSelfInHostNote() {
    try {
      // tabindex -1 makes a container programmatically focusable without putting it in
      // the tab order, so keyboard users' tab sequence is unchanged.
      els.root.setAttribute("tabindex", "-1");
      els.root.focus();
      // A SECOND, independent browser-level route to the same place. Confirmed live that
      // focus alone moves the note on the desktop web app but not in the Android app -
      // plausibly because the note there is not a scrollable DOM document at all, in
      // which case nothing from inside this iframe can move it. scrollIntoView is worth
      // the two lines anyway because it is a genuinely different mechanism rather than a
      // retry: the spec's "scroll an element into view" walks up through ancestor scroll
      // containers and continues out through the frame's owner element, and the element
      // asks for it rather than script reaching into the parent, so cross-origin does not
      // block it. Targets the root, which sits OUTSIDE .pdfa-scroll, so it can never
      // fight the in-document scroll to the linked page.
      if (els.root.scrollIntoView) els.root.scrollIntoView({ block: "nearest" });
    } catch {
      // A host that blocks both just means no auto-scroll - the deep link still landed
      // on the right note and the viewer is still on the right highlight.
    }
  }

  /**
   * Briefly outline the highlight a deep link pointed at.
   *
   * Scrolling to it is not enough to answer "which one?" - a page can hold several
   * highlights, sometimes adjacent and in the same color, and the reader arrived from a
   * link that promised one specific quote. Reported as "it doesn't highlight the actual
   * note" even in the cases where the scroll did work.
   */
  function flashHighlight(highlight) {
    if (!highlight || !highlight.id) return;
    var group = els.pages.querySelector('.pdfa-hl-group[data-id="' + highlight.id + '"]');
    if (!group) return;
    group.classList.add("pdfa-hl-flash");
    // Removed again so the highlight goes back to looking like every other one - this is
    // a pointer, not a permanent state, and a viewer left with one highlight
    // mysteriously outlined would be worse than no cue at all.
    setTimeout(function () {
      group.classList.remove("pdfa-hl-flash");
    }, 2600);
  }

  /** The zoom range every path has to respect - the buttons, the typed field, the fit. */
  function clampZoom(scale) {
    return Math.min(Math.max(0.4, scale), 4);
  }

  function setZoom(scale) {
    state.scale = clampZoom(scale);
    return renderAll();
  }

  /**
   * Commit whatever is currently typed in the zoom field.
   *
   * Tolerant about the shape: "100", "100%", " 100 % " and "87.5" all read as the same
   * percentage, because a field that shows "125%" invites you to type the "%" back.
   * Intolerant about junk - anything that is not a plain number snaps straight back to the
   * zoom actually on screen, since a viewer that goes blank over a typo is worse than one
   * that ignores it. parseFloat alone would not do: it reads "1o0" as 1 and would zoom to
   * 1% rather than reject it.
   *
   * Out-of-range values clamp instead of failing, and the field is then rewritten with
   * what actually took effect - so typing 900 answers itself with "400%".
   */
  function applyZoomInput() {
    var typed = String(els.zoomLabel.value).replace(/[\s%]/g, "");
    var percent = /^\d*\.?\d+$/.test(typed) ? parseFloat(typed) : NaN;
    if (percent > 0) {
      var scale = clampZoom(percent / 100);
      // Re-rasterizing every rendered page is the expensive half of a zoom change, and
      // this runs on blur whether or not anything was actually edited - so a value that
      // did not move must not pay for it.
      if (scale !== state.scale) setZoom(scale);
    }
    // Unconditional, and after the setZoom above: it both formats an accepted value and
    // restores a rejected one, and updateLabels cannot do it while the field still has
    // focus (see its own comment).
    els.zoomLabel.value = zoomText();
  }

  /**
   * Pick the starting zoom so a page fits the width of the box we were handed.
   *
   * Only ever zooms OUT from the 1.25 default, never in. On a desktop-width embed the
   * fitting scale is wider than 1.25, so the default survives untouched and nothing
   * about the existing experience moves. It earns its place on a phone: measured in the
   * Amplenote Android app at a 358px note width, a 612pt page at 1.25 renders 765px
   * wide inside a ~343px scroller - 45% of the page visible, every line needing a
   * horizontal pan. Manually zooming to 75% was still not enough to clear the text.
   *
   * Deliberately a one-shot at boot rather than a live fit-to-width mode: an embed
   * cannot be resized by its reader (its box comes from data-aspect-ratio in the note),
   * so the width this measures is the width it keeps.
   */
  function fitInitialZoom() {
    if (!state.doc) return Promise.resolve();
    return state.doc
      .getPage(1)
      .then(function (page) {
        var box = scroller();
        if (!box) return;
        var style = window.getComputedStyle(box);
        var available =
          box.clientWidth -
          (parseFloat(style.paddingLeft) || 0) -
          (parseFloat(style.paddingRight) || 0);
        var pageWidth = page.getViewport({ scale: 1 }).width;
        if (!(available > 0) || !(pageWidth > 0)) return;
        // Clamped by the same helper setZoom uses, so the fit can never land at a zoom
        // the zoom-out button itself could not have reached.
        var fit = clampZoom(available / pageWidth);
        if (fit < state.scale) {
          state.scale = fit;
          updateLabels();
        }
      })
      ["catch"](function () {
        // A fit is a nicety. Never let it stop the PDF from rendering at the default.
      });
  }

  /**
   * Move the page area by most of a screenful.
   *
   * The touch scroll controls. See the CSS for why they exist at all: the host note
   * claims the vertical drag gesture, so on a phone there was no way to scroll the pages
   * by dragging them. Programmatic scrolling was never affected - the toolbar's page
   * buttons kept working throughout - which is what makes a button the reliable answer.
   *
   * 85% rather than a full screenful so a line or two carries over and you can tell
   * where you were, the same overlap a Page Down gives you.
   *
   * Deliberately an INSTANT jump, not a smooth-behaviour scroll. Smooth scrolling runs off
   * the same requestAnimationFrame/compositor path that this project already has a
   * documented silent stall on (see docs/api-notes.md on PDF.js in a hidden tab) - and
   * measured here, a smooth scrollBy in a non-compositing context never advances at all,
   * while a direct assignment moves fine. That failure mode is survivable for an
   * animation; it is not survivable for the ONLY way to scroll the pages on a phone,
   * where it would present as a dead button. The 15% overlap is what makes the jump
   * readable without the animation.
   */
  function scrollByScreen(direction) {
    var box = activeScroller();
    if (!box) return;
    box.scrollTop += direction * Math.max(80, box.clientHeight * 0.85);
    // Re-synced HERE rather than left to the scroll listener. These buttons must never
    // depend on an event to know what they just did: a scroll event that does not
    // arrive would leave Up still greyed out at the bottom of a document, which on a
    // phone - where these are the only way to move - traps the reader with no way back.
    // (Measured in the harness: in a non-compositing context scrollTop changes while NO
    // scroll event fires at all, so this is not a hypothetical failure.)
    syncScrollNav();
    // Same reasoning applied to rendering: these buttons are the only way to scroll on a
    // phone, so a page reached by them cannot be left waiting on an event that may never
    // arrive - it would present as scrolling into permanent blankness.
    ensureVisiblePagesRendered();
  }

  /**
   * Grey out whichever control cannot go any further.
   *
   * With no gesture scrolling available on touch, these buttons are the only feedback
   * that there IS more page below - so at the end of the document a still-bright button
   * that does nothing reads as a broken control rather than as the end.
   */
  /**
   * Press and hold a scroll button to keep scrolling.
   *
   * The buttons are not a stopgap any more, they are how scrolling works on touch: the
   * host note owns the vertical drag inside the embed and will not give it up. CSS
   * (overscroll-behavior), a non-passive touchmove calling preventDefault, and focus were
   * all tried against it and none of them moved it, which places the arbitration above
   * the iframe and out of reach. See docs/api-notes.md.
   *
   * Given that, a tap per screenful is the whole reading experience, and twelve taps to
   * cross a page is the kind of thing that makes people give up on a tool. Holding
   * scrolls continuously at a quarter-screen per tick - slow enough to read while it
   * moves, unlike the full jump a tap gives.
   *
   * Pointer events rather than mouse or touch ones, so a finger, a mouse and a stylus all
   * take the same path. The click handler still fires afterwards, so it has to know a
   * hold already happened or every hold would end with an extra screenful.
   */
  function bindHoldToScroll(btn, direction) {
    var startTimer = null;
    var repeatTimer = null;
    var held = false;

    var stop = function () {
      if (startTimer) clearTimeout(startTimer);
      if (repeatTimer) clearInterval(repeatTimer);
      startTimer = repeatTimer = null;
    };

    btn.addEventListener("pointerdown", function () {
      stop();
      held = false;
      // Long enough that an ordinary tap never trips it, short enough that holding feels
      // like it responded rather than stalled.
      startTimer = setTimeout(function () {
        held = true;
        repeatTimer = setInterval(function () {
          // A button that has hit the end of the document stops, rather than spinning a
          // timer against a scrollTop that cannot move.
          if (btn.disabled) return stop();
          scrollByScreen(direction * 0.25);
        }, 120);
      }, 320);
    });

    ["pointerup", "pointercancel", "pointerleave"].forEach(function (type) {
      btn.addEventListener(type, stop);
    });

    btn.onclick = function () {
      if (held) {
        // The hold already did the scrolling; this is just the click that ends it.
        held = false;
        return;
      }
      scrollByScreen(direction);
    };
  }

  function syncScrollNav() {
    var box = activeScroller();
    if (!box || !els.scrollUp) return;
    var max = box.scrollHeight - box.clientHeight;
    els.scrollUp.disabled = box.scrollTop <= 1;
    els.scrollDown.disabled = box.scrollTop >= max - 1;
  }

  // Keep the page indicator honest as the user scrolls.
  function trackScroll() {
    syncScrollNav();
    // Pages are built as they come into range - this is what makes lazy rendering
    // actually deliver the rest of the document.
    ensureVisiblePagesRendered();
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
   * Load pdf-lib the same way loadPdfJs loads PDF.js - Amplenote re-executes inline
   * scripts immediately, so a plain <script src> would still be downloading when the
   * viewer runs. Loaded lazily, only when Download is first clicked: most sessions
   * never use it, and pdf-lib is a separate CDN request nothing else here needs.
   */
  function loadPdfLib() {
    return new Promise(function (resolve, reject) {
      if (window.PDFLib) return resolve(window.PDFLib);
      var tag = document.createElement("script");
      tag.src = cfg.pdfLibSrc;
      tag.onload = function () {
        if (window.PDFLib) resolve(window.PDFLib);
        else reject(new Error("pdf-lib loaded but did not register itself."));
      };
      tag.onerror = function () {
        reject(new Error("Could not load pdf-lib from the CDN."));
      };
      document.head.appendChild(tag);
    });
  }

  /** { [colorId]: [r,g,b] } from config, for annotations.writeHighlightsIntoPdf. */
  function colorRgbTable() {
    var table = {};
    var list = colorList();
    for (var i = 0; i < list.length; i++) {
      if (list[i].rgb) table[list[i].id] = list[i].rgb;
    }
    return table;
  }

  function downloadFilename() {
    var base = (state.attachmentName || "annotated").replace(/\.pdf$/i, "");
    return base + "-annotated.pdf";
  }

  /**
   * { [colorId]: { hex } } from config, for export.js's builders.
   *
   * The hex is the whole marker: an exported link wears it as a background. A cycle index
   * used to travel beside it, naming the color to Amplenote - that is what underlined the
   * link, so it is gone from here and from the config (see export.js's header).
   */
  function colorTable() {
    var table = {};
    var list = colorList();
    for (var i = 0; i < list.length; i++) {
      table[list[i].id] = { hex: list[i].hex };
    }
    return table;
  }

  /** The name of the "export all" destination note - deterministic, so re-running the
   * export finds the SAME note (see embed-call.js's exportAll action) instead of
   * creating a new one every time. */
  function destinationNoteName() {
    var base = (state.attachmentName || "PDF").replace(/\.pdf$/i, "");
    return base + " - Highlights";
  }

  function exportBlockFor(highlight) {
    var color = colorTable()[highlight.color] || {};
    return exportBuilder.buildHighlightBlock(
      state.attachmentName,
      cfg.pluginUUID,
      cfg.attachmentUUID,
      highlight,
      color.hex,
      cfg.noteUUID
    );
  }

  /** The same block as HTML - the clipboard's rich-text flavor. See copyToClipboard. */
  function exportHtmlFor(highlight) {
    if (!exportBuilder.buildHighlightHtml) return null;
    var color = colorTable()[highlight.color] || {};
    return exportBuilder.buildHighlightHtml(
      state.attachmentName,
      cfg.pluginUUID,
      cfg.attachmentUUID,
      highlight,
      color.hex,
      cfg.noteUUID
    );
  }

  /**
   * The selection + `copy`-event + execCommand route, which is what lets ONE copy carry
   * two flavors: the handler overrides both `text/plain` and `text/html` on the event's
   * own clipboardData. `navigator.clipboard.writeText` cannot do this at all (plain text
   * only), and it is the reason a copied highlight pasted into Amplenote as literal
   * the markdown's literal characters (the mark syntax, `> >`, and all) - see
   * buildHighlightHtml in src/export.js.
   *
   * execCommand is deprecated but not replaced here for a reason beyond the flavors:
   * cross-origin iframes (the embed's own situation, on plugins.amplenote.com) can have
   * clipboard writes permission-gated by the EMBEDDING page, and this route has
   * historically worked in more restrictive iframe contexts than the modern API. It also
   * needs a real selection to fire at all, hence the offscreen textarea.
   */
  function copyViaCopyEvent(text, html) {
    var onCopy = function (e) {
      var data = e.clipboardData || window.clipboardData;
      if (!data) return;
      data.setData("text/plain", text);
      if (html) data.setData("text/html", html);
      e.preventDefault();
    };
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.addEventListener("copy", onCopy, true);
    var ok = false;
    try {
      ok = document.execCommand("copy");
    } catch (err) {
      ok = false;
    }
    document.removeEventListener("copy", onCopy, true);
    document.body.removeChild(ta);
    return ok;
  }

  /**
   * Put the block on the clipboard in both flavors - markdown for anything that reads
   * plain text, HTML for a rich-text editor like Amplenote's, which does NOT parse
   * markdown out of pasted text (docs/api-notes.md finding #7).
   *
   * RESOLVES WITH THE NAME OF THE ROUTE THAT WON, so the caller can tell the user what
   * actually landed - "copied" and "copied WITH FORMATTING" are different promises to
   * make, and only one of these routes can keep the HTML. It also means a bug report says
   * which route ran instead of only that the button did nothing.
   *
   * Ordering, the hard-won part. Every route needs the browser to still consider itself
   * inside the click that triggered it, and each can spoil the next:
   *
   *   - `clipboard.write` is the only one that carries both flavors without touching the
   *     DOM, so it goes first. Awaiting its rejection ends the user gesture, which is why
   *     nothing gated on activation can follow it.
   *   - `writeText` follows, because it needs permission rather than activation and is
   *     the route this embed is known to have working. Markdown only - a paste that shows
   *     literal text beats an empty clipboard.
   *   - `execCommand` is LAST despite also carrying both flavors: it needs a real
   *     selection, so it focuses and removes an offscreen textarea, and that can leave
   *     the document unfocused - which makes `clipboard.write` reject with "document is
   *     not focused" if it runs afterwards. Worse, in a sandboxed iframe it can return
   *     true having copied nothing, so trusting it first can report success over an empty
   *     clipboard. It is the fallback for a browser that has dropped the modern API, not
   *     a first choice.
   */
  function copyToClipboard(text, html) {
    var viaWriteText = function () {
      if (!navigator.clipboard || !navigator.clipboard.writeText) return viaExecCommand();
      return navigator.clipboard.writeText(text).then(
        function () { return "plain"; },
        viaExecCommand
      );
    };
    var viaExecCommand = function () {
      return copyViaCopyEvent(text, html)
        ? Promise.resolve(html ? "rich" : "plain")
        : Promise.reject(new Error("every clipboard route was refused"));
    };

    if (html && navigator.clipboard && navigator.clipboard.write && typeof ClipboardItem === "function") {
      try {
        var item = new ClipboardItem({
          "text/plain": new Blob([text], { type: "text/plain" }),
          "text/html": new Blob([html], { type: "text/html" }),
        });
        return navigator.clipboard.write([item]).then(function () { return "rich"; }, viaWriteText);
      } catch (err) {
        return viaWriteText();
      }
    }
    return viaWriteText();
  }

  /**
   * "Copy" - spec section 4: copy a highlight, paste it into any note.
   *
   * The whole body is wrapped, not just the promise: building the two flavors happens
   * BEFORE copyToClipboard returns anything, so a throw in there escapes past a `.catch`
   * attached to the result and disappears - the button does nothing, silently, with no
   * message to report. That is indistinguishable from a refused clipboard write to
   * anyone looking at the UI, and cost a diagnosis round.
   *
   * The message names what actually landed, because "copied" and "copied with its
   * formatting" are different promises and only some routes keep the HTML (see
   * copyToClipboard). Telling someone it is ready to paste, when what is on the clipboard
   * will paste as the markdown's literal characters, is the same mistake the plain-
   * text-only version made.
   */
  function copyHighlight(highlight) {
    closePopover(true);
    var text;
    var html;
    try {
      text = exportBlockFor(highlight);
      html = exportHtmlFor(highlight);
    } catch (err) {
      status("Could not build the copy: " + (err.message || err), true);
      return;
    }
    copyToClipboard(text, html)
      .then(function (route) {
        status(
          route === "rich"
            ? "Highlight copied - paste it into any note."
            : "Highlight copied as plain text - this browser would not allow a formatted copy."
        );
      })
      .catch(function (err) {
        status("Could not copy: " + (err.message || err), true);
      });
  }

  /**
   * "Send to note" - spec section 4.
   *
   * It no longer appends to the very bottom: the plugin places it above the managed data
   * section, which stays last (see embed-call.js's sendToNote for why appending to the
   * end destroyed exports). The message below has to match, or it tells the user to look
   * somewhere the block is not.
   */
  function sendHighlightToNote(highlight) {
    closePopover(true);
    callPlugin({
      action: "sendToNote",
      content: exportBlockFor(highlight),
      // The ids that let the plugin side find an existing block for THIS highlight and
      // refresh it in place, instead of appending a second copy of the same quote.
      highlightId: highlight.id,
      attachmentUUID: cfg.attachmentUUID,
      pluginUUID: cfg.pluginUUID,
    })
      .then(function (result) {
        if (!result || result.error) {
          throw new Error((result && result.error) || "Could not send this to the note.");
        }
        renderPanel();
        status(
          result.replaced
            ? "Updated this highlight where it already sits in the note."
            : "Added to this note, below the text."
        );
      })
      .catch(function (err) {
        status(err.message || String(err), true);
      });
  }

  /**
   * "Export all" - spec section 4: auto-create (or update) a destination note holding
   * every highlight, filtered by color. The filter is applied HERE, client-side, before
   * anything is sent to the plugin - embed-call.js's exportAll action just writes
   * whatever content it is given, so there is exactly one place color-filtering logic
   * lives, not two copies that could drift apart.
   */
  function exportAllHighlights(colorFilter) {
    closePopover(true);
    var content = exportBuilder.buildExportAllContent(
      state.attachmentName,
      cfg.pluginUUID,
      cfg.attachmentUUID,
      state.highlights,
      colorTable(),
      colorFilter,
      cfg.noteUUID
    );
    if (!content) {
      status(colorFilter ? "No highlights match those colors." : "No highlights to export yet.", true);
      return;
    }
    callPlugin({ action: "exportAll", noteName: destinationNoteName(), content: content })
      .then(function (result) {
        if (!result || result.error) {
          throw new Error((result && result.error) || "Could not export highlights.");
        }
        status('Exported to "' + destinationNoteName() + '".');
      })
      .catch(function (err) {
        status(err.message || String(err), true);
      });
  }

  /**
   * The toolbar's overflow menu: Download, Export and Remove, none of which the spec
   * requires to be a permanent top-level button (only the four colors are - see the
   * toolbar comment in html.js). Each item hands off to the SAME function a dedicated
   * button used to call directly; this menu is purely a different entry point, not a
   * different implementation.
   */
  function openMoreMenu(clientX, clientY) {
    // No filename heading. It lived here after being dropped from its own toolbar row for
    // duplicating Amplenote's attachment chip - but the chip sits immediately above the
    // embed, so the menu copy was the same duplication, and truncated to an ellipsis by
    // the menu's width on top of that. The collapsed bar keeps its copy, which is the one
    // state with no chip in view.
    var children = [];

    children.push(
      button("Collapse", "", function () {
        closePopover(true);
        collapseViewer();
      }, "collapse"),
      button("Download", "", function () {
        closePopover(true);
        downloadAnnotatedPdf();
      }, "download"),
      button("Export...", "", function () {
        openExportPopover(clientX, clientY);
      }, "postAdd"),
      button("Remove viewer...", "pdfa-remove", function () {
        openRemoveViewerPopover(clientX, clientY);
      }, "remove")
    );
    showPopover(children, clientX, clientY, "menu");
  }

  /**
   * Confirms detaching this viewer via the SAME in-page popover every other destructive
   * or editing action here uses (recolor, note editor, export filter), rather than a
   * native confirm().
   *
   * confirm()/alert()/prompt() are unreliable inside Amplenote's own cross-origin embed
   * iframe - live testing showed clicking Remove did nothing at all, no dialog and no
   * error, because the call was silently suppressed rather than throwing. Same class of
   * restriction already worked around once in this file for the Clipboard API (see
   * copyToClipboard's execCommand fallback) - the fix here is the same idea: don't rely
   * on a browser-native modal from inside this iframe at all. A plain DOM popover has no
   * such dependency.
   */
  function openRemoveViewerPopover(clientX, clientY) {
    var hint = document.createElement("div");
    hint.className = "pdfa-export-hint";
    hint.textContent =
      "Remove this viewer and all its highlights from this note? This cannot be undone.";

    var actions = document.createElement("div");
    actions.className = "pdfa-note-actions";
    actions.appendChild(button("Cancel", "", function () { closePopover(true); }));
    var spacer = document.createElement("span");
    spacer.className = "pdfa-spacer";
    actions.appendChild(spacer);
    actions.appendChild(button("Remove", "pdfa-remove", removeThisViewer));

    showPopover([hint, actions], clientX, clientY, "exporting");
  }

  /**
   * Detach this viewer entirely: delete its own <object> line from the note and its
   * highlights entry from the managed section (embed-call.js's removeViewer action).
   * Only ever called from the confirm popover above - never directly from the toolbar
   * button - so reaching here already means the user confirmed.
   */
  function removeThisViewer() {
    // Closes (and discards) the confirm popover BEFORE the async work starts, so
    // there's no button left to double-click, disable, or re-enable on failure.
    closePopover(true);
    status("Removing this viewer...");
    callPlugin({ action: "removeViewer", attachmentUUID: cfg.attachmentUUID, pluginUUID: cfg.pluginUUID })
      .then(function (result) {
        if (!result || result.error) {
          throw new Error((result && result.error) || "Could not remove this viewer.");
        }
        // The note just lost this embed's own <object> tag - Amplenote will tear this
        // iframe down once it notices. Nothing left to render here in the meantime.
        document.body.innerHTML =
          '<div style="padding:16px;font:13px sans-serif;opacity:.75">' +
          "Removed - this block will disappear once the note refreshes." +
          "</div>";
      })
      .catch(function (err) {
        status(err.message || String(err), true);
      });
  }

  /**
   * Write every highlight into the SOURCE bytes as native annotations (see
   * annotations.js - the pdf-lib spike turned into production code) and hand the
   * result to the browser's own download flow via a throwaway <a download> link.
   *
   * Upload-back via attachNoteMedia is not attempted: verified dead in the live app
   * (it rejects PDFs outright - see docs/api-notes.md). Download is the whole feature
   * the spec asks for here, not a fallback for a blocked upload.
   */
  function downloadAnnotatedPdf() {
    if (!state.pdfBytes) return;
    // Feedback goes through the shared status bar, not a button label - Download is a
    // transient item inside the overflow menu now (see openMoreMenu), gone from the DOM
    // the instant it's clicked, same as every other menu action's in-progress state.
    status("Preparing the download...");

    loadPdfLib()
      .then(function (PDFLib) {
        return annotations.writeHighlightsIntoPdf(
          PDFLib,
          state.pdfBytes,
          state.highlights,
          colorRgbTable()
        );
      })
      .then(function (bytes) {
        return deliverPdf(bytes, downloadFilename());
      })
      .catch(function (err) {
        status("Could not prepare the download: " + (err.message || err), true);
      });
  }

  /**
   * Hand the finished PDF to the user, by whichever route this device actually has.
   *
   * Confirmed live: the anchor below downloads correctly on desktop and does NOTHING in
   * the Amplenote mobile app - no file, no error, no dialog. A `download` attribute needs
   * the host application to handle it, and an app embedding a webview generally does not,
   * least of all for a cross-origin iframe inside it.
   *
   * The share sheet is how a phone saves a file anyway, so it is tried first where it
   * exists. It can still be refused - Web Share has to be delegated to an iframe by the
   * host, and this one may not be - which is why every path falls through to the anchor
   * rather than depending on it.
   */
  function deliverPdf(bytes, filename) {
    var blob = new Blob([bytes], { type: "application/pdf" });
    var file = null;
    try {
      file = new File([blob], filename, { type: "application/pdf" });
    } catch {
      // No File constructor - fall through to the anchor, which only needs a Blob.
    }

    if (file && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator
        .share({ files: [file], title: filename })
        .then(function () {
          status("");
        })
        ["catch"](function (err) {
          // Dismissing the sheet is a decision, not a failure - do not then shove a
          // download at someone who just cancelled one.
          if (err && err.name === "AbortError") return status("");
          return anchorDownload(blob, filename);
        });
    }
    return anchorDownload(blob, filename);
  }

  function anchorDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    // Not revoked immediately - some browsers start the download asynchronously, and an
    // immediate revoke can race that start.
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);

    // Nothing here can detect whether that click did anything: it neither throws nor
    // reports. On a device where it is known to do nothing, silence is the worst possible
    // answer - the annotated PDF was built, it just has nowhere to go - so say where it
    // CAN be saved instead of leaving someone waiting for a file that is never coming.
    //
    // Deliberately CONDITIONAL, and that wording is the whole point. The only thing known
    // here is "this is a touch device", which is not the same as "the download failed":
    // the mobile app swallows it, but Amplenote in a tablet browser saves the file
    // normally. Stating the block outright would simply be false for that second reader,
    // and telling someone their download failed while it sits in their downloads folder
    // is worse than saying nothing. Phrased as a conditional it is true in both cases and
    // only speaks up for the person it is actually about.
    var touch = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    status(
      touch
        ? "If no file appeared, this app can't save files - open the note on a computer to download it."
        : ""
    );
    return Promise.resolve();
  }

  /**
   * Stored highlights are not worth failing the whole viewer over - a PDF that renders
   * without its highlights is still usable, and the error says which half broke.
   */
  function loadHighlights() {
    return callPlugin({
      action: "loadHighlights",
      attachmentUUID: cfg.attachmentUUID,
      // Also asks which highlights the note already holds a block for, so the panel can
      // show "remove from note" only where there is something to remove.
      pluginUUID: cfg.pluginUUID,
    })
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

  /**
   * Manually collapse down to the title bar - the toolbar's "Collapse" menu item. The
   * PDF stays fully loaded in memory (state.doc, state.highlights, every rendered page);
   * this only hides the DOM, so re-expanding is instant with no re-fetch. The count comes
   * straight from state - already loaded, no reason to ask the plugin again for it.
   */
  function collapseViewer() {
    var n = state.highlights.length;
    els.collapsedCount.textContent = n ? n + (n === 1 ? " highlight" : " highlights") : "";
    els.root.classList.add("pdfa-collapsed-mode");
    setCollapsedInNote(true);
  }

  /**
   * Ask the plugin to shrink (or restore) the embed's box in the note markup.
   *
   * Hiding the DOM is only half of collapsing: the iframe's height comes from the tag's
   * data-aspect-ratio and an embed cannot resize itself ("Embeds are fully isolated from
   * the hosting application, so they can't be sized dynamically based on the content of
   * the embed" - Amplenote's own docs). Without this, collapsing left the title bar
   * floating above a tall blank rectangle, which is what was reported.
   *
   * Fire-and-forget: the class is already applied, so the visible state is correct even if
   * the note write fails. Rewriting the tag also re-renders the embed, which is why the
   * collapsed flag lives in the tag's args - see buildEmbedHtml.
   */
  function setCollapsedInNote(collapsed) {
    callPlugin({
      action: "setCollapsed",
      collapsed: collapsed,
      attachmentUUID: cfg.attachmentUUID,
      pluginUUID: cfg.pluginUUID,
    })["catch"](function () {
      // A failed resize is cosmetic - never surface it over the user's actual click.
    });
  }

  /**
   * Strip `page`/`hl` from this embed's own tag, once they have been acted on.
   *
   * Fire-and-forget for the same reason as setCollapsedInNote: the scroll and the flash
   * have already happened, so the reader has what the link promised whether or not the
   * note write lands. A failure just means the stale-args bug recurs on the next open,
   * which is not worth an error message over.
   *
   * Rewriting the tag does NOT re-mount a mounted embed (confirmed live, and the whole
   * reason src/actions/link-target.js needs its remountEmbed dance) - so this cannot
   * bounce the viewer the reader is currently looking at, and cannot loop: the next boot
   * has no args left to clear.
   */
  function clearDeepLinkArgs() {
    callPlugin({
      action: "clearDeepLink",
      attachmentUUID: cfg.attachmentUUID,
      pluginUUID: cfg.pluginUUID,
    })["catch"](function () {
      /* see above - a stale tag is a worse next-open, not a failure of this one */
    });
  }

  /**
   * Leaves collapsed mode - the "Expand" button. Only calls boot() the FIRST time
   * (state.doc is set once PDF.js finishes loading the document inside boot()) - every
   * later expand, after a manual collapse, just reveals what's already rendered rather
   * than re-fetching and re-parsing the PDF from scratch.
   */
  function openViewer() {
    els.root.classList.remove("pdfa-collapsed-mode");
    if (!state.doc) boot();
    setCollapsedInNote(false);
  }

  function boot() {
    status("Loading PDF...");

    // FIRST, before a single await. This used to sit at the end of the chain below, after
    // renderAll, and it never fired in the live app for the case it exists to serve.
    //
    // The reason is already written down in docs/api-notes.md: PDF.js drives its render
    // task off requestAnimationFrame, which browsers pause in a hidden or non-compositing
    // context. An embed sitting off-screen in a long note IS that context - and being
    // off-screen is precisely the situation where the reader needs to be scrolled to it.
    // So the render stalled and everything sequenced after it, this call included, never
    // ran. It is the same trap the harness already shims around; it just resurfaced with
    // a different symptom, as a feature that silently did nothing.
    //
    // Scrolling the host note needs no PDF, no highlights and no layout - only the DOM
    // element, which exists the moment this script runs. Nothing about it belongs behind
    // the render.
    if (cfg.highlightId || cfg.page) {
      revealSelfInHostNote();
      // Spend the deep link. `page`/`hl` are a ONE-SHOT instruction from linkTarget,
      // which writes them into this embed's tag before navigating because there is no
      // other way to hand arguments to an embed on a note being opened (see
      // src/actions/link-target.js). Nothing removed them, so the instruction became
      // permanent document state and every LATER open of that note replayed it: the tag
      // still said "go to highlight X", so this very branch focused the embed - dragging
      // the host note's scroll down to it - and the viewer jumped to a highlight nobody
      // asked for. Reported as "opening any note with an expanded PDF scrolls to it and
      // lands somewhere random".
      //
      // Cleared HERE rather than after the render, for the same reason the reveal moved
      // up: renderAll can stall indefinitely (see the note above), and a clear sequenced
      // behind it would silently never run in exactly the off-screen case where the
      // stale-args replay is most annoying. Safe this early because cfg was parsed from
      // the tag at load, so rewriting the tag cannot affect what THIS load does next.
      clearDeepLinkArgs();
    }

    loadPdfJs()
      .then(function (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = cfg.workerSrc;
        return callPlugin({ action: "getPdfUrl", attachmentUUID: cfg.attachmentUUID });
      })
      .then(function (result) {
        if (!result || !result.url) {
          throw new Error((result && result.error) || "Could not resolve the PDF URL");
        }
        setAttachmentName(result.name);
        return fetch(result.url);
      })
      .then(function (response) {
        if (!response.ok) throw new Error("Download failed (HTTP " + response.status + ")");
        return response.arrayBuffer();
      })
      .then(function (bytes) {
        // Two independent copies from here on - see the state.pdfBytes comment above.
        state.pdfBytes = bytes.slice(0);
        return window.pdfjsLib.getDocument({ data: bytes }).promise;
      })
      .then(function (doc) {
        state.doc = doc;
        state.pageCount = doc.numPages;
        // Before rendering, so the first page paints with its highlights already on it.
        return loadHighlights();
      })
      .then(function () {
        // Before renderAll, so a narrow embed paints once at the fitting scale instead
        // of rendering every page at 125% and immediately re-rendering them all.
        return fitInitialZoom();
      })
      .then(function () {
        return renderAll();
      })
      .then(function () {
        syncHighlights();
        // Deep-link target from the embed args (spec section 7.3). A highlight id is
        // more precise than a page, so it wins when both are present.
        var target = cfg.highlightId ? findHighlight(cfg.highlightId) : null;
        if (target) {
          goToHighlight(target);
          flashHighlight(target);
        } else if (cfg.page) {
          goToPage(cfg.page);
        }
        // No revealSelfInHostNote() here - it now runs at the top of boot(). Putting it
        // back would also re-steal focus seconds later, dragging a reader who had
        // deliberately scrolled away back to this embed.
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

    // ---- typed zoom ----------------------------------------------------------
    // The field is three characters wide, so anything short of select-all is fiddly: a
    // click lands the caret between two digits and leaves the reader deleting a "%" by
    // hand before they can type. Focus therefore strips the unit and selects the number,
    // making the first keystroke a replacement.
    els.zoomLabel.addEventListener("focus", function () {
      els.zoomLabel.value = String(Math.round(state.scale * 100));
      // Deferred a tick: a selection made during the focus event is collapsed again by
      // the mouseup of the very click that caused the focus.
      setTimeout(function () {
        if (document.activeElement === els.zoomLabel) els.zoomLabel.select();
      }, 0);
    });
    // Blur commits rather than reverts: clicking away from a field you just typed into
    // means "yes", everywhere else in this app. Escape is the way to back out.
    els.zoomLabel.addEventListener("blur", applyZoomInput);
    els.zoomLabel.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        // preventDefault so a host form (or the note's own editor) never sees a submit.
        event.preventDefault();
        applyZoomInput();
        // Handing focus back also gets the field out of its editing look, and lets the
        // arrow keys go back to scrolling the pages.
        els.zoomLabel.blur();
      } else if (event.key === "Escape") {
        event.preventDefault();
        // Abandon the edit outright - same meaning Escape has in the note editor and the
        // popovers. The blur that follows re-commits this restored value, by then a no-op.
        els.zoomLabel.value = zoomText();
        els.zoomLabel.blur();
      }
    });
    bindHoldToScroll(els.scrollUp, -1);
    bindHoldToScroll(els.scrollDown, 1);
    els.listToggle.onclick = function () { togglePanel(); };
    els.more.onclick = function (event) {
      openMoreMenu(event.clientX, event.clientY);
    };
    scroller().addEventListener("scroll", trackScroll);
    // The panel scrolls independently - with a wheel on desktop, or by the buttons on
    // touch - so its own position has to keep them in sync too.
    els.panel.addEventListener("scroll", syncScrollNav);

    // Scoped to the page area on purpose. On `document` it would also fire when the user
    // releases the mouse on a toolbar button - and by then the browser has collapsed the
    // selection, so the pending capture would be thrown away just before it is used.
    els.pages.addEventListener("mouseup", captureSelection);
    els.pages.addEventListener("click", onPagesClick);
    // The touch path - see captureSettledSelection for why it cannot simply replace the
    // mouseup above, and why it is safe on document when mouseup deliberately is not.
    // selectionchange only exists on document; it has no element-scoped form.
    document.addEventListener("selectionchange", onSelectionChanged);
    // touchend is an accelerator, not the guarantee: when it does fire, the colors
    // appear on finger-lift instead of 300ms after it. It has to capture IMMEDIATELY
    // rather than go through onSelectionChanged, which would merely restart the settle
    // timer and make the wait longer than doing nothing at all. Whether a long-press
    // selection emits a touchend is not something this can assume - the settle timer
    // stays the guarantee - and the shared identity check means whichever of the two
    // arrives first wins while the other becomes a no-op.
    els.pages.addEventListener("touchend", function () {
      if (selectionSettleTimer) clearTimeout(selectionSettleTimer);
      selectionSettleTimer = null;
      captureSettledSelection();
    });
    document.addEventListener("keydown", function (event) {
      // The editor handles its own Escape, so this only reaches the other contexts.
      if (event.key === "Escape" && !state.noteEditing) closePopover();
    });
    // Click-outside-closes for anywhere that ISN'T the page area (the toolbar, blank
    // space, etc.) - onPagesClick above already covers clicks inside the pages.
    //
    // mousedown, not click: a click that OPENS a popover (e.g. clicking the More button,
    // or a highlight) is still a click outside the popover at the moment it fires, since
    // the popover doesn't exist yet - a same-event "click" listener here would immediately
    // close what that click just opened. mousedown always fires before the click that
    // opens something, so by the time this runs the popover still reflects its PREVIOUS
    // state - closing it here, then letting the upcoming click open a fresh one, same
    // gesture a user already expects from any other dropdown/menu.
    document.addEventListener("mousedown", function (event) {
      if (!els.popover.classList.contains("pdfa-open")) return;
      if (els.popover.contains(event.target)) return;
      // Unforced - an incidental outside click must not discard a half-typed note, same
      // protection scroll and Escape already have (see closePopover's own doc comment).
      closePopover();
    });

    mountColorButtons();
    renderPanel();
    // Bound to the whole bar, not just its Expand button - a click on the button bubbles
    // up to here, so one handler serves both (and keyboard Enter on the focused button
    // still works, since that dispatches a click too). The bar is the target because its
    // height is dictated by data-aspect-ratio as a fraction of the note width, which on a
    // phone leaves ~22px - too short to hold a comfortable touch target, so the full-bleed
    // width has to be the target instead. It only exists in collapsed mode, so this can
    // never swallow a click meant for the expanded viewer.
    els.root.querySelector(".pdfa-collapsed").onclick = openViewer;

    // Boots immediately UNLESS the user left this viewer collapsed. Defaulting every
    // embed to collapsed, so annotating always began with an "Open" click, was tried and
    // explicitly rejected live - but a collapse the user chose is theirs to keep, and
    // fetching and rendering a PDF nobody can see would be wasted work on every note
    // load. openViewer boots on the first expand.
    if (cfg.collapsed) {
      // Nothing has loaded, so the collapsed bar has no name or count to show yet. Ask
      // for just those two - not the PDF - or the bar reads "PDF Annotator" with a blank
      // filename, which is useless on a note holding several viewers.
      callPlugin({
        action: "getViewerSummary",
        attachmentUUID: cfg.attachmentUUID,
      })
        .then(function (result) {
          if (!result || result.error) return;
          setAttachmentName(result.name);
          var n = result.count || 0;
          els.collapsedCount.textContent = n ? n + (n === 1 ? " highlight" : " highlights") : "";
        })
        ["catch"](function () {
          // Cosmetic only - the Expand button still works with an unlabelled bar.
        });
    } else {
      boot();
    }
  } catch (err) {
    status("Viewer failed to start: " + (err && err.message ? err.message : err), true);
  }
}
