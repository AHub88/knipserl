import { prisma } from "@/lib/db";

/**
 * Generate next quote number for a company.
 * Format: PREFIX-YEAR-NNN (e.g. EU-A-2026-001)
 */
export async function getNextQuoteNumber(companyId: string): Promise<string> {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { quoteNumberCurrent: { increment: 1 } },
  });
  const year = new Date().getFullYear();
  const num = String(company.quoteNumberCurrent).padStart(3, "0");
  return `${company.quotePrefix}-${year}-${num}`;
}

/**
 * Generate next invoice number for a company.
 * Format: PREFIX-YEAR-NNN (e.g. EU-2026-001)
 */
export async function getNextInvoiceNumber(companyId: string): Promise<string> {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { invoiceNumberCurrent: { increment: 1 } },
  });
  const year = new Date().getFullYear();
  const num = String(company.invoiceNumberCurrent).padStart(3, "0");
  return `${company.invoicePrefix}-${year}-${num}`;
}

/**
 * Generate next order confirmation number for a company.
 * Format: PREFIX-YEAR-NNN (e.g. EU-AB-2026-001)
 */
export async function getNextConfirmationNumber(companyId: string): Promise<string> {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { confirmationNumberCurrent: { increment: 1 } },
  });
  const year = new Date().getFullYear();
  const num = String(company.confirmationNumberCurrent).padStart(3, "0");
  return `${company.confirmationPrefix}-${year}-${num}`;
}
