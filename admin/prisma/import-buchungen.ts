import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import XLSX from "xlsx";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Excel serial number to JS Date
function excelDateToJS(serial: number): Date {
  const epoch = new Date(1899, 11, 30);
  return new Date(epoch.getTime() + serial * 86400000);
}

// Driver initials mapping
const DRIVER_MAP: Record<string, string> = {
  MK: "Michael Kaiser",
  JD: "Johann Darscht",
  AH: "Andreas Huber",
  HR: "Helene Rincon",
  FH: "Andreas Huber", // mapped to AH
  MS: "Andreas Huber", // mapped to AH
};

const DRIVER_EMAILS: Record<string, string> = {
  "Michael Kaiser": "mk@knipserl.de",
  "Johann Darscht": "jd@knipserl.de",
  "Andreas Huber": "admin@knipserl.de",
  "Helene Rincon": "hr@knipserl.de",
};

const DRIVER_INITIALS: Record<string, string> = {
  "Michael Kaiser": "MK",
  "Johann Darscht": "JD",
  "Andreas Huber": "AH",
  "Helene Rincon": "HR",
};

async function ensureDrivers(): Promise<Record<string, string>> {
  const passwordHash = await bcrypt.hash("driver123", 12);
  const driverIdMap: Record<string, string> = {};

  for (const [name, email] of Object.entries(DRIVER_EMAILS)) {
    const initials = DRIVER_INITIALS[name];
    const user = await prisma.user.upsert({
      where: { email },
      update: { initials },
      create: {
        name,
        email,
        passwordHash,
        role: email === "admin@knipserl.de" ? "ADMIN" : "DRIVER",
        initials,
      },
    });
    driverIdMap[name] = user.id;
  }

  return driverIdMap;
}

function parseDrivers(
  fahrerStr: string,
  driverIdMap: Record<string, string>
): { driverId: string | null; secondDriverId: string | null } {
  if (!fahrerStr) return { driverId: null, secondDriverId: null };

  const parts = fahrerStr.split("/").map((s) => s.trim());
  const resolveDriver = (initials: string): string | null => {
    const name = DRIVER_MAP[initials];
    return name ? driverIdMap[name] ?? null : null;
  };

  return {
    driverId: resolveDriver(parts[0]) ?? null,
    secondDriverId: parts[1] ? resolveDriver(parts[1]) ?? null : null,
  };
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

async function main() {
  console.log("Reading b.xlsx...");
  const wb = XLSX.readFile("b.xlsx");
  const ws = wb.Sheets["Buchungen"];
  const data: any[][] = XLSX.utils.sheet_to_json(ws, { header: 1 });

  console.log(`Found ${data.length - 1} rows (incl. empty)`);

  // Ensure drivers exist
  console.log("Ensuring drivers exist...");
  const driverIdMap = await ensureDrivers();
  console.log("Drivers:", Object.keys(driverIdMap));

  // Get companies
  const companies = await prisma.company.findMany();
  const eu = companies.find((c) => c.invoicePrefix === "EU");
  const gbr = companies.find((c) => c.invoicePrefix === "GBR");
  if (!eu || !gbr) {
    throw new Error("Companies not found! Run seed first.");
  }

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
      // Parse date
      const datumRaw = row[1];
      let eventDate: Date;
      if (typeof datumRaw === "number") {
        eventDate = excelDateToJS(datumRaw);
      } else {
        eventDate = new Date(datumRaw);
      }

      if (isNaN(eventDate.getTime())) {
        console.warn(`Row ${i}: Invalid date "${datumRaw}", skipping`);
        skipped++;
        continue;
      }

      // Customer info
      const firma = row[4] || null;
      const nachname = row[5] || "";
      const vorname = row[6] || "";
      const customerName = firma
        ? `${firma}`
        : `${vorname} ${nachname}`.trim();
      const customerEmail = row[7] || "";
      const customerPhone = row[8] ? String(row[8]) : null;
      const customerType = firma ? "BUSINESS" : "PRIVATE";

      // Location
      const locationName = row[9] || "Unbekannt";
      const strasse = row[10] || "";
      const plz = row[11] || "";
      const ort = row[12] || "";
      const locationAddress = `${strasse}, ${plz} ${ort}`.trim();

      // Payment
      const zahlartRaw = row[13] || "Bar";
      const paymentMethod =
        zahlartRaw === "Bar" ? "CASH" : "INVOICE";

      // Pricing
      const km = typeof row[14] === "number" ? row[14] : null;
      const travelCost = typeof row[15] === "number" ? row[15] : null;
      const boxPrice = typeof row[16] === "number" ? row[16] : null;
      const extrasCost =
        typeof row[26] === "number" ? row[26] : null;
      const price = typeof row[27] === "number" ? row[27] : 0;
      const setupCost = typeof row[28] === "number" ? row[28] : null;
      const materialCost =
        typeof row[30] === "number" ? row[30] : null;
      const profit = typeof row[31] === "number" ? row[31] : null;

      // Extras
      const extras = collectExtras(row);

      // Drivers
      const { driverId, secondDriverId } = parseDrivers(
        row[2] ? String(row[2]) : "",
        driverIdMap
      );

      // Setup/teardown times
      const setupDate =
        typeof row[32] === "number" ? excelDateToJS(row[32]) : null;
      const setupTime = row[33] ? String(row[33]) : null;
      const teardownDate =
        typeof row[34] === "number" ? excelDateToJS(row[34]) : null;
      const teardownTime = row[35] ? String(row[35]) : null;

      // Status flags
      const confirmed = row[36] === "ja";
      const designReady = row[37] === "ja";
      const planned = row[38] === "ja";
      const paid = row[39] === "ja";

      // Notes
      const notes = row[40] ? String(row[40]) : null;
      const internalNotes = row[41] ? String(row[41]) : null;

      // Graphic
      const graphicUrl = row[45] ? String(row[45]) : null;

      // Event type
      const eventType = row[3] || "Event";

      // Determine company: BUSINESS → GbR, PRIVATE → Einzelunternehmen
      const companyId =
        customerType === "BUSINESS" ? gbr.id : eu.id;

      // Determine order status
      let status: "OPEN" | "ASSIGNED" | "COMPLETED" | "CANCELLED" =
        "COMPLETED";
      if (!confirmed) status = "OPEN";
      else if (driverId) status = "COMPLETED";
      else status = "OPEN";

      // Contact name for inquiry
      const inquiryCustomerName = firma
        ? `${firma} - ${vorname} ${nachname}`.trim()
        : `${vorname} ${nachname}`.trim();

      // Create inquiry
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

      // Create order
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
          extrasCost,
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
        },
      });

      imported++;
      if (imported % 50 === 0) {
        console.log(`  ...${imported} imported`);
      }
    } catch (err: any) {
      console.error(`Row ${i} error:`, err.message);
      errors++;
    }
  }

  console.log(`\nImport complete!`);
  console.log(`  Imported: ${imported}`);
  console.log(`  Skipped:  ${skipped}`);
  console.log(`  Errors:   ${errors}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
