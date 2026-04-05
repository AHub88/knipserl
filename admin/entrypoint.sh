#!/bin/sh
echo "Starting knipserl admin..."

# Ensure all database tables exist (never blocks startup)
node ensure-tables.cjs || echo "[entrypoint] Table check had issues, continuing..."

# Start the application
exec node server.js
# 2026-04-05T05:26:42Z
# 2026-04-05T11:54:26Z
