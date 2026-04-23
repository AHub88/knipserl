"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface OrderActionsProps {
  orderId: string;
  currentStatus: string;
  currentDriverId: string | null;
  drivers: { id: string; name: string }[];
}

export function OrderActions({
  orderId,
  currentStatus,
  currentDriverId,
  drivers,
}: OrderActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [driverId, setDriverId] = useState(currentDriverId ?? "");
  const [status, setStatus] = useState(currentStatus);

  async function handleSave() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: driverId || null,
          status,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }

      toast.success("Auftrag aktualisiert");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Auftrag bearbeiten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Fahrer zuweisen</Label>
            <Select value={driverId} onValueChange={(v) => v && setDriverId(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Fahrer wählen..." />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => v && setStatus(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OPEN">Offen</SelectItem>
                <SelectItem value="ASSIGNED">Zugewiesen</SelectItem>
                <SelectItem value="COMPLETED">Abgeschlossen</SelectItem>
                <SelectItem value="CANCELLED">Storniert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button onClick={handleSave} disabled={loading} className="mt-4">
          {loading ? "Speichern..." : "Änderungen speichern"}
        </Button>
      </CardContent>
    </Card>
  );
}
