#!/bin/sh
echo "Starting knipserl admin..."

# Sync database schema (add missing tables/columns)
node sync-schema.cjs

# Start the application
exec node server.js
