"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useViewMode } from "@/lib/view-mode-context";
import { SETTINGS_SECTIONS } from "@/lib/settings-nav";
import {
  IconDashboard,
  IconFileText,
  IconCalendar,
  IconUsers,
  IconChartBar,
  IconSettings,
  IconReceipt,
  IconBuildingBank,
  IconFileInvoice,
  IconTruck,
  IconInbox,
  IconMapPin,
  IconClipboardCheck,
  IconClipboardList,
  IconBeach,
  IconTemplate,
  IconPalette,
  IconTypography,
  IconPhoto,
  IconPhotoScan,
  IconLayoutGrid,
  IconChevronDown,
  IconWorld,
  IconCurrencyEuro,
  IconBrush,
  IconBrandGoogle,
  IconHistory,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string; // Direct link (no children)
  children?: NavItem[];
};

// ── Admin navigation ──
const adminNav: NavGroup[] = [
  {
    title: "Dashboard",
    icon: IconDashboard,
    href: "/",
  },
  {
    title: "Aufträge",
    icon: IconFileText,
    children: [
      { title: "Anfragen", href: "/inquiries", icon: IconInbox },
      { title: "Aufträge", href: "/orders", icon: IconFileText },
      { title: "Kalender", href: "/calendar", icon: IconCalendar },
    ],
  },
  {
    title: "Kunden",
    icon: IconUsers,
    children: [
      { title: "Kundenliste", href: "/customers", icon: IconUsers },
      { title: "Locations", href: "/locations", icon: IconMapPin },
    ],
  },
  {
    title: "Fahrer",
    icon: IconTruck,
    children: [
      { title: "Fahrerliste", href: "/drivers", icon: IconTruck },
    ],
  },
  {
    title: "Buchhaltung",
    icon: IconCurrencyEuro,
    children: [
      { title: "Angebote", href: "/accounting/quotes", icon: IconFileInvoice },
      { title: "Rechnungen", href: "/accounting/invoices", icon: IconReceipt },
      { title: "Eingangsrechnungen", href: "/accounting/incoming", icon: IconFileText },
      { title: "Fahrervergütung", href: "/accounting/driver-report", icon: IconTruck },
      { title: "Bankabgleich", href: "/accounting/bank", icon: IconBuildingBank },
    ],
  },
  {
    title: "Design",
    icon: IconBrush,
    children: [
      { title: "Design-Vorlagen", href: "/settings/design-templates", icon: IconTemplate },
      { title: "Design-Elemente", href: "/settings/design-elements", icon: IconPalette },
      { title: "Eigene Schriften", href: "/settings/design-fonts", icon: IconTypography },
    ],
  },
  {
    title: "Webseite",
    icon: IconWorld,
    children: [
      { title: "Seiten", href: "/pages", icon: IconLayoutGrid },
      { title: "Medienbibliothek", href: "/media", icon: IconPhoto },
      { title: "Rechtliche Seiten", href: "/settings/legal-pages", icon: IconFileText },
      { title: "Referenz-Logos", href: "/settings/logos", icon: IconPhotoScan },
      { title: "Google Bewertungen", href: "/google-reviews", icon: IconBrandGoogle },
    ],
  },
  {
    title: "Statistiken",
    icon: IconChartBar,
    href: "/statistics",
  },
  {
    title: "Einstellungen",
    icon: IconSettings,
    href: "/settings",
  },
  {
    title: "Changelog",
    icon: IconHistory,
    href: "/changelog",
  },
];

// ── Driver navigation ──
// Fahrer sehen flache Top-Level-Links statt Akkordeon.
const driverNavGroups: NavGroup[] = [
  { title: "Dashboard", icon: IconDashboard, href: "/" },
  { title: "Alle Aufträge", icon: IconFileText, href: "/orders" },
  { title: "Freie Aufträge", icon: IconClipboardCheck, href: "/free-orders" },
  { title: "Meine Aufträge", icon: IconClipboardList, href: "/my-orders" },
  { title: "Kalender", icon: IconCalendar, href: "/calendar" },
  { title: "Abwesenheit", icon: IconBeach, href: "/my-vacation" },
];

// ── Accounting navigation ──
const accountingNavGroups: NavGroup[] = [
  {
    title: "Dashboard",
    icon: IconDashboard,
    href: "/",
  },
  {
    title: "Aufträge",
    icon: IconFileText,
    children: [
      { title: "Aufträge", href: "/orders", icon: IconFileText },
      { title: "Kalender", href: "/calendar", icon: IconCalendar },
    ],
  },
  {
    title: "Buchhaltung",
    icon: IconCurrencyEuro,
    children: [
      { title: "Angebote", href: "/accounting/quotes", icon: IconFileInvoice },
      { title: "Rechnungen", href: "/accounting/invoices", icon: IconReceipt },
      { title: "Eingangsrechnungen", href: "/accounting/incoming", icon: IconFileText },
      { title: "Fahrervergütung", href: "/accounting/driver-report", icon: IconTruck },
      { title: "Bankabgleich", href: "/accounting/bank", icon: IconBuildingBank },
    ],
  },
];

// ── Check if a group contains the active path ──
function groupContainsPath(group: NavGroup, pathname: string): boolean {
  if (group.href) {
    return group.href === "/" ? pathname === "/" : pathname.startsWith(group.href);
  }
  return group.children?.some((item) =>
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  ) ?? false;
}

// ── Accordion nav item ──
function AccordionNavItem({
  group,
  pathname,
  openKey,
  onToggle,
}: {
  group: NavGroup;
  pathname: string;
  openKey: string | null;
  onToggle: (key: string) => void;
}) {
  const { setOpenMobile } = useSidebar();
  const isOpen = openKey === group.title;
  const hasActiveChild = groupContainsPath(group, pathname);

  // Direct link (no children)
  if (group.href) {
    const active = group.href === "/" ? pathname === "/" : pathname.startsWith(group.href);
    return (
      <Link
        href={group.href}
        onClick={() => setOpenMobile(false)}
        className={
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 " +
          (active
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")
        }
      >
        <group.icon className={"size-[18px] shrink-0 " + (active ? "text-primary" : "text-muted-foreground")} />
        <span>{group.title}</span>
      </Link>
    );
  }

  // Accordion group
  return (
    <div>
      <button
        onClick={() => onToggle(group.title)}
        className={
          "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 " +
          (hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")
        }
      >
        <group.icon
          className={"size-[18px] shrink-0 " + (hasActiveChild ? "text-primary" : "text-muted-foreground")}
        />
        <span className="flex-1 text-left">{group.title}</span>
        <IconChevronDown
          className={
            "size-4 shrink-0 transition-transform duration-200 " +
            (isOpen ? "rotate-180" : "") + " " +
            (hasActiveChild ? "text-primary/60" : "text-muted-foreground/70")
          }
        />
      </button>

      {/* Children */}
      <div
        className={
          "overflow-hidden transition-all duration-200 " +
          (isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0")
        }
      >
        <div className="ml-3 border-l border-border/50 pl-3 mt-1 space-y-0.5">
          {group.children?.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpenMobile(false)}
                className={
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 " +
                  (active
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground/90")
                }
              >
                <item.icon className={"size-4 shrink-0 " + (active ? "text-primary" : "text-muted-foreground/70")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Settings accordion (gruppierte Sub-Items) ──
function SettingsAccordionItem({
  pathname,
  isOpen,
  onToggle,
}: {
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { setOpenMobile } = useSidebar();
  const hasActiveChild = SETTINGS_SECTIONS.some((s) =>
    s.items.some((i) => !i.href.startsWith("#") && pathname.startsWith(i.href.split("#")[0]))
  ) || pathname === "/settings" || pathname.startsWith("/settings/");

  return (
    <div>
      <button
        onClick={onToggle}
        className={
          "flex items-center gap-3 w-full rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 " +
          (hasActiveChild
            ? "bg-primary/10 text-primary"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground")
        }
      >
        <IconSettings className={"size-[18px] shrink-0 " + (hasActiveChild ? "text-primary" : "text-muted-foreground")} />
        <span className="flex-1 text-left">Einstellungen</span>
        <IconChevronDown
          className={
            "size-4 shrink-0 transition-transform duration-200 " +
            (isOpen ? "rotate-180 " : "") +
            (hasActiveChild ? "text-primary/60" : "text-muted-foreground/70")
          }
        />
      </button>

      <div
        className={
          "overflow-hidden transition-all duration-200 " +
          (isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0")
        }
      >
        <div className="ml-3 border-l border-border/50 pl-3 mt-1 space-y-2">
          {SETTINGS_SECTIONS.map((section) => (
            <div key={section.title}>
              <div className="px-2.5 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {section.title}
              </div>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const hrefBase = item.href.split("#")[0];
                  const active = item.href.startsWith("#")
                    ? false
                    : hrefBase === "/settings"
                      ? pathname === "/settings"
                      : pathname.startsWith(hrefBase);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpenMobile(false)}
                      className={
                        "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all duration-150 " +
                        (active
                          ? "text-primary bg-primary/5"
                          : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground/90")
                      }
                    >
                      <Icon className={`size-4 shrink-0 ${item.iconColor ?? (active ? "text-primary" : "text-muted-foreground/70")}`} />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex items-center gap-2.5 w-full rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
    >
      {isDark ? (
        <IconSun className="size-[18px] shrink-0 text-muted-foreground" />
      ) : (
        <IconMoon className="size-[18px] shrink-0 text-muted-foreground" />
      )}
      <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
    </button>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { viewMode } = useViewMode();

  const groups =
    viewMode === "driver"
      ? driverNavGroups
      : viewMode === "accounting"
        ? accountingNavGroups
        : adminNav;

  // Auto-open the group that contains the active path
  const activeGroup = groups.find((g) => groupContainsPath(g, pathname));
  const [openKey, setOpenKey] = useState<string | null>(activeGroup?.title ?? null);

  // Update open group when pathname changes
  useEffect(() => {
    const active = groups.find((g) => groupContainsPath(g, pathname));
    if (active && active.title !== openKey) {
      setOpenKey(active.title);
    }
  }, [pathname, groups]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleToggle(key: string) {
    setOpenKey((prev) => (prev === key ? null : key));
  }

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar shadow-xl shadow-black/10 dark:shadow-black/25">
      {/* Brand */}
      <SidebarHeader className="border-b border-sidebar-border py-5">
        <Link href="/" className="flex justify-center w-full">
          <img
            src="/logo.png"
            alt="Knipserl"
            className="h-11 w-auto mx-auto"
          />
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-2 py-3 space-y-1 overflow-y-auto">
        {groups.map((group) =>
          group.title === "Einstellungen" ? (
            <SettingsAccordionItem
              key={group.title}
              pathname={pathname}
              isOpen={openKey === "Einstellungen"}
              onToggle={() => handleToggle("Einstellungen")}
            />
          ) : (
            <AccordionNavItem
              key={group.title}
              group={group}
              pathname={pathname}
              openKey={openKey}
              onToggle={handleToggle}
            />
          )
        )}
      </SidebarContent>

      {/* Theme Toggle + Footer */}
      <SidebarFooter className="border-t border-sidebar-border px-3 py-3 space-y-2">
        <ThemeToggle />
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] text-muted-foreground">
            Knipserl Dashboard
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">v1.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
