import type { Metadata } from "next";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Audio-Gästebuch / Gästetelefon mieten",
  description:
    "Miete unser urige Gästetelefon als Audio-Gästebuch für Deine Hochzeit oder Party. Persönliche Sprachnachrichten als unvergessliche Erinnerung.",
  path: "/audio-gaestebuch",
});

const benefits = [
  {
    title: "Persönliche Note",
    description:
      "Individuelle und emotionale Nachrichten von Deinen Gästen – viel persönlicher als ein geschriebener Text.",
  },
  {
    title: "Einfache Handhabung",
    description:
      "Hörer abnehmen, Nachricht sprechen, auflegen – so einfach, dass es wirklich jeder Gast nutzen kann.",
  },
  {
    title: "Einzigartige Erinnerung",
    description:
      "Eine moderne Alternative oder Ergänzung zum klassischen Gästebuch, die Ihr immer wieder anhören könnt.",
  },
];

export default function AudioGaestebuchPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Gästetelefon", url: "/audio-gaestebuch" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Gästetelefon" />

      {/* What is it */}
      <section className="py-16 md:py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[40px] leading-[1] text-[#1a171b] mb-6">
            Was ist ein Gästetelefon?
          </h2>
          <p className="text-[#666] text-[18px] leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Ein Gästetelefon ist ein spezielles Telefon, das auf Eurer Feier aufgestellt wird.
            Eure Gäste können darüber persönliche Nachrichten, Geschichten und Wünsche als
            Audio-Aufnahmen hinterlassen. Die Aufnahmen werden gespeichert und Euch nach dem
            Event als fertig bearbeitete Audio-Dateien zugesandt.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section
        className="relative z-10 py-16 rough-top rough-bottom text-white"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[40px] leading-[1] text-center mb-10">
            Vorteile eines Gästetelefons
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="bg-white/10 backdrop-blur-sm border border-white/20 p-6">
                <h3 className="text-[22px] leading-[1.2] text-[#F3A300] mb-3">{benefit.title}</h3>
                <p className="text-white/80 text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[40px] leading-[1] text-[#1a171b] mb-8 text-center">
            Wie funktioniert die Miete?
          </h2>
          <div className="space-y-6">
            {[
              { step: "1", title: "Anfragen", text: "Prüfe Deinen Wunschtermin und sende uns eine unverbindliche Anfrage." },
              { step: "2", title: "Aufbau", text: "Wir stellen das Gästetelefon bei Eurer Feier auf – ganz unkompliziert." },
              { step: "3", title: "Erinnerungen erhalten", text: "Nach dem Event bekommst Du alle Aufnahmen als fertig bearbeitete Audio-Dateien." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 items-start">
                <div className="w-12 h-12 bg-[#F3A300] text-[#1a171b] rounded-full flex items-center justify-center font-bold text-[20px] flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-[20px] leading-[1.2] text-[#1a171b] mb-1">{item.title}</h3>
                  <p className="text-[#666] text-[16px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fazit + Form */}
      <section
        className="relative z-10 py-16 rough-top text-center"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-2xl md:text-[40px] leading-[1] text-white mb-4">
            Gästetelefon anfragen
          </h2>
          <p className="text-white/80 text-[18px] mb-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Perfekt als Ergänzung zur Fotobox
          </p>
          <div className="bg-white rounded-md p-6 md:p-8">
            <InquiryForm preset="gaestetelefon" />
          </div>
        </div>
      </section>
    </>
  );
}
