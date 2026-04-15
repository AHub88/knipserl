import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { geocodeAutocomplete, calculateDrivingDistance } from "@/lib/geocoding";
import { calculateTravelPrice } from "@/lib/travel-pricing";

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
    locationLat: number | null;
    locationLng: number | null;
    adminUrl: string;
  }
): string {
  const esc = escapeHtml;
  const isContact = data.source === "kontakt";

  const adminLink = `${ctx.adminUrl}/inquiries/${inquiryId}`;
  const telLink = data.customerPhone
    ? `tel:${data.customerPhone.replace(/[^\d+]/g, "")}`
    : "";
  const mailLink = data.customerEmail ? `mailto:${data.customerEmail}` : "";

  const mapsLink = (() => {
    if (ctx.locationLat != null && ctx.locationLng != null) {
      return `https://www.google.com/maps?q=${ctx.locationLat},${ctx.locationLng}`;
    }
    const q = data.locationAddress || data.locationName;
    if (q) return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    return "";
  })();

  const locationText = data.locationName || data.locationAddress || "";

  // Datum groß
  const d = new Date(data.eventDate);
  const weekdayShort = ["SO", "MO", "DI", "MI", "DO", "FR", "SA"][d.getDay()];
  const monthShort = ["JAN", "FEB", "MRZ", "APR", "MAI", "JUN", "JUL", "AUG", "SEP", "OKT", "NOV", "DEZ"][d.getMonth()];
  const dateBig = `${weekdayShort} ${d.getDate()}. ${monthShort} ${d.getFullYear()}`;

  const contactTypeLabel = data.customerType === "BUSINESS" ? "Firmenkunde" : "Privatkunde";

  const extras = data.extras.filter((e) => e && e !== "Drucker");
  const extrasRow =
    data.extras.length > 0
      ? `<tr>
          <td style="padding:14px 24px 6px;color:#a8a29e;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600">Extras</td>
        </tr>
        <tr>
          <td style="padding:0 24px 14px">
            <span style="display:inline-block;background:#F3A300;color:#1a171b;font-weight:600;font-size:13px;padding:4px 12px;border-radius:999px;margin-right:4px;margin-bottom:4px">Drucker</span>
            ${extras
              .map(
                (e) =>
                  `<span style="display:inline-block;background:#fff;color:#1a171b;font-weight:500;font-size:13px;padding:4px 12px;border-radius:999px;border:1px solid #e7e5e4;margin-right:4px;margin-bottom:4px">${esc(e)}</span>`
              )
              .join("")}
          </td>
        </tr>`
      : "";

  const messageRow = data.comments
    ? `<tr>
        <td style="padding:14px 24px 6px;color:#a8a29e;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600">Nachricht</td>
      </tr>
      <tr>
        <td style="padding:0 24px 20px">
          <div style="background:#fff;padding:14px 16px;border:1px solid #e7e5e4;border-radius:10px;color:#44403c;font-size:14px;line-height:1.55;white-space:pre-wrap">${esc(data.comments)}</div>
        </td>
      </tr>`
    : "";

  // Hero block
  const heroLabel = isContact ? "KONTAKTANFRAGE" : `${esc(data.eventType).toUpperCase()} · ${contactTypeLabel.toUpperCase()}`;
  const heroDate = isContact ? new Date().toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "short", year: "numeric" }).toUpperCase() : dateBig.toUpperCase();

  const hero = `
    <tr>
      <td style="padding:0">
        <div style="background:#1a171b;color:#fff;padding:28px 24px;border-radius:16px 16px 0 0">
          <div style="font-size:11px;letter-spacing:0.15em;color:#F3A300;font-weight:700;margin-bottom:8px">${heroLabel}</div>
          <div style="font-size:28px;font-weight:800;line-height:1.1;letter-spacing:-0.01em">${heroDate}</div>
          ${
            isContact
              ? ""
              : `<div style="margin-top:6px;font-size:14px;color:#d6d3d1;font-weight:500">${esc(data.eventType)} · ${contactTypeLabel}</div>`
          }
        </div>
      </td>
    </tr>`;

  // Contact card (big)
  const contactCard = `
    <tr>
      <td style="padding:20px 24px 8px">
        <div style="font-size:20px;font-weight:700;color:#1a171b;line-height:1.25">${esc(data.customerName)}</div>
      </td>
    </tr>
    ${
      data.customerPhone
        ? `<tr>
        <td style="padding:4px 24px;font-size:14px">
          <span style="color:#78716c">📞</span>
          <a href="${esc(telLink)}" style="color:#1a171b;text-decoration:none;font-weight:500;margin-left:6px">${esc(data.customerPhone)}</a>
        </td>
      </tr>`
        : ""
    }
    ${
      data.customerEmail
        ? `<tr>
        <td style="padding:4px 24px 16px;font-size:14px">
          <span style="color:#78716c">✉</span>
          <a href="${esc(mailLink)}" style="color:#1a171b;text-decoration:none;font-weight:500;margin-left:6px">${esc(data.customerEmail)}</a>
        </td>
      </tr>`
        : ""
    }`;

  // Location card — clickable → Google Maps
  const locationCard =
    locationText
      ? `<tr>
          <td style="padding:8px 24px 4px;color:#a8a29e;font-size:11px;letter-spacing:0.05em;text-transform:uppercase;font-weight:600">Location</td>
        </tr>
        <tr>
          <td style="padding:0 24px 16px">
            <a href="${esc(mapsLink)}" style="display:block;background:#fff;border:1px solid #e7e5e4;border-radius:12px;padding:14px 16px;text-decoration:none;color:#1a171b">
              <div style="font-weight:600;font-size:15px;line-height:1.3">📍 ${esc(locationText)}</div>
              ${
                ctx.distanceKm != null
                  ? `<div style="margin-top:4px;color:#78716c;font-size:13px">${ctx.distanceKm} km · auf Google Maps öffnen →</div>`
                  : `<div style="margin-top:4px;color:#78716c;font-size:13px">auf Google Maps öffnen →</div>`
              }
            </a>
          </td>
        </tr>`
      : "";

  // Fahrtkosten-Hervorhebung
  const travelBox =
    ctx.travelCost != null
      ? `<tr>
          <td style="padding:6px 24px 18px">
            <div style="background:linear-gradient(135deg,#F3A300 0%,#d99200 100%);border-radius:12px;padding:16px 20px;color:#1a171b">
              <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;font-weight:700;opacity:0.8">Fahrtkosten</div>
              <div style="font-size:28px;font-weight:800;line-height:1.1;margin-top:2px">${ctx.travelCost.toFixed(2).replace(".", ",")} €</div>
              ${
                ctx.distanceKm != null
                  ? `<div style="font-size:12px;margin-top:2px;opacity:0.75">${ctx.distanceKm} km Entfernung</div>`
                  : ""
              }
            </div>
          </td>
        </tr>`
      : "";

  // CTAs
  const primaryCta = `
    <tr>
      <td style="padding:8px 24px 0">
        <a href="${esc(adminLink)}" style="display:block;background:#1a171b;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.02em">IM ADMIN ÖFFNEN</a>
      </td>
    </tr>`;

  const secondaryCtas = `
    <tr>
      <td style="padding:10px 24px 24px">
        <table role="presentation" style="width:100%;border-collapse:separate;border-spacing:8px 0">
          <tr>
            ${
              telLink
                ? `<td style="width:50%"><a href="${esc(telLink)}" style="display:block;background:#fff;border:1px solid #e7e5e4;color:#1a171b;text-align:center;padding:12px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">📞 Anrufen</a></td>`
                : ""
            }
            ${
              mailLink
                ? `<td style="width:50%"><a href="${esc(mailLink)}" style="display:block;background:#fff;border:1px solid #e7e5e4;color:#1a171b;text-align:center;padding:12px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">✉ Antworten</a></td>`
                : ""
            }
          </tr>
        </table>
      </td>
    </tr>`;

  const footer = `
    <tr>
      <td style="padding:0 24px 20px;text-align:center;color:#a8a29e;font-size:11px">
        Automatisch versendet · knipserl.de · Quelle: ${esc(data.source)}
      </td>
    </tr>`;

  return `<!doctype html>
<html>
<body style="margin:0;padding:24px 12px;background:#e7e5e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table role="presentation" style="width:100%;max-width:520px;margin:0 auto;border-collapse:separate;border-spacing:0;background:#fafaf9;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,0.08);overflow:hidden">
    ${hero}
    ${contactCard}
    ${isContact ? "" : locationCard}
    ${isContact ? "" : travelBox}
    ${extrasRow}
    ${messageRow}
    ${primaryCta}
    ${secondaryCtas}
    ${footer}
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
    const data = createInquirySchema.parse(body);
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

    const { source: _source, ...inquiryData } = data;
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
