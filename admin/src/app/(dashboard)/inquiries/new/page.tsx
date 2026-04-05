import { prisma } from "@/lib/db";
import { NewInquiryForm } from "./new-inquiry-form";

export default async function NewInquiryPage() {
  const locations = await prisma.location.findMany({
    orderBy: { usageCount: "desc" },
    select: { id: true, name: true, street: true, zip: true, city: true, distanceKm: true },
  });

  return (
    <NewInquiryForm locations={locations} />
  );
}
