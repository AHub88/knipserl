/**
 * Zentrales HTML-Email-Layout für alle ausgehenden Mails.
 *
 * Design:
 *  - 600px max-width, zentriert (NICHT full-width)
 *  - Knipserl-Logo oben auf weißem Grund (knipserl-logo.png)
 *  - Dünne orange Akzentlinie als Brand-Trennung
 *  - Optionaler Title (H1 + Subline) für Mails mit Dokument-Charakter (Rechnung, Angebot)
 *  - Body unterstützt HTML (Bold, Links, Listen, etc.)
 *  - Footer mit Firmenname, Kontakt, optional Rechtshinweis
 *  - Inline-Styles only (E-Mail-Clients strippen oft <style>-Tags)
 *  - Web-Safe-Fonts mit System-Stack-Fallback
 *
 * Verwendet von:
 *  - lib/inquiry-email.ts        (Anfrage-Bestätigung/-Absage)
 *  - lib/email-templates.ts      (Angebote, Rechnungen, Bestätigungen, Fahrer-Reminder)
 *
 * Bei Layout-Anpassungen: hier ändern, alle Templates ziehen automatisch nach.
 */

const BRAND_COLOR = "#F6A11C";

// Logo muss von der Mail-App des Empfängers ladbar sein → öffentliche URL.
// In Production ist das https://admin.knipserl.de/knipserl-logo.png.
// Override via EMAIL_LOGO_URL falls man sie auf eine CDN umziehen will.
const APP_URL =
  process.env.EMAIL_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "https://admin.knipserl.de";
const LOGO_URL = process.env.EMAIL_LOGO_URL || `${APP_URL}/knipserl-logo.png`;

export function emailLayout({
  preheader,
  preheaderSub,
  bodyHtml,
  footerText,
}: {
  /** Optional: H1 unter dem Logo (z.B. "Angebot 2026-001"). Bei Inquiry-Mails leer lassen. */
  preheader?: string;
  /** Optional: kleine Zeile unter preheader (z.B. Firmenname unter Dokument-Titel). */
  preheaderSub?: string;
  /** HTML für den weißen Inhalts-Bereich. Variablen-Werte vorher escapen. */
  bodyHtml: string;
  /** Optional: Footer-Text. `undefined` = kein Footer. */
  footerText?: string;
}): string {
  const titleBlock = preheader
    ? `<div style="padding:8px 30px 0;">
        <h1 style="margin:0;font-size:20px;font-weight:700;line-height:1.3;color:#1a1a1a;letter-spacing:-0.01em;">${preheader}</h1>
        ${preheaderSub ? `<p style="margin:6px 0 0;font-size:13px;color:#888;font-weight:500;">${preheaderSub}</p>` : ""}
      </div>`
    : "";

  const footerHtml = footerText
    ? `<div style="padding:18px 30px;background:#fafafa;border-top:1px solid #ececec;text-align:center;font-size:12px;line-height:1.5;color:#999;">${footerText}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Knipserl Fotobox</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#333;-webkit-font-smoothing:antialiased;">
  <div style="background:#f5f5f5;padding:24px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04);">
      <div style="padding:32px 30px 20px;text-align:center;">
        <img src="${LOGO_URL}" alt="Knipserl Fotobox" height="48" style="display:inline-block;height:48px;width:auto;border:0;outline:none;text-decoration:none;" />
      </div>
      <div style="height:3px;background:${BRAND_COLOR};margin:0 30px;border-radius:2px;"></div>
      ${titleBlock}
      <div style="padding:${preheader ? "20px" : "28px"} 30px 32px;font-size:15px;line-height:1.65;color:#3a3a3a;">
        ${bodyHtml}
      </div>
      ${footerHtml}
    </div>
    <div style="max-width:600px;margin:14px auto 0;text-align:center;font-size:11px;color:#bbb;">
      Diese E-Mail wurde automatisch versendet.
    </div>
  </div>
</body>
</html>`;
}

export const EMAIL_BRAND_COLOR = BRAND_COLOR;
