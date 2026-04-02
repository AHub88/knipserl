"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconTrash } from "@tabler/icons-react";

interface Vacation {
  id: string;
  startDate: string;
  endDate: string;
  note: string | null;
}

export function VacationList({ vacations }: { vacations: Vacation[] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      const res = await fetch(`/api/vacations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Fehler beim Löschen");
      toast.success("Urlaub gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleting(null);
    }
  }

  if (vacations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Kein Urlaub eingetragen
      </p>
    );
  }

  const now = new Date();

  return (
    <div className="space-y-2">
      {vacations.map((v) => {
        const isPast = new Date(v.endDate) < now;
        return (
          <div
            key={v.id}
            className={`flex items-center justify-between rounded-lg border p-3 ${
              isPast ? "opacity-50" : ""
            }`}
          >
            <div>
              <div className="text-sm font-medium">
                {new Date(v.startDate).toLocaleDateString("de-DE")} –{" "}
                {new Date(v.endDate).toLocaleDateString("de-DE")}
              </div>
              {v.note && (
                <div className="text-xs text-muted-foreground">{v.note}</div>
              )}
            </div>
            {!isPast && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => handleDelete(v.id)}
                disabled={deleting === v.id}
              >
                <IconTrash className="h-4 w-4 text-destructive" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
