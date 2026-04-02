import { prisma } from "@/lib/db";
import { NewInquiryForm } from "./new-inquiry-form";

export default async function NewInquiryPage() {
  const locations = await prisma.location.findMany({
    orderBy: { usageCount: "desc" },
  });

  return (
    <NewInquiryForm
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
