"use client";

import { useState } from "react";

const inputBase =
  "w-full h-[52px] px-4 bg-[rgba(0,0,0,0.07)] border-0 rounded-[5px] text-[#1a171b] text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none font-[family-name:var(--font-fira-sans)]";

const textareaClass =
  "w-full px-4 py-3 bg-[rgba(0,0,0,0.07)] border-0 rounded-[5px] text-[#1a171b] text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none font-[family-name:var(--font-fira-sans)] resize-y";

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
    website: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (form.website) {
      setStatus("success");
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
      <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Firma with icon */}
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#F3A300] pointer-events-none">
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M9 13h1M9 17h1M14 9h1M14 13h1M14 17h1" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <input
          type="text"
          name="firma"
          placeholder="Unternehmen"
          value={form.firma}
          onChange={handleChange}
          className={inputBase + " pl-11"}
          autoComplete="organization"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          name="nachname"
          required
          placeholder="Nachname *"
          value={form.nachname}
          onChange={handleChange}
          className={inputBase}
          autoComplete="family-name"
        />
        <input
          type="text"
          name="vorname"
          required
          placeholder="Vorname *"
          value={form.vorname}
          onChange={handleChange}
          className={inputBase}
          autoComplete="given-name"
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
          className={inputBase}
          autoComplete="email"
        />
        <input
          type="tel"
          name="telefon"
          required
          placeholder="Telefon *"
          value={form.telefon}
          onChange={handleChange}
          className={inputBase}
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
        className={textareaClass}
      />

      {/* Honeypot */}
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

      <p className="text-[13px] text-[#888] italic px-2" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
        Detaillierte Informationen zum Umgang mit Nutzerdaten finden Sie in unserer{" "}
        <a href="/datenschutzerklaerung" className="underline hover:text-[#F3A300] not-italic">
          Datenschutzerklärung
        </a>
        .
      </p>

      {errorMsg && (
        <p className="text-red-600 text-sm" role="alert">
          {errorMsg}
        </p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full sm:w-auto px-10 py-4 bg-[#F3A300] text-[#1a171b] font-bold rounded-[5px] hover:bg-[#d99200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xl uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]"
        >
          {status === "loading" ? "Wird gesendet..." : "Nachricht senden"}
        </button>
      </div>
    </form>
  );
}
