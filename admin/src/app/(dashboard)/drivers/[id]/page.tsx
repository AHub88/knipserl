"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "sonner";

export default function DriverEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initials, setInitials] = useState("");
  const [role, setRole] = useState("DRIVER");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetch(`/api/drivers/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setName(d.name ?? "");
        setEmail(d.email ?? "");
        setPhone(d.phone ?? "");
        setInitials(d.initials ?? "");
        setRole(d.role ?? "DRIVER");
        setActive(d.active ?? true);
        setLoading(false);
      });
  }, [id]);

  async function handleSave() {
    if (!name || !email) {
      toast.error("Name und E-Mail sind Pflichtfelder");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, initials, role, active }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler");
      }
      toast.success("Fahrer gespeichert");
      router.push("/drivers");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
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

  if (loading) {
    return <div className="text-muted-foreground p-8 text-center">Laden...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/drivers" className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Fahrer bearbeiten</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <IconDeviceFloppy className="size-4" />
          {saving ? "Speichern..." : "Speichern"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-2xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Kürzel</label>
            <input className={inputClass} value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} maxLength={4} />
          </div>
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Telefon</label>
            <input className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div>
            <label className={labelClass}>Rolle</label>
            <select className={selectClass} value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="DRIVER" className="bg-card">Fahrer</option>
              <option value="ADMIN" className="bg-card">Administrator</option>
              <option value="ADMIN_ACCOUNTING" className="bg-card">Buchhaltung</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Status</label>
            <select className={selectClass} value={active ? "true" : "false"} onChange={(e) => setActive(e.target.value === "true")}>
              <option value="true" className="bg-card">Aktiv</option>
              <option value="false" className="bg-card">Inaktiv</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
