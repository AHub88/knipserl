import { prisma } from "@/lib/db";
import Link from "next/link";
import { IconSettings, IconMapPin, IconCar, IconCurrencyEuro } from "@tabler/icons-react";
import { StartAddressForm } from "./start-address-form";

export default async function SettingsPage() {
  const settings = await prisma.appSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconSettings className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Einstellungen
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
        {/* Startadresse */}
        <StartAddressForm
          initialAddress={map.startAddress ?? ""}
          initialLat={map.startLat ?? ""}
          initialLng={map.startLng ?? ""}
        />

        {/* Link zu Fahrtkosten */}
        <Link
          href="/settings/travel-pricing"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconCar className="size-5 text-[#F6A11C]" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              Fahrtkosten-Staffelung
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Preistabelle f&uuml;r Kundenfahrtkosten und Fahrerverg&uuml;tung verwalten
          </p>
        </Link>

        {/* Link zu Extras-Preise */}
        <Link
          href="/settings/extras-pricing"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconCurrencyEuro className="size-5 text-[#F6A11C]" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              Extras &amp; Preise
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Preise f&uuml;r Fotobox und Extras bearbeiten
          </p>
        </Link>
      </div>
    </div>
  );
}
