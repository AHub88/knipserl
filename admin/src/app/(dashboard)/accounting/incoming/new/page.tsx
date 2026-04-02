import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { IconFileInvoice } from "@tabler/icons-react";
import { IncomingForm } from "./incoming-form";

export default async function NewIncomingInvoicePage() {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    redirect("/");
  }

  const companies = await prisma.company.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconFileInvoice className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Neue Eingangsrechnung
          </h1>
          <p className="text-sm text-muted-foreground">
            Eingangsrechnung erfassen
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-white/[0.10] bg-card p-6">
        <IncomingForm companies={companies} />
      </div>
    </div>
  );
}
