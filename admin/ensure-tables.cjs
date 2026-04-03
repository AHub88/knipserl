// Ensures all required database tables exist before the app starts.
// Uses pg directly (CommonJS) - no prisma CLI, no tsx needed.
"use strict";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[ensure-tables] No DATABASE_URL, skipping.");
    return;
  }

  let pg;
  try {
    pg = require("pg");
  } catch (e) {
    console.log("[ensure-tables] pg module not found, skipping:", e.message);
    return;
  }

  const client = new pg.Client({ connectionString: url });

  try {
    await client.connect();
    console.log("[ensure-tables] Connected to database.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS "vacations" (
        "id" TEXT NOT NULL,
        "driverId" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'ABSENT',
        "startDate" TIMESTAMP(3) NOT NULL,
        "endDate" TIMESTAMP(3) NOT NULL,
        "note" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "vacations_pkey" PRIMARY KEY ("id")
      );
    `);

    // Add foreign key only if missing
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints
          WHERE constraint_name = 'vacations_driverId_fkey'
            AND table_name = 'vacations'
        ) THEN
          ALTER TABLE "vacations"
            ADD CONSTRAINT "vacations_driverId_fkey"
            FOREIGN KEY ("driverId") REFERENCES "users"("id")
            ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
      END $$;
    `);

    console.log("[ensure-tables] All tables verified.");
  } catch (err) {
    console.log("[ensure-tables] Warning:", err.message);
  } finally {
    try { await client.end(); } catch (_) {}
  }
}

main().catch((err) => {
  console.log("[ensure-tables] Unexpected error:", err.message);
});
