#!/bin/sh
echo "Starting knipserl admin..."

# Sync database schema with Prisma schema (adds missing columns/tables)
npx prisma db push --skip-generate --accept-data-loss 2>&1 || echo "[entrypoint] db push had issues, continuing..."

# Start the application
exec node server.js
