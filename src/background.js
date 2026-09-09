// ============================================================
// TRIM v0.7 – Background Service Worker
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
  console.log('[TRIM] v0.7 installed – local only, no backend.');
});

chrome.commands.onCommand.addListener(function (command, tab) {
  if (command === 'trim-capture') startCapture(tab);
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === 'trim-capture') startCapture(tab);
});

// The popup and the in-page trigger button both route through here.
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.type === 'TRIM_REQUEST_CAPTURE') {
    var tabId = (sender.tab && sender.tab.id) || msg.tabId;
    capture(tabId, function (res) { sendResponse(res); });
    return true;
  }
  if (msg.type === 'TRIM_START') {
    // Popup asked for a capture on the active tab.
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) startCapture(tabs[0]);
      sendResponse({ ok: true });
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

function capture(tabId, done) {
  var opts = { format: 'png' };
  try {
    chrome.tabs.captureVisibleTab(null, opts, function (dataUrl) {
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
  if (!tab || !tab.id) return;
  // Tell the content script to hide any of its own UI, then capture, then open.
  chrome.tabs.sendMessage(tab.id, { type: 'TRIM_PREPARE' }, function () {
    if (chrome.runtime.lastError) {
      // No content script on this page (chrome://, web store, PDF viewer…).
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#cc79a7' });
      setTimeout(function () { chrome.action.setBadgeText({ text: '' }); }, 2500);
      return;
    }
    setTimeout(function () {
      capture(tab.id, function (res) {
        if (!res.ok) return;
        chrome.tabs.sendMessage(tab.id, {
          type: 'TRIM_OPEN',
          dataUrl: res.dataUrl,
          page: { url: tab.url || '', title: tab.title || '' }
        });
      });
    }, 90);
  });
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
