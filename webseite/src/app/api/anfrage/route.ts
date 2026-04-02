import { NextRequest, NextResponse } from "next/server";

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
}

async function sendMailViaGraph(subject: string, htmlBody: string) {
  const tenantId = process.env.AZURE_TENANT_ID!;
  const clientId = process.env.AZURE_CLIENT_ID!;
  const clientSecret = process.env.AZURE_CLIENT_SECRET!;
  const senderEmail = process.env.MAIL_FROM || "info@knipserl.de";
  const recipientEmail = process.env.MAIL_TO || "info@knipserl.de";

  // Get access token via client credentials flow
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: "https://graph.microsoft.com/.default",
      grant_type: "client_credentials",
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Token request failed: ${tokenRes.status}`);
  }

  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;

  // Send mail via Graph API
  const graphRes = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: {
          subject,
          body: { contentType: "HTML", content: htmlBody },
          toRecipients: [
            { emailAddress: { address: recipientEmail } },
          ],
        },
      }),
    }
  );

  if (!graphRes.ok) {
    const errorText = await graphRes.text();
    throw new Error(`Graph sendMail failed: ${graphRes.status} ${errorText}`);
  }
}

function buildEmailHtml(data: AnfragePayload): string {
  const addonsList = data.addons?.length
    ? data.addons.map((a) => `<li>${a}</li>`).join("")
    : "<li>Keine</li>";

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #d97706; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">Neue Anfrage über knipserl.de</h1>
        <p style="margin: 5px 0 0; opacity: 0.9;">${data.art}</p>
      </div>
      <div style="background: #fafaf9; padding: 20px; border: 1px solid #e7e5e4;">
        <h2 style="color: #292524; margin-top: 0;">Kontaktdaten</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px 0; color: #78716c;">Name:</td><td style="padding: 8px 0;"><strong>${data.vorname} ${data.nachname}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #78716c;">E-Mail:</td><td style="padding: 8px 0;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #78716c;">Telefon:</td><td style="padding: 8px 0;"><a href="tel:${data.telefon}">${data.telefon}</a></td></tr>
          <tr><td style="padding: 8px 0; color: #78716c;">Event:</td><td style="padding: 8px 0;">${data.eventType}</td></tr>
          <tr><td style="padding: 8px 0; color: #78716c;">Datum:</td><td style="padding: 8px 0;">${data.datum}</td></tr>
          <tr><td style="padding: 8px 0; color: #78716c;">Location:</td><td style="padding: 8px 0;">${data.location}</td></tr>
        </table>

        ${
          data.addons
            ? `
        <h2 style="color: #292524;">Gewählte Extras</h2>
        <ul>${addonsList}</ul>
        `
            : ""
        }

        ${
          data.deliveryDistance !== undefined
            ? `
        <h2 style="color: #292524;">Fahrtkosten</h2>
        <p>Entfernung: ${data.deliveryDistance} km — Kosten: ${data.deliveryPrice?.toFixed(2)} €</p>
        `
            : ""
        }

        ${
          data.totalPrice !== undefined
            ? `
        <div style="background: #292524; color: white; padding: 15px; border-radius: 8px; margin-top: 20px;">
          <h2 style="margin: 0; color: #fbbf24;">Gesamtpreis: ${data.totalPrice.toFixed(2)} €</h2>
        </div>
        `
            : ""
        }

        ${
          data.nachricht
            ? `
        <h2 style="color: #292524;">Nachricht</h2>
        <p style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #e7e5e4;">${data.nachricht}</p>
        `
            : ""
        }
      </div>
      <div style="padding: 15px; text-align: center; color: #a8a29e; font-size: 12px;">
        Gesendet über knipserl.de Preiskonfigurator
      </div>
    </div>
  `;
}

export async function POST(request: NextRequest) {
  try {
    const data: AnfragePayload = await request.json();

    // Basic validation
    if (!data.vorname || !data.nachname || !data.email || !data.telefon) {
      return NextResponse.json(
        { error: "Pflichtfelder fehlen" },
        { status: 400 }
      );
    }

    const subject = `Neue Anfrage: ${data.art} – ${data.vorname} ${data.nachname} (${data.eventType})`;
    const htmlBody = buildEmailHtml(data);

    await sendMailViaGraph(subject, htmlBody);

    // TODO: Also save to admin dashboard database when available
    // await saveToDatabase(data);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Anfrage error:", error);
    return NextResponse.json(
      { error: "Interner Fehler beim Senden der Anfrage" },
      { status: 500 }
    );
  }
}
