import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

// POST /api/settings/test-email
// Body: { to?: string } — sendet eine Test-Mail an die angegebene Adresse
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  if (!(await isEmailConfigured())) {
    return NextResponse.json(
      { error: "E-Mail nicht konfiguriert. Bitte Tenant-ID, Client-ID und Client-Secret speichern." },
      { status: 400 }
    );
  }

  let to = "";
  try {
    const body = await request.json().catch(() => ({}));
    to = typeof body?.to === "string" ? body.to.trim() : "";
  } catch { /* ignore */ }

  if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return NextResponse.json({ error: "Gültige Empfänger-Adresse erforderlich" }, { status: 400 });
  }

  try {
    await sendEmail({
      to,
      subject: "Test-E-Mail · Knipserl Admin",
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#fafaf9;border:1px solid #e7e5e4;border-radius:8px">
          <h1 style="color:#1a171b;margin:0 0 12px;font-size:20px">Test-E-Mail erfolgreich versendet</h1>
          <p style="color:#555;font-size:14px;line-height:1.6">
            Diese Nachricht wurde aus dem Knipserl Admin-Tool verschickt und bestätigt, dass die
            Microsoft-Graph-Credentials korrekt konfiguriert sind.
          </p>
          <p style="color:#888;font-size:12px;margin-top:24px">Zeitpunkt: ${new Date().toLocaleString("de-DE")}</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true, sentTo: to });
  } catch (error) {
    console.error("[test-email]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Versand fehlgeschlagen" },
      { status: 500 }
    );
  }
}
