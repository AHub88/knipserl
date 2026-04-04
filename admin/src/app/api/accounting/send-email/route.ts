import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { quoteEmail, invoiceEmail, confirmationEmail } from "@/lib/email-templates";

type LineItem = {
  title?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  optional?: boolean;
};

// POST /api/accounting/send-email
// Body: { type: "quote" | "invoice" | "confirmation", id: string }
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "E-Mail nicht konfiguriert. Bitte AZURE_TENANT_ID, AZURE_CLIENT_ID und AZURE_CLIENT_SECRET setzen." },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { type, id } = body;

  if (!type || !id || !["quote", "invoice", "confirmation"].includes(type)) {
    return NextResponse.json({ error: "type (quote|invoice|confirmation) und id erforderlich" }, { status: 400 });
  }

  try {
    if (type === "quote") {
      const quote = await prisma.quote.findUnique({
        where: { id },
        include: { company: { select: { name: true, bankName: true, bankIban: true, bankBic: true } }, order: { select: { customerName: true, customerEmail: true } } },
      });
      if (!quote) return NextResponse.json({ error: "Angebot nicht gefunden" }, { status: 404 });

      const recipientEmail = quote.order?.customerEmail;
      if (!recipientEmail) {
        return NextResponse.json({ error: "Keine E-Mail-Adresse beim Empfänger hinterlegt" }, { status: 400 });
      }

      const { subject, html } = quoteEmail({
        recipientName: quote.order?.customerName || "Kunde",
        quoteNumber: quote.quoteNumber,
        companyName: quote.company.name,
        items: quote.items as LineItem[],
        totalAmount: quote.totalAmount,
        validUntil: quote.validUntil,
        deliveryDate: quote.deliveryDate,
        notes: quote.notes,
      });

      await sendEmail({ to: recipientEmail, subject, html });

      // Update status to SENT
      await prisma.quote.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date() },
      });

      return NextResponse.json({ ok: true, sentTo: recipientEmail });
    }

    if (type === "invoice") {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: { company: { select: { name: true, bankName: true, bankIban: true, bankBic: true } }, order: { select: { customerName: true, customerEmail: true } } },
      });
      if (!invoice) return NextResponse.json({ error: "Rechnung nicht gefunden" }, { status: 404 });

      const recipientEmail = invoice.order?.customerEmail;
      if (!recipientEmail) {
        return NextResponse.json({ error: "Keine E-Mail-Adresse beim Empfänger hinterlegt" }, { status: 400 });
      }

      const { subject, html } = invoiceEmail({
        recipientName: invoice.order?.customerName || "Kunde",
        invoiceNumber: invoice.invoiceNumber,
        companyName: invoice.company.name,
        items: invoice.items as LineItem[],
        totalAmount: invoice.totalAmount,
        dueDate: invoice.dueDate,
        deliveryDate: invoice.deliveryDate,
        notes: invoice.notes,
        bankName: invoice.company.bankName,
        bankIban: invoice.company.bankIban,
        bankBic: invoice.company.bankBic,
      });

      await sendEmail({ to: recipientEmail, subject, html });

      await prisma.invoice.update({
        where: { id },
        data: { status: "SENT", sentAt: new Date() },
      });

      return NextResponse.json({ ok: true, sentTo: recipientEmail });
    }

    if (type === "confirmation") {
      const conf = await prisma.orderConfirmation.findUnique({
        where: { id },
        include: { company: { select: { name: true, bankName: true, bankIban: true, bankBic: true } }, order: { select: { customerName: true, customerEmail: true } } },
      });
      if (!conf) return NextResponse.json({ error: "Bestätigung nicht gefunden" }, { status: 404 });

      const recipientEmail = conf.order?.customerEmail;
      if (!recipientEmail) {
        return NextResponse.json({ error: "Keine E-Mail-Adresse beim Empfänger hinterlegt" }, { status: 400 });
      }

      const { subject, html } = confirmationEmail({
        recipientName: conf.order?.customerName || "Kunde",
        confirmationNumber: conf.confirmationNumber,
        companyName: conf.company.name,
        items: conf.items as LineItem[],
        totalAmount: conf.totalAmount,
        deliveryDate: conf.deliveryDate,
        notes: conf.notes,
      });

      await sendEmail({ to: recipientEmail, subject, html });

      await prisma.orderConfirmation.update({
        where: { id },
        data: { sentAt: new Date() },
      });

      return NextResponse.json({ ok: true, sentTo: recipientEmail });
    }

    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  } catch (error) {
    console.error("[send-email]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "E-Mail-Versand fehlgeschlagen" },
      { status: 500 }
    );
  }
}
