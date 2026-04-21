import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import ImpressionSection from "@/components/ImpressionSection";
import PageHeader from "@/components/layout/PageHeader";
import { BASE_PRICE, BASE_FEATURES } from "@/lib/constants";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Fotobox für deine Hochzeit inkl. Drucker mieten",
  description:
    "Miete unsere Knipserl Fotobox für deine ★ Hochzeit ★ Party ➔ ✅ Druckpaket ✅ Auf- und Abbau ✅ Eigenes Fotolayout ✅ Online Galerie ✅ Profi Drucker",
  path: "/fotobox-fuer-hochzeit",
  appendSiteName: false,
});

export default function FotoboxHochzeitPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Fotobox für Hochzeit", url: "/fotobox-fuer-hochzeit" },
  ]);

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
                Euer schönster Tag, festgehalten
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-6">
                Fotobox für Hochzeit
              </h1>
              <div className="text-[#666] text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Eine Fotobox mieten für die Hochzeit: Warum? Mit Sicherheit werden viele Hochzeitsgäste Bilder mit dem Smartphone schießen und eventuell wurde auch ein Profifotograf gebucht. Sind das nicht Bilder genug?
                </p>
                <p>
                  Ganz einfach: Ja — denn eine Fotobox ist mindestens ebenso sehr Teil eines gelungenen Unterhaltungsprogramms wie eine Möglichkeit für die Hochzeitsgäste, schöne Erinnerungen mit nach Hause zu nehmen. Sie haben viel Spaß und erhalten ausgedruckte Exemplare der Bilder in wenigen Sekunden. Und Du selbst? Bekommst alle Bilder am nächsten Tag in digitaler Form.
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
              <Image
                src="/images/misc/block-bg-wedding.jpg"
                alt="Knipserl Fotobox mieten für die Hochzeit"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DARK SECTION — Fotobox mieten zur Hochzeit */}
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
                Fotobox mieten zur Hochzeit: tolle Fotos am schönsten Tag
              </h2>
              <div className="text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Die Hochzeitsgäste haben viel Spaß und erhalten die ausgedruckten Bilder innerhalb weniger Sekunden. Durch die Spiegelreflexkamera mit 16 Megapixel entstehen Aufnahmen in professioneller Qualität — egal ob im Festsaal, im Garten oder in der Almhütte.
                </p>
                <p>
                  Knipserl liefert Deine Fotobox zur Hochzeit in Ebersberg, Erding, Mühldorf am Inn, München, Rosenheim, Traunstein, Wasserburg am Inn und Kufstein. Aufbau und Abbau übernehmen wir.
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

      {/* 2-SPALTER — Technik + Verkleiden */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  Knipserl Fotobox: Top-Technik für herausragende Bilder
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Die Knipserl-Fotobox besteht aus einer professionellen Spiegelreflexkamera mit 16 Megapixel Auflösung. Aufgrund der exzellenten Technik gelingen Bilder in nahezu jeder Umgebung.
                  </p>
                  <p>
                    Nach dem Auslösen dauert es rund acht Sekunden, bis der High-End-Drucker (Thermotransfer) das Foto in Studioqualität ausgedruckt hat. Da er das Bild mit einem Schutzfilm beschichtet, können die Gäste das Foto sofort berühren und problemlos mitnehmen.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/fotobox/fotobox-mockup.jpg"
                    alt="Knipserl Fotobox — Technik für die Hochzeit"
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
                  Verkleiden & fotografieren — doppelt so viel Spaß
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Alle Fotos werden nach der Hochzeit in hoher Auflösung (4928×3264 Pixel) in einer Onlinegalerie präsentiert. Als Auftraggeber erhältst Du Zugriff und kannst die Bilder anschauen und herunterladen. Den Zugang kannst Du mit allen Hochzeitsgästen teilen.
                  </p>
                  <p>
                    Zusätzlich zu den Fotoprops (Hüte, Brillen, Schnurrbärte) kannst Du einen Bildhintergrund oder unsere <Link href="/love-buchstaben" className="text-[#F3A300] hover:underline">XXL LOVE-Buchstaben</Link> hinzubuchen, die nicht nur im Bild richtig gut aussehen, sondern auch den Hochzeitssaal schmücken.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/gallery/fotobox-mieten-5.jpg"
                    alt="Gäste mit Fotoprops an der Knipserl Fotobox auf der Hochzeit"
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
            Ab {BASE_PRICE}&euro; — alles drin für Deine Hochzeit
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

      {/* IMPRESSIONS — rendert nur, wenn unter /pages/fotobox-fuer-hochzeit Bilder gepflegt sind */}
      <ImpressionSection
        pageSlug="fotobox-fuer-hochzeit"
        title="Hochzeits-Impressionen"
        subtitle="Unsere Fotobox bei vergangenen Hochzeiten"
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

      {/* CROSS-LINKS zu anderen Anlässen */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[32px] leading-[1.05] text-[#1a171b] mb-8">
            Fotobox für weitere Anlässe
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/fotobox-fuer-firmenfeier", label: "Firmenfeier" },
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
