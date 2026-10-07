# TRIM Browser Extension – v0.74c

## lean.clarus.news · Andreas Binggeli & Ron Hyams · September 2026

Screenshot capture with **multiple alphabetic flags on one image**. Each flag is classified with a complete **Wasteful → Lean Information attribute pair**, one or more **Improvement Suggestions**, an optional comment and, in v0.74c, an experimental priority score based on **Criticality**, **Efficiency** and **Cadence**.

Single-screen cockpit, no backend, no OCR. Everything remains local in the browser.

---

## What changed in v0.72c

v0.72c is an experimental branch based on v0.72. It replaces the original **Important × Urgent** priority matrix in the cockpit with a structured scoring model.

### Priority model C

The priority of a flag is described using five input dimensions.

#### Criticality

- **Urgency / Fix in Days** – how quickly the issue should be addressed.
- **Severity** – Low, Medium, High or Critical.

#### Efficiency

- **Minutes Saved** – estimated time saved by improving the flagged information.
- **Audience Size** – estimated number of people affected by the improvement.

#### Cadence

- **Creation Frequency** – Once, Yearly, Monthly, Weekly or Daily.

TRIM calculates a numerical **Score** from these values.

v0.72c keeps all other v0.72 functionality, including German localization, classification, comments, local session storage and export.

### Compatibility

The session and popup schema identifiers remain:

- `trim.capture.session/0.7`
- `trim.capture.export/0.7`

v0.72c adds the optional `priority_metrics` object to each marking. Existing consumers should ignore unknown fields if they do not use the scoring model.

See also [`CHANGELOG.md`](CHANGELOG.md).

---

## What changed in v0.74c

v0.74c is based on the keyboard-oriented v0.72c branch and aligns the Lean Information wording with the updated attribute reference:

- Table heading: **Improvement Suggestions for its Audience**
- **Incorrect → Correct**
  - Guidance: `Ensure it is authentic and governed.`
  - Suggestions: `Authentic`, `Governed`
- **Incomplete → Complete**
  - Guidance: `Keep it inclusive and contextualized.`
  - Suggestions: `Inclusive`, `Contextualized`
  - `Transferable` is removed
- Meaningless → Relevant and Ambiguous → Specific remain unchanged.
- German UI equivalents were updated while canonical JSON values remain English.

---

## Functional changes introduced in v0.7

- Correct Lean Information data model: the four complete attribute pairs are explicit:
  1. **Meaningless → Relevant**
  2. **Ambiguous → Specific**
  3. **Incorrect → Correct**
  4. **Incomplete → Complete**
- Improvement Suggestions are stored separately from the attribute pair.
- Attribute strings read, for example: `Incorrect → Correct: Authentic`.
- The cockpit layout is closer to the v0.5 design draft: classification, priority and comment are above the markup screen; **My Flags** sits beside the screenshot.
- Markup labels and My Flags show alphabetic flag codes (`A`, `B`, `C`, …) plus the numbered attribute pair.
- `Task / session context` was removed from the cockpit and from new JSON payloads.
- Added **Vocabulary & Help** with the core TRIM terms.
- Added the header question **“Can you save people time?”**.
- Session payload schema: `trim.capture.session/0.7`.
- Popup export schema: `trim.capture.export/0.7`.
- v0.6 compatibility aliases (`solutions`, `solution`, `note`) are still included in each marking so existing consumers do not break immediately.

---

## File structure

```text
trim/
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

1. Download or clone the `0.74c` branch.
2. Open `chrome://extensions`.
3. Enable **Developer mode**.
4. Remove/disable an older unpacked TRIM version, or click **Reload** after replacing its files.
5. Click **Load unpacked** and select the TRIM project folder.
6. Open `chrome://extensions/shortcuts` and verify that **TRIM – Lean Information Capture** is assigned to `Alt+Shift+T`.
7. Reload an already-open normal webpage once when testing a freshly installed unpacked extension.

---

## Workflow

1. **Capture** – use `Alt+Shift+T`, the toolbar popup's Capture button, the context menu, or select text and click **⚑ TRIM**.
2. **Flag** – drag one or more rectangles on the screenshot. Flags are labelled `A`, `B`, `C`, ….
3. **Opportunity** – select the best numbered Wasteful → Lean pair with the mouse or keys `1`–`4`.
4. **Improvement** – select one or more Improvement Suggestions belonging to that pair.
5. **Priority** – enter the Criticality, Efficiency and Cadence values for the selected flag.
6. **Score** – TRIM calculates a numerical score from Urgency, Severity, Minutes Saved, Audience Size and Creation Frequency.
7. **Comment** – add optional context to the selected flag.
8. **My Flags** – click a flag to edit it; click × to delete it.
9. **Finish** – save locally, export JSON, or export an annotated PNG.

Keyboard inside the cockpit:

- `1`–`4`: select the attribute pair for the active flag
- `Delete` / `Backspace`: remove the active flag
- `Esc`: close Help; if Help is already closed, close the cockpit

---

## Lean Information model

| # | Wasteful | Lean | Improvement Suggestions for its Audience |
|---|---|---|---|
| 1 | Meaningless | Relevant | Needed, Plain |
| 2 | Ambiguous | Specific | Named, Structured, Designed |
| 3 | Incorrect | Correct | Authentic, Governed |
| 4 | Incomplete | Complete | Inclusive, Contextualized |

The complete attribute pair and Improvement Suggestions are intentionally separate. For example:

```text
Attribute pair: Incorrect → Correct
Improvement Suggestions: Authentic
Attribute String: Incorrect → Correct: Authentic
```

---

## JSON data model

The schema identifier remains `trim.capture.session/0.7`. v0.74c retains the optional `priority_metrics` object from v0.72c.

```json
{
  "schema": "trim.capture.session/0.7",
  "captured_at": "2026-09-30T08:00:00.000Z",
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
      "rect_relative": {
        "x": 0.12,
        "y": 0.33,
        "w": 0.21,
        "h": 0.05
      },
      "rect_pixels": {
        "x": 230,
        "y": 356,
        "w": 403,
        "h": 54
      },
      "selected_text": null,
      "wasteful_attribute": "incorrect",
      "lean_attribute": "correct",
      "attribute_pair": "Incorrect → Correct",
      "improvement_suggestions": [
        "Authentic"
      ],
      "solutions": [
        "Authentic"
      ],
      "solution": "Authentic",
      "priority": null,
      "priority_position": null,
      "priority_metrics": {
        "urgency_days": 2,
        "severity": "high",
        "minutes_saved": 15,
        "audience_size": 50,
        "creation_frequency": "daily",
        "score": 18.9
      },
      "attribute_string": "Incorrect → Correct: Authentic",
      "comment": "Wrong word",
      "note": "Wrong word"
    }
  ]
}
```

---

## Scoring model

v0.72c uses a transparent experimental score derived from five inputs.

### Severity weights

- Low = `1`
- Medium = `2`
- High = `3`
- Critical = `4`

### Creation-frequency weights

- Once = `1`
- Yearly = `2`
- Monthly = `3`
- Weekly = `4`
- Daily = `5`

### Score calculation

The current implementation calculates:

```text
urgency_score = max(1, 10 / urgency_days)

efficiency_score =
    log10(1 + minutes_saved)
  + log10(1 + audience_size)

score =
    urgency_score
  + (severity_weight × 2)
  + efficiency_score
  + frequency_weight
```

The final value is rounded to one decimal place.

Example:

```text
Urgency / Fix in Days = 2
Severity               = High
Minutes Saved          = 15
Audience Size          = 50
Creation Frequency     = Daily

Score = 18.9
```

The scoring model is intentionally experimental. Its purpose is to make the priority decision transparent and testable rather than to establish a final universal weighting.

---

## Permissions

| Permission | Reason |
|---|---|
| `activeTab`, `tabs` | resolve the active tab, read title/URL and capture the visible tab |
| `scripting` | inject TRIM into an already-open normal page when the extension was freshly loaded/reloaded |
| `<all_urls>` | allow the in-page TRIM selection trigger to request a capture |
| `storage` | save recent sessions locally |
| `contextMenus` | provide the right-click capture action |

There is no `fetch` call and no backend connection in v0.74c.

---

## Known limits

- Only the **visible** part of the tab is captured. Full-page scroll-and-stitch remains out of scope.
- Browser-internal pages such as `chrome://`, the Web Store and some built-in viewers cannot be captured.
- A shortcut conflict at browser/desktop level can prevent Chrome from assigning `Alt+Shift+T`; verify it under `chrome://extensions/shortcuts`.
- Local session storage is capped at 10 sessions and uses compressed JPEG thumbnails.
- No OCR. `selected_text` is only populated when capture starts from an actual browser text selection.
- The v0.72c scoring weights and formula are provisional and can be adjusted after user testing.

---

## Framework notice

Lean Information framework © **Ron Hyams & Andreas Binggeli** · [lean.clarus.news](https://lean.clarus.news) · CC BY-ND 4.0.

In the extension UI, the `lean.clarus.news` footer link opens in a new browser tab/window.

The four visual attribute cues use colour plus distinct border styles, so colour is not the only means of differentiation.
