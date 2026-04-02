import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import InquiryForm from "@/components/forms/InquiryForm";
import PageHeader from "@/components/layout/PageHeader";

export const metadata: Metadata = generatePageMetadata({
  title: "Impressionen | Die Knipserl Fotobox im Einsatz",
  description:
    "Bilder und Eindrücke unserer Knipserl Fotobox bei Hochzeiten, Firmenfeiern und Partys in Rosenheim, München und Oberbayern.",
  path: "/impressionen",
});

const images = [
  { src: "/images/gallery/fotobox-mieten-5.jpg", alt: "Fotobox im Einsatz bei einer Hochzeit" },
  { src: "/images/gallery/fotobox-mieten-7.jpg", alt: "Gäste mit Requisiten an der Fotobox" },
  { src: "/images/gallery/fotobox-mieten-3.jpg", alt: "Individuelle Fotobox-Ausdrucke" },
  { src: "/images/gallery/fotobox-rosenheim-bild2.jpg", alt: "Knipserl Fotobox auf Firmenfeier in Rosenheim" },
  { src: "/images/gallery/fotobox-mieten-2.jpg", alt: "Professionelle Fotobox mit Sofortdruck" },
  { src: "/images/gallery/fotobox-mieten-5-scaled.jpg", alt: "Fotobox mieten für Events in München" },
];

export default function ImpressionenPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Impressionen", url: "/impressionen" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Die Fotobox" />

      {/* Gallery */}
      <section className="py-16 md:py-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((img) => (
              <div
                key={img.src}
                className="relative aspect-[4/3] overflow-hidden group"
              >
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + Form */}
      <section
        className="relative z-10 py-16 rough-top text-center"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[700px] mx-auto px-4">
          <h2 className="text-2xl md:text-[40px] leading-[1] text-white mb-3">
            Jetzt unverbindlich Anfragen
          </h2>
          <p className="text-white/80 text-[18px] mb-8">
            Sichere Dir jetzt die Knipserl Fotobox für Dein Event
          </p>
          <div className="bg-white rounded-md p-6 md:p-8">
            <InquiryForm />
          </div>
        </div>
      </section>
    </>
  );
}
