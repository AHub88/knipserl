"use client";

import { useState } from "react";
import { EVENT_TYPES } from "@/lib/constants";

interface InquiryFormProps {
  preset?: "fotobox" | "gaestetelefon";
  compact?: boolean;
}

export default function InquiryForm({ preset = "fotobox", compact = false }: InquiryFormProps) {
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
    nachricht: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-semibold text-green-800 mb-2">
          Anfrage erfolgreich gesendet!
        </h3>
        <p className="text-green-700">
          Wir melden uns schnellstmöglich bei Dir. Prüfe auch Deinen Spam-Ordner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <input type="hidden" name="art" value={formData.art} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="datum" className="block text-sm font-medium text-[#1a171b] mb-1">
            Wunschdatum *
          </label>
          <input
            type="date"
            id="datum"
            name="datum"
            required
            value={formData.datum}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="eventType" className="block text-sm font-medium text-[#1a171b] mb-1">
            Art des Events *
          </label>
          <select
            id="eventType"
            name="eventType"
            required
            value={formData.eventType}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
          >
            <option value="">Bitte wählen...</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="vorname" className="block text-sm font-medium text-[#1a171b] mb-1">
            Vorname *
          </label>
          <input
            type="text"
            id="vorname"
            name="vorname"
            required
            placeholder="Vorname"
            value={formData.vorname}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="nachname" className="block text-sm font-medium text-[#1a171b] mb-1">
            Nachname *
          </label>
          <input
            type="text"
            id="nachname"
            name="nachname"
            required
            placeholder="Nachname"
            value={formData.nachname}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="telefon" className="block text-sm font-medium text-[#1a171b] mb-1">
            Telefon *
          </label>
          <input
            type="tel"
            id="telefon"
            name="telefon"
            required
            placeholder="Telefonnummer"
            value={formData.telefon}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-[#1a171b] mb-1">
            E-Mail *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            placeholder="E-Mail Adresse"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-[#1a171b] mb-1">
          Veranstaltungsort *
        </label>
        <input
          type="text"
          id="location"
          name="location"
          required
          placeholder="Name oder Adresse der Location"
          value={formData.location}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors"
        />
      </div>

      {!compact && (
        <div>
          <label htmlFor="nachricht" className="block text-sm font-medium text-[#1a171b] mb-1">
            Fragen / Anmerkungen
          </label>
          <textarea
            id="nachricht"
            name="nachricht"
            rows={3}
            placeholder="Deine Nachricht an uns..."
            value={formData.nachricht}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] transition-colors resize-y"
          />
        </div>
      )}

      <p className="text-xs text-gray-500">
        Detaillierte Informationen zum Umgang mit Nutzerdaten finden Sie in unserer{" "}
        <a href="/datenschutzerklaerung" className="underline hover:text-[#F3A300]">
          Datenschutzerklärung
        </a>
        .
      </p>

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-[#F3A300] text-[#1a171b] font-semibold rounded-lg hover:bg-[#d99200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg"
      >
        {status === "loading" ? "Wird gesendet..." : "Unverbindlich anfragen"}
      </button>

      {status === "error" && (
        <p className="text-red-600 text-sm text-center">
          Es gab einen Fehler. Bitte versuche es erneut oder kontaktiere uns direkt.
        </p>
      )}
    </form>
  );
}
