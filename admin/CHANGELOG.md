# Changelog — Knipserl Admin Console

Alle nennenswerten Änderungen am Admin-Dashboard.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.20.0] — 2026-04-24

### Added
- **Admin-Download für 5×15-Streifen liefert automatisch verdoppeltes 10×15-PNG.** Gibt der Kunde einen Fotostreifen (Format `2x6`) ab, bekommt der Fotoprint-Drucker standardmäßig ein 10×15-cm-Papier — darauf müssen zwei identische Streifen nebeneinander sitzen, sonst gibt es pro Druck nur einen halb-bedruckten Bogen. Das erledigt ab sofort der Download selbst.
  - Neuer Endpoint: `GET /api/design/[token]/download-final` (Admin-only, Driver gesperrt). Liest `layout-final.png` aus dem Order-Upload-Verzeichnis. Bei Format `2x6` baut **sharp** ein neues Canvas mit doppelter Breite (2 × `stripW` × `stripH`) und komponiert das Streifen-PNG zweimal nebeneinander — links bei `x=0`, rechts bei `x=stripW`. Das Ergebnis ist ein 1200×1800-Hochformat-PNG (entspricht exakt einem 10×15 cm Standard-Fotoprint, hochkant); nach dem Druck wird mittig geschnitten → zwei identische Streifen.
  - Bei Format `4x6` (10×15 quer) wird das Original 1:1 ausgeliefert — kein Overhead.
  - Download-Buttons in der Auftragsansicht (`order-view-a.tsx`, Kunden-Layout-Box + Modal) verlinken jetzt auf den neuen Endpoint statt direkt auf die statische `layout-final.png`. Fallback auf die alte URL bleibt erhalten, falls für einen Altbestands-Auftrag kein `designToken` gesetzt ist.

## [1.19.0] — 2026-04-24

### Added
- **Layout-Vorlagen: mehrere Kategorien pro Vorlage + Filter für Kunden.**
  - Schema: neues Feld `LayoutTemplate.categories String[]` (Prisma), Migration via `sync-schema.cjs` (`TEXT[] DEFAULT ARRAY[]::TEXT[]`). Das alte Einzel-Feld `category` bleibt vorerst als Legacy-Fallback (wird beim Lesen in `categories` gespiegelt, falls `categories` leer ist), damit bestehende Templates nicht leer wirken.
  - Feste Kategorien-Liste (`admin/src/lib/design-template-categories.ts`): **Geburtstag, Hochzeit, Weihnachtsfeier, Sommerfest, Firmenevent**. Wird vom Admin-Editor und vom Kunden-Vorlagenpanel gemeinsam genutzt.
  - **Admin-Template-Editor** (`settings/design-templates/editor`): Eingabefeld „Kategorie" durch fünf Chip-Buttons ersetzt (Toggle-Auswahl, Primary-Fill = aktiv). Zeigt im Label die Anzahl ausgewählter Kategorien an.
  - **Kunden-Vorlagenpanel** im Layoutdesigner: über dem Vorlagen-Grid liegt jetzt eine Filterleiste mit „Alle" + allen tatsächlich benutzten Kategorien. Klick auf einen Chip filtert die angezeigten Vorlagen. Zeigt nur Kategorien, die mind. eine Vorlage haben — leere Chips sind ausgeblendet.
  - **API**: `GET /api/design/templates` liefert jetzt `categories`, `POST`+`PUT` akzeptieren `categories: string[]`. Das legacy-`category`-Feld wird beim Schreiben automatisch mit dem ersten Eintrag aus `categories` synchron gehalten, solange keine Migration passiert ist.

## [1.18.0] — 2026-04-24

### Added
- **Layoutdesigner (Kunde) — Vorlage schaltet Format automatisch um**: Wählt der Kunde eine Vorlage, deren `format` vom aktuell gewählten Format abweicht (z.B. 5×15 Hochformat-Streifen bei geöffnetem 10×15 Querformat), wird das Format nun automatisch auf das der Vorlage gewechselt und der Vorlagen-Inhalt direkt geladen. Vorher wurden Hochformat-Vorlagen im Querformat-Canvas verzerrt/abgeschnitten dargestellt, bis der Kunde zusätzlich manuell auf den Format-Button oben klickte.
- Implementierungsweg: `onFormatChange` nimmt jetzt optional `templateCanvasJson` als zweiten Parameter. Der Customer-Client (`design-page-client.tsx`) speichert das JSON nach erfolgreichem PATCH in `pendingTemplateJson` und reicht es beim Remount als `existingDesign` durch — so lädt der neu gemountete `LayoutEditor` die Vorlage sofort, statt ein leeres Canvas zu zeigen.

## [1.17.5] — 2026-04-24

### Removed
- **Dashboard — „Aufträge pro Monat" (Area-Chart über 6 Monate) raus.** Info war redundant zum neuen Monatsvergleich-Chart direkt darüber, der dieselbe Achse zeigt (aber mit Jahresvergleich). Spart eine weitere DB-Query (`prisma.order.groupBy` über 6 Monate).

### Changed
- **Dashboard — „Nächste Aufträge" und „Eventarten" in einer Zeile**: 3-Spalten-Grid (`lg:grid-cols-3`), Liste belegt 2 Spalten, Pie-Chart 1 Spalte. Auf Mobile untereinander wie bisher.

## [1.17.4] — 2026-04-24

### Changed
- **Layoutdesigner — Header-Buttons „Duplizieren" / „Löschen" umbenannt und abhängig vom Selektionsstatus**: Die generischen Labels haben Nutzer glauben lassen, sie würden das gesamte Design kopieren bzw. löschen — tatsächlich beziehen sie sich nur auf das aktuell ausgewählte Element. Neue Labels: **„Element kopieren"** und **„Element löschen"**. Zusätzlich sind beide Buttons jetzt inaktiv (40 % Deckkraft, `cursor-not-allowed`), solange kein Element ausgewählt ist — damit ist auf einen Blick erkennbar, dass sie kontextabhängig sind. Tooltip erklärt ebenfalls den Zustand („Kein Element ausgewählt" / „Ausgewähltes Element löschen (Entf)").

## [1.17.3] — 2026-04-24

### Changed
- **Dashboard — „Monatsvergleich Aufträge" direkt unter „Verlauf Standpunkt"** positioniert. Vorher saß der Monatsvergleich unterhalb der Jahresvergleichs-Tabs, jetzt ist er die erste Detail-Ansicht direkt nach dem YTD-Trend — der Gedankensprung „Gesamt-Verlauf → Monats-Aufschlüsselung" ist so enger. Neue Reihenfolge: KPIs → Verlauf Standpunkt → Monatsvergleich → Jahresvergleich-Tabs → Charts-Row → Nächste Aufträge.

## [1.17.2] — 2026-04-24

### Changed
- **Layoutdesigner — Schriftart-Dropdown deutlich größer und mit Live-Vorschau in der Box**: Das geschlossene Select zeigt den Namen der aktiven Schrift jetzt in genau dieser Schrift an (`fontFamily` inline auf dem `<select>`), Schriftgröße von 11 px auf 15 px erhöht, Padding verdoppelt (`py-2`). Die Dropdown-Optionen nutzen 16 px statt der Browser-Default-~11 px, damit Schwung- und Handschrift-Fonts wie „Lobster", „Pacifico" oder „Showclick" in der Auswahl gut lesbar sind. Gilt für Einzelauswahl und Bulk-Text-Auswahl.
- **Layoutdesigner — linke Sidebar wieder mit Labels** (zurück auf 220 px). Die Icon-only-Variante aus 1.17.1 hat die Einträge zu anonym wirken lassen, besonders „Foto-Platzhalter" und „Elemente" waren auf den Icons allein nicht eindeutig. Accordion-Eigenschaften rechts (Position/Größe/Transformation collapsed) bleiben wie in 1.17.1.

## [1.17.1] — 2026-04-24

### Changed
- **Layoutdesigner — linke Sidebar auf Icon-Leiste reduziert** (220 px → 56 px). „Hinzufügen" / „Bibliothek" hatten jeweils nur 2–3 Einträge, die Section-Titel + vollflächige Labels verbrauchten deshalb unnötig viel Breite. Labels jetzt als Tooltip (`title`-Attribut). Der Foto-Platzhalter-Zähler (`2/3` etc.) erscheint als kleines Primary-Badge oben rechts am Icon, damit die Info nicht verloren geht. Canvas gewinnt dadurch ~160 px Breite.
- **Eigenschaften-Panel rechts — Position / Größe / Transformation standardmäßig eingeklappt**. Die drei Sektionen stehen unten in der Property-Liste, werden aber im Alltag selten angefasst — bisher mussten sie jedes Mal vorbei-gescrollt werden, bevor man an Farbe / Abstände kam. Klick auf den Titel klappt auf. „Text", „Rahmen" und „Schatten" verhalten sich wie vorher.

## [1.17.0] — 2026-04-24

### Added
- **Dashboard: 4 flache KPI-Boxen ganz oben** — „Offene Anfragen" (Status `NEW` + `CONTACTED` + `WAITING`), „Offene Aufträge", „Offener Umsatz" (Summe der `price`-Werte aller Aufträge mit Status `OPEN`/`ASSIGNED`) und **„Offener Umsatz bar"** (dito, aber nur `paymentMethod = CASH`). Die „bar"-Kachel macht erstmals auf einen Blick sichtbar, wie viel Cash noch hereinkommen muss.

### Changed
- **Dashboard-Reihenfolge umgestellt**: flache KPIs → „Verlauf Standpunkt bis \<Datum\>"-Chart → Jahresvergleichs-Tabs → Monatsvergleich → Charts-Row → Nächste Aufträge. Die alte breite „Standpunkt heute"-Box (Jahresbalken direkt oben) ist raus, weil der Verlaufsgraph dieselbe Info als klar lesbare Kurve zeigt.
- **Monatsvergleich Aufträge (Chart)**: Farbkonsistent auf exakt **zwei** Farben reduziert — Vorjahr in neutralem Grau (`bg-muted-foreground/40`), dieses Jahr durchgehend in primär-Orange. Der aktuelle Monat wird nicht mehr durch eine dritte Farbe hervorgehoben, sondern durch einen dezenten `ring-1 ring-primary/30` um die Balkengruppe. Unter jedem Balken steht jetzt zusätzlich eine Jahres-Kurzform („'25" / „'26") — damit ist ohne Blick zur Legende klar, welcher Balken welches Jahr ist. Die alte dreistufige Opazitäts-Logik (past/current/future) ist komplett entfernt, weil sie fälschlich nach drei Datenreihen aussah.

### Removed
- Die bisherigen Dashboard-KPIs „Neue Anfragen / Offene Aufträge / Abgeschlossen (Monat) / Aktive Fahrer" samt Mock-Sparklines. Ersetzt durch die vier neuen „offen"-Metriken.
- Tote Umsatz-Vorab-Berechnungen (`revenueThisMonth`, `revenueLastMonth`, `revenueYTD`, `revenueLastYear`, `revenueChartData`), die seit dem Wechsel auf Jahres-Tabs + Trend-Chart nirgends mehr gerendert wurden. Spart pro Dashboard-Aufruf **5 zusätzliche DB-Queries**.

## [1.16.1] — 2026-04-24

### Changed
- **Anfrage-Detail, Box „Angefragte Extras"**: Die separat eingefügte „Extra Papierrolle(n)"-Zeile ist wieder raus. Stattdessen sitzt im „Anfrage bearbeiten"-Panel direkt neben den anderen Extras-Kacheln eine **eigene Papierrollen-Kachel mit `IconReceipt`** + Stückzahl-Input + Preis-Hinweis (99 €). Kachel färbt sich primär ein, sobald Stückzahl > 0 — gleiche Optik wie bei Aufträgen.
- Die Stückzahl wird beim Verlassen des Inputs (`onBlur`) sofort auf der Anfrage persistiert, damit sie bei Navigation nicht verloren geht.

### Fixed
- **Changelog-Seite — Webseiten-Changelog wurde in Produktion nicht gefunden**: Der Docker-Build-Kontext ist `./admin`, also war `../webseite/CHANGELOG.md` zur Laufzeit nicht erreichbar — deshalb stand dort dauerhaft „Webseiten-Changelog nicht gefunden.".
  - CI-Workflow spiegelt jetzt `webseite/CHANGELOG.md` + `webseite/package.json` vor dem Docker-Build nach `admin/.webseite/` (neuer Step in `.github/workflows/deploy-admin.yml`).
  - Dockerfile kopiert `.webseite/` in den Runner.
  - `changelog/page.tsx` liest beide Pfade der Reihe nach (`../webseite/...` zuerst für lokale Dev-Workflows, `.webseite/...` als Fallback im Container).
  - Änderungen an `webseite/CHANGELOG.md` oder `webseite/package.json` triggern jetzt ebenfalls ein Admin-Deployment (sonst käme die neue Version im Admin nie an).

## [1.16.0] — 2026-04-24

### Added
- **Extra Papierrolle(n) bei Anfragen**: Neues Feld `extraPaperRolls` auf Anfragen, genauso wie bisher bei Aufträgen. Inline editierbar in der Anfrage-Detailansicht (Stückzahl-Input unter „Angefragte Extras"). Wird bei Annahme der Anfrage automatisch in den neuen Auftrag übernommen.
- **Aufpreis 99 € pro Papierrolle** in allen Kundenpreis-Kalkulationen: neue Konstante `PAPER_ROLL_PRICE = 99` in `extras-pricing.ts`. Die Zeile „Papierrolle(n) × *n*" erscheint jetzt sowohl in der Live-Berechnung der Anfrage-Annahme als auch in der Preiskalkulation-Box der Auftragsdetails.

### Changed
- **Design-Editor Format-Picker**: Die Vorschau-Kachel für das „10 × 15 cm Fotoprint"-Format wird jetzt **im Querformat** angezeigt (passt zum tatsächlich landscape-orientierten Canvas 1800 × 1200 px). Bezeichnung ergänzt um „(Querformat)".
- Schema: `Inquiry` bekommt Spalte `extraPaperRolls INTEGER DEFAULT 0` (auch in `sync-schema.cjs` gepflegt).

### Heads-up / Migration
- Bestehende Aufträge mit `extraPaperRolls > 0` zeigen im Kundenpreis-Block jetzt **99 € × Anzahl** zusätzlich an. Der gespeicherte `price` wird dabei **nicht** automatisch angepasst — er bleibt der tatsächlich in Rechnung gestellte Betrag. Wer will, öffnet den Auftrag im „Bearbeiten"-Modus und klickt „Berechnen", um den Preis zu aktualisieren.

## [1.15.0] — 2026-04-24

### Added
- **Auftraggeber-Box inline editierbar**: Pencil-Icon rechts öffnet ein Edit-Formular mit Name / E-Mail / Telefon. Check/X zum Speichern bzw. Abbrechen (Escape = Abbrechen).
- **Ansprechpartner vor Ort inline editierbar**: Name / Telefon / Notiz direkt in der Box editierbar. Zusätzlich **Checkbox „= Auftraggeber"**: Einmal anklicken übernimmt automatisch Name (Kontakt-Teil, ohne Firma-Prefix) + Telefon vom Auftraggeber. Erneutes Abwählen leert die Felder.

### Changed
- Intern-Preisbox unter „Gewinn": neue Zeile **Zahlweise** (grüne Pille „Bar" bzw. blaue Pille „Rechnung"), damit Kassier- vs. Rechnungs-Info auch im internen Block auf einen Blick sichtbar ist.

## [1.14.2] — 2026-04-24

### Changed
- Auftrag-Detail, Box „Auftraggeber": Die Zeile **Firma: Einzelunternehmen / GbR** entfernt. War redundant mit der Firmen-Info in der Topline („EU" / „GbR"-Chip neben Auftragsnummer) und hat die Kontakt-Box unnötig aufgebläht.

## [1.14.1] — 2026-04-24

### Changed
- **Fahrer-Ansicht — Seitenspalte**: Statt „Fahrer + Zahlart-Kachel" sitzen in der rechten Spalte jetzt **Fahrer-Name oben + die vier Workflow-Status-Pills** (Bestätigt / Design / Geplant / Bezahlt) als read-only. Layout matcht das gewünschte Design (Fahrer-Header, Trennlinie, Pills darunter).
- **Zahlart prominent** ist aus der Fahrer-Spalte rausgeflogen und sitzt jetzt als **breiter farbiger Banner direkt unter dem Auftrag-Header**: grün „Bar kassieren" bzw. blau „Rechnung — nicht kassieren". Damit steht die zahlungsrelevante Info ganz oben und ist auf einen Blick klar.

## [1.14.0] — 2026-04-23

### Added
- **Fahrer-optimierte Auftrag-Detailansicht**: In der Fahrer-Ansicht (viewMode `driver`) ist die Auftragsdetailseite auf das reduziert, was ein Fahrer vor Ort wirklich braucht:
  - **Quick-Action-Spalte komplett entfernt** — kein Bestätigungslink, kein Design-Link, keine PDF-Aktion, kein „Bearbeiten"-Button.
  - **Workflow-Progress-Spalte ersetzt** durch eine schlanke Spalte mit Fahrer-Zuweisung (read-only) und **prominenter Zahlart-Kachel**: grün für Bar, blau für Rechnung — damit der Fahrer auf den ersten Blick weiß, ob er kassieren muss.
  - **Interner Kommentar** jetzt auch für Fahrer sichtbar und bearbeitbar (z. B. für Notizen nach dem Einsatz). Backend (`PATCH /api/orders/:id`) akzeptiert `internalNotes`-Updates von Fahrern auf den ihnen zugewiesenen Aufträgen.
  - **Preiskalkulation intern** für Fahrer sichtbar (Aufbau-/Material-Anteile, Gewinn).
  - **Kunden-Layout**: Fahrer können das Design nur ansehen — „Herunterladen" und „Design nachbearbeiten" sind ausgeblendet.

## [1.13.2] — 2026-04-23

### Changed
- Auftrag-Detail Boxen (Auftraggeber / Ansprechpartner / Location / Lieferung) jetzt **2×2-Grid** auf allen Breiten ab sm statt 4 Spalten auf xl. Jede Box hat mehr Platz, Infos müssen nicht mehr wrappen (z. B. "pixner@startklar-soziale..." abgeschnitten).

## [1.13.1] — 2026-04-23

### Changed
- Auftrag-Detail Header:
  - **Countdown entfernt** — war zu dominant.
  - **Eventtyp-Pill** sitzt jetzt **über** dem Datum statt daneben.
  - **Gebucht + Geändert** als zwei kleine Pillen (Label + Datum) unterhalb der Location — leiser, scanbarer.
- Hilfsfunktion `buildCountdown` entfernt (nicht mehr benutzt).

## [1.13.0] — 2026-04-23

### Added
- Auftrag-Detail Header: **Meta-Zeile unter Location** mit drei Info-Bausteinen (Dot-getrennt):
  - **Countdown zum Event**: „Heute" / „Morgen" / „Gestern" / „In X Tagen" / „Vor X Tagen". Farbe skaliert mit Nähe: `text-primary font-bold` am Eventtag, `primary font-semibold` ≤ 3 Tage, `foreground font-semibold` ≤ 14 Tage, `muted` bei vergangenen Events.
  - **Gebucht am** (entspricht `createdAt`) im Format `23.04.2026`.
  - **Geändert am** (entspricht `updatedAt`) — nur gezeigt wenn abweichend vom Buchungsdatum.

## [1.12.1] — 2026-04-23

### Changed
- Extras-Box: Icons wieder **größer** (`size-7` statt `size-5`), Padding zurück auf `p-3 min-w-[88px]`, Preise **kräftiger** (`text-xs font-mono font-semibold text-foreground/80` statt `text-[10px] opacity-60`) — deutlich besser lesbar.
- Extras-Box Inline-Edit: Papierrollen-Kachel hat jetzt ein **direkt beschreibbares Zahlen-Input** (on click → markiert den Wert, Tippen überschreibt). Save schickt `extraPaperRolls` mit. Kein Umweg mehr übers große Edit-Formular.

## [1.12.0] — 2026-04-23

### Added
- Auftrag-Detail: **Neue Card "Ansprechpartner vor Ort"** neben Auftraggeber. Felder: Name, Telefon (klickbar `tel:`), Notiz (Besonderheiten wie Einfahrt, Etage, Schlüsselhinterlegung). Editierbar über das Auftrag-bearbeiten-Formular. Leere Box zeigt "Nicht erfasst". DB-Spalten: `onSiteContactName`, `onSiteContactPhone`, `onSiteContactNotes` (alle nullable).
- Auftrag-Detail: **Extras-Feld "Extra Papierrolle(n)"** mit Anzahl-Input im Edit-Formular. Wird bei > 0 als eigener Extras-Chip angezeigt (z. B. "Papierrollen ×3"). DB-Spalte: `extraPaperRolls Int @default(0)`.
- Grid der Detail-Boxen (Auftraggeber / Ansprechpartner / Location / Lieferung) jetzt **4 Spalten** auf xl-Breite, 2 auf sm, 1 auf mobile.

## [1.11.2] — 2026-04-23

### Added
- Quick-Edit-Boxen (Lieferung, Fahrer) reagieren auf Tastatur: **Enter speichert**, **Escape verwirft**. Edit-Bereiche sind jetzt `<form>`-Wrapper mit `onSubmit` → Enter in beliebigem Input triggert Save. In Notizen/Intern bleibt Enter = Zeilenumbruch (Textarea-Standardverhalten).

## [1.11.1] — 2026-04-23

### Added
- Auftrag-Detail Lieferung-Box: **Inline-Edit-Pencil** — klicken öffnet Edit-Modus mit 2× Datum + 2× Zeit-Textfeldern für Aufbau und Abbau, Save/Cancel. Kein Sprung mehr ins Edit-Formular nötig.

### Changed
- Lieferung Zeit-Felder sind jetzt **Freitext** statt `type="time"` — erlaubt Einträge wie "vor Ort klären", "Vormittags", "18:30".

### Fixed
- Location-Entfernung wurde trotz vorherigem Fix immer noch `0 km` angezeigt. Ursache: Die `?? null`-Fallback-Kette scheitert an der Zahl `0` (nullish coalescing behandelt nur `null`/`undefined`). Jetzt expliziter `> 0`-Check auf allen drei Quellen (Order → Inquiry → Location). Ein echter `0 km`-Wert muss nun in der Order selbst gespeichert sein, um angezeigt zu werden.

## [1.11.0] — 2026-04-23

### Added
- Auftrag-Detail Edit-Formular: **Neue Section "Lieferung"** mit Feldern für Aufbau-Datum/-Zeit und Abbau-Datum/-Zeit. Bisher konnten diese Felder zwar im Schema existieren, waren aber **nirgends pflegbar** — Lieferung stand immer auf "Noch nicht geplant". PATCH-Route akzeptiert jetzt `setupDate`, `setupTime`, `teardownDate`, `teardownTime`.

### Fixed
- Auftrag-Detail: **Location-Entfernung wird nun korrekt übernommen**. Ursache-Kombination:
  - Order hatte keine eigene `distanceKm`-Spalte; das Feld zog nur aus `inquiry.distanceKm` (bei manuell erstellten Orders = 0).
  - Das Entfernungs-Input im Edit-Formular wurde für Nicht-Privat-Locations `disabled` gesetzt und nie via PATCH mitgeschickt.
  - Fix: neue Spalte `distanceKm Float?` auf Order (Prisma + `sync-schema.cjs`), PATCH-Handler für `distanceKm`, Input nicht mehr disabled, und `page.tsx` kaskadiert beim Laden: `order.distanceKm ?? inquiry.distanceKm ?? matchingLocation.distanceKm`.

## [1.10.3] — 2026-04-23

### Removed
- Auftrag-Detail Edit-Modus: **Drucklayouts-Section entfernt** (letzter Block der Edit-Ansicht). Uploads/Deletes gehen über die Sidebar im View-Modus, damit war die Section im Edit-Formular redundant.

## [1.10.2] — 2026-04-23

### Changed
- Auftrag-Detail Sidebar: Startscreen-Layout-Section sitzt jetzt **unterhalb** des Kunden-Layouts (vorher zwischen Drucklayouts und Kunden-Layout). Reihenfolge: Drucklayouts *oder* Kunden-Layout → Startscreen-Layout → Preiskalkulation → Intern.

## [1.10.1] — 2026-04-23

### Changed
- Auftrag-Detail Header auf Mobile (<640px): Firmenname und Kontaktname stehen jetzt **untereinander** statt in einer Zeile mit Bindestrich. Auf Desktop (≥640px) bleibt die Inline-Darstellung „Firma – Name".

## [1.10.0] — 2026-04-23

### Added
- Auftrag-Detail: Fahrer im Header-Rail ist jetzt **inline editierbar** (Pencil-Icon → zwei Dropdowns für 1. und 2. Fahrer → Save/Cancel). Gleiches UX-Muster wie bei Workflow, Extras, Notizen.

### Changed
- Auftrag-Detail Header: **Workflow- und Fahrer-Header haben jetzt exakt dieselbe interne Struktur** (Header-Zeile `h-5` + Content-Zeile `h-5` + `pb-3 mb-1 border-b`). Dadurch starten der erste Status-Pill ("Bestätigt") und der erste Quick-Action-Button ("Bestätigungslink") auf exakt derselben Horizontalen.
- Auftrag-Detail: Bei **zwei Fahrern** wird jetzt nur noch die **Initialen-Variante** gezeigt (z. B. "JD / AK") statt "Johann Darscht (JD) / Andreas ..." — spart Platz im schmalen Rail und vermeidet Truncation. Bei einem Fahrer bleibt der volle Name.

## [1.9.0] — 2026-04-23

### Added
- Auftrag-Detail Sidebar: **Neues Drag-Feld "Startscreen-Layout"** — eigenes Upload/Delete für Startscreen-Bilder, selbe Funktionsweise wie Drucklayouts. Eigene API-Route `/api/orders/[id]/startscreen-images` und neue DB-Spalte `startscreenImages TEXT[]` (via `sync-schema.cjs` synchronisiert).

### Changed
- Auftrag-Detail Sidebar: **Drucklayouts und Kunden-Layout sind jetzt entweder/oder**. Sobald der Kunde ein Layout via Design-Link erstellt hat (`graphicUrl` gesetzt), verschwindet die Drucklayouts-Sektion. Vorher wurden beide parallel angezeigt, was nie ein valider Zustand war.
- `ImageGallery`-Komponente hat einen neuen `type`-Prop (`"prints" | "startscreen"`), der den API-Endpoint steuert. Alter Call-Site bleibt abwärtskompatibel (Default `"prints"`).

## [1.8.1] — 2026-04-23

### Changed
- Auftrag-Detail Workflow-Spalte: Status-Pills jetzt **untereinander** statt 2×2-Grid, mit Icon + Label linksbündig (analog zu den Quick-Action-Buttons). Workflow-Header-Block hat dieselbe Struktur wie der Fahrer-Block in der Rail (`pb-3 mb-1 border-b`), damit der erste Status-Pill auf der exakt gleichen Höhe startet wie der erste Quick-Action-Button daneben.

## [1.8.0] — 2026-04-23

### Changed
- Auftrag-Detail Header jetzt **3-Spalten-Layout**: links Info (Topline, Datum, Kunde, Location), Mitte **Workflow** (Progress-Bar + 4 Status-Pills im 2×2-Grid + Pencil-Edit), rechts Action-Rail (Fahrer + Buttons). Die separate Workflow-Card im Content-Bereich entfällt — Status und Actions sitzen jetzt kompakt im Header-Block zusammen.

## [1.7.2] — 2026-04-23

### Fixed
- YtdTrendChart: Change-Prozent-Labels werden jetzt tatsächlich angezeigt. Zuvor hatte ich `p.payload` im LabelList-content-Callback abgefragt — das Feld liefert Recharts dort aber nicht. Fix: Row-Lookup per `index` auf dem Daten-Array via Closure.

## [1.7.1] — 2026-04-23

### Fixed
- Build-Fehler behoben: Das options-Array im YtdTrendChart-Zeitraum-Filter wurde vom TS-Compiler nach `.filter()` zu `{ value: number }` verengt und kollidierte mit dem `RangeOption`-Type. Jetzt in zwei Schritten typisiert (erst Array, dann filter).

## [1.7.0] — 2026-04-23

### Changed
- Auftrag-Detail Header: Struktur-Umbau zu **Variante C mit Action-Rail rechts**. Links Info-Block (Meta, Datum, Kunde, Location), rechts separater Rail-Bereich mit Fahrer oben und Actions vertikal gestapelt (Bestätigungslink, Design-Link, PDF, Bearbeiten). Rail nicht sticky. Auf Mobile wrappt die Rail unter den Info-Block.

### Added
- Dashboard Verlaufsgraph: **Change-Prozente** unter jedem Werte-Label (grün/rot je nach Vorzeichen). Kleinere Schrift, mit weißem Outline-Stroke damit sie über der Area-Fill lesbar bleiben.
- Dashboard Verlaufsgraph: **Zeitraum-Filter** (4 / 6 / 8 / Alle) als Segment-Control rechts oben in der Card. Default bleibt 4 Jahre. Serverseitig werden jetzt alle Jahre mit Daten vorgehalten und im Client gefiltert.

## [1.6.0] — 2026-04-23

### Added
- Dashboard: **Standpunkt heute als Verlaufsgraph** (neue Sektion zusätzlich unter den Balken). Zwei Area-Charts (Umsatz orange, Aufträge blau) mit permanent sichtbaren Werte-Labels über jedem Jahres-Datenpunkt — keine Hover nötig.

### Changed
- Aufträge-Tabelle: Trennstrich zwischen Future und Past jetzt in vollem Primary statt primary/60.

## [1.5.3] — 2026-04-23

### Changed
- Auftrag-Detail: Firma und Name sitzen jetzt **in einer Zeile** mit Bindestrich-Trennung statt untereinander.
- Header-Actions neu angeordnet: **1. Bestätigungslink · 2. Design-Link · 3. PDF · 4. Bearbeiten**. Action-Buttons wandern aus dem Workflow-Strip zurück in den Header.
- Fahrer steht jetzt als eigene Pille mit Primary-Icon in der Topline statt als Dot-separierter Plain-Text — deutlich präsenter.
- Extras-Section kompakter: Icons `size-5`, Padding `px-3 py-2`, `min-w-[72px]` statt `p-4 min-w-[90px]` — spart Vertikal-Platz.

## [1.5.2] — 2026-04-23

### Changed
- Aufträge-Tabelle: Der Monats-Header mit dem nächsten Auftrag ist nicht mehr voll-orange; die Zeile mit dem nächsten Auftrag bekommt keinen Primary-Rahmen mehr.
- Stattdessen: **Dicker Trennstrich** (3px Primary/60) zwischen der letzten zukünftigen und der ersten vergangenen Zeile innerhalb eines Monats — macht „ab hier ist Vergangenheit" eindeutig sichtbar.
- Button „Nächster Auftrag" scrollt weiterhin zur ersten zukünftigen Zeile, visuell ist sie aber nicht mehr extra markiert.

## [1.5.1] — 2026-04-23

### Changed
- Dashboard Yearly-Tabs: Balken deutlich besser erkennbar — Non-Current-Year-Balken in `bg-*/25` statt fast-unsichtbarem `bg-accent`, Current-Year-Balken **voll Primary/Blue/etc.** statt `/30`.
- Zahlen aus dem Balken raus auf eine eigene Spalte rechts — in `text-sm` statt 11px, besser scanbar über alle Jahre hinweg.
- Jahr-Labels für das aktuelle Jahr in `text-base font-bold text-primary` statt gleich-klein.
- Change-Prozente prominenter (`text-sm font-bold`).
- Bar/Rechnung-Tab: Zellen-Zahlen auf `text-sm font-bold`, current year voll gefüllt.
- **Extras-Tab als Heatmap**: Zell-Intensität zeigt Häufigkeit (Primary-Gradient), Trends über Jahre auf einen Blick sichtbar.

## [1.5.0] — 2026-04-23

### Changed
- Auftrag-Detailseite "Quiet Hero": Der Hero-Header wurde auf 4 schlanke Zeilen reduziert (Topline mit Meta-Dots · Datum · Kunde · Location). Info-Chips für Fahrer/Zahlart/Firma sitzen jetzt als Plain-Text in der Topline, nicht mehr als bunte Pills.
- Status-Block durch **Workflow-Strip** ersetzt: 4 kompakte Pills statt dicker rot/grün-Kacheln, kleine Progress-Bar ("2/4 erledigt"), Action-Buttons (Bestätigungslink, Design-Link) wandern aus dem Header in den Workflow.
- "Nicht erledigt"-Pills sind jetzt **neutral grau** statt rot — ein frischer Auftrag sieht nicht mehr aus wie ein Alarm. "Bezahlt" wird nur bei vergangenen Events rot markiert.

## [1.4.5] — 2026-04-23

### Changed
- Aufträge-Tabelle: Suchfeld und Action-Buttons (Nächster Auftrag / Filter / Nach Monat) jetzt in einer Zeile. Suchfeld nimmt den verfügbaren Platz, Buttons sitzen daneben. Wrappt auf schmalen Viewports automatisch.

## [1.4.4] — 2026-04-23

### Changed
- Aufträge-Tabelle: Der Monats-Header des Monats mit dem nächsten Auftrag ist jetzt voll Primary-Orange statt abgedunkeltem Tint — aktive Elemente signalisieren sich eindeutiger. Kind-Elemente (Chevron, Zähler, Umsatz) kontrastangepasst.

## [1.4.3] — 2026-04-23

### Fixed
- Dashboard-Chart "Aufträge pro Monat" wieder in Orange — die CSS-Variablen sind im Theme als Hex-Werte definiert, wurden im Chart aber als `hsl(var(--primary))` referenziert und fielen dadurch auf Grau zurück.

## [1.4.2] — 2026-04-23

### Changed
- Dark-Mode `muted-foreground` von `#7c7f8a` auf `#969aaa` aufgehellt — sekundärer Text (z. B. Firmennamen, Locations, Spaltenköpfe, Platzhalter) ist jetzt besser lesbar.

## [1.4.1] — 2026-04-23

### Changed
- Aufträge-Tabelle (Monatsansicht): Monatsgruppen haben jetzt einen eigenen Card-Container mit Rahmen, damit sich die Tabellenzeilen klar vom Seiten-Hintergrund absetzen.
- Tabellen-Header mit dezentem Tint, Zebra-Striping auf den Datenzeilen und weichere Row-Divider — Zeilen lassen sich über 12 Spalten hinweg leichter lesen.
- Hover-Zustand vom harten `accent` auf einen subtileren Tint umgestellt; vergangene Aufträge etwas weniger ausgebleicht (opacity 60 statt 50).

## [1.4.0] — 2026-04-22

### Added
- Stadt-Pages haben 3 pflegbare Bildslots: **Hero** (oben rechts, Hochformat), **Bedienung** (2-Spalter unten links), **Fotoprops / Beste Party** (2-Spalter unten rechts).
- Produkt-Pages (Hochzeit, Firmenfeier, Messe, Weihnachtsfeier, LOVE-Buchstaben, Audio-Gästebuch) haben 1 pflegbaren Bildslot: **Hero**.
- Slot-Labels nennen die Position auf der Seite, damit klar ist wo das Bild landet.

### Changed
- Pro-Slot-Definitionen in `page-definitions.ts` als `CITY_SLOTS` / `PRODUCT_SLOTS` Konstanten zentralisiert — neue Seiten gleichen Typs übernehmen die Slots automatisch.

## [1.3.2] — 2026-04-21

### Changed
- Stadt-Pages (alle 9) haben keine eigene Impressionen-Sektion mehr. Stattdessen zeigt der Editor einen Hinweis, dass die Bilder zentral über "Impressionen (Hauptseite)" laufen. Produkt-Pages (Hochzeit, Firmenfeier, Messe, Weihnachtsfeier, LOVE-Buchstaben, Audio-Gästebuch) behalten eigene Galerien.

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
