"use client";

import { useState } from "react";
import { IconBrandGoogle, IconDeviceFloppy, IconEye, IconEyeOff } from "@tabler/icons-react";
import { toast } from "sonner";

export function GoogleApiForm({
  initialApiKey,
  initialPlaceId,
}: {
  initialApiKey: string;
  initialPlaceId: string;
}) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [showKey, setShowKey] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleApiKey: apiKey,
          googlePlaceId: placeId,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Google API Einstellungen gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-white/[0.10] bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <IconBrandGoogle className="size-5 text-[#4285F4]" />
        <h2 className="text-sm font-semibold text-zinc-300">
          Google API
        </h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showKey ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            Wird f&uuml;r Adress-Autovervollst&auml;ndigung, Entfernungsberechnung und Google Reviews verwendet
          </p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Google Place ID
          </label>
          <input
            type="text"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            placeholder="ChIJ..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            F&uuml;r den automatischen Import von Google Bewertungen
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#F6A11C]/90 disabled:opacity-50"
        >
          <IconDeviceFloppy className="size-4" />
          {saving ? "Speichert..." : "Speichern"}
        </button>
      </div>
    </div>
  );
}
