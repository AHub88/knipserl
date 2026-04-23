"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { IconMapPin, IconDeviceFloppy } from "@tabler/icons-react";
import { toast } from "sonner";

type Suggestion = {
  label: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
};

export function StartAddressForm({
  initialAddress,
  initialLat,
  initialLng,
}: {
  initialAddress: string;
  initialLat: string;
  initialLng: string;
}) {
  const router = useRouter();
  const [address, setAddress] = useState(initialAddress);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [saving, setSaving] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleAddressChange(value: string) {
    setAddress(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch {}
    }, 300);
    setSearchTimeout(timeout);
  }

  function selectSuggestion(s: Suggestion) {
    setAddress(s.label);
    setLat(String(s.lat));
    setLng(String(s.lng));
    setShowSuggestions(false);
  }

  async function handleSave() {
    if (!address || !lat || !lng) {
      toast.error("Bitte eine Adresse auswählen");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAddress: address,
          startLat: lat,
          startLng: lng,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Startadresse gespeichert");
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

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <IconMapPin className="size-5 text-primary" />
          <h2 className="text-sm font-semibold text-foreground/80">Startadresse</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          <IconDeviceFloppy className="size-3.5" />
          {saving ? "..." : "Speichern"}
        </button>
      </div>

      <div className="p-5 space-y-4">
      <p className="text-xs text-muted-foreground">
        Ausgangspunkt f&uuml;r die Entfernungsberechnung zu Locations.
      </p>

      <div className="space-y-3">
        <div className="relative">
          <label className={labelClass}>Adresse</label>
          <input
            className={inputClass}
            value={address}
            onChange={(e) => handleAddressChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Adresse eingeben..."
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-48 overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    selectSuggestion(s);
                  }}
                >
                  <span className="text-foreground">{s.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Breitengrad</label>
            <input className={inputClass + " text-muted-foreground"} value={lat} readOnly />
          </div>
          <div>
            <label className={labelClass}>Längengrad</label>
            <input className={inputClass + " text-muted-foreground"} value={lng} readOnly />
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
