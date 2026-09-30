# TRIM Changelog

## v0.72d — 30 September 2026

Experimental visual-priority branch based on v0.72.

### Added

- **Urgency / Fix in Days**
  - 1 day
  - 2–7 days
  - 8+ days

- **Four vertical discrete sliders**
  - Severity
  - Minutes Saved
  - Audience Size
  - Creation Frequency

- **Severity values**
  - Trivial
  - Minor
  - Moderate
  - Major
  - Critical

- **Minutes Saved values**
  - 1
  - 5
  - 10
  - 15
  - 20+

- **Audience Size values**
  - 1
  - 10
  - 30
  - 60
  - 101+

- **Creation Frequency values**
  - Once
  - Yearly
  - Quarterly
  - Monthly
  - Weekly
  - Daily

### Interaction

- The four sliders can be operated by clicking or dragging with a mouse or touchpad.
- Keyboard input is not required for normal slider use.
- Slider positions are discrete and snap to the defined values.
- Higher-impact values are visually positioned at the top.
- `Daily` is therefore at the top of Creation Frequency and `Once` at the bottom.

### Score

- The cockpit includes a `My Score` display.
- v0.72d deliberately leaves the value unset (`–`).
- The exported `score` remains `null`.
- The **TPS – TRIM Priority Score** formula is planned for v0.73.

### Changed

- The v0.72 Important × Urgent priority matrix is replaced in the cockpit by the v0.72d visual priority controls.
- Priority help text now describes Urgency, Severity, Minutes Saved, Audience Size and Creation Frequency.
- German and English UI texts were extended for the new model.
- Extension manifest version is `0.72.4`.
- Display version is `0.72d`.

### Data model

Each marking can contain:

```json
"priority_metrics": {
  "urgency": "2-7",
  "severity": "major",
  "minutes_saved": "15",
  "audience_size": "10",
  "creation_frequency": "weekly",
  "score": null
}
```

### Compatibility

- Session schema identifier remains `trim.capture.session/0.7`.
- Popup export schema identifier remains `trim.capture.export/0.7`.
- Existing `priority` and `priority_position` fields remain available for compatibility.
- `priority_metrics` is an additive field introduced by v0.72d.

### Next step

v0.73 is planned to branch from v0.72d and implement **TPS – TRIM Priority Score**. Creation Frequency will weight `Daily` highest and `Once` lowest.

---

## v0.72 — 11 September 2026

Maintenance release based on v0.7.

### Changed

- **German UI localization**
  - The cockpit and popup now show translated German labels, guidance, help text, and footer copy when DE is selected.
  - Pair labels and suggestion chips in the German view are localized, while the stored JSON values remain canonical.

### Compatibility

- No data-model change from v0.7.
- Session schema remains `trim.capture.session/0.7`.
- Popup export schema remains `trim.capture.export/0.7`.

---

## v0.71 — 10 September 2026

Maintenance release based on v0.7.

### Fixed

- **Keyboard capture shortcut (`Alt+Shift+T`)**
  - Resolve the active tab explicitly in the Manifest V3 background service worker.
  - If the content script is missing on an already-open page after install/reload, inject `src/model.js` and `src/content.js` and retry.
  - Add an in-page `Alt+Shift+T` fallback when the keystroke reaches the page.
  - Show a temporary `!` action badge when capture cannot start on a protected/unsupported page.

### Changed

- **Footer attribution**
  - Credit now reads: `Lean Information framework © Ron Hyams & Andreas Binggeli`.
  - Add `lead.clarus.news` as a clickable link to `https://lead.clarus.news`.
  - The link opens in a new browser tab/window via `target="_blank"` and uses `rel="noopener noreferrer"`.
  - Applied to both the TRIM cockpit footer and the extension popup footer.

### Compatibility

- No data-model change from v0.7.
- Session schema remains `trim.capture.session/0.7`.
- Popup export schema remains `trim.capture.export/0.7`.

---

## v0.7 — 9 September 2026

- Separate complete Wasteful → Lean Information attribute pairs from Improvement Suggestions.
- Alphabetic flags A, B, C, … and improved My Flags overview.
- Important × Urgent priority matrix.
- Vocabulary & Help.
- Removed Task / session context.
- Updated cockpit layout and v0.7 JSON schema.
