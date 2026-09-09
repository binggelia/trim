# TRIM – Lean Information Capture

**Current public version: v0.7**  
**First prototype: v0.1**  
Project website: https://lean.clarus.news  
Repository: https://github.com/binggelia/trim

TRIM is a browser extension for structured Lean Information capture. It lets users capture the visible browser tab, place multiple alphabetic flags on the screenshot, classify each flag with a complete **Wasteful → Lean Information** attribute pair, add one or more **Improvement Suggestions**, add an optional comment, and assign an **Important × Urgent** priority.

TRIM is a **subproject of Lean Information**. It provides a practical browser-based implementation of the Lean Information framework and is intended to help people identify information waste and make information more relevant, specific, correct and complete.

The current v0.7 cockpit works fully locally in the browser: **no backend, no fetch calls and no OCR**.

---

## Version status

### v0.1 – first prototype

Version 0.1 is retained as the original prototype milestone. It demonstrated the basic idea of browser-based Lean Information capture.

### v0.7 – current public implementation

Version 0.7 expands the prototype into a single-screen cockpit with multiple flags, explicit attribute pairs, separate improvement suggestions, prioritisation, local session storage and export.

---

## What changed since v0.6

- The four complete Lean Information attribute pairs are explicit:
  1. **Meaningless → Relevant**
  2. **Ambiguous → Specific**
  3. **Incorrect → Correct**
  4. **Incomplete → Complete**
- Improvement Suggestions are stored separately from the attribute pair.
- Attribute strings now read, for example: `Incorrect → Correct: Verified`.
- The cockpit layout groups classification, priority and comment above the markup screen.
- **My Flags** sits beside the screenshot.
- Markup labels and My Flags use alphabetic flag codes (`A`, `B`, `C`, …).
- Priority is selected on an **Important × Urgent** matrix.
- The UI derives `High`, `Medium` or `Low` for sorting and compact display.
- `Task / session context` was removed from new v0.7 payloads.
- **Vocabulary & Help** was added with the core TRIM terms.
- The header question **“Can you save people time?”** was added.
- Session payload schema: `trim.capture.session/0.7`.
- Popup export schema: `trim.capture.export/0.7`.
- v0.6 compatibility aliases (`solutions`, `solution`, `note`) are still included in each marking for transitional compatibility.

---

## Core workflow

1. **Capture** – use `Alt+Shift+T`, the toolbar button, the context menu, or select text and click **⚑ TRIM**.
2. **Flag** – drag one or more rectangles on the screenshot. Flags are labelled `A`, `B`, `C`, ….
3. **Opportunity** – select the best numbered Wasteful → Lean pair with the mouse or keys `1`–`4`.
4. **Improvement** – select one or more Improvement Suggestions belonging to that pair.
5. **Priority** – click in the Important × Urgent matrix. The resulting High/Medium/Low class is used to order My Flags.
6. **Comment** – add optional context to the selected flag.
7. **My Flags** – click a flag to edit it; click × to delete it.
8. **Finish** – save locally, export JSON, or export an annotated PNG.

### Keyboard shortcuts inside the cockpit

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

The complete attribute pair and the Improvement Suggestions are intentionally separate.

Example:

```text
Attribute pair: Incorrect → Correct
Improvement Suggestions: Verified
Attribute String: Incorrect → Correct: Verified
```

---

## File structure

```text
trimV_07/
├── manifest.json
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

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `trimV_07` folder
5. Optional: open `chrome://extensions/shortcuts` to change `Alt+Shift+T`

If an older unpacked TRIM version is already loaded, remove or disable it first to avoid duplicate toolbar buttons.

---

## v0.7 JSON data model

Example:

```json
{
  "schema": "trim.capture.session/0.7",
  "captured_at": "2026-09-09T06:15:00.000Z",
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

The matrix stores normalized `important` and `urgent` values from `0` to `1`.

For compact display and sorting, v0.7 derives:

- **High** when `important + urgent >= 1.35`
- **Medium** when the sum is `>= 0.75`
- **Low** below `0.75`

The raw two-dimensional position remains in the JSON.

---

## Permissions

| Permission | Reason |
|---|---|
| `activeTab`, `tabs` | Read the active tab title/URL and capture the visible tab |
| `<all_urls>` | Allow the in-page TRIM selection trigger to request a capture |
| `storage` | Save recent sessions locally |
| `contextMenus` | Provide the right-click capture action |

There is no backend connection and no `fetch` call in v0.7.

---

## Privacy and local processing

TRIM v0.7 is designed as a local browser workflow:

- screenshots and session data stay in the browser unless the user explicitly exports them;
- no OCR is performed;
- no backend is contacted;
- recent sessions are stored locally;
- JSON and annotated PNG exports are created on demand.

---

## Known limits

- Only the **visible** part of the active tab is captured.
- Full-page scroll-and-stitch is currently out of scope.
- Browser-internal pages such as `chrome://`, the Web Store and some built-in viewers cannot be captured.
- Local session storage is capped at 10 sessions and uses compressed JPEG thumbnails.
- No OCR. `selected_text` is only populated when capture starts from a real browser text selection.
- The High/Medium/Low mapping from the priority matrix is provisional and may be adjusted after user testing.

---

## Project relationship

TRIM is a **subproject of Lean Information** and uses the Lean Information framework developed by Ron Hyams.

More information:

- TRIM / Lean Information project site: https://lean.clarus.news
- Lean Information: https://www.leaninformation.com/
- clarus.news: https://clarus.news
- GitHub: https://github.com/binggelia/trim

---

## License

TRIM source code and documentation are licensed under the **Creative Commons Attribution-NoDerivatives 4.0 International License (CC BY-ND 4.0)**.

See [`LICENSE`](LICENSE).

Lean Information framework and taxonomy © Ron Hyams / LeanInformation.com.  
TRIM implementation © 2026 Andreas Binggeli / clarus.news.

> Note: CC BY-ND 4.0 allows redistribution with attribution, but modified versions may not be distributed.

---

## Status

TRIM v0.7 is an early public implementation. Interfaces, schemas and UI details may still change during testing.