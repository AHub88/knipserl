import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import GoogleReviewsSlider, { type ReviewData } from "@/components/GoogleReviewsSlider";
import PageHeader from "@/components/layout/PageHeader";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";
import { SITE_URL, SITE_NAME, ADDRESS, CONTACT_PHONE_DISPLAY } from "@/lib/constants";

export const metadata: Metadata = generatePageMetadata({
  title: "Audio-Gästebuch mieten — Gästetelefon für Hochzeit & Feier",
  description:
    "Audio-Gästebuch / Gästetelefon mieten in Oberbayern und Tirol. Vintage-Telefon für Hochzeit, Geburtstag oder Firmenfeier. Ab 100 €. Lieferung München, Rosenheim, Kufstein.",
  path: "/audio-gaestebuch",
});

export const dynamic = "force-dynamic";

async function getGoogleReviews(): Promise<ReviewData | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/google-reviews`, { cache: "no-store" });
      if (!res.ok) continue;
      return await res.json();
    } catch {
      continue;
    }
  }
  return null;
}

// ============================================================================
// CONTENT (GEO-optimized: klare Definitionen, strukturierte Listen, Datum,
// Byline, Vergleichstabelle, FAQPage)
// ============================================================================

const HERO_USPS = [
  "Handrestauriertes Vintage-Telefon",
  "Autark – kein Strom, kein WLAN nötig",
  "Persönliche Begrüßungsansage möglich",
  "Alle Aufnahmen als MP3 nach dem Event",
];

const STEPS = [
  {
    step: "1",
    title: "Unverbindlich anfragen",
    text: "Datum prüfen, Formular absenden – wir melden uns innerhalb von 24 Stunden mit Angebot und Verfügbarkeit.",
  },
  {
    step: "2",
    title: "Wir liefern & richten ein",
    text: "Wir bringen das Gästetelefon zu Eurer Location, stellen es auf und machen es einsatzbereit. Plug & Play für Eure Gäste.",
  },
  {
    step: "3",
    title: "Gäste hinterlassen Nachrichten",
    text: "Hörer abnehmen, Begrüßung anhören, sprechen, auflegen. So einfach, dass Oma und Opa das auch schaffen.",
  },
  {
    step: "4",
    title: "Aufnahmen erhalten",
    text: "Wenige Tage nach dem Event schicken wir Dir alle Aufnahmen als saubere MP3-Dateien zum Download.",
  },
];

const COMPARISON_ROWS = [
  {
    label: "Festhält was?",
    audio: "Stimme, Emotion, Lachen",
    klassisch: "Handschrift, kurzer Text",
    polaroid: "Foto + kurze Zeile",
  },
  {
    label: "Aufwand für Gäste",
    audio: "Hörer abnehmen & sprechen",
    klassisch: "Text formulieren & schreiben",
    polaroid: "Foto schießen, einkleben, schreiben",
  },
  {
    label: "Beteiligung",
    audio: "Sehr hoch – auch zurückhaltende Gäste",
    klassisch: "Mittel – viele scheuen sich",
    polaroid: "Hoch – aber oft nur kurze Zeilen",
  },
  {
    label: "Erinnerung",
    audio: "Echte Stimmen, jederzeit anhörbar",
    klassisch: "Buch im Regal",
    polaroid: "Buch im Regal",
  },
  {
    label: "Format danach",
    audio: "MP3-Dateien zum Download",
    klassisch: "Physisches Buch",
    polaroid: "Physisches Buch",
  },
];

const FAQS = [
  {
    question: "Wie funktioniert ein Audio-Gästebuch?",
    answer:
      "Das Vintage-Telefon steht bei Eurer Feier bereit. Gäste nehmen den Hörer ab, hören Eure persönliche Begrüßung und sprechen ihre Nachricht. Das Telefon nimmt alles automatisch auf – keine App, kein WLAN, kein Strom nötig.",
  },
  {
    question: "Was bekommen wir nach der Hochzeit?",
    answer:
      "Wenige Werktage nach Eurem Event erhaltet Ihr alle Aufnahmen als einzelne MP3-Dateien per Download-Link. Auf Wunsch liefern wir zusätzlich einen USB-Stick im Knipserl-Holzdesign.",
  },
  {
    question: "Was kostet das Mieten eines Gästetelefons?",
    answer:
      "Unser Gästetelefon kostet 100 € für Eure Veranstaltung. Im Umkreis von 15 km um Bruckmühl ist die Lieferung kostenlos, darüber hinaus werden transparente Fahrtkosten ausgewiesen – keine versteckten Gebühren.",
  },
  {
    question: "Braucht das Telefon Strom oder Internet?",
    answer:
      "Nein. Unser Gästetelefon läuft komplett autark über einen eingebauten Akku und benötigt weder Steckdose noch WLAN. Ihr stellt es einfach auf den Gabentisch oder an die Bar – fertig.",
  },
  {
    question: "Wie viele Gäste nehmen typischerweise etwas auf?",
    answer:
      "Die Beteiligung ist erfahrungsgemäß deutlich höher als beim klassischen Gästebuch. Gerade auch zurückhaltende Gäste und ältere Verwandte greifen zum Hörer, weil es sich wie ein kurzer Anruf anfühlt und keine Hemmschwelle zum Schreiben überwunden werden muss.",
  },
  {
    question: "Können wir eine eigene Begrüßungsnachricht aufsprechen?",
    answer:
      "Ja, absolut. Ihr erhaltet vor Eurem Event eine kurze Anleitung, wie Ihr Eure persönliche Ansage aufnehmt – oder wir sprechen sie auf Wunsch für Euch ein. So hören Eure Gäste zuerst Eure Stimme.",
  },
  {
    question: "Wie lange vor dem Event sollte ich buchen?",
    answer:
      "Für Hochzeiten in der Hauptsaison (Mai bis September) empfehlen wir eine Buchung mindestens 3 bis 6 Monate im Voraus. Kurzfristige Anfragen sind möglich – prüfe einfach im Kalender auf dieser Seite, ob Dein Datum noch frei ist.",
  },
  {
    question: "Liefert Ihr auch nach München, Rosenheim oder Kufstein?",
    answer:
      "Ja. Wir liefern das Gästetelefon in ganz Oberbayern und bis ins Tiroler Unterland – inklusive München, Rosenheim, Ebersberg, Miesbach, Traunstein, Mühldorf, Erding, Wasserburg am Inn und Kufstein. Fahrtkosten zeigen wir vorab transparent im Angebot.",
  },
  {
    question: "Was passiert, wenn das Telefon ausfällt?",
    answer:
      "Jedes Gerät wird vor jeder Vermietung getestet. Sollte trotzdem ein technisches Problem auftreten, erhaltet Ihr die Miete vollständig zurückerstattet. So habt Ihr keinerlei Risiko.",
  },
  {
    question: "Können wir Audio-Gästebuch und Fotobox kombinieren?",
    answer:
      "Sehr gerne – das ist sogar unser beliebtestes Kombi-Setup. Ihr könnt das Gästetelefon direkt im Preiskonfigurator als Add-On zur Fotobox hinzubuchen. Eure Gäste haben so visuelle UND akustische Erinnerungen.",
  },
];

const SERVICE_CITIES = [
  { name: "München", slug: "muenchen", drive: "ca. 45 Min" },
  { name: "Rosenheim", slug: "rosenheim", drive: "ca. 20 Min" },
  { name: "Ebersberg", slug: "ebersberg", drive: "ca. 35 Min" },
  { name: "Miesbach", slug: "miesbach", drive: "ca. 25 Min" },
  { name: "Traunstein", slug: "traunstein", drive: "ca. 45 Min" },
  { name: "Wasserburg am Inn", slug: null, drive: "ca. 20 Min" },
  { name: "Mühldorf am Inn", slug: null, drive: "ca. 45 Min" },
  { name: "Erding", slug: null, drive: "ca. 55 Min" },
  { name: "Kufstein (AT)", slug: null, drive: "ca. 50 Min" },
];

const PACKAGE_FEATURES = [
  "Handrestauriertes Vintage-Gästetelefon",
  "Persönliche Begrüßungsansage (von Euch oder von uns eingesprochen)",
  "Autark – kein Strom, kein WLAN nötig",
  "Unbegrenzte Anzahl Aufnahmen",
  "Alle Aufnahmen als MP3 zum Download nach dem Event",
  "Lieferung im Umkreis 15 km Bruckmühl kostenlos",
  "Auch als Add-On zur Fotobox buchbar",
];

const IMPRESSIONEN = [
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-005-605x453.jpg", alt: "Audio-Gästebuch Gästetelefon im Einsatz bei einer Hochzeit in Oberbayern" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-015-605x453.jpg", alt: "Vintage-Gästetelefon Nahaufnahme mit Holzkasten" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-016-605x453.jpg", alt: "Gästetelefon als Audio-Gästebuch auf Brauttisch" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-017-605x453.jpg", alt: "Urige Gästetelefon Miete für Hochzeit Rosenheim München" },
];

// ============================================================================
// PAGE
// ============================================================================

export default async function AudioGaestebuchPage() {
  const reviewData = await getGoogleReviews();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Audio-Gästebuch / Gästetelefon", url: "/audio-gaestebuch" },
  ]);

  const faqSchema = generateFAQSchema(FAQS);

  // Service-Schema speziell für Gästetelefon (100 €, areaServed, Provider = LocalBusiness)
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Audio-Gästebuch / Gästetelefon mieten",
    serviceType: "Audio-Gästebuch Verleih",
    description:
      "Handrestauriertes Vintage-Gästetelefon zum Mieten für Hochzeiten, Geburtstage und Firmenfeiern in Oberbayern und Tirol. Gäste hinterlassen Sprachnachrichten, die als MP3 nach dem Event übergeben werden.",
    provider: {
      "@type": "LocalBusiness",
      "@id": `${SITE_URL}/#business`,
      name: SITE_NAME,
      telephone: CONTACT_PHONE_DISPLAY,
      address: {
        "@type": "PostalAddress",
        streetAddress: ADDRESS.street,
        postalCode: ADDRESS.zip,
        addressLocality: ADDRESS.city,
        addressCountry: ADDRESS.country,
      },
    },
    offers: {
      "@type": "Offer",
      price: "100",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/audio-gaestebuch`,
    },
    areaServed: [
      { "@type": "City", name: "München" },
      { "@type": "City", name: "Rosenheim" },
      { "@type": "City", name: "Ebersberg" },
      { "@type": "City", name: "Miesbach" },
      { "@type": "City", name: "Traunstein" },
      { "@type": "City", name: "Wasserburg am Inn" },
      { "@type": "City", name: "Mühldorf am Inn" },
      { "@type": "City", name: "Erding" },
      { "@type": "City", name: "Kufstein" },
    ],
    ...(reviewData && reviewData.totalCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewData.averageRating.toFixed(1),
            reviewCount: reviewData.totalCount,
            bestRating: "5",
            worstRating: "1",
          },
        }
      : {}),
  };

  const ratingLabel = reviewData
    ? `${reviewData.averageRating.toFixed(1)} / 5 – ${reviewData.totalCount} Google-Bewertungen`
    : "Top-bewertet auf Google";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <PageHeader title="Audio-Gästebuch / Gästetelefon" />

      {/* ========================================================================
          HERO — Emotion + USP + Preis-Anker + primary CTA + micro-trust
          ======================================================================== */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-12 items-center">
            <div>
              <p className="text-[#F3A300] text-[18px] md:text-[20px] font-semibold mb-3 font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.05em]">
                Die moderne Alternative zum Gästebuch
              </p>
              <h1 className="text-[34px] md:text-[48px] lg:text-[56px] leading-[1] text-[#1a171b] mb-5">
                Audio-Gästebuch mieten in Oberbayern & Tirol
              </h1>
              <p className="text-[#666] text-[17px] md:text-[19px] leading-relaxed mb-6" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                Ein handrestauriertes Vintage-Telefon auf Eurer Feier – Eure Gäste
                hinterlassen persönliche Sprachnachrichten, Ihr erhaltet echte Stimmen,
                ehrliches Lachen und emotionale Glückwünsche als MP3-Dateien für die Ewigkeit.
              </p>

              <ul className="space-y-2 mb-7">
                {HERO_USPS.map((usp) => (
                  <li key={usp} className="flex items-start gap-2 text-[#1a171b] text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{usp}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-baseline gap-3 mb-5">
                <span className="text-[#666] text-[15px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  ab
                </span>
                <span className="text-[#1a171b] text-[42px] md:text-[52px] leading-[1] font-extrabold font-[family-name:var(--font-fira-condensed)]">
                  100&nbsp;€
                </span>
                <span className="text-[#666] text-[14px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  inkl. MwSt. · für Eure Veranstaltung
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-start gap-3">
                <Link href="#anfragen" className="btn-brand whitespace-nowrap text-[18px] px-6 py-3">
                  Verfügbarkeit prüfen
                </Link>
                <Link href="#vergleich" className="btn-outline-dark whitespace-nowrap text-[18px] px-6 py-3">
                  Mehr erfahren
                </Link>
              </div>

              <div className="flex items-center gap-2 mt-5 text-[#666] text-[14px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg key={i} className="w-4 h-4" fill="#FBBC04" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span>{ratingLabel}</span>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full shadow-2xl">
              <Image
                src="/images/audio-gaestebuch/audio-gaestebuch-mieten-1024x768.jpg"
                alt="Audio-Gästebuch Vintage-Gästetelefon zum Mieten für Hochzeit und Feier"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 540px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          TRUST BAR — dünne Leiste, Social Proof + Claims
          ======================================================================== */}
      <section
        className="relative z-10 py-6 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-center">
            {[
              { big: "Familienbetrieb", small: "aus Bruckmühl – Oberbayern" },
              { big: "Oberbayern & Tirol", small: "München · Rosenheim · Kufstein" },
              { big: "Plug & Play", small: "Autark, kein Strom nötig" },
              { big: "Ausfall-Garantie", small: "Volle Rückerstattung bei Defekt" },
            ].map((item) => (
              <div key={item.big}>
                <div className="text-[#F3A300] text-[18px] md:text-[20px] font-extrabold uppercase leading-[1.1] font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
                  {item.big}
                </div>
                <div className="text-white/70 text-[13px] md:text-[14px] mt-1" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {item.small}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================
          DEFINITION — "Was ist ein Audio-Gästebuch?" (GEO: Definition oben)
          ======================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[820px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Was ist ein Audio-Gästebuch?
            </h2>
          </div>
          <div className="text-[#1a171b] text-[17px] md:text-[18px] leading-relaxed space-y-4" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            <p>
              Ein <strong>Audio-Gästebuch</strong> – auch <strong>Gästetelefon</strong> oder{" "}
              <strong>Hochzeitstelefon</strong> genannt – ist ein umgebautes Vintage-Telefon,
              über das Eure Gäste persönliche Sprachnachrichten für Euch aufnehmen. Statt
              handgeschriebener Zeilen entstehen ehrliche, emotionale Audio-Aufnahmen, die Ihr
              nach der Hochzeit als MP3-Dateien erhaltet.
            </p>
            <p>
              Das Besondere: Der Hörer senkt die Hemmschwelle. Gäste, die nie etwas ins
              klassische Gästebuch schreiben würden, sprechen ganz selbstverständlich aufs
              Band – weil es sich anfühlt wie ein kurzer Anruf. Das Ergebnis sind echte
              Stimmen, echtes Lachen und echte Geschichten, die Ihr noch in zehn Jahren
              anhören könnt.
            </p>
          </div>
        </div>
      </section>

      {/* ========================================================================
          WIE FUNKTIONIERT'S — 4 Schritte
          ======================================================================== */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block">
              So funktioniert die Miete
            </h2>
          </div>
          <p className="text-center text-[18px] md:text-[22px] text-[#F3A300] font-semibold mb-12 font-[family-name:var(--font-fira-condensed)]">
            In 4 Schritten zum Audio-Gästebuch
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {STEPS.map((item) => (
              <div key={item.step} className="glass-card p-6 pt-10 text-center relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#F3A300] text-[#1a171b] flex items-center justify-center font-bold text-[22px] shadow-lg font-[family-name:var(--font-fira-condensed)]">
                  {item.step}
                </div>
                <h3 className="text-[20px] md:text-[22px] leading-[1.2] text-[#F3A300] mb-3 uppercase font-extrabold font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
                  {item.title}
                </h3>
                <p className="text-white/85 text-[15px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================
          VERGLEICHSTABELLE — GEO-Gold: Tabellen werden überproportional in
          LLM-Antworten zitiert. Top-of-Funnel für "alternative gästebuch hochzeit".
          ======================================================================== */}
      <section id="vergleich" className="py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Audio-Gästebuch vs. Klassiker
            </h2>
          </div>
          <p className="text-center text-[18px] md:text-[22px] text-[#F3A300] font-semibold mb-10 font-[family-name:var(--font-fira-condensed)]">
            Welche Gästebuch-Variante passt zu Eurer Feier?
          </p>

          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full min-w-[680px] border-collapse text-[15px] md:text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              <thead>
                <tr>
                  <th className="text-left p-4 border-b-2 border-[#1a171b] text-[#1a171b] font-bold uppercase text-[13px] tracking-[0.05em] font-[family-name:var(--font-fira-condensed)]">
                    Kriterium
                  </th>
                  <th className="text-left p-4 border-b-2 border-[#F3A300] bg-[#F3A300]/10 text-[#1a171b] font-bold uppercase text-[13px] tracking-[0.05em] font-[family-name:var(--font-fira-condensed)]">
                    Audio-Gästebuch
                  </th>
                  <th className="text-left p-4 border-b-2 border-[#1a171b]/30 text-[#666] font-bold uppercase text-[13px] tracking-[0.05em] font-[family-name:var(--font-fira-condensed)]">
                    Klassisches Gästebuch
                  </th>
                  <th className="text-left p-4 border-b-2 border-[#1a171b]/30 text-[#666] font-bold uppercase text-[13px] tracking-[0.05em] font-[family-name:var(--font-fira-condensed)]">
                    Polaroid-Gästebuch
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={row.label} className={idx % 2 === 0 ? "bg-[#1a171b]/[0.03]" : ""}>
                    <td className="p-4 text-[#1a171b] font-bold align-top">{row.label}</td>
                    <td className="p-4 text-[#1a171b] align-top bg-[#F3A300]/5 border-l border-r border-[#F3A300]/20">
                      {row.audio}
                    </td>
                    <td className="p-4 text-[#666] align-top">{row.klassisch}</td>
                    <td className="p-4 text-[#666] align-top">{row.polaroid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ========================================================================
          IMPRESSIONEN
          ======================================================================== */}
      <section
        id="impressionen"
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block">
              Impressionen
            </h2>
          </div>
          <p className="text-center text-[18px] md:text-[22px] text-[#F3A300] font-semibold mb-10 font-[family-name:var(--font-fira-condensed)]">
            Unser Gästetelefon im Einsatz
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IMPRESSIONEN.map((img) => (
              <div key={img.src} className="relative aspect-[4/3] overflow-hidden group">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================
          PREIS & LEISTUNGSUMFANG — transparent, 1 Paket (Hick's Law)
          ======================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Preis & Leistungsumfang
            </h2>
            <p className="text-[18px] md:text-[22px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Transparent, ohne versteckte Kosten
            </p>
          </div>

          <div className="bg-white border-2 border-[#F3A300] rounded-lg shadow-xl overflow-hidden">
            <div className="bg-[#1a171b] text-white p-6 md:p-8 text-center">
              <div className="text-[14px] uppercase tracking-[0.1em] text-white/70 mb-1 font-[family-name:var(--font-fira-condensed)]">
                Audio-Gästebuch / Gästetelefon
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-[60px] md:text-[72px] leading-[1] font-extrabold text-[#F3A300] font-[family-name:var(--font-fira-condensed)]">
                  100&nbsp;€
                </span>
              </div>
              <div className="text-white/70 text-[14px] mt-2" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                inkl. MwSt. · für Eure Veranstaltung
              </div>
            </div>
            <div className="p-6 md:p-10">
              <ul className="space-y-3 mb-8">
                {PACKAGE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-[#1a171b] text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="text-[#666] text-[14px] mb-6" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                Außerhalb des 15-km-Radius um Bruckmühl berechnen wir Fahrtkosten
                gestaffelt nach Entfernung. Wir weisen sie transparent im Angebot aus.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="#anfragen" className="btn-brand whitespace-nowrap text-[18px] px-6 py-3">
                  Jetzt Termin prüfen
                </Link>
                <Link href="/preise" className="btn-outline-dark whitespace-nowrap text-[18px] px-6 py-3">
                  Mit Fotobox kombinieren
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          EINSATZGEBIET / GEO — städte-differenziert, NAP-Konsistenz,
          Fahrtzeiten-Content. Local-SEO-Kern.
          ======================================================================== */}
      <section className="py-16 md:py-20 bg-[#f8f7f4]">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Einsatzgebiet
            </h2>
          </div>
          <p className="text-center text-[18px] md:text-[22px] text-[#F3A300] font-semibold mb-8 font-[family-name:var(--font-fira-condensed)]">
            Wir liefern in ganz Oberbayern und ins Tiroler Unterland
          </p>
          <p className="max-w-[750px] mx-auto text-center text-[#666] text-[17px] leading-relaxed mb-10" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Unser Gästetelefon startet in Bruckmühl bei Rosenheim. Von hier aus sind
            wir schnell bei Eurer Hochzeit – ob Chiemgau, Tegernseer Tal, Münchner
            Umland oder Tiroler Inntal.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {SERVICE_CITIES.map((c) => {
              const content = (
                <div className="bg-white border border-[#e5e3df] px-5 py-4 hover:border-[#F3A300] transition-colors">
                  <div className="text-[#1a171b] font-bold text-[17px] font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.02em]">
                    {c.name}
                  </div>
                  <div className="text-[#666] text-[13px] mt-0.5" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    {c.drive} Fahrtzeit
                  </div>
                </div>
              );
              return c.slug ? (
                <Link key={c.name} href={`/fotobox/${c.slug}`} className="block">
                  {content}
                </Link>
              ) : (
                <div key={c.name}>{content}</div>
              );
            })}
          </div>

          <p className="text-center text-[#666] text-[14px] mt-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Euer Ort ist nicht dabei? Kein Problem – wir liefern auf Anfrage auch
            weiter. Einfach unten im Formular anfragen.
          </p>
        </div>
      </section>

      {/* ========================================================================
          FAQ — Accordion mit <details>. FAQPage-Schema ist oben eingefügt.
          ======================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[820px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Häufige Fragen
            </h2>
          </div>
          <p className="text-center text-[18px] md:text-[22px] text-[#F3A300] font-semibold mb-10 font-[family-name:var(--font-fira-condensed)]">
            Alles rund um das Audio-Gästebuch
          </p>

          <div className="space-y-3">
            {FAQS.map((faq, idx) => (
              <details
                key={faq.question}
                className="group border border-[#e5e3df] bg-white"
                open={idx === 0}
              >
                <summary className="cursor-pointer list-none p-5 flex items-start justify-between gap-4 text-[#1a171b] font-bold text-[16px] md:text-[17px] hover:text-[#F3A300]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 600 }}>
                  <span>{faq.question}</span>
                  <svg className="w-5 h-5 flex-shrink-0 text-[#F3A300] transition-transform group-open:rotate-180 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-5 pb-5 text-[#666] text-[16px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================
          INQUIRY FORM — Haupt-Conversion
          ======================================================================== */}
      <section id="anfragen" className="py-16 md:py-20 scroll-mt-20">
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Jetzt unverbindlich anfragen
            </h2>
            <p className="text-[18px] md:text-[22px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Prüfe jetzt, ob Dein Termin verfügbar ist
            </p>
          </div>
          <InquiryForm preset="gaestetelefon" />
        </div>
      </section>

      {/* ========================================================================
          CROSS-SELL FOTOBOX
          ======================================================================== */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white text-center"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[820px] mx-auto px-6">
          <h2 className="text-[28px] md:text-[40px] leading-[1] mb-5">
            Perfekt kombiniert mit der <span className="text-[#F3A300]">Knipserl Fotobox</span>
          </h2>
          <p className="text-white/85 text-[17px] md:text-[18px] leading-relaxed mb-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Visuelle UND akustische Erinnerungen: Das Audio-Gästebuch lässt sich direkt
            als Add-On zur Fotobox dazubuchen. Eure Gäste lachen vor der Kamera und
            sprechen am Telefon – und Ihr habt hinterher beides.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/preise" className="btn-brand">Fotobox-Preise ansehen</Link>
            <Link href="/impressionen" className="btn-outline">Impressionen ansehen</Link>
          </div>
        </div>
      </section>

      {/* ========================================================================
          KUNDENREZENSIONEN
          ======================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Kundenrezensionen
            </h2>
            <p className="text-[18px] md:text-[22px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Das sagen unsere Kunden zum Knipserl
            </p>
          </div>
          {reviewData && <GoogleReviewsSlider data={reviewData} />}
        </div>
      </section>

      {/* ========================================================================
          AUTOR / DATUM — GEO-Signal: Byline + Datum erhöhen LLM-Zitierbarkeit
          ======================================================================== */}
      <section className="pb-16 -mt-6">
        <div className="max-w-[820px] mx-auto px-6">
          <div className="border-t border-[#e5e3df] pt-6 text-center text-[#999] text-[13px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Text: <strong className="text-[#666]">Andreas Huber</strong>, Inhaber{" "}
            {SITE_NAME}, {ADDRESS.street}, {ADDRESS.zip} {ADDRESS.city}. Telefon{" "}
            {CONTACT_PHONE_DISPLAY}. Letzte Aktualisierung: April 2026.
          </div>
        </div>
      </section>

      {/* ========================================================================
          STICKY MOBILE CTA BAR
          ======================================================================== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#e5e3df] shadow-[0_-4px_12px_rgba(0,0,0,0.08)] p-3">
        <Link
          href="#anfragen"
          className="btn-brand w-full whitespace-nowrap text-[17px] py-3"
        >
          Verfügbarkeit prüfen
        </Link>
      </div>
    </>
  );
}
