# TRIM Browser Extension – v0.71

## lean.clarus.news · Andreas Binggeli & Ron Hyams · September 2026

Screenshot capture with **multiple alphabetic flags on one image**. Each flag is classified with a complete **Wasteful → Lean Information attribute pair**, one or more **Improvement Suggestions**, an optional comment and an **Important × Urgent** priority.

Single-screen cockpit, no backend, no OCR. Everything remains local in the browser.

---

## What changed in v0.71

v0.71 is a maintenance release of v0.7. It records and packages two corrections found during testing:

1. **`Alt+Shift+T` capture shortcut fixed and made more robust**
   - The background service worker now resolves the active tab explicitly instead of relying on the optional tab argument from `chrome.commands`.
   - When TRIM has just been loaded or reloaded and an already-open page has not yet received the content script, TRIM injects `model.js` and `content.js` into that tab before starting the capture.
   - An in-page `Alt+Shift+T` fallback is also registered. If Chrome does not route the command through the extension but the keystroke reaches the page, TRIM can still start.
   - If the shortcut still does not react, check `chrome://extensions/shortcuts`: Chrome can leave a suggested shortcut unassigned when it conflicts with another extension or desktop shortcut.
   - Protected browser pages such as `chrome://...` and the Chrome Web Store cannot be captured by content scripts.

2. **Framework footer attribution updated**
   - The cockpit and popup footer now credit **Ron Hyams & Andreas Binggeli**.
   - `lean.clarus.news` is displayed as a clickable link to `https://lean.clarus.news`.
   - The link uses `target="_blank"` with `rel="noopener noreferrer"`, so it opens in a new browser tab/window without giving the opened page access to the opener.

There is **no change to the v0.7 session data structure**. For compatibility, session JSON remains `trim.capture.session/0.7` and popup export JSON remains `trim.capture.export/0.7`.

See also [`CHANGELOG.md`](CHANGELOG.md).

---

## Functional changes introduced in v0.7

- Correct Lean Information data model: the four complete attribute pairs are explicit:
  1. **Meaningless → Relevant**
  2. **Ambiguous → Specific**
  3. **Incorrect → Correct**
  4. **Incomplete → Complete**
- Improvement Suggestions are stored separately from the attribute pair.
- Attribute strings read, for example: `Incorrect → Correct: Verified`.
- The cockpit layout is closer to the v0.5 design draft: classification, priority and comment are above the markup screen; **My Flags** sits beside the screenshot.
- Markup labels and My Flags show alphabetic flag codes (`A`, `B`, `C`, …) plus the numbered attribute pair.
- Priority is selected on an **Important × Urgent** matrix. The UI derives `High`, `Medium` or `Low` for sorting and compact display.
- `Task / session context` was removed from the cockpit and from new JSON payloads.
- Added **Vocabulary & Help** with the core TRIM terms.
- Added the header question **“Can you save people time?”**.
- Session payload schema: `trim.capture.session/0.7`.
- Popup export schema: `trim.capture.export/0.7`.
- v0.6 compatibility aliases (`solutions`, `solution`, `note`) are still included in each marking so existing consumers do not break immediately.

---

## File structure

```text
trimV_071/
├── manifest.json
├── CHANGELOG.md
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md
└── src/
    ├── model.js
    ├── background.js
    ├── content.js
    ├── content.css
    ├── popup.html
    └── popup.js
```

---

## Install in Chrome / Edge / Brave

1. Unzip `trimV_071.zip`.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Remove/disable an older unpacked TRIM version, or click **Reload** after replacing its files.
5. Click **Load unpacked** and select the `trimV_071` folder.
6. Open `chrome://extensions/shortcuts` and verify that **TRIM – Lean Information Capture** is assigned to `Alt+Shift+T`.
7. Reload an already-open normal webpage once when testing a freshly installed unpacked extension. v0.71 can also inject its content script into an already-open page when required.

---

## Workflow

1. **Capture** – use `Alt+Shift+T`, the toolbar popup's Capture button, the context menu, or select text and click **⚑ TRIM**.
   - **v0.71 correction:** the keyboard shortcut explicitly resolves the active tab and injects the TRIM content script into already-open pages when needed.
   - Chrome may leave a suggested shortcut unassigned if it conflicts with another extension or desktop shortcut. Check `chrome://extensions/shortcuts` if `Alt+Shift+T` does not react.
   - Chrome internal pages such as `chrome://...` cannot be captured.
2. **Flag** – drag one or more rectangles on the screenshot. Flags are labelled `A`, `B`, `C`, ….
3. **Opportunity** – select the best numbered Wasteful → Lean pair with the mouse or keys `1`–`4`.
4. **Improvement** – select one or more Improvement Suggestions belonging to that pair.
5. **Priority** – click in the Important × Urgent matrix. The resulting High/Medium/Low class is used to order My Flags.
6. **Comment** – add optional context to the selected flag.
7. **My Flags** – click a flag to edit it; click × to delete it.
8. **Finish** – save locally, export JSON, or export an annotated PNG.

Keyboard inside the cockpit:

- `1`–`4`: select the attribute pair for the active flag
- `Delete` / `Backspace`: remove the active flag
- `Esc`: close Help; if Help is already closed, close the cockpit
- Arrow keys while the priority matrix has focus: move its priority point

---

## Lean Information model

| # | Wasteful | Lean | Improvement Suggestions |
|---|---|---|---|
| 1 | Meaningless | Relevant | Needed, Plain |
| 2 | Ambiguous | Specific | Named, Structured, Designed |
| 3 | Incorrect | Correct | Verified, Governed |
| 4 | Incomplete | Complete | Inclusive, Contextualized, Transferable |

The complete attribute pair and Improvement Suggestions are intentionally separate. For example:

```text
Attribute pair: Incorrect → Correct
Improvement Suggestions: Verified
Attribute String: Incorrect → Correct: Verified
```

---

## JSON data model (v0.7 schema, unchanged in v0.71)

```json
{
  "schema": "trim.capture.session/0.7",
  "captured_at": "2026-09-10T10:00:00.000Z",
  "session_duration_sec": 80,
  "source": {
    "page_url": "https://example.org/page",
    "page_title": "Example page",
    "capture": {
      "w": 1920,
      "h": 1080,
      "device_pixel_ratio": 1
    }
  },
  "markings": [
    {
      "index": 1,
      "raw_index": 1,
      "flag_code": "A",
      "rect_relative": { "x": 0.12, "y": 0.33, "w": 0.21, "h": 0.05 },
      "rect_pixels": { "x": 230, "y": 356, "w": 403, "h": 54 },
      "selected_text": null,
      "wasteful_attribute": "incorrect",
      "lean_attribute": "correct",
      "attribute_pair": "Incorrect → Correct",
      "improvement_suggestions": ["Verified"],
      "solutions": ["Verified"],
      "solution": "Verified",
      "priority": "high",
      "priority_position": {
        "important": 0.82,
        "urgent": 0.73
      },
      "attribute_string": "Incorrect → Correct: Verified",
      "comment": "Wrong word",
      "note": "Wrong word"
    }
  ]
}
```

### Priority mapping

The matrix stores the two normalized values `important` and `urgent` from `0` to `1`.
For compact display and sorting, TRIM derives:

- **High** when `important + urgent >= 1.35`
- **Medium** when the sum is `>= 0.75`
- **Low** below `0.75`

The raw two-dimensional position is always retained in JSON, so this mapping can be changed later without losing the user's original priority choice.

---

## Permissions

| Permission | Reason |
|---|---|
| `activeTab`, `tabs` | resolve the active tab, read title/URL and capture the visible tab |
| `scripting` | inject TRIM into an already-open normal page when the extension was freshly loaded/reloaded |
| `<all_urls>` | allow the in-page TRIM selection trigger to request a capture |
| `storage` | save recent sessions locally |
| `contextMenus` | provide the right-click capture action |

There is no `fetch` call and no backend connection in v0.71.

---

## Known limits

- Only the **visible** part of the tab is captured. Full-page scroll-and-stitch remains out of scope.
- Browser-internal pages such as `chrome://`, the Web Store and some built-in viewers cannot be captured.
- A shortcut conflict at browser/desktop level can prevent Chrome from assigning `Alt+Shift+T`; verify it under `chrome://extensions/shortcuts`.
- Local session storage is capped at 10 sessions and uses compressed JPEG thumbnails.
- No OCR. `selected_text` is only populated when capture starts from an actual browser text selection.
- The High/Medium/Low mapping from the priority matrix is provisional and can be adjusted after user testing.

---

## Framework notice

Lean Information framework © **Ron Hyams & Andreas Binggeli** · [lean.clarus.news](https://lean.clarus.news) · CC BY-ND 4.0.

In the extension UI, the `lean.clarus.news` footer link opens in a new browser tab/window.

The four visual attribute cues use colour plus distinct border styles, so colour is not the only means of differentiation.
