"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewMode } from "@/lib/view-mode-context";
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
  IconClipboardList,
  IconBeach,
  IconTemplate,
  IconPalette,
  IconTypography,
  IconPhoto,
  IconChevronDown,
  IconWorld,
  IconCurrencyEuro,
  IconBrush,
  IconAdjustments,
  IconBrandGoogle,
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
      { title: "Referenz-Logos", href: "/settings/logos", icon: IconPhoto },
      { title: "Google Bewertungen", href: "/google-reviews", icon: IconBrandGoogle },
    ],
  },
  {
    title: "System",
    icon: IconAdjustments,
    children: [
      { title: "Statistiken", href: "/statistics", icon: IconChartBar },
      { title: "Einstellungen", href: "/settings", icon: IconSettings },
    ],
  },
];

// ── Driver navigation ──
const driverNavGroups: NavGroup[] = [
  {
    title: "Übersicht",
    icon: IconClipboardList,
    children: [
      { title: "Meine Aufträge", href: "/my-orders", icon: IconClipboardList },
      { title: "Aufträge", href: "/orders", icon: IconFileText },
      { title: "Abwesenheit", href: "/my-vacation", icon: IconBeach },
      { title: "Kalender", href: "/calendar", icon: IconCalendar },
    ],
  },
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
            ? "bg-[#F6A11C]/10 text-[#F6A11C]"
            : "text-zinc-300 hover:bg-[#222326] hover:text-zinc-100")
        }
      >
        <group.icon className={"size-[18px] shrink-0 " + (active ? "text-[#F6A11C]" : "text-zinc-400")} />
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
            ? "bg-[#F6A11C]/10 text-[#F6A11C]"
            : "text-zinc-300 hover:bg-[#222326] hover:text-zinc-100")
        }
      >
        <group.icon
          className={"size-[18px] shrink-0 " + (hasActiveChild ? "text-[#F6A11C]" : "text-zinc-400")}
        />
        <span className="flex-1 text-left">{group.title}</span>
        <IconChevronDown
          className={
            "size-4 shrink-0 transition-transform duration-200 " +
            (isOpen ? "rotate-180" : "") + " " +
            (hasActiveChild ? "text-[#F6A11C]/60" : "text-zinc-500")
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
        <div className="ml-3 border-l border-white/[0.06] pl-3 mt-1 space-y-0.5">
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
                    ? "text-[#F6A11C] bg-[#F6A11C]/5"
                    : "text-zinc-400 hover:bg-[#222326] hover:text-zinc-200")
                }
              >
                <item.icon className={"size-4 shrink-0 " + (active ? "text-[#F6A11C]" : "text-zinc-500")} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
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
    <Sidebar className="border-r border-white/[0.10] bg-sidebar shadow-xl shadow-black/50">
      {/* Brand */}
      <SidebarHeader className="border-b border-white/[0.10] py-5">
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
        {groups.map((group) => (
          <AccordionNavItem
            key={group.title}
            group={group}
            pathname={pathname}
            openKey={openKey}
            onToggle={handleToggle}
          />
        ))}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/[0.10] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-muted-foreground">
            Knipserl Dashboard
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">v1.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
