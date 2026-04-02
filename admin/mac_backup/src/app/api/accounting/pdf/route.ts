import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const type = searchParams.get("type"); // "invoice" | "quote"
  const id = searchParams.get("id");

  if (!type || !id || !["invoice", "quote"].includes(type)) {
    return NextResponse.json(
      { error: "Parameter 'type' (invoice|quote) und 'id' erforderlich" },
      { status: 400 }
    );
  }

  try {
    let doc: {
      number: string;
      items: Array<{ description: string; quantity: number; unitPrice: number; total: number }>;
      totalAmount: number;
      date: Date;
      dueOrValid: Date;
      customerName: string;
      customerEmail: string;
      company: {
        name: string;
        address: string;
        city: string;
        zip: string;
        taxNumber: string | null;
        email: string | null;
        phone: string | null;
        bankName: string | null;
        bankIban: string | null;
        bankBic: string | null;
        isKleinunternehmer: boolean;
        logoUrl: string | null;
      };
    };

    if (type === "invoice") {
      const invoice = await prisma.invoice.findUnique({
        where: { id },
        include: {
          order: { select: { customerName: true, customerEmail: true, locationAddress: true } },
          company: true,
        },
      });
      if (!invoice) {
        return NextResponse.json({ error: "Rechnung nicht gefunden" }, { status: 404 });
      }
      doc = {
        number: invoice.invoiceNumber,
        items: invoice.items as typeof doc.items,
        totalAmount: invoice.totalAmount,
        date: invoice.createdAt,
        dueOrValid: invoice.dueDate,
        customerName: invoice.order.customerName,
        customerEmail: invoice.order.customerEmail ?? "",
        company: invoice.company,
      };
    } else {
      const quote = await prisma.quote.findUnique({
        where: { id },
        include: {
          order: { select: { customerName: true, customerEmail: true, locationAddress: true } },
          company: true,
        },
      });
      if (!quote) {
        return NextResponse.json({ error: "Angebot nicht gefunden" }, { status: 404 });
      }
      doc = {
        number: quote.quoteNumber,
        items: quote.items as typeof doc.items,
        totalAmount: quote.totalAmount,
        date: quote.createdAt,
        dueOrValid: quote.validUntil,
        customerName: quote.order.customerName,
        customerEmail: quote.order.customerEmail ?? "",
        company: quote.company,
      };
    }

    const isInvoice = type === "invoice";
    const title = isInvoice ? "Rechnung" : "Angebot";
    const dueLabel = isInvoice ? "F\u00e4llig am" : "G\u00fcltig bis";

    const formatDate = (d: Date) =>
      d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });

    const formatAmount = (v: number) =>
      v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const itemsHtml = doc.items
      .map(
        (item, i) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center;color:#666;">${i + 1}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;">${escapeHtml(item.description)}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;">${formatAmount(item.unitPrice)} &euro;</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:600;">${formatAmount(item.total)} &euro;</td>
        </tr>`
      )
      .join("\n");

    const kleinunternehmerNotice = doc.company.isKleinunternehmer
      ? `<p style="margin-top:24px;font-size:11px;color:#888;line-height:1.5;">
          Gem&auml;&szlig; &sect; 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
        </p>`
      : "";

    const bankInfo =
      isInvoice && doc.company.bankIban
        ? `<div style="margin-top:24px;padding:16px;background:#f9f9f9;border-radius:6px;font-size:12px;line-height:1.6;">
            <strong>Bankverbindung</strong><br/>
            ${doc.company.bankName ? `${escapeHtml(doc.company.bankName)}<br/>` : ""}
            IBAN: ${escapeHtml(doc.company.bankIban)}<br/>
            ${doc.company.bankBic ? `BIC: ${escapeHtml(doc.company.bankBic)}` : ""}
          </div>`
        : "";

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <title>${title} ${escapeHtml(doc.number)}</title>
  <style>
    @page {
      size: A4;
      margin: 20mm 20mm 25mm 20mm;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 13px;
      color: #1a1a1a;
      line-height: 1.5;
      background: #fff;
      padding: 40px;
      max-width: 210mm;
      margin: 0 auto;
    }
    @media print {
      body { padding: 0; }
    }
    table { border-collapse: collapse; }
  </style>
</head>
<body>
  <!-- Company Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <h1 style="font-size:22px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">
        ${escapeHtml(doc.company.name)}
      </h1>
      <p style="font-size:12px;color:#666;line-height:1.6;">
        ${escapeHtml(doc.company.address)}<br/>
        ${escapeHtml(doc.company.zip)} ${escapeHtml(doc.company.city)}<br/>
        ${doc.company.email ? escapeHtml(doc.company.email) + "<br/>" : ""}
        ${doc.company.phone ? `Tel: ${escapeHtml(doc.company.phone)}` : ""}
      </p>
      ${doc.company.taxNumber ? `<p style="font-size:11px;color:#888;margin-top:4px;">Steuernr: ${escapeHtml(doc.company.taxNumber)}</p>` : ""}
    </div>
    <div style="text-align:right;">
      <span style="display:inline-block;background:#F6A11C;color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:6px 16px;border-radius:4px;">
        ${title}
      </span>
    </div>
  </div>

  <!-- Customer + Meta -->
  <div style="display:flex;justify-content:space-between;margin-bottom:32px;">
    <div>
      <p style="font-size:10px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:6px;">
        ${isInvoice ? "Rechnungsempf\u00e4nger" : "Angebotsempf\u00e4nger"}
      </p>
      <p style="font-size:14px;font-weight:600;">${escapeHtml(doc.customerName)}</p>
      ${doc.customerEmail ? `<p style="font-size:12px;color:#666;">${escapeHtml(doc.customerEmail)}</p>` : ""}
    </div>
    <div style="text-align:right;">
      <table style="font-size:12px;margin-left:auto;">
        <tr>
          <td style="padding:2px 12px 2px 0;color:#666;">${title}snr:</td>
          <td style="font-weight:600;">${escapeHtml(doc.number)}</td>
        </tr>
        <tr>
          <td style="padding:2px 12px 2px 0;color:#666;">Datum:</td>
          <td>${formatDate(doc.date)}</td>
        </tr>
        <tr>
          <td style="padding:2px 12px 2px 0;color:#666;">${dueLabel}:</td>
          <td>${formatDate(doc.dueOrValid)}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Line Items -->
  <table style="width:100%;margin-bottom:16px;">
    <thead>
      <tr style="background:#f5f5f5;">
        <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:40px;">Pos</th>
        <th style="padding:10px 12px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;">Beschreibung</th>
        <th style="padding:10px 12px;text-align:center;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:60px;">Menge</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:100px;">Einzelpreis</th>
        <th style="padding:10px 12px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:100px;">Gesamt</th>
      </tr>
    </thead>
    <tbody>
      ${itemsHtml}
    </tbody>
  </table>

  <!-- Total -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:8px;">
    <table style="font-size:14px;">
      <tr>
        <td style="padding:6px 20px 6px 0;font-weight:700;">Gesamtbetrag:</td>
        <td style="padding:6px 0;font-weight:700;font-size:16px;">${formatAmount(doc.totalAmount)} &euro;</td>
      </tr>
    </table>
  </div>

  ${kleinunternehmerNotice}
  ${bankInfo}

  <!-- Footer -->
  <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e5e5;font-size:10px;color:#999;text-align:center;">
    ${escapeHtml(doc.company.name)} | ${escapeHtml(doc.company.address)} | ${escapeHtml(doc.company.zip)} ${escapeHtml(doc.company.city)}
    ${doc.company.taxNumber ? ` | Steuernr: ${escapeHtml(doc.company.taxNumber)}` : ""}
  </div>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
