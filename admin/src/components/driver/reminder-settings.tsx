"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconMail, IconMailOff } from "@tabler/icons-react";

const LEAD_OPTIONS = [
  { value: "1", label: "1 Tag vorher" },
  { value: "2", label: "2 Tage vorher" },
  { value: "3", label: "3 Tage vorher" },
  { value: "7", label: "1 Woche vorher" },
];

export function ReminderSettings({
  initialEnabled,
  initialLeadDays,
  driverEmail,
}: {
  initialEnabled: boolean;
  initialLeadDays: number;
  driverEmail: string;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [leadDays, setLeadDays] = useState(String(initialLeadDays));
  const [pending, startTransition] = useTransition();

  function save(next: { reminderEmailEnabled?: boolean; reminderLeadDays?: number }) {
    startTransition(async () => {
      try {
        const res = await fetch("/api/driver/reminder-settings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error ?? "Speichern fehlgeschlagen");
        }
        toast.success("Gespeichert");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Speichern fehlgeschlagen");
      }
    });
  }

  function toggle() {
    const next = !enabled;
    setEnabled(next);
    save({ reminderEmailEnabled: next });
  }

  function onLeadChange(v: string | null) {
    if (!v) return;
    setLeadDays(v);
    save({ reminderLeadDays: Number(v) });
  }

  return (
    <Card>
      <CardHeader className="border-b flex-row items-center gap-2">
        <IconMail className="size-4 text-primary" />
        <CardTitle className="text-base">Auftrags-Erinnerungen per E-Mail</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <p className="text-sm text-muted-foreground">
          Du bekommst vor jedem Auftrag eine Erinnerung an{" "}
          <strong className="text-foreground">{driverEmail}</strong>.
        </p>

        <div className="flex items-center justify-between gap-3">
          <div className="text-sm">
            <div className="font-medium">Erinnerung aktiv</div>
            <div className="text-muted-foreground text-xs">
              {enabled ? "Du bekommst Erinnerungen" : "Du bekommst keine Erinnerungen"}
            </div>
          </div>
          <Button
            onClick={toggle}
            disabled={pending}
            size="sm"
            variant={enabled ? "secondary" : "outline"}
          >
            {enabled ? (
              <>
                <IconMail className="h-4 w-4" /> Aktiv
              </>
            ) : (
              <>
                <IconMailOff className="h-4 w-4" /> Aus
              </>
            )}
          </Button>
        </div>

        <div className={enabled ? "" : "opacity-50 pointer-events-none"}>
          <label className="text-sm font-medium mb-1 block">Vorlauf</label>
          <Select value={leadDays} onValueChange={onLeadChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">
            Hinweis: Der Versand läuft morgens. Bei 1 Tag Vorlauf kommt die Mail also
            am Vortag, nicht 24 Stunden exakt vor Auftragsbeginn.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
