"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  IconHome,
  IconClipboardCheck,
  IconClipboardList,
  IconCalendar,
  IconBeach,
  IconLogout,
} from "@tabler/icons-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  // Optional Akzent-Farbe für Icon (z.B. emerald für freie Aufträge)
  accent?: "primary" | "emerald";
};

const navItems: NavItem[] = [
  { href: "/driver", label: "Start", icon: IconHome, accent: "primary" },
  {
    href: "/driver/free-orders",
    label: "Frei",
    icon: IconClipboardCheck,
    accent: "emerald",
  },
  {
    href: "/driver/my-orders",
    label: "Meine",
    icon: IconClipboardList,
    accent: "primary",
  },
  { href: "/driver/calendar", label: "Kalender", icon: IconCalendar, accent: "primary" },
  { href: "/driver/vacation", label: "Urlaub", icon: IconBeach, accent: "primary" },
];

function isActive(pathname: string, href: string) {
  if (href === "/driver") return pathname === "/driver";
  return pathname.startsWith(href);
}

export function DriverHeader({
  userName,
  initials,
}: {
  userName: string;
  initials: string;
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-sm shadow-sm shadow-black/5 dark:shadow-black/20">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link
          href="/driver"
          aria-label="Zur Fahrer-Startseite"
          className="flex items-center"
        >
          <img src="/logo.png" alt="Knipserl" className="h-7 w-auto" />
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-sm font-medium text-foreground">{userName}</span>
            <span className="text-[9px] font-semibold uppercase tracking-wider text-emerald-400">
              Fahrer
            </span>
          </div>
          <div className="flex items-center justify-center size-8 rounded-full bg-primary/15 text-primary text-[11px] font-bold ring-1 ring-border">
            {initials}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            aria-label="Abmelden"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <IconLogout className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function DriverBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-2xl">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          const accentActive =
            item.accent === "emerald" ? "text-emerald-500" : "text-primary";
          // Inaktives Icon: Frei bekommt eine leichte emerald-Tönung als Akzent.
          const accentIdle =
            item.accent === "emerald" ? "text-emerald-500/60" : "text-muted-foreground";
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition-colors " +
                (active
                  ? `${accentActive} font-semibold`
                  : "text-muted-foreground")
              }
            >
              <item.icon
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
