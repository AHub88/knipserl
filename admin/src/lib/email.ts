/**
 * Email sending via Microsoft Graph API.
 * Credentials loaded from DB (AppSetting) with env var fallback.
 */

import { prisma } from "@/lib/db";

async function getCredential(key: string, envKey: string): Promise<string> {
  try {
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    if (setting?.value) return setting.value;
  } catch { /* DB not available, fall through to env */ }
  return process.env[envKey] || "";
}

async function getCredentials() {
  const [tenantId, clientId, clientSecret, mailFrom] = await Promise.all([
    getCredential("azure_tenant_id", "AZURE_TENANT_ID"),
    getCredential("azure_client_id", "AZURE_CLIENT_ID"),
    getCredential("azure_client_secret", "AZURE_CLIENT_SECRET"),
    getCredential("mail_from", "MAIL_FROM"),
  ]);
  return { tenantId, clientId, clientSecret, mailFrom: mailFrom || "info@knipserl.de" };
}

async function getAccessToken(): Promise<{ token: string; mailFrom: string }> {
  const { tenantId, clientId, clientSecret, mailFrom } = await getCredentials();

  if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Azure credentials not configured. Bitte in Einstellungen → E-Mail Zugangsdaten eintragen.");
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
  return { token: data.access_token, mailFrom };
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
  const { token, mailFrom } = await getAccessToken();

  const message: Record<string, unknown> = {
    subject,
    body: { contentType: "HTML", content: html },
    toRecipients: [{ emailAddress: { address: to } }],
  };

  if (cc) {
    message.ccRecipients = [{ emailAddress: { address: cc } }];
  }

  const res = await fetch(
    `https://graph.microsoft.com/v1.0/users/${mailFrom}/sendMail`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
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

export async function isEmailConfigured(): Promise<boolean> {
  const { tenantId, clientId, clientSecret } = await getCredentials();
  return !!(tenantId && clientId && clientSecret);
}
