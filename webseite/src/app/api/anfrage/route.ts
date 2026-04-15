import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getAdminBaseUrl } from "@/lib/admin-url";

interface AnfragePayload {
  art: string;
  vorname: string;
  nachname: string;
  telefon: string;
  email: string;
  eventType: string;
  datum: string;
  location: string;
  nachricht?: string;
  addons?: string[];
  deliveryDistance?: number;
  deliveryPrice?: number;
  totalPrice?: number;
  firma?: string;
  source?: "kontakt" | "startseite" | "preiskonfigurator";
}

function mapToInquiryPayload(data: AnfragePayload) {
  const firma = data.firma?.trim();
  const namePrefix = firma ? `${firma} — ` : "";
  const comments = [
    data.art ? `Produkt: ${data.art}` : "",
    firma ? `Firma: ${firma}` : "",
    data.nachricht ? data.nachricht : "",
    data.totalPrice ? `Kalkulierter Preis: ${data.totalPrice.toFixed(2)} €` : "",
  ].filter(Boolean).join("\n");

  return {
    customerName: `${namePrefix}${data.vorname} ${data.nachname}`.trim(),
    customerEmail: data.email,
    customerPhone: data.telefon,
    customerType: firma || data.eventType === "Firmenevent" ? "BUSINESS" : "PRIVATE",
    eventDate: data.datum || new Date().toISOString().slice(0, 10),
    eventType: data.eventType || "Sonstiges",
    locationName: data.location,
    locationAddress: data.location,
    distanceKm: data.deliveryDistance ?? null,
    extras: data.addons ?? [],
    comments,
    source: data.source ?? "api",
  };
}

function mapToContactPayload(data: AnfragePayload) {
  return {
    name: `${data.vorname} ${data.nachname}`.trim(),
    email: data.email,
    phone: data.telefon,
    company: data.firma?.trim() || "",
    message: data.nachricht ?? "",
  };
}

export async function POST(request: NextRequest) {
  try {
    const data: AnfragePayload = await request.json();

    if (!data.vorname || !data.nachname || !data.email || !data.telefon) {
      return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
    }

    const host = (await headers()).get("host");
    const adminUrl = getAdminBaseUrl(host);
    if (!adminUrl) {
      console.error("ADMIN_API_URL not configured");
      return NextResponse.json(
        { error: "Service vorübergehend nicht verfügbar" },
        { status: 503 }
      );
    }

    const isContact = data.source === "kontakt";
    const endpoint = isContact ? "/api/contact-message" : "/api/inquiries";
    const payload = isContact ? mapToContactPayload(data) : mapToInquiryPayload(data);

    const res = await fetch(`${adminUrl}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      console.error("Admin API error:", res.status, errorText);
      return NextResponse.json(
        { error: "Interner Fehler beim Senden der Anfrage" },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Anfrage error:", error);
    return NextResponse.json(
      { error: "Interner Fehler beim Senden der Anfrage" },
      { status: 500 }
    );
  }
}
