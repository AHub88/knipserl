import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "XXL LOVE Leuchtbuchstaben mieten",
  description:
    "XXL LOVE Leuchtbuchstaben mieten für Hochzeit, Verlobung und Events. 120cm hoch, beleuchtet und wasserdicht. In Rosenheim, München und Oberbayern.",
  path: "/love-buchstaben",
});

export default function LoveBuchstabenPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "LOVE Buchstaben", url: "/love-buchstaben" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="LOVE Buchstaben" />

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[40px] leading-[1] text-[#1a171b] mb-6">
            Für alle Romantiker unter Euch
          </h2>
          <p className="text-[#666] text-[18px] leading-relaxed mb-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Unsere XXL LOVE Leuchtbuchstaben sind der perfekte Hingucker für Eure Hochzeit,
            Euren Hochzeitstag, Eure Verlobung oder den Valentinstag. Erhältlich in den
            Regionen Ebersberg, Bruckmühl, München und Rosenheim.
          </p>

          <h3 className="text-[22px] md:text-[28px] leading-[1] text-[#1a171b] mb-4">Technische Details</h3>
          <ul className="space-y-3 text-[#666] text-[16px] mb-10" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            {["120 cm hoch", "320 cm Standfläche", "LED-beleuchtet", "Spritzwassergeschützt (auch für Outdoor geeignet)"].map((item) => (
              <li key={item} className="flex items-center gap-3">
                <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {item}
              </li>
            ))}
          </ul>

          <h3 className="text-[22px] md:text-[28px] leading-[1] text-[#1a171b] mb-4">Ideen für den Einsatz</h3>
          <ul className="space-y-2 text-[#666] text-[16px] mb-8 list-disc list-inside" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            <li>Mit Blumen und Rosen dekorieren</li>
            <li>Hinter dem Brauttisch als Foto-Hintergrund platzieren</li>
            <li>Im Garten nach Sonnenuntergang für dramatische Effekte</li>
            <li>Zusammen mit der Fotobox für kreative Fotos</li>
          </ul>
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative z-10 py-16 rough-top text-white text-center"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-2xl md:text-[40px] leading-[1] mb-4">
            Perfekte Kombination mit der Fotobox
          </h2>
          <p className="text-white/80 text-[18px] mb-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Die LOVE Buchstaben lassen sich hervorragend mit der Knipserl Fotobox kombinieren.
            Eure Gäste können sich vor den beleuchteten Buchstaben fotografieren lassen.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/preise" className="btn-brand">Im Konfigurator dazubuchen (+150&euro;)</Link>
            <Link href="/termin-reservieren" className="btn-outline">Direkt anfragen</Link>
          </div>
        </div>
      </section>
    </>
  );
}
