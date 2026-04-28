import { prisma } from "@/lib/db";
import { DRIVER_BONUS_DEFAULTS } from "@/lib/extras-pricing";

/**
 * Lädt die aktuell konfigurierten Bonus-Sätze pro Extra aus AppSetting,
 * gemerged mit den Defaults. Schlüssel: `driver_bonus_<KEY>`.
 *
 * Server-only — wird in API-Routes und Server-Components verwendet.
 * Pure Berechnungs-Helper liegen in `driver-compensation.ts` und können
 * auch im Client genutzt werden.
 */
export async function loadDriverBonusPrices(): Promise<Record<string, number>> {
  const settings = await prisma.appSetting.findMany({
    where: { key: { startsWith: "driver_bonus_" } },
  });
  const fromDb: Record<string, number> = {};
  for (const s of settings) {
    const n = Number(s.value);
    if (Number.isFinite(n)) fromDb[s.key.replace("driver_bonus_", "")] = n;
  }
  return { ...DRIVER_BONUS_DEFAULTS, ...fromDb };
}
