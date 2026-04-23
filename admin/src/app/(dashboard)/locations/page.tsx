import { prisma } from "@/lib/db";
import Link from "next/link";
import { IconMapPin, IconPlus } from "@tabler/icons-react";
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
            <IconMapPin className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Locations
            </h1>
            <p className="text-sm text-muted-foreground">
              {locations.length} Locations gesamt
            </p>
          </div>
        </div>
        <Link href="/locations/new" className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors">
          <IconPlus className="size-4" />
          Neue Location
        </Link>
      </div>

      <LocationsTable locations={serialized} />
    </div>
  );
}
