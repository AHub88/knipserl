import { DISTANCE_TIERS, MAX_DELIVERY_KM } from "./constants";

interface GeocodingResult {
  lat: number;
  lon: number;
  display_name: string;
}

interface DistanceResult {
  distanceKm: number;
  price: number;
  outsideDeliveryArea: boolean;
  destinationName: string;
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

  // Convert meters to kilometers, round to nearest integer
  return Math.round(data.routes[0].distance / 1000);
}

/**
 * Get the delivery price for a given distance in km
 */
export function getDeliveryPrice(distanceKm: number): number {
  for (const tier of DISTANCE_TIERS) {
    if (distanceKm <= tier.maxKm) {
      return tier.price;
    }
  }
  return DISTANCE_TIERS[DISTANCE_TIERS.length - 1].price;
}

/**
 * Full distance calculation from destination address
 * Origin is always Rosenheim
 */
export async function calculateDeliveryCost(
  destinationAddress: string
): Promise<DistanceResult | null> {
  // Rosenheim coordinates
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

  return {
    distanceKm,
    price: getDeliveryPrice(distanceKm),
    outsideDeliveryArea: distanceKm > MAX_DELIVERY_KM,
    destinationName: destination.display_name,
  };
}
