#!/bin/sh
# Run this script once to ensure all tables exist in the database.
# Usage: docker exec knipserl-admin-dev sh /app/setup-db.sh

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL not set"
  exit 1
fi

echo "Ensuring all tables exist..."

# Install pg client if not present
apk add --no-cache postgresql-client > /dev/null 2>&1 || true

psql "$DATABASE_URL" <<'SQL'
-- Create vacations table if it doesn't exist
CREATE TABLE IF NOT EXISTS "vacations" (
  "id" TEXT NOT NULL,
  "driverId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'ABSENT',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "vacations_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "vacations_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

SELECT 'vacations table: OK' AS status;
SQL

echo "Done."
