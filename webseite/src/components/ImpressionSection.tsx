import { fetchPageData } from "@/lib/pages";
import ImageLightbox from "@/components/ImageLightbox";

type Props = {
  pageSlug: string;
  title?: string;
  subtitle?: string;
  maxPhotos?: number;
  className?: string;
};

/**
 * Rendert die im Admin unter "Seiten > [slug]" kuratierte Impressionen-Sektion.
 * Wenn keine Bilder gepflegt sind, wird nichts gerendert — die Seite behält ihr Layout.
 */
export default async function ImpressionSection({
  pageSlug,
  title = "Impressionen",
  subtitle,
  maxPhotos,
  className = "",
}: Props) {
  const data = await fetchPageData(pageSlug);
  if (!data || data.impressionPhotos.length === 0) return null;

  const photos = typeof maxPhotos === "number"
    ? data.impressionPhotos.slice(0, maxPhotos)
    : data.impressionPhotos;

  const images = photos.map((p) => ({ src: p.src, alt: p.alt, avif: p.avif, webp: p.webp }));

  return (
    <section className={`py-16 md:py-20 ${className}`}>
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[#1a171b] inline-block">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
              {subtitle}
            </p>
          )}
        </div>
        <ImageLightbox
          images={images}
          gridClassName="grid grid-cols-2 md:grid-cols-3 gap-[15px]"
          thumbSizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
    </section>
  );
}
