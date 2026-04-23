"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconArrowLeft, IconDeviceFloppy, IconLoader2 } from "@tabler/icons-react";
import { toast } from "sonner";

type Suggestion = {
  label: string;
  name?: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
};

export default function NewLocationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [street, setStreet] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [distanceKm, setDistanceKm] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  // Address autocomplete
  const [addressQuery, setAddressQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Name (place) autocomplete
  const [nameSuggestions, setNameSuggestions] = useState<Suggestion[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [nameSearchTimeout, setNameSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  function handleAddressSearch(value: string) {
    setAddressQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}&mode=address`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch {}
    }, 300);
    setSearchTimeout(timeout);
  }

  function handleNameSearch(value: string) {
    setName(value);
    if (nameSearchTimeout) clearTimeout(nameSearchTimeout);
    if (value.length < 3) {
      setNameSuggestions([]);
      return;
    }
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}&mode=place`);
        if (res.ok) {
          const data = await res.json();
          setNameSuggestions(data);
          setShowNameSuggestions(true);
        }
      } catch {}
    }, 300);
    setNameSearchTimeout(timeout);
  }

  async function applyLocation(s: Suggestion, fillName: boolean) {
    setStreet(s.street);
    setZip(s.zip);
    setCity(s.city);
    setLat(s.lat);
    setLng(s.lng);
    setAddressQuery(s.label);
    setShowSuggestions(false);
    setShowNameSuggestions(false);
    if (fillName && s.name) setName(s.name);

    setCalculating(true);
    try {
      const res = await fetch(`/api/distance?toLat=${s.lat}&toLng=${s.lng}`);
      if (res.ok) {
        const data = await res.json();
        setDistanceKm(String(data.distanceKm));
      } else {
        const err = await res.json();
        if (err.error?.includes("Startadresse")) {
          toast.error("Startadresse nicht konfiguriert. Bitte unter Einstellungen hinterlegen.");
        }
      }
    } catch {} finally {
      setCalculating(false);
    }
  }

  function selectSuggestion(s: Suggestion) {
    applyLocation(s, false);
  }

  function selectNameSuggestion(s: Suggestion) {
    applyLocation(s, true);
  }

  async function handleSave() {
    if (!name) {
      toast.error("Name ist ein Pflichtfeld");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/locations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          street: street || null,
          zip: zip || null,
          city: city || null,
          distanceKm: distanceKm ? Number(distanceKm) : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Erstellen");
      }
      const loc = await res.json();
      toast.success("Location erstellt");
      router.push(`/locations/${loc.id}`);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/locations" className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <IconArrowLeft className="size-4" />
          </Link>
          <h1 className="text-xl font-bold text-foreground">Neue Location</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors">
          <IconDeviceFloppy className="size-4" />
          {saving ? "Erstellen..." : "Location erstellen"}
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2 max-w-4xl">
        {/* Location-Name */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80">Location</h2>
          <div className="relative">
            <label className={labelClass}>Name *</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => handleNameSearch(e.target.value)}
              onFocus={() => nameSuggestions.length > 0 && setShowNameSuggestions(true)}
              onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
              placeholder="z.B. Gasthaus Bartl, Mcdonalds Rosenheim"
              autoComplete="off"
            />
            {showNameSuggestions && nameSuggestions.length > 0 && (
              <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-card shadow-xl max-h-64 overflow-y-auto">
                {nameSuggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors border-b border-border last:border-0"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectNameSuggestion(s);
                    }}
                  >
                    <div className="text-foreground font-medium">{s.name ?? s.label}</div>
                    {s.name && (
                      <div className="text-xs text-muted-foreground truncate">{s.label}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Google-Suche: z.B. <span className="text-foreground/80">&bdquo;Gasthaus Bartl&ldquo;</span> oder <span className="text-foreground/80">&bdquo;Mcdonalds Rosenheim&ldquo;</span> &rarr; Adresse wird automatisch bef&uuml;llt.
            </p>
          </div>
        </div>

        {/* Adresssuche */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <h2 className="text-sm font-semibold text-foreground/80">Adresse suchen</h2>
          <div className="relative">
            <label className={labelClass}>Adresse eingeben</label>
            <input
              className={inputClass}
              value={addressQuery}
              onChange={(e) => handleAddressSearch(e.target.value)}
              onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="z.B. Dorfstraße 29, 83052 Bruckmühl"
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
          <p className="text-xs text-muted-foreground">
            Adresse w&auml;hlen &rarr; Stra&szlig;e, PLZ, Ort und Entfernung werden automatisch ausgef&uuml;llt.
          </p>
        </div>

        {/* Adressfelder */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-foreground/80">Adressdaten</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Straße</label>
              <input className={inputClass} value={street} onChange={(e) => setStreet(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>PLZ</label>
              <input className={inputClass} value={zip} onChange={(e) => setZip(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Ort</label>
              <input className={inputClass} value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Entfernung (KM)</label>
              <div className="relative">
                <input
                  className={inputClass}
                  type="number"
                  step="0.1"
                  value={distanceKm}
                  onChange={(e) => setDistanceKm(e.target.value)}
                  placeholder="–"
                />
                {calculating && (
                  <IconLoader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-primary animate-spin" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Wird automatisch als Wegstrecke berechnet
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
