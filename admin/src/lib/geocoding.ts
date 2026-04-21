import { prisma } from "@/lib/db";

let cachedGoogleKey: string | null = null;
let cachedAt = 0;

async function getGoogleKey(): Promise<string> {
  // Cache for 5 minutes
  if (cachedGoogleKey && Date.now() - cachedAt < 5 * 60 * 1000) {
    return cachedGoogleKey;
  }
  // Try DB first, then env var fallback
  const setting = await prisma.appSetting.findUnique({ where: { key: "googleApiKey" } });
  const key = setting?.value || process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Google API Key nicht konfiguriert (Einstellungen → Google API)");
  cachedGoogleKey = key;
  cachedAt = Date.now();
  return key;
}

function getOrsKey() {
  return process.env.ORS_API_KEY ?? "";
}

export type GeocodeSuggestion = {
  label: string;
  name?: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
};

export type GeocodeMode = "address" | "place";

/**
 * Autocomplete via Google Places. mode="address" liefert reine Adressen,
 * mode="place" liefert Betriebsstaetten (Locations, Firmen) inkl. Name.
 */
export async function geocodeAutocomplete(
  query: string,
  mode: GeocodeMode = "address"
): Promise<GeocodeSuggestion[]> {
  const key = await getGoogleKey();

  const params = new URLSearchParams({
    input: query,
    types: mode === "place" ? "establishment" : "address",
    components: "country:de",
    language: "de",
    key,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
  );
  if (!res.ok) return [];

  const data = await res.json();
  if (data.status !== "OK" || !data.predictions?.length) return [];

  const includeName = mode === "place";
  const results: GeocodeSuggestion[] = [];
  for (const pred of data.predictions.slice(0, 5)) {
    const detail = await getPlaceDetails(pred.place_id, key, includeName);
    if (detail) results.push(detail);
  }

  return results;
}

async function getPlaceDetails(
  placeId: string,
  key: string,
  includeName = false
): Promise<GeocodeSuggestion | null> {
  const fields = includeName
    ? "name,formatted_address,address_components,geometry"
    : "formatted_address,address_components,geometry";

  const params = new URLSearchParams({
    place_id: placeId,
    fields,
    language: "de",
    key,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params}`
  );
  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "OK") return null;

  const result = data.result;
  const components = result.address_components ?? [];

  const get = (type: string) =>
    components.find((c: any) => c.types.includes(type))?.long_name ?? "";

  const street = [get("route"), get("street_number")].filter(Boolean).join(" ");
  const zip = get("postal_code");
  const city = get("locality") || get("sublocality") || get("administrative_area_level_3");

  return {
    label: result.formatted_address ?? "",
    name: includeName ? result.name : undefined,
    street,
    zip,
    city,
    lat: result.geometry?.location?.lat ?? 0,
    lng: result.geometry?.location?.lng ?? 0,
  };
}

/**
 * Calculate driving distance via Google Directions API
 * Returns distance in km (driving route, not straight line)
 */
export async function calculateDrivingDistance(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): Promise<number | null> {
  const key = await getGoogleKey();

  const params = new URLSearchParams({
    origin: `${fromLat},${fromLng}`,
    destination: `${toLat},${toLng}`,
    mode: "driving",
    key,
  });

  const res = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?${params}`
  );

  if (!res.ok) return null;

  const data = await res.json();
  if (data.status !== "OK" || !data.routes?.length) return null;

  const meters = data.routes[0].legs?.[0]?.distance?.value;
  if (meters == null) return null;

  // Convert meters to km, round to 1 decimal
  return Math.round((meters / 1000) * 10) / 10;
}
