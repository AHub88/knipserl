import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconCalendarPlus, IconCalendar } from "@tabler/icons-react";
import { VacationForm } from "./vacation-form";
import { VacationList } from "./vacation-list";

export default async function DriverVacationPage() {
  const session = await auth();
  const driverId = session!.user.id;

  const vacations = await prisma.vacation.findMany({
    where: { driverId },
    orderBy: { startDate: "asc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Urlaubsverwaltung</h1>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconCalendarPlus className="size-4 text-primary" />
          <CardTitle className="text-base">Neuen Urlaub eintragen</CardTitle>
        </CardHeader>
        <CardContent>
          <VacationForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconCalendar className="size-4 text-primary" />
          <CardTitle className="text-base">Meine Urlaubszeiten</CardTitle>
        </CardHeader>
        <CardContent>
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
