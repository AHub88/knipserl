import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { VacationForm } from "@/app/(driver)/driver/vacation/vacation-form";
import { VacationList } from "@/app/(driver)/driver/vacation/vacation-list";
import { IconBeach } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function MyVacationPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const impersonateId = cookieStore.get("impersonateDriverId")?.value;
  const driverId = (session!.user.role === "ADMIN" && impersonateId) ? impersonateId : session!.user.id;

  const [vacations, driver] = await Promise.all([
    prisma.vacation.findMany({
      where: { driverId },
      orderBy: { startDate: "asc" },
    }),
    prisma.user.findUnique({ where: { id: driverId }, select: { name: true } }),
  ]);

  const isImpersonating = session!.user.role === "ADMIN" && impersonateId && impersonateId !== session!.user.id;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-orange-500/10">
          <IconBeach className="size-5 text-orange-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-zinc-100">Abwesenheit</h1>
          <p className="text-sm text-zinc-500">
            {isImpersonating ? `Abwesenheiten von ${driver?.name}` : "Urlaub und Abwesenheiten verwalten"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Neuen Urlaub eintragen</h2>
          <VacationForm />
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
          <h2 className="text-sm font-semibold text-zinc-300 mb-4">Meine Urlaubszeiten</h2>
          <VacationList
            vacations={vacations.map((v) => ({
              id: v.id,
              type: v.type as "ABSENT" | "LIMITED",
              startDate: v.startDate.toISOString(),
              endDate: v.endDate.toISOString(),
              note: v.note,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
