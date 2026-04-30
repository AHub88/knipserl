/**
 * HTML email templates for quotes, invoices, and order confirmations.
 *
 * Visuelles Grund-Layout (Brand-Banner, Content-Box, Footer) liegt zentral
 * in `lib/email-layout.ts` — hier nur die spezifischen Inhalte pro Mail-Typ.
 */

import { emailLayout, EMAIL_BRAND_COLOR } from "./email-layout";

const BRAND_COLOR = EMAIL_BRAND_COLOR;

function layout(title: string, body: string, companyName: string): string {
  return emailLayout({
    preheader: title,
    preheaderSub: companyName,
    bodyHtml: body,
    footerText: `${companyName} &middot; Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.`,
  });
}

type LineItem = {
  title?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  optional?: boolean;
};

function formatAmount(v: number): string {
  return v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function itemsTable(items: LineItem[]): string {
  const rows = items.map((item, i) => {
    const label = item.title || item.description || "";
    const desc = item.title && item.description ? `<br/><span style="font-size:12px;color:#888;">${item.description}</span>` : "";
    const optBadge = item.optional ? ' <span style="font-size:10px;background:#f0f0f0;color:#999;padding:1px 5px;border-radius:3px;">optional</span>' : "";
    const style = item.optional ? "color:#999;font-style:italic;" : "";
    return `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;${style}">${i + 1}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;${style}">${label}${optBadge}${desc}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;${style}">${item.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;${style}">${formatAmount(item.unitPrice)}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;font-weight:600;${style}">${formatAmount(item.total)}</td>
    </tr>`;
  }).join("");

  return `
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <thead>
        <tr style="background:#f9f9f9;">
          <th style="padding:8px;text-align:center;font-size:11px;color:#666;border-bottom:2px solid #ddd;width:30px;">Pos</th>
          <th style="padding:8px;text-align:left;font-size:11px;color:#666;border-bottom:2px solid #ddd;">Beschreibung</th>
          <th style="padding:8px;text-align:center;font-size:11px;color:#666;border-bottom:2px solid #ddd;width:50px;">Menge</th>
          <th style="padding:8px;text-align:right;font-size:11px;color:#666;border-bottom:2px solid #ddd;width:90px;">Einzelpreis</th>
          <th style="padding:8px;text-align:right;font-size:11px;color:#666;border-bottom:2px solid #ddd;width:90px;">Gesamt</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;
}

export function quoteEmail(data: {
  recipientName: string;
  quoteNumber: string;
  companyName: string;
  items: LineItem[];
  totalAmount: number;
  validUntil: Date;
  deliveryDate?: Date | null;
  notes?: string | null;
  pdfUrl?: string;
}): { subject: string; html: string } {
  const body = `
    <p style="font-size:15px;color:#333;">Hallo ${data.recipientName},</p>
    <p style="color:#555;">vielen Dank für deine Anfrage. Anbei dein Angebot <strong>${data.quoteNumber}</strong>.</p>
    ${itemsTable(data.items)}
    <div style="text-align:right;margin:8px 0 20px;">
      <span style="font-size:18px;font-weight:700;color:${BRAND_COLOR};">${formatAmount(data.totalAmount)}</span>
    </div>
    <p style="font-size:13px;color:#888;">Gültig bis: ${formatDate(data.validUntil)}</p>
    ${data.deliveryDate ? `<p style="font-size:13px;color:#888;">Lieferdatum: ${formatDate(data.deliveryDate)}</p>` : ""}
    ${data.notes ? `<p style="font-size:13px;color:#666;background:#f9f9f9;padding:12px;border-radius:6px;">${data.notes}</p>` : ""}
    <p style="color:#555;margin-top:24px;">Bei Fragen melde dich gerne jederzeit.</p>
    <p style="color:#555;">Liebe Grüße<br/><strong>${data.companyName}</strong></p>
  `;

  return {
    subject: `Angebot ${data.quoteNumber} – ${data.companyName}`,
    html: layout(`Angebot ${data.quoteNumber}`, body, data.companyName),
  };
}

export function invoiceEmail(data: {
  recipientName: string;
  invoiceNumber: string;
  companyName: string;
  items: LineItem[];
  totalAmount: number;
  dueDate: Date;
  deliveryDate?: Date | null;
  notes?: string | null;
  bankName?: string | null;
  bankIban?: string | null;
  bankBic?: string | null;
}): { subject: string; html: string } {
  const bankInfo = data.bankIban
    ? `<div style="background:#f9f9f9;padding:14px;border-radius:6px;margin:16px 0;font-size:13px;">
        <strong>Bankverbindung</strong><br/>
        ${data.bankName ? data.bankName + "<br/>" : ""}
        IBAN: ${data.bankIban}<br/>
        ${data.bankBic ? "BIC: " + data.bankBic : ""}
      </div>`
    : "";

  const body = `
    <p style="font-size:15px;color:#333;">Hallo ${data.recipientName},</p>
    <p style="color:#555;">anbei deine Rechnung <strong>${data.invoiceNumber}</strong>.</p>
    ${itemsTable(data.items)}
    <div style="text-align:right;margin:8px 0 20px;">
      <span style="font-size:18px;font-weight:700;color:${BRAND_COLOR};">${formatAmount(data.totalAmount)}</span>
    </div>
    <p style="font-size:13px;color:#888;">Fällig am: ${formatDate(data.dueDate)}</p>
    ${data.deliveryDate ? `<p style="font-size:13px;color:#888;">Lieferdatum: ${formatDate(data.deliveryDate)}</p>` : ""}
    ${bankInfo}
    ${data.notes ? `<p style="font-size:13px;color:#666;background:#f9f9f9;padding:12px;border-radius:6px;">${data.notes}</p>` : ""}
    <p style="color:#555;margin-top:24px;">Vielen Dank für dein Vertrauen.</p>
    <p style="color:#555;">Liebe Grüße<br/><strong>${data.companyName}</strong></p>
  `;

  return {
    subject: `Rechnung ${data.invoiceNumber} – ${data.companyName}`,
    html: layout(`Rechnung ${data.invoiceNumber}`, body, data.companyName),
  };
}

export function driverReminderEmail(data: {
  driverName: string;
  leadDays: number;
  companyName: string;
  customerName: string;
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
}): { subject: string; html: string } {
  const dateStr = data.eventDate.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const leadText =
    data.leadDays === 0
      ? "heute"
      : data.leadDays === 1
      ? "morgen"
      : `in ${data.leadDays} Tagen`;

  const setupLine =
    data.setupDate || data.setupTime
      ? `<tr><td style="padding:6px 0;color:#888;width:130px;">Aufbau</td><td style="padding:6px 0;color:#333;">${
          data.setupDate ? formatDate(data.setupDate) + " " : ""
        }${data.setupTime ?? ""}</td></tr>`
      : "";

  const teardownLine =
    data.teardownDate || data.teardownTime
      ? `<tr><td style="padding:6px 0;color:#888;width:130px;">Abbau</td><td style="padding:6px 0;color:#333;">${
          data.teardownDate ? formatDate(data.teardownDate) + " " : ""
        }${data.teardownTime ?? ""}</td></tr>`
      : "";

  const contactBlock =
    data.onSiteContactName || data.onSiteContactPhone
      ? `<div style="background:#f9f9f9;padding:14px;border-radius:6px;margin:16px 0;font-size:13px;">
          <strong>Ansprechpartner vor Ort</strong><br/>
          ${data.onSiteContactName ?? ""}
          ${data.onSiteContactPhone ? `<br/>Tel.: <a href="tel:${data.onSiteContactPhone}" style="color:${BRAND_COLOR};">${data.onSiteContactPhone}</a>` : ""}
          ${data.onSiteContactNotes ? `<br/><span style="color:#666;">${data.onSiteContactNotes}</span>` : ""}
        </div>`
      : "";

  const notesBlock = data.notes
    ? `<div style="background:#fff8ec;padding:14px;border-radius:6px;margin:16px 0;font-size:13px;color:#555;border-left:3px solid ${BRAND_COLOR};">
        <strong>Notiz</strong><br/>${data.notes}
      </div>`
    : "";

  const linkBlock = data.orderDetailUrl
    ? `<p style="margin:24px 0;"><a href="${data.orderDetailUrl}" style="display:inline-block;background:${BRAND_COLOR};color:#000;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Auftrag ansehen</a></p>`
    : "";

  const body = `
    <p style="font-size:15px;color:#333;">Hallo ${data.driverName},</p>
    <p style="color:#555;">kleiner Reminder: ${leadText} hast du folgenden Auftrag:</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
      <tr><td style="padding:6px 0;color:#888;width:130px;">Kunde</td><td style="padding:6px 0;color:#333;font-weight:600;">${data.customerName}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Art</td><td style="padding:6px 0;color:#333;">${data.eventType}</td></tr>
      <tr><td style="padding:6px 0;color:#888;">Datum</td><td style="padding:6px 0;color:#333;">${dateStr}</td></tr>
      ${setupLine}
      ${teardownLine}
      <tr><td style="padding:6px 0;color:#888;">Ort</td><td style="padding:6px 0;color:#333;">${data.locationName}<br/><span style="color:#888;font-size:13px;">${data.locationAddress}</span></td></tr>
    </table>
    ${contactBlock}
    ${notesBlock}
    ${linkBlock}
    <p style="color:#888;font-size:12px;margin-top:32px;">Du bekommst diese Mail, weil Erinnerungen in deinem Fahrer-Profil aktiviert sind. Vorlauf und Opt-out findest du im Dashboard.</p>
  `;

  return {
    subject: `Erinnerung: ${data.customerName} am ${formatDate(data.eventDate)}`,
    html: layout(`Auftrag ${leadText}`, body, data.companyName),
  };
}

export function confirmationEmail(data: {
  recipientName: string;
  confirmationNumber: string;
  companyName: string;
  items: LineItem[];
  totalAmount: number;
  deliveryDate?: Date | null;
  notes?: string | null;
}): { subject: string; html: string } {
  const body = `
    <p style="font-size:15px;color:#333;">Hallo ${data.recipientName},</p>
    <p style="color:#555;">hiermit bestätigen wir deinen Auftrag <strong>${data.confirmationNumber}</strong>.</p>
    ${itemsTable(data.items)}
    <div style="text-align:right;margin:8px 0 20px;">
      <span style="font-size:18px;font-weight:700;color:${BRAND_COLOR};">${formatAmount(data.totalAmount)}</span>
    </div>
    ${data.deliveryDate ? `<p style="font-size:13px;color:#888;">Lieferdatum: ${formatDate(data.deliveryDate)}</p>` : ""}
    ${data.notes ? `<p style="font-size:13px;color:#666;background:#f9f9f9;padding:12px;border-radius:6px;">${data.notes}</p>` : ""}
    <p style="color:#555;margin-top:24px;">Wir freuen uns auf dein Event!</p>
    <p style="color:#555;">Liebe Grüße<br/><strong>${data.companyName}</strong></p>
  `;

  return {
    subject: `Auftragsbestätigung ${data.confirmationNumber} – ${data.companyName}`,
    html: layout(`Auftragsbestätigung ${data.confirmationNumber}`, body, data.companyName),
  };
}
