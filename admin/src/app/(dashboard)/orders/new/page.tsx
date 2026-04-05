import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewOrderForm } from "./new-order-form";

export default async function NewOrderPage() {
  const session = await auth();
  if (session?.user?.role === "DRIVER") {
    redirect("/orders");
  }

  const [drivers, companies, locations] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["DRIVER", "ADMIN"] }, active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, initials: true },
    }),
    prisma.company.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.location.findMany({
      orderBy: { usageCount: "desc" },
      select: { id: true, name: true, street: true, zip: true, city: true, distanceKm: true },
    }),
  ]);

  return (
    <NewOrderForm
      drivers={drivers}
      companies={companies}
      locations={locations}
    />
  );
}
