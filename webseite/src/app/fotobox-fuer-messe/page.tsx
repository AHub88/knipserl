import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import ImpressionSection from "@/components/ImpressionSection";
import SlotImage from "@/components/SlotImage";
import PageHeader from "@/components/layout/PageHeader";
import { BASE_PRICE, BASE_FEATURES } from "@/lib/constants";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { fetchPageData } from "@/lib/pages";

export const metadata: Metadata = generatePageMetadata({
  title: "Fotobox für deinen Messestand inkl. Drucker mieten",
  description:
    "Miete unsere Knipserl Fotobox für deinen Messestand ➔ ✅ Druckpaket ✅ Auf- und Abbau ✅ Eigenes Fotolayout ✅ Online Galerie ✅ Profi Drucker",
  path: "/fotobox-fuer-messe",
  appendSiteName: false,
});

// Force dynamic: fetch aus Admin bei jedem Request, keine statische Vorberechnung
export const dynamic = "force-dynamic";

export default async function FotoboxMessePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Fotobox für Messe", url: "/fotobox-fuer-messe" },
  ]);
  const pageData = await fetchPageData("fotobox-fuer-messe");
  const slots = pageData?.slots ?? {};

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader />

      {/* HERO */}
      <section className="py-14 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1.1fr_1fr] gap-10 md:gap-12 items-center">
            <div>
              <p className="text-[#F3A300] text-[16px] md:text-[18px] font-semibold mb-3 font-[family-name:var(--font-fira-condensed)] uppercase tracking-[0.05em]">
                Mehr Besucher am Messestand
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-6">
                Fotobox für Messe
              </h1>
              <div className="text-[#666] text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Eine Fotobox mieten für die Messe: Es gibt gute Gründe, das zu tun. Mit einem Messestand muss man es erst einmal schaffen, sich gegen die Konkurrenz durchzusetzen und die Aufmerksamkeit der Besucher zu gewinnen.
                </p>
                <p>
                  Eine Fotobox auf der Messe erfüllt genau diese Funktion — besonders wenn es um Lifestyle oder Unterhaltung geht. Game-Hersteller laden zum Cosplay ein, Sportartikelhersteller zum Foto im Sportdress, Brillenhersteller zum Posen mit extravaganten Modellen.
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
            <div className="relative aspect-[3/4] w-full max-w-[450px] mx-auto shadow-2xl">
              <SlotImage
                slot={slots.hero}
                fallbackSrc="/images/fotobox/fotobox-setup-venue.jpg"
                alt="Knipserl Fotobox am Messestand"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DARK SECTION — Wenig Aufwand */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-12 items-center">
            <div className="relative w-full max-w-[340px] mx-auto">
              <Image
                src="/images/hero/fotobox-startseite.png"
                alt="Knipserl Fotobox für den Messestand"
                width={714}
                height={1233}
                className="w-full h-auto drop-shadow-2xl"
                sizes="(max-width: 768px) 280px, 340px"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-[28px] md:text-[44px] leading-[1] mb-6">
                Fotobox mieten für die Messe: mit wenig Aufwand viel erreichen
              </h2>
              <div className="text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Besucher Eures Messestands können das Foto innerhalb weniger Sekunden in hoher Qualität mit nach Hause nehmen. Messeerfolg mit Fotobox? Das funktioniert — und lässt sich mit dem richtigen Branding zu einer nachhaltigen Give-away-Kampagne entwickeln.
                </p>
                <p>
                  Miete jetzt eine Fotobox für Messen in Wasserburg am Inn, Traunstein, Rosenheim, München, Mühldorf am Inn, Erding, Ebersberg oder Kufstein in Tirol. Bei Knipserl bekommt Ihr Top-Fototechnik für Euren Messestand — Aufbau, Abbau und Lieferung inklusive.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3 items-center md:items-start">
                <Link href="/preise" className="btn-brand whitespace-nowrap">Die Preise</Link>
                <Link href="#anfragen" className="btn-outline whitespace-nowrap">Termin frei?</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2-SPALTER — Technik + Druckflatrate */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  Top-Technik für jeden Messestand
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Ausgestattet ist die Fotobox mit einer hochauflösenden Spiegelreflexkamera (16 Megapixel). Einsetzbar bei verschiedensten Lichtverhältnissen — dadurch entstehen gute Fotos unabhängig davon, wo Euer Messestand in der Halle steht.
                  </p>
                  <p>
                    Nach dem Fotografieren dauert es nur etwa acht Sekunden, bis der Thermosublationsdrucker die Fotos in Studioqualität ausdruckt. Eure Messebesucher können die Bilder sofort mitnehmen.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/features/druckflatrate.png"
                    alt="Hochwertige Fotoprints direkt am Messestand"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  Druckpaket & digitale Galerie
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Die Fotobox kommt mit einem Druckpaket für bis zu 400 Bilder (10×15 cm) oder 800 Bilder (5×15 cm, Doppel-Streifen). Das reicht in der Regel für bis zu 13 Stunden Dauerbetrieb am Messestand.
                  </p>
                  <p>
                    Als Inhaber des Messestands bekommt Ihr alle Fotos am Tag nach der Messe in voller Auflösung (4928×3264 Pixel) zum Download — ideal für Social Media, Website oder Nachbereitung der Messe.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/features/online-galerie.png"
                    alt="Online-Galerie nach der Messe"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BASISPAKET */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-[28px] md:text-[44px] leading-[1] inline-block">
              Was im Basispaket enthalten ist
            </h2>
          </div>
          <h3 className="text-center text-[20px] md:text-[24px] text-[#F3A300] font-extrabold uppercase mb-6 font-[family-name:var(--font-fira-condensed)] tracking-[0.02em]">
            Ab {BASE_PRICE}&euro; — alles drin für Euren Messeauftritt
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
            {BASE_FEATURES.map((feature) => (
              <div key={feature} className="flex items-start gap-3 text-white/90 text-[15px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/preise" className="btn-brand">Ab {BASE_PRICE}&euro; konfigurieren</Link>
          </div>
        </div>
      </section>

      {/* IMPRESSIONS — wird im Admin unter /pages/fotobox-fuer-messe gepflegt */}
      <ImpressionSection
        pageSlug="fotobox-fuer-messe"
        title="Messe-Impressionen"
        subtitle="Unsere Fotobox im Einsatz auf Messeständen"
      />

      {/* INQUIRY FORM */}
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

      {/* CROSS-LINKS */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[32px] leading-[1.05] text-[#1a171b] mb-8">
            Fotobox für weitere Anlässe
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/fotobox-fuer-hochzeit", label: "Hochzeit" },
              { href: "/fotobox-fuer-firmenfeier", label: "Firmenfeier" },
              { href: "/fotobox-fuer-weihnachtsfeier", label: "Weihnachtsfeier" },
              { href: "/love-buchstaben", label: "XXL LOVE Leuchtbuchstaben" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-5 py-2.5 text-[14px] font-[family-name:var(--font-fira-condensed)] uppercase font-bold tracking-[0.02em] hover:text-[#F3A300] transition-colors"
                style={{
                  background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat",
                  backgroundSize: "1000px 500px",
                  color: "white",
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
