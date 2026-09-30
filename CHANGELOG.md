# TRIM Changelog

## v0.72b — 30 September 2026

Experimental priority-model branch based on v0.72.

### Added

- **Rating display**
  - The existing Important × Urgent matrix is retained.
  - The derived `High`, `Medium` or `Low` class is explicitly shown as the flag's **Rating**.

- **Fix in Days**
  - Added a separate target time horizon for each flag.
  - Available choices:
    - `1` day
    - `2–7` days
    - `8+` days
  - The selected value is stored with the flag and exported as `fix_in_days`.

### Changed

- Priority help text now explains both the derived Rating and the Fix-in-Days horizon.
- German and English UI texts were extended for the new priority controls.
- Extension manifest version is `0.72.2`, with display version `0.72b`.

### Compatibility

- Session schema identifier remains `trim.capture.session/0.7`.
- Popup export schema identifier remains `trim.capture.export/0.7`.
- Existing priority fields remain unchanged:
  - `priority`
  - `priority_position.important`
  - `priority_position.urgent`
- `fix_in_days` is an additive field introduced by v0.72b.

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

## v0.7 — 9 September 2026

- Separate complete Wasteful → Lean Information attribute pairs from Improvement Suggestions.
- Alphabetic flags A, B, C, … and improved My Flags overview.
- Important × Urgent priority matrix.
- Vocabulary & Help.
- Removed Task / session context.
- Updated cockpit layout and v0.7 JSON schema.
