import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const SEED_LOGOS: { name: string; filename: string; url: string }[] = [
  { name: "Adelholzener", filename: "adelholzener.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/adelholzener.png" },
  { name: "Aenova", filename: "aenova.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/Download.png" },
  { name: "Amazon Business", filename: "a-business.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/a-business.png" },
  { name: "Anita", filename: "anita.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/anita.png" },
  { name: "ARRI", filename: "arri.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/arri.png" },
  { name: "ARRK", filename: "arrk.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/arrk.png" },
  { name: "Bruckner Servtec", filename: "servtec.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/servtec.png" },
  { name: "Campari", filename: "cpari.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/cpari.png" },
  { name: "DAV", filename: "dav.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/dav.png" },
  { name: "Dinzler", filename: "dinzler.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/dinzler.png" },
  { name: "DIWA Gruppe", filename: "diwa-gruppe.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/diwa-gruppe.png" },
  { name: "Flemings Hotels", filename: "flemings.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/flemings.png" },
  { name: "Flötzinger", filename: "floetzinger.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/floetzinger.png" },
  { name: "Fronius", filename: "fronius.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/fronius.png" },
  { name: "GANG", filename: "gang.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/gang.png" },
  { name: "IBM", filename: "ibm.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/ibm.png" },
  { name: "Ibeko Solar", filename: "ibeko.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/ibeko.png" },
  { name: "Infineon", filename: "infineon.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/infineon.png" },
  { name: "KPMG", filename: "kpmg.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/kpmg.png" },
  { name: "Landratsamt München", filename: "landratsamt-muenchen.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/landratsamt-muenchen.png" },
  { name: "Malteser", filename: "malteser.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/malteser.png" },
  { name: "Marc O'Polo", filename: "marco-polo.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/marco-polo.png" },
  { name: "Medical Park", filename: "medical-park.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/medical-park.png" },
  { name: "Metzler Vater Group", filename: "metzler-vater.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/metzler-vater.png" },
  { name: "Mondi", filename: "mondi.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/mondi.png" },
  { name: "Prechtl", filename: "prechtl.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/prechtl.png" },
  { name: "Rischart", filename: "rischart.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/rischart.png" },
  { name: "RoMed Kliniken", filename: "romed.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/romed.png" },
  { name: "Schattdecor", filename: "schattdecor.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/schattdecor.png" },
  { name: "Stadtwerke Rosenheim", filename: "stadtwerke-rosenheim.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/stadtwerke-rosenheim.png" },
  { name: "Starbulls Rosenheim", filename: "starbulls.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/starbulls.png" },
  { name: "TH Rosenheim", filename: "th-rosenheim.png", url: "https://www.knipserl.de/wp-content/uploads/2018/07/th-rosenheim.png" },
  { name: "Timezone", filename: "timezone.png", url: "https://www.knipserl.de/wp-content/uploads/2023/06/timezone.png" },
];

// POST /api/client-logos/seed — one-time seed (admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const uploadDir = path.join(process.cwd(), "uploads", "client-logos");
  await mkdir(uploadDir, { recursive: true });

  // Check if already seeded
  const existing = await prisma.clientLogo.count();
  if (existing > 0) {
    return NextResponse.json({
      message: `Bereits ${existing} Logos vorhanden. Lösche zuerst alle, wenn du neu seeden willst.`,
      count: existing,
    });
  }

  let created = 0;
  const errors: string[] = [];

  for (const logo of SEED_LOGOS) {
    try {
      // Download from WordPress
      const res = await fetch(logo.url);
      if (!res.ok) {
        errors.push(`${logo.name}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());

      // Skip if it's an HTML error page (< 500 bytes or starts with <)
      if (buffer.length < 500 || buffer[0] === 0x3c) {
        errors.push(`${logo.name}: Invalid image (HTML response)`);
        continue;
      }

      // Save file
      await writeFile(path.join(uploadDir, logo.filename), buffer);

      // Create DB record
      await prisma.clientLogo.create({
        data: { name: logo.name, filename: logo.filename },
      });
      created++;
    } catch (err) {
      errors.push(`${logo.name}: ${err instanceof Error ? err.message : "Unknown error"}`);
    }
  }

  return NextResponse.json({
    message: `${created} Logos importiert`,
    created,
    errors: errors.length > 0 ? errors : undefined,
  });
}
