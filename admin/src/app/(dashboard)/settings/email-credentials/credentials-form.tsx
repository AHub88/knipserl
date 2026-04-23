"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconDeviceFloppy, IconCheck, IconTestPipe, IconKey, IconMail } from "@tabler/icons-react";

export function CredentialsForm({ initial }: { initial: Record<string, string> }) {
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved] = useState(false);

  function update(key: string, value: string) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/credentials", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern");
      toast.success("Zugangsdaten gespeichert");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    try {
      const mailFrom = values.mail_from || "info@knipserl.de";
      const res = await fetch("/api/settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: mailFrom }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Test fehlgeschlagen");
      toast.success(`Test-E-Mail gesendet an ${mailFrom}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Test fehlgeschlagen");
    } finally {
      setTesting(false);
    }
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors font-mono";
  const labelClass =
    "block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1";

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
          <IconKey className="size-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Azure Active Directory</h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">

        <div>
          <label className={labelClass}>Tenant ID</label>
          <input
            className={inputClass}
            value={values.azure_tenant_id}
            onChange={(e) => update("azure_tenant_id", e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>

        <div>
          <label className={labelClass}>Client ID</label>
          <input
            className={inputClass}
            value={values.azure_client_id}
            onChange={(e) => update("azure_client_id", e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </div>

        <div>
          <label className={labelClass}>Client Secret</label>
          <input
            className={inputClass}
            type="password"
            value={values.azure_client_secret}
            onChange={(e) => update("azure_client_secret", e.target.value)}
            placeholder="Neues Secret eingeben..."
          />
          <p className="text-[10px] text-muted-foreground/70 mt-1">Wird verschlüsselt gespeichert. Leer lassen um bestehendes beizubehalten.</p>
        </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 sm:px-5 py-3 flex items-center gap-2">
          <IconMail className="size-4 text-primary" />
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Absender</h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4">

        <div>
          <label className={labelClass}>Absender E-Mail</label>
          <input
            className={inputClass}
            type="email"
            value={values.mail_from}
            onChange={(e) => update("mail_from", e.target.value)}
            placeholder="info@knipserl.de"
          />
          <p className="text-[10px] text-muted-foreground/70 mt-1">Muss als Postfach in Microsoft 365 existieren.</p>
        </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 h-10 px-5 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {saved ? (
            <><IconCheck className="size-4" /> Gespeichert</>
          ) : (
            <><IconDeviceFloppy className="size-4" /> {saving ? "Speichern..." : "Speichern"}</>
          )}
        </button>

        <button
          onClick={handleTest}
          disabled={testing}
          className="flex items-center gap-2 h-10 px-4 rounded-lg border border-border bg-card text-foreground/80 text-sm font-medium hover:bg-muted disabled:opacity-50 transition-colors"
        >
          <IconTestPipe className="size-4" />
          {testing ? "Teste..." : "Test-E-Mail senden"}
        </button>
      </div>
    </div>
  );
}
