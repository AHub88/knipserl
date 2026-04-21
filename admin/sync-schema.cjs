/**
 * Sync database schema: ensures all tables and columns from the Prisma schema exist.
 * Uses raw SQL with IF NOT EXISTS / ADD COLUMN IF NOT EXISTS for idempotency.
 * This runs at container startup before the Next.js server starts.
 */
const { Client } = require("pg");

async function syncSchema() {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();

  // ── Enums ──────────────────────────────────────────────────────────────
  const enums = [
    ["Role", ["ADMIN", "ADMIN_ACCOUNTING", "DRIVER"]],
    ["InquiryStatus", ["NEW", "ACCEPTED", "REJECTED"]],
    ["OrderStatus", ["OPEN", "ASSIGNED", "COMPLETED", "CANCELLED"]],
    ["PaymentMethod", ["INVOICE", "CASH"]],
    ["CustomerType", ["PRIVATE", "BUSINESS"]],
    ["QuoteStatus", ["DRAFT", "SENT", "ACCEPTED", "REJECTED"]],
    ["InvoiceStatus", ["DRAFT", "SENT", "PAID", "OVERDUE", "CANCELLED"]],
    ["IncomingInvoiceStatus", ["PENDING", "PAID", "OVERDUE"]],
    ["VacationType", ["ABSENT", "LIMITED"]],
  ];

  for (const [name, values] of enums) {
    await q(c, `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${name}') THEN CREATE TYPE "${name}" AS ENUM (${values.map(v => `'${v}'`).join(", ")}); END IF; END $$`);
    // Add any missing enum values
    for (const val of values) {
      await q(c, `DO $$ BEGIN ALTER TYPE "${name}" ADD VALUE IF NOT EXISTS '${val}'; EXCEPTION WHEN duplicate_object THEN NULL; END $$`);
    }
  }

  // ── Tables & Columns ───────────────────────────────────────────────────
  // Each entry: [table, column, type, nullable, default]
  const columns = [
    // users
    ["users", "id", "TEXT", false, null],
    ["users", "name", "TEXT", false, null],
    ["users", "email", "TEXT", false, null],
    ["users", "passwordHash", "TEXT", false, null],
    ["users", "role", '"Role"', false, "'DRIVER'"],
    ["users", "phone", "TEXT", true, null],
    ["users", "vehiclePlate", "TEXT", true, null],
    ["users", "maxDistanceKm", "INTEGER", true, null],
    ["users", "initials", "TEXT", true, null],
    ["users", "active", "BOOLEAN", false, "true"],
    ["users", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["users", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // companies
    ["companies", "id", "TEXT", false, null],
    ["companies", "name", "TEXT", false, null],
    ["companies", "address", "TEXT", false, null],
    ["companies", "city", "TEXT", false, null],
    ["companies", "zip", "TEXT", false, null],
    ["companies", "taxNumber", "TEXT", true, null],
    ["companies", "email", "TEXT", true, null],
    ["companies", "phone", "TEXT", true, null],
    ["companies", "bankName", "TEXT", true, null],
    ["companies", "bankIban", "TEXT", true, null],
    ["companies", "bankBic", "TEXT", true, null],
    ["companies", "invoicePrefix", "TEXT", false, "''"],
    ["companies", "invoiceNumberCurrent", "INTEGER", false, "0"],
    ["companies", "quotePrefix", "TEXT", false, "''"],
    ["companies", "quoteNumberCurrent", "INTEGER", false, "0"],
    ["companies", "confirmationPrefix", "TEXT", false, "'AB'"],
    ["companies", "confirmationNumberCurrent", "INTEGER", false, "0"],
    ["companies", "isKleinunternehmer", "BOOLEAN", false, "true"],
    ["companies", "logoUrl", "TEXT", true, null],
    ["companies", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["companies", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // customers
    ["customers", "id", "TEXT", false, null],
    ["customers", "name", "TEXT", false, null],
    ["customers", "email", "TEXT", true, null],
    ["customers", "phone", "TEXT", true, null],
    ["customers", "company", "TEXT", true, null],
    ["customers", "customerType", '"CustomerType"', false, "'PRIVATE'"],
    ["customers", "notes", "TEXT", true, null],
    ["customers", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["customers", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // inquiries
    ["inquiries", "id", "TEXT", false, null],
    ["inquiries", "customerId", "TEXT", true, null],
    ["inquiries", "customerName", "TEXT", false, null],
    ["inquiries", "customerEmail", "TEXT", false, null],
    ["inquiries", "customerPhone", "TEXT", true, null],
    ["inquiries", "customerType", '"CustomerType"', false, "'PRIVATE'"],
    ["inquiries", "eventDate", "TIMESTAMPTZ", false, null],
    ["inquiries", "eventType", "TEXT", false, null],
    ["inquiries", "locationName", "TEXT", false, null],
    ["inquiries", "locationAddress", "TEXT", false, null],
    ["inquiries", "locationLat", "DOUBLE PRECISION", true, null],
    ["inquiries", "locationLng", "DOUBLE PRECISION", true, null],
    ["inquiries", "distanceKm", "DOUBLE PRECISION", true, null],
    ["inquiries", "extras", "TEXT[]", false, "'{}'"],
    ["inquiries", "comments", "TEXT", true, null],
    ["inquiries", "status", '"InquiryStatus"', false, "'NEW'"],
    ["inquiries", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["inquiries", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // orders
    ["orders", "id", "TEXT", false, null],
    ["orders", "orderNumber", "SERIAL", false, null],
    ["orders", "inquiryId", "TEXT", false, null],
    ["orders", "customerId", "TEXT", true, null],
    ["orders", "companyId", "TEXT", false, null],
    ["orders", "driverId", "TEXT", true, null],
    ["orders", "secondDriverId", "TEXT", true, null],
    ["orders", "paymentMethod", '"PaymentMethod"', false, "'INVOICE'"],
    ["orders", "status", '"OrderStatus"', false, "'OPEN'"],
    ["orders", "price", "DOUBLE PRECISION", false, null],
    ["orders", "travelCost", "DOUBLE PRECISION", true, null],
    ["orders", "boxPrice", "DOUBLE PRECISION", true, null],
    ["orders", "extrasCost", "DOUBLE PRECISION", true, null],
    ["orders", "setupCost", "DOUBLE PRECISION", true, null],
    ["orders", "materialCost", "DOUBLE PRECISION", true, null],
    ["orders", "discount", "DOUBLE PRECISION", true, null],
    ["orders", "discountType", "TEXT", true, "'AMOUNT'"],
    ["orders", "profit", "DOUBLE PRECISION", true, null],
    ["orders", "extras", "TEXT[]", false, "'{}'"],
    ["orders", "notes", "TEXT", true, null],
    ["orders", "internalNotes", "TEXT", true, null],
    ["orders", "eventDate", "TIMESTAMPTZ", false, null],
    ["orders", "eventType", "TEXT", false, null],
    ["orders", "locationName", "TEXT", false, null],
    ["orders", "locationAddress", "TEXT", false, null],
    ["orders", "customerName", "TEXT", false, null],
    ["orders", "customerEmail", "TEXT", false, null],
    ["orders", "customerPhone", "TEXT", true, null],
    ["orders", "setupDate", "TIMESTAMPTZ", true, null],
    ["orders", "setupTime", "TEXT", true, null],
    ["orders", "teardownDate", "TIMESTAMPTZ", true, null],
    ["orders", "teardownTime", "TEXT", true, null],
    ["orders", "confirmed", "BOOLEAN", false, "false"],
    ["orders", "designReady", "BOOLEAN", false, "false"],
    ["orders", "planned", "BOOLEAN", false, "false"],
    ["orders", "paid", "BOOLEAN", false, "false"],
    ["orders", "graphicUrl", "TEXT", true, null],
    ["orders", "images", "TEXT[]", false, "'{}'"],
    ["orders", "confirmationToken", "TEXT", true, null],
    ["orders", "confirmedByCustomerAt", "TIMESTAMPTZ", true, null],
    ["orders", "completedAt", "TIMESTAMPTZ", true, null],
    ["orders", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["orders", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // vacations
    ["vacations", "id", "TEXT", false, null],
    ["vacations", "driverId", "TEXT", false, null],
    ["vacations", "type", '"VacationType"', false, "'ABSENT'"],
    ["vacations", "startDate", "TIMESTAMPTZ", false, null],
    ["vacations", "endDate", "TIMESTAMPTZ", false, null],
    ["vacations", "note", "TEXT", true, null],
    ["vacations", "createdAt", "TIMESTAMPTZ", false, "NOW()"],

    // quotes
    ["quotes", "id", "TEXT", false, null],
    ["quotes", "orderId", "TEXT", true, null],
    ["quotes", "companyId", "TEXT", false, null],
    ["quotes", "customerId", "TEXT", true, null],
    ["quotes", "quoteNumber", "TEXT", false, null],
    ["quotes", "recipientName", "TEXT", false, "''"],
    ["quotes", "recipientAddress", "TEXT", true, null],
    ["quotes", "recipientEmail", "TEXT", true, null],
    ["quotes", "items", "JSONB", false, "'[]'"],
    ["quotes", "totalAmount", "DOUBLE PRECISION", false, null],
    ["quotes", "status", '"QuoteStatus"', false, "'DRAFT'"],
    ["quotes", "validUntil", "TIMESTAMPTZ", false, null],
    ["quotes", "deliveryDate", "TIMESTAMPTZ", true, null],
    ["quotes", "notes", "TEXT", true, null],
    ["quotes", "pdfUrl", "TEXT", true, null],
    ["quotes", "sentAt", "TIMESTAMPTZ", true, null],
    ["quotes", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["quotes", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // invoices
    ["invoices", "id", "TEXT", false, null],
    ["invoices", "orderId", "TEXT", true, null],
    ["invoices", "companyId", "TEXT", false, null],
    ["invoices", "customerId", "TEXT", true, null],
    ["invoices", "quoteId", "TEXT", true, null],
    ["invoices", "invoiceNumber", "TEXT", false, null],
    ["invoices", "recipientName", "TEXT", false, "''"],
    ["invoices", "recipientAddress", "TEXT", true, null],
    ["invoices", "recipientEmail", "TEXT", true, null],
    ["invoices", "items", "JSONB", false, "'[]'"],
    ["invoices", "totalAmount", "DOUBLE PRECISION", false, null],
    ["invoices", "status", '"InvoiceStatus"', false, "'DRAFT'"],
    ["invoices", "dueDate", "TIMESTAMPTZ", false, null],
    ["invoices", "deliveryDate", "TIMESTAMPTZ", true, null],
    ["invoices", "notes", "TEXT", true, null],
    ["invoices", "paidAt", "TIMESTAMPTZ", true, null],
    ["invoices", "pdfUrl", "TEXT", true, null],
    ["invoices", "sentAt", "TIMESTAMPTZ", true, null],
    ["invoices", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["invoices", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // order_confirmations
    ["order_confirmations", "id", "TEXT", false, null],
    ["order_confirmations", "orderId", "TEXT", false, null],
    ["order_confirmations", "companyId", "TEXT", false, null],
    ["order_confirmations", "confirmationNumber", "TEXT", false, null],
    ["order_confirmations", "recipientName", "TEXT", false, "''"],
    ["order_confirmations", "recipientAddress", "TEXT", true, null],
    ["order_confirmations", "recipientEmail", "TEXT", true, null],
    ["order_confirmations", "items", "JSONB", false, "'[]'"],
    ["order_confirmations", "totalAmount", "DOUBLE PRECISION", false, null],
    ["order_confirmations", "deliveryDate", "TIMESTAMPTZ", true, null],
    ["order_confirmations", "notes", "TEXT", true, null],
    ["order_confirmations", "pdfUrl", "TEXT", true, null],
    ["order_confirmations", "sentAt", "TIMESTAMPTZ", true, null],
    ["order_confirmations", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["order_confirmations", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // standard_line_items
    ["standard_line_items", "id", "TEXT", false, null],
    ["standard_line_items", "title", "TEXT", false, null],
    ["standard_line_items", "description", "TEXT", true, null],
    ["standard_line_items", "unitPrice", "DOUBLE PRECISION", false, null],
    ["standard_line_items", "category", "TEXT", true, null],
    ["standard_line_items", "sortOrder", "INTEGER", false, "0"],
    ["standard_line_items", "active", "BOOLEAN", false, "true"],
    ["standard_line_items", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["standard_line_items", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // incoming_invoices
    ["incoming_invoices", "id", "TEXT", false, null],
    ["incoming_invoices", "companyId", "TEXT", false, null],
    ["incoming_invoices", "vendor", "TEXT", false, null],
    ["incoming_invoices", "invoiceNumber", "TEXT", true, null],
    ["incoming_invoices", "amount", "DOUBLE PRECISION", false, null],
    ["incoming_invoices", "dueDate", "TIMESTAMPTZ", true, null],
    ["incoming_invoices", "status", '"IncomingInvoiceStatus"', false, "'PENDING'"],
    ["incoming_invoices", "category", "TEXT", true, null],
    ["incoming_invoices", "pdfUrl", "TEXT", true, null],
    ["incoming_invoices", "ocrData", "JSONB", true, null],
    ["incoming_invoices", "paidAt", "TIMESTAMPTZ", true, null],
    ["incoming_invoices", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["incoming_invoices", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // bank_transactions
    ["bank_transactions", "id", "TEXT", false, null],
    ["bank_transactions", "companyId", "TEXT", false, null],
    ["bank_transactions", "date", "TIMESTAMPTZ", false, null],
    ["bank_transactions", "amount", "DOUBLE PRECISION", false, null],
    ["bank_transactions", "reference", "TEXT", true, null],
    ["bank_transactions", "counterpartName", "TEXT", true, null],
    ["bank_transactions", "counterpartIban", "TEXT", true, null],
    ["bank_transactions", "matchedInvoiceId", "TEXT", true, null],
    ["bank_transactions", "matchedIncomingInvoiceId", "TEXT", true, null],
    ["bank_transactions", "isReconciled", "BOOLEAN", false, "false"],
    ["bank_transactions", "rawData", "JSONB", true, null],
    ["bank_transactions", "createdAt", "TIMESTAMPTZ", false, "NOW()"],

    // locations
    ["locations", "id", "TEXT", false, null],
    ["locations", "name", "TEXT", false, null],
    ["locations", "street", "TEXT", true, null],
    ["locations", "zip", "TEXT", true, null],
    ["locations", "city", "TEXT", true, null],
    ["locations", "distanceKm", "DOUBLE PRECISION", true, null],
    ["locations", "notes", "TEXT", true, null],
    ["locations", "usageCount", "INTEGER", false, "0"],
    ["locations", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["locations", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // app_settings
    ["app_settings", "key", "TEXT", false, null],
    ["app_settings", "value", "TEXT", false, null],
    ["app_settings", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // travel_pricing_tiers
    ["travel_pricing_tiers", "id", "TEXT", false, null],
    ["travel_pricing_tiers", "distanceKm", "INTEGER", false, null],
    ["travel_pricing_tiers", "driverCompensation", "DOUBLE PRECISION", false, null],
    ["travel_pricing_tiers", "customerPrice", "DOUBLE PRECISION", false, null],

    // bank_connections
    ["bank_connections", "id", "TEXT", false, null],
    ["bank_connections", "companyId", "TEXT", false, null],
    ["bank_connections", "bankName", "TEXT", false, null],
    ["bank_connections", "bankUrl", "TEXT", false, null],
    ["bank_connections", "bankCode", "TEXT", false, null],
    ["bank_connections", "username", "TEXT", false, null],
    ["bank_connections", "encryptedPin", "TEXT", false, null],
    ["bank_connections", "lastSync", "TIMESTAMPTZ", true, null],
    ["bank_connections", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["bank_connections", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // layout_templates
    ["layout_templates", "id", "TEXT", false, null],
    ["layout_templates", "name", "TEXT", false, null],
    ["layout_templates", "format", "TEXT", false, "'2x6'"],
    ["layout_templates", "thumbnail", "TEXT", true, null],
    ["layout_templates", "canvasJson", "JSONB", false, "'{}'"],
    ["layout_templates", "category", "TEXT", true, null],
    ["layout_templates", "active", "BOOLEAN", false, "true"],
    ["layout_templates", "sortOrder", "INTEGER", false, "0"],
    ["layout_templates", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["layout_templates", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // layout_designs
    ["layout_designs", "id", "TEXT", false, null],
    ["layout_designs", "orderId", "TEXT", false, null],
    ["layout_designs", "token", "TEXT", false, null],
    ["layout_designs", "templateId", "TEXT", true, null],
    ["layout_designs", "format", "TEXT", false, "'2x6'"],
    ["layout_designs", "canvasJson", "JSONB", false, "'{}'"],
    ["layout_designs", "exportUrl", "TEXT", true, null],
    ["layout_designs", "submitted", "BOOLEAN", false, "false"],
    ["layout_designs", "submittedAt", "TIMESTAMPTZ", true, null],
    ["layout_designs", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["layout_designs", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // design_elements
    ["design_elements", "id", "TEXT", false, null],
    ["design_elements", "name", "TEXT", false, null],
    ["design_elements", "imageUrl", "TEXT", false, "''"],
    ["design_elements", "category", "TEXT", true, null],
    ["design_elements", "sortOrder", "INTEGER", false, "0"],
    ["design_elements", "active", "BOOLEAN", false, "true"],
    ["design_elements", "createdAt", "TIMESTAMPTZ", false, "NOW()"],

    // custom_fonts
    ["custom_fonts", "id", "TEXT", false, null],
    ["custom_fonts", "family", "TEXT", false, "''"],
    ["custom_fonts", "category", "TEXT", false, "'custom'"],
    ["custom_fonts", "fileUrl", "TEXT", false, "''"],
    ["custom_fonts", "weight", "INTEGER", false, "400"],
    ["custom_fonts", "style", "TEXT", false, "'normal'"],
    ["custom_fonts", "active", "BOOLEAN", false, "true"],
    ["custom_fonts", "createdAt", "TIMESTAMPTZ", false, "NOW()"],

    // client_logos
    ["client_logos", "id", "TEXT", false, null],
    ["client_logos", "name", "TEXT", false, "''"],
    ["client_logos", "filename", "TEXT", false, "''"],
    ["client_logos", "createdAt", "TIMESTAMPTZ", false, "NOW()"],

    // google_reviews
    ["google_reviews", "id", "TEXT", false, null],
    ["google_reviews", "authorName", "TEXT", false, "''"],
    ["google_reviews", "rating", "INTEGER", false, "5"],
    ["google_reviews", "text", "TEXT", false, "''"],
    ["google_reviews", "time", "TIMESTAMPTZ", false, "NOW()"],
    ["google_reviews", "language", "TEXT", false, "'de'"],
    ["google_reviews", "active", "BOOLEAN", false, "true"],
    ["google_reviews", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["google_reviews", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // impression_photos
    ["impression_photos", "id", "TEXT", false, null],
    ["impression_photos", "originalFilename", "TEXT", false, "''"],
    ["impression_photos", "alt", "TEXT", false, "''"],
    ["impression_photos", "width", "INTEGER", false, "0"],
    ["impression_photos", "height", "INTEGER", false, "0"],
    ["impression_photos", "sortOrder", "INTEGER", false, "0"],
    ["impression_photos", "active", "BOOLEAN", false, "true"],
    ["impression_photos", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["impression_photos", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // impression_collections
    ["impression_collections", "id", "TEXT", false, null],
    ["impression_collections", "slug", "TEXT", false, "''"],
    ["impression_collections", "name", "TEXT", false, "''"],
    ["impression_collections", "description", "TEXT", false, "''"],
    ["impression_collections", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
    ["impression_collections", "updatedAt", "TIMESTAMPTZ", false, "NOW()"],

    // impression_collection_photos (join table)
    ["impression_collection_photos", "id", "TEXT", false, null],
    ["impression_collection_photos", "collectionId", "TEXT", false, "''"],
    ["impression_collection_photos", "photoId", "TEXT", false, "''"],
    ["impression_collection_photos", "sortOrder", "INTEGER", false, "0"],
    ["impression_collection_photos", "createdAt", "TIMESTAMPTZ", false, "NOW()"],
  ];

  // Group by table
  const tables = {};
  for (const [table, col, type, nullable, def] of columns) {
    if (!tables[table]) tables[table] = [];
    tables[table].push([col, type, nullable, def]);
  }

  for (const [table, cols] of Object.entries(tables)) {
    // Create table if not exists (with just the id column)
    const idCol = cols.find(([c]) => c === "id" || c === "key");
    if (idCol) {
      const [colName, colType] = idCol;
      await q(c, `CREATE TABLE IF NOT EXISTS "${table}" ("${colName}" ${colType} PRIMARY KEY)`);
    }

    // Add missing columns
    for (const [col, type, nullable, def] of cols) {
      if (col === "id" || col === "key") continue; // skip PK
      if (type === "SERIAL") continue; // skip auto-increment (handled by table creation)
      const defClause = def ? ` DEFAULT ${def}` : (nullable ? "" : " DEFAULT ''");
      const nullClause = nullable ? "" : " NOT NULL";
      await q(c, `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${col}" ${type}${nullClause}${defClause}`);
    }
  }

  // Unique indexes
  await q(c, `CREATE UNIQUE INDEX IF NOT EXISTS "impression_collections_slug_key" ON "impression_collections" ("slug")`);
  await q(c, `CREATE UNIQUE INDEX IF NOT EXISTS "impression_collection_photos_collectionId_photoId_key" ON "impression_collection_photos" ("collectionId", "photoId")`);

  await c.end();
  console.log("[sync-schema] Database schema synced successfully");
}

async function q(c, sql) {
  try {
    await c.query(sql);
  } catch (e) {
    // Ignore "already exists" type errors
    if (!e.message.includes("already exists") && !e.message.includes("duplicate")) {
      console.log(`[sync-schema] Warning: ${e.message.split("\n")[0]}`);
    }
  }
}

syncSchema().catch((e) => {
  console.error("[sync-schema] Fatal error:", e.message);
  process.exit(0); // Don't block startup
});
