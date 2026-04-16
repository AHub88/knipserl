import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { geocodeAutocomplete, calculateDrivingDistance } from "@/lib/geocoding";
import { calculateTravelPrice } from "@/lib/travel-pricing";
import { normalizeExtraKey, extraLabel } from "@/lib/extras-pricing";

const createInquirySchema = z.object({
  customerName: z.string().min(1, "Name ist erforderlich"),
  customerEmail: z.string().email("Ungültige E-Mail").or(z.literal("")).default(""),
  customerPhone: z.string().optional(),
  customerType: z.enum(["PRIVATE", "BUSINESS"]).default("PRIVATE"),
  eventDate: z.string().transform((s) => new Date(s)),
  eventType: z.string().min(1, "Eventart ist erforderlich"),
  locationName: z.string().default(""),
  locationAddress: z.string().default(""),
  locationLat: z.number().optional(),
  locationLng: z.number().optional(),
  distanceKm: z.number().nullable().optional(),
  extras: z.array(z.string()).default([]),
  comments: z.string().optional(),
  totalPrice: z.number().optional(),
  source: z.enum(["kontakt", "startseite", "preiskonfigurator", "api"]).default("api"),
});

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildNotificationHtml(
  data: z.infer<typeof createInquirySchema>,
  inquiryId: string,
  ctx: {
    distanceKm: number | null;
    travelCost: number | null;
    totalPrice: number | null;
    locationLat: number | null;
    locationLng: number | null;
    adminUrl: string;
  }
): string {
  const esc = escapeHtml;
  const isContact = data.source === "kontakt";

  const adminLink = `${ctx.adminUrl}/inquiries/${inquiryId}`;
  const telDigits = data.customerPhone ? data.customerPhone.replace(/[^\d+]/g, "") : "";
  const telLink = telDigits ? `tel:${telDigits}` : "";
  const mailLink = data.customerEmail ? `mailto:${data.customerEmail}` : "";

  const mapsLink = (() => {
    if (ctx.locationLat != null && ctx.locationLng != null) {
      return `https://www.google.com/maps?q=${ctx.locationLat},${ctx.locationLng}`;
    }
    const q = data.locationAddress || data.locationName;
    if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    return "";
  })();

  const d = new Date(data.eventDate);
  const weekdays = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  const dateLong = `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
  const contactTypeLabel = data.customerType === "BUSINESS" ? "Firmenkunde" : "Privatkunde";

  // Color tokens — light-mode locked
  const C = {
    bg: "#f3f4f6",
    card: "#ffffff",
    border: "#e5e7eb",
    ink: "#111111",
    inkSoft: "#4b5563",
    inkMuted: "#9ca3af",
    accent: "#F3A300",
    accentInk: "#1a171b",
    dark: "#111111",
    tile: "#f9fafb",
  };
  const FONT = `'Helvetica Neue', Helvetica, Arial, sans-serif`;

  // ── Hero ──
  const hero = isContact
    ? `<tr><td style="padding:32px 32px 0 32px;" class="px">
        <div style="font:700 11px/1 ${FONT};letter-spacing:1.5px;color:${C.accent};text-transform:uppercase;">Neue Kontaktanfrage</div>
        <div style="font:700 26px/1.15 ${FONT};color:${C.ink};margin-top:10px;letter-spacing:-0.4px;">Eingegangen über knipserl.de</div>
      </td></tr>`
    : `<tr><td style="padding:32px 32px 0 32px;" class="px">
        <div style="font:700 11px/1 ${FONT};letter-spacing:1.5px;color:${C.accent};text-transform:uppercase;">${esc(data.eventType)} &middot; ${contactTypeLabel}</div>
        <div style="font:700 28px/1.15 ${FONT};color:${C.ink};margin-top:10px;letter-spacing:-0.4px;"><span style="color:${C.ink};">${esc(dateLong)}</span></div>
      </td></tr>`;

  // ── Contact ──
  const contactRows = `
    <tr><td style="padding:24px 32px 4px 32px;" class="px">
      <div style="font:700 22px/1.25 ${FONT};color:${C.ink};letter-spacing:-0.2px;">${esc(data.customerName)}</div>
    </td></tr>
    ${telLink ? `<tr><td style="padding:8px 32px 0 32px;font:500 15px/1.4 ${FONT};color:${C.ink};" class="px">
      <a href="${esc(telLink)}" style="color:${C.ink};text-decoration:none;">${esc(data.customerPhone || "")}</a>
    </td></tr>` : ""}
    ${mailLink ? `<tr><td style="padding:4px 32px 0 32px;font:500 15px/1.4 ${FONT};color:${C.ink};word-break:break-all;" class="px">
      <a href="${esc(mailLink)}" style="color:${C.ink};text-decoration:none;">${esc(data.customerEmail)}</a>
    </td></tr>` : ""}`;

  const sectionLabel = (label: string) =>
    `<tr><td style="padding:22px 32px 8px 32px;font:700 11px/1 ${FONT};letter-spacing:1.2px;color:${C.inkMuted};text-transform:uppercase;" class="px">${label}</td></tr>`;

  // ── Location ──
  const locationCard = (data.locationName || data.locationAddress) && !isContact
    ? `${sectionLabel("Location")}
       <tr><td style="padding:0 32px 0 32px;" class="px">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.tile}" class="tile" style="border-collapse:separate;background:${C.tile};border:1px solid ${C.border};border-radius:12px;">
           <tr><td style="padding:16px 18px;">
             <a href="${esc(mapsLink)}" style="text-decoration:none;color:${C.ink};display:block;">
               <div style="font:600 15px/1.35 ${FONT};color:${C.ink};">${esc(data.locationName || data.locationAddress || "")}</div>
               ${data.locationName && data.locationAddress && data.locationName !== data.locationAddress
                 ? `<div style="font:400 13px/1.4 ${FONT};color:${C.inkSoft};margin-top:4px;">${esc(data.locationAddress)}</div>`
                 : ""}
               <div style="font:600 12px/1 ${FONT};color:${C.accent};margin-top:10px;letter-spacing:0.2px;">Auf Google Maps öffnen &rarr;</div>
             </a>
           </td></tr>
         </table>
       </td></tr>`
    : "";

  // ── Gesamtpreis-Block (aus Preiskonfigurator) — bevorzugt vor Fahrtkosten-Einzelbox ──
  const priceBox = ctx.totalPrice != null
    ? `<tr><td style="padding:14px 32px 0 32px;" class="px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.accent}" class="accent-bg" style="border-collapse:separate;background:${C.accent};border-radius:12px;">
          <tr><td style="padding:18px 20px;">
            <div style="font:700 11px/1 ${FONT};letter-spacing:1.2px;color:${C.accentInk};text-transform:uppercase;opacity:0.8;">Kalkulierter Gesamtpreis</div>
            <div style="font:800 34px/1.05 ${FONT};color:${C.accentInk};margin-top:6px;letter-spacing:-0.5px;">${ctx.totalPrice.toFixed(2).replace(".", ",")}&nbsp;&euro;</div>
            ${ctx.travelCost != null && ctx.distanceKm != null
              ? `<div style="font:500 12px/1.3 ${FONT};color:${C.accentInk};margin-top:4px;opacity:0.75;">inkl. ${ctx.travelCost.toFixed(2).replace(".", ",")} € Fahrtkosten (${ctx.distanceKm} km)</div>`
              : ctx.distanceKm != null
              ? `<div style="font:500 12px/1.3 ${FONT};color:${C.accentInk};margin-top:4px;opacity:0.75;">${ctx.distanceKm} km Entfernung</div>`
              : ""}
          </td></tr>
        </table>
      </td></tr>`
    : "";

  // ── Fahrtkosten (nur wenn kein Gesamtpreis vorhanden, z.B. Startseiten-Anfrage) ──
  const travelBox = ctx.totalPrice == null && ctx.travelCost != null
    ? `<tr><td style="padding:14px 32px 0 32px;" class="px">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.accent}" class="accent-bg" style="border-collapse:separate;background:${C.accent};border-radius:12px;">
          <tr><td style="padding:18px 20px;">
            <div style="font:700 11px/1 ${FONT};letter-spacing:1.2px;color:${C.accentInk};text-transform:uppercase;opacity:0.8;">Fahrtkosten</div>
            <div style="font:800 30px/1.05 ${FONT};color:${C.accentInk};margin-top:6px;letter-spacing:-0.5px;">${ctx.travelCost.toFixed(2).replace(".", ",")}&nbsp;&euro;</div>
            ${ctx.distanceKm != null ? `<div style="font:500 12px/1.3 ${FONT};color:${C.accentInk};margin-top:4px;opacity:0.75;">${ctx.distanceKm} km Entfernung</div>` : ""}
          </td></tr>
        </table>
      </td></tr>`
    : "";

  // ── Extras — vertikale Liste mit Labels ──
  const allExtras = data.extras.filter(Boolean);
  const extrasRow = allExtras.length > 0
    ? `${sectionLabel("Angefragte Extras")}
       <tr><td style="padding:0 32px 0 32px;" class="px">
         <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.tile}" class="tile" style="border-collapse:separate;background:${C.tile};border:1px solid ${C.border};border-radius:12px;">
           ${allExtras.map((raw, i) => {
             const label = extraLabel(raw);
             const isPrinter = label === "Drucker";
             const isLast = i === allExtras.length - 1;
             const borderBottom = isLast ? "" : `border-bottom:1px solid ${C.border};`;
             const bulletBg = isPrinter ? C.accent : C.ink;
             return `<tr><td style="padding:12px 16px;${borderBottom}">
               <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
                 <td valign="middle" style="padding-right:10px;">
                   <div style="width:8px;height:8px;background:${bulletBg};border-radius:999px;"></div>
                 </td>
                 <td valign="middle" style="font:600 14px/1.3 ${FONT};color:${C.ink};">${esc(label)}</td>
               </tr></table>
             </td></tr>`;
           }).join("")}
         </table>
       </td></tr>`
    : "";

  // ── Nachricht ──
  const messageRow = data.comments
    ? `${sectionLabel("Nachricht")}
       <tr><td style="padding:0 32px 0 32px;" class="px">
         <div style="background:${C.tile};border:1px solid ${C.border};border-radius:12px;padding:14px 16px;font:400 14px/1.55 ${FONT};color:${C.inkSoft};white-space:pre-wrap;">${esc(data.comments)}</div>
       </td></tr>`
    : "";

  // ── CTAs ──
  const primaryCta = `<tr><td style="padding:24px 32px 0 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;">
      <tr><td align="center" bgcolor="${C.dark}" class="cta-primary" style="background:${C.dark};border-radius:10px;mso-padding-alt:0;">
        <a href="${esc(adminLink)}" style="display:block;padding:16px 24px;font:700 14px/1 ${FONT};color:#ffffff;text-decoration:none;letter-spacing:0.6px;text-transform:uppercase;">Im Admin öffnen</a>
      </td></tr>
    </table>
  </td></tr>`;

  const secondaryCtas = (telLink || mailLink) ? `<tr><td style="padding:10px 32px 0 32px;" class="px">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:separate;">
      <tr>
        ${telLink ? `<td width="50%" valign="top" style="padding-right:5px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="${C.tile}" class="tile" style="background:${C.tile};border:1px solid ${C.border};border-radius:10px;">
              <a href="${esc(telLink)}" style="display:block;padding:14px 12px;font:600 14px/1 ${FONT};color:${C.ink};text-decoration:none;">Anrufen</a>
            </td>
          </tr></table>
        </td>` : ""}
        ${mailLink ? `<td width="50%" valign="top" style="padding-left:${telLink ? 5 : 0}px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td align="center" bgcolor="${C.tile}" class="tile" style="background:${C.tile};border:1px solid ${C.border};border-radius:10px;">
              <a href="${esc(mailLink)}" style="display:block;padding:14px 12px;font:600 14px/1 ${FONT};color:${C.ink};text-decoration:none;">Antworten</a>
            </td>
          </tr></table>
        </td>` : ""}
      </tr>
    </table>
  </td></tr>` : "";

  const footer = `<tr><td style="padding:24px 32px 28px 32px;text-align:center;font:400 11px/1.5 ${FONT};color:${C.inkMuted};" class="px">
    Automatisch versendet &middot; knipserl.de &middot; Quelle: ${esc(data.source)}
  </td></tr>`;

  const preheader = isContact
    ? `Neue Kontaktanfrage von ${data.customerName}`
    : `${data.eventType} am ${dateLong} – ${data.customerName}`;

  return `<!doctype html>
<html lang="de" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<meta name="format-detection" content="telephone=no, date=no, address=no, email=no, url=no">
<title>Neue Anfrage knipserl.de</title>
<!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
<style type="text/css">
  :root { color-scheme: light; supported-color-schemes: light; }
  html, body { margin:0 !important; padding:0 !important; width:100% !important; }
  table { border-collapse:collapse !important; }
  img { border:0; outline:none; text-decoration:none; -ms-interpolation-mode:bicubic; }
  a[x-apple-data-detectors] { color:inherit !important; text-decoration:none !important; font-size:inherit !important; font-family:inherit !important; font-weight:inherit !important; line-height:inherit !important; }
  .ExternalClass, .ExternalClass p, .ExternalClass span, .ExternalClass font, .ExternalClass td, .ExternalClass div { line-height:100%; }

  /* Outlook.com / Office 365 dark mode overrides — verhindert dass weiße Karten dunkel werden und dunkle Buttons weiß */
  [data-ogsc] .card,
  [data-ogsb] .card { background:${C.card} !important; }
  [data-ogsc] .tile,
  [data-ogsb] .tile { background:${C.tile} !important; }
  [data-ogsc] .ink-primary,
  [data-ogsb] .ink-primary { color:${C.ink} !important; }
  [data-ogsc] .ink-soft,
  [data-ogsb] .ink-soft { color:${C.inkSoft} !important; }
  [data-ogsc] .ink-muted,
  [data-ogsb] .ink-muted { color:${C.inkMuted} !important; }
  [data-ogsc] .cta-primary,
  [data-ogsb] .cta-primary { background:${C.dark} !important; }
  [data-ogsc] .cta-primary a,
  [data-ogsb] .cta-primary a { color:#ffffff !important; }
  [data-ogsc] .accent-bg,
  [data-ogsb] .accent-bg { background:${C.accent} !important; }

  @media (prefers-color-scheme: dark) {
    /* Force light layout in iOS Mail / Apple Mail dark mode */
    .card { background:${C.card} !important; }
    .tile { background:${C.tile} !important; }
    .ink-primary { color:${C.ink} !important; }
    .ink-soft { color:${C.inkSoft} !important; }
    .ink-muted { color:${C.inkMuted} !important; }
    .cta-primary { background:${C.dark} !important; }
    .cta-primary a { color:#ffffff !important; }
    .accent-bg { background:${C.accent} !important; }
    .accent-ink { color:${C.accentInk} !important; }
  }

  @media only screen and (max-width:620px) {
    .container { width:100% !important; max-width:100% !important; border-radius:0 !important; border:0 !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .outer-pad { padding-left:0 !important; padding-right:0 !important; padding-top:0 !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.bg};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${esc(preheader)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" bgcolor="${C.bg}" style="background:${C.bg};">
    <tr><td align="center" class="outer-pad" style="padding:32px 16px;">
      <!--[if mso | IE]><table role="presentation" align="center" border="0" cellpadding="0" cellspacing="0" width="600"><tr><td><![endif]-->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center" class="container card" bgcolor="${C.card}" style="width:600px;max-width:600px;background:${C.card};border-radius:16px;border:1px solid ${C.border};">
        ${hero}
        ${contactRows}
        ${locationCard}
        ${priceBox}
        ${travelBox}
        ${extrasRow}
        ${messageRow}
        ${primaryCta}
        ${secondaryCtas}
        ${footer}
      </table>
      <!--[if mso | IE]></td></tr></table><![endif]-->
    </td></tr>
  </table>
</body>
</html>`;
}

async function getNotificationRecipient(): Promise<string> {
  try {
    const setting = await prisma.appSetting.findUnique({ where: { key: "mail_to" } });
    if (setting?.value) return setting.value;
  } catch { /* fall through */ }
  return process.env.MAIL_TO || "info@knipserl.de";
}

function resolveAdminUrl(request: NextRequest): string {
  const envUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.ADMIN_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = request.headers.get("host") || "";
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  if (host) return `${proto}://${host}`;
  return "https://admin.knipserl.de";
}

// POST /api/inquiries - External endpoint for website form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = createInquirySchema.parse(body);
    // Webseite sendet Marketing-Namen ("Alle Bilder auf USB Stick") — auf kanonische
    // Admin-Keys normalisieren, damit sie in den Extras-Buttons vorausgewählt sind
    // und der Preis korrekt berechnet wird. Duplikate entfernen.
    const normalizedExtras = Array.from(
      new Set(parsed.extras.filter(Boolean).map(normalizeExtraKey))
    );
    const data = { ...parsed, extras: normalizedExtras };
    const adminUrl = resolveAdminUrl(request);

    // Find or create customer
    const emailLower = data.customerEmail?.toLowerCase().trim() || null;
    let customerId: string | null = null;

    if (emailLower) {
      const existing = await prisma.customer.findFirst({
        where: { email: { equals: emailLower, mode: "insensitive" } },
      });
      if (existing) {
        customerId = existing.id;
      }
    }

    if (!customerId) {
      const newCustomer = await prisma.customer.create({
        data: {
          name: data.customerName,
          email: emailLower,
          phone: data.customerPhone || null,
          customerType: data.customerType,
        },
      });
      customerId = newCustomer.id;
    }

    const { source: _source, totalPrice: _totalPrice, ...inquiryData } = data;
    const inquiry = await prisma.inquiry.create({
      data: {
        ...inquiryData,
        customerId,
        eventDate: data.eventDate,
      },
    });

    // Notification email — fire-and-forget, don't fail the request.
    // Vorher: Location geocoden + Entfernung & Fahrtkosten berechnen, damit
    // diese Werte in der Mail stehen und auf der Inquiry persistiert sind.
    (async () => {
      let distanceKm: number | null = data.distanceKm ?? null;
      let travelCost: number | null = null;
      let lat = data.locationLat ?? null;
      let lng = data.locationLng ?? null;

      if (data.source !== "kontakt" && data.locationAddress) {
        try {
          if (lat == null || lng == null) {
            const suggestions = await geocodeAutocomplete(data.locationAddress);
            const best = suggestions[0];
            if (best) {
              lat = best.lat;
              lng = best.lng;
            }
          }

          if (lat != null && lng != null && distanceKm == null) {
            const startLat = await prisma.appSetting.findUnique({ where: { key: "startLat" } });
            const startLng = await prisma.appSetting.findUnique({ where: { key: "startLng" } });
            if (startLat?.value && startLng?.value) {
              const km = await calculateDrivingDistance(
                Number(startLat.value),
                Number(startLng.value),
                lat,
                lng
              );
              if (km != null) distanceKm = Math.round(km);
            }
          }

          if (distanceKm != null) {
            const result = await calculateTravelPrice(distanceKm);
            travelCost = result.customerPrice;
          }

          // Ergebnisse auf der Inquiry persistieren — damit die Detailseite
          // nicht nochmal rechnen muss
          const updates: Record<string, unknown> = {};
          if (lat != null && lng != null) {
            updates.locationLat = lat;
            updates.locationLng = lng;
          }
          if (distanceKm != null) updates.distanceKm = distanceKm;
          if (Object.keys(updates).length > 0) {
            await prisma.inquiry.update({ where: { id: inquiry.id }, data: updates });
          }
        } catch (err) {
          console.error("Inquiry enrichment (geocode/distance) failed:", err);
        }
      }

      try {
        const to = await getNotificationRecipient();
        const subject = data.source === "kontakt"
          ? `Neue Kontaktanfrage – ${data.customerName}`
          : `Neue Anfrage: ${data.eventType} – ${data.customerName}`;
        const html = buildNotificationHtml(data, inquiry.id, {
          distanceKm,
          travelCost,
          totalPrice: data.totalPrice ?? null,
          locationLat: lat,
          locationLng: lng,
          adminUrl,
        });
        await sendEmail({ to, subject, html });
      } catch (err) {
        console.error("Inquiry notification email failed:", err);
      }
    })();

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const msg = error.issues.map((i) => i.message).join(", ");
      return NextResponse.json(
        { error: msg, details: error.issues },
        { status: 400 }
      );
    }
    console.error("Error creating inquiry:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

// GET /api/inquiries - Internal endpoint (authenticated)
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    include: { order: { select: { id: true, orderNumber: true } } },
  });

  return NextResponse.json(inquiries);
}
