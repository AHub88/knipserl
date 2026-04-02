"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  IconCheck,
  IconX,
  IconCash,
  IconFileInvoice,
  IconLoader2,
  IconBriefcase,
  IconUser,
} from "@tabler/icons-react";

interface InquiryActionsProps {
  inquiryId: string;
  customerType: string;
}

export function InquiryActions({
  inquiryId,
  customerType,
}: InquiryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);
  const [price, setPrice] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"INVOICE" | "CASH">(
    "INVOICE"
  );

  async function handleAction(action: "accept" | "reject") {
    if (action === "accept" && !price) {
      toast.error("Bitte einen Preis eingeben");
      return;
    }

    setLoading(action);
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
          ? "Anfrage angenommen -- Auftrag erstellt"
          : "Anfrage abgelehnt"
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setLoading(null);
    }
  }

  const isBusiness = customerType === "BUSINESS";

  return (
    <Card className="border-[#F6A11C]/20 shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Anfrage bearbeiten</CardTitle>
          <Badge
            variant="outline"
            className={
              isBusiness
                ? "bg-blue-500/10 text-blue-600 border-blue-500/25 dark:text-blue-400"
                : "bg-secondary text-secondary-foreground"
            }
          >
            {isBusiness ? (
              <IconBriefcase className="mr-1 size-3" />
            ) : (
              <IconUser className="mr-1 size-3" />
            )}
            {isBusiness ? "Firmenkunde" : "Privatkunde"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Entity info */}
        <div className="rounded-lg bg-muted/50 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Auftrag wird erstellt als{" "}
            <span className="font-semibold text-foreground">
              {isBusiness ? "GbR" : "Einzelunternehmen"}
            </span>
          </p>
        </div>

        {/* Price input with integrated euro symbol */}
        <div className="space-y-2">
          <Label htmlFor="price" className="text-sm font-medium">
            Preis
          </Label>
          <div className="relative">
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="450.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="pr-10 text-lg font-medium tabular-nums"
            />
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-base font-semibold text-muted-foreground">
                &euro;
              </span>
            </div>
          </div>
        </div>

        {/* Payment method toggle */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Zahlungsart</Label>
          <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-1">
            <button
              type="button"
              onClick={() => setPaymentMethod("INVOICE")}
              className={`
                flex items-center justify-center gap-2 rounded-md px-4 py-2.5
                text-sm font-medium transition-all duration-200
                ${
                  paymentMethod === "INVOICE"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <IconFileInvoice className="size-4" />
              Rechnung
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod("CASH")}
              className={`
                flex items-center justify-center gap-2 rounded-md px-4 py-2.5
                text-sm font-medium transition-all duration-200
                ${
                  paymentMethod === "CASH"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                    : "text-muted-foreground hover:text-foreground"
                }
              `}
            >
              <IconCash className="size-4" />
              Bar
            </button>
          </div>
        </div>

        <Separator />

        {/* Action buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => handleAction("accept")}
            disabled={loading !== null}
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700 transition-all duration-200 active:scale-[0.98]"
          >
            {loading === "accept" ? (
              <IconLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <IconCheck className="mr-2 size-4" />
            )}
            Annehmen
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleAction("reject")}
            disabled={loading !== null}
            className="flex-1 transition-all duration-200 active:scale-[0.98]"
          >
            {loading === "reject" ? (
              <IconLoader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <IconX className="mr-2 size-4" />
            )}
            Ablehnen
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
