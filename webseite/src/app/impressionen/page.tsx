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
  { src: "/images/gallery/fotobox-2025-neu.jpg", alt: "Knipserl Fotobox im Einsatz 2025" },
  { src: "/images/gallery/fotobox-mieten-5.jpg", alt: "Fotobox im Einsatz bei einer Hochzeit" },
  { src: "/images/gallery/fotobox-mieten-7.jpg", alt: "Gäste mit Requisiten an der Fotobox" },
  { src: "/images/gallery/fotobox-mieten-3.jpg", alt: "Individuelle Fotobox-Ausdrucke" },
  { src: "/images/gallery/fotobox-rosenheim-bild2.jpg", alt: "Knipserl Fotobox auf Firmenfeier in Rosenheim" },
  { src: "/images/gallery/touchscreen.gif", alt: "Touchscreen-Bedienung der Knipserl Fotobox" },
  { src: "/images/gallery/fotobox-mieten-2.jpg", alt: "Professionelle Fotobox mit Sofortdruck" },
  { src: "/images/gallery/fotobox-mieten-1-scaled.jpg", alt: "Fotobox mieten für Events in München" },
  { src: "/images/gallery/fotobox-mieten-1.gif", alt: "Animation der Knipserl Fotobox" },
  { src: "/images/gallery/fotobox-mieten-5-scaled.jpg", alt: "Fotobox mieten für Hochzeiten in Oberbayern" },
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
      <section className="pt-12 md:pt-[50px] pb-10 md:pb-[70px]">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-[15px]">
            {images.map((img, i) => {
              const isGif = img.src.endsWith(".gif");
              return (
                <div
                  key={img.src}
                  className="relative aspect-[4/3] overflow-hidden group"
                >
                  {isGif ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={img.src}
                      alt={img.alt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading={i < 3 ? "eager" : "lazy"}
                    />
                  ) : (
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      priority={i === 0}
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Video */}
      <section className="pb-12 md:pb-[70px]">
        <div className="max-w-[900px] mx-auto px-4">
          <div className="relative w-full aspect-video overflow-hidden rounded-md shadow-lg bg-black">
            <iframe
              src="https://www.youtube-nocookie.com/embed/wlHPKPAO_Bw?rel=0"
              title="Knipserl Fotobox im Einsatz"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
        </div>
      </section>

      {/* CTA Section: Unvergessliche Momente */}
      <section
        className="relative rough-top rough-bottom py-14 md:py-20"
        style={{ background: "#666 url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
      >
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
            <div className="flex-1">
              <h2 className="text-white font-bold leading-tight text-[32px] md:text-[50px] md:leading-[1.05]">
                Unvergessliche Momente mit unserer{" "}
                <span className="whitespace-nowrap">Knipserl Fotobox</span>
              </h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:flex-shrink-0">
              <Link href="/preise" className="btn-brand text-center">
                Die Preise
              </Link>
              <Link href="#buchen" className="btn-outline text-center">
                Termin frei?
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form */}
      <section id="buchen" className="py-20 relative z-10" style={{ marginTop: "80px" }}>
        <div className="max-w-[1150px] mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
              Jetzt unverbindlich Anfragen
            </h2>
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              Prüfe jetzt ob eine Fotobox an Deinem Event verfügbar ist
            </p>
          </div>
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
