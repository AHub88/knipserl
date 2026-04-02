import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewOrderForm } from "./new-order-form";

export default async function NewOrderPage() {
  const session = await auth();
  if (session?.user?.role === "DRIVER") {
    redirect("/orders");
  }

  const drivers = await prisma.user.findMany({
    where: { role: { in: ["DRIVER", "ADMIN"] }, active: true },
    orderBy: { name: "asc" },
  });

  const companies = await prisma.company.findMany({
    orderBy: { name: "asc" },
  });

  const locations = await prisma.location.findMany({
    orderBy: { usageCount: "desc" },
  });

  return (
    <NewOrderForm
      drivers={drivers.map((d) => ({ id: d.id, name: d.name, initials: d.initials }))}
      companies={companies.map((c) => ({ id: c.id, name: c.name }))}
      locations={locations.map((l) => ({
        id: l.id,
        name: l.name,
        street: l.street,
        zip: l.zip,
        city: l.city,
        distanceKm: l.distanceKm,
      }))}
    />
  );
}
