import { prisma } from "@/lib/db";
import { IconPhoto } from "@tabler/icons-react";
import { buildUrls } from "@/lib/impression-images";
import { MediaLibrary } from "./media-library";

export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const rows = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });

  const assets = rows.map((a) => {
    const isAnimated = a.originalFilename.endsWith(".gif");
    return {
      id: a.id,
      alt: a.alt,
      width: a.width,
      height: a.height,
      fileSize: a.fileSize,
      active: a.active,
      originalFilename: a.originalFilename,
      createdAt: a.createdAt.toISOString(),
      urls: buildUrls(a.originalFilename, a.width, isAnimated),
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <IconPhoto className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Medienbibliothek
          </h1>
          <p className="text-sm text-muted-foreground">
            Zentraler Bild-Pool f&uuml;r alle Seiten. Upload erzeugt automatisch AVIF/WebP-Varianten in mehreren Breiten. Originale bleiben unver&auml;ndert.
          </p>
        </div>
      </div>

      <MediaLibrary initialAssets={assets} />
    </div>
  );
}
