import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import ImpressionSection from "@/components/ImpressionSection";
import SlotImage from "@/components/SlotImage";
import PageHeader from "@/components/layout/PageHeader";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import { fetchPageData } from "@/lib/pages";

export const metadata: Metadata = generatePageMetadata({
  title: "XXL LOVE Leuchtbuchstaben mieten — Hochzeit, Antrag, Jubiläum",
  description:
    "Miete unsere XXL LOVE Leuchtbuchstaben für dein Event ♥ Hochzeit ♥ Antrag ♥ Trauung ♥ Junggesellenabschied ➔ 120 cm hoch, LED-beleuchtet, spritzwassergeschützt.",
  path: "/love-buchstaben",
  appendSiteName: false,
});

// Force dynamic: fetch aus Admin bei jedem Request, keine statische Vorberechnung
export const dynamic = "force-dynamic";

export default async function LoveBuchstabenPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "XXL LOVE Leuchtbuchstaben", url: "/love-buchstaben" },
  ]);
  const pageData = await fetchPageData("love-buchstaben");
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
                Mehr Liebe für die Region
              </p>
              <h1 className="text-[32px] md:text-[44px] lg:text-[52px] leading-[1.05] text-[#1a171b] mb-6">
                XXL LOVE Leuchtbuchstaben
              </h1>
              <div className="text-[#666] text-[16px] md:text-[17px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <p>
                  Wir von Knipserl wenden uns an die Romantiker, die Liebenden. Die LOVE-Buchstaben bieten wir zusätzlich zur Fotobox oder einzeln in der Region Ebersberg, Bruckmühl, München und Rosenheim an.
                </p>
                <p>
                  Perfekt als Deko zur <Link href="/fotobox-fuer-hochzeit" className="text-[#F3A300] hover:underline">Hochzeit</Link>, zum Hochzeitsjubiläum (silberne oder goldene Hochzeit), zur Verlobung, für einen Heiratsantrag oder einen außergewöhnlichen Valentinstag.
                </p>
              </div>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="#anfragen" className="btn-brand whitespace-nowrap">
                  Jetzt reservieren
                </Link>
                <Link href="/preise" className="btn-outline-dark whitespace-nowrap">
                  Im Konfigurator dazubuchen
                </Link>
              </div>
            </div>
            <div className="relative aspect-[3/4] w-full max-w-[450px] mx-auto shadow-2xl">
              <SlotImage
                slot={slots.hero}
                fallbackSrc="/images/addons/love-buchstaben.jpg"
                alt="XXL LOVE Leuchtbuchstaben — 120cm hoch, beleuchtet"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* DARK SECTION — Technische Details */}
      <section
        className="relative z-10 py-16 md:py-20 rough-top rough-bottom text-white"
        style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-[28px] md:text-[44px] leading-[1] inline-block">
              So groß ist diese Liebe
            </h2>
          </div>
          <div className="max-w-[820px] mx-auto text-white/85 text-[16px] md:text-[17px] space-y-4 leading-relaxed text-center mb-10" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            <p>
              Unsere LOVE-Buchstaben sind 120 Zentimeter hoch und für eine 320 Zentimeter breite Aufstellfläche gedacht. Sie sind spritzwassergeschützt — können also auch draußen aufgestellt werden.
            </p>
            <p>
              Die LOVE-Buchstaben sind beleuchtet. Feiert Ihr in den wärmeren Monaten in einem Haus mit Garten, könnten sie zur Festdeko auf der Freifläche werden und nach Sonnenuntergang einen besonders reizvollen Akzent setzen.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 max-w-[700px] mx-auto gap-x-8 gap-y-3">
            {[
              "120 cm hoch",
              "320 cm Aufstellfläche",
              "LED-beleuchtet",
              "Spritzwassergeschützt (Outdoor-tauglich)",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 text-white/90 text-[15px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2-SPALTER — Deko-Ideen + Fotobox-Kombi */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
            <div className="flex flex-col">
              <div className="text-center md:text-left">
                <h2 className="text-[28px] md:text-[36px] leading-[1.05] text-[#1a171b] mb-6">
                  1000 tolle Ideen für Deine Feier
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Es gibt tausend gute Ideen, wie man die LOVE-Buchstaben auf einer Hochzeit, bei einem Heiratsantrag oder einem Ehejubiläum in Szene setzt. Du könntest sie mit Blumen schmücken, in einem Festsaal mit roten Rosen in Vasen umgruppieren.
                  </p>
                  <p>
                    Alternative: ein Rosenbeet im Garten oder romantische Rosenranken, um die Buchstaben zu platzieren. Sehr reizvoll — die Dekoration hinter dem Hochzeitspaar am Festtisch aufzustellen. Dann hätten viele Fotos des Paares einen ausgesprochen schönen Hintergrund.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/misc/block-bg-wedding.jpg"
                    alt="LOVE-Buchstaben als Hochzeits-Deko"
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
                  LOVE & Fotobox: ein tolles Gespann
                </h2>
                <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  <p>
                    Die LOVE-Buchstaben eignen sich auch als Deko für Fotos, die Hochzeitsgäste mit der <Link href="/fotobox-fuer-hochzeit" className="text-[#F3A300] hover:underline">Knipserl Fotobox</Link> erstellen. Lass die Gäste mit den Buchstaben spielen und ihre eigene Definition von Liebe finden.
                  </p>
                  <p>
                    Zusätzlich kannst Du Requisiten zum Verkleiden buchen — Hüte, Brillen, Schnurrbärte. Liebe ist individuell. Und immer schön. Vor allem mit den LOVE-Buchstaben für Deine Hochzeitsfeier.
                  </p>
                </div>
              </div>
              <div className="mt-8 md:mt-auto md:pt-10">
                <div className="relative aspect-[4/3] shadow-xl">
                  <Image
                    src="/images/gallery/fotobox-mieten-5.jpg"
                    alt="LOVE-Buchstaben kombiniert mit der Knipserl Fotobox"
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

      {/* IMPRESSIONS — wird im Admin unter /pages/love-buchstaben gepflegt */}
      <ImpressionSection
        pageSlug="love-buchstaben"
        title="LOVE-Buchstaben Impressionen"
        subtitle="Unsere XXL-Buchstaben im Einsatz"
      />

      {/* INQUIRY FORM */}
      <section id="anfragen" className="py-20 relative z-10 scroll-mt-20">
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Unverbindlich Anfragen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Prüfe jetzt ob die LOVE-Buchstaben an Deinem Termin verfügbar sind
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>

      {/* CROSS-LINKS */}
      <section className="py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[32px] leading-[1.05] text-[#1a171b] mb-8">
            Weitere Anlässe
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { href: "/fotobox-fuer-hochzeit", label: "Hochzeit" },
              { href: "/fotobox-fuer-firmenfeier", label: "Firmenfeier" },
              { href: "/fotobox-fuer-messe", label: "Messe" },
              { href: "/fotobox-fuer-weihnachtsfeier", label: "Weihnachtsfeier" },
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
