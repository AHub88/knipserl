import { PrismaClient } from "../src/generated/prisma";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create companies
  const einzelunternehmen = await prisma.company.upsert({
    where: { id: "company-eu" },
    update: {},
    create: {
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

  const gbr = await prisma.company.upsert({
    where: { id: "company-gbr" },
    update: {},
    create: {
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

  // Create admin users
  const passwordHash = await bcrypt.hash("admin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@knipserl.de" },
    update: {},
    create: {
      name: "Andreas Huber",
      email: "admin@knipserl.de",
      passwordHash,
      role: "ADMIN",
      phone: "+49 123 456789",
    },
  });

  await prisma.user.upsert({
    where: { email: "buchhaltung@knipserl.de" },
    update: {},
    create: {
      name: "Julia Huber",
      email: "buchhaltung@knipserl.de",
      passwordHash,
      role: "ADMIN_ACCOUNTING",
      phone: "+49 123 456780",
    },
  });

  // Create driver
  const driver = await prisma.user.upsert({
    where: { email: "fahrer@knipserl.de" },
    update: {},
    create: {
      name: "Max Mustermann",
      email: "fahrer@knipserl.de",
      passwordHash,
      role: "DRIVER",
      phone: "+49 171 1234567",
      vehiclePlate: "M-KN 1234",
    },
  });

  // Create sample inquiries
  const inquiry1 = await prisma.inquiry.upsert({
    where: { id: "inquiry-1" },
    update: {},
    create: {
      id: "inquiry-1",
      customerName: "Maria Schmidt",
      customerEmail: "maria@example.com",
      customerPhone: "+49 170 1111111",
      customerType: "PRIVATE",
      eventDate: new Date("2026-05-15"),
      eventType: "Hochzeit",
      locationName: "Schloss Nymphenburg",
      locationAddress: "Schloß Nymphenburg 1, 80638 München",
      distanceKm: 12.5,
      extras: ["Gästebuch", "USB-Stick", "Requisiten Deluxe"],
      comments: "Bitte ab 18 Uhr aufbauen, Feier beginnt um 19 Uhr",
      status: "NEW",
    },
  });

  const inquiry2 = await prisma.inquiry.upsert({
    where: { id: "inquiry-2" },
    update: {},
    create: {
      id: "inquiry-2",
      customerName: "TechCorp GmbH",
      customerEmail: "events@techcorp.de",
      customerPhone: "+49 89 9999999",
      customerType: "BUSINESS",
      eventDate: new Date("2026-06-20"),
      eventType: "Firmenfeier",
      locationName: "BMW Welt",
      locationAddress: "Am Olympiapark 1, 80809 München",
      distanceKm: 8.3,
      extras: ["Branding", "Sofortdruck"],
      comments: "Logo-Branding auf allen Fotos gewünscht",
      status: "ACCEPTED",
    },
  });

  // Create order for accepted inquiry
  await prisma.order.upsert({
    where: { inquiryId: "inquiry-2" },
    update: {},
    create: {
      inquiryId: "inquiry-2",
      companyId: gbr.id,
      driverId: driver.id,
      paymentMethod: "INVOICE",
      status: "ASSIGNED",
      price: 650,
      eventDate: new Date("2026-06-20"),
      eventType: "Firmenfeier",
      locationName: "BMW Welt",
      locationAddress: "Am Olympiapark 1, 80809 München",
      customerName: "TechCorp GmbH",
      customerEmail: "events@techcorp.de",
      customerPhone: "+49 89 9999999",
      extras: ["Branding", "Sofortdruck"],
    },
  });

  // Create a third inquiry (new)
  await prisma.inquiry.upsert({
    where: { id: "inquiry-3" },
    update: {},
    create: {
      id: "inquiry-3",
      customerName: "Thomas Müller",
      customerEmail: "thomas@example.com",
      customerType: "PRIVATE",
      eventDate: new Date("2026-07-10"),
      eventType: "Geburtstag",
      locationName: "Biergarten am See",
      locationAddress: "Seestraße 15, 82319 Starnberg",
      distanceKm: 35.2,
      extras: ["Gästebuch"],
      status: "NEW",
    },
  });

  console.log("Seed completed successfully!");
  console.log("Login credentials:");
  console.log("  Admin: admin@knipserl.de / admin123");
  console.log("  Buchhaltung: buchhaltung@knipserl.de / admin123");
  console.log("  Fahrer: fahrer@knipserl.de / admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
