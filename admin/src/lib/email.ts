/**
 * Email sending via Microsoft Graph API.
 * Uses the same Azure credentials as the webseite project.
 *
 * Required env vars:
 * - AZURE_TENANT_ID
 * - AZURE_CLIENT_ID
 * - AZURE_CLIENT_SECRET
 * - MAIL_FROM (default: info@knipserl.de)
 */

async function getAccessToken(): Promise<string> {
  const tenantId = process.env.AZURE_TENANT_ID;
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure credentials not configured (AZURE_TENANT_ID, AZURE_CLIENT_ID, AZURE_CLIENT_SECRET)");
  }

  const res = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        scope: "https://graph.microsoft.com/.default",
        grant_type: "client_credentials",
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`Token request failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function sendEmail({
  to,
  subject,
  html,
  cc,
}: {
  to: string;
  subject: string;
  html: string;
  cc?: string;
}): Promise<void> {
  const senderEmail = process.env.MAIL_FROM || "info@knipserl.de";
  const accessToken = await getAccessToken();

  const message: Record<string, unknown> = {
    subject,
    body: { contentType: "HTML", content: html },
    toRecipients: [{ emailAddress: { address: to } }],
  };

  if (cc) {
    message.ccRecipients = [{ emailAddress: { address: cc } }];
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${senderEmail}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Graph sendMail failed: ${res.status} ${errorText}`);
  }
}

export function isEmailConfigured(): boolean {
  return !!(process.env.AZURE_TENANT_ID && process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET);
}
