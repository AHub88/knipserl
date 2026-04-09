import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, generateFAQSchema, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Häufige Fragen (FAQ) zur Fotobox",
  description:
    "Antworten auf die häufigsten Fragen rund um die Knipserl Fotobox: Lieferung, Aufbau, Druckqualität, Kosten und mehr.",
  path: "/haeufige-fragen",
});

const faqSections = [
  {
    title: "Ablauf",
    items: [
      {
        question: "Wie funktioniert die Lieferung und der Aufbau?",
        answer:
          "Wir kümmern uns um alles! Wir liefern die Fotobox zu Deiner Location, bauen sie auf und am nächsten Tag wieder ab. Du musst Dich um nichts kümmern.",
      },
      {
        question: "Wie weit liefert ihr?",
        answer:
          "Wir liefern im Umkreis von bis zu 120 km ab Rosenheim. Die ersten 15 km sind kostenlos, darüber hinaus berechnen wir gestaffelte Fahrtkosten. Du kannst die genauen Kosten in unserem Preiskonfigurator berechnen.",
      },
      {
        question: "Muss ich eine Kaution hinterlegen?",
        answer:
          "Nein, bei uns gibt es keine Kaution und keine versteckten Kosten. Du zahlst genau den Preis, der im Konfigurator angezeigt wird.",
      },
      {
        question: "Wie ist die Fotobox versichert?",
        answer:
          "Die Fotobox ist über die Haftpflichtversicherung des Kunden versichert. Bitte prüfe vorab kurz bei Deiner Versicherung, ob Mietgegenstände abgedeckt sind.",
      },
      {
        question: "Muss die Fotobox beaufsichtigt werden?",
        answer:
          "Nein, die Fotobox ist komplett selbsterklärend und läuft über den großen Touchscreen. Sollte es doch einmal ein Problem geben, kannst Du uns jederzeit über unseren 24/7 Telefonsupport erreichen. Ein einfacher Neustart behebt fast alle Probleme, ohne dass Fotos verloren gehen.",
      },
    ],
  },
  {
    title: "Ausdrucke & Fotos",
    items: [
      {
        question: "Welche Druckformate gibt es?",
        answer:
          "Du kannst zwischen Vollbild (15x10 cm) und Streifen (15x5 cm, zwei Streifen pro Ausdruck) wählen. Das Layout wird individuell nach Deinen Wünschen gestaltet.",
      },
      {
        question: "Wie ist die Druckqualität?",
        answer:
          "Wir verwenden einen professionellen Thermosublimationsdrucker in Studioqualität. Die Fotos werden in 3 Farbschichten plus einer Schutzschicht gedruckt und können sofort angefasst und in die Tasche gesteckt werden.",
      },
      {
        question: "Welche Kamera wird verwendet?",
        answer:
          "Wir nutzen professionelle Spiegelreflexkameras mit 16 Megapixel. Die Bilder werden in voller Auflösung (4928x3264 Pixel) am nächsten Tag als Download bereitgestellt. Optional auch auf einem urigen Holz-USB-Stick.",
      },
      {
        question: "Wie viele Fotos können gedruckt werden?",
        answer:
          "Das Mediakit reicht für 400 Fotos im Vollbildformat (10x15cm) oder 800 Fotos im Streifenformat (5x15cm). Das entspricht ca. 13 Stunden Dauerbetrieb bei durchschnittlich 2 Minuten pro Foto-Zyklus.",
      },
      {
        question: "Wie schnell druckt die Fotobox?",
        answer:
          "Ein Foto wird in nur 8 Sekunden gedruckt. Deine Gäste müssen also nicht lange warten!",
      },
    ],
  },
];

export default function FAQPage() {
  const allFaqs = faqSections.flatMap((s) => s.items);
  const faqSchema = generateFAQSchema(allFaqs);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Häufige Fragen", url: "/haeufige-fragen" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Häufige Fragen" />

      {/* FAQ Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1100px] mx-auto px-4 space-y-12">
          {faqSections.map((section) => (
            <div key={section.title}>
              <h2 className="text-[28px] md:text-[36px] leading-[1] text-[#1a171b] mb-6 font-[family-name:var(--font-fira-condensed)]">
                {section.title}
              </h2>
              <div className="space-y-4">
                {section.items.map((faq) => (
                  <details
                    key={faq.question}
                    className="group overflow-hidden rounded-sm"
                  >
                    <summary
                      className="flex items-center justify-between px-6 py-5 cursor-pointer text-white font-bold text-[16px] md:text-[18px] uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide"
                      style={{
                        background: "#444 url('/images/misc/main_back_gr-2.webp') repeat",
                        backgroundSize: "1000px 500px",
                      }}
                    >
                      {faq.question}
                      <span className="text-white text-[24px] font-normal flex-shrink-0 ml-4 group-open:hidden">+</span>
                      <span className="text-white text-[24px] font-normal flex-shrink-0 ml-4 hidden group-open:inline">−</span>
                    </summary>
                    <div
                      className="px-6 py-5 text-white text-[16px] leading-relaxed"
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
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="relative z-10 py-16 rough-top text-white text-center"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-2xl md:text-[40px] leading-[1] mb-4">
            Noch Fragen? Wir helfen gerne!
          </h2>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/termin-reservieren" className="btn-brand">Jetzt anfragen</Link>
            <a
              href="https://wa.me/4915792495836"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline"
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
