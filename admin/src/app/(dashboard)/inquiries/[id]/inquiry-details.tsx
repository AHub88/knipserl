"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconConfetti,
  IconCalendar,
  IconCalendarEvent,
  IconMapPin,
  IconRuler,
  IconMessageCircle,
  IconNotes,
  IconStar,
  IconPencil,
  IconCheck,
  IconX,
  IconLoader2,
  IconSearch,
} from "@tabler/icons-react";
import { extraLabel } from "@/lib/extras-pricing";

interface InquiryData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerType: "PRIVATE" | "BUSINESS";
  eventType: string;
  eventDate: string;
  locationName: string;
  locationAddress: string;
  locationLat: number | null;
  locationLng: number | null;
  distanceKm: number | null;
  extras: string[];
  extraPaperRolls: number;
  comments: string | null;
}

interface GeocodeSuggestion {
  label: string;
  street: string;
  zip: string;
  city: string;
  lat: number;
  lng: number;
}

export function InquiryDetails({ inquiry }: { inquiry: InquiryData }) {
  const router = useRouter();
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [geocodeSuggestions, setGeocodeSuggestions] = useState<GeocodeSuggestion[]>([]);
  const [geocodeLoading, setGeocodeLoading] = useState(false);
  const geocodeTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const formattedEventDate = new Date(inquiry.eventDate).toLocaleDateString(
    "de-DE",
    { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
  );

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingField]);

  // Auto-geocode location on mount if address matches locationName (i.e. not yet resolved)
  useEffect(() => {
    if (
      inquiry.locationName &&
      inquiry.locationAddress === inquiry.locationName &&
      !inquiry.locationLat
    ) {
      resolveLocation(inquiry.locationName);
      return;
    }

    // Location ist geocoded, aber distanceKm fehlt → nachziehen
    if (inquiry.locationLat && inquiry.locationLng && inquiry.distanceKm == null) {
      (async () => {
        const distanceKm = await fetchDistanceKm(inquiry.locationLat!, inquiry.locationLng!);
        if (distanceKm != null) {
          await saveField({ distanceKm });
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchDistanceKm(lat: number, lng: number): Promise<number | null> {
    try {
      const res = await fetch(`/api/distance?toLat=${lat}&toLng=${lng}`);
      if (!res.ok) return null;
      const data = await res.json();
      return typeof data?.distanceKm === "number" ? Math.round(data.distanceKm) : null;
    } catch {
      return null;
    }
  }

  const resolveLocation = useCallback(async (query: string) => {
    if (query.length < 3) return;
    setGeocodeLoading(true);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const suggestions: GeocodeSuggestion[] = await res.json();
        if (suggestions.length > 0) {
          const best = suggestions[0];
          const distanceKm = await fetchDistanceKm(best.lat, best.lng);
          await saveField({
            locationAddress: best.label,
            locationLat: best.lat,
            locationLng: best.lng,
            ...(distanceKm != null ? { distanceKm } : {}),
          });
        }
      }
    } catch {
      // silent fail
    } finally {
      setGeocodeLoading(false);
    }
  }, [inquiry.id]);

  async function saveField(updates: Record<string, unknown>) {
    setSaving(true);
    try {
      const res = await fetch(`/api/inquiries/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "updateFields", ...updates }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Speichern");
      }
      toast.success("Gespeichert");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler beim Speichern");
    } finally {
      setSaving(false);
      setEditingField(null);
      setGeocodeSuggestions([]);
    }
  }

  function startEdit(field: string, currentValue: string) {
    setEditingField(field);
    setEditValue(currentValue);
    setGeocodeSuggestions([]);
  }

  function cancelEdit() {
    setEditingField(null);
    setEditValue("");
    setGeocodeSuggestions([]);
  }

  async function confirmEdit(field: string) {
    if (field === "locationAddress") {
      // For location, geocode the input first
      setGeocodeLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(editValue)}`);
        if (res.ok) {
          const suggestions: GeocodeSuggestion[] = await res.json();
          if (suggestions.length > 0) {
            setGeocodeSuggestions(suggestions);
            setGeocodeLoading(false);
            return; // Let user pick from suggestions
          }
        }
      } catch { /* fall through */ }
      setGeocodeLoading(false);
      // No results - save raw value
      await saveField({ [field]: editValue });
    } else {
      await saveField({ [field]: editValue });
    }
  }

  async function selectSuggestion(suggestion: GeocodeSuggestion) {
    const distanceKm = await fetchDistanceKm(suggestion.lat, suggestion.lng);
    await saveField({
      locationAddress: suggestion.label,
      locationLat: suggestion.lat,
      locationLng: suggestion.lng,
      ...(distanceKm != null ? { distanceKm } : {}),
    });
  }

  function handleLocationInputChange(value: string) {
    setEditValue(value);
    // Debounced autocomplete
    if (geocodeTimeout.current) clearTimeout(geocodeTimeout.current);
    if (value.length >= 3) {
      geocodeTimeout.current = setTimeout(async () => {
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
          if (res.ok) {
            const suggestions: GeocodeSuggestion[] = await res.json();
            setGeocodeSuggestions(suggestions);
          }
        } catch { /* ignore */ }
      }, 400);
    } else {
      setGeocodeSuggestions([]);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, field: string) {
    if (e.key === "Enter" && field !== "comments") {
      e.preventDefault();
      confirmEdit(field);
    }
    if (e.key === "Escape") cancelEdit();
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

  function EditableRow({
    icon,
    label,
    value,
    field,
    type = "text",
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    field: string;
    type?: "text" | "textarea" | "location";
  }) {
    const isEditing = editingField === field;

    return (
      <div className="group">
        <div className="flex items-start gap-3">
          <span className="text-muted-foreground/70 shrink-0 mt-0.5">{icon}</span>
          <span className="text-xs text-muted-foreground/70 w-20 shrink-0 mt-0.5">{label}</span>
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="relative">
                {type === "textarea" ? (
                  <textarea
                    ref={inputRef as React.RefObject<HTMLTextAreaElement>}
                    className={inputClass + " resize-y min-h-[60px]"}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelEdit();
                    }}
                    rows={3}
                  />
                ) : type === "location" ? (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    className={inputClass}
                    value={editValue}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, field)}
                    placeholder="Adresse suchen..."
                  />
                ) : (
                  <input
                    ref={inputRef as React.RefObject<HTMLInputElement>}
                    className={inputClass}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, field)}
                  />
                )}

                {/* Geocode suggestions dropdown */}
                {type === "location" && geocodeSuggestions.length > 0 && (
                  <div className="absolute z-10 top-full left-0 right-0 mt-1 rounded-lg border border-border bg-muted shadow-xl overflow-hidden">
                    {geocodeSuggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-3 py-2 text-sm text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors border-b border-border last:border-0"
                      >
                        <div className="font-medium">{s.street || s.label}</div>
                        <div className="text-xs text-muted-foreground/70">{s.zip} {s.city}</div>
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-1.5">
                  <button
                    type="button"
                    onClick={() => confirmEdit(field)}
                    disabled={saving}
                    className="flex items-center gap-1 rounded-md bg-emerald-600/20 text-emerald-400 px-2 py-0.5 text-xs hover:bg-emerald-600/30 transition-colors"
                  >
                    {saving ? <IconLoader2 className="size-3 animate-spin" /> : <IconCheck className="size-3" />}
                    Speichern
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex items-center gap-1 rounded-md bg-zinc-700/30 text-muted-foreground px-2 py-0.5 text-xs hover:bg-zinc-700/50 transition-colors"
                  >
                    <IconX className="size-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="flex items-center gap-2 cursor-pointer group/edit rounded-md px-1 -mx-1 py-0.5 -my-0.5 hover:bg-foreground/[0.04] transition-colors"
                onClick={() => startEdit(field, value)}
              >
                <span className="text-sm font-medium text-foreground truncate whitespace-pre-wrap">
                  {value || "–"}
                </span>
                <IconPencil className="size-3 text-muted-foreground/50 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0" />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  function ReadonlyRow({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string;
  }) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-muted-foreground/70 shrink-0">{icon}</span>
        <span className="text-xs text-muted-foreground/70 w-20 shrink-0">{label}</span>
        <span className="text-sm font-medium text-foreground truncate">{value}</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {/* Customer Info */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center gap-2">
          <IconUser className="size-4 text-primary" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kundendaten</h3>
        </div>
        <div className="p-5">
        <div className="space-y-3">
          <EditableRow
            icon={<IconUser className="size-4" />}
            label="Name"
            value={inquiry.customerName}
            field="customerName"
          />
          <EditableRow
            icon={<IconMail className="size-4" />}
            label="E-Mail"
            value={inquiry.customerEmail}
            field="customerEmail"
          />
          <EditableRow
            icon={<IconPhone className="size-4" />}
            label="Telefon"
            value={inquiry.customerPhone ?? ""}
            field="customerPhone"
          />
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground/70 shrink-0"><IconBriefcase className="size-4" /></span>
            <span className="text-xs text-muted-foreground/70 w-20 shrink-0">Kundentyp</span>
            <div className="flex gap-1">
              {([
                { value: "PRIVATE", label: "Privat" },
                { value: "BUSINESS", label: "Firma" },
              ] as const).map((opt) => {
                const active = inquiry.customerType === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={saving || active}
                    onClick={() => saveField({ customerType: opt.value })}
                    className={
                      "rounded-md px-2.5 py-1 text-xs font-medium transition-colors border " +
                      (active
                        ? "bg-primary/10 text-primary border-primary/30"
                        : "bg-transparent text-muted-foreground border-border hover:bg-foreground/[0.04] hover:text-foreground")
                    }
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Event Info */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center gap-2">
          <IconCalendarEvent className="size-4 text-primary" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Event-Details</h3>
        </div>
        <div className="p-5">
        <div className="space-y-3">
          <EditableRow
            icon={<IconConfetti className="size-4" />}
            label="Eventart"
            value={inquiry.eventType}
            field="eventType"
          />
          <ReadonlyRow
            icon={<IconCalendar className="size-4" />}
            label="Datum"
            value={formattedEventDate}
          />
          <EditableRow
            icon={<IconMapPin className="size-4" />}
            label="Location"
            value={inquiry.locationName}
            field="locationName"
          />
          <div className="relative">
            <EditableRow
              icon={<IconMapPin className="size-4" />}
              label="Adresse"
              value={inquiry.locationAddress}
              field="locationAddress"
              type="location"
            />
            {geocodeLoading && editingField !== "locationAddress" && (
              <div className="flex items-center gap-1.5 mt-1 ml-[calc(16px+12px+80px+12px)]">
                <IconLoader2 className="size-3 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground/70">Adresse wird aufgelöst...</span>
              </div>
            )}
          </div>
          {inquiry.distanceKm != null && (
            <ReadonlyRow
              icon={<IconRuler className="size-4" />}
              label="Entfernung"
              value={`${inquiry.distanceKm} km`}
            />
          )}
        </div>
        </div>
      </div>

      {/* Angefragte Extras */}
      {inquiry.extras.length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="border-b border-border px-5 py-3 flex items-center gap-2">
            <IconStar className="size-4 text-primary" />
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Angefragte Extras</h3>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2">
              {inquiry.extras.map((extra) => (
                <Badge
                  key={extra}
                  variant="outline"
                  className="bg-primary/10 text-primary border-primary/25"
                >
                  {extraLabel(extra)}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Comments */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-5 py-3 flex items-center gap-2">
          <IconNotes className="size-4 text-primary" />
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Kommentare</h3>
        </div>
        <div className="p-5">
        {editingField === "comments" ? (
          <div>
            <textarea
              ref={inputRef as React.RefObject<HTMLTextAreaElement>}
              className={inputClass + " resize-y min-h-[60px]"}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") cancelEdit(); }}
              rows={4}
            />
            <div className="flex items-center gap-1 mt-1.5">
              <button
                type="button"
                onClick={() => saveField({ comments: editValue })}
                disabled={saving}
                className="flex items-center gap-1 rounded-md bg-emerald-600/20 text-emerald-400 px-2 py-0.5 text-xs hover:bg-emerald-600/30 transition-colors"
              >
                {saving ? <IconLoader2 className="size-3 animate-spin" /> : <IconCheck className="size-3" />}
                Speichern
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="flex items-center gap-1 rounded-md bg-zinc-700/30 text-muted-foreground px-2 py-0.5 text-xs hover:bg-zinc-700/50 transition-colors"
              >
                <IconX className="size-3" />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-start gap-2 cursor-pointer group/edit rounded-md px-1 -mx-1 py-0.5 -my-0.5 hover:bg-foreground/[0.04] transition-colors"
            onClick={() => startEdit("comments", inquiry.comments ?? "")}
          >
            <IconMessageCircle className="size-4 text-muted-foreground/70 shrink-0 mt-0.5" />
            <p className="text-sm text-foreground/80 whitespace-pre-wrap flex-1">
              {inquiry.comments || "Klicken um Kommentar hinzuzufügen..."}
            </p>
            <IconPencil className="size-3 text-muted-foreground/50 opacity-0 group-hover/edit:opacity-100 transition-opacity shrink-0 mt-0.5" />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
