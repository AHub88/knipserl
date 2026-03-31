import { prisma } from "@/lib/db";

export type TravelPriceTier = {
  distanceKm: number;
  driverCompensation: number;
  customerPrice: number;
};

export type TravelPriceResult = {
  customerPrice: number;
  driverCompensation: number;
};

/**
 * Synchronous calculation from a pre-loaded tiers array.
 * Uses step-based pricing: finds the highest tier ≤ distanceKm.
 */
export function calculateTravelPriceFromTiers(
  tiers: TravelPriceTier[],
  distanceKm: number
): TravelPriceResult {
  if (tiers.length === 0) return { customerPrice: 0, driverCompensation: 0 };

  // Tiers must be sorted ascending
  const sorted = [...tiers].sort((a, b) => a.distanceKm - b.distanceKm);

  // Find highest tier ≤ distanceKm
  let matched = sorted[0];
  for (const tier of sorted) {
    if (tier.distanceKm <= distanceKm) {
      matched = tier;
    } else {
      break;
    }
  }

  return {
    customerPrice: matched.customerPrice,
    driverCompensation: matched.driverCompensation,
  };
}

/**
 * Async calculation that fetches tiers from DB.
 */
export async function calculateTravelPrice(
  distanceKm: number
): Promise<TravelPriceResult> {
  const tiers = await prisma.travelPricingTier.findMany({
    orderBy: { distanceKm: "asc" },
  });
  return calculateTravelPriceFromTiers(tiers, distanceKm);
}
