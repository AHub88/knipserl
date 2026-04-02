"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useViewMode } from "@/lib/view-mode-context";
import {
  IconCamera,
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
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", href: "/", icon: IconDashboard },
  { title: "Anfragen", href: "/inquiries", icon: IconInbox },
  { title: "Aufträge", href: "/orders", icon: IconFileText },
  { title: "Kalender", href: "/calendar", icon: IconCalendar },
  { title: "Fahrer", href: "/drivers", icon: IconTruck },
  { title: "Locations", href: "/locations", icon: IconMapPin },
  { title: "Kunden", href: "/customers", icon: IconUsers },
];

const driverNav = [
  { title: "Meine Aufträge", href: "/my-orders", icon: IconClipboardList },
  { title: "Aufträge", href: "/orders", icon: IconFileText },
  { title: "Abwesenheit", href: "/my-vacation", icon: IconBeach },
  { title: "Kalender", href: "/calendar", icon: IconCalendar },
];

const accountingNav = [
  { title: "Angebote", href: "/accounting/quotes", icon: IconFileInvoice },
  { title: "Rechnungen", href: "/accounting/invoices", icon: IconReceipt },
  {
    title: "Eingangsrechnungen",
    href: "/accounting/incoming",
    icon: IconFileText,
  },
  { title: "Bankabgleich", href: "/accounting/bank", icon: IconBuildingBank },
];

const systemNav = [
  { title: "Statistiken", href: "/statistics", icon: IconChartBar },
  { title: "Einstellungen", href: "/settings", icon: IconSettings },
];

type NavItem = { title: string; href: string; icon: React.ComponentType<{ className?: string }> };

function NavGroup({
  label,
  items,
  isActive,
}: {
  label: string;
  items: NavItem[];
  isActive: (href: string) => boolean;
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400 mb-1">
        {label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={active}
                  className={
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 " +
                    (active
                      ? "bg-[#F6A11C]/10 text-[#F6A11C] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-5 before:w-[3px] before:rounded-full before:bg-[#F6A11C]"
                      : "text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100")
                  }
                >
                  <item.icon
                    className={
                      "size-[18px] shrink-0 " +
                      (active ? "text-[#F6A11C]" : "text-zinc-400")
                    }
                  />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const { viewMode } = useViewMode();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  const viewLabel =
    viewMode === "driver" ? "Fahrer" : viewMode === "accounting" ? "Buchhaltung" : "Admin";

  return (
    <Sidebar className="border-r border-white/[0.10] bg-zinc-950 shadow-xl shadow-black/50">
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
      <SidebarContent className="px-2 py-4 space-y-6">
        {viewMode === "driver" ? (
          <NavGroup
            label="Fahrer"
            items={driverNav}
            isActive={isActive}
          />
        ) : viewMode === "accounting" ? (
          <>
            <NavGroup
              label="Hauptmenü"
              items={mainNav.filter((n) =>
                ["/", "/orders", "/calendar"].includes(n.href)
              )}
              isActive={isActive}
            />
            <NavGroup label="Buchhaltung" items={accountingNav} isActive={isActive} />
          </>
        ) : (
          <>
            <NavGroup label="Hauptmenü" items={mainNav} isActive={isActive} />
            <NavGroup label="Buchhaltung" items={accountingNav} isActive={isActive} />
            <NavGroup label="System" items={systemNav} isActive={isActive} />
          </>
        )}
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-white/[0.10] px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-500">
            Knipserl Dashboard
          </span>
          <span className="text-[10px] font-mono text-zinc-500">v1.0</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
