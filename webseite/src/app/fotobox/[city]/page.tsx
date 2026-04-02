import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import InquiryForm from "@/components/forms/InquiryForm";
import PageHeader from "@/components/layout/PageHeader";
import { SEO_CITIES, BASE_PRICE } from "@/lib/constants";
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
    title: `Fotobox mieten ${city.name} | Ab ${BASE_PRICE}€ inkl. Drucker`,
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

  const otherCities = SEO_CITIES.filter((c) => c.slug !== city.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title={`Fotobox mieten in ${city.name}`} />

      {/* Content */}
      <section className="py-16 md:py-20">
        <div className="max-w-[800px] mx-auto px-4">
          <h2 className="text-[28px] md:text-[40px] leading-[1] text-[#1a171b] mb-6">
            Deine Fotobox für {city.name} und Umgebung
          </h2>
          <div className="text-[#666] text-[16px] space-y-4 leading-relaxed" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            <p>
              Du planst eine Hochzeit, Firmenfeier oder Geburtstagsparty in {city.name}?
              Die Knipserl Fotobox ist die perfekte Ergänzung für Dein Event!
              Wir liefern unsere professionelle Fotobox mit Sofortdruck direkt zu Deiner
              Location in {city.name} und kümmern uns um den kompletten Auf- und Abbau.
            </p>
            <p>
              Unsere Fotobox ist ausgestattet mit einer professionellen Spiegelreflexkamera
              (16 Megapixel), einem Profi-Thermosublimationsdrucker und einem riesigen 22-Zoll
              Touchscreen. Deine Gäste können sofort loslegen – die Bedienung ist kinderleicht.
            </p>
            <p>
              Im Basispaket ab {BASE_PRICE}&euro; ist alles enthalten: Druckflatrate für bis
              zu 400 Fotos, Online-Galerie, individuelles Drucklayout und natürlich unser
              24/7 Telefonsupport.
            </p>
          </div>

          <h3 className="text-[22px] md:text-[28px] leading-[1] text-[#1a171b] mt-10 mb-4">
            Wir liefern auch nach
          </h3>
          <div className="flex flex-wrap gap-2">
            {city.nearbyAreas.map((area) => (
              <span
                key={area}
                className="px-4 py-2 bg-gray-100 text-[#666] text-sm"
                style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}
              >
                {area}
              </span>
            ))}
          </div>

          <h3 className="text-[22px] md:text-[28px] leading-[1] text-[#1a171b] mt-10 mb-4">
            Das ist im Basispaket enthalten
          </h3>
          <ul className="space-y-3" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            {[
              `Kostenlose Lieferung nach ${city.name} (je nach Entfernung)`,
              "Kompletter Auf- und Abbau",
              "Druckflatrate (400 Bilder in 10x15cm)",
              "Profi-Thermosublimationsdrucker",
              "Hochwertige Spiegelreflexkamera (16 MP)",
              "22 Zoll Full-HD Touchscreen",
              "Individuelles Drucklayout",
              "Online-Galerie mit Passwortschutz",
              "24/7 Telefonsupport",
            ].map((feature) => (
              <li key={feature} className="flex items-start gap-3 text-[#666] text-[16px]">
                <svg className="w-5 h-5 text-[#F3A300] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <Link href="/preise" className="btn-brand">Ab {BASE_PRICE}&euro; konfigurieren</Link>
            <Link href="/termin-reservieren" className="btn-outline-dark">Verfügbarkeit prüfen</Link>
          </div>
        </div>
      </section>

      {/* Form */}
      <section
        className="relative z-10 py-16 rough-top text-center"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-2xl md:text-[40px] leading-[1] text-white mb-3">
            Fotobox in {city.name} anfragen
          </h2>
          <p className="text-white/80 text-[18px] mb-8" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
            Unverbindlich und kostenlos
          </p>
          <div className="bg-white rounded-md p-6 md:p-8">
            <InquiryForm />
          </div>
        </div>
      </section>

      {/* Other cities */}
      <section className="py-12">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-[24px] md:text-[32px] leading-[1] text-[#1a171b] mb-6">
            Fotobox auch in anderen Regionen
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {otherCities.map((c) => (
              <Link
                key={c.slug}
                href={`/fotobox/${c.slug}`}
                className="px-5 py-2.5 bg-gray-100 text-[#1a171b] hover:bg-[#F3A300] hover:text-[#1a171b] transition-colors text-[14px]"
                style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif", textTransform: "uppercase", fontWeight: 700 }}
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
