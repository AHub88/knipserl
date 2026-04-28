"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconDeviceFloppy, IconCopy, IconEye, IconEyeOff, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";
import { generatePassword } from "@/lib/passwords";

export default function NewDriverPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [initials, setInitials] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(true);
  const [role, setRole] = useState("DRIVER");

  async function handleSave() {
    if (!name || !email) {
      toast.error("Name und E-Mail sind Pflichtfelder");
      return;
    }
    if (password.length < 8) {
      toast.error("Passwort muss mindestens 8 Zeichen haben");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || null,
          initials: initials || null,
          password,
          role,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Erstellen");
      }
      toast.success("Fahrer erstellt — bitte Passwort weitergeben");
      router.push("/drivers");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler");
    } finally {
      setSaving(false);
    }
  }

  function handleGenerate() {
    const pw = generatePassword(12);
    setPassword(pw);
    setShowPassword(true);
  }

  async function handleCopy() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      toast.success("Passwort in Zwischenablage kopiert");
    } catch {
      toast.error("Kopieren fehlgeschlagen");
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/drivers" className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Neuer Fahrer</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <IconDeviceFloppy className="size-4" />
          {saving ? "Erstellen..." : "Fahrer erstellen"}
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 space-y-4 max-w-2xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Name *</label>
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Vor- und Nachname" />
          </div>
          <div>
            <label className={labelClass}>Kürzel</label>
            <input className={inputClass} value={initials} onChange={(e) => setInitials(e.target.value.toUpperCase())} placeholder="z.B. MK" maxLength={4} />
          </div>
          <div>
            <label className={labelClass}>E-Mail *</label>
            <input className={inputClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="fahrer@knipserl.de" />
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
          <div className="sm:col-span-2">
            <label className={labelClass}>Passwort *</label>
            <div className="flex items-stretch gap-2">
              <input
                className={inputClass + " font-mono"}
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="mindestens 8 Zeichen"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                title={showPassword ? "Verbergen" : "Anzeigen"}
                className="flex items-center justify-center size-9 shrink-0 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopy}
                disabled={!password}
                title="Kopieren"
                className="flex items-center justify-center size-9 shrink-0 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <IconCopy className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                title="Sicheres Passwort generieren"
                className="flex items-center gap-1.5 h-9 px-3 shrink-0 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-semibold"
              >
                <IconRefresh className="size-4" />
                Generieren
              </button>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              Notiere oder kopiere das Passwort jetzt — nach dem Speichern ist es nur noch als Hash in der DB.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
