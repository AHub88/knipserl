import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import PriceConfigurator from "@/components/forms/PriceConfigurator";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Preise & Konfigurator | Fotobox ab 379€",
  description:
    "Fotobox mieten ab 379€ inkl. Drucker, Auf- & Abbau und Druckflatrate. Stelle Dein Paket im Preiskonfigurator zusammen. Fahrtkosten automatisch berechnet.",
  path: "/preise",
});

const includedFeatures = [
  {
    title: "Kostenlose Lieferung",
    description:
      "Wir liefern Dir unsere Fotobox im Umkreis von 15km (ab Rosenheim) kostenlos zu Deiner Location. Für alle weiteren Entfernungen gelten unsere Anfahrtskosten.",
    image: "/images/features/lieferung.png",
  },
  {
    title: "Eigenes Fotolayout",
    description:
      "Du kannst das Layout für die Fotoausdrucke frei bestimmen. Unser Grafiker orientiert sich hierbei an Deinen Wünschen.",
    image: "/images/features/fotolayout.png",
  },
  {
    title: "Auf und Abbau",
    description:
      "Wir kümmern uns um den kompletten Aufbau, damit Deine Gäste direkt loslegen können und Du Zeit für die wichtigen Dinge hast.",
    image: "/images/features/aufbau.png",
  },
  {
    title: "Druckflatrate",
    description:
      'Unsere Fotobox wird dir mit einem "Mediakit" für 400 Bilder (10x15cm) bzw. 800 Bilder (5x15cm) geliefert. Reicht für ca. 13 Stunden Dauerbetrieb.',
    image: "/images/features/druckflatrate.png",
  },
  {
    title: "Online Galerie",
    description:
      "Du bekommst von uns eine Online Galerie mit gesichertem Zugang. Deine Gäste können alle Bilder ansehen und herunterladen.",
    image: "/images/features/online-galerie.png",
  },
  {
    title: "24/7 Support",
    description:
      "Sollte es doch einmal ein Problem geben, steht Dir unser Telefon-Support jederzeit zur Verfügung.",
    image: "/images/features/support.png",
  },
];

export default function PreisePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Preise", url: "/preise" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Preise" />

      {/* Included features */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-[#F3A300] font-bold text-[22px] mb-2">Unser Preis: 379&euro;</p>
            <h2 className="text-[28px] md:text-[40px] leading-[1] text-[#1a171b]">
              Fotobox mit Drucker
            </h2>
            <p className="text-[#666] mt-3 text-[18px]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              Alles inklusive zum Festpreis
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {includedFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-white overflow-hidden border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={feature.image}
                    alt={`${feature.title} - Knipserl Fotobox Feature`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-[20px] leading-[1.2] text-[#1a171b] mb-2">{feature.title}</h3>
                  <p className="text-[15px] text-[#666]" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Configurator */}
      <section
        className="relative z-10 py-16 rough-top rough-bottom"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[900px] mx-auto px-4">
          <PriceConfigurator />
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 text-center">
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[40px] leading-[1] text-[#1a171b] mb-4">
            Du möchtest lieber direkt anfragen?
          </h2>
          <p className="text-[#666] text-[18px] mb-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Kein Problem! Nutze unser einfaches Anfrageformular oder kontaktiere uns per WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/termin-reservieren" className="btn-brand">Jetzt reservieren</Link>
            <a
              href="https://wa.me/4915792495836"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline-dark"
            >
              WhatsApp Anfrage
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
