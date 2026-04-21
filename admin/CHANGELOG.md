# Changelog — Knipserl Admin Console

Alle nennenswerten Änderungen am Admin-Dashboard.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.0.1] — 2026-04-21

### Fixed
- Google Reviews Sync: automatischer Fallback auf Places API, falls die Google Business Profile API nicht verfügbar ist (z.B. weil das Google-Cloud-Projekt noch nicht für GBP freigeschaltet ist und die Default-Quota 0 Requests/Tag ist). Statt Totalausfall werden bis zu 5 Reviews über den Places API-Pfad geladen, der Nutzer bekommt einen Hinweis-Toast.

### Changed
- Klarere Fehlermeldung bei Google-API-Quota-Problemen: nennt jetzt explizit die Ursache (Default-Quota meist 0/Tag) und den Pfad zur Quota-Erhöhung in der Google Cloud Console.

## [1.0.0] — 2026-04-21

### Added
- Google-Autofill am Namen-Feld im Neue-Location-Formular: `/api/geocode?mode=place` nutzt Google Places Autocomplete mit `types=establishment`, findet Betriebsstätten (z.B. "Mcdonalds Rosenheim") und füllt Name + Adresse + Entfernung automatisch.
- Kalender: Fahrer-Farblegende zeigt alle im Monat aktiven Fahrer mit Initialen-Badge und vollem Namen.
- Kundendetail-Seite neu: Hero mit Stats (Aufträge, Umsatz, Dokumente), Aufträge/Angebote/Rechnungen-Cards, Notiz-Section.
- Inquiry-Extras persistieren, Kundentyp editierbar, Drucker als Default.
- Google-Reviews: Rate-Limit-Schutz durch Caching von Account-/Location-IDs in AppSetting.

### Changed
- **Mobile-First-Refactor:**
  - Kundendetail: Aufträge/Angebote/Rechnungen als Cards auf Mobile (statt cramped Row mit truncated Text).
  - Kundendetail: Stats-Zahlen `text-lg` auf Mobile + `whitespace-nowrap` → kein "434,00\n€" mehr.
  - Google-Reviews-Header: `flex-col` auf Mobile, Sync-Button volle Breite.
  - Locations-Übersicht: Tabelle ab `sm:`, auf Mobile Cards mit Name + voller Adresse + optional KM/Preisen.
- Kundenliste-Tabelle: Name/Firma/E-Mail mit `max-width` + `truncate` (Tooltip per `title`), Telefon `whitespace-nowrap` — Layout sprengt nicht mehr.

### Fixed
- Google Reviews Sync: Quota-Exceeded nach zweitem Klick innerhalb einer Minute, weil Accounts-Endpoint bei jedem Sync neu abgefragt wurde. IDs jetzt nach erstem Erfolg gecached, bei Fehler einmaliger Re-Fetch.
- Klarere Fehlermeldung bei Google-API-Rate-Limits.
- Footer-Links zeigten auf `/preise` statt auf die neuen Product-Pages.

## Versionierungs-Regeln

Version wird von Claude automatisch fortgeführt. Scheme: **MAJOR.MINOR.PATCH**.

- **MAJOR** — Breaking Changes (Schema-Migration mit Downtime, API-Bruch, Auth-Umbau).
- **MINOR** — neue Features (Seiten, Bereiche, Workflows, Integrationen).
- **PATCH** — Bugfixes, UI-Tweaks, Copy-Änderungen, Mobile-Polish.
