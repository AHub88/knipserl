"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft, IconDeviceFloppy, IconUsers, IconEdit, IconX,
  IconMail, IconPhoneCall, IconBuildingStore,
} from "@tabler/icons-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  customerType: string;
  notes: string | null;
};

type OrderRow = {
  id: string;
  orderNumber: number;
  eventType: string;
  eventDate: string;
  locationName: string;
  price: number;
  paid: boolean;
  driverName: string | null;
  driverInitials: string | null;
};

export function CustomerDetail({
  customer,
  orders,
}: {
  customer: Customer;
  orders: OrderRow[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState(customer.name);
  const [email, setEmail] = useState(customer.email ?? "");
  const [phone, setPhone] = useState(customer.phone ?? "");
  const [company, setCompany] = useState(customer.company ?? "");
  const [customerType, setCustomerType] = useState(customer.customerType);
  const [notes, setNotes] = useState(customer.notes ?? "");

  const totalRevenue = orders.reduce((s, o) => s + o.price, 0);
  const paidCount = orders.filter((o) => o.paid).length;

  function handleCancel() {
    setName(customer.name);
    setEmail(customer.email ?? "");
    setPhone(customer.phone ?? "");
    setCompany(customer.company ?? "");
    setCustomerType(customer.customerType);
    setNotes(customer.notes ?? "");
    setEditing(false);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch(`/api/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, company, customerType, notes }),
      });
      if (!res.ok) throw new Error();
      toast.success("Kunde gespeichert");
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";
  const selectClass =
    "h-9 w-full rounded-lg border border-border bg-muted px-2 text-sm text-foreground outline-none focus:border-primary/50 cursor-pointer appearance-none bg-[length:12px] bg-[right_8px_center] bg-no-repeat bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/customers" className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="size-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
              <IconUsers className="size-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{customer.name}</h1>
              <p className="text-sm text-muted-foreground">
                {customer.company ? `${customer.company} · ` : ""}
                {customer.customerType === "BUSINESS" ? "Geschäftskunde" : "Privatkunde"}
              </p>
            </div>
          </div>
        </div>

        {editing ? (
          <div className="flex items-center gap-2">
            <button onClick={handleCancel} className="h-9 px-4 rounded-lg border border-border bg-muted text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">
              Abbrechen
            </button>
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
              <IconDeviceFloppy className="size-4" />
              {saving ? "..." : "Speichern"}
            </button>
          </div>
        ) : (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 h-9 px-4 rounded-lg border border-border bg-muted text-foreground/80 text-sm font-medium hover:bg-accent transition-colors">
            <IconEdit className="size-4" />
            Bearbeiten
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Aufträge</p>
          <p className="text-2xl font-bold text-primary tabular-nums">{orders.length}</p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Umsatz</p>
          <p className="text-2xl font-bold text-emerald-400 tabular-nums">
            {totalRevenue.toLocaleString("de-DE", { minimumFractionDigits: 2 })} &euro;
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Bezahlt</p>
          <p className="text-2xl font-bold text-foreground tabular-nums">
            {paidCount}<span className="text-sm font-normal text-muted-foreground">/{orders.length}</span>
          </p>
        </div>
      </div>

      {/* Kundendaten */}
      {editing ? (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-2xl">
          <h2 className="text-sm font-semibold text-foreground/80">Kundendaten</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Name</label>
              <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Firma</label>
              <input className={inputClass} value={company} onChange={(e) => setCompany(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>E-Mail</label>
              <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Telefon</label>
              <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Typ</label>
              <select className={selectClass} value={customerType} onChange={(e) => setCustomerType(e.target.value)}>
                <option value="PRIVATE" className="bg-card">Privat</option>
                <option value="BUSINESS" className="bg-card">Geschäftlich</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelClass}>Notizen</label>
            <textarea className={inputClass + " h-20 py-2 resize-none"} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Interne Notizen..." />
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card p-5 space-y-2">
          <h2 className="text-sm font-semibold text-foreground/80 mb-3">Kontaktdaten</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <IconMail className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground/80">{customer.email || "–"}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconPhoneCall className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground/80">{customer.phone || "–"}</span>
            </div>
            <div className="flex items-center gap-3">
              <IconBuildingStore className="size-4 text-muted-foreground" />
              <span className="text-sm text-foreground/80">{customer.company || "–"}</span>
            </div>
          </div>
          {customer.notes && (
            <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs text-amber-400 font-semibold mb-1">Notizen</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{customer.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Orders */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground/80">Aufträge</h2>
          <Link href={`/orders/new`} className="text-xs text-primary hover:underline">
            + Neuer Auftrag
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Noch keine Aufträge</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border hover:bg-transparent">
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">#</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Datum</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Event</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Location</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Fahrer</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-right">Preis</TableHead>
                <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center">Bezahlt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => (
                <TableRow
                  key={o.id}
                  onClick={() => router.push(`/orders/${o.id}`)}
                  className="cursor-pointer border-b border-border hover:bg-muted transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">{o.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground text-sm tabular-nums">
                    {new Date(o.eventDate).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{o.eventType}</TableCell>
                  <TableCell className="text-muted-foreground text-sm max-w-[150px]">
                    <span className="block truncate">{o.locationName}</span>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/80">{o.driverInitials ?? o.driverName ?? <span className="text-muted-foreground">–</span>}</TableCell>
                  <TableCell className="text-right font-mono text-sm text-foreground tabular-nums">{o.price.toFixed(2)}&nbsp;&euro;</TableCell>
                  <TableCell className="text-center">
                    <span className={"inline-block size-2.5 rounded-full " + (o.paid ? "bg-emerald-400" : "bg-red-400/60")} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
