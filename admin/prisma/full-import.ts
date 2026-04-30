/**
 * Knipserl Full Import Script
 *
 * Löscht alle Daten und importiert alles neu aus b.xlsx:
 * 1. Firmen (Einzelunternehmen + GbR)
 * 2. Fahrer (MK, JD, HR, AH + Admin-User)
 * 3. Fahrtkosten-Staffelung (19 Stufen)
 * 4. Buchungen aus Excel → Inquiries + Orders
 * 5. Locations aus den Aufträgen extrahiert
 * 6. Kunden aus den Aufträgen extrahiert + verknüpft
 *
 * Usage: npx tsx prisma/full-import.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import XLSX from "xlsx";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ─── Config ───────────────────────────────────────────────

const DRIVER_MAP: Record<string, string> = {
  MK: "Michael Kaiser",
  JD: "Johann Darscht",
  AH: "Andreas Huber",
  HR: "Helene Rincon",
  FH: "Andreas Huber",
  MS: "Andreas Huber",
};

const DRIVER_EMAILS: Record<string, string> = {
  "Michael Kaiser": "mk@knipserl.de",
  "Johann Darscht": "jd@knipserl.de",
  "Andreas Huber": "info@knipserl.de",
  "Helene Rincon": "hr@knipserl.de",
};

const DRIVER_INITIALS: Record<string, string> = {
  "Michael Kaiser": "MK",
  "Johann Darscht": "JD",
  "Andreas Huber": "AH",
  "Helene Rincon": "HR",
};

const TRAVEL_PRICING_TIERS = [
  { distanceKm: 0, driverCompensation: 70, customerPrice: 0 },
  { distanceKm: 15, driverCompensation: 70, customerPrice: 30 },
  { distanceKm: 20, driverCompensation: 80, customerPrice: 50 },
  { distanceKm: 30, driverCompensation: 80, customerPrice: 70 },
  { distanceKm: 40, driverCompensation: 95, customerPrice: 90 },
  { distanceKm: 50, driverCompensation: 110, customerPrice: 110 },
  { distanceKm: 60, driverCompensation: 130, customerPrice: 130 },
  { distanceKm: 70, driverCompensation: 150, customerPrice: 150 },
  { distanceKm: 80, driverCompensation: 170, customerPrice: 170 },
  { distanceKm: 90, driverCompensation: 190, customerPrice: 200 },
  { distanceKm: 100, driverCompensation: 200, customerPrice: 210 },
  { distanceKm: 110, driverCompensation: 230, customerPrice: 240 },
  { distanceKm: 120, driverCompensation: 250, customerPrice: 260 },
  { distanceKm: 130, driverCompensation: 270, customerPrice: 280 },
  { distanceKm: 140, driverCompensation: 290, customerPrice: 300 },
  { distanceKm: 150, driverCompensation: 310, customerPrice: 320 },
  { distanceKm: 160, driverCompensation: 330, customerPrice: 340 },
  { distanceKm: 170, driverCompensation: 350, customerPrice: 360 },
  { distanceKm: 180, driverCompensation: 370, customerPrice: 380 },
];

// ─── Helpers ──────────────────────────────────────────────

function excelDateToJS(serial: number): Date {
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + serial * 86400000);
}

function collectExtras(row: any[]): string[] {
  const extras: string[] = [];
  if (row[17] === "x") extras.push("Drucker");
  if (row[18] === "x") extras.push("Props");
  if (row[19] === "x") extras.push("Stick");
  if (row[20] === "x") extras.push("HG");
  if (row[21] === "x") extras.push("LOVE");
  if (row[22] === "x") extras.push("Social");
  if (row[23] === "x") extras.push("Book");
  if (row[24] === "x") extras.push("TV");
  if (row[25] === "x") extras.push("Telefon");
  return extras;
}

function parseDrivers(
  fahrerStr: string,
  driverIdMap: Record<string, string>
): { driverId: string | null; secondDriverId: string | null } {
  if (!fahrerStr) return { driverId: null, secondDriverId: null };
  const parts = fahrerStr.split("/").map((s) => s.trim());
  const resolve = (initials: string): string | null => {
    const name = DRIVER_MAP[initials];
    return name ? driverIdMap[name] ?? null : null;
  };
  return {
    driverId: resolve(parts[0]) ?? null,
    secondDriverId: parts[1] ? resolve(parts[1]) ?? null : null,
  };
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log("=== Knipserl Full Import ===\n");

  // ── Step 0: Clear all data ──
  console.log("0. Lösche alle Daten...");
  await prisma.bankTransaction.deleteMany();
  await prisma.bankConnection.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.incomingInvoice.deleteMany();
  await prisma.vacation.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.location.deleteMany();
  await prisma.travelPricingTier.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();
  await prisma.appSetting.deleteMany();
  console.log("   ✓ Alle Tabellen geleert\n");

  // ── Step 1: Companies ──
  console.log("1. Firmen anlegen...");
  const eu = await prisma.company.create({
    data: {
      id: "company-eu",
      name: "Knipserl Fotobox / Andreas Huber",
      address: "Musterstraße 1",
      city: "München",
      zip: "80331",
      taxNumber: "123/456/78901",
      email: "info@knipserl.de",
      invoicePrefix: "EU",
      quotePrefix: "EU-A",
      isKleinunternehmer: true,
    },
  });
  const gbr = await prisma.company.create({
    data: {
      id: "company-gbr",
      name: "Andreas und Julia Huber Knipserl GbR",
      address: "Musterstraße 1",
      city: "München",
      zip: "80331",
      taxNumber: "123/456/78902",
      email: "gbr@knipserl.de",
      invoicePrefix: "GBR",
      quotePrefix: "GBR-A",
      isKleinunternehmer: true,
    },
  });
  console.log("   ✓ EU + GbR\n");

  // ── Step 2: Users/Drivers ──
  console.log("2. Fahrer & User anlegen...");
  const passwordHash = await bcrypt.hash("admin123", 12);
  const driverIdMap: Record<string, string> = {};

  for (const [name, email] of Object.entries(DRIVER_EMAILS)) {
    const initials = DRIVER_INITIALS[name];
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: email === "info@knipserl.de" ? "ADMIN" : "DRIVER",
        initials,
      },
    });
    driverIdMap[name] = user.id;
  }

  // Buchhaltung user
  await prisma.user.create({
    data: {
      name: "Julia Huber",
      email: "buchhaltung@knipserl.de",
      passwordHash,
      role: "ADMIN_ACCOUNTING",
    },
  });

  console.log(
    `   ✓ ${Object.keys(driverIdMap).length} Fahrer + 1 Buchhaltung\n`
  );

  // ── Step 3: Travel Pricing Tiers ──
  console.log("3. Fahrtkosten-Staffelung...");
  await prisma.travelPricingTier.createMany({ data: TRAVEL_PRICING_TIERS });
  console.log(`   ✓ ${TRAVEL_PRICING_TIERS.length} Stufen\n`);

  // ── Step 4: Import Buchungen from Excel ──
  console.log("4. Buchungen importieren...");
  const wb = XLSX.readFile("b.xlsx");
  const ws = wb.Sheets["Buchungen"];
  const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row || !row[1]) {
      skipped++;
      continue;
    }

    try {
      const datumRaw = row[1];
      let eventDate: Date;
      if (typeof datumRaw === "number") {
        eventDate = excelDateToJS(datumRaw);
      } else {
        eventDate = new Date(datumRaw);
      }
      if (isNaN(eventDate.getTime())) {
        skipped++;
        continue;
      }

      const firma = row[4] || null;
      const nachname = row[5] || "";
      const vorname = row[6] || "";
      const customerEmail = row[7] || "";
      const customerPhone = row[8] ? String(row[8]) : null;
      const customerType = firma ? "BUSINESS" : "PRIVATE";

      const locationName = row[9] || "Unbekannt";
      const strasse = row[10] || "";
      const plz = row[11] || "";
      const ort = row[12] || "";
      const locationAddress = `${strasse}, ${plz} ${ort}`.trim();

      const zahlartRaw = row[13] || "Bar";
      const paymentMethod = zahlartRaw === "Bar" ? "CASH" : "INVOICE";

      const km = typeof row[14] === "number" ? row[14] : null;
      const travelCost = typeof row[15] === "number" ? row[15] : null;
      const boxPrice = typeof row[16] === "number" ? row[16] : null;
      const extrasCostVal = typeof row[26] === "number" ? row[26] : null;
      const price = typeof row[27] === "number" ? row[27] : 0;
      const setupCost = typeof row[28] === "number" ? row[28] : null;
      const materialCost = typeof row[30] === "number" ? row[30] : null;
      const profit = typeof row[31] === "number" ? row[31] : null;

      const extras = collectExtras(row);
      const { driverId, secondDriverId } = parseDrivers(
        row[2] ? String(row[2]) : "",
        driverIdMap
      );

      const setupDate =
        typeof row[32] === "number" ? excelDateToJS(row[32]) : null;
      const setupTime = row[33] ? String(row[33]) : null;
      const teardownDate =
        typeof row[34] === "number" ? excelDateToJS(row[34]) : null;
      const teardownTime = row[35] ? String(row[35]) : null;

      const confirmed = row[36] === "ja";
      const designReady = row[37] === "ja";
      const planned = row[38] === "ja";
      const paid = row[39] === "ja";

      const notes = row[40] ? String(row[40]) : null;
      const internalNotes = row[41] ? String(row[41]) : null;
      const graphicUrl = row[45] ? String(row[45]) : null;
      const eventType = row[3] || "Event";

      const inquiryCustomerName = firma
        ? `${firma} - ${vorname} ${nachname}`.trim()
        : `${vorname} ${nachname}`.trim();

      const companyId = customerType === "BUSINESS" ? gbr.id : eu.id;

      let status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED" = "COMPLETED";
      if (!confirmed) status = "OPEN";
      else if (driverId) status = "COMPLETED";
      else status = "OPEN";

      const inquiry = await prisma.inquiry.create({
        data: {
          customerName: inquiryCustomerName || "Unbekannt",
          customerEmail: customerEmail || "unbekannt@import.local",
          customerPhone,
          customerType,
          eventDate,
          eventType,
          locationName,
          locationAddress,
          distanceKm: km,
          extras,
          comments: notes,
          status: "ACCEPTED",
        },
      });

      await prisma.order.create({
        data: {
          inquiryId: inquiry.id,
          companyId,
          driverId,
          secondDriverId,
          paymentMethod,
          status,
          price,
          travelCost,
          boxPrice,
          extrasCost: extrasCostVal,
          setupCost,
          materialCost,
          profit,
          extras,
          notes,
          internalNotes,
          eventDate,
          eventType,
          locationName,
          locationAddress,
          customerName: inquiryCustomerName || "Unbekannt",
          customerEmail: customerEmail || "unbekannt@import.local",
          customerPhone,
          setupDate,
          setupTime,
          teardownDate,
          teardownTime,
          confirmed,
          designReady,
          planned,
          paid,
          graphicUrl,
          images: graphicUrl ? [graphicUrl] : [],
        },
      });

      imported++;
      if (imported % 100 === 0) console.log(`   ...${imported}`);
    } catch (err: any) {
      console.error(`   Row ${i} error:`, err.message);
      errors++;
    }
  }
  console.log(`   ✓ ${imported} importiert, ${skipped} übersprungen, ${errors} Fehler\n`);

  // ── Step 5: Extract Locations ──
  console.log("5. Locations extrahieren...");
  const orders = await prisma.order.findMany({
    include: { inquiry: { select: { distanceKm: true } } },
  });

  const locMap = new Map<
    string,
    { name: string; street: string; zip: string | null; city: string | null; distanceKm: number | null; count: number }
  >();

  for (const o of orders) {
    const key = o.locationName;
    if (!key || key === "Unbekannt") continue;

    const addrMatch = o.locationAddress.match(/^(.+?),\s*(\d{5})\s+(.+)$/);
    const street = addrMatch ? addrMatch[1] : o.locationAddress;
    const zip = addrMatch ? addrMatch[2] : null;
    const city = addrMatch ? addrMatch[3] : null;
    const km = o.inquiry?.distanceKm ?? null;
    const mapKey = key + "|" + (city || "");

    if (!locMap.has(mapKey)) {
      locMap.set(mapKey, { name: key, street, zip, city, distanceKm: km, count: 1 });
    } else {
      const existing = locMap.get(mapKey)!;
      existing.count++;
      if (km && !existing.distanceKm) existing.distanceKm = km;
    }
  }

  let locCreated = 0;
  for (const loc of locMap.values()) {
    await prisma.location.create({
      data: {
        name: loc.name,
        street: loc.street,
        zip: loc.zip,
        city: loc.city || "",
        distanceKm: loc.distanceKm,
        usageCount: loc.count,
      },
    });
    locCreated++;
  }
  console.log(`   ✓ ${locCreated} Locations\n`);

  // ── Step 6: Extract Customers ──
  console.log("6. Kunden extrahieren...");
  const allOrders = await prisma.order.findMany({
    include: { company: { select: { name: true } } },
  });

  const customerMap = new Map<
    string,
    {
      name: string;
      email: string | null;
      phone: string | null;
      company: string | null;
      customerType: "PRIVATE" | "BUSINESS";
      orderIds: string[];
    }
  >();

  for (const o of allOrders) {
    const key =
      o.customerEmail && o.customerEmail !== "unbekannt@import.local"
        ? o.customerEmail.toLowerCase()
        : o.customerName.toLowerCase();

    if (!customerMap.has(key)) {
      const isBusiness = o.company?.name?.includes("GbR");
      const sep = o.customerName.indexOf(" - ");
      const company = sep >= 0 ? o.customerName.slice(0, sep) : null;
      const name = sep >= 0 ? o.customerName.slice(sep + 3) : o.customerName;

      customerMap.set(key, {
        name: name || o.customerName,
        email:
          o.customerEmail && o.customerEmail !== "unbekannt@import.local"
            ? o.customerEmail
            : null,
        phone: o.customerPhone,
        company,
        customerType: isBusiness ? "BUSINESS" : "PRIVATE",
        orderIds: [o.id],
      });
    } else {
      customerMap.get(key)!.orderIds.push(o.id);
    }
  }

  let custCreated = 0;
  for (const [, c] of customerMap) {
    const customer = await prisma.customer.create({
      data: {
        name: c.name,
        email: c.email,
        phone: c.phone,
        company: c.company,
        customerType: c.customerType,
      },
    });

    await prisma.order.updateMany({
      where: { id: { in: c.orderIds } },
      data: { customerId: customer.id },
    });

    custCreated++;
  }

  // Link inquiries via orders
  const inquiries = await prisma.inquiry.findMany({ include: { order: true } });
  let inqLinked = 0;
  for (const inq of inquiries) {
    if (inq.order?.customerId) {
      await prisma.inquiry.update({
        where: { id: inq.id },
        data: { customerId: inq.order.customerId },
      });
      inqLinked++;
    }
  }

  console.log(`   ✓ ${custCreated} Kunden, ${inqLinked} Anfragen verknüpft\n`);

  // ── Done ──
  console.log("=== Import abgeschlossen ===");
  console.log(`   Firmen:       2`);
  console.log(`   Fahrer:       ${Object.keys(driverIdMap).length}`);
  console.log(`   Stufen:       ${TRAVEL_PRICING_TIERS.length}`);
  console.log(`   Aufträge:     ${imported}`);
  console.log(`   Locations:    ${locCreated}`);
  console.log(`   Kunden:       ${custCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
