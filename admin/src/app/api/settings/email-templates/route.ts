import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { DEFAULT_INQUIRY_TEMPLATES } from "@/lib/inquiry-email";

const TEMPLATE_KEYS = [
  "email_template_inquiry_accepted",
  "email_template_inquiry_rejected",
  "email_template_driver_reminder",
] as const;

const DEFAULT_TEMPLATES = DEFAULT_INQUIRY_TEMPLATES;

// GET /api/settings/email-templates
export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const templates: Record<string, { subject: string; body: string }> = {};

  for (const key of TEMPLATE_KEYS) {
    try {
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (setting) {
        templates[key] = JSON.parse(setting.value);
      } else {
        templates[key] = DEFAULT_TEMPLATES[key];
      }
    } catch {
      templates[key] = DEFAULT_TEMPLATES[key];
    }
  }

  return NextResponse.json(templates);
}

// PUT /api/settings/email-templates
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const body = await request.json();
  const { key, subject, body: templateBody } = body;

  if (!TEMPLATE_KEYS.includes(key)) {
    return NextResponse.json({ error: "Ungültiger Template-Key" }, { status: 400 });
  }

  await prisma.appSetting.upsert({
    where: { key },
    create: { key, value: JSON.stringify({ subject, body: templateBody }) },
    update: { value: JSON.stringify({ subject, body: templateBody }) },
  });

  return NextResponse.json({ ok: true });
}
