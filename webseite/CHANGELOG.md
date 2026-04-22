# Changelog — Knipserl Webseite

Alle nennenswerten Änderungen an der öffentlichen Webseite (www.knipserl.de).
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.7.0] — 2026-04-22

### Added
- Neue Komponente `<SlotImage>`: rendert entweder das im Admin unter Seiten gepflegte Bild (`<picture>` mit AVIF/WebP-Srcset) oder einen statischen Fallback aus dem Code — drop-in-replacement für `<Image>`-Tags auf Landing-Pages.
- CityLandingPage (9 Städte): Hero-, Bedienung- und Fotoprops-Bilder sind jetzt austauschbar über `/pages/fotobox-[stadt]` im Admin.
- Produkt-Pages (Hochzeit, Firmenfeier, Messe, Weihnachtsfeier, LOVE-Buchstaben): Hero-Bild austauschbar über `/pages/[slug]` im Admin.

## [1.6.0] — 2026-04-21

### Added
- Impressionen-Sektion auf 4 weiteren Produkt-Pages eingebunden: `/fotobox-fuer-firmenfeier`, `/fotobox-fuer-messe`, `/fotobox-fuer-weihnachtsfeier`, `/love-buchstaben`. Jede pflegt eigene Bildauswahl im Admin.

### Changed
- Alle Stadt-Landing-Pages zeigen jetzt die zentrale Haupt-Impressionen-Galerie (pageSlug "impressionen") statt pro Stadt eigene Sektion. Pflege an einer Stelle.
- Temporärer Debug-Endpoint `/api/debug/impressionen` entfernt.

## [1.5.1] — 2026-04-21

### Fixed
- Deploy-Trigger für Mini-CMS-Umstellung (der vorige Admin-Fix hat den Webseite-Container nicht neu gebaut, weil der Workflow nur bei `webseite/**`-Änderungen auslöst).

## [1.5.0] — 2026-04-21

### Added
- Neuer Fetcher `fetchPageData(slug)` (`src/lib/pages.ts`) — holt pro Seite gepflegte Bild-Slots und Impressionen-Bilder aus dem Admin-Mini-CMS.
- `ImpressionSection` umgestellt auf `pageSlug`-Prop (vorher Collection-Slug). Zeigt die im Admin unter **Seiten > [slug]** gepflegte Liste an.

### Removed
- `src/lib/impressions.ts` entfernt — ersetzt durch das Page-basierte Slot-System.

### Changed
- `/impressionen` zieht jetzt die Bilder aus der Page-Impressionen-Liste statt der globalen Impressionen-Tabelle. Pflege über **/pages/impressionen** im Admin.

## [1.4.0] — 2026-04-21

### Added
- Neue Komponente `<ImpressionSection slug="..." />`, die eine Admin-kuratierte Collection als Galerie-Section rendert (mit Lightbox). Wenn die Collection leer/nicht vorhanden ist, rendert die Komponente nichts — die Landing-Page bleibt unverändert.
- Alle Stadt-Landing-Pages (`/fotobox-rosenheim`, `/fotobox-fuer-muenchen`, …) zeigen automatisch die Collection, deren Slug dem City-Slug entspricht. Der City-Name steht im Section-Titel (z.B. "Die Fotobox in Rosenheim").
- Landing-Page `/fotobox-fuer-hochzeit` bindet die Collection mit Slug `hochzeit` ein (Beispiel-Integration für Produkt-Pages; weitere Produkt-Pages können identisch verdrahtet werden).

### Changed
- Impressionen-Fetches nutzen ISR mit 60 s Revalidation statt no-store — Pages bleiben statisch ausgeliefert, Admin-Änderungen erscheinen nach max. einer Minute.

## [1.3.1] — 2026-04-21

### Changed
- Impressionen-Lightbox lädt im Fullscreen-Modal jetzt das Original statt der AVIF-Kompression — sichtbar schärfer bei großen Bildschirmen.
- Statischer Gallery-Fallback in `/impressionen` entfernt: die Seite zeigt ausschließlich, was im Admin gepflegt ist. Leere DB → leere Gallery (aber Video, CTA, Anfrageformular bleiben).

## [1.3.0] — 2026-04-21

### Added
- Impressionen-Galerie zieht jetzt Bilder aus der Admin-Datenbank (via `/api/impressions`). Neue Uploads im Admin erscheinen ohne Code-Änderung auf der Webseite.
- `<picture>`-Rendering mit AVIF + WebP-Srcsets (vom Admin vorberechnet) für deutlich schnellere Ladezeiten.
- Fallback auf die bisherigen Static-Gallery-Bilder, falls die Admin-API nicht erreichbar ist — die Seite bleibt immer funktional.

### Changed
- `ImageLightbox` erweitert um optionale `avif` / `webp` Srcsets; rendert dann `<picture>` statt `next/image`. Homepage-Galerie unverändert.

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
