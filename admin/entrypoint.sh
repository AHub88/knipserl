#!/bin/sh
set -e

echo "Starting knipserl admin..."

# Sync database schema (creates missing tables/columns)
npx prisma db push --skip-generate 2>&1 || echo "Schema sync skipped"

# Start the application
node server.js
