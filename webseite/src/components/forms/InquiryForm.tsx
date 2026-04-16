"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGooglePlacesAutocomplete } from "@/lib/use-google-places";
import { saveInquirySummary } from "@/app/anfrage-erhalten/InquirySummary";
import MiniCalendar from "./MiniCalendar";

interface InquiryFormProps {
  preset?: "fotobox" | "gaestetelefon";
  compact?: boolean;
}

function ToggleSwitch({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex flex-col items-center gap-1 cursor-pointer">
      <button
        type="button"
        onClick={onChange}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? "bg-[#F3A300]" : "bg-gray-300"}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? "translate-x-6" : ""}`} />
      </button>
      <span className="text-sm text-[#1a171b]">{label}</span>
    </label>
  );
}

const inputClass = "w-full px-4 py-3 bg-[rgba(0,0,0,0.07)] border-0 rounded-[5px] text-[#1a171b] text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none font-[family-name:var(--font-fira-sans)]";

export default function InquiryForm({ preset = "fotobox", compact = false }: InquiryFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [formData, setFormData] = useState({
    art: preset === "gaestetelefon" ? "Gästetelefon" : "Knipserl mit Drucker",
    datum: "",
    vorname: "",
    nachname: "",
    telefon: "",
    email: "",
    eventType: "",
    location: "",
    locationName: "",
    locationAddress: "",
    locationLat: null as number | null,
    locationLng: null as number | null,
    nachricht: "",
  });

  const locationInputRef = useRef<HTMLInputElement>(null);
  const handlePlaceSelect = useCallback(
    (place: { address: string; name: string; formattedAddress: string; lat: number; lon: number }) => {
      setFormData((prev) => ({
        ...prev,
        location: place.address,
        locationName: place.name || place.formattedAddress,
        locationAddress: place.formattedAddress,
        locationLat: place.lat,
        locationLng: place.lon,
      }));
    },
    []
  );
  useGooglePlacesAutocomplete(locationInputRef, handlePlaceSelect);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Manuelles Editieren des Location-Felds → gespeicherte Places-Metadaten invalidieren
      if (name === "location") {
        return {
          ...prev,
          location: value,
          locationName: "",
          locationAddress: "",
          locationLat: null,
          locationLng: null,
        };
      }
      return { ...prev, [name]: value };
    });
  };

  const toggleEventType = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      eventType: prev.eventType === type ? "" : type,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.datum) {
      alert("Bitte wähle ein Datum im Kalender aus.");
      return;
    }
    setStatus("loading");

    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      saveInquirySummary({
        eventDate: formData.datum,
        eventType: formData.eventType,
        location: formData.locationName || formData.location,
      });
      router.push("/anfrage-erhalten");
    } catch {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Calendar */}
        <MiniCalendar
          selected={formData.datum}
          onSelect={(date) => setFormData((prev) => ({ ...prev, datum: date }))}
        />

        {/* Right: Form fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" name="vorname" required placeholder="Vorname" value={formData.vorname} onChange={handleChange} className={inputClass} />
            <input type="text" name="nachname" required placeholder="Nachname" value={formData.nachname} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input type="tel" name="telefon" required placeholder="Telefon *" value={formData.telefon} onChange={handleChange} className={inputClass} />
            <input type="email" name="email" required placeholder="E-Mail *" value={formData.email} onChange={handleChange} className={inputClass} />
          </div>

          {/* Event type toggles */}
          <div className="flex gap-6 py-2">
            <ToggleSwitch label="Hochzeit" checked={formData.eventType === "Hochzeit"} onChange={() => toggleEventType("Hochzeit")} />
            <ToggleSwitch label="Geburtstag" checked={formData.eventType === "Geburtstag"} onChange={() => toggleEventType("Geburtstag")} />
            <ToggleSwitch label="Firmenevent" checked={formData.eventType === "Firmenevent"} onChange={() => toggleEventType("Firmenevent")} />
          </div>

          <input
            ref={locationInputRef}
            type="text"
            name="location"
            required
            placeholder="Veranstaltungsort *"
            value={formData.location}
            onChange={handleChange}
            className={inputClass}
            autoComplete="off"
          />

          {!compact && (
            <textarea
              name="nachricht"
              rows={3}
              placeholder="Fragen / Anmerkungen"
              value={formData.nachricht}
              onChange={handleChange}
              className={inputClass + " resize-y"}
            />
          )}

          <p className="text-xs text-gray-500">
            Detaillierte Informationen zum Umgang mit Nutzerdaten finden Sie in unserer{" "}
            <a href="/datenschutzerklaerung" className="underline hover:text-[#F3A300]">
              Datenschutzerklärung
            </a>
            .
          </p>
        </div>
      </div>

      {/* Submit button */}
      <div className="text-center mt-8">
        <button
          type="submit"
          disabled={status === "loading"}
          className="px-12 py-5 bg-[#F3A300] text-[#1a171b] font-bold rounded-[5px] hover:bg-[#d99200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-2xl uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]"
        >
          {status === "loading" ? "Wird gesendet..." : "Unverbindlich anfragen"}
        </button>
      </div>

      {status === "error" && (
        <p className="text-red-600 text-sm text-center mt-4">
          Es gab einen Fehler. Bitte versuche es erneut oder kontaktiere uns direkt.
        </p>
      )}
    </form>
  );
}
