# TRIM Changelog

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
