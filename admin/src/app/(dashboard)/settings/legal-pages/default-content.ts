// Default HTML content for legal pages. 1:1 converted from the previously
// static Next.js pages in webseite/src/app/impressum and
// webseite/src/app/datenschutzerklaerung. Placeholder for USt-ID bleibt
// als [USt-ID hier eintragen] bestehen — bitte nach Eintrag ersetzen.

export const DEFAULT_IMPRESSUM_HTML = `<h2>Angaben gem&auml;&szlig; &sect; 5 TMG</h2>
<p>
  Andreas Huber<br>
  Knipserl Fotobox<br>
  Tulpenstra&szlig;e 13<br>
  83052 Bruckm&uuml;hl
</p>

<h2>Kontakt</h2>
<p>
  Telefon: 01579 / 2495836<br>
  E-Mail: info@knipserl.de
</p>

<h2>Umsatzsteuer-ID</h2>
<p>
  Umsatzsteuer-Identifikationsnummer gem&auml;&szlig; &sect; 27 a Umsatzsteuergesetz:<br>
  [USt-ID hier eintragen]
</p>

<h2>Verantwortlich f&uuml;r den Inhalt nach &sect; 55 Abs. 2 RStV</h2>
<p>
  Andreas Huber<br>
  Tulpenstra&szlig;e 13<br>
  83052 Bruckm&uuml;hl
</p>`;

export const DEFAULT_DATENSCHUTZ_HTML = `<h2>1. Datenschutz auf einen Blick</h2>
<h3>Allgemeine Hinweise</h3>
<p>
  Die folgenden Hinweise geben einen einfachen &Uuml;berblick dar&uuml;ber, was mit Ihren
  personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
</p>

<h3>Datenerfassung auf dieser Website</h3>
<p>
  <strong>Wer ist verantwortlich f&uuml;r die Datenerfassung auf dieser Website?</strong><br>
  Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:
</p>
<p>
  Andreas Huber<br>
  Tulpenstra&szlig;e 13<br>
  83052 Bruckm&uuml;hl<br>
  E-Mail: info@knipserl.de<br>
  Telefon: 01579 / 2495836
</p>

<h2>2. Hosting</h2>
<p>
  Diese Website wird bei einem externen Dienstleister gehostet (Hoster). Die
  personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den
  Servern des Hosters gespeichert.
</p>

<h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
<h3>Datenschutz</h3>
<p>
  Die Betreiber dieser Seiten nehmen den Schutz Ihrer pers&ouml;nlichen Daten sehr ernst.
  Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
  gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerkl&auml;rung.
</p>

<h2>4. Datenerfassung auf dieser Website</h2>
<h3>Kontaktformular</h3>
<p>
  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus
  dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
  Bearbeitung der Anfrage und f&uuml;r den Fall von Anschlussfragen bei uns gespeichert.
  Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
</p>

<h2>5. Analyse-Tools und Werbung</h2>
<p>
  Diese Website verwendet keine Analyse-Tools oder Tracking-Dienste von Drittanbietern
  (kein Google Analytics, kein Facebook-Pixel, kein Matomo, kein TikTok Pixel etc.).
  Sie nutzt eine eigene, cookielose Reichweitenmessung, die im folgenden Abschnitt
  beschrieben wird.
</p>

<h3>5.1 Eigene cookielose Reichweitenmessung</h3>
<p>
  Zur statistischen Auswertung der Webseiten-Nutzung (z.&nbsp;B. wie viele Personen welche
  Seiten aufrufen) betreiben wir eine selbst gehostete, cookielose Reichweitenmessung.
  Es werden weder Cookies gesetzt noch sonstige Informationen in Ihrem Endger&auml;t
  gespeichert oder ausgelesen (kein <em>localStorage</em>, kein <em>sessionStorage</em>).
</p>
<p>
  <strong>Welche Daten werden verarbeitet?</strong><br>
  Bei jedem Seitenaufruf werten wir aus: aufgerufene URL, vorhergehende URL (Referrer,
  falls &uuml;bermittelt), Datum/Uhrzeit, ungef&auml;hre Ger&auml;teklasse
  (Desktop/Mobil/Tablet), Browser- und Betriebssystem-Familie aus dem User-Agent,
  Bildschirmaufl&ouml;sung, Browser-Sprache, ggf. UTM-Kampagnen-Parameter aus der URL,
  Verweildauer auf der Seite und maximal erreichte Scroll-Tiefe. Au&szlig;erdem
  verarbeiten wir kurzzeitig Ihre IP-Adresse zusammen mit dem User-Agent, um daraus
  einen pseudonymen Identifier zu erzeugen.
</p>
<p>
  <strong>Wie wird Ihre Identit&auml;t gesch&uuml;tzt?</strong><br>
  IP-Adresse und User-Agent werden nicht in unserer Datenbank gespeichert. Stattdessen
  erzeugen wir aus IP-Adresse, User-Agent und einem t&auml;glich rotierenden Zufallswert
  (sog. Salt) einen Hash-Wert. Nur dieser Hash wird gespeichert. Da der Salt jeden Tag
  neu generiert und der vorherige Salt verworfen wird, l&auml;sst sich aus dem
  gespeicherten Hash nach 24 Stunden keine Verbindung mehr zu einer bestimmten
  IP-Adresse oder Person herstellen. Eine Wiedererkennung &uuml;ber mehrere Tage
  hinweg ist technisch ausgeschlossen.
</p>
<p>
  <strong>Speicherdauer:</strong> Reichweiten-Datens&auml;tze werden automatisch nach
  365 Tagen gel&ouml;scht. Tagesbezogene Salt-Werte werden nach sp&auml;testens 7 Tagen
  gel&ouml;scht.
</p>
<p>
  <strong>Empf&auml;nger:</strong> Die Daten werden ausschlie&szlig;lich auf unseren
  eigenen Servern in Deutschland (Hetzner) verarbeitet. Es findet keine &Uuml;bermittlung
  an Drittanbieter und keine &Uuml;bermittlung in Drittl&auml;nder statt.
</p>
<p>
  <strong>Rechtsgrundlage:</strong> Da keine Informationen in Ihrem Endger&auml;t
  gespeichert oder ausgelesen werden (keine Cookies, kein Browserspeicher), ist eine
  Einwilligung nach &sect;&nbsp;25 Abs.&nbsp;1 TDDDG (vormals TTDSG) nicht erforderlich.
  Die Verarbeitung der pseudonymisierten Daten erfolgt auf Grundlage unseres
  berechtigten Interesses gem&auml;&szlig; Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO.
  Unser berechtigtes Interesse besteht darin, die Reichweite, Funktion und Optimierung
  unseres Webauftritts statistisch auswerten zu k&ouml;nnen, ohne dabei Profile von
  einzelnen Besucherinnen und Besuchern anzulegen.
</p>
<p>
  <strong>Widerspruch:</strong> Sie k&ouml;nnen der Reichweitenmessung jederzeit
  widersprechen, indem Sie in Ihrem Browser die Funktion <em>Do Not Track</em> oder
  <em>Global Privacy Control</em> aktivieren. Beide Signale werden respektiert; in
  diesem Fall wird kein Datensatz erfasst.
</p>

<h2>6. Distanzberechnung</h2>
<p>
  F&uuml;r die Berechnung der Fahrtkosten in unserem Preiskonfigurator verwenden wir den
  Open-Source-Dienst OpenStreetMap (Nominatim) und OSRM. Es werden keine pers&ouml;nlichen
  Daten an Google oder andere Drittanbieter &uuml;bermittelt.
</p>

<p><em>
  Hinweis: Diese Datenschutzerkl&auml;rung ist ein Platzhalter und muss von einem
  Rechtsanwalt &uuml;berpr&uuml;ft und vervollst&auml;ndigt werden.
</em></p>`;
