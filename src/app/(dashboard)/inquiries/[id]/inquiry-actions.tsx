"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { IconCheck, IconX } from "@tabler/icons-react";

interface InquiryActionsProps {
  inquiryId: string;
  customerType: string;
}

export function InquiryActions({ inquiryId, customerType }: InquiryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("INVOICE");

  async function handleAction(action: "accept" | "reject") {
    if (action === "accept" && !price) {
      toast.error("Bitte einen Preis eingeben");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          price: action === "accept" ? parseFloat(price) : undefined,
          paymentMethod: action === "accept" ? paymentMethod : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler bei der Verarbeitung");
      }

      toast.success(
        action === "accept"
          ? "Anfrage angenommen – Auftrag erstellt"
          : "Anfrage abgelehnt"
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Anfrage bearbeiten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Kundentyp:{" "}
            <strong>{customerType === "BUSINESS" ? "Firmenkunde → GbR" : "Privatkunde → Einzelunternehmen"}</strong>
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="price">Preis (€)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="z.B. 450.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment">Zahlart</Label>
              <Select value={paymentMethod} onValueChange={(v) => v && setPaymentMethod(v)}>
                <SelectTrigger id="payment">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INVOICE">Rechnung</SelectItem>
                  <SelectItem value="CASH">Bar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => handleAction("accept")}
              disabled={loading}
              className="flex-1"
            >
              <IconCheck className="mr-2 h-4 w-4" />
              Annehmen
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleAction("reject")}
              disabled={loading}
              className="flex-1"
            >
              <IconX className="mr-2 h-4 w-4" />
              Ablehnen
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
