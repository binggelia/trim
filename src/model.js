// ============================================================
// TRIM v0.7 – Shared model
// Lean Information framework (c) Ron Hyams / leaninformation.com
// CC BY-ND 4.0 – attribute names and pairings are used verbatim.
// Loaded by content script, service worker (importScripts) and popup.
// ============================================================

var TRIM_PAIRS = [
  {
    id: 'meaningless', number: 1,
    wasteful: 'Meaningless', lean: 'Relevant', label: 'Meaningless',
    color: '#0072b2', style: 'solid',
    guidance: 'Define the information needed and keep it plain.',
    suggestions: ['Needed', 'Plain']
  },
  {
    id: 'ambiguous', number: 2,
    wasteful: 'Ambiguous', lean: 'Specific', label: 'Ambiguous',
    color: '#e69f00', style: 'dashed',
    guidance: 'Ensure it is well named, structured, and designed.',
    suggestions: ['Named', 'Structured', 'Designed']
  },
  {
    id: 'incorrect', number: 3,
    wasteful: 'Incorrect', lean: 'Correct', label: 'Incorrect',
    color: '#cc79a7', style: 'double',
    guidance: 'Ensure it is well verified and governed.',
    suggestions: ['Verified', 'Governed']
  },
  {
    id: 'incomplete', number: 4,
    wasteful: 'Incomplete', lean: 'Complete', label: 'Incomplete',
    color: '#009e73', style: 'dotted',
    guidance: 'Make it inclusive, contextualized, and transferable.',
    suggestions: ['Inclusive', 'Contextualized', 'Transferable']
  }
];

// Compatibility alias for v0.6 code/data terminology.
TRIM_PAIRS.forEach(function (p) { p.solutions = p.suggestions; });

function trimPair(id) {
  for (var i = 0; i < TRIM_PAIRS.length; i++) {
    if (TRIM_PAIRS[i].id === id) return TRIM_PAIRS[i];
  }
  return null;
}

function trimPairText(pair) {
  return pair ? pair.wasteful + ' \u2192 ' + pair.lean : '';
}

var TRIM_I18N = {
  de: {
    cockpit: 'TRIM Cockpit', capture: 'Neu aufnehmen', close: 'Schliessen',
    canSaveTime: 'Kannst du Menschen Zeit sparen?', vocabHelp: 'Begriffe & Hilfe',
    marking: 'Markierung', markings: 'Markierungen', open: 'offen',
    partial: 'unvollständig', done: 'vollständig', openCount: 'noch offen',
    myFlags: 'Meine Flags',
    noSel: 'Keine Markierung',
    selHint: 'Ziehe ein Rechteck über der Aufnahme oder wähle eine bestehende Markierung.',
    pickWaste: 'Wähle das passende Wasteful → Lean Information Attributpaar.',
    pickSol: 'Wähle mindestens einen Verbesserungsvorschlag.',
    complete: 'Klassifikation vollständig.',
    flagLabel: 'Flag', infoCaptured: 'Information erfasst:',
    opportunity: 'Opportunity',
    opportunityHint: 'Wähle für dieses Flag das passendste Wasteful → Lean Information Attributpaar (1–4).',
    wasteLean: 'Wasteful → Lean Information', improvSug: 'Verbesserungsvorschläge',
    improvement: 'Improvement',
    improvementHint: 'Wähle einen oder mehrere Verbesserungsvorschläge. Zusätzliche Hinweise gehören in den Kommentar.',
    priority: 'Priorität', comment: 'Kommentar', optional: 'Optional',
    important: 'Wichtig', urgent: 'Dringend', chooseClick: 'Klicken',
    high: 'Hoch', medium: 'Mittel', low: 'Niedrig',
    prioHint: 'Wie wichtig und wie dringend ist die Verbesserung dieses Flags?',
    notePh: 'Erkläre Verbesserungsvorschlag und Priorisierung; ergänze bei Bedarf weitere Hinweise.',
    save: 'Session speichern', expJson: 'JSON', expPng: 'Bild',
    needMark: 'Noch keine Markierung gesetzt.',
    needClass: 'Markierungen ohne vollständige Klassifikation: ',
    saved: 'Lokal gespeichert. Sichtbar im Popup der Erweiterung.',
    saveFail: 'Speichern fehlgeschlagen – der lokale Speicher ist voll. Exportiere die Session als JSON.',
    savedWithTime: 'Danke, dass du Trim genutzt hast. Session abgeschlossen in {time}.',
    hintDraw: 'Ziehen markiert · 1–4 klassifiziert · Entf löscht · Esc schliesst',
    trigger: 'TRIM', discard: 'Markierungen verwerfen und schliessen?',
    sessions: 'Sessions', noSessions: 'Noch keine Session gespeichert.',
    captureNow: 'Jetzt aufnehmen', exportAll: 'Alle als JSON', clearAll: 'Alle löschen',
    shortcut: 'Tastenkürzel ändern', confirmClear: 'Alle gespeicherten Sessions löschen?',
    cannotCapture: 'Diese Seite lässt sich nicht aufnehmen (z. B. Browser-Seiten oder der Web Store).',
    helpTitle: 'TRIM Begriffe & Hilfe', helpClose: 'Hilfe schliessen',
    helpArtifact: 'Artifact – gesamte Informationseinheit, Datei oder Seite, auf der Flags gesetzt werden.',
    helpSession: 'Session – ein einzelner TRIM-Flagging-Vorgang auf einer Aufnahme.',
    helpMarkup: 'Markup Screen – die Aufnahme, auf der Markierungen gesetzt und beschriftet werden.',
    helpPair: 'Attribute Pair – ein Wasteful → Lean Information Paar, z. B. Incorrect → Correct.',
    helpSuggestion: 'Improvement Suggestion – konkrete Verbesserung innerhalb des gewählten Attributpaars, z. B. Verified.',
    helpString: 'Attribute String – Attributpaar plus ausgewählte Verbesserungsvorschläge.',
    helpPriority: 'Priority – Position nach Wichtigkeit und Dringlichkeit; daraus wird Hoch, Mittel oder Niedrig abgeleitet.',
    helpComment: 'Comment – zusätzliche Erläuterung zu einem Flag.',
    helpMyFlags: 'My Flags – alle Flags der Session, nach Priorität sortiert. Anklicken zum Bearbeiten.'
  },
  en: {
    cockpit: 'TRIM cockpit', capture: 'Capture again', close: 'Close',
    canSaveTime: 'Can you save people time?', vocabHelp: 'Vocabulary & Help',
    marking: 'Marking', markings: 'Markings', open: 'open',
    partial: 'incomplete', done: 'complete', openCount: 'still open',
    myFlags: 'My Flags',
    noSel: 'No marking selected',
    selHint: 'Drag a rectangle on the capture or pick an existing marking.',
    pickWaste: 'Pick the best Wasteful → Lean Information attribute pair.',
    pickSol: 'Pick at least one improvement suggestion.',
    complete: 'Classification complete.',
    flagLabel: 'Flag', infoCaptured: 'Information Captured:',
    opportunity: 'Opportunity',
    opportunityHint: 'Select this flag’s best Wasteful → Lean Information attribute pair (1–4).',
    wasteLean: 'Wasteful → Lean Information', improvSug: 'Improvement Suggestions',
    improvement: 'Improvement',
    improvementHint: 'Select one or more improvement suggestions. Use Comments for any additional input.',
    priority: 'Priority', comment: 'Comment', optional: 'Optional',
    important: 'Important', urgent: 'Urgent', chooseClick: 'Choose and click',
    high: 'High', medium: 'Medium', low: 'Low',
    prioHint: 'Improving this flag is:',
    notePh: 'Explain your improvement suggestion(s) and flag prioritization, e.g. benefit to others: time, money or reduced risk, process, audience, timeliness.',
    save: 'Save session', expJson: 'JSON', expPng: 'Image',
    needMark: 'No marking has been drawn yet.',
    needClass: 'Markings without a complete classification: ',
    saved: 'Saved locally. Visible in the extension popup.',
    saveFail: 'Could not save – local storage is full. Export the session as JSON.',
    savedWithTime: 'Thank you for using Trim to improve our information. Session completion: {time}.',
    hintDraw: 'Drag to draw · 1–4 classifies · Del removes · Esc closes',
    trigger: 'TRIM', discard: 'Discard markings and close?',
    sessions: 'Sessions', noSessions: 'No session saved yet.',
    captureNow: 'Capture now', exportAll: 'Export all as JSON', clearAll: 'Delete all',
    shortcut: 'Change shortcut', confirmClear: 'Delete all saved sessions?',
    cannotCapture: 'This page cannot be captured (browser pages or the Web Store, for example).',
    helpTitle: 'TRIM Vocabulary & Help', helpClose: 'Close help',
    helpArtifact: 'Artifact – the entire piece of information, file, or page on which flags are planted.',
    helpSession: 'Session – one TRIM flagging experience on a capture.',
    helpMarkup: 'Markup Screen – the capture where flags are planted and labelled.',
    helpPair: 'Attribute Pair – one Wasteful → Lean Information pair, e.g. Incorrect → Correct.',
    helpSuggestion: 'Improvement Suggestion – a concrete improvement within the selected pair, e.g. Verified.',
    helpString: 'Attribute String – the attribute pair plus the selected improvement suggestions.',
    helpPriority: 'Priority – position by Important and Urgent; High, Medium, or Low is derived from it.',
    helpComment: 'Comment – additional input for a flag.',
    helpMyFlags: 'My Flags – all flags in the session, sorted by priority. Click one to edit it.'
  }
};

function trimLangFrom(code) {
  return (code && code.toLowerCase().indexOf('de') === 0) ? 'de' : 'en';
}
