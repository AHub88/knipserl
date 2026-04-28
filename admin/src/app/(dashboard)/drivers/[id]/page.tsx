"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
  IconKey,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { generatePassword } from "@/lib/passwords";

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

  // Passwort-Reset-State (separater Flow vom Speichern der Stammdaten)
  const [resetMode, setResetMode] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(true);
  const [savingPassword, setSavingPassword] = useState(false);

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

  function handleStartReset() {
    setNewPassword(generatePassword(12));
    setShowNewPassword(true);
    setResetMode(true);
  }

  function handleCancelReset() {
    setResetMode(false);
    setNewPassword("");
  }

  async function handleCopyNewPassword() {
    if (!newPassword) return;
    try {
      await navigator.clipboard.writeText(newPassword);
      toast.success("Passwort in Zwischenablage kopiert");
    } catch {
      toast.error("Kopieren fehlgeschlagen");
    }
  }

  async function handleConfirmReset() {
    if (newPassword.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/drivers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler");
      }
      toast.success("Passwort aktualisiert — bitte an Fahrer weitergeben");
      setResetMode(false);
      setNewPassword("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setSavingPassword(false);
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

      {/* Passwort-Reset — separate Karte, eigener Save-Button */}
      <div className="rounded-xl border border-border bg-card p-5 max-w-2xl">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
            <IconKey className="size-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground">Passwort zurücksetzen</h2>
            <p className="text-[11px] text-muted-foreground">
              Generiert ein neues Passwort. Wird sofort gespeichert; das alte ist danach ungültig.
            </p>
          </div>
        </div>

        {!resetMode ? (
          <button
            type="button"
            onClick={handleStartReset}
            className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted text-foreground hover:bg-muted/70 transition-colors text-sm font-medium"
          >
            <IconRefresh className="size-4" />
            Neues Passwort generieren
          </button>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
              <p className="text-[11px] text-amber-500 mb-2 font-semibold">
                Notiere oder kopiere das Passwort jetzt — es wird nach dem Speichern nicht mehr angezeigt.
              </p>
              <div className="flex items-stretch gap-2">
                <input
                  className={inputClass + " font-mono"}
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((s) => !s)}
                  title={showNewPassword ? "Verbergen" : "Anzeigen"}
                  className="flex items-center justify-center size-9 shrink-0 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showNewPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyNewPassword}
                  title="Kopieren"
                  className="flex items-center justify-center size-9 shrink-0 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors"
                >
                  <IconCopy className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={handleStartReset}
                  title="Neu generieren"
                  className="flex items-center justify-center size-9 shrink-0 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  <IconRefresh className="size-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConfirmReset}
                disabled={savingPassword || newPassword.length < 8}
                className="flex items-center gap-2 h-9 px-4 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400 disabled:opacity-50 transition-colors"
              >
                <IconCheck className="size-4" />
                {savingPassword ? "Speichern…" : "Passwort speichern"}
              </button>
              <button
                type="button"
                onClick={handleCancelReset}
                disabled={savingPassword}
                className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                <IconX className="size-4" />
                Abbrechen
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
