import type { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata, generateBreadcrumbSchema } from "@/lib/seo";
import InquiryForm from "@/components/forms/InquiryForm";
import ImageLightbox from "@/components/ImageLightbox";
import PageHeader from "@/components/layout/PageHeader";
import { fetchImpressions } from "@/lib/impressions";

export const metadata: Metadata = generatePageMetadata({
  title: "Impressionen | Die Knipserl Fotobox im Einsatz",
  description:
    "Bilder und Eindrücke unserer Knipserl Fotobox bei Hochzeiten, Firmenfeiern und Partys in Rosenheim, München und Oberbayern.",
  path: "/impressionen",
});

// ISR: Admin-Uploads erscheinen nach max. 60 s
export const revalidate = 60;

export default async function ImpressionenPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Startseite", url: "/" },
    { name: "Impressionen", url: "/impressionen" },
  ]);

  const photos = await fetchImpressions();
  const images = photos.map((p) => ({ src: p.src, alt: p.alt, avif: p.avif, webp: p.webp }));

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <PageHeader title="Die Fotobox" />

      {/* Gallery */}
      {images.length > 0 && (
        <section className="pt-12 md:pt-[50px] pb-10 md:pb-[70px]">
          <div className="max-w-[1200px] mx-auto px-4">
            <ImageLightbox
              images={images}
              gridClassName="grid grid-cols-2 md:grid-cols-3 gap-[15px]"
              thumbSizes="(max-width: 768px) 50vw, 33vw"
            />
          </div>
        </section>
      )}

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
