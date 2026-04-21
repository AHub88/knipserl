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

function toPhoto(p: ApiPhoto, publicBase: string): ImpressionPhoto {
  return {
    id: p.id,
    alt: p.alt || "Knipserl Fotobox",
    width: p.width,
    height: p.height,
    src: prefix(p.urls.original, publicBase),
    avif: prefixSrcset(p.urls.avif, publicBase),
    webp: prefixSrcset(p.urls.webp, publicBase),
  };
}

export async function fetchImpressions(): Promise<ImpressionPhoto[]> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];
  if (fetchUrls.length === 0) return [];

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/impressions?active=true`, { next: { revalidate: 60 } });
      if (!res.ok) continue;
      const data = (await res.json()) as { photos: ApiPhoto[] };
      const publicBase = adminPublic || baseUrl;
      return data.photos.map((p) => toPhoto(p, publicBase));
    } catch {
      continue;
    }
  }
  return [];
}

export type ImpressionCollection = {
  slug: string;
  name: string;
  description: string;
  photos: ImpressionPhoto[];
};

export async function fetchCollection(slug: string): Promise<ImpressionCollection | null> {
  const adminInternal = process.env.ADMIN_API_URL;
  const adminPublic = process.env.ADMIN_PUBLIC_URL;
  const fetchUrls = [adminInternal, adminPublic].filter(Boolean) as string[];
  if (fetchUrls.length === 0) return null;

  for (const baseUrl of fetchUrls) {
    try {
      const res = await fetch(`${baseUrl}/api/impressions/collections/${slug}`, { next: { revalidate: 60 } });
      if (res.status === 404) return null;
      if (!res.ok) continue;
      const data = (await res.json()) as {
        slug: string;
        name: string;
        description: string;
        photos: ApiPhoto[];
      };
      const publicBase = adminPublic || baseUrl;
      return {
        slug: data.slug,
        name: data.name,
        description: data.description,
        photos: data.photos.map((p) => toPhoto(p, publicBase)),
      };
    } catch {
      continue;
    }
  }
  return null;
}
