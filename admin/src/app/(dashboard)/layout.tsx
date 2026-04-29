import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Header } from "@/components/layout/header";
import { ViewModeProvider, type ViewMode } from "@/lib/view-mode-context";
import { getEffectiveViewMode } from "@/lib/view-mode";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Fahrer haben keinen Zugriff auf das Admin-Dashboard.
  if (session.user.role === "DRIVER") redirect("/driver");

  const viewMode = await getEffectiveViewMode(session.user.role ?? "");

  // Read impersonateDriverId from cookie
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const impersonateDriverId = cookieStore.get("impersonateDriverId")?.value ?? null;

  // Load drivers for admin impersonation dropdown
  const drivers = session.user.role === "ADMIN"
    ? await prisma.user.findMany({
        where: { role: { in: ["DRIVER", "ADMIN"] }, active: true },
        orderBy: { name: "asc" },
        select: { id: true, name: true, initials: true },
      })
    : [];

  return (
    <ViewModeProvider userRole={session.user.role ?? ""} initialViewMode={viewMode} initialDriverId={impersonateDriverId}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header drivers={drivers} />
          <main className="flex-1 p-3 sm:p-6 lg:px-12 xl:px-16">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </ViewModeProvider>
  );
}
