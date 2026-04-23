import { prisma } from "@/lib/db";
import Link from "next/link";
import { IconPlus, IconUsers } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { DriversTableBody } from "./drivers-table-body";
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
    where: { role: { in: ["DRIVER", "ADMIN"] } },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Fahrer</h1>
          <p className="text-muted-foreground">Fahrer-Übersicht und Verfügbarkeit</p>
        </div>
        <Link href="/drivers/new" className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors">
          <IconPlus className="size-4" />
          Neuer Fahrer
        </Link>
      </div>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconUsers className="size-4 text-primary" />
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
                  <TableHead>Kürzel</TableHead>
                  <TableHead>E-Mail</TableHead>
                  <TableHead>Telefon</TableHead>
                  <TableHead>Aufträge</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <DriversTableBody
                  drivers={drivers.map((driver) => {
                    const hasVacation = driver.vacations.length > 0;
                    const vacStart = hasVacation ? new Date(driver.vacations[0].startDate) : null;
                    return {
                      id: driver.id,
                      name: driver.name,
                      initials: driver.initials,
                      email: driver.email,
                      phone: driver.phone,
                      ordersCount: driver.orders.length,
                      active: driver.active,
                      isOnVacation: !!(hasVacation && vacStart && vacStart <= new Date()),
                    };
                  })}
                />
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
