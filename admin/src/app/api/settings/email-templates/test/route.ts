import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import {
  getSampleInquiryVars,
  replaceInquiryVars,
  wrapInquiryEmailHtml,
} from "@/lib/inquiry-email";

// POST /api/settings/email-templates/test
// Sendet eine Test-Mail an die E-Mail-Adresse des eingeloggten Admins —
// mit Sample-Werten anstelle der echten Kundenvariablen.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  if (!session.user.email) {
    return NextResponse.json(
      { error: "Keine E-Mail-Adresse im Admin-Profil hinterlegt" },
      { status: 400 },
    );
  }

  if (!(await isEmailConfigured())) {
    return NextResponse.json(
      { error: "E-Mail-Versand nicht konfiguriert" },
      { status: 503 },
    );
  }

  let payload: { subject?: unknown; body?: unknown };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiges JSON" }, { status: 400 });
  }

  const { subject, body } = payload;
  if (typeof subject !== "string" || typeof body !== "string") {
    return NextResponse.json(
      { error: "subject und body (jeweils string) erforderlich" },
      { status: 400 },
    );
  }

  const vars = getSampleInquiryVars();
  const renderedSubject = replaceInquiryVars(subject, vars);
  const renderedBody = replaceInquiryVars(body, vars);
  const html = wrapInquiryEmailHtml(renderedBody, { companyName: vars.companyName });

  try {
    await sendEmail({
      to: session.user.email,
      subject: `[TEST] ${renderedSubject}`,
      html,
    });
    return NextResponse.json({ ok: true, sentTo: session.user.email });
  } catch (e) {
    console.error("[email-templates-test] send failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Versand fehlgeschlagen" },
      { status: 500 },
    );
  }
}
