# Changelog — Knipserl Admin Console

Alle nennenswerten Änderungen am Admin-Dashboard.
Format orientiert sich an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/),
Versionierung folgt [SemVer](https://semver.org/lang/de/).

## [1.35.5] — 2026-04-30

### Changed
- **Kunden-Anrede überall auf Du umgestellt.** Default-Templates für Anfrage-Zusage/-Absage, Angebots-Mail, Rechnungs-Mail, Auftragsbestätigungs-Mail, der Quote-Form-Default-Text und die Customer-Confirm-Page nutzen jetzt durchgehend du/dir/dein. „Freundliche Grüße" → „Liebe Grüße" passt zur lockereren Tonalität. Driver-Reminder war bereits in du.
- **Nicht angefasst (bewusst):** Datenschutz-/Impressum-Default-Texte (Sie ist da rechtlich konventionell sicherer), Admin-UI-Toasts (Admin spricht mit sich selbst, keine Kundenkommunikation).

## [1.35.4] — 2026-04-30

### Fixed
- **Logo wurde verzerrt im E-Mail-Header.** `width="160"` HTML-Attr passte nicht zum tatsächlichen Aspect-Ratio des Logos (250×69 px → bei height=48 muss width=174 sein). Outlook und Co. ignorieren `width:auto` im CSS und benutzen das HTML-Attribut → Logo wurde gestaucht. Width auf 174 fixiert, sieht jetzt proportional korrekt aus.

### Changed
- **Default-Templates für Anfrage-Bestätigung/-Absage komplett neu formatiert.** Nutzen jetzt `<strong>` für Hervorhebungen, `<hr>` für Trennlinien zwischen Sektionen (Anrede / Fakten / Schluss), und einen orange `<a>`-Link zur Kontakt-Mail. Wirken nicht mehr wie Auto-Spam-Sermon, sondern wie eine kuratiert geschriebene Nachricht.
- **`nl2br` ist schlauer rund um `<hr>`.** Wenn die Source-Vorlage einen `<hr>` mit Leerzeilen davor/dahinter hat, würde der naive `\n→<br>`-Convert doppelte Abstände erzeugen. Adjacente `<br>`s werden jetzt vor und nach `<hr>` weggeräumt — der `<hr>` bringt eh seinen eigenen Margin mit.
- **`DEFAULT_INQUIRY_TEMPLATES` aus `lib/inquiry-email.ts` exportiert.** `page.tsx` und `api/settings/email-templates/route.ts` lesen den Default jetzt zentral — kein Drift mehr zwischen den Stellen, die den Fallback definieren.

## [1.35.3] — 2026-04-30

### Fixed
- **E-Mail-Layout: Dark-Mode-Härtung gegen Outlook/Gmail.** Die ausgehenden Mails wurden in Mail-Clients mit aktivem Dark-Mode (Outlook 365, Outlook.com, Gmail web/mobile) komplett invertiert — weißer Hintergrund verschwand, dunkler Text wurde unleserlich, Logo (dunkle Variante) verschmolz mit dem dunklen Hintergrund. Mehrschicht-Fix:
  - `<meta name="color-scheme" content="light only">` + `<meta name="supported-color-schemes" content="light">` zwingt Clients, die Light-Mode-Hints respektieren (Apple Mail, modernes Outlook web).
  - Layout von `<div>` auf `<table>` mit `bgcolor`-HTML-Attributen umgestellt — Tables sind älter und werden von Dark-Mode-Override-Logiken seltener angefasst.
  - `[data-ogsc]`-CSS-Selektoren mit `!important` setzen Hintergrund und Textfarben in Outlook 365 Dark-Mode zurück auf Light.
  - `@media (prefers-color-scheme: dark)`-Block für Apple Mail / mobile Clients als zusätzliche Verteidigung.
  - Klassen `force-light-bg`, `force-light-text`, `force-muted-text` markieren explizit, was light bleiben muss.

## [1.35.2] — 2026-04-30

### Fixed
- **Zeilenumbrüche in Inquiry-Mails kamen beim Empfänger zusammengeklebt an.** `white-space:pre-line` (CSS) wird von vielen Mail-Clients (Outlook desktop, Word-basierter Renderer u.a.) ignoriert — Browser-Vorschau zeigte korrekte Absätze, der Versand-Output mashed alles in eine einzige Zeile. Fix: nach Variablen-Substitution werden alle `\n` hart zu `<br>` konvertiert. `<br>` rendert in jedem Mail-Client gleich, Vorschau und gesendete Mail sehen jetzt identisch aus.

## [1.35.1] — 2026-04-30

### Added
- **Logo im E-Mail-Header.** Das Knipserl-Logo (`/knipserl-logo.png`) wird oben in jeder Mail zentriert auf weißem Grund angezeigt, dadrunter eine dünne orange Akzentlinie als Brand-Trennung. Logo-URL ist konfigurierbar via `EMAIL_LOGO_URL` env, Default ist `${NEXT_PUBLIC_APP_URL}/knipserl-logo.png`.
- **HTML-Formatierung im Mail-Body unterstützt.** Im Editor kann jetzt HTML eingegeben werden — `<strong>`, `<em>`, `<a>`, `<ul>`/`<li>`, `<br>` etc. rendern. Plain Text mit Zeilenumbrüchen funktioniert weiterhin parallel (via `white-space:pre-line`). Im Editor steht ein neuer „HTML-Formatierung"-Hinweisblock mit Code-Beispielen neben den Platzhalter-Variablen.
- **Footer mit Kontakt-Links.** Im Footer der Inquiry-Mails stehen jetzt `info@knipserl.de` und `knipserl.de` als klickbare Links statt nur Firmenname.

### Changed
- **Sicheres HTML-Templating: nur Variablen-Werte werden escaped, nicht das Admin-getippte Template.** Neue Funktion `replaceInquiryVarsHtml()` (Lib `inquiry-email.ts`) ersetzt Platzhalter und HTML-escape die Werte gleichzeitig — z.B. ein Kundenname „Müller & Schulz" wird zu `Müller &amp; Schulz` im HTML eingesetzt. Templates können HTML enthalten, Kundendaten können XSS-Versuche nicht durchschmuggeln. Subject bleibt plain (Mail-Header-Field, Graph API behandelt Subject als Text).
- **Sanftere Border-Radius (14px) und Schatten am Mail-Container.** Wirkt weniger steril.
- **Untertext „Diese E-Mail wurde automatisch versendet."** unter dem Mail-Container — kleiner grauer Hinweis, signalisiert Empfängern dass es kein direktes 1:1-Antwort-Szenario ist.

## [1.35.0] — 2026-04-30

### Added
- **Zentrales E-Mail-Layout in `lib/email-layout.ts`.** Eine wiederverwendbare `emailLayout()`-Funktion liefert das Grund-Template für alle ausgehenden Mails: 600px max-width zentriert (nicht full-width), oranger Brand-Banner mit Titel + optionaler Subline, weiße Content-Box mit weichem Schatten und 12px Border-Radius, grauer Footer. Inline-Styles für maximale Mail-Client-Kompatibilität (Outlook, Gmail, Apple Mail). Alle künftigen Mail-Typen ziehen diesen Wrapper, Layout-Änderungen passieren an einer Stelle.

### Changed
- **Anfrage-Mails (Zusage/Absage) sind jetzt gebrandet.** Vorher kam der Body nackt im weißen Container an — jetzt mit Knipserl-Banner oben, sauberer Content-Padding, Footer mit Firmenname. Test-Mail im Editor und echter Versand an den Kunden rendern identisch.
- **`email-templates.ts` (Angebote, Rechnungen, Bestätigungen, Fahrer-Reminder) zieht das neue Layout.** Visuelles Ergebnis fast unverändert (war schon ähnlich), aber jetzt durch den shared Wrapper — DRY und konsistent. Border-Radius, weicher Schatten und Padding sind dabei minimal aufgeräumt.

## [1.34.2] — 2026-04-30

### Changed
- **Admin-E-Mail in Seed- und Import-Scripts auf `info@knipserl.de` umgestellt.** Vorher hieß der seed-Admin `admin@knipserl.de` — passte aber nicht zur tatsächlich genutzten Adresse (`info@knipserl.de`, identisch mit der Firmen-E-Mail). Betrifft: `prisma/seed.ts`, `prisma/full-import.ts`, `prisma/import-buchungen.ts`. Bestehende Live-DB-Records mit `admin@knipserl.de` müssen einmal manuell auf `info@knipserl.de` umgestellt werden.

## [1.34.1] — 2026-04-30

### Added
- **„Test senden"-Button im E-Mail-Template-Editor.** Neben dem Speichern-Button steht jetzt ein zweiter Button, der eine echte Test-Mail mit den Sample-Werten an die E-Mail-Adresse des eingeloggten Admins (aus der Session) schickt. Subject wird mit `[TEST]` prefixiert, damit man's im Posteingang sofort erkennt. Versand läuft über denselben Microsoft-Graph-Pfad wie der echte Kundenversand — was beim Test ankommt, ist 1:1 was beim Kunden ankäme.

### Changed
- **Inquiry-Mail-Wrapper in eigenes Lib-Modul ausgelagert.** `wrapInquiryEmailHtml`, `replaceInquiryVars` und `getSampleInquiryVars` liegen jetzt in `src/lib/inquiry-email.ts` und werden von Send-Code (`api/inquiries/[id]/route.ts`), Live-Preview und Test-Send gleichermaßen genutzt — kein Drift mehr zwischen den drei Stellen.

## [1.34.0] — 2026-04-30

### Added
- **Live-HTML-Vorschau für E-Mail-Templates.** Neben jedem Editor (Betreff + Nachricht) rendert jetzt eine Iframe-Preview die E-Mail genau so, wie sie beim Versand beim Kunden ankommt — inkl. dem grauen Mail-Client-Hintergrund, dem weißen 600px-Inhalts-Container und der korrekten Schrift-/Zeilenhöhe. Platzhalter wie `{{customerName}}` werden mit Beispielwerten (Maria Müller, Hochzeit, Veranstaltungssaal Fendlhof, …) gefüllt, damit man direkt sieht, wie das Endergebnis aussieht. Der Wrapper spiegelt 1:1 den Code in `api/inquiries/[id]/route.ts` — beim Versand und in der Vorschau identisch.
- **Betreff-Vorschau über dem Iframe.** Zeigt den Betreff mit aufgelösten Platzhaltern, sodass auch der Subject-Line-Test sichtbar ist.

### Changed
- **Editor-Layout: zwei Spalten auf Desktop.** Editor links, Preview rechts (`lg:grid-cols-2`), darunter gestapelt auf Mobile. Die Textarea ist auf 420px Höhe gewachsen, damit sie an die Iframe-Höhe angeglichen ist.

## [1.33.5] — 2026-04-29

### Changed
- **Header-Menübutton: Hamburger-Icon mit „MENÜ"-Label.** Statt des kleinen, kontrastarmen Panel-Toggle-Icons (das mobil fast unsichtbar war) zeigt der Header jetzt links ein klassisches Hamburger-Icon (drei Striche) plus den Schriftzug „MENÜ" in Versalien. Klar erkennbar als Trigger fürs Slide-Out-Menü, gilt für Mobile und Desktop einheitlich.

## [1.33.4] — 2026-04-29

### Added
- **Anzahl-Badges in der Fahrer-Sidebar.** „Freie Aufträge" und „Meine Aufträge" zeigen rechts in der Sidebar einen kleinen Badge mit der Anzahl: emerald-Ton für freie Aufträge (Opportunity), Primary für eigene. Wenn die Zahl 0 ist, erscheint kein Badge — ruhige Sidebar bei leerer Liste. Counts werden serverseitig im Layout geholt, sodass kein Flackern oder Loading-State entsteht.

### Removed
- **Light Mode komplett entfernt.** Der „Light Mode"/„Dark Mode"-Toggle in der Sidebar ist weg, der globale ThemeProvider läuft jetzt mit `forcedTheme="dark"`. Damit sind alle Light-Klassen-Pfade deaktiviert, das Dashboard ist überall durchgehend dark.

## [1.33.3] — 2026-04-29

### Changed
- **Adaptiver „Nächste Fahrt"-Hero im Fahrer-Dashboard.** Der orange Hero erscheint nur noch, wenn die nächste Fahrt **innerhalb von 14 Tagen** ist — dann mit allem, was relevant ist: Aufbau- und Abbau-Boxen (grün/rot, Datum + Zeitfenster), Extras-Tags, Vergütung in grün, Maps-Button. Bei weiter entfernten Fahrten verschwindet der Hero komplett — die Statistik-Kacheln (Frei/Meine/Kalender) füllen die volle Breite und die Auftragsliste rückt direkt in den Fokus, mit dem Titel „Anstehende Aufträge" (statt „Weitere Aufträge").
- **Hero zeigt jetzt dieselben Infos wie die Listen-Karten.** Vorher fehlten im Hero gerade die für Fahrer relevantesten Felder (Aufbau/Abbau-Termine, Vergütung) — die Karte unten war reicher als der Hero oben. Jetzt ist der Hero die mit Abstand vollständigste Auftragsdarstellung auf dem Dashboard.

## [1.33.2] — 2026-04-29

### Changed
- **Fahrer-Dashboard: keine Auftrags-Doppelung mehr zwischen Hero und Liste.** Der Auftrag, der im „Nächste Fahrt"-Hero steht, taucht nicht mehr als erster Eintrag in der Liste darunter auf. Liste heißt jetzt „Weitere Aufträge" und enthält nur, was nach dem Hero kommt — bei nur einem Auftrag insgesamt entfällt die Liste komplett.
- **Reichere Auftrags-Karten im Fahrer-Dashboard.** Die Listen-Cards zeigen jetzt zusätzlich die Aufbau- und Abbau-Boxen (grün/rot, mit Datum + Zeitfenster), Extras-Tags (Drucker, Props, Stick, …), Vergütung und einen expliziten „Details"-Button. Visuell identisch zur Karte unter „Meine Aufträge" — beide nutzen jetzt dieselbe Komponente, damit künftige Änderungen an einer Stelle landen.

## [1.33.1] — 2026-04-29

### Added
- **„Erinnerungen" als eigener Sidebar-Punkt für Fahrer.** Die Auftrags-Erinnerungs-Einstellungen (E-Mail an/aus, Vorlauf in Tagen) liegen jetzt unter `/reminder-settings` mit Briefumschlag-Icon, ganz unten in der Fahrer-Sidebar.

### Changed
- **Anstehende Aufträge im Dashboard als Boxen-Layout.** Statt der schmalen Tag-Gruppierungs-Liste rendert das Dashboard jetzt jede Fahrt als eigene Karte mit Datum-Block links (Wochentag + Tag-Nummer + Monat in Primary-Akzent) und Inhalt rechts (Location, Adresse, Kunde, Eventtyp, Countdown, „Nächste"-Badge). Dasselbe Format wie auf der „Freie Aufträge"-Seite, nur in Markenfarbe statt Emerald.
- **Reminder-Settings aus dem Dashboard raus.** Damit die Startseite nicht mit Konfiguration zugemüllt ist — gehört in die eigene Einstellungs-Seite.

## [1.33.0] — 2026-04-29

### Added
- **Fahrer-Dashboard zeigt alle anstehenden Aufträge.** Statt nur die nächsten 7 Tage / max. 5 Aufträge listet das Dashboard jetzt sämtliche eigenen, nicht abgesagten Aufträge ab heute. Die Section heißt entsprechend „Anstehende Aufträge".
- **Tag-Gruppierung in der Liste.** Aufträge mit demselben Datum werden unter einem gemeinsamen Tag-Header gebündelt (z.B. „Heute · in 0 Tagen", „Morgen · Morgen", „Samstag, 27. Juni 2026 · in 8 Wochen") — bei zwei Aufträgen am gleichen Tag erscheint ein „2 Aufträge"-Badge rechts. Dadurch entsteht keine wiederholte Datum-Box mehr, wenn der Fahrer mehrere Termine an einem Tag hat.

### Changed
- **Auftragsdetail-Header bekommt den Fahrer-Hero-Verlauf (Test).** Der „Hero"-Block der Auftragsdetail-Seite (Datum, Name, Location) liegt jetzt in derselben Karten-Optik wie das Fahrer-Dashboard: weicher Orange-Verlauf von oben links nach unten rechts (`from-primary/[0.08]` über `via-primary/[0.04]` zu `transparent`), mit dünner orange Border und 24px Abrundung.

## [1.32.2] — 2026-04-29

### Changed
- **Fahrer-Navigation: Slide-Out-Menü statt Bottom-Nav.** Die mobile Bottom-Leiste ist wieder weg, Fahrer nutzen auf Mobile (wie Admin) den vorhandenen Sidebar-Trigger oben links. „Dashboard" ist jetzt der erste Eintrag in der Fahrer-Sidebar (über „Alle Aufträge"), mit dem klassischen Dashboard-Icon — vorher musste man dafür aufs Logo klicken.
- **Fahrer-Dashboard nutzt jetzt die volle Inhaltsbreite.** Die `max-w-6xl`-Begrenzung war auf Desktop schmaler als alle anderen Seiten (Aufträge, Kalender, etc.) und hat dort gegen die Sidebar geschlagen. Inhalt füllt jetzt die normale Spalten-Breite, das zweispaltige Layout (Hero + Schnellaktionen oben, Diese Woche + Sidebar unten) bleibt.

## [1.32.1] — 2026-04-29

### Added
- **„Alle Aufträge" in der Fahrer-Bottom-Nav.** Sechstes Tab zwischen „Start" und „Frei", führt zur kompletten Auftragsliste. Labels und Icons leicht verkleinert, damit alle 6 Items sauber auf Mobile passen.

### Changed
- **Fahrer-Dashboard auf Desktop deutlich besser.** Container ist jetzt `max-w-6xl` statt `3xl`, Inhalt wird auf `lg+` zweispaltig: oben Hero (2/3) + Schnellaktionen (1/3) nebeneinander, darunter „Diese Woche" (2/3) + Urlaub/Reminder (1/3) als rechte Sidebar. Hero und Headline werden auf großen Screens etwas größer (Headline `text-3xl`, Location `text-2xl`, mehr Padding). Auf Mobile bleibt alles einspaltig in der gewohnten Reihenfolge.

## [1.32.0] — 2026-04-29

### Added
- **Eigenes Fahrer-Dashboard auf der Startseite.** Loggt sich ein Fahrer ein oder klickt auf das Logo, sieht er nicht mehr das Admin-Reporting (KPI-Boxen, Jahresvergleich, Charts), sondern eine eigene fahrerspezifische Übersicht: Hero-Karte „Nächste Fahrt" mit Datum, Location, Kunde und „Route in Google Maps"-Button; drei Schnellaktions-Kacheln mit Live-Counter (Frei / Meine / Kalender); „Diese Woche"-Liste mit den nächsten max. 5 eigenen Aufträgen; Hinweis-Box bei aktivem oder kommendem Urlaub; Reminder-Einstellungen direkt unten. Listen, Auftragsdetail und Kalender bleiben unverändert die bekannten Seiten.
- **Bottom-Navigation für Fahrer auf Mobile.** Auf kleinen Screens erscheint im Fahrer-View eine fixierte Leiste am unteren Rand mit fünf Tabs (Start · Frei · Meine · Kalender · Urlaub). „Frei" wird in Emerald als Akzent gehighlightet — auch idle leicht eingefärbt. Auf Desktop bleibt die normale Sidebar; die Bottom-Nav ist dort ausgeblendet.

## [1.31.0] — 2026-04-28

### Added
- **Fahrer im Kalender ein- und ausblenden (Outlook-Stil).** Die Fahrer-Pillen in der Legende über dem Kalender sind jetzt klickbare Toggles — ein Klick blendet alle Aufträge und Urlaubsbalken dieses Fahrers aus, ein zweiter Klick wieder ein. Versteckte Fahrer werden ausgegraut und durchgestrichen dargestellt, das Initialen-Badge wird durch ein „Auge-zu"-Symbol ersetzt. Wirkt auf Monats- und Listenansicht. Bei Aufträgen ohne Fahrer erscheint zusätzlich eine graue „Kein Fahrer"-Pille, die separat ausgeblendet werden kann. Sind Fahrer ausgeblendet, zeigt rechts neben den Pillen ein „Alle einblenden (n)"-Link in Primärfarbe, mit dem alles in einem Klick zurückgesetzt wird. Die Auswahl wird in `localStorage` (`calendar-hidden-drivers`) gespeichert und bleibt damit über Page-Reloads, Monatswechsel und Browser-Sessions erhalten. Nebenbei mitgenommen: Fahrer, die im aktuellen Monat zwar Urlaub haben aber keinen Auftrag, tauchen jetzt ebenfalls in der Legende auf — vorher fehlten sie und ihr Urlaubsbalken hatte keinen erklärenden Pin.

## [1.30.2] — 2026-04-28

### Fixed
- **„Aufbau"-Position in der Intern-Box war zu niedrig.** Sie zeigte nur die Aufbau-Pauschale (`setupCost`) und ignorierte die Boni — dadurch wurde der „Gewinn" um die Bonus-Summe zu hoch ausgewiesen. Beispiel-Auftrag mit 80 € Pauschale + Hintergrund (20) + TV (30) + Telefon (10): vorher Aufbau 80 € / Gewinn +60 € zu hoch; jetzt Aufbau 140 € / Gewinn korrekt. Bei Zweitfahrer bleibt der Aufbau-Betrag unverändert (volle Personalkosten = was insgesamt rausgeht, 50/50-Aufteilung passiert nur in der Vergütungsbox).

## [1.30.1] — 2026-04-28

### Fixed
- **Build-Failure auf CI nach 1.30.0**: `lib/driver-compensation.ts` enthielt sowohl pure Berechnungs-Helper als auch den DB-Loader (`prisma`-Import). Da Client-Components (Vergütungs-Box, Driver-Report-View) die pure Helper importierten, zog Turbopack den ganzen File inkl. `pg`/`prisma`-Stack in den Browser-Bundle und scheiterte an `dns`/`fs`/`net`/`tls`. Loader nach `lib/driver-bonus-loader.ts` ausgelagert; pure Helper bleiben in `driver-compensation.ts`.

## [1.30.0] — 2026-04-28

### Added
- **Fahrer-Bonus pro Extra** — die Vergütung eines Fahrers ist jetzt nicht mehr nur die Aufbau-Pauschale (`setupCost`), sondern zusätzlich ein konfigurierbarer Bonus je gebuchtem Extra. Default-Sätze: Gästetelefon 10 €, Hintergrundsystem 20 €, TV 30 €, LOVE Buchstaben 30 €. In den Einstellungen unter `/settings/extras-pricing` editierbar — neue zweite Spalte „Vergütung Fahrer".
- **Vergütungs-Box auf der Auftragsdetail-Seite.** Fahrer sehen statt der „Intern"-Box jetzt eine eigene grüne Box „Deine Vergütung" mit Aufschlüsselung: Aufbau-Pauschale + ein Eintrag pro Bonus-Extra + Summe. Admins behalten die „Intern"-Box (Kundenpreis/Gewinn/Zahlweise) und sehen die Vergütungs-Box zusätzlich.
- **Zweitfahrer-Aufteilung 50/50.** Aufträge mit `secondDriverId` zeigen unter der Vergütung einen Hinweis-Block „50/50-Aufteilung mit [Name]" und teilen die Vergütung zwischen beiden Fahrern. Der Buchhaltungs-Report (`/accounting/driver-report`) erfasst jetzt beide Fahrer und summiert pro Fahrer den Anteil; Einsätze mit Aufteilung sind mit „50/50"-Badge markiert.

### Changed
- **Bonus wird pro Auftrag eingefroren.** Beim Anlegen eines Auftrags und beim Ändern der Extras wird ein Snapshot der aktuell konfigurierten Boni in der neuen Spalte `Order.driverBonus` (JSONB) gespeichert. Spätere Änderungen an den Bonus-Sätzen wirken nicht rückwirkend auf bereits existierende Aufträge — was dem Fahrer für seinen Auftrag versprochen wurde, bleibt stehen.
- **Alt-Aufträge ohne Snapshot** zeigen einen Live-Fallback aus den aktuellen Settings an; markiert mit einem kleinen „Live"-Badge in der Vergütungs-Box, damit klar ist, dass der Wert sich noch ändern kann. Wird beim noch ausstehenden Initial-Re-Import sauber nachgezogen.
- **Driver-Report**: Spalte „Fahrten" → „Einsätze" (zwei Fahrer auf einem Auftrag = zwei Einsätze). Vergütung pro Eintrag = Aufbau-Pauschale + Bonus, ggf. halbiert.

## [1.29.2] — 2026-04-28

### Fixed
- **Zurück-Pfeil auf der Auftragsdetail-Seite springt jetzt zur tatsächlichen Herkunftsliste.** Vorher war der Pfeil hartverdrahtet auf `/orders` (Alle Aufträge) — wer also aus „Freie Aufträge" oder „Meine Aufträge" auf einen Auftrag geklickt hat, landete auf „Zurück" in der falschen Ansicht und musste sich neu orientieren. Jetzt nutzt der Button `router.back()`, prüft per `document.referrer` und `history.length` ob der Vorgänger zur App gehört, und fällt nur bei Direct-Link/externem Referrer auf `/orders` zurück.

## [1.29.1] — 2026-04-28

### Changed
- **„Freie Aufträge" und „Meine Aufträge" optisch und strukturell angeglichen.** Beide Seiten teilen sich jetzt dieselbe Card-Sprache (gleiche Header-Box mit Icon + Titel + Untertitel, gleiches Card-Layout mit Name oben, Info-Grid darunter, Status-Badge rechts oben, Action-Button rechts). Beim Wechsel zwischen den beiden Seiten muss man sich nicht mehr neu orientieren.
- **„Freie Aufträge" zeigt jetzt zusätzlich den Ort.** Statt nur des Locationnamens steht in der Karte z.B. „Gasthaus Bartl · Halfing" — die Stadt wird aus der Adresse extrahiert. Hilft beim Einschätzen, ob ein Auftrag geografisch passt, ohne erst die Detailseite öffnen zu müssen.
- **„Freie Aufträge" Desktop-Layout aufgeräumt.** Statt der hohen, halbleeren Karten mit Übernehmen-Button isoliert unten rechts liegen Status-Badge und Übernehmen-Button auf Desktop jetzt in derselben Reihe wie die Info-Items — kompakter und scannbarer.
- **„Meine Aufträge" deutlich lesbarer.** Vorher war die Seite sehr blass (zinc-500/600 Texte, white/[0.02] Hintergründe) und die Schrift teils auf 9–11px gequetscht. Jetzt nutzen alle Karten die regulären Theme-Farben (`text-foreground`, `text-muted-foreground`, `bg-card`), Schriftgrößen entsprechen denen von „Freie Aufträge". Die Tabs „Anstehend"/„Erledigt" sind im aktiven Zustand jetzt voll in Primary-Orange statt nur leicht aufgehellt.

## [1.29.0] — 2026-04-28

### Added
- **Übernehmen-Button auf der Seite „Freie Aufträge"** (`/free-orders`). Jeder freie Auftrag wird als Karte mit Datum, „in X Tagen"-Badge, Eventtyp, Location und Distanz angezeigt; ein grüner „Übernehmen"-Button greift den Auftrag direkt für den eingeloggten Fahrer (oder den impersonierten Fahrer im Admin-Modus) und setzt `status: ASSIGNED`. Der Button nutzt den bestehenden `PATCH /api/orders/[id]` mit `driverId: "self"` — der Endpoint hat die Self-Claim-Logik schon länger.

### Changed
- **„Meine Aufträge" aufgeräumt — der „Offen"-Tab ist weg.** Vorher zeigten sowohl `/my-orders` (Tab „Offen") als auch `/free-orders` dieselbe Liste freier Aufträge. Jetzt gehört Übernehmen-Workflow eindeutig zu „Freie Aufträge", `/my-orders` zeigt nur noch die zwei sinnvollen Tabs **„Anstehend"** und **„Erledigt"** (vorher „Zugewiesen" und „Erledigt", umbenannt für Klarheit).

## [1.28.0] — 2026-04-28

### Added
- **Neuer Bereich „Freie Aufträge" (`/free-orders`)** — listet alle offenen Aufträge ohne zugewiesenen Fahrer (status = OPEN, weder primary noch secondary Driver, ab heute). Nutzt die bestehende Orders-Tabelle, leerer Zustand mit eigenem Hinweis.

### Changed
- **Fahrer-Sidebar in fünf Punkten in Wunsch-Reihenfolge**: Alle Aufträge → Freie Aufträge → Meine Aufträge → Kalender → Abwesenheit. „Aufträge" wurde umbenannt zu „Alle Aufträge" für Klarheit gegenüber den anderen Listen.

## [1.27.1] — 2026-04-28

### Changed
- **Fahrer-Sidebar flach statt im Akkordeon.** Bisher war der gesamte Driver-Nav (Meine Aufträge, Aufträge, Kalender, Abwesenheit) unter einem ausklappbaren Punkt „Übersicht" versteckt — bei nur vier Einträgen unnötiger Klick. Jetzt liegen alle vier Punkte direkt als Top-Level-Links mit eigenem Icon in der Sidebar. Reihenfolge: Meine Aufträge → Aufträge → Kalender → Abwesenheit.

## [1.27.0] — 2026-04-28

### Added
- **Passwort-Reset für Fahrer-Accounts direkt im UI.** Auf der Detail-Seite eines Fahrers (`/drivers/[id]`) gibt es eine eigene Karte „Passwort zurücksetzen": Klick auf „Neues Passwort generieren" erzeugt sofort ein 12-Zeichen-Passwort (Web Crypto API, verwechslungsarmes Charset ohne 0/O/1/I/l), zeigt es in einem Eingabefeld mit Sichtbar-Toggle, Kopier-Button und Re-Generate-Button. Erst der „Passwort speichern"-Button persistiert den neuen bcrypt-Hash. Der Admin sieht das Klartext-Passwort genau einmal — danach nur noch der Hash in der DB.
- **Sicheres Passwort beim Anlegen eines Fahrers.** Auf `/drivers/new` ist das Passwort-Feld jetzt Pflichtfeld (mind. 8 Zeichen). Daneben ein „Generieren"-Button (gleicher Generator wie beim Reset) plus Sichtbar- und Kopier-Buttons.

### Changed
- **`POST /api/drivers` verlangt jetzt `password` im Request-Body.** Vorher fiel die Route bei fehlendem Passwort silently auf den globalen Default `knipserl123` zurück — eine echte Sicherheitslücke, weil jeder Fahrer ohne explizit gesetztes Passwort identisch einlogbar war. Bei fehlendem oder zu kurzem Passwort kommt jetzt 400.
- **`PATCH /api/drivers/[id]` akzeptiert optional `password`** und schreibt einen frischen bcrypt-Hash. Min. 8 Zeichen, sonst 400.
- **GET/PATCH `/api/drivers/[id]` strippen den `passwordHash` aus dem Response.** Damit das UI keinen Hash unbeabsichtigt zu Gesicht bekommt, auch wenn niemand danach fragt.

### Security
- Default-Passwort `knipserl123` aus dem POST-Endpoint entfernt — siehe oben.
- Hash-Strippung im GET/PATCH-Response — defense in depth.

## [1.26.1] — 2026-04-28

### Changed
- **Mobile-Optimierung der Besucherstatistik** (`/statistics`):
  - Tab-Leiste scrollt horizontal statt zu umbrechen, lange Labels werden auf Mobile gekürzt („Seitenaufrufe" → „Aufrufe", „Anfrage-Funnel" → „Funnel").
  - Filter-Bereich stackt sauber: Domain-Pillen oben (eigener horizontaler Scroll), Range-Picker (7/30/90 T.) darunter — kein verschobener Spacer mehr.
  - KPI-Boxen kompakter: `p-3` statt `p-4` und Werte `text-xl` statt `text-3xl` auf Mobile.
  - Tabellen mit vielen Spalten (Top Seiten, UTM-Kampagnen, Letzte Ereignisse, Live-Visitors) zeigen auf Mobile ein kompaktes Card-Layout statt sich horizontal zu quetschen — auf ≥ sm bleibt die klassische Tabelle.
  - Top-Referrer wird zur einfachen Liste (Referrer + Aufrufe), die Tabelle war auf Mobile nur Overhead.
  - Browser- und OS-Bars: auf Mobile als horizontale Tailwind-Bars mit Label statt recharts (das schnitt Browser-Namen wegen fixer YAxis-Breite ab).
  - Funnel-Schritte: Conversion-Label auf Mobile gekürzt („50.0%" statt „50.0% Conversion"), Wert-Schrift auf Mobile `text-lg` statt `text-2xl`.
  - Live-Headline: auf Mobile bricht die „Aktualisiert vor … Sek."-Zeile in eine eigene Zeile um, statt sich neben den großen Zähler zu zwängen.
- **Mobile-Header**: Klick aufs Knipserl-Logo führt jetzt zum Dashboard (`/`). Vorher war es ein nicht klickbares `<img>`.

## [1.26.0] — 2026-04-28

### Added
- **Live-Tab in der Besucherstatistik (`/statistics`)** — zeigt Besucher, die gerade jetzt auf der Webseite sind.
  - Neuer 5. Tab „Live" mit pulsierendem grünen Indicator + aktueller Anzahl direkt im Tab-Badge (auch sichtbar von anderen Tabs aus).
  - Aktiv-Definition: Session mit Pageview in den letzten 5 Minuten.
  - Großer Live-Headliner mit Anzahl + Window-Hinweis + „aktualisiert vor X Sek".
  - Aufschlüsselungen: aktuelle Seiten (Balkenliste mit Prozent), Geräte (Chips mit Icon), Referrer (jetzt aktive externe Quellen).
  - Detailtabelle „Wer ist gerade da" mit Zeile pro Session: Gerät+Browser+OS+Sprache, aktuelle Seite, Quelle/Referrer, Anzahl Aufrufe in der Session, „Auf Seite seit …", „Letzte Aktivität vor …".
  - Polling: 10 s wenn Live-Tab aktiv, 30 s im Hintergrund (für Badge-Update). Pausiert komplett, wenn der Browser-Tab nicht sichtbar ist (`visibilitychange`).
  - Sekunden tickern client-seitig zwischen Pollings, damit „vor X Sek." nicht stehen bleibt.
- **API-Endpunkt `GET /api/statistics/live`** — Auth-geschützt (nur ADMIN), ungecached. Liefert `activeCount`, `visitors[]` (max. 25 mit gekürztem Session-Hash), `byPath`, `byDevice`, `byReferrer`. Domain-Filter via `?domain=…`.

### Fixed
- **`analytics_daily_salts`-Tabelle wurde nicht angelegt** — der generische `sync-schema`-Loop erkennt nur Spalten namens `id`/`key` als Primary Key und übersprang daher die Salt-Tabelle (PK ist `date`). Folge: jeder Salt-Aufruf crashte mit `P2021 TableDoesNotExist`, der Webseite-Tracker bekam `{"ok":true,"skipped":"no_salt"}` und verwarf alle Pageviews. Manuelles `CREATE TABLE` für `analytics_daily_salts` vor dem Loop ergänzt.

## [1.25.0] — 2026-04-28

### Added
- **Eigene Webanalyse-Konsole unter `/statistics`** — Ersatz für Google Analytics, vollständig DSGVO-konform und cookielos.
  - Vier Tabs: **Seitenaufrufe** (KPIs heute/7T/30T, Unique Besucher, Ø Verweildauer, Ø Scroll-Tiefe, Bounce-Rate, Bot-Aufrufe, Verlaufschart, Top-Domains-Donut, Top-Seiten- und Top-Referrer-Tabellen), **Besucher** (Geräte-Pie, Browser- und OS-Bars, Sprachen, Bildschirmauflösungen, UTM-Quellen + UTM-Kampagnen-Tabellen), **Ereignisse** (KPIs für heute/Bereich/Anfragen/Kontakte, Tages-Bar-Chart, Aufschlüsselung nach Typ, Liste der letzten 40 Ereignisse), **Anfrage-Funnel** (3-Stufen-Funnel für Anfrage und Kontakt mit Conversion-Raten je Schritt und Gesamt).
  - Domain-Filter (Pillen) + Zeitraum-Wahl (7/30/90 Tage). Filter-Werte werden in der URL gespiegelt, damit ein Refresh den Zustand erhält.
  - Sichtbar nur für Rolle `ADMIN` — andere Rollen werden auf `/` umgeleitet.
- **Tracking-Ingest-API** (Webseite-Proxy → Admin):
  - `GET  /api/track/salt` — liefert das täglich rotierte Salt für IP+UA-Hashing, geschützt durch Shared-Secret-Header `X-Track-Secret`. Wird vom Webseite-Server 60s in-process gecached.
  - `POST /api/track/ingest/pageview` — speichert eine Pageview, gibt die ID zurück.
  - `PATCH /api/track/ingest/pageview` — reicht `durationMs` + `scrollPct` nach (per Beacon vom Tracker beim Verlassen).
  - `POST /api/track/ingest/event` — speichert ein Custom-Event (`anfrage_started`, `anfrage_submitted`, `kontakt_started`, `kontakt_submitted`, …).
- **Server-Side User-Agent-Parser + Bot-Filter** in `src/lib/analytics.ts` — fängt die offensichtlichsten Crawler ab (Googlebot, Bingbot, Headless-Chrome, Lighthouse, PageSpeed, Social-Bots etc.).
- **Datenschutzerklärung-Default-HTML** (`settings/legal-pages/default-content.ts`) um den Abschnitt „5.1 Eigene cookielose Reichweitenmessung" erweitert. Die im DB gespeicherte Live-Version ist editierbar — Inhalt bei Bedarf in der Admin-Konsole aktualisieren.

### Database
- Drei neue Tabellen, mitgepflegt in `sync-schema.cjs`:
  - `analytics_pageviews` — Pageview-Zeilen mit pseudonymem `visitorId` + `sessionId`, Domain, Pfad, Referrer, UA-Felder (Device/Browser/OS), Sprache, Bildschirmgröße, UTM-Felder, `isBot`, `durationMs`, `scrollPct`.
  - `analytics_events` — Funnel- und Custom-Events.
  - `analytics_daily_salts` — täglich rotierter Zufallswert (32-Byte-Hex), aus dem zusammen mit IP+UA der pseudonyme Identifier gebildet wird. Salt wird nach spätestens 7 Tagen gelöscht.
- Auto-Cleanup beim Container-Start: Pageviews + Events älter als 365 Tage werden gelöscht (Datenminimierung). Salt-Records älter als 7 Tage werden gelöscht.

### DSGVO/Security
- **Plausible-Modell:** keine Cookies, kein `localStorage`, kein `sessionStorage`, keine Drittanbieter. Identifier ist `sha256(daily_salt + ip + ua)` — Re-Identifikation ist nach 24h technisch ausgeschlossen.
- IP-Adresse wird ausschließlich kurz im Speicher des Webseite-Prozesses verwendet (für das Hashing) und niemals gespeichert oder an den Admin-Container übermittelt.
- Browser-Signale `Do Not Track` und `Global Privacy Control` werden respektiert — bei aktivem Signal wird gar nichts erfasst.
- Shared-Secret zwischen Webseite-Proxy und Admin-Ingest (`TRACK_SHARED_SECRET`-ENV) — verhindert Direktaufrufe der Ingest-Endpunkte aus dem Internet.

### Setup (einmalig durch Betreiber)
- `TRACK_SHARED_SECRET` in beide `.env`-Dateien (Webseite + Admin) eintragen, z.&nbsp;B. `openssl rand -hex 32`. Beide Container müssen denselben Wert haben.
- `ADMIN_API_URL` muss in der Webseite-Container-`.env` auf den intern erreichbaren Admin-Endpunkt zeigen (Default-Mapping über Host-Header existiert bereits für `dev-admin.knipserl.de` und `admin.knipserl.de`).
- Live-Datenschutzerklärung über Admin-Konsole (`/settings/legal-pages` → Datenschutzerklärung) um den neuen Abschnitt 5.1 ergänzen — der neue Text liegt unter `default-content.ts` zum Übernehmen bereit.

## [1.24.0] — 2026-04-24

### Added
- **Auftrags-Erinnerungen für Fahrer per E-Mail**, über die bestehende Microsoft-Graph-Route.
  - Pro Fahrer konfigurierbar im Dashboard: Opt-in + Vorlauf (1 Tag / 2 Tage / 3 Tage / 1 Woche). Default: aktiv, 2 Tage Vorlauf.
  - Neue User-Spalten `reminderEmailEnabled`, `reminderLeadDays` (mitgepflegt in `sync-schema.cjs`).
  - Neue Order-Spalten `driverReminderSentAt`, `secondDriverReminderSentAt` — separat pro Fahrer, damit Primary und Secondary unabhängig voneinander ihren Reminder bekommen. Idempotenz: einmal gesendet, kein zweiter Versand.
  - E-Mail-Template `driverReminderEmail` (`src/lib/email-templates.ts`) — zeigt Kunde, Event-Art, Datum, Aufbau-/Abbauzeit, Ort, Ansprechpartner vor Ort, Notiz und einen Button zurück zum Auftrag im Fahrer-Dashboard.
  - Core-Logik in `src/lib/driver-reminders.ts` (`runDriverReminders`) — testbar, idempotent, läuft auch mehrfach pro Tag sauber.
  - APIs:
    - `GET/PATCH /api/driver/reminder-settings` — Fahrer lädt/speichert sein Opt-in und Vorlauf.
    - `POST /api/cron/driver-reminders` — Cron-Trigger mit Bearer-Secret (`CRON_SECRET`).
  - `/api/cron/*` als Public-Route in der Auth-Middleware markiert (keine NextAuth-Session nötig, stattdessen Secret-Auth).
  - UI-Komponente `ReminderSettings` ersetzt den bisherigen Push-Toggle im Fahrer-Dashboard. Die PWA/Push-Infrastruktur aus 1.23.0 bleibt im Code vorhanden, wird aber aktuell nicht mehr sichtbar angezeigt — kann später für Live-Benachrichtigungen (z.B. neue Zuweisung) reaktiviert werden.

### Setup (einmalig durch Betreiber)
- `CRON_SECRET` in die `.env` des Admin-Containers eintragen (zufälligen String setzen).
- Cron auf dem Host einrichten, z.B. täglich 8:00:
  ```
  0 8 * * *  curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://DEINE-ADMIN-URL/api/cron/driver-reminders
  ```
- `NEXT_PUBLIC_APP_URL` sollte gesetzt sein, sonst fehlt in der Reminder-Mail der Auftrags-Deeplink.

### Behavior-Notizen
- **Keine erneute Zustellung bei Datumsänderung**: Wird ein Event-Datum nach dem Versand verschoben, bekommt der Fahrer keinen neuen Reminder. Bewusst einfach gehalten — für Umplanungen gibt es andere Kanäle.
- Der Scheduler zieht Aufträge bis 14 Tage in die Zukunft, d.h. alles über einem Vorlauf von 14 Tagen wird beim nächsten Run erwischt.
- Fehler (z.B. Graph-API-Ausfall) blockieren nicht die anderen Mails — jede Sendung ist individuell, Fehler werden geloggt und kommen im Response-JSON zurück.

## [1.23.0] — 2026-04-24

### Added
- **PWA + Web-Push-Infrastruktur für die Admin-Konsole**. Vorbereitung für Fahrer-Erinnerungen vor Aufträgen — in diesem Release zunächst Opt-in und Testversand, der eigentliche Reminder-Scheduler folgt als separater Schritt.
  - Minimaler Service Worker unter `/sw.js` (nur Push + Notification-Click, kein Offline-Caching — bewusst schlicht, damit nichts unbemerkt gecacht wird).
  - SW-Registrierung global im Root-Layout via Client-Komponente `ServiceWorkerRegister`.
  - `Cache-Control: no-store` für `/sw.js` in `next.config.ts`, sonst bleiben Clients auf alten SW-Versionen hängen.
  - Neue Prisma-Tabelle `PushSubscription` (User kann mehrere Geräte abonnieren, `endpoint` ist unique, `onDelete: Cascade` vom User). `sync-schema.cjs` entsprechend mitgepflegt inkl. Unique- und Lookup-Index.
  - Neue Server-Lib `src/lib/push.ts` (`sendPushToUser`) mit automatischer Bereinigung toter Subscriptions bei `404`/`410`.
  - API-Routes unter `/api/push/`: `vapid-key` (GET), `subscribe` (POST, Upsert), `unsubscribe` (POST), `test` (POST, sendet Test an eingeloggten User).
  - Opt-in-UI `PushToggle` im Fahrer-Dashboard: deckt die vier Zustände sauber ab — Permission offen, aktiv, blockiert, und iOS-Browser-ohne-PWA (dann Hinweis „Zum Homescreen hinzufügen", weil Safari Push nur in der installierten PWA kennt).
  - Abhängigkeiten: `web-push` + `@types/web-push`.
  - Setup einmalig: `node scripts/generate-vapid.cjs` ausführen und `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` in die `.env` des Admin-Containers eintragen. Ohne Keys liefern die Push-Endpoints `503`.

## [1.22.1] — 2026-04-24

### Fixed
- **Dashboard: Eventarten-Pie sprengte auf Mobile die Breite**. Pie hatte `w-[260px] shrink-0` neben der Legende in einem `flex items-center` — zusammen ergab das ~410 px Content in einem 375-px-Viewport und schob die Card über den Rand. Fix:
  - Auf Mobile stapelt das Layout vertikal (`flex-col sm:flex-row`), Pie zentriert und voll-breit (`w-full`), Radius kompakter (`innerRadius={50}`, `outerRadius={85}`, Höhe 200 px).
  - Ab `sm` wieder Pie links / Legende rechts mit schmaleren 220×220 px.
  - Legende: Items bekommen `min-w-0 truncate` auf dem Text, Zahl rechts `shrink-0` — so kann die Card jetzt tatsächlich schrumpfen.
  - Card bekommt zur Sicherheit `overflow-hidden`.



### Added
- **Design-Elemente nachträglich bearbeitbar**: In `/settings/design-elements` gibt es pro Karte jetzt einen Stift-Button neben Aktiv-Toggle und Löschen. Klick öffnet ein Modal mit Vorschaubild + Name + Kategorie-Feld (inkl. Autocomplete aus den bekannten Kategorien). Bild selbst bleibt unveränderlich — Hinweis im Modal: bei Bedarf löschen und neu anlegen (ist sauberer, weil sonst Datei-Management, Thumb-Caching und verknüpfte Designs mitgeändert werden müssten).
- API: `PATCH /api/design/elements/[id]` akzeptiert jetzt zusätzlich `name` (nicht leer) und `category` (leerer String → null). Das bestehende `active`-Verhalten bleibt unverändert. Wenn kein gültiges Feld mitkommt, antwortet der Endpoint mit 400.

## [1.21.1] — 2026-04-24

### Fixed
- **Elemente-Modal: Items viel zu groß**. Das Raster war noch auf dem alten 600-px-Modal-Layout mit `grid-cols-2` stehengeblieben — im neuen 95 vw großen Modal wurde jedes Element dadurch über einen halben Bildschirm breit. Raster jetzt responsive: `3 / 4 / 5 / 6 / 8` Spalten (Mobile → XL), Gap `2 → 3` auf `sm+`, Name in `text-[11px]` statt `text-xs`. Thumbnails bekommen beim Hover einen subtilen Hintergrund-Shift, damit Klickziel klarer wird.

## [1.21.0] — 2026-04-24

### Added
- **Layoutdesigner — Startscreen für den Kunden bei leerem Canvas**. Wenn der Kunde den Designer öffnet und noch keine Objekte auf dem Canvas sind, legt sich ein zentriertes Overlay („Wie möchtest du starten?") über die Zeichenfläche mit zwei großen Call-to-Actions:
  - **Vorlage auswählen** — öffnet direkt das Vorlagen-Modal (gleiche Aktion wie der Sidebar-Eintrag), Primary-Akzent.
  - **Design manuell erstellen** — schließt das Overlay und gibt das leere Canvas frei.
  - Overlay erscheint nur im `customer`-Mode (nicht im Admin-Editor bzw. Admin-Edit-Mode) und nur, wenn `existingDesign.canvasJson.objects` leer oder nicht vorhanden ist. Sobald der Kunde eine Entscheidung trifft, bleibt es weg — auch wenn die Vorlage später wieder gewechselt wird.
  - Soll verhindern, dass Kunden das leere Canvas sehen und nicht wissen, wo sie anfangen sollen — viele wollten zuerst eine Vorlage, hatten aber keinen offensichtlichen Einstieg dafür.

## [1.20.4] — 2026-04-24

### Changed
- **Admin-Download: Zielformat auf 3600×2400 px bei 72 dpi (Querformat) umgestellt**. Für **beide** Layout-Formate:
  - `4x6` (10×15 quer): direkt auf 3600×2400 px normalisiert.
  - `2x6` (5×15 Streifen): Streifen wird auf 1200×3600 px hochskaliert, zweimal nebeneinander komponiert (2400×3600 Hochformat), anschließend **um 90° rotiert** → 3600×2400 Querformat. Das ist nötig, weil die Doppel-Streifen-Kombination physikalisch ein Hochformat ergibt, der Fotoprint-Drucker-Workflow aber Querformat-Input erwartet.
  - PNG-Metadata `density: 72` ausgeschrieben (`sharp.withMetadata`), damit Software, die die pHYs-Chunks liest, konsistent 72 dpi meldet.

## [1.20.3] — 2026-04-24

### Fixed
- **Dashboard „Nächste Aufträge" erzwang horizontalen Scrollbalken auf Mobile**: Zeile war starr als einreihiges Flex mit „Name + Event-Zeile" links und „Fahrer + Status-Badge" rechts ausgelegt. Eine typische Event-Zeile wie „Holzkirchener Straße · Geburtstag · 24.04.2026" war ohne `truncate` und pushte zusammen mit der nicht-schrumpfenden rechten Box den Container über 375 px Viewport-Breite hinaus → horizontales Scrollen auf der ganzen Seite. Fix:
  - Kartenzeile stapelt auf `< sm` vertikal (`flex-col sm:flex-row`), auf `sm+` bleibt das gewohnte Nebeneinander.
  - Beide Textzeilen links bekommen `truncate`, damit zu lange Event-Infos nicht mehr horizontal überlaufen.
  - Rechte Box bekommt `shrink-0`, der Fahrername bekommt `max-w-[140px] truncate`, Badges und Texte nutzen auf Mobile `text-xs` (vorher `text-sm`).
  - Padding auf Mobile `p-3` statt `p-4`, damit die schon breite Card nicht unnötig weiter rauspolstert.



### Fixed
- **Admin-Download: 5×15-Streifen hatte falsche Zielauflösung**. Das vom Kunden hochgeladene `layout-final.png` wird je nach Browser-DPR unterschiedlich groß exportiert (Fabric's Retina-Workaround halbiert bei `dpr=2`) — beim einfachen Verdoppeln übernahm der Endpoint also eine eventuell zu kleine Streifengröße. Download-Route normalisiert den Streifen jetzt zuerst auf exakt **600×1800 px** (5×15 cm @ 300 dpi) und komponiert dann zwei davon nebeneinander → verlässlich **1200×1800 px** Zieldatei. Für 10×15 quer wird analog auf **1800×1200 px** normalisiert, damit Admins auch bei DPR-Ausreißern immer ein 300-dpi-korrektes File bekommen.



### Fixed
- **Design-Vorlagen Übersicht (Admin) zeigte nur eine Kategorie pro Vorlage** — das Template-Card-Markup rendert jetzt `template.categories[]` als Chip-Reihe (mit Legacy-Fallback auf `template.category`, falls noch keine Multi-Kategorien migriert sind). Ohne diesen Fix wirkte es so, als würde der Multi-Select nichts speichern, obwohl die API das Array korrekt durchschrieb. (Voraussetzung für tatsächliches Persistieren mehrerer Einträge: das Spalten-Upgrade aus 1.19.0 muss in der Ziel-DB durchgelaufen sein — wird beim Container-Start über `sync-schema.cjs` automatisch erledigt.)

### Changed
- **Kunden-Vorlagen-Modal deutlich größer + Vorschaubilder größer**: Modal belegt jetzt bis zu 95 vw / 95 vh (vorher fixe 600 px × 70 vh). Raster ist responsive: 2 Spalten auf Mobile, 3 auf `sm`, 4 auf `lg`, 5 auf `xl`. Thumbnails haben feste `aspect-[4/3]`-Kacheln (statt starrer `h-28`), der Name steht in normaler Größe (`text-sm`) unter dem Bild statt winzig.
- **Dashboard Mobile-Optimierung**:
  - KPI-Boxen: kleineres Padding/Gap auf Mobile (`gap-2 px-3 py-2.5`), Value-Größe `text-base` statt `text-lg`, Label `text-[10px]` statt `text-[11px]` — damit lange Euro-Beträge wie „9.404 €" in der schmalen Zwei-Spalten-Ansicht nicht umbrechen. Value bekommt `truncate` als Notlösung.
  - Monatsvergleich: `p-3 sm:p-5`, Chart-Höhe `h-40 sm:h-48`, Balken-Gap `gap-0.5`, Spalten-Innenpadding auf Mobile = 0, Header-Legende `flex-wrap`.
  - „Nächste Aufträge"-Card-Header: Beschreibungstext („Die nächsten anstehenden Events — klicken zum Öffnen") auf Mobile ausgeblendet — der Titel erklärt sich selbst, der Text hat nur die Kopfzeile in den Wrap gedrückt.

## [1.20.1] — 2026-04-24

### Fixed
- **Dashboard „Nächste Aufträge" zeigte alte, nie abgeschlossene Aufträge mit**: Die Liste filterte nur auf Status `OPEN`/`ASSIGNED`, nicht aber aufs Event-Datum — dadurch tauchten Altleichen wie „Pointtec Messe München · 24.02.2023" oder „Dominik Babel · 08.02.2025" in der „nächste"-Liste auf, obwohl das Event längst vergangen war (jemand hatte den Status nicht auf `COMPLETED`/`CANCELLED` gesetzt). Jetzt wird zusätzlich auf `eventDate >= startOfToday` gefiltert — nur Aufträge, deren Event heute oder später stattfindet, erscheinen.

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
