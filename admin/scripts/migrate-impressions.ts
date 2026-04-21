/**
 * One-shot migration: copies the existing gallery images from webseite/public/images/gallery
 * into admin/uploads/impressions/, generates AVIF/WebP variants, and creates DB rows.
 *
 * Idempotent: skips files whose originalFilename already exists in the DB.
 *
 * Run inside the admin container:  npx tsx scripts/migrate-impressions.ts
 */
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";
import crypto from "crypto";
import { PrismaClient } from "../src/generated/prisma";
import {
  IMPRESSION_WIDTHS,
  ORIGINAL_DIR,
  OPTIMIZED_DIR,
} from "../src/lib/impression-images";

const prisma = new PrismaClient();

const SOURCE_FILES: { file: string; alt: string }[] = [
  { file: "fotobox-2025-neu.jpg", alt: "Knipserl Fotobox im Einsatz 2025" },
  { file: "fotobox-mieten-5.jpg", alt: "Fotobox im Einsatz bei einer Hochzeit" },
  { file: "fotobox-mieten-7.jpg", alt: "Gäste mit Requisiten an der Fotobox" },
  { file: "fotobox-mieten-3.jpg", alt: "Individuelle Fotobox-Ausdrucke" },
  { file: "fotobox-rosenheim-bild2.jpg", alt: "Knipserl Fotobox auf Firmenfeier in Rosenheim" },
  { file: "touchscreen.gif", alt: "Touchscreen-Bedienung der Knipserl Fotobox" },
  { file: "fotobox-mieten-2.jpg", alt: "Professionelle Fotobox mit Sofortdruck" },
  { file: "fotobox-mieten-1-scaled.jpg", alt: "Fotobox mieten für Events in München" },
  { file: "fotobox-mieten-1.gif", alt: "Animation der Knipserl Fotobox" },
  { file: "fotobox-mieten-5-scaled.jpg", alt: "Fotobox mieten für Hochzeiten in Oberbayern" },
];

async function main() {
  const sourceDir = path.resolve(
    process.cwd(),
    "..",
    "webseite",
    "public",
    "images",
    "gallery"
  );
  console.log(`[migrate] Source: ${sourceDir}`);

  await fs.mkdir(ORIGINAL_DIR, { recursive: true });
  await fs.mkdir(OPTIMIZED_DIR, { recursive: true });

  let idx = 0;
  let created = 0;
  let skipped = 0;

  for (const { file, alt } of SOURCE_FILES) {
    const srcPath = path.join(sourceDir, file);
    try {
      await fs.access(srcPath);
    } catch {
      console.warn(`[migrate] skip (missing): ${file}`);
      continue;
    }

    const ext = path.extname(file).toLowerCase();
    const uuid = crypto.randomUUID();
    const originalFilename = `${uuid}${ext}`;
    const buffer = await fs.readFile(srcPath);

    // Check if already migrated by scanning existing alt texts
    const existing = await prisma.impressionPhoto.findFirst({ where: { alt } });
    if (existing) {
      console.log(`[migrate] skip (already in DB): ${file}`);
      skipped += 1;
      continue;
    }

    await fs.writeFile(path.join(ORIGINAL_DIR, originalFilename), buffer);

    const meta = await sharp(buffer, { animated: true }).metadata();
    const width = meta.width ?? 0;
    const height = meta.pages && meta.pages > 1 && meta.pageHeight
      ? meta.pageHeight
      : (meta.height ?? 0);
    const isAnimated = (meta.pages ?? 1) > 1 || ext === ".gif";

    if (!isAnimated) {
      for (const w of IMPRESSION_WIDTHS) {
        if (w > width * 1.5 && w > 800) continue;
        const pipeline = sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true });
        const avif = await pipeline.clone().avif({ quality: 55, effort: 4 }).toBuffer();
        await fs.writeFile(path.join(OPTIMIZED_DIR, `${uuid}-${w}.avif`), avif);
        const webp = await pipeline.clone().webp({ quality: 75 }).toBuffer();
        await fs.writeFile(path.join(OPTIMIZED_DIR, `${uuid}-${w}.webp`), webp);
      }
    }

    await prisma.impressionPhoto.create({
      data: {
        originalFilename,
        alt,
        width,
        height,
        sortOrder: idx,
      },
    });
    created += 1;
    idx += 1;
    console.log(`[migrate] ✓ ${file} → ${originalFilename} (${width}×${height}${isAnimated ? ", animated" : ""})`);
  }

  console.log(`\n[migrate] Done. Created: ${created}, Skipped: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
