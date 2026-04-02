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

    // --- Pagination: split items across pages ---
    const ITEMS_FIRST_PAGE = 12;
    const ITEMS_PER_PAGE = 20;
    const allItems = doc.items;
    const pages: Array<typeof doc.items> = [];

    if (allItems.length <= ITEMS_FIRST_PAGE) {
      pages.push(allItems);
    } else {
      pages.push(allItems.slice(0, ITEMS_FIRST_PAGE));
      let offset = ITEMS_FIRST_PAGE;
      while (offset < allItems.length) {
        pages.push(allItems.slice(offset, offset + ITEMS_PER_PAGE));
        offset += ITEMS_PER_PAGE;
      }
    }

    const totalPages = pages.length;

    const kleinunternehmerNotice = doc.company.isKleinunternehmer
      ? `<p style="margin-top:20px;font-size:10px;color:#888;line-height:1.5;">
          Gem&auml;&szlig; &sect; 19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
        </p>`
      : "";

    const bankInfo =
      isInvoice && doc.company.bankIban
        ? `<div style="margin-top:20px;padding:14px;background:#f9f9f9;border-radius:6px;font-size:11px;line-height:1.6;">
            <strong>Bankverbindung</strong><br/>
            ${doc.company.bankName ? `${escapeHtml(doc.company.bankName)}<br/>` : ""}
            IBAN: ${escapeHtml(doc.company.bankIban)}<br/>
            ${doc.company.bankBic ? `BIC: ${escapeHtml(doc.company.bankBic)}` : ""}
          </div>`
        : "";

    const footerLine = `${escapeHtml(doc.company.name)} | ${escapeHtml(doc.company.address)} | ${escapeHtml(doc.company.zip)} ${escapeHtml(doc.company.city)}${doc.company.taxNumber ? ` | Steuernr: ${escapeHtml(doc.company.taxNumber)}` : ""}`;

    function renderItemRows(items: typeof doc.items, startPos: number) {
      return items
        .map(
          (item, i) => `
          <tr>
            <td style="padding:7px 10px;border-bottom:1px solid #e5e5e5;text-align:center;color:#666;font-size:12px;">${startPos + i}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #e5e5e5;font-size:12px;">${escapeHtml(item.description)}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #e5e5e5;text-align:center;font-size:12px;">${item.quantity}</td>
            <td style="padding:7px 10px;border-bottom:1px solid #e5e5e5;text-align:right;font-size:12px;">${formatAmount(item.unitPrice)} &euro;</td>
            <td style="padding:7px 10px;border-bottom:1px solid #e5e5e5;text-align:right;font-weight:600;font-size:12px;">${formatAmount(item.total)} &euro;</td>
          </tr>`
        )
        .join("\n");
    }

    function renderTableHeader() {
      return `<table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f5f5f5;">
            <th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:36px;">Pos</th>
            <th style="padding:8px 10px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;">Beschreibung</th>
            <th style="padding:8px 10px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:50px;">Menge</th>
            <th style="padding:8px 10px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:90px;">Einzelpreis</th>
            <th style="padding:8px 10px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;color:#666;font-weight:600;border-bottom:2px solid #ddd;width:90px;">Gesamt</th>
          </tr>
        </thead>
        <tbody>`;
    }

    function renderPageFooter(pageNum: number) {
      return `<div style="position:absolute;bottom:0;left:0;right:0;padding:0 20mm 15mm 20mm;">
        <div style="border-top:1px solid #e5e5e5;padding-top:10px;font-size:9px;color:#999;text-align:center;display:flex;justify-content:space-between;">
          <span>${footerLine}</span>
          <span>Seite ${pageNum} von ${totalPages}</span>
        </div>
      </div>`;
    }

    // --- Build pages ---
    let pagesHtml = "";
    let itemPos = 1;

    for (let p = 0; p < pages.length; p++) {
      const isFirst = p === 0;
      const isLast = p === pages.length - 1;
      const pageItems = pages[p];

      pagesHtml += `<div class="page">`;
      pagesHtml += `<div class="page-content">`;

      if (isFirst) {
        // Header
        pagesHtml += `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;">
            <div>
              <h1 style="font-size:20px;font-weight:700;color:#1a1a1a;margin-bottom:4px;">
                ${escapeHtml(doc.company.name)}
              </h1>
              <p style="font-size:11px;color:#666;line-height:1.6;">
                ${escapeHtml(doc.company.address)}<br/>
                ${escapeHtml(doc.company.zip)} ${escapeHtml(doc.company.city)}<br/>
                ${doc.company.email ? escapeHtml(doc.company.email) + "<br/>" : ""}
                ${doc.company.phone ? `Tel: ${escapeHtml(doc.company.phone)}` : ""}
              </p>
              ${doc.company.taxNumber ? `<p style="font-size:10px;color:#888;margin-top:4px;">Steuernr: ${escapeHtml(doc.company.taxNumber)}</p>` : ""}
            </div>
            <div style="text-align:right;">
              <span style="display:inline-block;background:#F6A11C;color:#fff;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:5px 14px;border-radius:4px;">
                ${title}
              </span>
            </div>
          </div>

          <div style="display:flex;justify-content:space-between;margin-bottom:28px;">
            <div>
              <p style="font-size:9px;text-transform:uppercase;letter-spacing:1px;color:#999;margin-bottom:4px;">
                ${isInvoice ? "Rechnungsempf\u00e4nger" : "Angebotsempf\u00e4nger"}
              </p>
              <p style="font-size:13px;font-weight:600;">${escapeHtml(doc.customerName)}</p>
              ${doc.customerEmail ? `<p style="font-size:11px;color:#666;">${escapeHtml(doc.customerEmail)}</p>` : ""}
            </div>
            <div style="text-align:right;">
              <table style="font-size:11px;margin-left:auto;">
                <tr>
                  <td style="padding:2px 10px 2px 0;color:#666;">${title}snr:</td>
                  <td style="font-weight:600;">${escapeHtml(doc.number)}</td>
                </tr>
                <tr>
                  <td style="padding:2px 10px 2px 0;color:#666;">Datum:</td>
                  <td>${formatDate(doc.date)}</td>
                </tr>
                <tr>
                  <td style="padding:2px 10px 2px 0;color:#666;">${dueLabel}:</td>
                  <td>${formatDate(doc.dueOrValid)}</td>
                </tr>
              </table>
            </div>
          </div>`;
      } else {
        // Continuation header
        pagesHtml += `
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;padding-bottom:12px;border-bottom:1px solid #eee;">
            <span style="font-size:13px;font-weight:600;color:#1a1a1a;">${escapeHtml(doc.company.name)}</span>
            <span style="font-size:11px;color:#666;">${title} ${escapeHtml(doc.number)}</span>
          </div>`;
      }

      // Items table
      pagesHtml += renderTableHeader();
      pagesHtml += renderItemRows(pageItems, itemPos);
      pagesHtml += `</tbody></table>`;
      itemPos += pageItems.length;

      // Total + footer content on last page
      if (isLast) {
        pagesHtml += `
          <div style="display:flex;justify-content:flex-end;margin-top:16px;margin-bottom:8px;">
            <table style="font-size:13px;">
              <tr>
                <td style="padding:6px 16px 6px 0;font-weight:700;">Gesamtbetrag:</td>
                <td style="padding:6px 0;font-weight:700;font-size:15px;">${formatAmount(doc.totalAmount)} &euro;</td>
              </tr>
            </table>
          </div>
          ${kleinunternehmerNotice}
          ${bankInfo}`;
      }

      pagesHtml += `</div>`; // .page-content
      pagesHtml += renderPageFooter(p + 1);
      pagesHtml += `</div>`; // .page
    }

    const html = `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8"/>
  <title>${title} ${escapeHtml(doc.number)}</title>
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html {
      background: #e0e0e0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      font-size: 12px;
      color: #1a1a1a;
      line-height: 1.5;
      background: #e0e0e0;
      padding: 40px 0;
    }
    .page {
      position: relative;
      width: 210mm;
      min-height: 297mm;
      background: #fff;
      margin: 0 auto 40px auto;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1);
      border-radius: 2px;
      overflow: hidden;
    }
    .page-content {
      padding: 20mm 20mm 30mm 20mm;
    }
    table { border-collapse: collapse; }

    @media print {
      html, body {
        background: #fff;
        padding: 0;
      }
      .page {
        width: 100%;
        min-height: auto;
        margin: 0;
        box-shadow: none;
        border-radius: 0;
        page-break-after: always;
      }
      .page:last-child {
        page-break-after: avoid;
      }
    }
  </style>
</head>
<body>
  ${pagesHtml}
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
