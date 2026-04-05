import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const CREDENTIAL_KEYS = [
  "azure_tenant_id",
  "azure_client_id",
  "azure_client_secret",
  "mail_from",
] as const;

// GET /api/settings/credentials
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const result: Record<string, string> = {};
  for (const key of CREDENTIAL_KEYS) {
    try {
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (setting) {
        // Mask secrets - only show last 4 chars
        if (key === "azure_client_secret") {
          result[key] = setting.value ? "••••••••" + setting.value.slice(-4) : "";
        } else {
          result[key] = setting.value;
        }
      } else {
        result[key] = "";
      }
    } catch {
      result[key] = "";
    }
  }

  return NextResponse.json(result);
}

// PUT /api/settings/credentials
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();

  for (const key of CREDENTIAL_KEYS) {
    const value = body[key];
    if (value === undefined) continue;
    // Don't overwrite secret with masked value
    if (key === "azure_client_secret" && value.startsWith("••••")) continue;

    await prisma.appSetting.upsert({
      where: { key },
      create: { key, value: value || "" },
      update: { value: value || "" },
    });
  }

  return NextResponse.json({ ok: true });
}
