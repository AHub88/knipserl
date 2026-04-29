import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { VacationForm } from "@/components/vacation/vacation-form";
import { VacationList } from "@/components/vacation/vacation-list";
import { IconBeach, IconAlertTriangle } from "@tabler/icons-react";

export const dynamic = "force-dynamic";

export default async function MyVacationPage() {
  const session = await auth();
  const cookieStore = await cookies();
  const impersonateId = cookieStore.get("impersonateDriverId")?.value;
  const driverId = (session!.user.role === "ADMIN" && impersonateId) ? impersonateId : session!.user.id;

  let vacations: { id: string; type: string; startDate: Date; endDate: Date; note: string | null }[] = [];
  let driver: { name: string | null } | null = null;
  let dbError: string | null = null;

  try {
    [vacations, driver] = await Promise.all([
      prisma.vacation.findMany({
        where: { driverId },
        orderBy: { startDate: "asc" },
      }),
      prisma.user.findUnique({ where: { id: driverId }, select: { name: true } }),
    ]);
  } catch (error) {
    dbError = error instanceof Error ? error.message : String(error);
    // Still try to get the driver name
    try {
      driver = await prisma.user.findUnique({ where: { id: driverId }, select: { name: true } });
    } catch { /* ignore */ }
  }

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

      {dbError && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 flex items-start gap-3">
          <IconAlertTriangle className="size-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-400">Datenbank-Fehler</p>
            <p className="text-xs text-red-400/70 mt-1 break-all">{dbError}</p>
            <p className="text-xs text-zinc-500 mt-2">
              Die Tabelle &quot;vacations&quot; existiert möglicherweise noch nicht.
              Rufe <code className="bg-white/5 px-1 rounded">/api/health</code> auf um den DB-Status zu prüfen.
            </p>
          </div>
        </div>
      )}

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
