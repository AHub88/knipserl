// Webseite-seitige Fetcher für das Mini-CMS (Pages + Image-Slots + Impressionen).
// Holt Daten aus dem Admin-API, mappt relative URLs auf den öffentlichen Admin-Host.
// Fällt still auf `null` zurück, wenn der Admin nicht erreichbar ist — die Webseite
// nutzt dann ihre Code-Fallbacks.

type ApiUrls = {
  original: string;
  avif: string | null;
  webp: string | null;
};

type ApiAsset = {
  id: string;
  alt: string;
  width: number;
  height: number;
  originalFilename: string;
  urls: ApiUrls;
};

type ApiSlot = {
  key: string;
  label: string;
  description: string | null;
  aspectRatio: string | null;
  altOverride: string;
  asset: ApiAsset | null;
};

type ApiPageDetail = {
  slug: string;
  title: string;
  category: string;
  hasImpressionSection: boolean;
  slots: ApiSlot[];
  impressionPhotos: ApiAsset[];
};

export type PageSlotImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  avif: string | null;
  webp: string | null;
};

export type PageImpressionImage = PageSlotImage;

export type PageData = {
  slug: string;
  slots: Record<string, PageSlotImage | null>;
  impressionPhotos: PageImpressionImage[];
};

function prefix(url: string, base: string): string {
  return url.startsWith("http") ? url : `${base}${url}`;
}

function prefixSrcset(srcset: string | null, base: string): string | null {
  if (!srcset) return null;
  return srcset
    .split(",")
    .map((part) => {
      const [url, size] = part.trim().split(/\s+/);
      return `${prefix(url, base)}${size ? ` ${size}` : ""}`;
    })
    .join(", ");
}

function toImage(asset: ApiAsset, altOverride: string, base: string): PageSlotImage {
  return {
    src: prefix(asset.urls.original, base),
    alt: (altOverride || asset.alt || "").trim(),
    width: asset.width,
    height: asset.height,
    avif: prefixSrcset(asset.urls.avif, base),
    webp: prefixSrcset(asset.urls.webp, base),
  };
}

export async function fetchPageData(slug: string): Promise<PageData | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];
  if (fetchUrls.length === 0) return null;

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/pages/${slug}`, {
        next: { revalidate: 60 },
      });
      if (res.status === 404) return null;
      if (!res.ok) continue;
      const data = (await res.json()) as ApiPageDetail;
      const publicBase = adminPublic || baseUrl;

      const slots: Record<string, PageSlotImage | null> = {};
      for (const slot of data.slots) {
        slots[slot.key] = slot.asset ? toImage(slot.asset, slot.altOverride, publicBase) : null;
      }

      const impressionPhotos = data.impressionPhotos.map((a) => toImage(a, "", publicBase));
      return { slug: data.slug, slots, impressionPhotos };
    } catch {
      continue;
    }
  }
  return null;
}
