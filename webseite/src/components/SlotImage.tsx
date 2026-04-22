import Image from "next/image";
import type { PageSlotImage } from "@/lib/pages";

/**
 * Rendert ein austauschbares Bild: Wenn im Admin-Mini-CMS unter dem passenden
 * Seiten-Slot ein Bild gepflegt ist (`slot`), wird es mit AVIF/WebP-Srcset
 * ausgeliefert. Sonst greift der statische Fallback aus dem Code.
 *
 * Einsatz (Beispiel — gleiche Signatur wie ein normales <Image>):
 *   <SlotImage
 *     slot={pageData?.slots.hero}
 *     fallbackSrc="/images/landing/fotobox-mieten.jpg"
 *     alt={`Fotobox mieten in ${city.name}`}
 *     fill priority sizes="(max-width:768px) 100vw, 450px"
 *   />
 */
export default function SlotImage({
  slot,
  fallbackSrc,
  alt,
  fill,
  width,
  height,
  priority,
  sizes,
  className,
}: {
  slot: PageSlotImage | null | undefined;
  fallbackSrc: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  className?: string;
}) {
  if (slot) {
    const effectiveAlt = slot.alt || alt;
    // Wenn das Eltern-Element fill erwartet, absolute-positionieren wir das <img>
    const imgClass = fill
      ? `absolute inset-0 w-full h-full ${className ?? "object-cover"}`
      : className;

    return (
      <picture>
        {slot.avif && <source type="image/avif" srcSet={slot.avif} sizes={sizes} />}
        {slot.webp && <source type="image/webp" srcSet={slot.webp} sizes={sizes} />}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={slot.src}
          alt={effectiveAlt}
          width={fill ? undefined : width ?? slot.width}
          height={fill ? undefined : height ?? slot.height}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className={imgClass}
        />
      </picture>
    );
  }

  if (fill) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        fill
        priority={priority}
        className={className ?? "object-cover"}
        sizes={sizes}
      />
    );
  }

  return (
    <Image
      src={fallbackSrc}
      alt={alt}
      width={width ?? 800}
      height={height ?? 1200}
      priority={priority}
      className={className}
      sizes={sizes}
    />
  );
}
