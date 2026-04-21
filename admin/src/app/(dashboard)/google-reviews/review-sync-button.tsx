"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";

export function ReviewSyncButton() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch("/api/google-reviews/sync", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Sync fehlgeschlagen");
        return;
      }

      toast.success(
        `${data.imported} neue, ${data.updated} aktualisierte Bewertungen (${data.totalFromGoogle} gesamt auf Google)`
      );
      if (data.notice) {
        toast.warning(data.notice, { duration: 10000 });
      }
      router.refresh();
    } catch {
      toast.error("Verbindungsfehler");
    } finally {
      setSyncing(false);
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex w-full sm:w-auto sm:inline-flex items-center justify-center gap-2 rounded-lg bg-[#4285F4] px-4 py-2.5 sm:py-2 text-sm font-medium text-white hover:bg-[#4285F4]/90 disabled:opacity-50"
    >
      <IconRefresh className={`size-4 ${syncing ? "animate-spin" : ""}`} />
      {syncing ? "Synchronisiert..." : "Jetzt synchronisieren"}
    </button>
  );
}
