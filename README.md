# Äther-Imperium: Chroniken des Dampfs

Ein Vite + React Prototyp für die Steampunk-Raiders Verwaltungssimulation.

## Voraussetzungen

- Node.js 18+
- npm 9+

## Lokale Entwicklung

1. Abhängigkeiten installieren:
   ```bash
   npm install
   ```
2. Entwicklungsserver starten:
   ```bash
   npm run dev
   ```
3. Production-Build prüfen:
   ```bash
   npm run build
   ```
4. Typprüfung ausführen:
   ```bash
   npm run typecheck
   ```
5. Linting anstoßen:
   ```bash
   npm run lint
   ```
6. Testsuite starten:
   ```bash
   npm run test
   ```

## Projektstruktur

```
.
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── components/
    ├── constants.ts
    ├── hooks/
    ├── lib/
    ├── main.tsx
    ├── store/
    └── types.ts
```

- `src/` enthält den kompletten Anwendungscode.
- Der `@`-Alias verweist auf `src/` und verhindert tiefe Relative-Imports.
- Jede exportierte Funktion besitzt eine kurze JSDoc-Beschreibung.

## Umgebungsvariablen

Die API-Schlüssel werden über `GEMINI_API_KEY` aus einer `.env` Datei geladen. Lokale Builds funktionieren auch ohne Schlüssel,
solange keine API-Aufrufe ausgelöst werden.

## Projektstatus

### Erledigt
- Vollständige Mock-Galaxie mit ~3 000 Systemen, Spielern und Allianzen generiert (`src/lib/mockFactory.ts`).
- Galaxy-Ansicht auf Version 3 gehoben: virtualisierte Tabelle, aggregierte Hex-Karte, System-Modal und Deep-Linking.
- Clientseitige Banden-/Allianz-Verwaltung, Spieler-Verzeichnis und Messaging-Sidebar eingeführt.
- UX- und Mobile-Pass umgesetzt (Sticky-Topbar-Schatten, konsistente Cards, Mobile-Toolbar, Fokusmarkierungen).
- Qualitätssicherung (Linting, Tests, Typecheck, Build) in npm-Skripten verankert.

### Offen
- Galaxy- und Messaging-Leistung unter hoher Interaktion weiter beobachten und bei Bedarf optimieren.
- Allianz- und Chat-Flows perspektivisch mit echten Backend-Endpunkten verbinden.
- Erweiterte Gameplay-Effekte (Forschung, Missionen) und zusätzliche UI-Feedback-Schichten ausarbeiten.
