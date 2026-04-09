import type { Metadata } from "next";
import Link from "next/link";
import PriceConfigurator from "@/components/forms/PriceConfigurator";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Preiskonfigurator | Fotobox ab 379€",
  description:
    "Fotobox mieten ab 379€ inkl. Drucker, Auf- & Abbau und Druckflatrate. Stelle Dein Paket im Preiskonfigurator zusammen. Fahrtkosten automatisch berechnet.",
  path: "/preise",
});

const includedFeatures = [
  {
    title: "Kostenlose Lieferung",
    description:
      "Wir liefern Dir unsere Fotobox im Umkreis von 15km (ab Rosenheim) kostenlos zu Deiner Location. Für alle weiteren Entfernungen gelten unsere Anfahrtskosten.",
    icon: "/images/features/lieferung.png",
  },
  {
    title: "Auf und Abbau",
    description:
      "Wir kümmern uns um den kompletten Aufbau, damit Deine Gäste direkt loslegen können und Du Zeit für die wichtigen Dinge hast.",
    icon: "/images/features/aufbau.png",
  },
  {
    title: "Online Galerie",
    description:
      "Du bekommst von uns eine Online Galerie mit gesichertem Zugang. Deine Gäste können alle Bilder ansehen und herunterladen.",
    icon: "/images/features/online-galerie.png",
  },
  {
    title: "Eigenes Fotolayout",
    description:
      "Du kannst das Layout für die Fotoausdrucke frei bestimmen. Unser Grafiker orientiert sich hierbei an Deinen Wünschen.",
    icon: "/images/features/fotolayout.png",
  },
  {
    title: "Druckflatrate",
    description:
      'Unsere Fotobox wird dir mit einem "Mediakit" für 400 Bilder (10x15cm) bzw. 800 Bilder (5x15cm) geliefert. Reicht für ca. 13 Stunden Dauerbetrieb.',
    icon: "/images/features/druckflatrate.png",
  },
  {
    title: "24/7 Support",
    description:
      "Sollte es doch einmal ein Problem geben, steht Dir unser Telefon-Support jederzeit zur Verfügung.",
    icon: "/images/features/support.png",
  },
];

export default function PreisePage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Preiskonfigurator", url: "/preise" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Preiskonfigurator" />

      {/* ===== INCLUDED FEATURES ===== */}
      <section className="py-10 md:py-14">
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Unser Preis: 379&euro;
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Fotobox mit Drucker
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
            {includedFeatures.map((feature) => (
              <div key={feature.title} className="flex gap-4 items-start">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={feature.icon}
                  alt=""
                  width={83}
                  height={70}
                  className="flex-shrink-0 mt-1"
                />
                <div>
                  <h3 className="text-[20px] font-extrabold uppercase tracking-wide mb-1 font-[family-name:var(--font-fira-condensed)]">
                    {feature.title}
                  </h3>
                  <p className="text-[14px] text-[#444] leading-snug font-[family-name:var(--font-fira-sans)]" style={{ fontWeight: 400, textTransform: "none" }}>
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONFIGURATOR ===== */}
      <section className="pb-16">
        <div className="max-w-[1100px] mx-auto px-6">
          <PriceConfigurator />
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-20 text-center">
        <div className="max-w-[700px] mx-auto px-6">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block mb-4">
            Du möchtest lieber direkt anfragen?
          </h2>
          <p className="text-[18px] text-[#666] mb-8 font-[family-name:var(--font-fira-sans)]" style={{ fontWeight: 400, textTransform: "none" }}>
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
