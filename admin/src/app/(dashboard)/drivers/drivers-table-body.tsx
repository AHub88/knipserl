"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { TableRow, TableCell } from "@/components/ui/table";

type Driver = {
  id: string;
  name: string;
  initials: string | null;
  email: string;
  phone: string | null;
  ordersCount: number;
  active: boolean;
  isOnVacation: boolean;
};

export function DriversTableBody({ drivers }: { drivers: Driver[] }) {
  const router = useRouter();

  return (
    <>
      {drivers.map((driver) => (
        <TableRow
          key={driver.id}
          onClick={() => router.push(`/drivers/${driver.id}`)}
          className="cursor-pointer hover:bg-[#1a1d27]"
        >
          <TableCell className="font-medium">{driver.name}</TableCell>
          <TableCell className="font-mono text-sm text-zinc-400">
            {driver.initials ?? "–"}
          </TableCell>
          <TableCell>{driver.email}</TableCell>
          <TableCell>{driver.phone ?? "–"}</TableCell>
          <TableCell>{driver.ordersCount} offen</TableCell>
          <TableCell>
            {driver.isOnVacation ? (
              <Badge variant="secondary">Im Urlaub</Badge>
            ) : driver.active ? (
              <Badge variant="default">Verfügbar</Badge>
            ) : (
              <Badge variant="destructive">Inaktiv</Badge>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}
