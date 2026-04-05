import { prisma } from "@/lib/db";
import Link from "next/link";
import { IconSettings, IconMapPin, IconCar, IconCurrencyEuro, IconMail, IconLock, IconList, IconTemplate, IconPalette } from "@tabler/icons-react";
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
        {/* Link zu Standard-Positionen */}
        <Link
          href="/settings/standard-items"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconList className="size-5 text-[#F6A11C]" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              Standard-Positionen
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Vordefinierte Positionen f&uuml;r Angebote und Rechnungen
          </p>
        </Link>

        {/* Link zu E-Mail Zugangsdaten */}
        <Link
          href="/settings/email-credentials"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconLock className="size-5 text-purple-400" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              E-Mail Zugangsdaten
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Microsoft Azure Credentials f&uuml;r den E-Mail-Versand
          </p>
        </Link>

        {/* Link zu E-Mail Templates */}
        <Link
          href="/settings/email-templates"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconMail className="size-5 text-blue-400" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              E-Mail Templates
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Vorlagen f&uuml;r Bestätigungs- und Absagemails
          </p>
        </Link>

        {/* Link zu Design-Vorlagen */}
        <Link
          href="/settings/design-templates"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconTemplate className="size-5 text-[#F6A11C]" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              Design-Vorlagen
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Hintergrund-Vorlagen f&uuml;r den Layout-Editor verwalten
          </p>
        </Link>

        {/* Link zu Design-Elemente */}
        <Link
          href="/settings/design-elements"
          className="rounded-xl border border-white/[0.10] bg-card p-5 hover:bg-card transition-colors group"
        >
          <div className="flex items-center gap-3 mb-2">
            <IconPalette className="size-5 text-[#F6A11C]" />
            <h2 className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100">
              Design-Elemente
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Logos, Rahmen, Deko und Sticker f&uuml;r den Layout-Editor
          </p>
        </Link>
      </div>
    </div>
  );
}
