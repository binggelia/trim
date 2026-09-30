# TRIM Changelog

## v0.72c — 30 September 2026

Experimental scoring-model branch based on v0.72.

### Added

- **Criticality**
  - Urgency / Fix in Days
  - Severity: Low, Medium, High or Critical

- **Efficiency**
  - Minutes Saved
  - Audience Size

- **Cadence**
  - Creation Frequency: Once, Yearly, Monthly, Weekly or Daily

- **Numerical Score**
  - TRIM calculates a score from Criticality, Efficiency and Cadence.
  - The score updates when one of the scoring inputs changes.

### Score model

The current experimental formula combines:

- inverse urgency based on Fix in Days
- severity weight
- logarithmic Minutes Saved
- logarithmic Audience Size
- creation-frequency weight

Severity weights:

- Low = 1
- Medium = 2
- High = 3
- Critical = 4

Creation Frequency weights:

- Once = 1
- Yearly = 2
- Monthly = 3
- Weekly = 4
- Daily = 5

Current calculation:

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

The score is rounded to one decimal place.

The formula is intentionally provisional and intended for user testing.

### Changed

- The v0.72 Important × Urgent matrix is replaced in the cockpit by the v0.72c scoring controls.
- Priority help text now describes Criticality, Efficiency and Cadence.
- German and English UI texts were extended for the new scoring model.
- Extension manifest version is `0.72.3`.
- Display version is `0.72c`.

### Data model

Each marking can contain:

```json
"priority_metrics": {
  "urgency_days": 2,
  "severity": "high",
  "minutes_saved": 15,
  "audience_size": 50,
  "creation_frequency": "daily",
  "score": 18.9
}
```

### Compatibility

- Session schema identifier remains `trim.capture.session/0.7`.
- Popup export schema identifier remains `trim.capture.export/0.7`.
- Existing fields remain available for compatibility.
- `priority_metrics` is an additive field introduced by v0.72c.

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
