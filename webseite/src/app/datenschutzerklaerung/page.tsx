import type { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";
import { ADDRESS, CONTACT_EMAIL, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Datenschutzerklärung",
  description: "Datenschutzerklärung der Knipserl Fotobox Webseite.",
  path: "/datenschutzerklaerung",
});

export const revalidate = 60;

async function fetchLegalHtml(): Promise<string | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const urls = [adminInternal, adminPublic].filter(Boolean) as string[];

  for (const base of urls) {
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/legal/datenschutz`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = (await res.json()) as { html?: string };
        if (typeof data.html === "string") return data.html;
      }
    } catch {
      // try next
    }
  }
  return null;
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
        Diese Website verwendet keine Analyse-Tools oder Tracking-Dienste von Drittanbietern.
        Wir verwenden ausschließlich DSGVO-konforme Dienste.
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
