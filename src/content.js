// ============================================================
// Trim v0.75c - Content Script
// Screenshot markup + Lean Information classification cockpit.
// One shadow root isolates the entire UI from the host page.
// ============================================================

(function () {
  'use strict';

  var TRIM_BUILD = '0.75c-20261007-feedback-help';
  if (window.__TRIM_V07_BUILD__ === TRIM_BUILD) return;
  window.__TRIM_V07_BUILD__ = TRIM_BUILD;
  window.__TRIM_V07__ = true;

  var lang = trimLangFrom(navigator.language);
  function t(k) { return (TRIM_I18N[lang] && TRIM_I18N[lang][k]) || k; }

  var S = {
    dataUrl: null, img: null, w: 0, h: 0,
    marks: [], sel: null, seq: 0,
    page: { url: '', title: '' }, open: false,
    sessionStartedAt: 0
  };

  var host = null, root = null, ui = null, trigger = null, overlay = null, el = {};

  function ensureHost() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'trim-v07-host';
    host.style.cssText =
      'position:fixed;inset:0;z-index:2147483647;pointer-events:none;' +
      'margin:0;padding:0;border:0;background:transparent;';
    root = host.attachShadow({ mode: 'open' });

    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('src/content.css');
    root.appendChild(link);

    ui = document.createElement('div');
    ui.className = 'trim-ui';
    root.appendChild(ui);

    (document.body || document.documentElement).appendChild(host);
  }

  function showTrigger(x, y) {
    ensureHost();
    hideTrigger();
    trigger = document.createElement('button');
    trigger.className = 'trigger';
    trigger.innerHTML = '<span class="flag">&#9873;</span>' + t('trigger');
    trigger.style.left = Math.max(6, Math.min(window.innerWidth - 110, x)) + 'px';
    trigger.style.top = Math.max(6, Math.min(window.innerHeight - 46, y)) + 'px';
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var r = currentSelectionRect();
      hideTrigger();
      clearSelection();
      requestCapture(r);
    });
    ui.appendChild(trigger);
  }

  function hideTrigger() {
    if (trigger && trigger.parentNode) trigger.parentNode.removeChild(trigger);
    trigger = null;
  }

  function clearSelection() {
    var s = window.getSelection();
    if (s && s.removeAllRanges) s.removeAllRanges();
  }

  function currentSelectionRect() {
    var s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) return null;
    var r = s.getRangeAt(0).getBoundingClientRect();
    if (!r || !r.width || !r.height) return null;
    return {
      x: r.left / window.innerWidth,
      y: r.top / window.innerHeight,
      w: r.width / window.innerWidth,
      h: r.height / window.innerHeight,
      text: String(s).slice(0, 400)
    };
  }

  document.addEventListener('mouseup', function (e) {
    if (S.open) return;
    if (host && e.composedPath && e.composedPath().indexOf(host) !== -1) return;
    setTimeout(function () {
      var s = window.getSelection();
      if (!s || s.isCollapsed || !String(s).trim()) { hideTrigger(); return; }
      showTrigger(e.clientX + 8, e.clientY + 14);
    }, 10);
  }, true);

  document.addEventListener('mousedown', function (e) {
    if (S.open) return;
    if (trigger && e.composedPath && e.composedPath().indexOf(trigger) !== -1) return;
    hideTrigger();
  }, true);

  // In-page fallback for Alt+Shift+T. Chrome normally routes the shortcut via
  // chrome.commands, but a suggested command can be left unassigned when it
  // conflicts with another extension. If the keystroke reaches the page, this
  // fallback still starts TRIM.
  var lastShortcutAt = 0;
  document.addEventListener('keydown', function (e) {
    var key = String(e.key || '').toLowerCase();
    if (!e.altKey || !e.shiftKey || e.ctrlKey || e.metaKey || key !== 't') return;
    var now = Date.now();
    if (now - lastShortcutAt < 800) return;
    lastShortcutAt = now;
    e.preventDefault();
    e.stopPropagation();
    if (!S.open) requestCapture(null);
  }, true);

  function requestCapture(preRect) {
    ensureHost();
    hideTrigger();
    var wasOpen = S.open;
    if (wasOpen && overlay) overlay.classList.add('hidden');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        chrome.runtime.sendMessage({ type: 'TRIM_REQUEST_CAPTURE' }, function (res) {
          if (wasOpen && overlay) overlay.classList.remove('hidden');
          if (!res || !res.ok) {
            if (wasOpen) flash(t('cannotCapture'), 'warn');
            return;
          }
          openCockpit(res.dataUrl, { url: location.href, title: document.title }, preRect);
        });
      });
    });
  }

  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type === 'TRIM_PING') {
      sendResponse({ ok: true, version: '0.75c' });
      return true;
    }
    if (msg.type === 'TRIM_PREPARE') {
      hideTrigger();
      if (overlay) overlay.classList.add('hidden');
      sendResponse({ ok: true });
      return true;
    }
    if (msg.type === 'TRIM_OPEN') {
      openCockpit(msg.dataUrl, msg.page, null);
      sendResponse({ ok: true });
      return true;
    }
    return false;
  });

  function openCockpit(dataUrl, page, preRect) {
    ensureHost();
    if (!overlay) buildOverlay();
    S.dataUrl = dataUrl;
    S.page = page || { url: location.href, title: document.title };
    S.marks = [];
    S.sel = null;
    S.seq = 0;
    S.sessionStartedAt = Date.now();
    S.open = true;

    host.style.pointerEvents = 'auto';
    overlay.classList.remove('hidden');
    el.help.classList.add('hidden');
    hideMsg();

    var im = new Image();
    im.onload = function () {
      S.img = im;
      S.w = im.naturalWidth;
      S.h = im.naturalHeight;
      el.shot.src = dataUrl;
      el.dim.textContent = S.w + ' × ' + S.h;
      fitStage();

      if (preRect) {
        S.seq++;
        S.marks.push(makeMark(S.seq, preRect.x, preRect.y, preRect.w, preRect.h, preRect.text || ''));
        S.sel = S.seq;
      }
      applyLang();
      renderAll();
    };
    im.src = dataUrl;
  }

  function closeCockpit(force) {
    if (!force && S.marks.length && !window.confirm(t('discard'))) return;
    S.open = false;
    if (overlay) overlay.classList.add('hidden');
    if (host) host.style.pointerEvents = 'none';
  }

  function fitStage() {
    if (!el.scroller || !S.w) return;
    var avail = el.scroller.clientWidth - 20;
    var wpx = Math.min(avail, S.w);
    el.wrap.style.width = Math.max(240, wpx) + 'px';
  }

  window.addEventListener('resize', function () {
    if (S.open && S.img) fitStage();
  });

  function buildOverlay() {
    overlay = document.createElement('div');
    overlay.className = 'backdrop hidden';
    overlay.innerHTML =
      '<div class="shell">' +
        '<div class="bar">' +
          '<div class="brand"><b>Trim</b><span data-k="brandSub"></span></div>' +
          '<span class="tagline" data-k="canSaveTime"></span>' +
          '<button class="link-btn" data-act="help" data-k="vocabHelp"></button>' +
          '<div class="bar-tools">' +
            '<span class="kbd-hint" data-el="hint"></span>' +
            '<button class="btn" data-act="recapture" data-k="capture"></button>' +
            '<div class="lang"><button data-lang="de">DE</button><button data-lang="en">EN</button></div>' +
            '<button class="btn btn-primary" data-act="close" data-k="close"></button>' +
          '</div>' +
        '</div>' +
        '<div class="source-bar"><span data-el="src"></span><span class="pill" data-el="dim"></span></div>' +

        '<div class="top-grid">' +
          '<section class="card classify-card">' +
            '<div class="section-title" data-el="oppTitle"></div>' +
            '<div class="section-hint" data-k="opportunityHint"></div>' +
            '<div class="table-head"><span data-k="wasteLean"></span><span data-k="improvSug"></span></div>' +
            '<div data-el="pairs"></div>' +
            '<div class="improve-line"><b data-el="improveTitle"></b><span data-k="improvementHint"></span></div>' +
          '</section>' +

          '<section class="card priority-card">' +
            '<div class="section-title" data-el="priorityTitle"></div>' +
            '<div class="section-hint" data-k="prioHint"></div>' +
            '<div class="priority-wrap" data-el="priority"></div>' +
          '</section>' +

          '<section class="card comment-card">' +
            '<div class="section-title" data-el="commentTitle"></div>' +
            '<textarea rows="7" data-el="note"></textarea>' +
          '</section>' +
        '</div>' +

        '<div class="bottom-grid">' +
          '<section class="stage">' +
            '<div class="stage-state"><span data-el="selHint"></span><span class="pill" data-el="selState">-</span></div>' +
            '<div class="scroller" data-el="scroller">' +
              '<div class="canvas-wrap" data-el="wrap">' +
                '<img data-el="shot" alt="">' +
                '<div class="layer" data-el="layer"></div>' +
              '</div>' +
            '</div>' +
          '</section>' +

          '<aside class="side">' +
            '<section class="card flags-card">' +
              '<div class="flags-head"><h3 data-k="myFlags"></h3><span class="pill" data-el="count">0</span><span data-el="openNote"></span></div>' +
              '<input class="flags-search" type="search" data-el="flagSearch">' +
              '<div class="list" data-el="list"></div>' +
            '</section>' +
            '<section class="card actions-card">' +
              '<div class="msg hidden" data-el="msg"></div>' +
              '<div class="actions">' +
                '<button class="btn btn-primary" data-act="save" data-k="save"></button>' +
                '<button class="btn" data-act="json" data-k="expJson"></button>' +
                '<button class="btn" data-act="png" data-k="expPng"></button>' +
              '</div>' +
            '</section>' +
          '</aside>' +
        '</div>' +

        '<div class="foot" data-el="foot"></div>' +

        '<div class="help-layer hidden" data-el="help">' +
          '<div class="help-box" role="dialog" aria-modal="true">' +
            '<div class="help-head"><h2 data-k="helpTitle"></h2><button class="btn" data-act="helpClose" data-k="helpClose"></button></div>' +
            '<section class="help-section">' +
              '<h3 data-k="vocabSearchTitle"></h3>' +
              '<input class="help-search" type="search" data-el="vocabSearch">' +
              '<div class="vocab-results" data-el="vocabResults"></div>' +
            '</section>' +
            '<section class="help-section">' +
              '<ul>' +
                '<li data-k="helpArtifact"></li><li data-k="helpSession"></li><li data-k="helpMarkup"></li>' +
                '<li data-k="helpPair"></li><li data-k="helpSuggestion"></li><li data-k="helpString"></li>' +
                '<li data-k="helpPriority"></li><li data-k="helpComment"></li><li data-k="helpMyFlags"></li>' +
              '</ul>' +
            '</section>' +
            '<section class="help-section help-note">' +
              '<h3 data-k="infoProtectionTitle"></h3>' +
              '<p data-k="infoProtectionText"></p>' +
            '</section>' +
            '<section class="help-section feedback-box">' +
              '<h3 data-k="feedbackTitle"></h3>' +
              '<p data-k="feedbackHint"></p>' +
              '<textarea rows="4" data-el="feedbackText"></textarea>' +
              '<div class="feedback-actions">' +
                '<button class="btn btn-primary" data-act="feedbackSave" data-k="feedbackSave"></button>' +
                '<button class="btn" data-act="feedbackExport" data-k="feedbackExport"></button>' +
                '<button class="btn" data-act="feedbackClear" data-k="feedbackClear"></button>' +
                '<span class="feedback-count" data-el="feedbackCount"></span>' +
              '</div>' +
              '<div class="feedback-status" data-el="feedbackStatus"></div>' +
            '</section>' +
          '</div>' +
        '</div>' +
      '</div>';

    ui.appendChild(overlay);

    ['hint', 'src', 'dim', 'pairs', 'oppTitle', 'improveTitle', 'priorityTitle', 'commentTitle',
     'priority', 'note', 'selHint', 'selState', 'scroller', 'wrap', 'shot', 'layer',
     'count', 'openNote', 'list', 'flagSearch', 'msg', 'help', 'foot',
     'vocabSearch', 'vocabResults', 'feedbackText', 'feedbackCount', 'feedbackStatus'].forEach(function (name) {
      el[name] = overlay.querySelector('[data-el="' + name + '"]');
    });

    overlay.querySelector('[data-act="close"]').onclick = function () { closeCockpit(false); };
    overlay.querySelector('[data-act="recapture"]').onclick = function () { requestCapture(null); };
    overlay.querySelector('[data-act="save"]').onclick = saveSession;
    overlay.querySelector('[data-act="json"]').onclick = exportJson;
    overlay.querySelector('[data-act="png"]').onclick = exportPng;
    overlay.querySelector('[data-act="help"]').onclick = function () {
      el.help.classList.remove('hidden');
      renderVocabularyResults();
      updateFeedbackCount();
    };
    overlay.querySelector('[data-act="helpClose"]').onclick = function () { el.help.classList.add('hidden'); };
    el.help.onclick = function (e) { if (e.target === el.help) el.help.classList.add('hidden'); };

    el.flagSearch.addEventListener('input', renderList);
    el.vocabSearch.addEventListener('input', renderVocabularyResults);
    overlay.querySelector('[data-act="feedbackSave"]').onclick = saveTrimFeedback;
    overlay.querySelector('[data-act="feedbackExport"]').onclick = exportTrimFeedback;
    overlay.querySelector('[data-act="feedbackClear"]').onclick = clearTrimFeedback;

    Array.prototype.forEach.call(overlay.querySelectorAll('[data-lang]'), function (b) {
      b.onclick = function () {
        lang = b.getAttribute('data-lang');
        applyLang();
        renderAll();
      };
    });

    el.note.addEventListener('input', function () {
      var m = current();
      if (m) m.note = el.note.value;
      renderList();
    });

    bindDrawing();
    applyLang();
  }

  function applyLang() {
    if (!overlay) return;
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-k]'), function (n) {
      n.textContent = t(n.getAttribute('data-k'));
    });
    Array.prototype.forEach.call(overlay.querySelectorAll('[data-lang]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    el.note.placeholder = t('notePh');
    el.hint.textContent = t('hintDraw');
    if (el.flagSearch) el.flagSearch.placeholder = t('searchFlagsPh');
    if (el.vocabSearch) el.vocabSearch.placeholder = t('vocabSearchPh');
    if (el.feedbackText) el.feedbackText.placeholder = t('feedbackPh');
    renderVocabularyResults();
    updateFeedbackCount();
    var pageName = (S.page && (S.page.title || S.page.url)) || '';
    el.src.textContent = t('infoCaptured') + ' ' + pageName;
    if (el.foot) el.foot.innerHTML = footerHtml();
  }

  function footerHtml() {
    if (lang === 'de') {
      return 'Lean Information Framework © Ron Hyams &amp; Andreas Binggeli · ' +
        '<a href="https://lean.clarus.news" target="_blank" rel="noopener noreferrer">lean.clarus.news</a> · CC BY-ND 4.0 ' +
        '<span>v0.75c · nur lokal</span>';
    }
    return 'Lean Information framework © Ron Hyams &amp; Andreas Binggeli · ' +
      '<a href="https://lean.clarus.news" target="_blank" rel="noopener noreferrer">lean.clarus.news</a> · CC BY-ND 4.0 ' +
      '<span>v0.75c · local only</span>';
  }

  function vocabularyEntries() {
    var entries = [];

    TRIM_PAIRS.forEach(function (p) {
      p.suggestions.forEach(function (suggestion) {
        entries.push({
          term: suggestion,
          pairId: p.id,
          suggestion: suggestion,
          aliases: []
        });
      });
    });

    entries.push({
      term: 'Timeliness',
      termDe: 'Rechtzeitigkeit',
      pairId: 'meaningless',
      suggestion: 'Needed',
      aliases: ['timely', 'late', 'lateness', 'outdated', 'aktualität', 'rechtzeitig', 'verspätet']
    });

    return entries;
  }

  function renderVocabularyResults() {
    if (!el.vocabResults || !el.vocabSearch) return;

    var q = String(el.vocabSearch.value || '').trim().toLowerCase();
    el.vocabResults.innerHTML = '';

    if (!q) {
      var hint = document.createElement('p');
      hint.className = 'vocab-hint';
      hint.textContent = t('vocabSearchHint');
      el.vocabResults.appendChild(hint);
      return;
    }

    var matches = vocabularyEntries().filter(function (entry) {
      var p = trimPair(entry.pairId);
      if (!p) return false;
      var local = trimPairUi(p, lang);
      var suggestionLocal = trimSuggestionText(entry.suggestion, lang);
      var haystack = [
        entry.term,
        entry.termDe || '',
        entry.aliases.join(' '),
        p.wasteful,
        p.lean,
        local ? local.wasteful : '',
        local ? local.lean : '',
        entry.suggestion,
        suggestionLocal
      ].join(' ').toLowerCase();
      return haystack.indexOf(q) !== -1;
    });

    if (!matches.length) {
      var empty = document.createElement('p');
      empty.className = 'vocab-hint';
      empty.textContent = t('vocabNoResults');
      el.vocabResults.appendChild(empty);
      return;
    }

    matches.slice(0, 12).forEach(function (entry) {
      var p = trimPair(entry.pairId);
      var item = document.createElement('div');
      item.className = 'vocab-item';

      var term = document.createElement('strong');
      term.textContent =
        lang === 'de' && entry.termDe ? entry.termDe : entry.term;

      var taxonomy = document.createElement('span');
      taxonomy.textContent =
        trimPairTextLocalized(p, lang) + ': ' +
        trimSuggestionText(entry.suggestion, lang);

      item.appendChild(term);
      item.appendChild(taxonomy);
      el.vocabResults.appendChild(item);
    });
  }

  function getTrimFeedback(done) {
    chrome.storage.local.get('trim_feedback', function (r) {
      done(Array.isArray(r.trim_feedback) ? r.trim_feedback : []);
    });
  }

  function updateFeedbackCount() {
    if (!el.feedbackCount) return;
    getTrimFeedback(function (items) {
      el.feedbackCount.textContent =
        items.length + ' ' + t('feedbackCount');
    });
  }

  function saveTrimFeedback() {
    if (!el.feedbackText) return;
    var value = String(el.feedbackText.value || '').trim();

    if (!value) {
      el.feedbackStatus.textContent = t('feedbackEmpty');
      return;
    }

    getTrimFeedback(function (items) {
      items.unshift({
        id: Date.now(),
        created_at: new Date().toISOString(),
        version: '0.75c',
        language: lang,
        text: value
      });

      if (items.length > 50) items = items.slice(0, 50);

      chrome.storage.local.set({ trim_feedback: items }, function () {
        if (chrome.runtime.lastError) {
          el.feedbackStatus.textContent = chrome.runtime.lastError.message;
          return;
        }
        el.feedbackText.value = '';
        el.feedbackStatus.textContent = t('feedbackSaved');
        updateFeedbackCount();
      });
    });
  }

  function exportTrimFeedback() {
    getTrimFeedback(function (items) {
      if (!items.length) {
        el.feedbackStatus.textContent = t('feedbackEmpty');
        return;
      }

      var payload = {
        schema: 'trim.feedback.export/0.1',
        exported_at: new Date().toISOString(),
        feedback: items
      };

      download(
        'trim-feedback-' + Date.now() + '.json',
        new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      );
    });
  }

  function clearTrimFeedback() {
    if (!window.confirm(t('confirmFeedbackClear'))) return;
    chrome.storage.local.remove('trim_feedback', function () {
      el.feedbackStatus.textContent = t('feedbackEmpty');
      updateFeedbackCount();
    });
  }

  var drawing = false, sx = 0, sy = 0, box = null;

  function bindDrawing() {
    el.layer.addEventListener('mousedown', function (e) {
      if (e.button !== 0 || !S.img) return;
      if (e.target !== el.layer) return;
      var r = el.layer.getBoundingClientRect();
      drawing = true;
      sx = e.clientX - r.left;
      sy = e.clientY - r.top;
      box = document.createElement('div');
      box.className = 'drawbox';
      box.style.cssText = 'left:' + sx + 'px;top:' + sy + 'px;width:0;height:0';
      el.layer.appendChild(box);
      e.preventDefault();
      e.stopPropagation();
    }, true);

    window.addEventListener('mousemove', function (e) {
      if (!drawing) return;
      var r = el.layer.getBoundingClientRect();
      var x = clamp(e.clientX - r.left, 0, r.width);
      var y = clamp(e.clientY - r.top, 0, r.height);
      box.style.left = Math.min(sx, x) + 'px';
      box.style.top = Math.min(sy, y) + 'px';
      box.style.width = Math.abs(x - sx) + 'px';
      box.style.height = Math.abs(y - sy) + 'px';
    }, true);

    window.addEventListener('mouseup', function (e) {
      if (!drawing) return;
      drawing = false;
      var r = el.layer.getBoundingClientRect();
      var x = clamp(e.clientX - r.left, 0, r.width);
      var y = clamp(e.clientY - r.top, 0, r.height);
      var L = Math.min(sx, x);
      var T = Math.min(sy, y);
      var W = Math.abs(x - sx);
      var H = Math.abs(y - sy);
      if (box && box.parentNode) box.parentNode.removeChild(box);
      box = null;
      if (W < 10 || H < 8) return;
      S.seq++;
      S.marks.push(makeMark(S.seq, L / r.width, T / r.height, W / r.width, H / r.height, ''));
      S.sel = S.seq;
      hideMsg();
      renderAll();
    }, true);
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function makeMark(n, x, y, w, h, text) {
    return {
      n: n,
      code: flagCode(n),
      x: x, y: y, w: w, h: h,
      waste: null,
      suggestions: [],
      priority: null,
      priorityPosition: null,
      priorityMetrics: {
        urgencyDays: null,
        severity: null,
        minutesSaved: null,
        audienceSize: null,
        creationFrequency: null,
        score: null
      },
      note: '',
      text: text || ''
    };
  }

  function flagCode(n) {
    var v = n;
    var out = '';
    while (v > 0) {
      var r = (v - 1) % 26;
      out = String.fromCharCode(65 + r) + out;
      v = Math.floor((v - 1) / 26);
    }
    return out;
  }

  function current() {
    for (var i = 0; i < S.marks.length; i++) {
      if (S.marks[i].n === S.sel) return S.marks[i];
    }
    return null;
  }

  function completeMark(m) {
    return !!(m && m.waste && m.suggestions && m.suggestions.length);
  }

  function pairLabel(m) {
    var p = m && m.waste ? trimPair(m.waste) : null;
    if (!p) return t('open');
    return p.number + '. ' + trimPairTextLocalized(p, lang);
  }

  function attributeString(m) {
    var p = m && m.waste ? trimPair(m.waste) : null;
    if (!p) return t('open');
    var out = trimPairText(p);
    if (m.suggestions && m.suggestions.length) out += ': ' + m.suggestions.join(', ');
    return out;
  }

  function priorityFromPosition(pos) {
    if (!pos) return null;
    var score = pos.important + pos.urgent;
    if (score >= 1.35) return 'high';
    if (score >= 0.75) return 'medium';
    return 'low';
  }

  function priorityRank(prio) {
    if (prio === 'high') return 0;
    if (prio === 'medium') return 1;
    if (prio === 'low') return 2;
    return 3;
  }

  function priorityScore(m) {
    return m.priorityPosition ? m.priorityPosition.important + m.priorityPosition.urgent : -1;
  }

  function currentMetricScore(m) {
    if (!m || !m.priorityMetrics) return -Infinity;
    updatePriorityScore(m);
    return typeof m.priorityMetrics.score === 'number'
      ? m.priorityMetrics.score
      : -Infinity;
  }

  function sortedMarks() {
    return S.marks.slice().sort(function (a, b) {
      var ma = currentMetricScore(a);
      var mb = currentMetricScore(b);
      if (ma !== mb) return mb - ma;

      var pa = priorityRank(a.priority);
      var pb = priorityRank(b.priority);
      if (pa !== pb) return pa - pb;
      var sa = priorityScore(a), sb = priorityScore(b);
      if (sa !== sb) return sb - sa;
      return a.n - b.n;
    });
  }

  function removeMark(n) {
    S.marks = S.marks.filter(function (m) { return m.n !== n; });
    if (S.sel === n) S.sel = null;
    renderAll();
  }

  function renderAll() {
    renderMarks();
    renderList();
    renderSelection();
  }

  function renderMarks() {
    Array.prototype.forEach.call(el.layer.querySelectorAll('.mark'), function (n) {
      n.parentNode.removeChild(n);
    });

    S.marks.forEach(function (m) {
      var p = m.waste ? trimPair(m.waste) : null;
      var label = pairLabel(m);
      var d = document.createElement('div');
      d.className = 'mark' + (S.sel === m.n ? ' sel' : '');
      d.style.cssText = 'left:' + (m.x * 100) + '%;top:' + (m.y * 100) + '%;' +
                        'width:' + (m.w * 100) + '%;height:' + (m.h * 100) + '%';
      if (m.waste) d.setAttribute('data-w', m.waste); else d.setAttribute('data-open', '1');
      d.setAttribute('role', 'button');
      d.setAttribute('tabindex', '0');
      d.setAttribute('aria-label', t('flagLabel') + ' ' + m.code + ': ' + label);

      var tag = document.createElement('span');
      tag.className = 'tag';
      var code = document.createElement('span');
      code.className = 'num mono';
      code.textContent = m.code + ' ⚑';
      tag.appendChild(code);
      tag.appendChild(document.createTextNode(label));
      d.appendChild(tag);

      d.onclick = function (ev) { ev.stopPropagation(); S.sel = m.n; renderAll(); };
      d.onkeydown = function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); d.click(); }
        if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); removeMark(m.n); }
      };
      el.layer.appendChild(d);
    });
  }

  function renderList() {
    el.list.innerHTML = '';

    var query = el.flagSearch
      ? String(el.flagSearch.value || '').trim().toLowerCase()
      : '';

    var open = S.marks.filter(function (m) { return !completeMark(m); }).length;
    el.openNote.innerHTML = open
      ? '<span class="pill">' + open + ' ' + t('openCount') + '</span>'
      : '';

    var visibleMarks = sortedMarks().filter(function (m) {
      if (!query) return true;

      var p = m.waste ? trimPair(m.waste) : null;
      var localPair = p ? trimPairTextLocalized(p, lang) : '';
      var suggestionText = (m.suggestions || []).map(function (name) {
        return trimSuggestionText(name, lang);
      }).join(' ');

      var haystack = [
        m.code || '',
        p ? trimPairText(p) : '',
        localPair,
        (m.suggestions || []).join(' '),
        suggestionText,
        m.note || '',
        m.text || ''
      ].join(' ').toLowerCase();

      return haystack.indexOf(query) !== -1;
    });

    el.count.textContent = query
      ? (visibleMarks.length + '/' + S.marks.length)
      : S.marks.length;

    visibleMarks.forEach(function (m) {
      var p = m.waste ? trimPair(m.waste) : null;
      var row = document.createElement('div');
      row.className = 'row' + (S.sel === m.n ? ' sel' : '');
      row.setAttribute('tabindex', '0');

      var code = document.createElement('span');
      code.className = 'n';
      code.textContent = m.code + '⚑';

      var txt = document.createElement('span');
      txt.className = 'txt';

      var main = document.createElement('span');
      var sw = document.createElement('i');
      sw.className = 'swatch';
      sw.style.borderColor = p ? p.color : '#6b7783';
      sw.style.borderStyle = p ? p.style : 'dashed';
      main.appendChild(sw);
      main.appendChild(document.createTextNode(p ? pairLabel(m) : t('open')));
      txt.appendChild(main);

      var line2 = document.createElement('small');
      if (!p) line2.textContent = t('pickWaste');
      else if (!m.suggestions.length) line2.textContent = t('pickSol');
      else {
        line2.textContent = '→ ' + m.suggestions.map(function (name) {
          return trimSuggestionText(name, lang);
        }).join(', ');
      }
      txt.appendChild(line2);

      if (m.note) {
        var line3 = document.createElement('small');
        line3.className = 'comment-preview';
        var noteSnippet = m.note.trim();
        if (noteSnippet.length > 64) noteSnippet = noteSnippet.slice(0, 64) + '…';
        line3.textContent = noteSnippet;
        txt.appendChild(line3);
      }

      var meta = document.createElement('span');
      meta.className = 'row-meta';
      var metricScore = currentMetricScore(m);
      meta.textContent = metricScore !== -Infinity
        ? (t('score') + ' ' + metricScore.toFixed(1))
        : (m.priority ? t(m.priority) : '–');

      var kill = document.createElement('button');
      kill.className = 'kill';
      kill.setAttribute('aria-label', 'delete');
      kill.textContent = '×';

      var right = document.createElement('span');
      right.className = 'row-right';
      right.appendChild(meta);
      right.appendChild(kill);

      row.appendChild(code);
      row.appendChild(txt);
      row.appendChild(right);

      row.onclick = function () {
        S.sel = m.n;
        renderAll();
      };
      row.onkeydown = function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') {
          ev.preventDefault();
          S.sel = m.n;
          renderAll();
        }
      };
      kill.onclick = function (ev) {
        ev.stopPropagation();
        removeMark(m.n);
      };

      el.list.appendChild(row);
    });
  }

  function renderPairs() {
    el.pairs.innerHTML = '';
    var m = current();

    TRIM_PAIRS.forEach(function (p) {
      var row = document.createElement('div');
      row.className = 'pair-row' + (m && m.waste && m.waste !== p.id ? ' dim' : '');

      var pairBtn = document.createElement('button');
      pairBtn.className = 'pair-btn';
      pairBtn.type = 'button';
      pairBtn.textContent = p.number + '. ' + trimPairTextLocalized(p, lang);
      var on = !!(m && m.waste === p.id);
      pairBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      pairBtn.style.borderColor = p.color;
      pairBtn.style.borderStyle = p.style;
      if (on) pairBtn.style.boxShadow = 'inset 0 0 0 2px ' + p.color;
      pairBtn.disabled = !m;
      pairBtn.onclick = function () {
        var c = current();
        if (!c) return;
        if (c.waste === p.id) {
          c.waste = null;
          c.suggestions = [];
        } else {
          c.waste = p.id;
          c.suggestions = [];
        }
        renderAll();
      };

      var guide = document.createElement('div');
      guide.className = 'pair-guide';
      var guidance = document.createElement('span');
      guidance.className = 'guidance';
      guidance.textContent = trimPairUi(p, lang).guidance;
      guide.appendChild(guidance);

      var chips = document.createElement('span');
      chips.className = 'suggestions';
      p.suggestions.forEach(function (name) {
        var b = document.createElement('button');
        b.className = 'suggestion-btn';
        b.type = 'button';
        b.textContent = trimSuggestionText(name, lang);
        var son = !!(m && m.waste === p.id && m.suggestions.indexOf(name) !== -1);
        b.setAttribute('aria-pressed', son ? 'true' : 'false');
        b.style.borderColor = p.color;
        b.disabled = !m;
        if (son) b.style.boxShadow = 'inset 0 -3px 0 ' + p.color;
        b.onclick = function () {
          var c = current();
          if (!c) return;
          if (c.waste !== p.id) {
            c.waste = p.id;
            c.suggestions = [name];
          } else {
            var idx = c.suggestions.indexOf(name);
            if (idx >= 0) c.suggestions.splice(idx, 1);
            else c.suggestions.push(name);
          }
          renderAll();
        };
        chips.appendChild(b);
      });
      guide.appendChild(chips);

      row.appendChild(pairBtn);
      row.appendChild(guide);
      el.pairs.appendChild(row);
    });
  }

  function metricNumber(v) {
    var n = Number(v);
    return isFinite(n) ? n : 0;
  }

  function calculatePriorityScore(metrics) {
    if (!metrics) return null;

    var urgencyDays = metricNumber(metrics.urgencyDays);
    var minutesSaved = metricNumber(metrics.minutesSaved);
    var audienceSize = metricNumber(metrics.audienceSize);

    var severityWeights = {
      low: 1,
      medium: 2,
      high: 3,
      critical: 4
    };

    var frequencyWeights = {
      once: 1,
      yearly: 2,
      monthly: 3,
      weekly: 4,
      daily: 5
    };

    var severity = severityWeights[metrics.severity] || 0;
    var frequency = frequencyWeights[metrics.creationFrequency] || 0;

    if (
      !urgencyDays &&
      !severity &&
      !minutesSaved &&
      !audienceSize &&
      !frequency
    ) return null;

    var urgencyScore = urgencyDays > 0 ? Math.max(1, 10 / urgencyDays) : 0;
    var efficiencyScore =
      Math.log10(1 + minutesSaved) +
      Math.log10(1 + audienceSize);

    var score =
      urgencyScore +
      (severity * 2) +
      efficiencyScore +
      frequency;

    return Math.round(score * 10) / 10;
  }

  function updatePriorityScore(m) {
    if (!m || !m.priorityMetrics) return;
    m.priorityMetrics.score = calculatePriorityScore(m.priorityMetrics);
  }

  function renderPriority() {
    el.priority.innerHTML = '';
    var m = current();

    var metrics = m ? m.priorityMetrics : null;

    function addGroup(titleKey) {
      var title = document.createElement('div');
      title.className = 'score-group-title';
      title.textContent = t(titleKey);
      el.priority.appendChild(title);
    }

    function addSelect(labelKey, field, choices) {
      var row = document.createElement('div');
      row.className = 'score-field';

      var label = document.createElement('label');
      label.textContent = t(labelKey);

      var select = document.createElement('select');
      select.disabled = !m;

      var empty = document.createElement('option');
      empty.value = '';
      empty.textContent = '–';
      select.appendChild(empty);

      choices.forEach(function (choice) {
        var opt = document.createElement('option');
        opt.value = choice.value;
        opt.textContent = choice.label;
        select.appendChild(opt);
      });

      if (m && metrics && metrics[field] != null) {
        select.value = String(metrics[field]);
      }

      select.onchange = function () {
        var c = current();
        if (!c) return;
        c.priorityMetrics[field] = select.value || null;
        updatePriorityScore(c);
        renderAll();
      };

      row.appendChild(label);
      row.appendChild(select);
      el.priority.appendChild(row);
    }

    function addNumber(labelKey, field, min, step) {
      var row = document.createElement('div');
      row.className = 'score-field';

      var label = document.createElement('label');
      label.textContent = t(labelKey);

      var input = document.createElement('input');
      input.type = 'number';
      input.min = min;
      input.step = step;
      input.disabled = !m;

      if (m && metrics && metrics[field] != null) {
        input.value = metrics[field];
      }

      input.onchange = function () {
        var c = current();
        if (!c) return;
        c.priorityMetrics[field] =
          input.value === '' ? null : Number(input.value);
        updatePriorityScore(c);
        renderAll();
      };

      row.appendChild(label);
      row.appendChild(input);
      el.priority.appendChild(row);
    }

    addGroup('criticality');

    addNumber('urgencyDays', 'urgencyDays', '1', '1');

    addSelect('severity', 'severity', [
      { value: 'low', label: t('low') },
      { value: 'medium', label: t('medium') },
      { value: 'high', label: t('high') },
      { value: 'critical', label: t('critical') }
    ]);

    addGroup('efficiency');

    addNumber('minutesSaved', 'minutesSaved', '0', '1');
    addNumber('audienceSize', 'audienceSize', '0', '1');

    addGroup('cadence');

    addSelect('creationFrequency', 'creationFrequency', [
      { value: 'once', label: t('once') },
      { value: 'yearly', label: t('yearly') },
      { value: 'monthly', label: t('monthly') },
      { value: 'weekly', label: t('weekly') },
      { value: 'daily', label: t('daily') }
    ]);

    var scoreBox = document.createElement('div');
    scoreBox.className = 'score-result';

    var scoreLabel = document.createElement('span');
    scoreLabel.textContent = t('score') + ':';

    var scoreValue = document.createElement('strong');
    scoreValue.textContent =
      m && metrics && metrics.score != null
        ? metrics.score.toFixed(1)
        : '–';

    scoreBox.appendChild(scoreLabel);
    scoreBox.appendChild(scoreValue);

    el.priority.appendChild(scoreBox);
  }

  function renderSelection() {
    var m = current();
    if (!m) {
      el.oppTitle.textContent = '⚑ ' + t('opportunity');
      el.improveTitle.textContent = '⚑ ' + t('improvement') + ': ';
      el.priorityTitle.textContent = '⚑ ' + t('priority');
      el.commentTitle.textContent = '⚑ ' + t('comment');
      el.selHint.textContent = t('selHint');
      el.selState.textContent = '-';
      el.note.value = '';
      el.note.disabled = true;
    } else {
      var prefix = m.code + '⚑ ';
      el.oppTitle.textContent = prefix + t('opportunity');
      el.improveTitle.textContent = prefix + t('improvement') + ': ';
      el.priorityTitle.textContent = prefix + t('priority');
      el.commentTitle.textContent = prefix + t('comment');
      el.selState.textContent = completeMark(m) ? t('done') : (m.waste ? t('partial') : t('open'));
      el.selHint.textContent = completeMark(m) ? t('complete') : (m.waste ? t('pickSol') : t('pickWaste'));
      el.note.disabled = false;
      el.note.value = m.note || '';
    }
    renderPairs();
    renderPriority();
  }

  window.addEventListener('keydown', function (e) {
    if (!S.open) return;
    var path = e.composedPath ? e.composedPath() : [];
    var inField = path.some(function (n) {
      return n && n.tagName && (n.tagName === 'INPUT' || n.tagName === 'TEXTAREA');
    });

    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (el.help && !el.help.classList.contains('hidden')) {
        el.help.classList.add('hidden');
      } else {
        closeCockpit(false);
      }
      return;
    }

    if (inField) return;
    var m = current();

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (m) {
        e.preventDefault();
        e.stopPropagation();
        removeMark(m.n);
      }
      return;
    }

    var i = '1234'.indexOf(e.key);
    if (i >= 0 && m) {
      e.preventDefault();
      e.stopPropagation();
      m.waste = TRIM_PAIRS[i].id;
      m.suggestions = [];
      renderAll();
    }
  }, true);

  function flash(text, kind) {
    el.msg.textContent = text;
    el.msg.className = 'msg ' + (kind || 'warn');
  }

  function hideMsg() {
    if (el.msg) el.msg.className = 'msg hidden';
  }

  function validate() {
    if (!S.marks.length) {
      flash(t('needMark'), 'warn');
      return false;
    }
    var open = S.marks.filter(function (m) { return !completeMark(m); });
    if (open.length) {
      flash(t('needClass') + open.map(function (m) { return m.code; }).join(', '), 'warn');
      return false;
    }
    hideMsg();
    return true;
  }

  function payload() {
    var now = Date.now();
    var durationSec = Math.max(0, Math.round((now - S.sessionStartedAt) / 1000));

    return {
      schema: 'trim.capture.session/0.7',
      captured_at: new Date(now).toISOString(),
      session_duration_sec: durationSec,
      source: {
        page_url: S.page.url || '',
        page_title: S.page.title || '',
        capture: { w: S.w, h: S.h, device_pixel_ratio: window.devicePixelRatio || 1 }
      },
      markings: sortedMarks().map(function (m, idx) {
        var p = trimPair(m.waste);
        return {
          index: idx + 1,
          raw_index: m.n,
          flag_code: m.code,
          rect_relative: { x: r5(m.x), y: r5(m.y), w: r5(m.w), h: r5(m.h) },
          rect_pixels: {
            x: Math.round(m.x * S.w), y: Math.round(m.y * S.h),
            w: Math.round(m.w * S.w), h: Math.round(m.h * S.h)
          },
          selected_text: m.text || null,
          wasteful_attribute: m.waste,
          lean_attribute: p ? p.lean.toLowerCase() : null,
          attribute_pair: p ? trimPairText(p) : null,
          improvement_suggestions: m.suggestions.slice(),
          // v0.6 aliases retained for compatibility with existing consumers.
          solutions: m.suggestions.slice(),
          solution: m.suggestions[0] || null,
          priority: m.priority || null,
          priority_position: m.priorityPosition ? {
            important: r5(m.priorityPosition.important),
            urgent: r5(m.priorityPosition.urgent)
          } : null,
          priority_metrics: m.priorityMetrics ? {
            urgency_days: m.priorityMetrics.urgencyDays,
            severity: m.priorityMetrics.severity,
            minutes_saved: m.priorityMetrics.minutesSaved,
            audience_size: m.priorityMetrics.audienceSize,
            creation_frequency: m.priorityMetrics.creationFrequency,
            score: m.priorityMetrics.score
          } : null,
          attribute_string: attributeString(m),
          comment: m.note || null,
          note: m.note || null
        };
      })
    };
  }

  function r5(v) { return Math.round(v * 100000) / 100000; }

  function download(name, blob) {
    var a = document.createElement('a');
    var u = URL.createObjectURL(blob);
    a.href = u;
    a.download = name;
    (document.body || document.documentElement).appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(u); a.remove(); }, 0);
  }

  function exportJson() {
    if (!validate()) return;
    download('trim-session-' + Date.now() + '.json',
      new Blob([JSON.stringify(payload(), null, 2)], { type: 'application/json' }));
  }

  function annotatedCanvas() {
    var c = document.createElement('canvas');
    c.width = S.w;
    c.height = S.h;
    var g = c.getContext('2d');
    g.drawImage(S.img, 0, 0);
    var scale = Math.max(1, S.w / 1200);

    S.marks.forEach(function (m) {
      var p = trimPair(m.waste);
      var col = p ? p.color : '#3d4852';
      var x = m.x * S.w;
      var y = m.y * S.h;
      var w = m.w * S.w;
      var h = m.h * S.h;
      g.lineWidth = 3 * scale;
      g.strokeStyle = col;
      g.setLineDash(m.waste === 'ambiguous' ? [10 * scale, 6 * scale]
                  : (m.waste === 'incomplete' ? [3 * scale, 5 * scale] : []));
      g.strokeRect(x, y, w, h);
      g.setLineDash([]);
      var label = m.code + ' ⚑  ' + pairLabel(m);
      g.font = (13 * scale) + 'px sans-serif';
      var tw = g.measureText(label).width;
      var th = 19 * scale;
      var ty = Math.max(0, y - th - 2 * scale);
      g.fillStyle = '#101418';
      g.fillRect(x, ty, tw + 12 * scale, th);
      g.fillStyle = '#ffffff';
      g.textBaseline = 'middle';
      g.fillText(label, x + 6 * scale, ty + th / 2);
    });

    return c;
  }

  function exportPng() {
    if (!validate()) return;
    annotatedCanvas().toBlob(function (b) {
      download('trim-capture-' + Date.now() + '.png', b);
    }, 'image/png');
  }

  function formatDuration(seconds) {
    var min = Math.floor(seconds / 60);
    var sec = seconds % 60;
    if (min > 0) return min + ' min ' + sec + ' sec';
    return sec + ' sec';
  }

  function saveSession() {
    if (!validate()) return;

    var c = document.createElement('canvas');
    var maxW = 1280;
    var k = Math.min(1, maxW / S.w);
    c.width = Math.round(S.w * k);
    c.height = Math.round(S.h * k);
    c.getContext('2d').drawImage(S.img, 0, 0, c.width, c.height);

    var session = payload();
    session.thumbnail = c.toDataURL('image/jpeg', 0.7);

    chrome.runtime.sendMessage({ type: 'TRIM_SAVE_SESSION', session: session }, function (res) {
      if (res && res.ok) {
        var msg = t('savedWithTime');
        flash(msg.replace('{time}', formatDuration(session.session_duration_sec)), 'ok');
      } else {
        flash(t('saveFail'), 'warn');
      }
    });
  }

})();
