import { prisma } from "@/lib/db";
import { IconMapPin } from "@tabler/icons-react";
import { LocationsTable } from "./locations-table";
import { calculateTravelPriceFromTiers } from "@/lib/travel-pricing";

export default async function LocationsPage() {
  const [locations, tiers] = await Promise.all([
    prisma.location.findMany({ orderBy: { usageCount: "desc" } }),
    prisma.travelPricingTier.findMany({ orderBy: { distanceKm: "asc" } }),
  ]);

  const serialized = locations.map((loc) => {
    const prices =
      loc.distanceKm != null
        ? calculateTravelPriceFromTiers(tiers, loc.distanceKm)
        : null;
    return {
      id: loc.id,
      name: loc.name,
      street: loc.street,
      zip: loc.zip,
      city: loc.city,
      distanceKm: loc.distanceKm,
      customerTravelCost: prices?.customerPrice ?? null,
      driverCompensation: prices?.driverCompensation ?? null,
      usageCount: loc.usageCount,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconMapPin className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Locations
          </h1>
          <p className="text-sm text-zinc-500">
            {locations.length} Locations gesamt
          </p>
        </div>
      </div>

      <LocationsTable locations={serialized} />
    </div>
  );
}
