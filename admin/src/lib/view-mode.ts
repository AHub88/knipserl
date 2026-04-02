import { cookies } from "next/headers";
import type { ViewMode } from "./view-mode-context";

/**
 * Server-side: get the effective view mode.
 * Admins can switch view mode via cookie. Other roles always get their own mode.
 */
export async function getEffectiveViewMode(userRole: string): Promise<ViewMode> {
  if (userRole !== "ADMIN") {
    // Non-admins always see their own view
    return userRole === "ADMIN_ACCOUNTING" ? "accounting" : "driver";
  }

  const cookieStore = await cookies();
  const viewCookie = cookieStore.get("viewMode")?.value;
  if (viewCookie === "driver" || viewCookie === "accounting") {
    return viewCookie;
  }
  return "admin";
}

/**
 * Returns true if CASH orders should be hidden (accounting view mode)
 */
export async function shouldHideCashOrders(userRole: string): Promise<boolean> {
  const mode = await getEffectiveViewMode(userRole);
  return mode === "accounting";
}

/**
 * Returns a Prisma where filter to hide CASH orders when in accounting mode
 */
export async function getPaymentFilter(userRole: string): Promise<Record<string, unknown>> {
  const hideCash = await shouldHideCashOrders(userRole);
  return hideCash ? { paymentMethod: "INVOICE" as const } : {};
}
