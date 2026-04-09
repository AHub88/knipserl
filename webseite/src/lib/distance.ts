import { DISTANCE_TIERS, MAX_DELIVERY_KM } from "./constants";

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

interface TravelPricingTier {
  distanceKm: number;
  customerPrice: number;
}

export interface DistanceResult {
  distanceKm: number;
  price: number;
  outsideDeliveryArea: boolean;
  destinationName: string;
  destinationLat: number;
  destinationLon: number;
}

// Cache for dynamic pricing tiers
let cachedTiers: TravelPricingTier[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Fetch travel pricing tiers from admin API, with fallback to hardcoded tiers
 */
async function fetchPricingTiers(): Promise<TravelPricingTier[]> {
  if (cachedTiers && Date.now() - cacheTimestamp < CACHE_TTL) {
    return cachedTiers;
  }

  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
  if (!adminUrl) {
    return DISTANCE_TIERS.map((t) => ({ distanceKm: t.maxKm === Infinity ? 9999 : t.maxKm, customerPrice: t.price }));
  }

  try {
    const res = await fetch(`${adminUrl}/api/travel-pricing/public`);
    if (!res.ok) throw new Error();
    const tiers: TravelPricingTier[] = await res.json();
    if (tiers.length > 0) {
      cachedTiers = tiers;
      cacheTimestamp = Date.now();
      return tiers;
    }
  } catch {
    // Fallback to hardcoded tiers
  }

  return DISTANCE_TIERS.map((t) => ({ distanceKm: t.maxKm === Infinity ? 9999 : t.maxKm, customerPrice: t.price }));
}

/**
 * Geocode an address using Nominatim (OpenStreetMap) - DSGVO compliant
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodingResult | null> {
  const query = encodeURIComponent(address);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1&countrycodes=de,at`,
    {
      headers: {
        "User-Agent": "Knipserl-Fotobox-Website/1.0",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (!data.length) return null;

  return {
    lat: parseFloat(data[0].lat),
    lon: parseFloat(data[0].lon),
    display_name: data[0].display_name,
  };
}

/**
 * Calculate driving distance using OSRM (Open Source Routing Machine) - DSGVO compliant
 */
export async function calculateDrivingDistance(
  originLat: number,
  originLon: number,
  destLat: number,
  destLon: number
): Promise<number | null> {
  const res = await fetch(
    `https://router.project-osrm.org/route/v1/driving/${originLon},${originLat};${destLon},${destLat}?overview=false`,
    {
      headers: {
        "User-Agent": "Knipserl-Fotobox-Website/1.0",
      },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (data.code !== "Ok" || !data.routes?.length) return null;

  return Math.round(data.routes[0].distance / 1000);
}

/**
 * Get the delivery price for a given distance using dynamic tiers
 */
function getDeliveryPriceFromTiers(distanceKm: number, tiers: TravelPricingTier[]): number {
  // Find the highest tier <= distanceKm
  let price = 0;
  for (const tier of tiers) {
    if (distanceKm >= tier.distanceKm) {
      price = tier.customerPrice;
    } else {
      break;
    }
  }
  return price;
}

/**
 * Get the max delivery distance from tiers
 */
function getMaxDeliveryKm(tiers: TravelPricingTier[]): number {
  if (tiers.length === 0) return MAX_DELIVERY_KM;
  return tiers[tiers.length - 1].distanceKm;
}

/**
 * Full distance calculation from destination address
 * Origin is always Rosenheim
 */
export async function calculateDeliveryCost(
  destinationAddress: string
): Promise<DistanceResult | null> {
  const ORIGIN_LAT = 47.8571;
  const ORIGIN_LON = 12.1181;

  const destination = await geocodeAddress(destinationAddress);
  if (!destination) return null;

  const distanceKm = await calculateDrivingDistance(
    ORIGIN_LAT,
    ORIGIN_LON,
    destination.lat,
    destination.lon
  );

  if (distanceKm === null) return null;

  const tiers = await fetchPricingTiers();
  const maxKm = getMaxDeliveryKm(tiers);

  return {
    distanceKm,
    price: getDeliveryPriceFromTiers(distanceKm, tiers),
    outsideDeliveryArea: distanceKm > maxKm,
    destinationName: destination.display_name,
    destinationLat: destination.lat,
    destinationLon: destination.lon,
  };
}
