"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { IconHandGrab } from "@tabler/icons-react";

export function ClaimOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClaim() {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: "self" }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler");
      }

      toast.success("Auftrag übernommen!");
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
    <Button
      onClick={handleClaim}
      disabled={loading}
      className="w-full"
      size="sm"
    >
      <IconHandGrab className="mr-2 h-4 w-4" />
      {loading ? "Wird übernommen..." : "Auftrag übernehmen"}
    </Button>
  );
}
