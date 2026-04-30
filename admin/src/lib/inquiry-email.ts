/**
 * Shared helpers for the inquiry-confirmation / -rejection email flow.
 *
 * Used by:
 *  - api/inquiries/[id]/route.ts        (real send, customer values)
 *  - api/settings/email-templates/test  (test send, sample values)
 *  - settings/email-templates editor    (live preview, sample values)
 *
 * Keep wrap + variable list in sync across all three by importing from here.
 */

import { emailLayout } from "./email-layout";

export const INQUIRY_EMAIL_VARIABLES = [
  "customerName",
  "customerEmail",
  "eventType",
  "eventDate",
  "locationName",
  "companyName",
] as const;

export function getSampleInquiryVars(): Record<string, string> {
  const sampleDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  return {
    customerName: "Maria Müller",
    customerEmail: "maria.mueller@example.com",
    eventType: "Hochzeit",
    eventDate: sampleDate.toLocaleDateString("de-DE", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    locationName: "Veranstaltungssaal Fendlhof",
    companyName: "Knipserl Fotobox",
  };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Plain substitution — keine Escape. Für Subject (Plain-Text-Feld in Graph API).
 */
export function replaceInquiryVars(
  text: string,
  vars: Record<string, string>,
): string {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v),
    text,
  );
}

/**
 * Substitution mit HTML-Escape der Werte.
 * Template-Body (admin-getippt, vertrauenswürdig) bleibt as-is — Tags wie
 * `<strong>`, `<a>`, `<ul>` rendern. Eingesetzte Variablen-Werte (Kunde,
 * Location, …) werden escaped — schützt vor `<` oder `&` im Kundennamen.
 */
export function replaceInquiryVarsHtml(
  text: string,
  vars: Record<string, string>,
): string {
  return Object.entries(vars).reduce(
    (acc, [k, v]) => acc.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), escapeHtml(v)),
    text,
  );
}

/**
 * Konvertiert reine Zeilenumbrüche zu `<br>` — `white-space:pre-line` wird von
 * vielen Mail-Clients (insb. Outlook desktop / Word-Renderer) ignoriert,
 * `<br>` rendert aber wirklich überall. Die Preview im Browser sieht damit
 * identisch aus zur tatsächlich versendeten Mail.
 *
 * Bonus: räumt redundante `<br>`s rund um `<hr>` weg, damit ein im Source
 * sauber mit Leerzeilen geschriebener Trenner nicht doppelte Abstände kriegt.
 */
function nl2br(html: string): string {
  let out = html.replace(/\r?\n/g, "<br>\n");
  // <hr> hat eigenen vertikalen Margin — angrenzende <br>s wegwerfen
  out = out.replace(/(?:<br\s*\/?>\s*\n?\s*)+(<hr\b[^>]*>)/gi, "$1");
  out = out.replace(/(<hr\b[^>]*>)(?:\s*\n?\s*<br\s*\/?>)+/gi, "$1\n");
  return out;
}

/**
 * Default-Template-Bodies mit HTML-Formatierung. Wird verwendet als Fallback
 * wenn nichts in `app_settings` gespeichert ist, und als Quelle für die
 * Default-Anzeige im Editor.
 */
export const DEFAULT_INQUIRY_TEMPLATES: Record<
  string,
  { subject: string; body: string }
> = {
  email_template_inquiry_accepted: {
    subject: "Ihre Anfrage wurde bestätigt – {{companyName}}",
    body: `Hallo {{customerName}},

<strong>vielen Dank für Ihre Anfrage!</strong> Wir freuen uns, Ihnen Ihren Termin bestätigen zu können.

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

<strong>Event:</strong> {{eventType}}
<strong>Datum:</strong> {{eventDate}}
<strong>Location:</strong> {{locationName}}

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

Wir melden uns zeitnah mit allen weiteren Details bei Ihnen.

Bei Rückfragen sind wir jederzeit unter <a href="mailto:info@knipserl.de" style="color:#F6A11C;text-decoration:none;">info@knipserl.de</a> erreichbar.

Freundliche Grüße
<strong>{{companyName}}</strong>`,
  },
  email_template_inquiry_rejected: {
    subject: "Ihre Anfrage – {{companyName}}",
    body: `Hallo {{customerName}},

vielen Dank für Ihre Anfrage. <strong>Leider</strong> müssen wir Ihnen mitteilen, dass wir den gewünschten Termin nicht wahrnehmen können.

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

<strong>Event:</strong> {{eventType}}
<strong>Datum:</strong> {{eventDate}}

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

Vielleicht klappt es bei einem anderen Termin — schreiben Sie uns gerne unter <a href="mailto:info@knipserl.de" style="color:#F6A11C;text-decoration:none;">info@knipserl.de</a>.

Freundliche Grüße
<strong>{{companyName}}</strong>`,
  },
};

/**
 * Wraps the (already variable-substituted, HTML-allowed) body in the shared
 * email-layout. `bodyHtml` darf HTML enthalten — Zeilenumbrüche werden zu
 * `<br>` konvertiert für maximale Mail-Client-Kompatibilität.
 */
export function wrapInquiryEmailHtml(
  bodyHtml: string,
  opts?: { companyName?: string },
): string {
  const company = opts?.companyName?.trim() || "Knipserl Fotobox";
  // Klasse "force-light-text" greift in Dark-Mode-Clients via !important-Override.
  // Color hier nicht inline setzen — sonst überschreibt die inline-Spec die Class-Rule.
  const inner = `<div class="force-light-text" style="font-size:15px;line-height:1.65;">${nl2br(bodyHtml)}</div>`;
  return emailLayout({
    bodyHtml: inner,
    footerText: `${company} &middot; <a href="mailto:info@knipserl.de" style="color:#999999;text-decoration:none;" class="force-muted-text">info@knipserl.de</a> &middot; <a href="https://www.knipserl.de" style="color:#999999;text-decoration:none;" class="force-muted-text">knipserl.de</a>`,
  });
}
