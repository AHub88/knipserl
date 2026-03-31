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
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconSettings className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Fahrtkosten-Staffelung
          </h1>
          <p className="text-sm text-zinc-500">
            Preistabelle f&uuml;r Kundenfahrtkosten und Fahrerverg&uuml;tung
          </p>
        </div>
      </div>

      <PricingEditor initialTiers={serialized} />
    </div>
  );
}
