// ============================================================
// TRIM v0.71 – Background Service Worker
// Owns: keyboard command, context menu, tab capture, local storage.
// No network access anywhere in this version.
// ============================================================

importScripts('./model.js');

var MAX_SESSIONS = 10;

chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.removeAll(function () {
    chrome.contextMenus.create({
      id: 'trim-capture',
      title: 'TRIM: capture and mark this page',
      contexts: ['page', 'selection', 'image']
    });
  });
  console.log('[TRIM] v0.71 installed – local only, no backend.');
});

// Do not rely on the optional `tab` argument of chrome.commands.onCommand.
// On some Chrome/Linux combinations it may be absent. Always resolve the
// active tab explicitly, then launch TRIM there.
chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'trim-capture') return;
  chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    if (chrome.runtime.lastError || !tabs || !tabs[0]) {
      showErrorBadge();
      return;
    }
    startCapture(tabs[0]);
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'trim-capture') startCapture(tab);
});

// The popup and the in-page trigger button both route through here.
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === 'TRIM_REQUEST_CAPTURE') {
    var windowId = sender.tab && sender.tab.windowId;
    capture(windowId, function (res) { sendResponse(res); });
    return true;
  }
  if (msg.type === 'TRIM_START') {
    // Popup asked for a capture on the active tab.
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        startCapture(tabs[0]);
        sendResponse({ ok: true });
      } else {
        sendResponse({ ok: false, error: 'No active tab found' });
      }
    });
    return true;
  }
  if (msg.type === 'TRIM_SAVE_SESSION') {
    saveSession(msg.session, function (res) { sendResponse(res); });
    return true;
  }
  if (msg.type === 'TRIM_GET_SESSIONS') {
    chrome.storage.local.get('trim_sessions', function (r) {
      sendResponse({ sessions: r.trim_sessions || [] });
    });
    return true;
  }
  if (msg.type === 'TRIM_CLEAR_SESSIONS') {
    chrome.storage.local.remove('trim_sessions', function () { sendResponse({ ok: true }); });
    return true;
  }
  return false;
});

function capture(windowId, done) {
  var opts = { format: 'png' };
  try {
    chrome.tabs.captureVisibleTab(windowId, opts, function (dataUrl) {
      if (chrome.runtime.lastError || !dataUrl) {
        done({ ok: false, error: (chrome.runtime.lastError || {}).message || 'capture failed' });
        return;
      }
      done({ ok: true, dataUrl: dataUrl });
    });
  } catch (e) {
    done({ ok: false, error: String(e) });
  }
}

function startCapture(tab) {
  if (!tab || !tab.id) {
    showErrorBadge();
    return;
  }

  // Chrome internal pages, the Web Store and similar protected pages do not
  // allow extension content scripts. Fail visibly instead of doing nothing.
  if (!isScriptableUrl(tab.url || '')) {
    showErrorBadge();
    return;
  }

  // First try the already declared content script. If the extension was just
  // loaded/reloaded, an existing page may not have received it yet. In that
  // case inject model.js + content.js once and retry. This is important for
  // Alt+Shift+T to work immediately without forcing a page reload.
  ensureContentScript(tab, function (ok) {
    if (!ok) {
      showErrorBadge();
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'TRIM_PREPARE' }, function () {
      if (chrome.runtime.lastError) {
        showErrorBadge();
        return;
      }
      setTimeout(function () {
        capture(tab.windowId, function (res) {
          if (!res.ok) {
            showErrorBadge();
            return;
          }
          chrome.tabs.sendMessage(tab.id, {
            type: 'TRIM_OPEN',
            dataUrl: res.dataUrl,
            page: { url: tab.url || '', title: tab.title || '' }
          }, function () {
            if (chrome.runtime.lastError) showErrorBadge();
          });
        });
      }, 90);
    });
  });
}

function ensureContentScript(tab, done) {
  chrome.tabs.sendMessage(tab.id, { type: 'TRIM_PING' }, function (response) {
    if (!chrome.runtime.lastError && response && response.ok) {
      done(true);
      return;
    }

    // Clear lastError by reading it above, then inject into the existing tab.
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['src/model.js', 'src/content.js']
    }, function () {
      if (chrome.runtime.lastError) {
        done(false);
        return;
      }
      // Give the injected listener a moment to register before continuing.
      setTimeout(function () { done(true); }, 40);
    });
  });
}

function isScriptableUrl(url) {
  return /^(https?|file):/i.test(url);
}

function showErrorBadge() {
  try {
    chrome.action.setBadgeText({ text: '!' });
    chrome.action.setBadgeBackgroundColor({ color: '#cc79a7' });
    setTimeout(function () { chrome.action.setBadgeText({ text: '' }); }, 2500);
  } catch (e) {
    // Nothing else to do if the action API itself is unavailable.
  }
}

function saveSession(session, done) {
  chrome.storage.local.get('trim_sessions', function (r) {
    var list = r.trim_sessions || [];
    list.unshift(session);
    if (list.length > MAX_SESSIONS) list = list.slice(0, MAX_SESSIONS);
    chrome.storage.local.set({ trim_sessions: list }, function () {
      if (chrome.runtime.lastError) {
        done({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        done({ ok: true, count: list.length });
      }
    });
  });
}
