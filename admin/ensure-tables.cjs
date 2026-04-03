// Ensures all required database tables exist before the app starts.
// Uses pg directly (CommonJS) - no prisma CLI, no tsx needed.
"use strict";

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

    // Check what tables exist
    const res = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename"
    );
    const tables = res.rows.map(r => r.tablename);
    console.log("[ensure-tables] Existing tables:", tables.join(", "));

    if (!tables.includes("vacations")) {
      console.log("[ensure-tables] Creating vacations table...");
      await client.query(`
        CREATE TABLE "vacations" (
          "id" TEXT NOT NULL,
          "driverId" TEXT NOT NULL,
          "type" TEXT NOT NULL DEFAULT 'ABSENT',
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
      console.log("[ensure-tables] vacations table already exists.");
    }

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
