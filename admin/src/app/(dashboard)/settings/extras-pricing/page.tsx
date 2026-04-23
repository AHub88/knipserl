import { prisma } from "@/lib/db";
import { IconSettings } from "@tabler/icons-react";
import { ExtrasPricingEditor } from "./extras-pricing-editor";
import { BOX_PRICE, EXTRAS_PRICES } from "@/lib/extras-pricing";

export default async function ExtrasPricingPage() {
  // Load saved prices from DB, fallback to defaults
  const settings = await prisma.appSetting.findMany({
    where: { key: { startsWith: "price_" } },
  });
  const savedPrices: Record<string, number> = {};
  for (const s of settings) {
    savedPrices[s.key.replace("price_", "")] = Number(s.value);
  }

  const boxSetting = await prisma.appSetting.findUnique({ where: { key: "price_box" } });
  const boxPrice = boxSetting ? Number(boxSetting.value) : BOX_PRICE;

  // Merge defaults with saved
  const extras = Object.entries(EXTRAS_PRICES).map(([key, defaultPrice]) => ({
    key,
    price: savedPrices[key] ?? defaultPrice,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <IconSettings className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Extras &amp; Preise
          </h1>
          <p className="text-sm text-muted-foreground">
            Preise f&uuml;r Fotobox und Extras verwalten
          </p>
        </div>
      </div>

      <ExtrasPricingEditor boxPrice={boxPrice} extras={extras} />
    </div>
  );
}
