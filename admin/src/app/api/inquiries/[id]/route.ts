import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";

async function getTemplate(key: string): Promise<{ subject: string; body: string } | null> {
  try {
    const setting = await prisma.appSetting.findUnique({ where: { key } });
    return setting ? JSON.parse(setting.value) : null;
  } catch { return null; }
}

function replaceVars(text: string, vars: Record<string, string>): string {
  let result = text;
  for (const [key, val] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), val);
  }
  return result;
}

async function sendInquiryEmail(
  templateKey: string,
  inquiry: { customerName: string; customerEmail: string; eventType: string; eventDate: Date; locationName: string },
  companyName: string
) {
  if (!isEmailConfigured() || !inquiry.customerEmail) return;

  const template = await getTemplate(templateKey);
  if (!template) return;

  const vars: Record<string, string> = {
    customerName: inquiry.customerName,
    customerEmail: inquiry.customerEmail,
    eventType: inquiry.eventType,
    eventDate: inquiry.eventDate.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }),
    locationName: inquiry.locationName,
    companyName,
  };

  const subject = replaceVars(template.subject, vars);
  const bodyText = replaceVars(template.body, vars);
  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;padding:30px;">
    <p style="white-space:pre-line;color:#333;font-size:15px;line-height:1.6;">${bodyText.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  </div>`;

  try {
    await sendEmail({ to: inquiry.customerEmail, subject, html });
  } catch (e) {
    console.error("[inquiry-email]", e);
  }
}

// GET /api/inquiries/:id
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { order: { include: { driver: true, company: { select: { id: true, name: true } } } } },
  });

  if (!inquiry) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
  }

  return NextResponse.json(inquiry);
}

// PATCH /api/inquiries/:id - Accept or reject
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { action, price, paymentMethod, boxPrice, travelCost, extrasCost, extras, discount, discountType } = body;

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });
  if (!inquiry) {
    return NextResponse.json({ error: "Anfrage nicht gefunden" }, { status: 404 });
  }

  if (inquiry.status === "ACCEPTED" || inquiry.status === "REJECTED") {
    return NextResponse.json(
      { error: "Anfrage wurde bereits abgeschlossen" },
      { status: 400 }
    );
  }

  if (action === "accept") {
    // Determine company based on customer type
    const companyType = inquiry.customerType === "BUSINESS" ? "GbR" : "Einzelunternehmen";
    const company = await prisma.company.findFirst({
      where: { name: { contains: companyType === "GbR" ? "GbR" : "Andreas Huber" } },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Keine passende Firma gefunden. Bitte Firmen in den Einstellungen anlegen." },
        { status: 400 }
      );
    }

    // Find or create customer
    let customerId = inquiry.customerId;
    if (!customerId) {
      const emailLower = inquiry.customerEmail?.toLowerCase().trim();
      if (emailLower) {
        const existing = await prisma.customer.findFirst({
          where: { email: { equals: emailLower, mode: "insensitive" } },
        });
        if (existing) customerId = existing.id;
      }
      if (!customerId) {
        const newCustomer = await prisma.customer.create({
          data: {
            name: inquiry.customerName,
            email: inquiry.customerEmail || null,
            phone: inquiry.customerPhone || null,
            customerType: inquiry.customerType,
          },
        });
        customerId = newCustomer.id;
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedInquiry = await tx.inquiry.update({
        where: { id },
        data: { status: "ACCEPTED", customerId },
      });

      const order = await tx.order.create({
        data: {
          inquiryId: id,
          customerId,
          companyId: company.id,
          paymentMethod: paymentMethod ?? "INVOICE",
          price: price ?? 0,
          boxPrice: boxPrice ?? null,
          travelCost: travelCost ?? null,
          extrasCost: extrasCost ?? null,
          discount: discount ?? null,
          discountType: discountType ?? null,
          eventDate: inquiry.eventDate,
          eventType: inquiry.eventType,
          locationName: inquiry.locationName,
          locationAddress: inquiry.locationAddress,
          customerName: inquiry.customerName,
          customerEmail: inquiry.customerEmail,
          customerPhone: inquiry.customerPhone,
          extras: extras ?? inquiry.extras,
        },
      });

      return { inquiry: updatedInquiry, order };
    });

    // Send confirmation email
    const companyName = company?.name ?? "Knipserl Fotobox";
    sendInquiryEmail("email_template_inquiry_accepted", inquiry, companyName);

    return NextResponse.json(result);
  }

  if (action === "reject") {
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: "REJECTED" },
    });

    // Send rejection email
    sendInquiryEmail("email_template_inquiry_rejected", inquiry, "Knipserl Fotobox");

    return NextResponse.json(updatedInquiry);
  }

  if (action === "updateStatus") {
    const { status: newStatus } = body;
    const validStatuses = ["NEW", "CONTACTED", "WAITING", "ACCEPTED", "REJECTED"];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
    }
    const updatedInquiry = await prisma.inquiry.update({
      where: { id },
      data: { status: newStatus },
    });
    return NextResponse.json(updatedInquiry);
  }

  return NextResponse.json({ error: "Ungültige Aktion" }, { status: 400 });
}
