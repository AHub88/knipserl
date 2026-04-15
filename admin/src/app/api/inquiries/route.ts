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
  enrichment: { distanceKm: number | null; travelCost: number | null } = { distanceKm: null, travelCost: null }
): string {
  const esc = escapeHtml;
  const isContact = data.source === "kontakt";
  const effectiveDistance = enrichment.distanceKm ?? data.distanceKm ?? null;

  const header = `
    <div style="background:#F3A300;color:#1a171b;padding:20px;border-radius:8px 8px 0 0">
      <h1 style="margin:0;font-size:22px">${isContact ? "Neue Kontaktanfrage über knipserl.de" : "Neue Anfrage über knipserl.de"}</h1>
      <p style="margin:5px 0 0;font-size:13px;opacity:0.85">Quelle: ${esc(data.source)} · ID: ${esc(inquiryId)}</p>
    </div>`;

  const contactTable = `
    <h2 style="margin:0 0 12px;color:#1a171b">Kontaktdaten</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:6px 12px 6px 0;color:#78716c">Name:</td><td style="padding:6px 0"><strong>${esc(data.customerName)}</strong></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#78716c">E-Mail:</td><td style="padding:6px 0"><a href="mailto:${esc(data.customerEmail)}">${esc(data.customerEmail || "—")}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#78716c">Telefon:</td><td style="padding:6px 0"><a href="tel:${esc(data.customerPhone || "")}">${esc(data.customerPhone || "—")}</a></td></tr>
      <tr><td style="padding:6px 12px 6px 0;color:#78716c">Kundentyp:</td><td style="padding:6px 0">${data.customerType === "BUSINESS" ? "Firma" : "Privat"}</td></tr>
    </table>`;

  const message = data.comments
    ? `<h2 style="margin:20px 0 12px;color:#1a171b">Nachricht</h2><div style="background:#fff;padding:12px;border:1px solid #e7e5e4;white-space:pre-wrap">${esc(data.comments)}</div>`
    : "";

  const footer = `
    <div style="padding:12px;text-align:center;color:#a8a29e;font-size:12px">
      Automatisch versendet · Details im Admintool unter /inquiries/${esc(inquiryId)}
    </div>`;

  if (isContact) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
        ${header}
        <div style="background:#fafaf9;padding:24px;border:1px solid #e7e5e4">
          ${contactTable}
          ${message}
        </div>
        ${footer}
      </div>
    `;
  }

  const extras = data.extras.length
    ? `<ul>${data.extras.map((e) => `<li>${esc(e)}</li>`).join("")}</ul>`
    : "<p>Keine Extras ausgewählt</p>";
  const eventDate = new Date(data.eventDate).toLocaleDateString("de-DE");
  const distance = effectiveDistance != null
    ? `<tr><td style="padding:6px 12px 6px 0;color:#78716c">Entfernung:</td><td style="padding:6px 0">${effectiveDistance} km</td></tr>`
    : "";
  const travelRow = enrichment.travelCost != null
    ? `<tr><td style="padding:6px 12px 6px 0;color:#78716c">Fahrtkosten:</td><td style="padding:6px 0"><strong>${enrichment.travelCost.toFixed(2)} €</strong></td></tr>`
    : "";

  return `
    <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto">
      ${header}
      <div style="background:#fafaf9;padding:24px;border:1px solid #e7e5e4">
        ${contactTable}
        <h2 style="margin:20px 0 12px;color:#1a171b">Event</h2>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tr><td style="padding:6px 12px 6px 0;color:#78716c">Eventart:</td><td style="padding:6px 0">${esc(data.eventType)}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#78716c">Datum:</td><td style="padding:6px 0">${eventDate}</td></tr>
          <tr><td style="padding:6px 12px 6px 0;color:#78716c">Location:</td><td style="padding:6px 0">${esc(data.locationName || data.locationAddress || "—")}</td></tr>
          ${distance}
          ${travelRow}
        </table>
        <h2 style="margin:20px 0 12px;color:#1a171b">Extras</h2>
        ${extras}
        ${message}
      </div>
      ${footer}
    </div>
  `;
}

async function getNotificationRecipient(): Promise<string> {
  try {
    const setting = await prisma.appSetting.findUnique({ where: { key: "mail_to" } });
    if (setting?.value) return setting.value;
  } catch { /* fall through */ }
  return process.env.MAIL_TO || "info@knipserl.de";
}

// POST /api/inquiries - External endpoint for website form
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createInquirySchema.parse(body);

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
        const html = buildNotificationHtml(data, inquiry.id, { distanceKm, travelCost });
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
