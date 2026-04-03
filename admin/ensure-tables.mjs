// Ensures all required tables exist before the app starts.
// Uses pg directly to avoid needing tsx/prisma CLI.
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.log("No DATABASE_URL, skipping table check.");
  process.exit(0);
}

const client = new pg.Client({ connectionString: url });

try {
  await client.connect();

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

  // Add foreign key only if it doesn't exist yet
  await client.query(`
    DO $$ BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'vacations_driverId_fkey'
      ) THEN
        ALTER TABLE "vacations"
          ADD CONSTRAINT "vacations_driverId_fkey"
          FOREIGN KEY ("driverId") REFERENCES "users"("id")
          ON DELETE RESTRICT ON UPDATE CASCADE;
      END IF;
    END $$;
  `);

  console.log("Database tables verified.");
} catch (err) {
  console.log("Warning: table check failed:", err.message);
} finally {
  await client.end();
}
