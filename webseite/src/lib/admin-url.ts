/**
 * Zentrale Auflösung der Admin-API-URL mit Host-basiertem Fallback.
 *
 * Standard-Mapping (ohne ENV):
 * - dev.knipserl.de / localhost → https://dev-admin.knipserl.de
 * - www.knipserl.de / knipserl.de → https://admin.knipserl.de
 *
 * ENV überschreibt: ADMIN_API_URL > ADMIN_PUBLIC_URL > Host-Mapping.
 */
export function getAdminBaseUrl(hostHeader?: string | null): string | null {
  const envUrl = process.env.ADMIN_API_URL || process.env.ADMIN_PUBLIC_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");

  const host = (hostHeader ?? "").toLowerCase().split(":")[0];
  if (!host) return null;

  if (host === "dev.knipserl.de" || host === "localhost" || host.endsWith(".localhost")) {
    return "https://dev-admin.knipserl.de";
  }
  if (host === "knipserl.de" || host === "www.knipserl.de") {
    return "https://admin.knipserl.de";
  }
  return null;
}
