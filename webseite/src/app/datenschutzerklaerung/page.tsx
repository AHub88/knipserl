import type { Metadata } from "next";
import { headers } from "next/headers";
import { generatePageMetadata } from "@/lib/seo";
import { ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import { getAdminBaseUrl } from "@/lib/admin-url";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung der Knipserl Fotobox Webseite.",
  path: "/datenschutzerklaerung",
});

export const dynamic = "force-dynamic";

async function fetchLegalHtml(): Promise<string | null> {
  const host = (await headers()).get("host");
  const base = getAdminBaseUrl(host);
  if (!base) return null;

  try {
    const res = await fetch(`${base}/api/legal/datenschutz`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { html?: string };
    return typeof data.html === "string" ? data.html : null;
  } catch {
    return null;
  }
}

function FallbackContent() {
  return (
    <>
      <h2>1. Datenschutz auf einen Blick</h2>
      <h3>Allgemeine Hinweise</h3>
      <p>
        Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren
        personenbezogenen Daten passiert, wenn Sie diese Website besuchen.
      </p>

      <h3>Datenerfassung auf dieser Website</h3>
      <p>
        <strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong>
        <br />
        Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber:
      </p>
      <p>
        {ADDRESS.owner}
        <br />
        {ADDRESS.street}
        <br />
        {ADDRESS.zip} {ADDRESS.city}
        <br />
        E-Mail: {CONTACT_EMAIL}
        <br />
        Telefon: {CONTACT_PHONE_DISPLAY}
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
        Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst.
        Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den
        gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
      </p>

      <h2>4. Datenerfassung auf dieser Website</h2>
      <h3>Kontaktformular</h3>
      <p>
        Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus
        dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks
        Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
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
        Zur statistischen Auswertung der Webseiten-Nutzung (z. B. wie viele Personen
        welche Seiten aufrufen) betreiben wir eine selbst gehostete, cookielose
        Reichweitenmessung. Es werden weder Cookies gesetzt noch sonstige Informationen
        in Ihrem Endgerät gespeichert oder ausgelesen (kein <em>localStorage</em>, kein
        <em> sessionStorage</em>).
      </p>
      <p>
        <strong>Welche Daten werden verarbeitet?</strong>
        <br />
        Bei jedem Seitenaufruf werten wir aus: aufgerufene URL, vorhergehende URL
        (Referrer, falls übermittelt), Datum/Uhrzeit, ungefähre Geräteklasse
        (Desktop/Mobil/Tablet), Browser- und Betriebssystem-Familie aus dem User-Agent,
        Bildschirmauflösung, Browser-Sprache, ggf. UTM-Kampagnen-Parameter aus der URL,
        Verweildauer auf der Seite und maximal erreichte Scroll-Tiefe. Außerdem
        verarbeiten wir kurzzeitig Ihre IP-Adresse zusammen mit dem User-Agent, um
        daraus einen pseudonymen Identifier zu erzeugen.
      </p>
      <p>
        <strong>Wie wird Ihre Identität geschützt?</strong>
        <br />
        IP-Adresse und User-Agent werden nicht in unserer Datenbank gespeichert.
        Stattdessen erzeugen wir aus IP-Adresse, User-Agent und einem täglich
        rotierenden Zufallswert (sog. Salt) einen Hash-Wert. Nur dieser Hash wird
        gespeichert. Da der Salt jeden Tag neu generiert und der vorherige Salt
        verworfen wird, lässt sich aus dem gespeicherten Hash nach 24 Stunden
        keine Verbindung mehr zu einer bestimmten IP-Adresse oder Person herstellen.
        Eine Wiedererkennung über mehrere Tage hinweg ist technisch ausgeschlossen.
      </p>
      <p>
        <strong>Speicherdauer:</strong> Reichweiten-Datensätze werden automatisch
        nach 365 Tagen gelöscht. Tagesbezogene Salt-Werte werden nach spätestens 7
        Tagen gelöscht.
      </p>
      <p>
        <strong>Empfänger:</strong> Die Daten werden ausschließlich auf unseren
        eigenen Servern in Deutschland (Hetzner) verarbeitet. Es findet keine
        Übermittlung an Drittanbieter und keine Übermittlung in Drittländer statt.
      </p>
      <p>
        <strong>Rechtsgrundlage:</strong> Da keine Informationen in Ihrem Endgerät
        gespeichert oder ausgelesen werden (keine Cookies, kein Browserspeicher),
        ist eine Einwilligung nach § 25 Abs. 1 TDDDG (vormals TTDSG) nicht erforderlich.
        Die Verarbeitung der pseudonymisierten Daten erfolgt auf Grundlage unseres
        berechtigten Interesses gemäß Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes
        Interesse besteht darin, die Reichweite, Funktion und Optimierung unseres
        Webauftritts statistisch auswerten zu können, ohne dabei Profile von
        einzelnen Besucherinnen und Besuchern anzulegen.
      </p>
      <p>
        <strong>Widerspruch:</strong> Sie können der Reichweitenmessung jederzeit
        widersprechen, indem Sie in Ihrem Browser die Funktion <em>Do Not Track</em>{" "}
        oder <em>Global Privacy Control</em> aktivieren. Beide Signale werden
        respektiert; in diesem Fall wird kein Datensatz erfasst.
      </p>

      <h2>6. Distanzberechnung</h2>
      <p>
        Für die Berechnung der Fahrtkosten in unserem Preiskonfigurator verwenden wir den
        Open-Source-Dienst OpenStreetMap (Nominatim) und OSRM. Es werden keine persönlichen
        Daten an Google oder andere Drittanbieter übermittelt.
      </p>

      <p className="text-sm text-[#999] mt-8">
        <em>
          Hinweis: Diese Datenschutzerklärung ist ein Platzhalter und muss von einem
          Rechtsanwalt überprüft und vervollständigt werden.
        </em>
      </p>
    </>
  );
}

export default async function DatenschutzPage() {
  const html = await fetchLegalHtml();
  const useFallback = !html || !html.trim();

  return (
    <>
      <PageHeader title="Datenschutzerklärung" />

      <section className="py-16 md:py-20">
        <div
          className="max-w-[800px] mx-auto px-4 text-[#666]"
          style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}
        >
          {useFallback ? (
            <FallbackContent />
          ) : (
            <div className="legal-content" dangerouslySetInnerHTML={{ __html: html! }} />
          )}
        </div>
      </section>
    </>
  );
}
