"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewMode } from "@/lib/view-mode-context";
import {
  IconHome,
  IconClipboardCheck,
  IconClipboardList,
  IconCalendar,
  IconBeach,
} from "@tabler/icons-react";

type Item = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "emerald";
};

const items: Item[] = [
  { href: "/", label: "Start", icon: IconHome, accent: "primary" },
  { href: "/free-orders", label: "Frei", icon: IconClipboardCheck, accent: "emerald" },
  { href: "/my-orders", label: "Meine", icon: IconClipboardList, accent: "primary" },
  { href: "/calendar", label: "Kalender", icon: IconCalendar, accent: "primary" },
  { href: "/my-vacation", label: "Urlaub", icon: IconBeach, accent: "primary" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function DriverBottomNav() {
  const pathname = usePathname();
  const { viewMode } = useViewMode();

  // Nur für Fahrer-Modus, nur auf Mobile.
  if (viewMode !== "driver") return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_12px_-2px_rgba(0,0,0,0.08)]">
      <div className="flex">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          const accentActive =
            item.accent === "emerald" ? "text-emerald-500" : "text-primary";
          const accentIdle =
            item.accent === "emerald" ? "text-emerald-500/55" : "text-muted-foreground";
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors " +
                (active ? `${accentActive} font-semibold` : "text-muted-foreground")
              }
            >
              <Icon
                className={
                  "h-5 w-5 transition-colors " +
                  (active ? accentActive : accentIdle)
                }
              />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
