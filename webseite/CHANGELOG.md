# Changelog — Knipserl Webseite

Alle nennenswerten Änderungen an der öffentlichen Webseite (www.knipserl.de).
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.2.0] — 2026-04-21

### Added
- Impressionen-Galerie: Bilder öffnen sich jetzt im Lightbox-Modal (Vollbild, Keyboard-Navigation, Swipe auf Mobile, ESC/Swipe-Down zum Schließen) — identisch zur Homepage-Galerie.

### Changed
- `ImageLightbox` erweitert um `gridClassName` und `thumbSizes` Props, damit unterschiedliche Grid-Layouts möglich sind. GIFs werden via `unoptimized` korrekt durchgereicht.

## [1.1.1] — 2026-04-21

### Changed
- Impressionen: "Jetzt unverbindlich Anfragen"-Section auf Startseiten-Look umgestellt (Heading mit Sparkles, orange Fira-Condensed-Subheadline, volle Breite ohne weißen Box-Wrapper).

## [1.1.0] — 2026-04-21

### Added
- Impressionen-Seite komplett nachgebaut gemäß Live-Version: 10 Gallery-Bilder (3-Spalten-Grid), eingebettetes YouTube-Video (`wlHPKPAO_Bw`) und graue CTA-Section "Unvergessliche Momente mit unserer Knipserl Fotobox" mit zwei Buttons (Die Preise / Termin frei?).
- Neue Gallery-Assets: `fotobox-2025-neu.jpg` (2025er Event-Foto) und `fotobox-mieten-1-scaled.jpg`.

## [1.0.0] — 2026-04-21

### Added
- 5 neue Product-Landing-Pages: `/fotobox-fuer-hochzeit`, `/fotobox-fuer-firmenfeier`, `/fotobox-fuer-messe`, `/fotobox-fuer-weihnachtsfeier`, `/love-buchstaben` — URLs 1:1 zur alten WordPress-Seite für nahtlosen SEO-Übergang.
- Eigenständige Stadt-Seiten: `/fotobox-rosenheim`, `/fotobox-ebersberg`, `/fotobox-miesbach`, `/fotobox-traunstein`, `/fotobox-fuer-muenchen` sowie 4 neue Städte (Wasserburg, Mühldorf, Erding, Kufstein).
- Geteilte `CityLandingPage`-Komponente + `cityUrlPath()`-Helper für URL-Konsistenz.
- Meta-Tags übernommen von der Live-Seite (mit ★/✅ Symbolen für SERP-CTR), `Druckflatrate` durchgehend durch `Druckpaket` ersetzt.
- LOVE-Buchstaben-Seite komplett neu aufgebaut mit Hero, Technik-Details, Deko-Ideen + Fotobox-Kombi.
- `appendSiteName`-Flag in `generatePageMetadata`, damit Product-Pages saubere Titles ohne `| Knipserl Fotobox`-Suffix zeigen.
- Inquiry-Mail: neues Design (Variante B), klickbare Location → Google Maps, Fahrtkosten werden berechnet und mitgesendet.

### Changed
- Stadt-Route von Dynamic (`/fotobox/[city]`) auf flache Slugs migriert — Footer, Homepage, Sitemap, Breadcrumbs, Related-Cities entsprechend angepasst.
- Basispaket-Featureliste global vereinheitlicht: 10 Items, thematisch sortiert.
- Landing-Pages: Duplicate-Content deutlich reduziert (~90 % → ~20 %) durch stadtspezifische Headlines und FAQ-Blöcke.
- Sparkles (`.heading-decorated`) nur noch auf einzeiligen Headlines (Original-Look der Live-Seite).
- `text-wrap: balance` für gleichmäßige Zeilenlängen bei Landing-Page-Headlines.

### Fixed
- Ebersberg-FAQ-Fix (Landkreis-Bezeichnung).
- Miesbach-FAQ: Stellfläche 2×2 m, "niedrige Decke"-Passus entfernt.
- Bild/Text-Abstände auf Landing-Pages (kein Berühren mehr zwischen Text und Bild).
- Heading-Sparkles-Positionierung (nach mehreren Iterationen auf Original-Muster).
- Kontaktanfragen: nur Mail-Versand, kein DB-Eintrag + Submenü statt Flyout.

## Versionierungs-Regeln

Version wird von Claude automatisch fortgeführt. Scheme: **MAJOR.MINOR.PATCH**.

- **MAJOR** — Breaking Changes (URL-Struktur, Pflicht-Redirects, Tech-Upgrade mit Migrations-Aufwand).
- **MINOR** — neue Features, neue Seiten, neue Content-Blöcke, neue Integrationen.
- **PATCH** — Bugfixes, Copy-Änderungen, kleinere UI-Tweaks, SEO-Anpassungen.
