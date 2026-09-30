// ============================================================
// TRIM v0.73_TPS – Popup
// Lists locally stored sessions. External file because Manifest V3
// blocks inline scripts on extension pages.
// ============================================================

(function () {
  'use strict';

  var lang = trimLangFrom(navigator.language);
  function t(k) { return (TRIM_I18N[lang] && TRIM_I18N[lang][k]) || k; }

  var HINT = {
    de: 'Aufnehmen mit <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>, über das Kontextmenü oder den Knopf unten. ' +
        'Im Cockpit ziehst du beliebig viele Rechtecke und klassifizierst jedes einzeln.',
    en: 'Capture with <kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>T</kbd>, from the context menu, or with the button below. ' +
        'In the cockpit you drag as many rectangles as you need and classify each one.'
  };

  var FOOTER = {
    de: 'Lean Information Framework © Ron Hyams &amp; Andreas Binggeli · ' +
        '<a href="https://lean.clarus.news" target="_blank" rel="noopener noreferrer">lean.clarus.news</a> · CC BY-ND 4.0<br>' +
        'Keine Backend-Verbindung in dieser Version – nichts verlässt den Browser.',
    en: 'Lean Information framework © Ron Hyams &amp; Andreas Binggeli · ' +
        '<a href="https://lean.clarus.news" target="_blank" rel="noopener noreferrer">lean.clarus.news</a> · CC BY-ND 4.0<br>' +
        'No backend in this version – nothing leaves the browser.'
  };

  function applyLang() {
    document.getElementById('hint').innerHTML = HINT[lang];
    document.getElementById('btn-capture').textContent = t('captureNow');
    document.getElementById('btn-shortcut').textContent = t('shortcut');
    document.getElementById('btn-export').textContent = t('exportAll');
    document.getElementById('btn-clear').textContent = t('clearAll');
    document.getElementById('lbl-sessions').textContent = t('sessions');
    document.getElementById('foot').innerHTML = FOOTER[lang];
    Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    load();
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-lang]'), function (b) {
    b.onclick = function () { lang = b.getAttribute('data-lang'); applyLang(); };
  });

  var sessions = [];

  function load() {
    chrome.runtime.sendMessage({ type: 'TRIM_GET_SESSIONS' }, function (res) {
      sessions = (res && res.sessions) || [];
      render();
    });
  }

  function render() {
    var list = document.getElementById('list');
    document.getElementById('count').textContent = sessions.length;
    list.innerHTML = '';
    if (!sessions.length) {
      var e = document.createElement('div');
      e.className = 'empty';
      e.textContent = t('noSessions');
      list.appendChild(e);
      return;
    }
    sessions.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'card';
      var title = (s.source && (s.source.page_title || s.source.page_url)) || '–';
      var when = new Date(s.captured_at);
      var top = document.createElement('div');
      top.className = 'top';
      top.innerHTML = '<span class="ttl"></span><span class="when">' +
        when.toLocaleDateString() + ' ' +
        when.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + '</span>';
      top.querySelector('.ttl').textContent = title;
      card.appendChild(top);

      var tags = document.createElement('div');
      tags.className = 'tags';
      (s.markings || []).forEach(function (m) {
        var p = trimPair(m.wasteful_attribute);
        var suggestions = Array.isArray(m.improvement_suggestions)
          ? m.improvement_suggestions
          : (Array.isArray(m.solutions) ? m.solutions : (m.solution ? [m.solution] : []));
        var tps =
          m.priority_metrics &&
          typeof m.priority_metrics.score === 'number'
            ? (' [TPS ' + m.priority_metrics.score.toFixed(1) + ']')
            : '';
        var prio = tps || (m.priority ? (' [' + m.priority + ']') : '');
        var sp = document.createElement('span');
        sp.className = 'tag';
        if (p) { sp.style.borderColor = p.color; sp.style.borderStyle = p.style; }
        sp.textContent =
          (m.flag_code || m.index || '?') + ' ' + (p ? (p.number + '. ' + trimPairTextLocalized(p, lang)) : '?') +
          (suggestions.length ? ': ' + suggestions.map(function (name) { return trimSuggestionText(name, lang); }).join(', ') : '') + prio;
        tags.appendChild(sp);
      });
      card.appendChild(tags);
      list.appendChild(card);
    });
  }

  document.getElementById('btn-capture').onclick = function () {
    chrome.runtime.sendMessage({ type: 'TRIM_START' }, function () { window.close(); });
  };

  document.getElementById('btn-shortcut').onclick = function () {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  };

  document.getElementById('btn-export').onclick = function () {
    if (!sessions.length) return;
    var slim = sessions.map(function (s) {
      var c = JSON.parse(JSON.stringify(s));
      delete c.thumbnail;
      return c;
    });
    var blob = new Blob([JSON.stringify({ schema: 'trim.capture.export/0.7', sessions: slim }, null, 2)],
      { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'trim-sessions-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  };

  document.getElementById('btn-clear').onclick = function () {
    if (!window.confirm(t('confirmClear'))) return;
    chrome.runtime.sendMessage({ type: 'TRIM_CLEAR_SESSIONS' }, function () { load(); });
  };

  applyLang();
})();
