export const BOX_PRICE = 379;

/** Aufpreis pro zusätzlicher Papierrolle (über Standard-Paket hinaus). */
export const PAPER_ROLL_PRICE = 99;

export const EXTRAS_PRICES: Record<string, number> = {
  Props: 45,
  Telefon: 100,
  TV: 150,
  Stick: 20,
  HG: 50,
  Social: 50,
  Book: 30,
  LOVE: 150,
};

export const EXTRAS_LABELS: Record<string, string> = {
  Drucker: "Drucker",
  Props: "Requisiten",
  Stick: "USB Stick",
  HG: "Hintergrund",
  LOVE: "LOVE",
  Social: "Online",
  Book: "Gästebuch",
  TV: "TV",
  Telefon: "Telefon",
};

// Marketing-Namen von der Webseite -> kanonische Admin-Keys
const NAME_TO_KEY: Record<string, string> = {
  drucker: "Drucker",
  requisiten: "Props",
  "alle bilder auf usb stick": "Stick",
  "usb stick": "Stick",
  "gästetelefon / audio gästebuch": "Telefon",
  "gaestetelefon / audio gaestebuch": "Telefon",
  "gästetelefon": "Telefon",
  "gaestetelefon": "Telefon",
  telefon: "Telefon",
  "gästebuch inkl. stifte & pads": "Book",
  "gaestebuch inkl. stifte & pads": "Book",
  "gästebuch": "Book",
  "gaestebuch": "Book",
  "online funktionen": "Social",
  "online": "Social",
  "xxl love buchstaben": "LOVE",
  love: "LOVE",
  "live slideshow mit 50 zoll tv": "TV",
  tv: "TV",
  "hintergrundsystem 2,45 x 2,45m": "HG",
  "hintergrundsystem 2,45 × 2,45m": "HG",
  hintergrundsystem: "HG",
  hintergrund: "HG",
};

export function normalizeExtraKey(input: string): string {
  if (!input) return input;
  // Wenn es bereits ein Admin-Key ist, direkt zurückgeben
  if (EXTRAS_LABELS[input]) return input;
  const normalized = input.trim().toLowerCase();
  return NAME_TO_KEY[normalized] ?? input;
}

export function calculateExtrasTotal(extras: string[]): number {
  return extras.reduce((sum, key) => sum + (EXTRAS_PRICES[normalizeExtraKey(key)] ?? 0), 0);
}

export function extraLabel(key: string): string {
  const normalized = normalizeExtraKey(key);
  return EXTRAS_LABELS[normalized] ?? key;
}
