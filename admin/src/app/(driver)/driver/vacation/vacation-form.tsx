"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function VacationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [type, setType] = useState<"ABSENT" | "LIMITED">("ABSENT");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error("Bitte Start- und Enddatum angeben");
      return;
    }
    if (new Date(endDate) < new Date(startDate)) {
      toast.error("Enddatum muss nach Startdatum liegen");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/vacations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate, note: note || undefined, type }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler");
      }

      toast.success("Urlaub eingetragen!");
      setStartDate("");
      setEndDate("");
      setNote("");
      setType("ABSENT");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setType("ABSENT")}
          className={
            "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors " +
            (type === "ABSENT"
              ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-zinc-300")
          }
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          Abwesend
        </button>
        <button
          type="button"
          onClick={() => setType("LIMITED")}
          className={
            "flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors " +
            (type === "LIMITED"
              ? "border-yellow-500/40 bg-yellow-500/10 text-yellow-400"
              : "border-white/[0.08] bg-white/[0.02] text-zinc-500 hover:text-zinc-300")
          }
        >
          <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Bedingt einsetzbar
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label htmlFor="start" className="text-xs">
            Von
          </Label>
          <Input
            id="start"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end" className="text-xs">
            Bis
          </Label>
          <Input
            id="end"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="note" className="text-xs">
          Notiz (optional)
        </Label>
        <Input
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="z.B. Familienurlaub"
        />
      </div>
      <Button type="submit" disabled={loading} className="w-full" size="sm">
        {loading ? "Wird eingetragen..." : "Urlaub eintragen"}
      </Button>
    </form>
  );
}
