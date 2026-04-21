import sharp from "sharp";
import { mkdir, writeFile, unlink } from "fs/promises";
import path from "path";
import crypto from "crypto";

export const IMPRESSION_WIDTHS = [400, 800, 1200, 1920] as const;
export const IMPRESSION_ROOT = path.join(process.cwd(), "uploads", "impressions");
export const ORIGINAL_DIR = path.join(IMPRESSION_ROOT, "originals");
export const OPTIMIZED_DIR = path.join(IMPRESSION_ROOT, "optimized");

export type ProcessedImage = {
  uuid: string;
  originalFilename: string;
  width: number;
  height: number;
  isAnimated: boolean;
};

export async function processUpload(file: File): Promise<ProcessedImage> {
  await mkdir(ORIGINAL_DIR, { recursive: true });
  await mkdir(OPTIMIZED_DIR, { recursive: true });

  const uuid = crypto.randomUUID();
  const ext = path.extname(file.name).toLowerCase() || ".jpg";
  const originalFilename = `${uuid}${ext}`;
  const originalPath = path.join(ORIGINAL_DIR, originalFilename);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(originalPath, buffer);

  const meta = await sharp(buffer, { animated: true }).metadata();
  const width = meta.width ?? 0;
  const height = meta.pages && meta.pages > 1 && meta.pageHeight
    ? meta.pageHeight
    : (meta.height ?? 0);
  const isAnimated = (meta.pages ?? 1) > 1 || ext === ".gif";

  if (!isAnimated && ext !== ".svg") {
    for (const w of IMPRESSION_WIDTHS) {
      if (w > width * 1.5 && w > 800) continue;
      const pipeline = sharp(buffer).rotate().resize({ width: w, withoutEnlargement: true });
      const avif = await pipeline.clone().avif({ quality: 55, effort: 4 }).toBuffer();
      await writeFile(path.join(OPTIMIZED_DIR, `${uuid}-${w}.avif`), avif);
      const webp = await pipeline.clone().webp({ quality: 75 }).toBuffer();
      await writeFile(path.join(OPTIMIZED_DIR, `${uuid}-${w}.webp`), webp);
    }
  }

  return { uuid, originalFilename, width, height, isAnimated };
}

export async function deleteProcessed(originalFilename: string): Promise<void> {
  const uuid = path.parse(originalFilename).name;
  const tasks: Promise<unknown>[] = [
    unlink(path.join(ORIGINAL_DIR, originalFilename)).catch(() => {}),
  ];
  for (const w of IMPRESSION_WIDTHS) {
    tasks.push(unlink(path.join(OPTIMIZED_DIR, `${uuid}-${w}.avif`)).catch(() => {}));
    tasks.push(unlink(path.join(OPTIMIZED_DIR, `${uuid}-${w}.webp`)).catch(() => {}));
  }
  await Promise.all(tasks);
}

export function buildUrls(originalFilename: string, width: number, isAnimated: boolean) {
  const uuid = path.parse(originalFilename).name;
  const base = "/api/uploads/impressions";
  const originalUrl = `${base}/originals/${originalFilename}`;

  if (isAnimated || originalFilename.endsWith(".svg")) {
    return { original: originalUrl, avif: null, webp: null };
  }

  const usableWidths = IMPRESSION_WIDTHS.filter((w) => !(w > width * 1.5 && w > 800));
  const avif = usableWidths.map((w) => `${base}/optimized/${uuid}-${w}.avif ${w}w`).join(", ");
  const webp = usableWidths.map((w) => `${base}/optimized/${uuid}-${w}.webp ${w}w`).join(", ");

  return { original: originalUrl, avif, webp };
}
