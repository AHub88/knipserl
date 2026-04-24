/**
 * Cron-Trigger für Fahrer-Erinnerungen. Extern per HTTP aufrufen, z.B.
 * via crontab auf dem Host:
 *   0 8 * * *  curl -s -X POST -H "Authorization: Bearer $CRON_SECRET" https://admin.example.de/api/cron/driver-reminders
 *
 * Bevorzugt einmal pro Tag (morgens) — Vorlauf ist in Tagen konfiguriert.
 * Mehrfach-Aufruf am selben Tag ist safe (idempotent via `driverReminderSentAt`).
 */

import { NextRequest, NextResponse } from "next/server";
import { runDriverReminders } from "@/lib/driver-reminders";

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET nicht gesetzt" },
      { status: 503 },
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const provided = authHeader.replace(/^Bearer\s+/i, "");
  if (provided !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDriverReminders();
  return NextResponse.json(result);
}
