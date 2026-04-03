#!/bin/sh
set -e

echo "Starting knipserl admin..."

# Ensure all database tables exist
node ensure-tables.mjs

# Start the application
node server.js
