"use client";

import { useState } from "react";

const inputClass =
  "w-full px-4 py-3 bg-[rgba(0,0,0,0.07)] border-0 rounded-[5px] text-[#1a171b] text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none font-[family-name:var(--font-fira-sans)]";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [form, setForm] = useState({
    firma: "",
    vorname: "",
    nachname: "",
    email: "",
    telefon: "",
    nachricht: "",
    consent: false,
    // honeypot — real users leave empty
    website: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.website) {
      // Honeypot triggered — silently "succeed"
      setStatus("success");
      return;
    }

    if (!form.consent) {
      setErrorMsg("Bitte stimme der Datenschutzerklärung zu.");
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          art: "Kontaktanfrage",
          firma: form.firma,
          vorname: form.vorname,
          nachname: form.nachname,
          email: form.email,
          telefon: form.telefon,
          nachricht: form.nachricht,
          eventType: form.firma ? "Firmenevent" : "Kontaktanfrage",
          datum: "",
          location: "",
          source: "kontakt",
        }),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMsg("Beim Senden ist ein Fehler aufgetreten. Bitte versuche es erneut oder ruf uns direkt an.");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
        <svg
          className="w-16 h-16 text-green-500 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Nachricht gesendet!</h3>
        <p className="text-green-700">
          Wir melden uns innerhalb von 24 Stunden bei Dir — in der Regel deutlich schneller. Prüfe auch Deinen Spam-Ordner.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="firma"
        placeholder="Firma (optional)"
        value={form.firma}
        onChange={handleChange}
        className={inputClass}
        autoComplete="organization"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="vorname"
          required
          placeholder="Vorname *"
          value={form.vorname}
          onChange={handleChange}
          className={inputClass}
          autoComplete="given-name"
        />
        <input
          type="text"
          name="nachname"
          required
          placeholder="Nachname *"
          value={form.nachname}
          onChange={handleChange}
          className={inputClass}
          autoComplete="family-name"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="email"
          name="email"
          required
          placeholder="E-Mail *"
          value={form.email}
          onChange={handleChange}
          className={inputClass}
          autoComplete="email"
        />
        <input
          type="tel"
          name="telefon"
          required
          placeholder="Telefon *"
          value={form.telefon}
          onChange={handleChange}
          className={inputClass}
          autoComplete="tel"
        />
      </div>

      <textarea
        name="nachricht"
        required
        rows={5}
        placeholder="Deine Nachricht *"
        value={form.nachricht}
        onChange={handleChange}
        className={inputClass + " resize-y"}
      />

      {/* Honeypot field — hidden from real users, bots fill it */}
      <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", top: "auto", width: "1px", height: "1px", overflow: "hidden" }}>
        <label>
          Website (nicht ausfüllen)
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={handleChange}
          />
        </label>
      </div>

      <label className="flex items-start gap-3 text-sm text-[#666] cursor-pointer">
        <input
          type="checkbox"
          name="consent"
          checked={form.consent}
          onChange={handleChange}
          className="mt-1 w-4 h-4 accent-[#F3A300]"
        />
        <span>
          Ich habe die{" "}
          <a href="/datenschutzerklaerung" className="underline hover:text-[#F3A300]">
            Datenschutzerklärung
          </a>{" "}
          gelesen und bin mit der Verarbeitung meiner Daten zur Bearbeitung der Anfrage einverstanden. *
        </span>
      </label>

      {errorMsg && (
        <p className="text-red-600 text-sm" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full px-8 py-4 bg-[#F3A300] text-[#1a171b] font-bold rounded-[5px] hover:bg-[#d99200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]"
      >
        {status === "loading" ? "Wird gesendet..." : "Nachricht senden"}
      </button>
    </form>
  );
}
