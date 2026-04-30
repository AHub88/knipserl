/**
 * Shared helpers für alle konfigurierbaren E-Mail-Templates (Anfrage-Bestätigung,
 * Anfrage-Absage, Fahrer-Erinnerung).
 *
 * Used by:
 *  - api/inquiries/[id]/route.ts        (real send, customer values)
 *  - lib/driver-reminders.ts            (real send, fahrer values)
 *  - api/settings/email-templates/test  (test send, sample values)
 *  - settings/email-templates editor    (live preview, sample values)
 *
 * Wrap + Variablen-Helper hier zentral, damit alle Stellen synchron bleiben.
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

export const DRIVER_REMINDER_VARIABLES = [
  "driverName",
  "leadText",
  "companyName",
  "customerName",
  "customerPhone",
  "eventType",
  "eventDate",
  "locationName",
  "locationAddress",
  "setupInfo",
  "teardownInfo",
  "onSiteContact",
  "notes",
  "orderUrl",
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

function leadDaysToText(leadDays: number): string {
  if (leadDays <= 0) return "heute";
  if (leadDays === 1) return "morgen";
  return `in ${leadDays} Tagen`;
}

function formatDateShortDe(d: Date): string {
  return d.toLocaleDateString("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDateLongDe(d: Date): string {
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export interface DriverReminderInput {
  driverName: string;
  leadDays: number;
  companyName: string;
  customerName: string;
  customerPhone?: string | null;
  eventType: string;
  eventDate: Date;
  locationName: string;
  locationAddress: string;
  setupDate?: Date | null;
  setupTime?: string | null;
  teardownDate?: Date | null;
  teardownTime?: string | null;
  onSiteContactName?: string | null;
  onSiteContactPhone?: string | null;
  onSiteContactNotes?: string | null;
  notes?: string | null;
  orderDetailUrl?: string | null;
}

/** Baut die Variablen-Map für den Fahrer-Reminder aus rohen Order-Daten. */
export function buildDriverReminderVars(d: DriverReminderInput): Record<string, string> {
  const setupInfo = d.setupDate
    ? `${formatDateShortDe(d.setupDate)}${d.setupTime ? ` · ${d.setupTime}` : ""}`
    : d.setupTime ?? "—";
  const teardownInfo = d.teardownDate
    ? `${formatDateShortDe(d.teardownDate)}${d.teardownTime ? ` · ${d.teardownTime}` : ""}`
    : d.teardownTime ?? "—";

  const contactBits: string[] = [];
  if (d.onSiteContactName) contactBits.push(d.onSiteContactName);
  if (d.onSiteContactPhone) contactBits.push(`Tel.: ${d.onSiteContactPhone}`);
  let onSiteContact = contactBits.join(" · ");
  if (d.onSiteContactNotes) onSiteContact += (onSiteContact ? " — " : "") + d.onSiteContactNotes;

  return {
    driverName: d.driverName,
    leadText: leadDaysToText(d.leadDays),
    companyName: d.companyName,
    customerName: d.customerName,
    customerPhone: d.customerPhone ?? "",
    eventType: d.eventType,
    eventDate: formatDateLongDe(d.eventDate),
    locationName: d.locationName,
    locationAddress: d.locationAddress,
    setupInfo,
    teardownInfo,
    onSiteContact,
    notes: d.notes ?? "",
    orderUrl: d.orderDetailUrl ?? "",
  };
}

export function getSampleDriverReminderVars(): Record<string, string> {
  const eventDate = new Date(Date.now() + 3 * 86400000);
  return buildDriverReminderVars({
    driverName: "Johann",
    leadDays: 3,
    companyName: "Knipserl Fotobox",
    customerName: "Maria Müller",
    customerPhone: "+49 89 12345678",
    eventType: "Hochzeit",
    eventDate,
    locationName: "Veranstaltungssaal Fendlhof",
    locationAddress: "Ob. Tiefenbachstraße 8a, 83734 Hausham",
    setupDate: eventDate,
    setupTime: "14:00 Uhr",
    teardownDate: new Date(eventDate.getTime() + 86400000),
    teardownTime: "01:00 Uhr",
    onSiteContactName: "Tobias Maron",
    onSiteContactPhone: "+49 89 87654321",
    onSiteContactNotes: "Trauzeuge, vor Ort ab 13 Uhr",
    notes: "Bitte vor 14 Uhr aufbauen — Fotobox in der Nähe vom Buffet.",
    orderDetailUrl: "https://admin.knipserl.de/orders/sample-id",
  });
}

/** Wählt das passende Sample-Variable-Set für einen Template-Key. */
export function getSampleVarsFor(templateKey: string): Record<string, string> {
  if (templateKey === "email_template_driver_reminder") {
    return getSampleDriverReminderVars();
  }
  return getSampleInquiryVars();
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
    subject: "Deine Anfrage ist bestätigt – {{companyName}}",
    body: `Hallo {{customerName}},

<strong>vielen Dank für deine Anfrage!</strong> Wir freuen uns, dir deinen Termin bestätigen zu können.

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

<strong>Event:</strong> {{eventType}}
<strong>Datum:</strong> {{eventDate}}
<strong>Location:</strong> {{locationName}}

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

Wir melden uns zeitnah mit allen weiteren Details bei dir.

Bei Rückfragen sind wir jederzeit unter <a href="mailto:info@knipserl.de" style="color:#F6A11C;text-decoration:none;">info@knipserl.de</a> erreichbar.

Liebe Grüße
<strong>{{companyName}}</strong>`,
  },
  email_template_inquiry_rejected: {
    subject: "Deine Anfrage – {{companyName}}",
    body: `Hallo {{customerName}},

vielen Dank für deine Anfrage. <strong>Leider</strong> müssen wir dir mitteilen, dass wir den gewünschten Termin nicht wahrnehmen können.

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

<strong>Event:</strong> {{eventType}}
<strong>Datum:</strong> {{eventDate}}

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

Vielleicht klappt es bei einem anderen Termin — schreib uns gerne unter <a href="mailto:info@knipserl.de" style="color:#F6A11C;text-decoration:none;">info@knipserl.de</a>.

Liebe Grüße
<strong>{{companyName}}</strong>`,
  },
  email_template_driver_reminder: {
    subject: "Reminder: {{customerName}} {{leadText}} – {{companyName}}",
    body: `Hallo {{driverName}},

kleiner Reminder — <strong>{{leadText}}</strong> hast du folgenden Auftrag:

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

<strong>Kunde:</strong> {{customerName}}
<strong>Tel.:</strong> {{customerPhone}}
<strong>Art:</strong> {{eventType}}
<strong>Datum:</strong> {{eventDate}}

<strong>Aufbau:</strong> {{setupInfo}}
<strong>Abbau:</strong> {{teardownInfo}}

<strong>Ort:</strong> {{locationName}}
{{locationAddress}}

<strong>Vor Ort:</strong> {{onSiteContact}}

<strong>Notiz:</strong> {{notes}}

<hr style="border:none;border-top:1px solid #eaeaea;margin:20px 0;">

<a href="{{orderUrl}}" style="display:inline-block;background:#F6A11C;color:#1a1a1a;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:700;">Auftrag ansehen</a>

Liebe Grüße
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
