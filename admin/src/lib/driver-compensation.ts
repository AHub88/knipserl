import { DRIVER_BONUS_DEFAULTS, normalizeExtraKey } from "@/lib/extras-pricing";

/**
 * Pure Berechnungs-Helper für Fahrer-Vergütung. KEINE Server-Abhängigkeiten —
 * dieses File wird auch von Client-Komponenten importiert (Vergütungsbox auf
 * der Auftragsdetail-Seite, Driver-Report-View). Der DB-Loader für die
 * aktuellen Bonus-Sätze liegt deshalb separat in `driver-bonus-loader.ts`.
 */

export type DriverBonusBreakdown = Record<string, number>;

/**
 * Aus einer Liste aktiver Extras + Bonus-Tabelle das Breakdown
 * {Telefon: 10, HG: 20, ...}. Nur Extras mit Bonus > 0 landen drin —
 * hält den Snapshot kompakt.
 */
export function computeDriverBonusBreakdown(
  extras: string[],
  bonusPrices: Record<string, number>,
): DriverBonusBreakdown {
  const out: DriverBonusBreakdown = {};
  for (const raw of extras ?? []) {
    const key = normalizeExtraKey(raw);
    const amount = bonusPrices[key] ?? 0;
    if (amount > 0) out[key] = amount;
  }
  return out;
}

export function sumBonus(breakdown: DriverBonusBreakdown | null | undefined): number {
  if (!breakdown) return 0;
  return Object.values(breakdown).reduce((s, v) => s + (Number(v) || 0), 0);
}

export type DriverCompensation = {
  base: number;
  breakdown: DriverBonusBreakdown;
  bonusTotal: number;
  total: number;
  hasSecondDriver: boolean;
  perDriver: number;
  isFrozen: boolean;
};

/**
 * Berechnet die Vergütung eines Auftrags.
 *
 * - `base` = Math.abs(setupCost ?? 0)
 * - `breakdown` = eingefrorener Snapshot aus `order.driverBonus`,
 *   oder als Fallback live aus `livePrices` + `extras` (für Alt-Aufträge
 *   ohne Snapshot — wird beim Initial-Re-Import sauber nachgezogen).
 * - `total` = base + bonusTotal
 * - `perDriver` = total / (hasSecondDriver ? 2 : 1)
 * - `isFrozen` = ob Snapshot vorhanden war
 */
export function getDriverCompensation(args: {
  setupCost: number | null;
  extras: string[];
  driverBonus: unknown;
  hasSecondDriver: boolean;
  livePrices?: Record<string, number>;
}): DriverCompensation {
  const base = Math.abs(args.setupCost ?? 0);

  const frozen = args.driverBonus && typeof args.driverBonus === "object"
    ? (args.driverBonus as DriverBonusBreakdown)
    : null;

  const breakdown = frozen ?? computeDriverBonusBreakdown(args.extras, args.livePrices ?? DRIVER_BONUS_DEFAULTS);
  const bonusTotal = sumBonus(breakdown);
  const total = base + bonusTotal;
  const divisor = args.hasSecondDriver ? 2 : 1;

  return {
    base,
    breakdown,
    bonusTotal,
    total,
    hasSecondDriver: args.hasSecondDriver,
    perDriver: total / divisor,
    isFrozen: !!frozen,
  };
}
