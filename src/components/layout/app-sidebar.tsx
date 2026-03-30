"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
];

const accountingNav = [
  { title: "Angebote", href: "/accounting/quotes", icon: IconFileInvoice },
  { title: "Rechnungen", href: "/accounting/invoices", icon: IconReceipt },
  { title: "Eingangsrechnungen", href: "/accounting/incoming", icon: IconFileText },
  { title: "Bankabgleich", href: "/accounting/bank", icon: IconBuildingBank },
];

const systemNav = [
  { title: "Statistiken", href: "/statistics", icon: IconChartBar },
  { title: "Einstellungen", href: "/settings", icon: IconSettings },
];

export function AppSidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <IconCamera className="h-6 w-6" />
          <span className="text-lg font-bold">Knipserl</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hauptmenü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive(item.href)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Buchhaltung</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountingNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive(item.href)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} isActive={isActive(item.href)}>
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">Knipserl Fotobox Admin</p>
      </SidebarFooter>
    </Sidebar>
  );
}
