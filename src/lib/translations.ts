export const translations = {
  de: {
    // Allgemein
    appName: "CutNow",
    language: "Sprache",
    min: "Min",

    // Customer Page
    customerTitle: "Wähle deinen Barber",
    customerSubtitle: "Live-Status · Wartezeit · Direkt einchecken",
    namePlaceholder: "Dein Name",
    inQueue: "In der Schlange",
    waitApprox: "Wartezeit ca.",
    person: "Person",
    persons: "Personen",
    joinQueue: "In Warteschlange eintragen",
    bookAppointment: "Termin buchen",
    unavailable: "Aktuell nicht verfügbar",
    adding: "Wird eingetragen...",
    noBarbers: "Noch keine Friseure gefunden.",

    // Status
    statusAvailable: "verfügbar",
    statusBreak: "Pause",
    statusVacation: "Urlaub",
    statusOffline: "nicht da",

    // Modus
    modeQueue: "Warteschlange",
    modeAppointment: "Nur Termine",
    modeHybrid: "Warteschlange + Termine",

    // Queue Page
    queueTitle: "Deine Wartezeit",
    entryNotFound: "Dein Eintrag wurde nicht gefunden oder ist bereits erledigt.",
    completed: "Abgeschlossen",
    youAreDone: "Du bist fertig ✓",
    doneMessage: "Dein Friseur hat dich abgeschlossen. Bis zum nächsten Mal!",
    loggedInAs: "Eingeloggt als",
    yourPosition: "Deine Position",
    youAreNext: "Du bist als Nächstes dran",
    personAhead: "Person vor dir",
    peopleAhead: "Personen vor dir",
    approxWait: "ca.",
    iAmHere: "Ich bin da",
    onMyWay: "Unterwegs",
    leaveQueue: "Warteschlange verlassen",
    backToBarbers: "← Zurück zur Barber-Auswahl",
    queueListLabel: "Warteschlange",
    youMarker: "du",

    // Warteschlangen-Status
    statusWaiting: "🕒 Wartet",
    statusArrived: "🟢 Ist da",
    statusOnWay: "🟡 Unterwegs",
    statusDone: "✅ Fertig",
    statusSkipped: "⏭️ Übersprungen",
  },

  en: {
    // General
    appName: "CutNow",
    language: "Language",
    min: "min",

    // Customer Page
    customerTitle: "Choose your Barber",
    customerSubtitle: "Live status · Wait time · Check in now",
    namePlaceholder: "Your name",
    inQueue: "In queue",
    waitApprox: "Wait approx.",
    person: "Person",
    persons: "People",
    joinQueue: "Join queue",
    bookAppointment: "Book appointment",
    unavailable: "Currently unavailable",
    adding: "Adding...",
    noBarbers: "No barbers found.",

    // Status
    statusAvailable: "available",
    statusBreak: "Break",
    statusVacation: "Vacation",
    statusOffline: "offline",

    // Mode
    modeQueue: "Walk-ins",
    modeAppointment: "Appointments only",
    modeHybrid: "Walk-ins + Appointments",

    // Queue Page
    queueTitle: "Your wait time",
    entryNotFound: "Your queue entry was not found or has already been completed.",
    completed: "Completed",
    youAreDone: "You're all done ✓",
    doneMessage: "Your barber has completed your visit. See you next time!",
    loggedInAs: "Checked in as",
    yourPosition: "Your position",
    youAreNext: "You're up next",
    personAhead: "person ahead of you",
    peopleAhead: "people ahead of you",
    approxWait: "approx.",
    iAmHere: "I'm here",
    onMyWay: "On my way",
    leaveQueue: "Leave queue",
    backToBarbers: "← Back to barber selection",
    queueListLabel: "Queue",
    youMarker: "you",

    // Queue status
    statusWaiting: "🕒 Waiting",
    statusArrived: "🟢 Here",
    statusOnWay: "🟡 On the way",
    statusDone: "✅ Done",
    statusSkipped: "⏭️ Skipped",
  },

  // --- Weitere Sprachen hier einfach ergänzen ---
  // tr: { appName: "CutNow", customerTitle: "Berberini Seç", ... },
  // ar: { appName: "CutNow", customerTitle: "اختر الحلاق", ... },
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.de;
