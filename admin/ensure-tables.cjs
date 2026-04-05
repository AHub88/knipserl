// Ensures all required database tables and types exist before the app starts.
// Uses pg directly (CommonJS) - no prisma CLI, no tsx needed.
"use strict";

// PostgreSQL enum types required by Prisma schema
const ENUMS = {
  VacationType: ["ABSENT", "LIMITED"],
  Role: ["ADMIN", "ADMIN_ACCOUNTING", "DRIVER"],
  InquiryStatus: ["NEW", "CONTACTED", "WAITING", "ACCEPTED", "REJECTED"],
  OrderStatus: ["OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"],
  PaymentMethod: ["INVOICE", "CASH"],
  CustomerType: ["PRIVATE", "BUSINESS"],
  QuoteStatus: ["DRAFT", "SENT", "ACCEPTED", "REJECTED"],
  InvoiceStatus: ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"],
  IncomingInvoiceStatus: ["PENDING", "PAID", "OVERDUE"],
};

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[ensure-tables] No DATABASE_URL, skipping.");
    return;
  }

  let Client;
  try {
    const pg = require("pg");
    Client = pg.Client || (pg.default && pg.default.Client);
    if (!Client) throw new Error("pg.Client not found in module exports");
  } catch (e) {
    console.log("[ensure-tables] Cannot load pg:", e.message);
    return;
  }

  const client = new Client({ connectionString: url });

  try {
    await client.connect();
    console.log("[ensure-tables] Connected to database.");

    // 1. Ensure all enum types exist
    const existingTypes = await client.query(
      "SELECT typname FROM pg_type WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')"
    );
    const typeNames = existingTypes.rows.map(r => r.typname);

    for (const [name, values] of Object.entries(ENUMS)) {
      if (!typeNames.includes(name)) {
        const valuesStr = values.map(v => `'${v}'`).join(", ");
        console.log(`[ensure-tables] Creating enum type "${name}"...`);
        await client.query(`CREATE TYPE "${name}" AS ENUM (${valuesStr})`);
      } else {
        // Add missing values to existing enum
        const existing = await client.query(
          `SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = $1) ORDER BY enumsortorder`,
          [name]
        );
        const existingValues = existing.rows.map(r => r.enumlabel);
        for (const val of values) {
          if (!existingValues.includes(val)) {
            console.log(`[ensure-tables] Adding "${val}" to enum "${name}"...`);
            await client.query(`ALTER TYPE "${name}" ADD VALUE IF NOT EXISTS '${val}'`);
          }
        }
      }
    }

    // 2. Check what tables exist
    const res = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    const tables = res.rows.map(r => r.tablename);
    console.log("[ensure-tables] Existing tables:", tables.join(", "));

    // 3. Ensure vacations table exists with correct schema
    if (!tables.includes("vacations")) {
      console.log("[ensure-tables] Creating vacations table...");
      await client.query(`
        CREATE TABLE "vacations" (
          "id" TEXT NOT NULL,
          "driverId" TEXT NOT NULL,
          "type" "VacationType" NOT NULL DEFAULT 'ABSENT'::"VacationType",
          "startDate" TIMESTAMP(3) NOT NULL,
          "endDate" TIMESTAMP(3) NOT NULL,
          "note" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "vacations_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "vacations_driverId_fkey" FOREIGN KEY ("driverId")
            REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `);
      console.log("[ensure-tables] vacations table created.");
    } else {
      console.log("[ensure-tables] vacations table exists, checking columns...");

      const cols = await client.query(
        "SELECT column_name, data_type, udt_name FROM information_schema.columns WHERE table_name = 'vacations'"
      );
      const colMap = {};
      cols.rows.forEach(r => { colMap[r.column_name] = r; });
      console.log("[ensure-tables] vacations columns:", Object.keys(colMap).join(", "));

      // Add missing columns
      if (!colMap["type"]) {
        console.log("[ensure-tables] Adding 'type' column...");
        await client.query(`ALTER TABLE "vacations" ADD COLUMN "type" "VacationType" NOT NULL DEFAULT 'ABSENT'::"VacationType"`);
      } else if (colMap["type"].udt_name === "text") {
        // Column exists but is TEXT instead of enum - convert it
        console.log("[ensure-tables] Converting 'type' column from TEXT to VacationType enum...");
        await client.query(`ALTER TABLE "vacations" ALTER COLUMN "type" TYPE "VacationType" USING "type"::"VacationType"`);
        await client.query(`ALTER TABLE "vacations" ALTER COLUMN "type" SET DEFAULT 'ABSENT'::"VacationType"`);
      }

      if (!colMap["note"]) {
        await client.query(`ALTER TABLE "vacations" ADD COLUMN "note" TEXT`);
      }
      if (!colMap["createdAt"]) {
        await client.query(`ALTER TABLE "vacations" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP`);
      }

      console.log("[ensure-tables] vacations table OK.");
    }

    // 4. Ensure standard_line_items table
    if (!tables.includes("standard_line_items")) {
      console.log("[ensure-tables] Creating standard_line_items table...");
      await client.query(`
        CREATE TABLE "standard_line_items" (
          "id" TEXT NOT NULL,
          "title" TEXT NOT NULL,
          "description" TEXT,
          "unitPrice" DOUBLE PRECISION NOT NULL,
          "category" TEXT,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "standard_line_items_pkey" PRIMARY KEY ("id")
        );
      `);
      console.log("[ensure-tables] standard_line_items created.");
    }

    // 5. Ensure order_confirmations table
    if (!tables.includes("order_confirmations")) {
      console.log("[ensure-tables] Creating order_confirmations table...");
      await client.query(`
        CREATE TABLE "order_confirmations" (
          "id" TEXT NOT NULL,
          "orderId" TEXT NOT NULL,
          "companyId" TEXT NOT NULL,
          "confirmationNumber" TEXT NOT NULL,
          "recipientName" TEXT NOT NULL,
          "recipientAddress" TEXT,
          "recipientEmail" TEXT,
          "items" JSONB NOT NULL,
          "totalAmount" DOUBLE PRECISION NOT NULL,
          "deliveryDate" TIMESTAMP(3),
          "notes" TEXT,
          "pdfUrl" TEXT,
          "sentAt" TIMESTAMP(3),
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "order_confirmations_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "order_confirmations_confirmationNumber_key" UNIQUE ("confirmationNumber"),
          CONSTRAINT "order_confirmations_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
          CONSTRAINT "order_confirmations_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `);
      console.log("[ensure-tables] order_confirmations created.");
    }

    // 6. Add missing columns to existing tables
    async function addColumnIfMissing(table, column, type) {
      const check = await client.query(
        "SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2",
        [table, column]
      );
      if (check.rows.length === 0) {
        console.log(`[ensure-tables] Adding ${table}.${column}...`);
        await client.query(`ALTER TABLE "${table}" ADD COLUMN "${column}" ${type}`);
      }
    }

    // quotes: new columns
    await addColumnIfMissing("quotes", "customerId", "TEXT");
    await addColumnIfMissing("quotes", "recipientName", "TEXT DEFAULT ''");
    await addColumnIfMissing("quotes", "recipientAddress", "TEXT");
    await addColumnIfMissing("quotes", "recipientEmail", "TEXT");
    await addColumnIfMissing("quotes", "deliveryDate", "TIMESTAMP(3)");
    await addColumnIfMissing("quotes", "notes", "TEXT");

    // invoices: new columns
    await addColumnIfMissing("invoices", "customerId", "TEXT");
    await addColumnIfMissing("invoices", "quoteId", "TEXT");
    await addColumnIfMissing("invoices", "recipientName", "TEXT DEFAULT ''");
    await addColumnIfMissing("invoices", "recipientAddress", "TEXT");
    await addColumnIfMissing("invoices", "recipientEmail", "TEXT");
    await addColumnIfMissing("invoices", "deliveryDate", "TIMESTAMP(3)");
    await addColumnIfMissing("invoices", "notes", "TEXT");

    // companies: confirmation number sequence
    await addColumnIfMissing("companies", "confirmationPrefix", "TEXT DEFAULT 'AB'");
    await addColumnIfMissing("companies", "confirmationNumberCurrent", "INTEGER DEFAULT 0");

    // Make orderId nullable on quotes and invoices (allow standalone documents)
    try {
      await client.query(`ALTER TABLE "quotes" ALTER COLUMN "orderId" DROP NOT NULL`);
      await client.query(`ALTER TABLE "invoices" ALTER COLUMN "orderId" DROP NOT NULL`);
    } catch (_) { /* already nullable */ }

    // 7. Layout templates + designs tables
    if (!tables.includes("layout_templates")) {
      console.log("[ensure-tables] Creating layout_templates table...");
      await client.query(`
        CREATE TABLE "layout_templates" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "format" TEXT NOT NULL DEFAULT '2x6',
          "thumbnail" TEXT,
          "canvasJson" JSONB NOT NULL DEFAULT '{}',
          "category" TEXT,
          "active" BOOLEAN NOT NULL DEFAULT true,
          "sortOrder" INTEGER NOT NULL DEFAULT 0,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "layout_templates_pkey" PRIMARY KEY ("id")
        );
      `);
    }

    if (!tables.includes("layout_designs")) {
      console.log("[ensure-tables] Creating layout_designs table...");
      await client.query(`
        CREATE TABLE "layout_designs" (
          "id" TEXT NOT NULL,
          "orderId" TEXT NOT NULL,
          "templateId" TEXT,
          "format" TEXT NOT NULL DEFAULT '2x6',
          "canvasJson" JSONB NOT NULL DEFAULT '{}',
          "exportUrl" TEXT,
          "submitted" BOOLEAN NOT NULL DEFAULT false,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "layout_designs_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "layout_designs_orderId_key" UNIQUE ("orderId"),
          CONSTRAINT "layout_designs_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE
        );
      `);
    }

    // orders: design token
    await addColumnIfMissing("orders", "designToken", "TEXT");
    await addColumnIfMissing("orders", "designSubmittedAt", "TIMESTAMP(3)");

    console.log("[ensure-tables] Done.");
  } catch (err) {
    console.log("[ensure-tables] Error:", err.message);
    if (err.stack) console.log("[ensure-tables] Stack:", err.stack.split("\n").slice(0, 3).join("\n"));
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

main().catch((err) => {
  console.log("[ensure-tables] Unexpected:", err.message);
});
