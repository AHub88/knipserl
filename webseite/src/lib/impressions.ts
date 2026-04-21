type ApiPhoto = {
  id: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
  active: boolean;
  originalFilename: string;
  urls: {
    original: string;
    avif: string | null;
    webp: string | null;
  };
};

export type ImpressionPhoto = {
  id: string;
  alt: string;
  width: number;
  height: number;
  src: string;
  avif: string | null;
  webp: string | null;
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

export async function fetchImpressions(): Promise<ImpressionPhoto[]> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];
  if (fetchUrls.length === 0) return [];

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/impressions?active=true`, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as { photos: ApiPhoto[] };
      const publicBase = adminPublic || baseUrl;
      return data.photos.map((p) => ({
        id: p.id,
        alt: p.alt || "Knipserl Fotobox",
        width: p.width,
        height: p.height,
        src: prefix(p.urls.original, publicBase),
        avif: prefixSrcset(p.urls.avif, publicBase),
        webp: prefixSrcset(p.urls.webp, publicBase),
      }));
    } catch {
      continue;
    }
  }
  return [];
}
