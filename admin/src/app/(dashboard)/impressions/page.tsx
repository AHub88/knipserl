import { prisma } from "@/lib/db";
import { IconPhotoScan } from "@tabler/icons-react";
import { buildUrls } from "@/lib/impression-images";
import { ImpressionsManager } from "./impressions-manager";

export const dynamic = "force-dynamic";

export default async function ImpressionsPage() {
  const rows = await prisma.impressionPhoto.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  const photos = rows.map((p) => {
    const isAnimated = p.originalFilename.endsWith(".gif");
    return {
      id: p.id,
      alt: p.alt,
      width: p.width,
      height: p.height,
      sortOrder: p.sortOrder,
      active: p.active,
      originalFilename: p.originalFilename,
      urls: buildUrls(p.originalFilename, p.width, isAnimated),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconPhotoScan className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Impressionen
          </h1>
          <p className="text-sm text-muted-foreground">
            Bilder-Galerie der Webseite verwalten. Originale bleiben unver&auml;ndert, automatisch werden AVIF/WebP-Varianten f&uuml;r Pagespeed erzeugt.
          </p>
        </div>
      </div>

      <ImpressionsManager initialPhotos={JSON.parse(JSON.stringify(photos))} />
    </div>
  );
}
