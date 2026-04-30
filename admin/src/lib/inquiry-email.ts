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
 * Wraps the plain-text body of an inquiry response in the shared
 * email-layout (Brand-Banner, weiße Content-Box, grauer Footer).
 *
 * Newlines in `plainBody` werden via `white-space:pre-line` als
 * Zeilenumbrüche gerendert, HTML wird escaped (kein Format-Injection).
 */
export function wrapInquiryEmailHtml(
  plainBody: string,
  opts?: { companyName?: string },
): string {
  const safe = plainBody
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const company = opts?.companyName?.trim() || "Knipserl Fotobox";
  return emailLayout({
    preheader: company,
    bodyHtml: `<p style="margin:0;white-space:pre-line;color:#333;font-size:15px;line-height:1.65;">${safe}</p>`,
    footerText: company,
  });
}
