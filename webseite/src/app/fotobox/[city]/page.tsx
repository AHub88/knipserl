import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import PageHeader from "@/components/layout/PageHeader";
import { SEO_CITIES, BASE_PRICE, SITE_URL, SITE_NAME, ADDRESS, CONTACT_PHONE_DISPLAY } from "@/lib/constants";
import {
  generatePageMetadata,
  generateBreadcrumbSchema,
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
    title: `Fotobox mieten in ${city.name} | Ab ${BASE_PRICE}€ inkl. Drucker`,
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
    },
    offers: {
      "@type": "Offer",
      price: String(BASE_PRICE),
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: `${SITE_URL}/fotobox/${city.slug}`,
    },
  };

  const otherCities = SEO_CITIES.filter((c) => c.slug !== city.slug);

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

      <PageHeader title={`Fotobox mieten in ${city.name}`} decorative />

      {/* ========================================================================
          HERO — Intro + Bild + CTA
          ======================================================================== */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-12 items-center">
            <div>
              <p className="text-[#F3A300] text-[16px] md:text-[18px] font-semibold mb-3 font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.05em]">
                Für den perfekten Schnappschuss bei Eurer Feier
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-6">
                Fotobox mieten in {city.name}
              </h1>
              <div className="text-[#666] text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Mit der <strong>Knipserl-Fotobox aus {city.name}</strong> könnt
                  Ihr auf Eurer <strong>Hochzeit</strong>, dem{" "}
                  <strong>Firmenevent</strong> oder auf{" "}
                  <strong>Messen</strong> die geschossenen Bilder direkt in den
                  Händen halten! Unser Knipserl ähnelt im Prinzip einer Kamera
                  mit Selbstauslöser.
                </p>
                <p>
                  Die gigantische Selfie-Maschine hat jedoch den großen Vorteil,
                  dass die Bilder in einer bestechend scharfen Qualität
                  geschossen werden und diese zudem direkt für eine Menge Spaß
                  sorgen! Denn unsere <strong>Fotobox aus {city.name}</strong>{" "}
                  kommt inklusive eingebautem{" "}
                  <strong>Profi-Drucker</strong>, der die Bilder der
                  hochauflösenden <strong>Spiegelreflexkamera</strong> im
                  Handumdrehen ausdruckt! Wir liefern nach {city.name} und
                  Umgebung – auch nach {city.nearbyAreas.slice(0, -1).join(", ")}{" "}
                  und {city.nearbyAreas[city.nearbyAreas.length - 1]}.
                </p>
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
            {/* TODO: Platzhalter — durch Original-Setup-Bild (Curtain-Venue) ersetzen */}
            <div className="relative aspect-[3/4] w-full max-w-[450px] mx-auto shadow-2xl">
              <Image
                src="/images/gallery/fotobox-rosenheim-bild2.jpg"
                alt={`Knipserl Fotobox Aufbau bei Event in ${city.name}`}
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
            <div>
              <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block mb-6">
                Momente für die Ewigkeit
              </h2>
              <div className="text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Neben genialen Bildern, die häufig auch durch verschiedenste
                  Kostüme oder Masken vor Ort aufgefrischt werden können, sorgt
                  das Knipserl nicht nur für tolle Erinnerungen, sondern auch für
                  jede Menge Spaß!
                </p>
                <p>
                  Eure Gäste werden bestens unterhalten und Ihr werdet schnell
                  erkennen, dass sich so manche der Partybesucher schneller vor
                  der Linse finden, als sie selbst glauben konnten. Ein Spaß für
                  Groß und Klein, Jung und Alt und vor allem auch für Früh und
                  Spät. Klar ist: Je später, desto verrückter.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
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
            {/* Einfache Bedienung */}
            <div>
              <h2 className="heading-decorated text-[28px] md:text-[36px] leading-[1] text-[#1a171b] inline-block mb-6">
                Einfache Bedienung
              </h2>
              <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Die Bedienung unserer <strong>Fotobox</strong> ist ein
                  Kinderspiel. Vergleichbar mit einem klassischen Fotoautomat
                  vergangener Jahrzehnte muss sich einfach davorgesetzt werden
                  und es kann losgehen. Der kleine aber feine Unterschied ist der{" "}
                  <strong>22-Zoll-Bildschirm</strong>, der die Bedienung noch
                  einfacher macht.
                </p>
                <p>
                  Selbsterklärend und intuitiv kann zwischen verschiedenen
                  Fotoeffekten gewählt werden, die stark an die Funktionen von
                  Instagram erinnern. Egal ob Firmenfeier, Hochzeit, Geburtstag
                  oder Vereinsfest: Die einfache Handhabung sorgt dafür, dass die
                  Fotobox durchgehend genutzt wird.
                </p>
              </div>
            </div>

            {/* Fotoprops */}
            <div>
              <h2 className="heading-decorated text-[28px] md:text-[36px] leading-[1] text-[#1a171b] inline-block mb-6">
                Unsere Fotoprops
              </h2>
              <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Eine <strong>Fotobox für die Hochzeit mieten</strong> oder
                  damit das Firmenevent aufpeppen ist eine Leichtigkeit. Vor
                  allem durch unsere <strong>Fotoprops</strong> (Accessoires).
                  Das lustige Zubehör macht eine Gruppe von Freunden in Sekunden
                  zu einer Rockband, Kollegen zu einer bunten Partymeute oder
                  Geburtstagsgäste zu wilden Tieren.
                </p>
                <p>
                  Dadurch braucht es nicht zwangsläufig das digitale Tuning durch
                  die Instagram-Fotoeffekte. Mehr Spaß, mehr glorreiche
                  Erinnerungen und mehr Gesprächsstoff für Eure Hochzeit, Euer
                  Firmenevent oder Messeauftritt ist ohnehin garantiert.
                </p>
              </div>
            </div>
          </div>

          {/* Bilder-Reihe */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="relative aspect-[4/3] shadow-xl">
              <Image
                src="/images/gallery/fotobox-mieten-5-scaled.jpg"
                alt={`Gäste mit Fotoprops an der Knipserl Fotobox in ${city.name}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="relative aspect-[4/3] shadow-xl">
              <Image
                src="/images/fotobox/fotobox-mockup.jpg"
                alt="Knipserl Fotobox Aufbau – Touchscreen und Drucker"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
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
            <h2 className="heading-decorated text-[28px] md:text-[44px] leading-[1] inline-block">
              Höchste Qualität garantiert
            </h2>
            <p className="text-[18px] md:text-[22px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Knipserl-Fotobox mieten in {city.name}
            </p>
          </div>
          <div className="max-w-[820px] mx-auto text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed text-center" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            <p>
              Um Euch das <strong>Mieten</strong> unserer Fotobox so einfach wie
              möglich zu gestalten, ist der Auf- und Abbau natürlich inklusive.
              Viel Platz benötigen wir dafür nicht, der Abstand beträgt nur
              wenige Meter.
            </p>
            <p>
              Das Knipserl steht für höchste Qualität! Eine moderne{" "}
              <strong>Spiegelreflexkamera (DSLR)</strong> sorgt für
              hochauflösende Fotos, die bei jeglichen Lichtverhältnissen
              gelingen. Der Touchscreen lässt Euch die Einstellungen wie im
              Schlaf beherrschen und der{" "}
              <strong>High-End-Drucker (Thermosublimation)</strong> sorgt für
              mitnehmbare Erinnerungen auf Hochglanz-Fotopapier.
            </p>
          </div>

          {/* Basispaket Features */}
          <div className="max-w-[900px] mx-auto mt-12">
            <h3 className="text-center text-[20px] md:text-[24px] text-[#F3A300] font-extrabold uppercase mb-6 font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
              Das ist im Basispaket ab {BASE_PRICE}&euro; enthalten
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
              {[
                `Kostenlose Lieferung nach ${city.name}`,
                "Kompletter Auf- und Abbau",
                "Druckflatrate (400 Bilder in 10x15cm)",
                "Profi-Thermosublimationsdrucker",
                "Hochwertige Spiegelreflexkamera (16 MP)",
                "22 Zoll Full-HD Touchscreen",
                "Individuelles Drucklayout",
                "Online-Galerie mit Passwortschutz",
                "24/7 Telefonsupport",
              ].map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-white/90 text-[15px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-10">
            <Link href="/preise" className="btn-brand">Ab {BASE_PRICE}&euro; konfigurieren</Link>
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
          <h2 className="heading-decorated text-[24px] md:text-[32px] leading-[1] text-[#1a171b] inline-block mb-8">
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
