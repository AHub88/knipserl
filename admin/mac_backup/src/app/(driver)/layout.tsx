import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DriverNav } from "@/components/layout/driver-nav";

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "DRIVER") redirect("/");

  return (
    <div className="min-h-screen bg-muted/30">
      <DriverNav userName={session.user.name ?? "Fahrer"} />
      <main className="mx-auto max-w-2xl px-4 pb-24 pt-4">{children}</main>
    </div>
  );
}
