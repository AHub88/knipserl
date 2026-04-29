import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBeach, IconCalendarPlus, IconCalendar } from "@tabler/icons-react";
import { VacationForm } from "./vacation-form";
import { VacationList } from "./vacation-list";

export const dynamic = "force-dynamic";

export default async function DriverVacationPage() {
  const session = await auth();
  const driverId = session!.user.id;

  const vacations = await prisma.vacation.findMany({
    where: { driverId },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-amber-500/15 text-amber-500 shrink-0">
          <IconBeach className="size-5" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Abwesenheit
          </h1>
          <p className="text-xs text-muted-foreground">
            Urlaub und Sperrtage eintragen
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconCalendarPlus className="size-4 text-primary" />
          <CardTitle className="text-base">Neuen Urlaub eintragen</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <VacationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconCalendar className="size-4 text-primary" />
          <CardTitle className="text-base">Meine Urlaubszeiten</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <VacationList
            vacations={vacations.map((v) => ({
              id: v.id,
              type: v.type as "ABSENT" | "LIMITED",
              startDate: v.startDate.toISOString(),
              endDate: v.endDate.toISOString(),
              note: v.note,
            }))}
          />
        </CardContent>
      </Card>
    </div>
  );
}
