import { prisma } from "@/lib/db";
import Link from "next/link";
import { IconSettings, IconChevronRight } from "@tabler/icons-react";
import { StartAddressForm } from "./start-address-form";
import { GoogleApiForm } from "./google-api-form";
import { SETTINGS_SECTIONS } from "@/lib/settings-nav";

export default async function SettingsPage() {
  const settings = await prisma.appSetting.findMany();
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  const linkSections = SETTINGS_SECTIONS.filter((s) => s.title !== "Stammdaten");

  return (
    <div className="space-y-10 max-w-5xl">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconSettings className="size-5" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Einstellungen</h1>
      </div>

      {/* Stammdaten — Inline-Forms */}
      <section id="stammdaten" className="scroll-mt-24 space-y-4">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">Stammdaten</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Basis-Konfiguration für Adresse und externe APIs.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <div id="startadresse" className="scroll-mt-24">
            <StartAddressForm
              initialAddress={map.startAddress ?? ""}
              initialLat={map.startLat ?? ""}
              initialLng={map.startLng ?? ""}
            />
          </div>
          <div id="google-api" className="scroll-mt-24">
            <GoogleApiForm
              initialApiKey={map.googleApiKey ?? ""}
              initialPlaceId={map.googlePlaceId ?? ""}
              initialOAuthClientId={map.googleOAuthClientId ?? ""}
              initialOAuthClientSecret={map.googleOAuthClientSecret ?? ""}
              hasRefreshToken={!!map.googleRefreshToken}
            />
          </div>
        </div>
      </section>

      {/* Weitere Sektionen als Link-Cards */}
      {linkSections.map((section) => (
        <section key={section.title} className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              {section.title}
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-xl border border-white/[0.10] bg-card p-5 hover:border-[#F6A11C]/40 hover:bg-[#F6A11C]/[0.03] transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <Icon className={`size-5 ${item.iconColor ?? "text-[#F6A11C]"}`} />
                    <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 flex-1">
                      {item.title}
                    </h3>
                    <IconChevronRight className="size-4 text-zinc-600 group-hover:text-[#F6A11C] transition-colors" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
