import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import PageHeader from "@/components/layout/PageHeader";
import { SEO_CITIES, BASE_PRICE, BASE_FEATURES, SITE_URL, SITE_NAME, ADDRESS, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
  generateFAQSchema,
} from "@/lib/seo";

export function generateStaticParams() {
  return SEO_CITIES.map((city) => ({ city: city.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = SEO_CITIES.find((c) => c.slug === slug);
  if (!city) return {};

  return generatePageMetadata({
    title: city.seoTitle,
    description: city.description,
    path: `/fotobox/${city.slug}`,
  });
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = SEO_CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: `Fotobox ${city.name}`, url: `/fotobox/${city.slug}` },
  ]);

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Fotobox mieten in ${city.name}`,
    serviceType: "Fotobox Verleih",
    description: city.description,
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
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: city.landkreis,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.lat,
        longitude: city.lng,
      },
    },
    offers: {
      "@type": "Offer",
      price: String(BASE_PRICE),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/fotobox/${city.slug}`,
    },
  };

  // readonly -> mutable copy, weil SEO_CITIES "as const" ist
  const faqSchema = generateFAQSchema(city.faqs.map((f) => ({ question: f.question, answer: f.answer })));

  const otherCities = SEO_CITIES.filter((c) => c.slug !== city.slug);

  // Stadtspezifische Headlines mit Fallback auf generische (fuer Staedte ohne eigene Headlines)
  const headlines = ("headlines" in city ? city.headlines : undefined) as
    | { momente: string; bedienung: string; fotoprops: string; qualitaet: string }
    | undefined;
  const h = {
    momente: headlines?.momente ?? "Momente für die Ewigkeit",
    bedienung: headlines?.bedienung ?? "Einfache Bedienung",
    fotoprops: headlines?.fotoprops ?? "Unsere Fotoprops",
    qualitaet: headlines?.qualitaet ?? "Höchste Qualität garantiert",
  };

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

      {/* Wood-Texture-Streifen ohne Titel — verhindert die Doppelung
          "Fotobox mieten in X" (Streifen + Hero-H1). H1 kommt aus dem Hero. */}
      <PageHeader />

      {/* ========================================================================
          HERO — Intro + Bild + CTA
          ======================================================================== */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-12 items-center">
            <div>
              <p className="text-[#F3A300] text-[16px] md:text-[18px] font-semibold mb-3 font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.05em]">
                {city.heroTeaser}
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-6">
                Fotobox mieten in {city.name}
              </h1>
              <div className="text-[#666] text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>{city.heroP1}</p>
                <p>{city.heroP2}</p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="#anfragen" className="btn-brand whitespace-nowrap">
                  Jetzt reservieren
                </Link>
                <Link href="/preise" className="btn-outline-dark whitespace-nowrap">
                  Ab {BASE_PRICE}&euro; konfigurieren
                </Link>
              </div>
            </div>
            <div className="relative aspect-[3/4] w-full max-w-[450px] mx-auto shadow-2xl">
              <Image
                src="/images/landing/fotobox-mieten.jpg"
                alt={`Knipserl Fotobox mieten in ${city.name}`}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          MOMENTE — Emotion + Unterhaltung
          ======================================================================== */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-12 items-center">
            <div className="relative w-full max-w-[340px] mx-auto">
              <Image
                src="/images/hero/fotobox-startseite.png"
                alt={`Knipserl Fotobox mit Drucker und Touchscreen`}
                width={714}
                height={1233}
                className="w-full h-auto drop-shadow-2xl"
                sizes="(max-width: 768px) 280px, 340px"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-[28px] md:text-[44px] leading-[1] inline-block mb-6">
                {h.momente}
              </h2>
              <div className="text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>{city.momenteP1}</p>
                {city.momenteP2 && <p>{city.momenteP2}</p>}
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center md:items-start">
                <Link href="/preise" className="btn-brand whitespace-nowrap">Die Preise</Link>
                <Link href="#anfragen" className="btn-outline whitespace-nowrap">Termin frei?</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          BEDIENUNG + FOTOPROPS — Features in 2 Spalten
          ======================================================================== */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            {/* Einfache Bedienung — Text + Bild als eine Einheit (Mobile-Reihenfolge) */}
            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  {h.bedienung}
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>{city.bedienungP1}</p>
                  <p>{city.bedienungP2}</p>
                </div>
              </div>
              <div className="relative aspect-[4/3] shadow-xl mt-8 md:mt-auto md:pt-10">
                <Image
                  src="/images/landing/einfache-bedienung.png"
                  alt="Einfache Bedienung der Knipserl Fotobox über den 22-Zoll-Touchscreen"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Fotoprops — Text + Bild als eine Einheit */}
            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  {h.fotoprops}
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>{city.fotopropsP1}</p>
                  <p>{city.fotopropsP2}</p>
                </div>
              </div>
              <div className="relative aspect-[4/3] shadow-xl mt-8 md:mt-auto md:pt-10">
                <Image
                  src="/images/landing/unsere-fotoprops.webp"
                  alt={`Gäste mit Fotoprops an der Knipserl Fotobox in ${city.name}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================
          QUALITÄT — Technik + Auf-/Abbau
          ======================================================================== */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-[28px] md:text-[44px] leading-[1] inline-block">
              {h.qualitaet}
            </h2>
          </div>
          <div className="max-w-[820px] mx-auto text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed text-center" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            <p>{city.qualitaetP1}</p>
            <p>{city.qualitaetP2}</p>
          </div>

          {/* Basispaket Features */}
          <div className="max-w-[900px] mx-auto mt-12">
            <h3 className="text-center text-[20px] md:text-[24px] text-[#F3A300] font-extrabold uppercase mb-6 font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
              Das ist im Basispaket ab {BASE_PRICE}&euro; enthalten
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {BASE_FEATURES.map((feature, i) => {
                // Item 0 = generischer Lieferungs-Hinweis → stadtspezifisch ueberschreiben
                const label = i === 0 ? `Kostenlose Lieferung nach ${city.name}` : feature;
                return (
                  <div key={feature} className="flex items-start gap-3 text-white/90 text-[15px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {label}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/preise" className="btn-brand">Ab {BASE_PRICE}&euro; konfigurieren</Link>
          </div>
        </div>
      </section>

      {/* ========================================================================
          FAQ — stadtspezifisch (FAQPage-Schema im <head>)
          ======================================================================== */}
      <section className="pt-16 md:pt-20 pb-16 md:pb-20">
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-[28px] md:text-[40px] leading-[1.05] text-[#1a171b]">
              Häufige Fragen zu {city.name}
            </h2>
          </div>
          <div className="space-y-3">
            {city.faqs.map((faq) => (
              <details
                key={faq.question}
                className="group bg-[#F3F4F6] rounded-lg overflow-hidden"
              >
                <summary className="cursor-pointer list-none px-6 py-4 flex items-center justify-between gap-4 font-bold text-[#1a171b] text-[17px] font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.02em]">
                  <span>{faq.question}</span>
                  <svg className="w-5 h-5 flex-shrink-0 text-[#F3A300] transition-transform group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 text-[#666] text-[15px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================
          INQUIRY FORM — 1:1 Startseiten-Pattern
          ======================================================================== */}
      <section id="anfragen" className="py-20 relative z-10 scroll-mt-20">
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Unverbindlich Anfragen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Prüfe jetzt ob eine Fotobox an Deinem Event verfügbar ist
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* ========================================================================
          CROSS-LINKS — Andere Städte
          ======================================================================== */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[32px] leading-[1.05] text-[#1a171b] mb-8">
            Fotobox auch in anderen Regionen
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/fotobox/${c.slug}`}
                className="px-5 py-2.5 text-[14px] font-[family-name:var(--font-fira-condensed)] uppercase font-bold tracking-[0.02em] hover:text-[#F3A300] transition-colors"
                style={{
                  background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat",
                  backgroundSize: "1000px 500px",
                  color: "white",
                }}
              >
                Fotobox {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
