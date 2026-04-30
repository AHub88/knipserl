/**
 * Zentrales HTML-Email-Layout für alle ausgehenden Mails.
 *
 * Design-Vorgaben:
 *  - 600px max-width, zentriert (NICHT full-width)
 *  - Knipserl-Brand-Banner (Orange #F6A11C) oben
 *  - Weiße Content-Box mit weichem Schatten und Border-Radius
 *  - Grauer Footer
 *  - Inline-Styles only (E-Mail-Clients ignorieren oft <style>-Tags)
 *  - Web-Safe-Fonts mit System-Stack-Fallback
 *
 * Verwendet von:
 *  - lib/inquiry-email.ts        (Anfrage-Bestätigung/-Absage)
 *  - lib/email-templates.ts      (Angebote, Rechnungen, Bestätigungen, Fahrer-Reminder)
 *
 * Bei Layout-Anpassungen: hier ändern, alle Templates ziehen automatisch nach.
 */

const BRAND_COLOR = "#F6A11C";

export function emailLayout({
  preheader,
  preheaderSub,
  bodyHtml,
  footerText,
}: {
  /** Großer Text im orange Brand-Banner (z.B. "Angebot 2026-001" oder "Knipserl Fotobox"). */
  preheader: string;
  /** Optional: kleine Zeile unter preheader (z.B. Firmenname unter Dokument-Titel). */
  preheaderSub?: string;
  /** Vorgefertigtes HTML für den weißen Inhalts-Bereich (escapen wo nötig). */
  bodyHtml: string;
  /** Optional: Footer-Text (Firma, Rechtshinweis). Bei `undefined` kein Footer. */
  footerText?: string;
}): string {
  const sublineHtml = preheaderSub
    ? `<p style="margin:4px 0 0;font-size:13px;line-height:1.4;color:rgba(0,0,0,0.65);font-weight:500;">${preheaderSub}</p>`
    : "";

  const footerHtml = footerText
    ? `<div style="padding:14px 30px;background:#fafafa;border-top:1px solid #ececec;text-align:center;font-size:11px;line-height:1.5;color:#999;">${footerText}</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#333;-webkit-font-smoothing:antialiased;">
  <div style="background:#f5f5f5;padding:24px 16px;">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06),0 4px 12px rgba(0,0,0,0.04);">
      <div style="background:${BRAND_COLOR};padding:22px 30px;">
        <h1 style="margin:0;font-size:19px;font-weight:700;line-height:1.25;color:#1a1a1a;letter-spacing:-0.01em;">${preheader}</h1>
        ${sublineHtml}
      </div>
      <div style="padding:28px 30px;font-size:15px;line-height:1.65;color:#333;">
        ${bodyHtml}
      </div>
      ${footerHtml}
    </div>
  </div>
</body>
</html>`;
}

export const EMAIL_BRAND_COLOR = BRAND_COLOR;
