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

export function wrapInquiryEmailHtml(plainBody: string): string {
  const safe = plainBody
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:30px;">
  <p style="white-space:pre-line;color:#333;font-size:15px;line-height:1.6;">${safe}</p>
</div>`;
}
