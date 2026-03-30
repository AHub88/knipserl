import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function DriversPage() {
  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER" },
    orderBy: { name: "asc" },
    include: {
      orders: { where: { status: { in: ["OPEN", "ASSIGNED"] } } },
      vacations: {
        where: { endDate: { gte: new Date() } },
        orderBy: { startDate: "asc" },
        take: 1,
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fahrer</h1>
        <p className="text-muted-foreground">Fahrer-Übersicht und Verfügbarkeit</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alle Fahrer ({drivers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Keine Fahrer angelegt
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Kennzeichen</TableHead>
                  <TableHead>Aufträge</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => {
                  const hasVacation = driver.vacations.length > 0;
                  const vacStart = hasVacation
                    ? new Date(driver.vacations[0].startDate)
                    : null;
                  const isOnVacation =
                    hasVacation && vacStart && vacStart <= new Date();

                  return (
                    <TableRow key={driver.id}>
                      <TableCell className="font-medium">
                        {driver.name}
                      </TableCell>
                      <TableCell>{driver.email}</TableCell>
                      <TableCell>{driver.phone ?? "–"}</TableCell>
                      <TableCell>{driver.vehiclePlate ?? "–"}</TableCell>
                      <TableCell>{driver.orders.length} offen</TableCell>
                      <TableCell>
                        {isOnVacation ? (
                          <Badge variant="secondary">Im Urlaub</Badge>
                        ) : driver.active ? (
                          <Badge variant="default">Verfügbar</Badge>
                        ) : (
                          <Badge variant="destructive">Inaktiv</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
