#!/bin/sh
set -e

# Run Prisma migrations
npx prisma migrate deploy 2>/dev/null || echo "No migrations to run"

# Start the application
node server.js
