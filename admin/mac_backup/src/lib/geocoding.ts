function getGoogleKey() {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("GOOGLE_MAPS_API_KEY nicht konfiguriert");
  return key;
}

function getOrsKey() {
  return process.env.ORS_API_KEY ?? "";
}

export type GeocodeSuggestion = {
  label: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
};

/**
 * Autocomplete address search via Google Places Autocomplete
 */
export async function geocodeAutocomplete(
  query: string
): Promise<GeocodeSuggestion[]> {
  const key = getGoogleKey();

  // Use Google Places Autocomplete
  const params = new URLSearchParams({
    input: query,
    types: "address",
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

  // Get details for each prediction (up to 5)
  const results: GeocodeSuggestion[] = [];
  for (const pred of data.predictions.slice(0, 5)) {
    const detail = await getPlaceDetails(pred.place_id, key);
    if (detail) results.push(detail);
  }

  return results;
}

async function getPlaceDetails(
  placeId: string,
  key: string
): Promise<GeocodeSuggestion | null> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "formatted_address,address_components,geometry",
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
  const key = getGoogleKey();

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
