import { prisma } from "@/lib/db";

/**
 * Generate next quote number for a company.
 * Format: PREFIX-YEAR-NNN (e.g. EU-A-2026-001)
 */
export async function getNextQuoteNumber(companyId: string): Promise<string> {
  const company = await prisma.company.update({
    where: { id: companyId },
    data: { quoteNumberCurrent: { increment: 1 } },
    select: { quotePrefix: true, quoteNumberCurrent: true },
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
    select: { invoicePrefix: true, invoiceNumberCurrent: true },
  });
  const year = new Date().getFullYear();
  const num = String(company.invoiceNumberCurrent).padStart(3, "0");
  return `${company.invoicePrefix}-${year}-${num}`;
}

/**
 * Generate next order confirmation number for a company.
 * Uses quote prefix + "AB" as fallback until confirmationPrefix column exists.
 */
export async function getNextConfirmationNumber(companyId: string): Promise<string> {
  // Try using confirmationPrefix, fall back to quotePrefix-based if column doesn't exist
  try {
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { confirmationNumberCurrent: { increment: 1 } },
      select: { confirmationPrefix: true, confirmationNumberCurrent: true },
    });
    const year = new Date().getFullYear();
    const num = String(company.confirmationNumberCurrent).padStart(3, "0");
    return `${company.confirmationPrefix}-${year}-${num}`;
  } catch {
    // Fallback: use quote number sequence with AB prefix
    const company = await prisma.company.update({
      where: { id: companyId },
      data: { quoteNumberCurrent: { increment: 1 } },
      select: { quotePrefix: true, quoteNumberCurrent: true },
    });
    const year = new Date().getFullYear();
    const num = String(company.quoteNumberCurrent).padStart(3, "0");
    return `AB-${company.quotePrefix}-${year}-${num}`;
  }
}
