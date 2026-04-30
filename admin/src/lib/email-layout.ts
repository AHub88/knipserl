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
  const titleRow = preheader
    ? `<tr>
        <td style="padding:8px 30px 0;background:#ffffff;" bgcolor="#ffffff">
          <h1 style="margin:0;font-size:20px;font-weight:700;line-height:1.3;color:#1a1a1a;letter-spacing:-0.01em;">${preheader}</h1>
          ${preheaderSub ? `<p style="margin:6px 0 0;font-size:13px;color:#888888;font-weight:500;">${preheaderSub}</p>` : ""}
        </td>
      </tr>`
    : "";

  const footerRow = footerText
    ? `<tr>
        <td style="padding:18px 30px;background:#fafafa;border-top:1px solid #ececec;text-align:center;font-size:12px;line-height:1.5;color:#999999;" bgcolor="#fafafa" align="center">
          ${footerText}
        </td>
      </tr>`
    : "";

  // Tables + bgcolor attrs sind robuster gegen aggressive Dark-Mode-Overrides
  // (Gmail Mobile, Outlook 365 usw.) als reines CSS background. Meta-Tags +
  // [data-ogsc]-Selektoren zwingen Light-Mode in den Clients, die das respektieren.
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" style="color-scheme:light only;supported-color-schemes:light;">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light only" />
  <meta name="supported-color-schemes" content="light" />
  <title>Knipserl Fotobox</title>
  <style type="text/css">
    :root { color-scheme: light only; supported-color-schemes: light; }
    body { margin:0 !important; padding:0 !important; width:100% !important; -webkit-font-smoothing:antialiased; }
    table { border-collapse:collapse !important; }
    img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; display:block; }
    /* Outlook 365 / Outlook.com dark mode → erzwinge Light */
    [data-ogsc] .force-light-bg { background-color:#ffffff !important; }
    [data-ogsc] .force-page-bg { background-color:#f5f5f5 !important; }
    [data-ogsc] .force-light-text { color:#3a3a3a !important; }
    [data-ogsc] .force-muted-text { color:#999999 !important; }
    [data-ogsc] .force-title-text { color:#1a1a1a !important; }
    /* Apple Mail / Mobile dark mode → ebenfalls Light erzwingen */
    @media (prefers-color-scheme: dark) {
      .force-light-bg { background-color:#ffffff !important; }
      .force-page-bg { background-color:#f5f5f5 !important; }
      .force-light-text { color:#3a3a3a !important; }
      .force-muted-text { color:#999999 !important; }
      .force-title-text { color:#1a1a1a !important; }
    }
  </style>
</head>
<body bgcolor="#f5f5f5" style="margin:0;padding:0;background-color:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#333333;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f5f5f5" class="force-page-bg" style="background-color:#f5f5f5;">
    <tr>
      <td align="center" style="padding:24px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" class="force-light-bg" style="max-width:600px;background-color:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06),0 8px 24px rgba(0,0,0,0.04);">
          <tr>
            <td align="center" bgcolor="#ffffff" style="padding:32px 30px 20px;background-color:#ffffff;" class="force-light-bg">
              <img src="${LOGO_URL}" alt="Knipserl Fotobox" height="48" width="160" style="display:inline-block;height:48px;width:auto;border:0;outline:none;text-decoration:none;" />
            </td>
          </tr>
          <tr>
            <td bgcolor="#ffffff" class="force-light-bg" style="background-color:#ffffff;padding:0 30px;line-height:0;font-size:0;">
              <div style="height:3px;background-color:${BRAND_COLOR};border-radius:2px;line-height:3px;font-size:0;">&nbsp;</div>
            </td>
          </tr>
          ${titleRow}
          <tr>
            <td bgcolor="#ffffff" class="force-light-bg force-light-text" style="padding:${preheader ? "20px" : "28px"} 30px 32px;background-color:#ffffff;font-size:15px;line-height:1.65;color:#3a3a3a;">
              ${bodyHtml}
            </td>
          </tr>
          ${footerRow}
        </table>
        <div class="force-muted-text" style="max-width:600px;margin:14px auto 0;text-align:center;font-size:11px;color:#bbbbbb;">
          Diese E-Mail wurde automatisch versendet.
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const EMAIL_BRAND_COLOR = BRAND_COLOR;
