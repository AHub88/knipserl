# Changelog — Knipserl Admin Console

Alle nennenswerten Änderungen am Admin-Dashboard.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.3.1] — 2026-04-21

### Fixed
- `/api/pages/[slug]` legt den Page-Record jetzt idempotent per Upsert an, falls er fehlt. Vorher lieferte der Endpoint 404, solange niemand im Admin die Pages-Übersicht geöffnet hatte — dadurch blieben frisch gepflegte Impressionen auf der Webseite unsichtbar.

## [1.3.0] — 2026-04-21

### Added
- **Mini-CMS** unter "Webseite":
  - **Medienbibliothek** (`/media`): zentraler Bild-Pool mit Upload, Suche, Alt-Text-Pflege, Aktiv/Inaktiv-Toggle. AVIF/WebP-Varianten werden automatisch erzeugt.
  - **Seiten** (`/pages`): Übersicht aller Landing-Pages (gruppiert nach Kategorie). Pro Seite Editor mit Bild-Slots (austauschbar, Fallback aus Code) und Impressionen-Sektion (Bilder aus der Medienbibliothek picken, DnD-sortierbar).
- Neue Tabellen: `media_assets`, `pages`, `page_image_slots`, `page_impression_photos`. Einmalige Daten-Migration aus `impression_photos` / `impression_collections` läuft automatisch beim Container-Start (idempotent).
- Code-Konstante `PAGE_DEFINITIONS` als Single Source of Truth für Seiten + Slot-Definitionen. Neue Seiten werden beim nächsten `/pages`-Aufruf automatisch in der DB angelegt.
- Neue API-Endpoints: `GET /api/media`, `POST /api/media`, `PATCH/DELETE /api/media/[id]`, `GET /api/pages`, `GET /api/pages/[slug]`, `PUT /api/pages/[slug]/slots/[key]`, `PUT /api/pages/[slug]/impressions`.

### Removed
- Alte Admin-UIs `/impressions` und `/impressions/collections` sowie zugehörige API `/api/impressions/*` entfernt (durch Mini-CMS ersetzt). Die DB-Tabellen `impression_photos` etc. bleiben noch als Legacy für Rollback-Sicherheit.

### Changed
- Sidebar "Webseite": neue Einträge "Seiten" und "Medienbibliothek"; "Impressionen" entfernt.

## [1.2.0] — 2026-04-21

### Added
- **Impressionen-Collections** (`/impressions/collections`): Kuratierte Bildergruppen pro Landing-Page anlegen. Neue Collection hat Name + Slug (z.B. `rosenheim` oder `hochzeit`), optional Beschreibung.
- Detail-Editor pro Collection: alle verfügbaren Bilder als Picker, die ausgewählten Bilder oben sortierbar per Drag & Drop, Speichern-Button mit Dirty-Flag.
- Drei neue API-Endpoints: `GET/POST /api/impressions/collections`, `GET/PATCH/DELETE /api/impressions/collections/[slug]`, `PUT /api/impressions/collections/[slug]/photos` (ersetzt Mitgliedschaft + Reihenfolge atomar).

## [1.1.1] — 2026-04-21

### Changed
- Impressionen-Reihenfolge jetzt per Drag & Drop (Griff-Icon oben links am Bild) statt mit Hoch/Runter-Pfeilen — inkl. Tastatur- und Touch-Support.

### Removed
- Obsoletes Migrations-Skript `migrate:impressions` entfernt. Funktionierte im standalone-Docker-Build eh nicht; Bilder werden über das UI hochgeladen.

## [1.1.0] — 2026-04-21

### Added
- **Impressionen-Verwaltung** (`/impressions`): Upload mehrerer Bilder gleichzeitig, Sortierung, Alt-Text-Pflege, Aktiv/Inaktiv-Toggle, Löschen.
- Bei Upload wird das Original unverändert gespeichert (`uploads/impressions/originals/`) und automatisch AVIF- und WebP-Varianten in den Breiten 400/800/1200/1920 px erzeugt (`uploads/impressions/optimized/`) — Pagespeed-tauglich ohne Qualitätsverlust.
- Neue Prisma-Modelle `ImpressionPhoto`, `ImpressionCollection`, `ImpressionCollectionPhoto` (Collections folgen in Phase 2 für Landing-Page-spezifische Galerien).
- Öffentlicher API-Endpoint `GET /api/impressions` liefert Srcsets für AVIF + WebP; wird von der Webseite konsumiert.
- Migrations-Skript `npm run migrate:impressions` zum einmaligen Import der vorhandenen Gallery-Bilder aus der Webseite.

## [1.0.2] — 2026-04-21

### Fixed
- CI-Build (GitHub Actions → Docker): `npm ci` scheiterte wegen Mismatch zwischen `package.json` (`dotenv@^17.4.1`) und `package-lock.json` (`dotenv@17.3.1`). Lock-File regeneriert, Build grün.

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
