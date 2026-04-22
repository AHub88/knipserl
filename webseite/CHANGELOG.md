# Changelog — Knipserl Webseite

Alle nennenswerten Änderungen an der öffentlichen Webseite (www.knipserl.de).
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.8.0] — 2026-04-22

### Changed
- **`/preise` nutzt jetzt den Preiskonfigurator V3** — neues Design mit einheitlicher Sprache (heading-decorated Section-Titles mit Sparkles, weiße Cards mit Grunge-Texture-Header, feature-spezifische Icons im Basispaket, konsistente Fira-Condensed-Preis-Typografie, Mobile-optimiert). Die separate Intro-Features-Section (6 PNG-Icons) wurde entfernt, da V3 dieselben Informationen in Step 1 (Basispaket) mit integrierter SVG-Icon-Darstellung bereits zeigt. Buchungs-Logik (POST `/api/anfrage` mit allen Feldern inkl. Addons, Location, Fahrtkosten, Gesamtpreis) unverändert → Admin-Verknüpfung funktioniert.

### Fixed
- **Preiskonfigurator V3, Admin-Weiterleitung:** Bug im `source`-Feld behoben. V3 sendete bisher `source: "preiskonfigurator-v3"`, aber das Admin-API-Zod-Schema akzeptiert nur `["kontakt", "startseite", "preiskonfigurator", "api"]` — die Validierung wäre fehlgeschlagen und Anfragen wären nicht im Admin angekommen. Jetzt `source: "preiskonfigurator"` einheitlich.
- Preiskonfigurator V3, Mobile: `overflow-x-clip` auf dem Outer-Container gegen gelegentlichen horizontalen Scroll auf schmalen Screens (verursacht durch die `inline-block` `heading-decorated`-Titel bei sehr schmalem Viewport).

## [1.7.17] — 2026-04-22

### Changed
- Preiskonfigurator v3, Mobile-Optimierung: (1) Container-Padding `px-4 sm:px-6` für mehr nutzbare Breite auf Handys. (2) Section-Header-Größen reduziert (`text-[26px]` statt `32px` auf Mobile). (3) Step 1 Preis `44px` auf Mobile statt `56px`. (4) Step 2 Addon-Karten: Bild auf `80×80` auf Mobile (statt `120×120`), Titel+Preis stackt vertikal wenn zu lang, Titel-Font auf `17px` verkleinert, Padding+Gap enger. (5) Step 3 Entfernung/Fahrtkosten auf `24px` auf Mobile. (6) Step 4 Gesamtpreis auf `30px`. (7) Anfrageformular: Name- und Telefon/E-Mail-Felder auf Mobile einspaltig, Event-Type-Toggles mit `flex-wrap` damit sie bei Platzmangel umbrechen. (8) Sticky-Bar: Preis `24px` auf Mobile, Button-Text auf Mobile "Reservieren" (statt "Jetzt reservieren"), kleineres Padding.

## [1.7.16] — 2026-04-22

### Changed
- Preiskonfigurator v3, Basispaket-Icons in Step 1: Kontrast verbessert — Circle-Hintergrund auf vollfarbenes Orange (`#F3A300`) und Icon auf Weiß umgestellt. Vorher war der Wrapper nur 15% transparentes Orange mit orangefarbenem Icon → blass und kaum lesbar.
- "Auf- & Abbau"-Icon durch eine klar erkennbare Werkzeugkiste ersetzt. Das abstrakte Werkzeug-Symbol davor war nicht eindeutig genug als "Wir bauen auf".

## [1.7.15] — 2026-04-22

### Changed
- Preiskonfigurator v3: Vertikaler Abstand zwischen den Steps reduziert — Sections von `py-12 md:py-16` auf `py-8 md:py-10`, SectionHeader-Margin von `mb-10 md:mb-12` auf `mb-6 md:mb-8`. Netto etwa 35% weniger Weißraum zwischen Steps, dadurch kompakterer Gesamteindruck ohne dass die Steps zusammenkleben.

## [1.7.14] — 2026-04-22

### Changed
- Preiskonfigurator v3, Basispaket-Features in Step 1: Generische Check-Häkchen durch feature-spezifische SVG-Icons ersetzt — Truck für Lieferung, Werkzeug für Auf-/Abbau, Foto-Stack für 400 Drucke, Drucker, Kamera, Monitor, Blitz, Layout-Raster, Schloss für Passwortschutz, Telefon für Support. Der orange Icon-Circle-Wrapper bleibt konsistent, nur das SVG darin ändert sich je nach Feature.

## [1.7.13] — 2026-04-22

### Changed
- Preiskonfigurator v3: Einheitliche Preis-Typografie — alle Preis-Highlights nutzen jetzt Fira Condensed Extra-Bold. Vorher liefen die Preise in drei verschiedenen Schriften (Fira Condensed bei Hero/Gesamtpreis, Beyond The Mountains bei Addon-Preisen und Fahrtkosten, default Fira Sans bei Line-Items). Die cursive Beyond-The-Mountains-Schrift wird bei Beträgen wie "23,40 €" schnell unleserlich und ist jetzt den Überschriften vorbehalten. Line-Items in der Summary bekommen `tabular-nums` für saubere Zahlenausrichtung.

## [1.7.12] — 2026-04-22

### Changed
- Preiskonfigurator v3, Location-Input in Step 3: Hellgrauer Borderless-Input durch weißen Input mit dunkler 2px-Border ersetzt. Der Focus-State ändert die Border auf Orange statt einen zusätzlichen Focus-Ring zu setzen — weniger konkurrierende Kontur-Farben.

## [1.7.11] — 2026-04-22

### Changed
- Preiskonfigurator v3: Aktivierte Addon-Karten (Step 2) bekommen dieselbe `main_back_gr-2.webp` Grunge-Textur als Hintergrund wie die Dark-Header in Step 1 und Step 4. Vorher war der Active-State ein flaches Schwarz — jetzt konsistent im Knipserl-Stoff-Look.

## [1.7.10] — 2026-04-22

### Changed
- Preiskonfigurator v3: Dezenter Soft-Shadow (`0 4px 14px rgba(0,0,0,0.08)`) auf Step-1-, Step-4- und Addon-Karten — hebt die Cards leicht vom Paper-Hintergrund ab, ohne das Material-Design-Gefühl zurückzubringen.
- Preiskonfigurator v3: Dunkle Header-Leisten von Step 1 und Step 4 nutzen jetzt die `main_back_gr-2.webp` Grunge-Textur als Hintergrund (statt flach schwarz). Das ist dieselbe Textur, die auf den Landingpages für die dunklen Sections (z.B. "Momente") verwendet wird — dadurch fühlt sich der dunkle Header nicht mehr wie ein UI-Balken, sondern wie ein Stück der Knipserl-Welt an.

## [1.7.9] — 2026-04-22

### Changed
- Preiskonfigurator v3: Material-Design-Schatten (`0 10px 20px…`) überall entfernt — der "schwebende Card"-Look passte nicht zum flachen, textur-getragenen Stil der Startseite (keine Card-Schatten auf den Landingpages). Step 1 und Step 4 sind weiterhin weiße Cards, aber nur noch durch Dark-Header und Body-Farbkontrast auf der Paper-Textur abgegrenzt. Step 3 (Lieferung) und das Anfrageformular haben keinen Card-Wrapper mehr — Inhalt liegt direkt auf dem Body-Hintergrund wie das "Unverbindlich anfragen"-Formular auf der Startseite. Addon-Karten nutzen statt Schatten eine dezente Border, die beim Hover leicht orange wird.

## [1.7.8] — 2026-04-22

### Added
- Neue Staging-Seite `/preisev3` mit einheitlicher Design-Sprache: alle Sections folgen demselben Baukasten (zentrierter `heading-decorated`-Titel mit Sparkles + kleines orange "SCHRITT 0X"-Label drüber, weiße Card mit Knipserl-Shadow, einheitliche Circle-Check-Icons in Orange). Dark-Header-Leiste nur noch bei den beiden Haupt-Infos (Basispaket Step 1 und Zusammenfassung Step 4) — sonst zu viele konkurrierende Highlights. Dient als Design-Referenz zur Entscheidung vor Go-Live auf `/preise`.
- `robots: noindex` auf `/preisev2` und `/preisev3` — Staging-Seiten sollen nicht in Google erscheinen und nicht als Duplicate Content zu `/preise` zählen.

## [1.7.7] — 2026-04-22

### Changed
- Preiskonfigurator v2, Step 1 (Basispaket): Zur Designentscheidung werden aktuell drei Varianten der "Fotobox mit Drucker"-Box untereinander angezeigt: (A) helle Card mit dunkler Header-Leiste wie die Summary-Box, (B) dunkle Holz-Textur-Box mit gerissenen Papierrändern wie die MOMENTE-Sections, (C) helles Pappschild-Layout mit orange Akzentkante und gedrehtem Preis-Badge. Nach der Entscheidung wird der Vergleich wieder auf eine Variante reduziert.

## [1.7.6] — 2026-04-22

### Added
- Preiskonfigurator v2, Anfrageformular: "Jetzt reservieren" in Summary-Box und Sticky-Bar blendet jetzt (wie auf `/preise`) ein eingebettetes Anfrageformular mit MiniCalendar, Kontaktfeldern und Event-Type-Toggles direkt auf derselben Seite ein, anstatt zu `/termin-reservieren` umzuleiten. Veranstaltungsort, Zubehör und Gesamtpreis werden automatisch übernommen.

### Fixed
- Preiskonfigurator v2, Karte: Bei Adressen außerhalb des Liefergebiets (z.B. 462 km nach Frankfurt) wurde die Google-Static-Maps-URL durch die sehr lange Route-Polyline zu groß und Google lieferte kein Bild → gebrochener `<img>`-Placeholder. Neu: bei `outsideDeliveryArea` wird die Polyline weggelassen und stattdessen werden nur Rosenheim + Zielort als Marker mit Auto-Fit gerendert.
- Audio-Gästebuch: "inkl. MwSt." an beiden Stellen (Angebots-Widget und große Preiskarte) entfernt — Kleinunternehmerregelung §19 UStG gilt auch für den Versandpreis.

## [1.7.5] — 2026-04-22

### Changed
- Preiskonfigurator v2 (`/preisev2`), Extras-Boxen: Übernahme des Layouts aus `/preise` — Produktbilder jetzt 120×120 statt 64×64, größere Überschriften, aktive Box wechselt auf dunklen Hintergrund mit invertiertem Bild, Checkbox rechts statt links.
- Preiskonfigurator v2, Preis-Summary-Box: Redesign auf helle Card mit dunklem Header-Balken "Deine Konfiguration", Line-Items mit orangefarbenem Check-Icon-Kreis, Trennlinien zwischen Zeilen, Gesamtpreis in hellgrauem Footer rechts.

### Fixed
- Preiskonfigurator v2: "inkl. MwSt."-Hinweise am Festpreis (Step 1) und an der Gesamtpreis-Zeile (Step 4) entfernt. Knipserl nutzt die Kleinunternehmerregelung (§ 19 UStG) und weist keine Umsatzsteuer aus — der Hinweis "inkl. MwSt." ist rechtlich irreführend.

## [1.7.4] — 2026-04-22

### Fixed
- Footer: Die Überschrift "Du hast Fragen?" brach auf Desktop in zwei Zeilen um, weil bei 5 gleich breiten Spalten die letzte Spalte zu schmal war. Grid jetzt mit fraktionalen Spaltenbreiten (`1fr 1fr 2fr 1.4fr`) — Link-Spalte bleibt doppelt so breit, die "Du hast Fragen?"-Spalte bekommt etwas mehr Platz und die Überschrift ist wieder einzeilig.

## [1.7.3] — 2026-04-22

### Added
- Anlass ↔ Stadt Cross-Linking: Jede Stadt-Landingpage zeigt unter den Inhalts-Sections einen neuen Block "Fotobox in [Stadt] für Deinen Anlass" (Hochzeit, Firmenfeier, Messe, Weihnachtsfeier). Jede Anlass-Landingpage zeigt einen Block "Fotobox für [Anlass] in Deiner Region" mit allen 9 Städten. Das baut einen dichten internen Link-Graph zwischen geografischen und thematischen Landingpages auf.
- Neue Komponente `<CityCrossLinks>` (`src/components/CityCrossLinks.tsx`) — rendert alle 9 SEO-Städte als Link-Chips, wird von allen 4 Anlass-Pages genutzt.

## [1.7.2] — 2026-04-22

### Changed
- Footer-Layout: "Mehr Infos" rendert die jetzt 14 Link-Einträge (9 Städte + 4 Anlässe + LOVE-Buchstaben) auf Desktop zweispaltig und belegt dafür die doppelte Spaltenbreite (Grid auf `lg:grid-cols-5`, Block `lg:col-span-2`). Der Footer wird dadurch deutlich weniger hoch und die vier Content-Blöcke sind optisch auf einer Linie. Mobile bleibt einspaltig.

## [1.7.1] — 2026-04-22

### Changed
- Footer: 4 bislang nicht intern verlinkte Stadt-Landingpages (Erding, Wasserburg am Inn, Mühldorf, Kufstein) ergänzt — damit bekommen alle 9 SEO-Städte Link-Juice aus dem globalen Footer, nicht nur 5.
- Startseite, Liefergebiete-Absatz: Mühldorf am Inn, Erding, Wasserburg am Inn und Kufstein sind jetzt als Links zu den jeweiligen Stadt-Seiten hinterlegt (vorher unverlinkter Fließtext bzw. `<strong>`).

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
