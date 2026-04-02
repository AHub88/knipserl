import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const EXTRAS_CONFIG: Record<string, { label: string; icon: string }> = {
  Drucker: { label: "DRUCKER", icon: "🖨️" },
  Props: { label: "REQUISITEN", icon: "🎭" },
  Stick: { label: "USB STICK", icon: "💾" },
  HG: { label: "HINTERGRUND", icon: "🖼️" },
  LOVE: { label: "LOVE LETTERS", icon: "❤️" },
  Social: { label: "ONLINE-GALERIE", icon: "🌐" },
  Book: { label: "GÄSTEBUCH", icon: "📖" },
  TV: { label: "TV SLIDESHOW", icon: "🖥️" },
  Telefon: { label: "GÄSTETELEFON", icon: "📞" },
};

const EXTRAS_PRICES: Record<string, number> = {
  Props: 45,
  Stick: 15,
  HG: 50,
  LOVE: 150,
  Social: 0,
  Book: 0,
  TV: 0,
  Telefon: 0,
};

function formatDate(d: Date): string {
  const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
  const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
  return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}`;
}

function formatShortDate(d: Date): string {
  const days = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return `${days[d.getDay()]}, ${d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { driver: true, secondDriver: true, company: true, inquiry: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
  }

  const eventDate = new Date(order.eventDate);
  const formattedDate = formatDate(eventDate);

  // Parse customer name
  const sep = order.customerName.indexOf(" - ");
  const firma = sep >= 0 ? order.customerName.slice(0, sep) : null;
  const kontakt = sep >= 0 ? order.customerName.slice(sep + 3) : order.customerName;

  // Parse address
  const addrMatch = order.locationAddress.match(/^(.+?),\s*(\d{4,5})\s+(.+)$/);
  const strasse = addrMatch ? `${addrMatch[1]}, ${addrMatch[2]} ${addrMatch[3]}` : order.locationAddress;
  const plzOrt = addrMatch ? `${addrMatch[2]} ${addrMatch[3]}` : "–";

  // Costs
  const boxPrice = order.boxPrice ?? 379;
  const travelCost = order.travelCost ?? 0;
  const extrasCost = order.extrasCost ?? 0;
  const totalPrice = order.price ?? 0;

  // Build cost lines
  const costLines: { label: string; amount: number }[] = [];
  costLines.push({ label: "Fotobox (inkl. Drucker)", amount: boxPrice });
  if (travelCost > 0) costLines.push({ label: "Anfahrt", amount: travelCost });

  // Individual extras costs
  for (const extra of order.extras) {
    const price = EXTRAS_PRICES[extra];
    if (price && price > 0) {
      costLines.push({ label: EXTRAS_CONFIG[extra]?.label ?? extra, amount: price });
    }
  }

  // Setup/teardown
  const setupDate = order.setupDate ? formatShortDate(new Date(order.setupDate)) : null;
  const teardownDate = order.teardownDate ? formatShortDate(new Date(order.teardownDate)) : null;

  // Extras grid
  const allExtras = Object.entries(EXTRAS_CONFIG);
  const extrasHtml = allExtras
    .map(([key, cfg]) => {
      const active = order.extras.includes(key);
      return `<div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 8px;border-radius:8px;border:2px solid ${active ? "#F6A11C" : "#e0e0e0"};opacity:${active ? 1 : 0.4};min-width:100px;">
        <span style="font-size:24px;">${cfg.icon}</span>
        <span style="font-size:9px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${active ? "#F6A11C" : "#999"};">${cfg.label}</span>
      </div>`;
    })
    .join("");

  // Cost rows
  const costRowsHtml = costLines
    .map(
      (c) =>
        `<tr><td style="padding:4px 0;color:#333;">${c.label}</td><td style="padding:4px 0;text-align:right;font-weight:600;">${c.amount.toFixed(2)} €</td></tr>`
    )
    .join("");

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Auftrag #${order.orderNumber} – ${kontakt}</title>
  <style>
    @page { size: A4; margin: 0; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #333; background: #e8e8e8; }
    .page { width: 210mm; min-height: 297mm; margin: 0 auto; background: white; position: relative; padding: 40px 50px; page-break-after: always; }
    .accent { color: #F6A11C; }
    .section-bar { background: #1a1a1a; color: white; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 8px 16px; border-radius: 4px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .section-bar .dot { width: 6px; height: 6px; border-radius: 50%; background: #F6A11C; }
    .divider { height: 2px; background: #F6A11C; margin: 20px 0; }
    .label { font-size: 11px; color: #999; text-transform: uppercase; letter-spacing: 0.04em; }
    .value { font-size: 13px; font-weight: 500; color: #333; }
    .footer { position: absolute; bottom: 0; left: 0; right: 0; background: #1a1a1a; padding: 12px 50px; display: flex; justify-content: center; gap: 16px; align-items: center; }
    .footer span { color: #999; font-size: 10px; }
    .footer .brand { color: #F6A11C; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 4px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: white; }
    .badge-setup { background: #F6A11C; }
    .badge-teardown { background: #ef4444; }
    .badge-event { background: #e8e8e8; color: #666; font-size: 10px; padding: 3px 12px; }
    @media print {
      body { background: white; }
      .page { margin: 0; box-shadow: none; }
    }
  </style>
</head>
<body>

<!-- Page 1: Auftragsinfos -->
<div class="page">
  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
    <div>
      <div class="label" style="margin-bottom:4px;">AUFTRAGSINFOS</div>
      <div class="accent" style="font-size:22px;font-weight:700;margin-bottom:4px;">${formattedDate}</div>
      <div style="font-size:18px;font-weight:700;">${kontakt}</div>
      ${firma ? `<div style="font-size:14px;color:#666;">${firma}</div>` : ""}
      <span class="badge badge-event" style="margin-top:6px;">${order.eventType}</span>
    </div>
    <img src="/logo.png" alt="Knipserl" style="height:50px;" />
  </div>

  <div class="divider"></div>

  <!-- Kontaktdaten -->
  <div class="section-bar"><span class="dot"></span>KONTAKTDATEN</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px 40px;margin-bottom:24px;font-size:13px;">
    ${firma ? `<div><span class="label">Firma</span><br><span class="value">${firma}</span></div>` : ""}
    <div><span class="label">E-Mail</span><br><span class="value">${order.customerEmail || "–"}</span></div>
    <div><span class="label">Name</span><br><span class="value">${kontakt}</span></div>
    <div><span class="label">Auftrag</span><br><span class="value">#${order.orderNumber}</span></div>
    <div><span class="label">Telefon</span><br><span class="value">${order.customerPhone || "–"}</span></div>
  </div>

  <!-- Location + Auf-/Abbau -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div>
      <div class="section-bar"><span class="dot"></span>LOCATION</div>
      <div style="font-size:13px;line-height:1.8;">
        <div><span class="label">Name</span><br><span class="value">${order.locationName}</span></div>
        <div><span class="label">Straße</span><br><span class="value">${strasse}</span></div>
        <div><span class="label">PLZ / Ort</span><br><span class="value">${plzOrt}</span></div>
        ${order.inquiry?.distanceKm != null ? `<div><span class="label">Entfernung</span><br><span class="value" style="font-weight:700;">${order.inquiry.distanceKm} km</span></div>` : ""}
      </div>
    </div>
    <div>
      <div class="section-bar"><span class="dot"></span>AUF- & ABBAU</div>
      <div style="font-size:13px;line-height:2.2;">
        ${setupDate ? `<div><span class="badge badge-setup">AUFBAU</span> <strong>${setupDate}</strong> ${order.setupTime || ""}</div>` : `<div style="color:#999;">Kein Aufbau-Termin</div>`}
        ${teardownDate ? `<div><span class="badge badge-teardown">ABBAU</span> <strong>${teardownDate}</strong> ${order.teardownTime || ""}</div>` : `<div style="color:#999;">Kein Abbau-Termin</div>`}
      </div>
    </div>
  </div>

  <!-- Extras -->
  <div class="section-bar"><span class="dot"></span>ZUBEHÖR & EXTRAS</div>
  <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:24px;">
    ${extrasHtml}
  </div>

  <!-- Kosten -->
  <div class="section-bar"><span class="dot"></span>KOSTEN</div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px;">
    ${costRowsHtml}
    <tr style="border-top:2px solid #F6A11C;">
      <td style="padding:10px 0;font-weight:700;font-size:14px;">Gesamtpreis</td>
      <td style="padding:10px 0;text-align:right;font-weight:700;font-size:18px;color:#F6A11C;">${totalPrice.toFixed(2)} €</td>
    </tr>
  </table>

  <!-- Hinweise -->
  ${order.notes ? `
  <div class="section-bar"><span class="dot"></span>HINWEISE</div>
  <div style="background:#f5f5f5;border-radius:6px;padding:12px 16px;font-size:13px;color:#555;margin-bottom:24px;">
    ${order.notes}
  </div>` : ""}

  <!-- Footer -->
  <div class="footer">
    <span class="brand">Knipserl Fotobox</span>
    <span>·</span>
    <span>info@knipserl.de</span>
    <span>·</span>
    <span>www.knipserl.de</span>
  </div>
</div>

<!-- Page 2: Layout Ausdruck -->
${order.graphicUrl ? `
<div class="page" style="display:flex;flex-direction:column;">
  <div style="background:#1a1a1a;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
    <div style="color:#F6A11C;font-size:20px;font-weight:800;letter-spacing:0.1em;text-transform:uppercase;">Layout Ausdruck</div>
    <div style="color:#999;font-size:12px;margin-top:4px;font-style:italic;">Bitte genau prüfen – bei Änderungswünschen bitte melden</div>
  </div>
  <div style="flex:1;display:flex;align-items:flex-start;justify-content:center;">
    <img src="/${order.graphicUrl}" style="max-width:100%;max-height:800px;" />
  </div>
  <div class="footer">
    <span class="brand">Knipserl Fotobox</span>
    <span>·</span>
    <span>Auftrag #${order.orderNumber} – ${kontakt}</span>
  </div>
</div>` : ""}

</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
