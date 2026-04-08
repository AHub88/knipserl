/**
 * Seed client logos from webseite/public/images/clients/ into the database
 * and copy files to admin/uploads/client-logos/
 *
 * Run: npx tsx scripts/seed-client-logos.ts
 */
import { PrismaClient } from "@prisma/client";
import { readdirSync, copyFileSync, mkdirSync, existsSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

const LOGO_NAMES: Record<string, string> = {
  "adelholzener": "Adelholzener",
  "aenova": "Aenova",
  "a-business": "Amazon Business",
  "anita": "Anita",
  "arri": "ARRI",
  "arrk": "ARRK",
  "servtec": "Bruckner Servtec",
  "cpari": "Campari",
  "dav": "DAV",
  "dinzler": "Dinzler",
  "diwa-gruppe": "DIWA Gruppe",
  "flemings": "Flemings Hotels",
  "floetzinger": "Flötzinger",
  "fronius": "Fronius",
  "gang": "GANG",
  "ibm": "IBM",
  "ibeko": "Ibeko Solar",
  "infineon": "Infineon",
  "kpmg": "KPMG",
  "malteser": "Malteser",
  "marco-polo": "Marc O'Polo",
  "medical-park": "Medical Park",
  "metzler-vater": "Metzler Vater Group",
  "mondi": "Mondi",
  "landratsamt-muenchen": "Landratsamt München",
  "prechtl": "Prechtl",
  "rischart": "Rischart",
  "romed": "RoMed Kliniken",
  "schattdecor": "Schattdecor",
  "stadtwerke-rosenheim": "Stadtwerke Rosenheim",
  "starbulls": "Starbulls Rosenheim",
  "th-rosenheim": "TH Rosenheim",
  "timezone": "Timezone",
};

async function main() {
  const webLogosDir = path.join(__dirname, "..", "..", "webseite", "public", "images", "clients");
  const adminLogosDir = path.join(__dirname, "..", "uploads", "client-logos");

  if (!existsSync(webLogosDir)) {
    console.error("Source directory not found:", webLogosDir);
    process.exit(1);
  }

  mkdirSync(adminLogosDir, { recursive: true });

  const files = readdirSync(webLogosDir).filter((f) =>
    [".png", ".jpg", ".svg", ".webp"].some((ext) => f.endsWith(ext))
  );

  console.log(`Found ${files.length} logo files`);

  // Clear existing
  const deleted = await prisma.clientLogo.deleteMany();
  console.log(`Cleared ${deleted.count} existing records`);

  let created = 0;
  for (const file of files) {
    const slug = file.replace(/\.[^.]+$/, "");
    const name = LOGO_NAMES[slug] || slug;

    // Skip orphan files
    if (slug === "download" || slug === "fotobox-startseite-teaser-backup" || slug === "fotobox-startseite-teaser-original") continue;

    // Copy file
    const src = path.join(webLogosDir, file);
    const dest = path.join(adminLogosDir, file);
    copyFileSync(src, dest);

    // Create DB record
    await prisma.clientLogo.create({
      data: { name, filename: file },
    });
    created++;
    console.log(`  ✓ ${name} (${file})`);
  }

  console.log(`\nDone! Created ${created} logo records.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
