# TRIM Browser Extension – v0.72d

## lean.clarus.news · Andreas Binggeli & Ron Hyams · September 2026

Screenshot capture with **multiple alphabetic flags on one image**. Each flag is classified with a complete **Wasteful → Lean Information attribute pair**, one or more **Improvement Suggestions**, an optional comment and, in v0.72d, a visual priority model based on **Urgency, Severity, Minutes Saved, Audience Size and Creation Frequency**.

Single-screen cockpit, no backend, no OCR. Everything remains local in the browser.

---

## What changed in v0.72d

v0.72d is an experimental UI branch based on v0.72. It replaces the original **Important × Urgent** matrix in the cockpit with a compact visual priority model designed for mouse or touchpad use.

### Priority model D

The model has one direct urgency selector and four vertical discrete sliders.

#### Criticality

- **Urgency / Fix in Days**
  - `1`
  - `2–7`
  - `8+`

- **Severity**
  - Trivial
  - Minor
  - Moderate
  - Major
  - Critical

`Criticality*` is explained in the UI as the realistic worst outcome if the flag is not corrected.

#### Efficiency

- **Minutes Saved**
  - `1`
  - `5`
  - `10`
  - `15`
  - `20+`

- **Audience Size**
  - `1`
  - `10`
  - `30`
  - `60`
  - `101+`

#### Cadence

- **Creation Frequency**
  - Once
  - Yearly
  - Quarterly
  - Monthly
  - Weekly
  - Daily

The visual direction is consistent across all four sliders: **higher impact is shown at the top**. Therefore `Daily` is at the top of the frequency slider and `Once` at the bottom.

### Mouse / touchpad operation

The four sliders use discrete positions and can be operated by clicking or dragging with a mouse or touchpad. Keyboard input is not required for normal use.

### Score

v0.72d deliberately does **not** calculate a score yet. `My Score` remains `–`, and the exported `score` value remains `null`.

The scoring formula is planned for v0.73 as the **TPS – TRIM Priority Score**. Separating the slider UI from the scoring formula allows the interaction model to be tested independently from the weighting model.

### Compatibility

The session and popup schema identifiers remain:

- `trim.capture.session/0.7`
- `trim.capture.export/0.7`

v0.72d adds an optional `priority_metrics` object to each marking. Existing consumers should ignore unknown fields if they do not use the new priority model.

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

1. Download or clone the `0.72d` branch.
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
10. **Comment** – add optional context to the selected flag.
11. **My Flags** – click a flag to edit it; click × to delete it.
12. **Finish** – save locally, export JSON, or export an annotated PNG.

Keyboard inside the cockpit:

- `1`–`4`: select the attribute pair for the active flag
- `Delete` / `Backspace`: remove the active flag
- `Esc`: close Help; if Help is already closed, close the cockpit

The v0.72d priority controls are intended to be fully usable with mouse or touchpad; keyboard interaction is not required for the sliders.

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

The schema identifier remains `trim.capture.session/0.7`. v0.72d adds `priority_metrics` as an optional additive object.

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
        "score": null
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
| `score` | `null` in v0.72d |

### Planned v0.73

v0.73 is intended to branch from v0.72d and add the **TPS – TRIM Priority Score**. `Daily` will have the highest frequency influence and `Once` the lowest. The weighting and formula are intentionally kept out of v0.72d so that the slider interaction can be evaluated independently.

---

## Permissions

| Permission | Reason |
|---|---|
| `activeTab`, `tabs` | resolve the active tab, read title/URL and capture the visible tab |
| `scripting` | inject TRIM into an already-open normal page when the extension was freshly loaded/reloaded |
| `<all_urls>` | allow the in-page TRIM selection trigger to request a capture |
| `storage` | save recent sessions locally |
| `contextMenus` | provide the right-click capture action |

There is no `fetch` call and no backend connection in v0.72d.

---

## Known limits

- Only the **visible** part of the tab is captured. Full-page scroll-and-stitch remains out of scope.
- Browser-internal pages such as `chrome://`, the Web Store and some built-in viewers cannot be captured.
- A shortcut conflict at browser/desktop level can prevent Chrome from assigning `Alt+Shift+T`; verify it under `chrome://extensions/shortcuts`.
- Local session storage is capped at 10 sessions and uses compressed JPEG thumbnails.
- No OCR. `selected_text` is only populated when capture starts from an actual browser text selection.
- The slider value sets and labels are provisional and can be adjusted after user testing.
- v0.72d does not calculate TPS; `My Score` intentionally remains empty.

---

## Framework notice

Lean Information framework © **Ron Hyams & Andreas Binggeli** · [lean.clarus.news](https://lean.clarus.news) · CC BY-ND 4.0.

In the extension UI, the `lean.clarus.news` footer link opens in a new browser tab/window.

The four visual attribute cues use colour plus distinct border styles, so colour is not the only means of differentiation.
