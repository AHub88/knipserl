/**
 * Migrate imported layout images from Buchungen_Images/ to uploads/{orderId}/
 *
 * This script:
 * 1. Finds all orders where graphicUrl or images reference "Buchungen_Images/..."
 * 2. Copies the files to uploads/{orderId}/
 * 3. Updates the DB URLs to /api/uploads/{orderId}/filename
 *
 * Usage: npx tsx scripts/migrate-images.ts
 *
 * Prerequisites: Place the Buchungen_Images/ folder in the admin/ directory
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { copyFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const SOURCE_DIR = path.join(process.cwd(), "Buchungen_Images");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

async function main() {
  if (!existsSync(SOURCE_DIR)) {
    console.error(`❌ Quellordner nicht gefunden: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Find all orders with Buchungen_Images references
  const orders = await prisma.order.findMany({
    where: {
      OR: [
        { graphicUrl: { startsWith: "Buchungen_Images/" } },
        { graphicUrl: { startsWith: "https://www.dropbox" } },
      ],
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      graphicUrl: true,
      images: true,
    },
  });

  console.log(`📋 ${orders.length} Orders mit zu migrierenden Bildern gefunden\n`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const order of orders) {
    const graphicUrl = order.graphicUrl;
    if (!graphicUrl) continue;

    // Handle Dropbox URLs — keep as-is (external), just fix images array
    if (graphicUrl.startsWith("https://")) {
      // External URLs work as-is for graphicUrl, but images[] should also use the URL
      if (!order.images.includes(graphicUrl)) {
        await prisma.order.update({
          where: { id: order.id },
          data: { images: [graphicUrl] },
        });
        console.log(`🔗 #${order.orderNumber} ${order.customerName} — Dropbox-URL beibehalten`);
      }
      skipped++;
      continue;
    }

    // Extract filename from "Buchungen_Images/xxx.png"
    const filename = graphicUrl.replace("Buchungen_Images/", "");
    const sourcePath = path.join(SOURCE_DIR, filename);

    if (!existsSync(sourcePath)) {
      console.log(`⚠️  #${order.orderNumber} ${order.customerName} — Datei nicht gefunden: ${filename}`);
      errors++;
      continue;
    }

    // Create uploads directory for this order
    const orderUploadDir = path.join(UPLOADS_DIR, order.id);
    await mkdir(orderUploadDir, { recursive: true });

    // Copy file
    const destPath = path.join(orderUploadDir, filename);
    await copyFile(sourcePath, destPath);

    // Update DB URLs
    const newUrl = `/api/uploads/${order.id}/${filename}`;
    await prisma.order.update({
      where: { id: order.id },
      data: {
        graphicUrl: newUrl,
        images: [newUrl],
      },
    });

    console.log(`✅ #${order.orderNumber} ${order.customerName} → ${newUrl}`);
    migrated++;
  }

  console.log(`\n📊 Ergebnis: ${migrated} migriert, ${skipped} übersprungen (Dropbox), ${errors} Fehler`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
