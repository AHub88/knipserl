import { prisma } from "@/lib/db";
import { IconSettings } from "@tabler/icons-react";
import { PricingEditor } from "./pricing-editor";

export default async function TravelPricingPage() {
  const tiers = await prisma.travelPricingTier.findMany({
    orderBy: { distanceKm: "asc" },
  });

  const serialized = tiers.map((t) => ({
    distanceKm: t.distanceKm,
    driverCompensation: t.driverCompensation,
    customerPrice: t.customerPrice,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
          <IconSettings className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Fahrtkosten-Staffelung
          </h1>
          <p className="text-sm text-muted-foreground">
            Preistabelle f&uuml;r Kundenfahrtkosten und Fahrerverg&uuml;tung
          </p>
        </div>
      </div>

      <PricingEditor initialTiers={serialized} />
    </div>
  );
}
