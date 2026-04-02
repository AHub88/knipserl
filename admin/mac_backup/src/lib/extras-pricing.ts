export const BOX_PRICE = 379;

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

export function calculateExtrasTotal(extras: string[]): number {
  return extras.reduce((sum, key) => sum + (EXTRAS_PRICES[key] ?? 0), 0);
}
