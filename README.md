# TRIM Browser Extension – v0.73_TPS

## lean.clarus.news · Andreas Binggeli & Ron Hyams · September 2026

Screenshot capture with **multiple alphabetic flags on one image**. Each flag is classified with a complete **Wasteful → Lean Information attribute pair**, one or more **Improvement Suggestions**, an optional comment and a **TPS – TRIM Priority Score** based on **Urgency, Severity, Minutes Saved, Audience Size and Creation Frequency**.

Single-screen cockpit, no backend, no OCR. Everything remains local in the browser.

---

## What changed in v0.73_TPS

v0.73_TPS branches from v0.72d and keeps the same mouse/touchpad slider interface. It adds **TPS – TRIM Priority Score**, a transparent experimental scoring model for ordering flagged improvements.

### Inputs

TPS uses all five priority inputs already introduced in v0.72d:

- **Urgency / Fix in Days**: `1`, `2–7`, `8+`
- **Severity**: Trivial, Minor, Moderate, Major, Critical
- **Minutes Saved**: `1`, `5`, `10`, `15`, `20+`
- **Audience Size**: `1`, `10`, `30`, `60`, `101+`
- **Creation Frequency**: Once, Yearly, Quarterly, Monthly, Weekly, Daily

TPS is shown only after all five inputs are selected.

### TPS-1 normalization

| Input | Lowest → highest normalized weight |
|---|---|
| Urgency | `8+ = .25`, `2–7 = .60`, `1 = 1.00` |
| Severity | `.20`, `.40`, `.60`, `.80`, `1.00` |
| Minutes Saved | `.20`, `.40`, `.60`, `.80`, `1.00` |
| Audience Size | `.20`, `.40`, `.60`, `.80`, `1.00` |
| Creation Frequency | `Once=.20`, `Yearly=.30`, `Quarterly=.40`, `Monthly=.60`, `Weekly=.80`, `Daily=1.00` |

`Daily` therefore has the highest cadence influence and `Once` the lowest.

### TPS-1 formula

```text
Criticality =
    0.70 × Severity
  + 0.30 × Urgency

Efficiency =
    sqrt(Minutes Saved × Audience Size)

Impact =
    Efficiency × (0.50 + 0.50 × Creation Frequency)

TPS =
    100 × (
        0.60 × Criticality
      + 0.40 × Impact
    )
```

The result is rounded to one decimal place. Because the lowest normalized input weights are greater than zero, a fully completed flag also has a positive baseline TPS; the upper bound is 100.

### Example

```text
Urgency             2–7 days
Severity            Major
Minutes Saved       15
Audience Size       10
Creation Frequency  Weekly

Criticality         74.0
Efficiency          56.6
Impact              50.9
TPS                 64.8
```

### Behaviour

- The score updates immediately when an urgency value or slider value changes.
- **My Flags** is sorted by TPS from highest to lowest.
- The popup shows `[TPS n.n]` for saved markings.
- Hovering the TPS badge shows Criticality, Efficiency and Impact components.
- JSON export records `score_model: "TPS-1"` and the calculated `score`.
- Markings without all five TPS inputs show `TPS –` and sort below completed TPS markings.

### Compatibility

The session and popup schema identifiers remain:

- `trim.capture.session/0.7`
- `trim.capture.export/0.7`

The score is additive metadata inside `priority_metrics`; existing consumers can ignore it.

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
- The cockpit layout keeps classification, priority and comment above the markup screen; **My Flags** sits beside the screenshot.
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

1. Download or clone the `0.73_TPS` branch.
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
5. **Urgency** – choose `1`, `2–7` or `8+` days.
6. **Severity** – position the slider from Trivial to Critical.
7. **Minutes Saved** – position the slider from 1 to 20+ minutes.
8. **Audience Size** – position the slider from 1 to 101+ affected people.
9. **Creation Frequency** – position the slider from Once to Daily.
10. **TPS** – after all five priority values are set, TRIM calculates the TRIM Priority Score automatically.
11. **Comment** – add optional context to the selected flag.
12. **My Flags** – complete TPS flags are sorted from highest to lowest; click a flag to edit it and × to delete it.
13. **Finish** – save locally, export JSON, or export an annotated PNG.

Keyboard inside the cockpit:

- `1`–`4`: select the attribute pair for the active flag
- `Delete` / `Backspace`: remove the active flag
- `Esc`: close Help; if Help is already closed, close the cockpit

The v0.73_TPS priority controls remain fully usable with mouse or touchpad; keyboard interaction is not required for the sliders.

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

## JSON data model

The schema identifier remains `trim.capture.session/0.7`. v0.73_TPS keeps `priority_metrics` and adds the calculated TPS score.

```json
{
  "schema": "trim.capture.session/0.7",
  "captured_at": "2026-09-30T10:30:00.000Z",
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
        "Verified"
      ],
      "solutions": [
        "Verified"
      ],
      "solution": "Verified",
      "priority": null,
      "priority_position": null,
      "priority_metrics": {
        "urgency": "2-7",
        "severity": "major",
        "minutes_saved": "15",
        "audience_size": "10",
        "creation_frequency": "weekly",
        "score_model": "TPS-1",
        "score": 64.8
      },
      "attribute_string": "Incorrect → Correct: Verified",
      "comment": "Wrong word",
      "note": "Wrong word"
    }
  ]
}
```

### Priority metrics

| Field | Values |
|---|---|
| `urgency` | `"1"`, `"2-7"`, `"8+"` |
| `severity` | `"trivial"`, `"minor"`, `"moderate"`, `"major"`, `"critical"` |
| `minutes_saved` | `"1"`, `"5"`, `"10"`, `"15"`, `"20+"` |
| `audience_size` | `"1"`, `"10"`, `"30"`, `"60"`, `"101+"` |
| `creation_frequency` | `"once"`, `"yearly"`, `"quarterly"`, `"monthly"`, `"weekly"`, `"daily"` |
| `score_model` | `"TPS-1"` |
| `score` | TPS rounded to one decimal; `null` until all five inputs are set |

### TPS data semantics

The slider labels remain the canonical semantic values stored in JSON. The normalized weights are an implementation detail of scoring model `TPS-1`. This keeps the original user selections available if the weighting is revised later.


---

## Permissions

| Permission | Reason |
|---|---|
| `activeTab`, `tabs` | resolve the active tab, read title/URL and capture the visible tab |
| `scripting` | inject TRIM into an already-open normal page when the extension was freshly loaded/reloaded |
| `<all_urls>` | allow the in-page TRIM selection trigger to request a capture |
| `storage` | save recent sessions locally |
| `contextMenus` | provide the right-click capture action |

There is no `fetch` call and no backend connection in v0.73_TPS.

---

## Known limits

- Only the **visible** part of the tab is captured. Full-page scroll-and-stitch remains out of scope.
- Browser-internal pages such as `chrome://`, the Web Store and some built-in viewers cannot be captured.
- A shortcut conflict at browser/desktop level can prevent Chrome from assigning `Alt+Shift+T`; verify it under `chrome://extensions/shortcuts`.
- Local session storage is capped at 10 sessions and uses compressed JPEG thumbnails.
- No OCR. `selected_text` is only populated when capture starts from an actual browser text selection.
- The slider value sets and labels remain provisional and can be adjusted after user testing.
- TPS-1 weights and formula are experimental and should be validated with real user cases before being treated as a final prioritization model.

---

## Framework notice

Lean Information framework © **Ron Hyams & Andreas Binggeli** · [lean.clarus.news](https://lean.clarus.news) · CC BY-ND 4.0.

In the extension UI, the `lean.clarus.news` footer link opens in a new browser tab/window.

The four visual attribute cues use colour plus distinct border styles, so colour is not the only means of differentiation.
