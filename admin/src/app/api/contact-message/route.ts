import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";

// POST /api/contact-message
// Kontaktformular-Anfragen — nur E-Mail-Versand, kein DB-Eintrag.
// Aufgerufen von webseite/api/anfrage bei source=kontakt.

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().optional(),
  company: z.string().optional(),
  message: z.string().optional(),
});

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function getRecipient(): Promise<string> {
  try {
    const s = await prisma.appSetting.findUnique({ where: { key: "mail_to" } });
    if (s?.value) return s.value;
  } catch { /* ignore */ }
  return process.env.MAIL_TO || "info@knipserl.de";
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    const esc = escapeHtml;

    const to = await getRecipient();
    const subject = `Neue Kontaktanfrage – ${data.name}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
        <div style="background:#F3A300;color:#1a171b;padding:20px;border-radius:8px 8px 0 0">
          <h1 style="margin:0;font-size:22px">Neue Kontaktanfrage über knipserl.de</h1>
          <p style="margin:5px 0 0;font-size:13px;opacity:0.85">Über das Kontaktformular</p>
        </div>
        <div style="background:#fafaf9;padding:24px;border:1px solid #e7e5e4">
          <h2 style="margin:0 0 12px;color:#1a171b">Kontaktdaten</h2>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr><td style="padding:6px 12px 6px 0;color:#78716c">Name:</td><td style="padding:6px 0"><strong>${esc(data.name)}</strong></td></tr>
            ${data.company ? `<tr><td style="padding:6px 12px 6px 0;color:#78716c">Firma:</td><td style="padding:6px 0">${esc(data.company)}</td></tr>` : ""}
            <tr><td style="padding:6px 12px 6px 0;color:#78716c">E-Mail:</td><td style="padding:6px 0"><a href="mailto:${esc(data.email)}">${esc(data.email || "—")}</a></td></tr>
            <tr><td style="padding:6px 12px 6px 0;color:#78716c">Telefon:</td><td style="padding:6px 0"><a href="tel:${esc(data.phone || "")}">${esc(data.phone || "—")}</a></td></tr>
          </table>
          ${data.message ? `<h2 style="margin:20px 0 12px;color:#1a171b">Nachricht</h2><div style="background:#fff;padding:12px;border:1px solid #e7e5e4;white-space:pre-wrap">${esc(data.message)}</div>` : ""}
        </div>
        <div style="padding:12px;text-align:center;color:#a8a29e;font-size:12px">
          Automatisch versendet · Kontaktanfragen werden nicht in der Datenbank gespeichert
        </div>
      </div>
    `;

    await sendEmail({ to, subject, html });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }
    console.error("[contact-message]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Versand fehlgeschlagen" },
      { status: 500 }
    );
  }
}
