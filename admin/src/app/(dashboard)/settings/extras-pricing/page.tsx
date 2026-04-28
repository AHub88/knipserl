import { prisma } from "@/lib/db";
import { IconSettings } from "@tabler/icons-react";
import { ExtrasPricingEditor } from "./extras-pricing-editor";
import {
  BOX_PRICE,
  EXTRAS_PRICES,
  DRIVER_BONUS_DEFAULTS,
} from "@/lib/extras-pricing";

export default async function ExtrasPricingPage() {
  // Load saved prices from DB, fallback to defaults
  const settings = await prisma.appSetting.findMany({
    where: {
      OR: [
        { key: { startsWith: "price_" } },
        { key: { startsWith: "driver_bonus_" } },
      ],
    },
  });
  const savedPrices: Record<string, number> = {};
  const savedBonus: Record<string, number> = {};
  for (const s of settings) {
    if (s.key.startsWith("price_")) {
      savedPrices[s.key.replace("price_", "")] = Number(s.value);
    } else if (s.key.startsWith("driver_bonus_")) {
      savedBonus[s.key.replace("driver_bonus_", "")] = Number(s.value);
    }
  }

  const boxSetting = await prisma.appSetting.findUnique({ where: { key: "price_box" } });
  const boxPrice = boxSetting ? Number(boxSetting.value) : BOX_PRICE;

  // Merge defaults with saved
  const extras = Object.entries(EXTRAS_PRICES).map(([key, defaultPrice]) => ({
    key,
    price: savedPrices[key] ?? defaultPrice,
    driverBonus: savedBonus[key] ?? DRIVER_BONUS_DEFAULTS[key] ?? 0,
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
            Preise f&uuml;r Fotobox und Extras verwalten — inkl. Vergütung pro Extra
            für Fahrer
          </p>
        </div>
      </div>

      <ExtrasPricingEditor boxPrice={boxPrice} extras={extras} />
    </div>
  );
}
