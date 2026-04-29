import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DriverHeader, DriverBottomNav } from "@/components/layout/driver-shell";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "DRIVER") redirect("/");

  const userName = session.user.name ?? "Fahrer";
  const initials = getInitials(session.user.name);

  return (
    <div className="min-h-screen bg-background">
      <DriverHeader userName={userName} initials={initials} />
      <main className="mx-auto max-w-2xl px-4 pt-4 pb-28">{children}</main>
      <DriverBottomNav />
    </div>
  );
}
