import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import ImpressionSection from "@/components/ImpressionSection";
import SlotImage from "@/components/SlotImage";
import CityCrossLinks from "@/components/CityCrossLinks";
import PageHeader from "@/components/layout/PageHeader";
import { BASE_PRICE, BASE_FEATURES } from "@/lib/constants";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { fetchPageData } from "@/lib/pages";

export const metadata: Metadata = generatePageMetadata({
  title: "Fotobox für Firmenfeier mieten — Unvergessliche Erinnerungen",
  description:
    "Miete unsere Knipserl Fotobox für deine Firmenfeier ➔ ✅ Druckpaket ✅ individuelles Layout ✅ Online-Galerie ✅ Profi-Drucker. Jetzt informieren!",
  path: "/fotobox-fuer-firmenfeier",
  appendSiteName: false,
});

// Force dynamic: fetch aus Admin bei jedem Request, keine statische Vorberechnung
export const dynamic = "force-dynamic";

export default async function FotoboxFirmenfeierPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Fotobox für Firmenfeier", url: "/fotobox-fuer-firmenfeier" },
  ]);
  const pageData = await fetchPageData("fotobox-fuer-firmenfeier");
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
                B2B-Events, die in Erinnerung bleiben
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-6">
                Fotobox für Firmenfeier
              </h1>
              <div className="text-[#666] text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Egal ob Weihnachtsfeier oder Sommerfest, Messeauftritt oder B2B-Konferenz: Eines haben diese Anlässe gemein — Kollegen können die Zeit miteinander genießen, weit weg vom Schreibtisch. Diese Ausgelassenheit will festgehalten werden.
                </p>
                <p>
                  Unsere Knipserl-Fotobox für B2B-Events verstärkt die Kommunikation, stärkt das Gruppengefühl und lässt unvergessliche Bilder entstehen.
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
                fallbackSrc="/images/misc/knipsi-firmenfeier.png"
                alt="Knipserl Fotobox für die Firmenfeier"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DARK SECTION — Druck-Layout */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-10 md:gap-12 items-center">
            <div className="relative w-full max-w-[340px] mx-auto">
              <Image
                src="/images/hero/fotobox-startseite.png"
                alt="Knipserl Fotobox mit Drucker und Touchscreen"
                width={714}
                height={1233}
                className="w-full h-auto drop-shadow-2xl"
                sizes="(max-width: 768px) 280px, 340px"
              />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-[28px] md:text-[44px] leading-[1] mb-6">
                Individuell angepasstes Druck-Layout für den perfekten Auftritt
              </h2>
              <div className="text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Der eingebaute Thermosublationsdrucker liefert Euch Bilder, die die Besucher der Messe oder Firmenfeier direkt in den Händen halten können. Das Druck-Layout passen wir an Euer Branding an — mit Logo, Farben und Slogan.
                </p>
                <p>
                  Über die Social-Sharing-Funktion lassen sich Fotos zusätzlich direkt per E-Mail versenden. Dadurch sind die Bilder in wenigen Sekunden auf den Smartphones der Besucher — ideal als Give-away mit Werbewirkung.
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

      {/* 2-SPALTER — Greenscreen + Live-Slideshow */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  Greenscreen: Professionalität & Unterhaltung
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Optional buchbar: ein Greenscreen, mit dem Ihr den Hintergrund am 22-Zoll-Touchscreen individuell auswählt. Im Dschungel, in der Wüste oder am Berggipfel — Eure Mitarbeiter sind in Sekunden dort, wo Ihr sie haben wollt.
                  </p>
                  <p>
                    Lässt sich an den Inhalt Eurer Arbeit anpassen und erzeugt in Kombination mit dem Druck-Layout individuelle Bilder, die Euer Unternehmen widerspiegeln.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/addons/hintergrundsystem.jpg"
                    alt="Knipserl Greenscreen für Firmenfeier-Fotobox"
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
                  Live-Slideshow & Branding
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Die entstandenen Bilder präsentieren wir auf Wunsch per Live-Slideshow direkt vor Ort. Ein dynamisches Hilfsmittel, das jede Firmenfeier und jeden Messestand aufpeppt und für Gesprächsstoff sorgt.
                  </p>
                  <p>
                    Jeder Bildschirm und jedes Druck-Layout lässt sich mit Eurer Marke und Euren Farben versehen — für ein rundes Gesamtbild, das zum Messestand und zum Konferenzraum passt.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/addons/live-slideshow.png"
                    alt="Live-Slideshow der Knipserl Fotobox auf der Firmenfeier"
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
            Ab {BASE_PRICE}&euro; — Rundum-Paket für Euer Firmenevent
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

      {/* IMPRESSIONS — wird im Admin unter /pages/fotobox-fuer-firmenfeier gepflegt */}
      <ImpressionSection
        pageSlug="fotobox-fuer-firmenfeier"
        title="Firmenfeier-Impressionen"
        subtitle="Unsere Fotobox bei Firmenfeiern und Corporate-Events"
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

      <CityCrossLinks occasionLabel="Firmenfeier" />

      {/* CROSS-LINKS */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[32px] leading-[1.05] text-[#1a171b] mb-8">
            Fotobox für weitere Anlässe
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/fotobox-fuer-hochzeit", label: "Hochzeit" },
              { href: "/fotobox-fuer-messe", label: "Messe" },
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
