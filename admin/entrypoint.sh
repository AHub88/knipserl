#!/bin/sh
set -e

echo "Starting knipserl admin..."

# Sync database schema (creates missing tables/columns)
# Uses --schema directly to avoid needing tsx for prisma.config.ts
if [ -n "$DATABASE_URL" ]; then
  echo "Syncing database schema..."
  npx prisma db push --schema=prisma/schema.prisma --skip-generate --accept-data-loss 2>&1 || echo "Warning: Schema sync failed, continuing anyway"
fi

# Start the application
node server.js
