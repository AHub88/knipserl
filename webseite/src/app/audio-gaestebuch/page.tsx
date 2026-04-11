import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ImageLightbox from "@/components/ImageLightbox";
import InquiryForm from "@/components/forms/InquiryForm";
import { type ReviewData } from "@/components/GoogleReviewsSlider";
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
    "Audio-Gästebuch / Gästetelefon mieten — deutschlandweiter Versand per Post. Vintage-Telefon für Hochzeit, Geburtstag oder Firmenfeier. 100 € + 20 € Versand. Rücksendeetikett inklusive.",
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
  "Vintage-Telefon im Retro-Look",
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
    title: "Paket kommt per Post",
    text: "Wir schicken das Gästetelefon rechtzeitig vor Eurem Event per DHL zu Euch nach Hause – inklusive frankiertem Rücksendeetikett.",
  },
  {
    step: "3",
    title: "Gäste hinterlassen Nachrichten",
    text: "Hörer abnehmen, Begrüßung anhören, sprechen, auflegen. So einfach, dass Oma und Opa das auch schaffen.",
  },
  {
    step: "4",
    title: "Zurücksenden & MP3 erhalten",
    text: "Einfach zurück in den Karton, Etikett drauf, bei der Post abgeben. Wenige Tage später bekommt Ihr alle Aufnahmen als MP3-Download.",
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
      "Unser Gästetelefon kostet 100 € für Eure Veranstaltung plus 20 € Versandpauschale (Hin- und Rückversand per DHL, frankiertes Rücksendeetikett liegt bei). Wenn Ihr das Audio-Gästebuch direkt zur Knipserl Fotobox dazubucht, entfällt der Versand komplett – wir bringen es dann einfach mit.",
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
    question: "Wie lange vor dem Event sollte ich buchen?",
    answer:
      "Für Hochzeiten in der Hauptsaison (Mai bis September) empfehlen wir eine Buchung mindestens 3 bis 6 Monate im Voraus. Kurzfristige Anfragen sind möglich – prüfe einfach im Kalender auf dieser Seite, ob Dein Datum noch frei ist.",
  },
  {
    question: "Versendet Ihr deutschlandweit?",
    answer:
      "Ja. Wir verschicken das Audio-Gästebuch per DHL deutschlandweit – egal ob Eure Feier in München, Hamburg, Berlin oder auf Sylt stattfindet. Der Versand ist in der 20-€-Versandpauschale enthalten, ein frankiertes Rücksendeetikett liegt dem Paket bei. Bei Kombi mit unserer Fotobox im Umkreis Oberbayern/Tirol liefern wir persönlich und der Versand entfällt.",
  },
  {
    question: "Können wir Audio-Gästebuch und Fotobox kombinieren?",
    answer:
      "Sehr gerne – das ist sogar unser beliebtestes Kombi-Setup. Ihr könnt das Gästetelefon direkt im Preiskonfigurator als Add-On zur Fotobox hinzubuchen. Eure Gäste haben so visuelle UND akustische Erinnerungen.",
  },
];

const PACKAGE_FEATURES = [
  "Vintage-Gästetelefon im Retro-Look",
  "Persönliche Begrüßungsansage (von Euch oder von uns eingesprochen)",
  "Autark – kein Strom, kein WLAN nötig",
  "Unbegrenzte Anzahl Aufnahmen",
  "Alle Aufnahmen als MP3 zum Download nach dem Event",
  "Versand per DHL inkl. frankiertem Rücksendeetikett",
  "Bei Kombi mit Fotobox: Versand kostenlos",
];

const IMPRESSIONEN = [
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-005-2500x1875.jpg", alt: "Audio-Gästebuch Gästetelefon im Einsatz bei einer Hochzeit" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-015-2500x1875.jpg", alt: "Vintage-Gästetelefon Nahaufnahme mit Holzkasten" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-016-2500x1875.jpg", alt: "Gästetelefon als Audio-Gästebuch auf Brauttisch" },
  { src: "/images/audio-gaestebuch/audio-gaestebuch-mieten-017-2500x1875.jpg", alt: "Audio-Gästebuch / Gästetelefon zum Mieten für Hochzeit und Feier" },
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

  // Service-Schema für Gästetelefon — deutschlandweiter Verleih per DHL
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Audio-Gästebuch / Gästetelefon mieten",
    serviceType: "Audio-Gästebuch Verleih",
    description:
      "Vintage-Gästetelefon im Retro-Look zum Mieten für Hochzeiten, Geburtstage und Firmenfeiern. Deutschlandweiter Versand per DHL inkl. Rücksendeetikett. Gäste hinterlassen Sprachnachrichten, die als MP3 nach dem Event übergeben werden.",
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
    areaServed: {
      "@type": "Country",
      name: "Deutschland",
    },
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

      <PageHeader title="Audio-Gästebuch / Gästetelefon" decorative />

      {/* SVG-Filter: animierte Grunge-Border für Preis-Card */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
        <defs>
          <filter id="grunge-border-heavy-animated" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="2" seed="13" result="noise">
              <animate attributeName="seed" values="13;15;17;19;21;13" dur="8s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="16" />
          </filter>
        </defs>
      </svg>

      {/* ========================================================================
          HERO — Emotion + USP + Preis-Anker + primary CTA + micro-trust
          ======================================================================== */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-12 items-center">
            <div>
              <p className="text-[#F3A300] text-[16px] md:text-[18px] font-semibold mb-3 font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.05em]">
                Deutschlandweiter Versand per DHL
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-5">
                Audio-Gästebuch mieten
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

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-5">
                <span className="text-[#1a171b] text-[42px] md:text-[52px] leading-[1] font-extrabold font-[family-name:var(--font-fira-condensed)]">
                  100&nbsp;€
                </span>
                <span className="text-[#666] text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  + 20 € Versand
                </span>
                <span className="w-full text-[#999] text-[13px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  inkl. MwSt. · Rücksendeetikett inklusive · bei Fotobox-Kombi versandfrei
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
          TRUST BAR — Social Proof + Claims mit Icons & Dividern
          ======================================================================== */}
      <section
        className="relative z-10 py-14 md:py-16 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x md:divide-white/15 text-center">
            {[
              {
                big: "Familienbetrieb",
                small: "aus Bruckmühl – Oberbayern",
                icon: (
                  <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
              },
              {
                big: "Deutschlandweit",
                small: "Versand per DHL · Rücksendeetikett inkl.",
                icon: (
                  <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M14 10l7-7M9 21H5a2 2 0 01-2-2v-4m0-4V5a2 2 0 012-2h4m4 18h4a2 2 0 002-2v-4" />
                  </svg>
                ),
              },
              {
                big: "Plug & Play",
                small: "Autark, kein Strom nötig",
                icon: (
                  <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
              },
              {
                big: "Ausfall-Garantie",
                small: "Volle Rückerstattung bei Defekt",
                icon: (
                  <svg className="w-8 h-8 md:w-9 md:h-9" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div key={item.big} className="flex flex-col items-center md:px-6">
                <div className="text-[#F3A300] mb-3">{item.icon}</div>
                <div className="text-white text-[18px] md:text-[20px] font-extrabold uppercase leading-[1.1] font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
                  {item.big}
                </div>
                <div className="text-white/70 text-[13px] md:text-[14px] mt-2 max-w-[200px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
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
              <strong>Hochzeitstelefon</strong> genannt – ist ein Telefon im Vintage-Look,
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
                <h3 className="text-[20px] md:text-[22px] leading-[1.2] text-white mb-3 uppercase font-extrabold font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
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
            <table className="w-full min-w-[720px] border-collapse text-[15px] md:text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              <caption className="sr-only">Audio-Gästebuch vs. klassisches Gästebuch vs. Polaroid-Gästebuch im Vergleich</caption>
              <thead>
                <tr
                  style={{
                    background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat",
                    backgroundSize: "1000px 500px",
                  }}
                >
                  <th scope="col" className="text-left px-5 py-4 text-white font-bold uppercase text-[12px] md:text-[13px] tracking-[0.08em] font-[family-name:var(--font-fira-condensed)] border border-[#1a171b]">
                    Kriterium
                  </th>
                  <th scope="col" className="text-left px-5 py-4 text-[#F3A300] font-bold uppercase text-[12px] md:text-[13px] tracking-[0.08em] font-[family-name:var(--font-fira-condensed)] border border-[#1a171b] border-t-4 border-t-[#F3A300]">
                    Audio-Gästebuch
                  </th>
                  <th scope="col" className="text-left px-5 py-4 text-white/70 font-bold uppercase text-[12px] md:text-[13px] tracking-[0.08em] font-[family-name:var(--font-fira-condensed)] border border-[#1a171b]">
                    Klassisches Gästebuch
                  </th>
                  <th scope="col" className="text-left px-5 py-4 text-white/70 font-bold uppercase text-[12px] md:text-[13px] tracking-[0.08em] font-[family-name:var(--font-fira-condensed)] border border-[#1a171b]">
                    Polaroid-Gästebuch
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.label} className="bg-white">
                    <td className="px-5 py-4 align-top text-[#1a171b] font-bold uppercase text-[15px] md:text-[16px] tracking-[0.02em] font-[family-name:var(--font-fira-condensed)] border border-[#e5e3df]">
                      {row.label}
                    </td>
                    <td className="px-5 py-4 align-top text-[#1a171b] text-[15px] md:text-[16px] bg-[#F3A300]/[0.08] border border-[#F3A300]/40">
                      {row.audio}
                    </td>
                    <td className="px-5 py-4 align-top text-[#666] text-[15px] md:text-[16px] border border-[#e5e3df]">
                      {row.klassisch}
                    </td>
                    <td className="px-5 py-4 align-top text-[#666] text-[15px] md:text-[16px] border border-[#e5e3df]">
                      {row.polaroid}
                    </td>
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
          <ImageLightbox images={IMPRESSIONEN} />
        </div>
      </section>

      {/* ========================================================================
          PREIS & LEISTUNGSUMFANG
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

          {/* ================= Preis-Card: Heavy Grunge + Animated Border ================= */}
          <div className="relative">
            <div
              className="absolute inset-0 bg-white border-[6px] border-[#1a171b] shadow-2xl"
              style={{ filter: "url(#grunge-border-heavy-animated)" }}
              aria-hidden="true"
            />
            <div className="relative px-6 md:px-12 pt-14 pb-14">
              <div className="text-center mb-6">
                <div className="text-[#F3A300] text-[13px] uppercase tracking-[0.2em] mb-2 font-[family-name:var(--font-fira-condensed)]">
                  Das Paket
                </div>
                <h3 className="heading-decorated text-[24px] md:text-[34px] leading-[1] text-[#1a171b] inline-block">
                  Audio-Gästebuch
                </h3>
              </div>

              <div className="text-center mb-8">
                <div className="inline-flex items-baseline gap-2 md:gap-3 flex-wrap justify-center">
                  <span className="text-[#1a171b] text-[56px] md:text-[96px] leading-[0.9] font-extrabold font-[family-name:var(--font-fira-condensed)]">
                    100&nbsp;€
                  </span>
                  <div className="flex flex-col items-start">
                    <span className="text-[#1a171b] text-[18px] md:text-[24px] leading-[1] font-extrabold font-[family-name:var(--font-fira-condensed)]">
                      + 20 €
                    </span>
                    <span className="text-[#666] text-[11px] md:text-[13px] uppercase tracking-[0.1em] font-[family-name:var(--font-fira-condensed)]">
                      Versand
                    </span>
                  </div>
                </div>
                <div className="text-[#666] text-[14px] mt-2" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  inkl. MwSt. · Rücksendeetikett inklusive
                </div>
              </div>

              <div className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 bg-[#F3A300]/15 border-2 border-dashed border-[#F3A300] px-4 py-2 -rotate-1">
                  <svg className="w-5 h-5 text-[#F3A300]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 3h5v5M14 10l7-7M9 21H5a2 2 0 01-2-2v-4m0-4V5a2 2 0 012-2h4m4 18h4a2 2 0 002-2v-4" />
                  </svg>
                  <span className="text-[#1a171b] text-[13px] md:text-[14px] font-extrabold uppercase tracking-[0.05em] font-[family-name:var(--font-fira-condensed)]">
                    Rücksendung frei Haus
                  </span>
                </div>
              </div>

              <div className="md:columns-2 gap-x-8 max-w-[700px] mx-auto mb-10">
                {PACKAGE_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-3 text-[#1a171b] text-[15px] mb-3 break-inside-avoid" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="#anfragen" className="btn-brand whitespace-nowrap text-[14px] md:text-[18px] px-4 md:px-6 py-2.5 md:py-3">
                  Jetzt Termin prüfen
                </Link>
                <Link href="/preise" className="btn-outline-dark whitespace-nowrap text-[14px] md:text-[18px] px-4 md:px-6 py-2.5 md:py-3">
                  Mit Fotobox kombinieren
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================
          VERSAND — deutschlandweit per DHL
          ======================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] text-[#1a171b] inline-block">
              Versand deutschlandweit
            </h2>
          </div>
          <p className="text-center text-[18px] md:text-[22px] text-[#F3A300] font-semibold mb-8 font-[family-name:var(--font-fira-condensed)]">
            Wo immer Eure Feier stattfindet – das Gästetelefon kommt per Post
          </p>
          <p className="max-w-[750px] mx-auto text-center text-[#666] text-[17px] leading-relaxed mb-12" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Wir verschicken das Audio-Gästebuch per DHL in ganz Deutschland – inklusive
            frankiertem Rücksendeetikett. Kombiniert Ihr es mit unserer Fotobox in
            Oberbayern oder Tirol, liefern wir es persönlich mit und der Versand entfällt.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-[#1a171b]/15 max-w-[1000px] mx-auto text-center">
            {[
              {
                title: "Hinversand per DHL",
                text: "Wir schicken das Paket rechtzeitig vor Eurem Termin – sicher verpackt im Original-Karton.",
                icon: (
                  <svg className="w-10 h-10 md:w-11 md:h-11" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                ),
              },
              {
                title: "Rücksendeetikett inklusive",
                text: "Frankiertes DHL-Label liegt bei. Karton zukleben, abgeben, fertig – Ihr zahlt nichts.",
                icon: (
                  <svg className="w-10 h-10 md:w-11 md:h-11" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
              {
                title: "Bei Fotobox-Kombi versandfrei",
                text: "Bucht Ihr unsere Knipserl Fotobox dazu, bringen wir das Gästetelefon persönlich mit.",
                icon: (
                  <svg className="w-10 h-10 md:w-11 md:h-11" fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M5 6h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2zm4 8h6" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div key={f.title} className="flex flex-col items-center md:px-6">
                <div className="text-[#F3A300] mb-4">{f.icon}</div>
                <h3 className="text-[#1a171b] text-[18px] md:text-[20px] font-extrabold uppercase leading-[1.1] mb-3 font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
                  {f.title}
                </h3>
                <p className="text-[#666] text-[14px] md:text-[15px] leading-relaxed max-w-[260px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {f.text}
                </p>
              </div>
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
            sprechen am Telefon – und Ihr habt hinterher beides. <strong className="text-white">Bonus:</strong>{" "}
            <span className="text-[#F3A300] font-semibold">Versand entfällt</span> – wir
            bringen das Telefon mit der Fotobox persönlich vorbei.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/preise" className="btn-brand">Fotobox-Preise ansehen</Link>
            <Link href="/impressionen" className="btn-outline">Impressionen ansehen</Link>
          </div>
        </div>
      </section>

      {/* ========================================================================
          FAQ — Accordion mit <details>. FAQPage-Schema ist oben eingefügt.
          Byline/Datum als kleiner GEO-Footer direkt drunter (war vorher eigene Section).
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

          <div className="space-y-4">
            {FAQS.map((faq) => (
              <details
                key={faq.question}
                className="group overflow-hidden rounded-sm"
              >
                <summary
                  className="flex items-center justify-between px-5 md:px-6 py-4 md:py-5 cursor-pointer text-white font-bold text-[15px] md:text-[18px] uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide list-none"
                  style={{
                    background: "#444 url('/images/misc/main_back_gr-2.webp') repeat",
                    backgroundSize: "1000px 500px",
                  }}
                >
                  <span>{faq.question}</span>
                  <span className="text-white text-[24px] font-normal flex-shrink-0 ml-4 group-open:hidden">+</span>
                  <span className="text-white text-[24px] font-normal flex-shrink-0 ml-4 hidden group-open:inline">−</span>
                </summary>
                <div
                  className="px-5 md:px-6 py-5 text-white text-[15px] md:text-[16px] leading-relaxed"
                  style={{
                    fontFamily: "'Fira Sans', sans-serif",
                    background: "#333 url('/images/misc/main_back_gr-2.webp') repeat",
                    backgroundSize: "1000px 500px",
                    backgroundPosition: "0 -200px",
                  }}
                >
                  {faq.answer}
                </div>
              </details>
            ))}
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
