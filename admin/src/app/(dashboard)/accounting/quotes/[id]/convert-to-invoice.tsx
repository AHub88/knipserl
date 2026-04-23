"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type OptionalItem = {
  title: string;
  description?: string;
  total: number;
};

function formatEUR(amount: number) {
  return amount.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  });
}

export function ConvertToInvoice({
  quoteId,
  optionalItems,
}: {
  quoteId: string;
  optionalItems: OptionalItem[];
}) {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleItem(title: string) {
    setSelectedItems((prev) =>
      prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title]
    );
  }

  async function handleConvert() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/accounting/quotes/${quoteId}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedItems, dueDate }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Umwandeln");
      }

      const invoice = await res.json();
      router.push(`/accounting/invoices/${invoice.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <h2 className="text-sm font-semibold text-foreground/80">
          In Rechnung umwandeln
        </h2>
      </div>

      <div className="px-6 py-4 space-y-5">
        {/* Optional items selection */}
        {optionalItems.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Optionale Positionen auswählen, die in die Rechnung übernommen
              werden sollen:
            </p>
            <div className="space-y-2">
              {optionalItems.map((item) => (
                <label
                  key={item.title}
                  className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 cursor-pointer transition-colors hover:bg-foreground/[0.03]"
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.title)}
                    onChange={() => toggleItem(item.title)}
                    className="h-4 w-4 rounded border-zinc-600 bg-transparent text-emerald-500 focus:ring-emerald-500/30 focus:ring-offset-0"
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-foreground">
                      {item.title}
                    </span>
                    {item.description && (
                      <p className="text-xs text-muted-foreground/70 mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <span className="text-sm text-muted-foreground tabular-nums font-mono">
                    {formatEUR(item.total)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Due date */}
        <div className="space-y-1.5">
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-muted-foreground"
          >
            Fälligkeitsdatum
          </label>
          <input
            id="dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="block w-full max-w-xs rounded-lg border border-border bg-muted px-3 py-2 text-sm text-foreground focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {/* Submit */}
        <button
          onClick={handleConvert}
          disabled={loading}
          className="rounded-lg bg-emerald-500/15 px-5 py-2.5 text-sm font-semibold text-emerald-400 border border-emerald-500/30 transition-colors hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Wird umgewandelt…" : "In Rechnung umwandeln"}
        </button>
      </div>
    </div>
  );
}
