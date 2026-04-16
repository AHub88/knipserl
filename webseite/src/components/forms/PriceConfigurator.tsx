"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ADDONS, BASE_PRICE } from "@/lib/constants";
import { calculateDeliveryCost } from "@/lib/distance";
import { useGooglePlacesAutocomplete, type PlaceSelection } from "@/lib/use-google-places";
import MiniCalendar from "./MiniCalendar";

interface DeliveryInfo {
  distanceKm: number;
  price: number;
  outsideDeliveryArea: boolean;
  destinationName: string;
  destinationLat: number;
  destinationLon: number;
  routePolyline: string;
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

export default function PriceConfigurator() {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [destination, setDestination] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [locationLat, setLocationLat] = useState<number | null>(null);
  const [locationLng, setLocationLng] = useState<number | null>(null);
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [mapsApiKey, setMapsApiKey] = useState("");
  const destinationInputRef = useRef<HTMLInputElement>(null);

  // Inquiry form state
  const [inquiry, setInquiry] = useState({
    vorname: "",
    nachname: "",
    telefon: "",
    email: "",
    eventType: "",
    datum: "",
    nachricht: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [submitError, setSubmitError] = useState("");
  const [showInquiry, setShowInquiry] = useState(false);
  const inquiryRef = useRef<HTMLDivElement>(null);

  const openInquiry = () => {
    setShowInquiry(true);
    // Nach dem Rendern scrollen
    setTimeout(() => {
      inquiryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const runCalculation = useCallback(async (address: string, coords?: { lat: number; lon: number }) => {
    if (!address.trim()) return;
    setDeliveryLoading(true);
    setDeliveryError("");
    setDelivery(null);

    try {
      const result = await calculateDeliveryCost(address, coords);
      if (!result) {
        setDeliveryError("Adresse konnte nicht gefunden werden. Bitte genauer eingeben.");
        return;
      }
      setDelivery(result);
    } catch {
      setDeliveryError("Fehler bei der Berechnung. Bitte versuche es erneut.");
    } finally {
      setDeliveryLoading(false);
    }
  }, []);

  const handlePlaceSelect = useCallback((place: PlaceSelection) => {
    setDestination(place.address);
    setLocationName(place.name || place.formattedAddress);
    setLocationAddress(place.formattedAddress);
    setLocationLat(place.lat);
    setLocationLng(place.lon);
    runCalculation(place.address, { lat: place.lat, lon: place.lon });
  }, [runCalculation]);

  useGooglePlacesAutocomplete(destinationInputRef, handlePlaceSelect);

  useEffect(() => {
    fetch("/api/maps-config")
      .then((r) => r.json())
      .then((d) => { if (d.apiKey) setMapsApiKey(d.apiKey); })
      .catch(() => {});
  }, []);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addonsTotal = ADDONS.filter((a) => selectedAddons.has(a.id)).reduce(
    (sum, a) => sum + a.price,
    0
  );

  const deliveryPrice = delivery?.price ?? 0;
  const totalPrice = BASE_PRICE + addonsTotal + deliveryPrice;

  const calculateDistance = useCallback(() => {
    runCalculation(destination);
  }, [destination, runCalculation]);

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
    // Manuelles Editieren invalidiert die Places-Metadaten
    setLocationName("");
    setLocationAddress("");
    setLocationLat(null);
    setLocationLng(null);
  };

  const handleInquiryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInquiry((prev) => ({ ...prev, [name]: value }));
  };

  const toggleEventType = (type: string) => {
    setInquiry((prev) => ({ ...prev, eventType: prev.eventType === type ? "" : type }));
  };

  const selectedAddonNames = ADDONS.filter((a) => selectedAddons.has(a.id)).map((a) => a.name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiry.datum) {
      setSubmitError("Bitte wähle ein Datum im Kalender aus.");
      return;
    }
    if (!destination.trim()) {
      setSubmitError("Bitte gib Deinen Veranstaltungsort an.");
      return;
    }
    setSubmitError("");
    setSubmitStatus("loading");

    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          art: "Knipserl mit Drucker",
          vorname: inquiry.vorname,
          nachname: inquiry.nachname,
          telefon: inquiry.telefon,
          email: inquiry.email,
          eventType: inquiry.eventType,
          datum: inquiry.datum,
          location: destination,
          locationName,
          locationAddress,
          locationLat,
          locationLng,
          nachricht: inquiry.nachricht,
          addons: selectedAddonNames,
          deliveryDistance: delivery?.distanceKm,
          deliveryPrice: delivery?.price,
          totalPrice,
          source: "preiskonfigurator",
        }),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <div className="space-y-12">
      {/* ===== ZUBEHÖR ===== */}
      <div>
        <div className="text-center mb-10">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[var(--brand-dark)] inline-block">
            Fotobox Zubehör
          </h2>
          <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
            Zusätzlich buchbar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ADDONS.map((addon) => (
            <label
              key={addon.id}
              style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
              className={`flex gap-6 p-4 rounded-lg cursor-pointer transition-all ${
                selectedAddons.has(addon.id)
                  ? "bg-[var(--brand-dark)] text-white"
                  : "bg-[#F3F4F6]"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAddons.has(addon.id)}
                onChange={() => toggleAddon(addon.id)}
                className="sr-only"
              />

              {/* Image */}
              <div className="w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={addon.image}
                  alt={addon.name}
                  className={`w-full h-auto ${selectedAddons.has(addon.id) ? "invert" : ""}`}
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 pt-3">
                <div className="flex justify-between items-start gap-2">
                  <h4 className={`font-bold text-[24px] leading-[1.1] uppercase tracking-[-0.5px] font-[family-name:var(--font-fira-condensed)] ${
                    selectedAddons.has(addon.id) ? "text-white" : "text-[var(--brand-dark)]"
                  }`}>
                    {addon.name}
                  </h4>
                  <span className="text-[#F3A300] font-bold whitespace-nowrap text-[15px]" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                    +{addon.price}&euro;
                  </span>
                </div>
                <p className={`text-[13px] mt-3 line-clamp-2 ${
                  selectedAddons.has(addon.id) ? "text-gray-300" : "text-[var(--brand-dark)]"
                }`} style={{ fontWeight: 400, textTransform: "none" }}>
                  {addon.description}
                </p>
                {addon.link && (
                  <a
                    href={addon.link}
                    className="text-xs text-[#F3A300] hover:underline mt-1 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    mehr Infos &raquo;
                  </a>
                )}
              </div>

              {/* Checkbox indicator — rechts */}
              <div className="flex-shrink-0 self-center">
                <div
                  className={`w-6 h-6 border-2 flex items-center justify-center ${
                    selectedAddons.has(addon.id)
                      ? "bg-[#F3A300] border-[#F3A300]"
                      : "bg-white border-gray-300"
                  }`}
                >
                  {selectedAddons.has(addon.id) && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ===== FAHRTKOSTEN ===== */}
      <div>
        <div className="text-center mb-8">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[var(--brand-dark)] inline-block">
            Fahrtkosten
          </h2>
          <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
            für den Auf- und Abbau
          </p>
        </div>

        <p className="text-[#666] text-[15px] mb-8 max-w-[800px] mx-auto text-center" style={{ fontWeight: 400, textTransform: "none" }}>
          Wir liefern die Fotobox zu Deiner Location und kümmern uns um den kompletten Auf- und Abbau.
          Da wir daher die Strecke zu Deiner Location insgesamt 4x mal fahren müssen, kommen hier ab 15km Fahrtkosten hinzu.
        </p>

        <div
          className="bg-[#F3F4F6] rounded-lg p-6 md:p-8"
          style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left: Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-[18px] font-bold uppercase text-[var(--brand-dark)] mb-2 font-[family-name:var(--font-fira-condensed)]">
                  Veranstaltungsort
                </label>
                <input
                  ref={destinationInputRef}
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  placeholder="Name/Anschrift eingeben..."
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded text-[var(--brand-dark)] text-base placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      calculateDistance();
                    }
                  }}
                />
              </div>

              <div className="border-t border-gray-200 pt-4">
                <span className="block text-[18px] font-bold uppercase text-[var(--brand-dark)] mb-1 font-[family-name:var(--font-fira-condensed)]">
                  Berechnete Distanz
                </span>
                <span className="text-[var(--brand-dark)] text-[22px]" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                  {delivery ? `${delivery.distanceKm} km` : "–"}
                </span>
              </div>

              {delivery?.outsideDeliveryArea && (
                <p className="bg-red-600 text-white font-bold text-[14px] px-4 py-2 rounded inline-block uppercase font-[family-name:var(--font-fira-condensed)]">
                  Außerhalb Liefergebiet!
                </p>
              )}

              <div className="border-t border-gray-200 pt-4">
                <span className="block text-[18px] font-bold uppercase text-[var(--brand-dark)] mb-1 font-[family-name:var(--font-fira-condensed)]">
                  Fahrtkosten
                </span>
                <span className="text-[var(--brand-dark)] text-[22px]" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                  {delivery
                    ? delivery.price === 0 ? "Kostenlos" : `${delivery.price.toFixed(2)} €`
                    : "–"}
                </span>
              </div>

              {deliveryError && (
                <p className="text-red-600 text-sm">{deliveryError}</p>
              )}
            </div>

            {/* Right: Map */}
            <div>
              <span className="block text-[18px] font-bold uppercase text-[var(--brand-dark)] mb-2 font-[family-name:var(--font-fira-condensed)]">
                Map
              </span>
              <div className="bg-gray-200 rounded overflow-hidden" style={{ height: "260px" }}>
                {mapsApiKey ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={delivery?.routePolyline
                      ? `https://maps.googleapis.com/maps/api/staticmap?size=600x260&scale=2&maptype=roadmap&style=feature:all|saturation:-100&style=feature:water|color:0xd4d4d4&path=color:0xF3A300ff|weight:5|enc:${encodeURIComponent(delivery.routePolyline)}&markers=color:0xF3A300|${delivery.destinationLat},${delivery.destinationLon}&markers=color:0xF3A300|47.8571,12.1181&key=${mapsApiKey}`
                      : `https://maps.googleapis.com/maps/api/staticmap?center=47.8571,12.1181&zoom=8&size=600x260&scale=2&maptype=roadmap&style=feature:all|saturation:-100&style=feature:water|color:0xd4d4d4&markers=color:0xF3A300|47.8571,12.1181&key=${mapsApiKey}`
                    }
                    alt="Karte mit Route"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                    Karte wird geladen...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== GESAMTPREIS ===== */}
      <div className="pt-8 pb-4">
        <div className="max-w-[560px] mx-auto">
          <div className="bg-white rounded-lg shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-[#1a171b] text-white px-6 py-4">
              <h3 className="text-[18px] uppercase tracking-wide font-[family-name:var(--font-fira-condensed)] font-extrabold">
                Deine Konfiguration
              </h3>
            </div>

            {/* Line items */}
            <div className="px-6 py-4 divide-y divide-gray-100" style={{ fontFamily: "'Fira Sans', sans-serif", textTransform: "none", fontWeight: 400 }}>
              <div className="flex items-center justify-between py-3 text-[15px]">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3A300]/15 text-[#F3A300]">
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                  <span className="text-[#1a171b] font-semibold">Fotobox mit Drucker</span>
                </div>
                <span className="text-[#1a171b] font-semibold tabular-nums">{BASE_PRICE.toFixed(2)} €</span>
              </div>

              {ADDONS.filter((a) => selectedAddons.has(a.id)).map((addon) => (
                <div key={addon.id} className="flex items-center justify-between py-3 text-[15px]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#F3A300]/15 text-[#F3A300]">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="text-[#1a171b]">{addon.name}</span>
                  </div>
                  <span className="text-[#1a171b] tabular-nums">{addon.price.toFixed(2)} €</span>
                </div>
              ))}

              {deliveryPrice > 0 && (
                <div className="flex items-center justify-between py-3 text-[15px]">
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-gray-500">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 17h2l2-8h10l2 8h2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="7" cy="17" r="2" />
                        <circle cx="17" cy="17" r="2" />
                      </svg>
                    </span>
                    <span className="text-[#1a171b]">
                      Fahrtkosten
                      <span className="text-[#999] text-[13px] ml-1">({delivery?.distanceKm} km)</span>
                    </span>
                  </div>
                  <span className="text-[#1a171b] tabular-nums">{deliveryPrice.toFixed(2)} €</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="bg-[#f9f9f9] border-t border-gray-200 px-6 py-5 flex items-baseline justify-between">
              <span className="text-[14px] uppercase tracking-wider text-[#666] font-[family-name:var(--font-fira-condensed)] font-extrabold">
                Gesamtpreis
              </span>
              <span className="text-[42px] md:text-[52px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)] tabular-nums">
                {totalPrice.toFixed(2)}&nbsp;€
              </span>
            </div>
          </div>

          {!showInquiry && submitStatus !== "success" && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={openInquiry}
                className="px-12 py-5 bg-[#F3A300] text-[#1a171b] font-bold rounded-[5px] hover:bg-[#d99200] transition-colors text-2xl uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]"
              >
                Jetzt unverbindlich anfragen
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ===== INQUIRY FORM ===== */}
      {(showInquiry || submitStatus === "success") && (
      <div id="jetzt-reservieren" ref={inquiryRef} className="scroll-mt-28">
        <div className="text-center mb-8">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[var(--brand-dark)] inline-block">
            Jetzt reservieren
          </h2>
          <p className="text-[23px] text-[#F3A300] font-semibold mt-3 font-[family-name:var(--font-fira-condensed)]">
            Datum wählen und unverbindlich anfragen
          </p>
        </div>

        {submitStatus === "success" ? (
          <div className="max-w-[700px] mx-auto bg-green-50 border border-green-200 rounded-xl p-8 text-center">
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
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left: Calendar */}
              <MiniCalendar
                selected={inquiry.datum}
                onSelect={(date) => setInquiry((prev) => ({ ...prev, datum: date }))}
              />

              {/* Right: Contact fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="vorname" required placeholder="Vorname" value={inquiry.vorname} onChange={handleInquiryChange} className={inputClass} />
                  <input type="text" name="nachname" required placeholder="Nachname" value={inquiry.nachname} onChange={handleInquiryChange} className={inputClass} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <input type="tel" name="telefon" required placeholder="Telefon *" value={inquiry.telefon} onChange={handleInquiryChange} className={inputClass} />
                  <input type="email" name="email" required placeholder="E-Mail *" value={inquiry.email} onChange={handleInquiryChange} className={inputClass} />
                </div>

                <div className="flex gap-6 py-2">
                  <ToggleSwitch label="Hochzeit" checked={inquiry.eventType === "Hochzeit"} onChange={() => toggleEventType("Hochzeit")} />
                  <ToggleSwitch label="Geburtstag" checked={inquiry.eventType === "Geburtstag"} onChange={() => toggleEventType("Geburtstag")} />
                  <ToggleSwitch label="Firmenevent" checked={inquiry.eventType === "Firmenevent"} onChange={() => toggleEventType("Firmenevent")} />
                </div>

                <textarea
                  name="nachricht"
                  rows={3}
                  placeholder="Fragen / Anmerkungen"
                  value={inquiry.nachricht}
                  onChange={handleInquiryChange}
                  className={inputClass + " resize-y"}
                />

                <p className="text-xs text-gray-500">
                  Veranstaltungsort, Zubehör und Preis werden aus dem Konfigurator übernommen. Detaillierte Informationen zum Umgang mit Nutzerdaten findest Du in unserer{" "}
                  <a href="/datenschutzerklaerung" className="underline hover:text-[#F3A300]">Datenschutzerklärung</a>.
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                type="submit"
                disabled={submitStatus === "loading" || deliveryLoading}
                className="px-12 py-5 bg-[#F3A300] text-[#1a171b] font-bold rounded-[5px] hover:bg-[#d99200] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-2xl uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]"
              >
                {submitStatus === "loading" ? "Wird gesendet..." : "Jetzt reservieren"}
              </button>
            </div>

            {submitError && (
              <p className="text-red-600 text-sm text-center mt-4">{submitError}</p>
            )}

            {submitStatus === "error" && (
              <p className="text-red-600 text-sm text-center mt-4">
                Es gab einen Fehler. Bitte versuche es erneut oder kontaktiere uns direkt.
              </p>
            )}
          </form>
        )}
      </div>
      )}
    </div>
  );
}
