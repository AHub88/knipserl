"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Company = { id: string; name: string };

const CATEGORIES = [
  "Fahrtkosten",
  "Equipment",
  "Marketing",
  "Versicherung",
  "B\u00fcro",
  "Sonstiges",
];

export function IncomingForm({ companies }: { companies: Company[] }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [vendor, setVendor] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [category, setCategory] = useState("");
  const [pdfFilename, setPdfFilename] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!companyId || !vendor || !amount) {
      toast.error("Bitte f\u00fcllen Sie alle Pflichtfelder aus");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/accounting/incoming", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyId,
          vendor,
          invoiceNumber: invoiceNumber || undefined,
          amount: parseFloat(amount),
          dueDate: dueDate || undefined,
          category: category || undefined,
          pdfUrl: pdfFilename || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler");
      }

      toast.success("Eingangsrechnung erstellt");
      router.push("/accounting/incoming");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = "text-sm font-medium text-zinc-300";
  const inputClass =
    "bg-white/[0.04] border-white/[0.08] text-zinc-200 placeholder:text-zinc-600 focus:border-[#F6A11C]/50 focus:ring-[#F6A11C]/20";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Company */}
      <div className="space-y-2">
        <Label className={labelClass}>
          Firma <span className="text-red-400">*</span>
        </Label>
        <Select value={companyId} onValueChange={(v) => v && setCompanyId(v)}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Firma w&auml;hlen" />
          </SelectTrigger>
          <SelectContent>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Vendor */}
      <div className="space-y-2">
        <Label className={labelClass}>
          Lieferant <span className="text-red-400">*</span>
        </Label>
        <Input
          value={vendor}
          onChange={(e) => setVendor(e.target.value)}
          placeholder="z.B. Amazon, Tankstelle..."
          className={inputClass}
          required
        />
      </div>

      {/* Invoice number */}
      <div className="space-y-2">
        <Label className={labelClass}>Rechnungsnummer</Label>
        <Input
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          placeholder="z.B. RE-2026-001"
          className={inputClass}
        />
      </div>

      {/* Amount + Due Date row */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className={labelClass}>
            Betrag (&euro;) <span className="text-red-400">*</span>
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
            className={inputClass}
            required
          />
        </div>
        <div className="space-y-2">
          <Label className={labelClass}>F&auml;lligkeitsdatum</Label>
          <Input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label className={labelClass}>Kategorie</Label>
        <Select value={category} onValueChange={(v) => v && setCategory(v)}>
          <SelectTrigger className={inputClass}>
            <SelectValue placeholder="Kategorie w&auml;hlen" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* PDF Upload placeholder */}
      <div className="space-y-2">
        <Label className={labelClass}>PDF-Beleg</Label>
        <Input
          type="file"
          accept=".pdf"
          onChange={(e) => {
            const file = e.target.files?.[0];
            setPdfFilename(file?.name ?? "");
          }}
          className={`${inputClass} file:mr-3 file:rounded-md file:border-0 file:bg-[#F6A11C]/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-[#F6A11C] hover:file:bg-[#F6A11C]/20`}
        />
        {pdfFilename && (
          <p className="text-xs text-zinc-500">
            Ausgew&auml;hlt: {pdfFilename}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-white/[0.06]">
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-5 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-[#F6A11C]/90 disabled:opacity-50"
        >
          {submitting ? "Speichern..." : "Speichern"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.02] px-5 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-300"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
