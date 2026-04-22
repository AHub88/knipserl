"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ADDONS, BASE_PRICE, BASE_FEATURES } from "@/lib/constants";
import { calculateDeliveryCost } from "@/lib/distance";
import { useGooglePlacesAutocomplete, type PlaceSelection } from "@/lib/use-google-places";
import { saveInquirySummary } from "@/app/anfrage-erhalten/InquirySummary";
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

const INCLUDED_FEATURES = BASE_FEATURES;
const inputClass = "w-full px-4 py-3 bg-[rgba(0,0,0,0.07)] border-0 rounded-[5px] text-[#1a171b] text-lg placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none font-[family-name:var(--font-fira-sans)]";

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

function SectionHeader({ stepLabel, title, subtitle }: { stepLabel?: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-10 md:mb-12">
      {stepLabel && (
        <p className="text-[13px] md:text-[14px] font-extrabold text-[#F3A300] uppercase tracking-[0.25em] mb-3 font-[family-name:var(--font-fira-condensed)]">
          {stepLabel}
        </p>
      )}
      <h2 className="heading-decorated text-[32px] md:text-[48px] text-[var(--brand-dark)] inline-block leading-[1.05]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-[20px] md:text-[23px] text-[#F3A300] font-semibold mt-2 font-[family-name:var(--font-fira-condensed)]">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CheckIconCircle({ size = "md" }: { size?: "sm" | "md" }) {
  const wrapperClass = size === "sm" ? "w-6 h-6" : "w-8 h-8";
  const iconClass = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  return (
    <span className={`${wrapperClass} rounded-full bg-[#F3A300]/15 border border-[#F3A300]/30 flex items-center justify-center flex-shrink-0`}>
      <svg className={`${iconClass} text-[#F3A300]`} fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export default function PriceConfiguratorV3() {
  const router = useRouter();
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
  const [stickyVisible, setStickyVisible] = useState(false);
  const destinationInputRef = useRef<HTMLInputElement>(null);

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
      if (!result) { setDeliveryError("Adresse nicht gefunden. Bitte genauer eingeben."); return; }
      setDelivery(result);
    } catch { setDeliveryError("Fehler bei der Berechnung."); }
    finally { setDeliveryLoading(false); }
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
    fetch("/api/maps-config").then((r) => r.json()).then((d) => { if (d.apiKey) setMapsApiKey(d.apiKey); }).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setStickyVisible(window.scrollY > 200);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDestinationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDestination(value);
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

  const addonsTotal = ADDONS.filter((a) => selectedAddons.has(a.id)).reduce((sum, a) => sum + a.price, 0);
  const deliveryPrice = delivery?.price ?? 0;
  const totalPrice = BASE_PRICE + addonsTotal + deliveryPrice;
  const selectedAddonsList = ADDONS.filter((a) => selectedAddons.has(a.id));
  const selectedAddonNames = selectedAddonsList.map((a) => a.name);

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
          source: "preiskonfigurator-v3",
        }),
      });

      if (!res.ok) throw new Error("Fehler beim Senden");
      saveInquirySummary({
        eventDate: inquiry.datum,
        eventType: inquiry.eventType,
        location: locationName || destination,
        addons: selectedAddonNames,
        totalPrice,
        deliveryDistance: delivery?.distanceKm,
      });
      router.push("/anfrage-erhalten");
    } catch {
      setSubmitStatus("error");
    }
  };

  const mapUrl = (() => {
    if (!mapsApiKey) return "";
    const base = "https://maps.googleapis.com/maps/api/staticmap?size=500x300&scale=2&maptype=roadmap&style=feature:all|saturation:-100&style=feature:water|color:0xd4d4d4";
    const key = `&key=${mapsApiKey}`;
    const markerHome = "&markers=color:0xF3A300|47.8571,12.1181";
    if (delivery && !delivery.outsideDeliveryArea && delivery.routePolyline) {
      const markerDest = `&markers=color:0xF3A300|${delivery.destinationLat},${delivery.destinationLon}`;
      return `${base}&path=color:0xF3A300ff|weight:5|enc:${encodeURIComponent(delivery.routePolyline)}${markerDest}${markerHome}${key}`;
    }
    if (delivery) {
      const markerDest = `&markers=color:0xF3A300|${delivery.destinationLat},${delivery.destinationLon}`;
      return `${base}${markerDest}${markerHome}${key}`;
    }
    return `${base}&center=47.8571,12.1181&zoom=8${markerHome}${key}`;
  })();

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-6 pt-6 pb-32">

        {/* ===== STEP 1: BASISPAKET ===== */}
        <section className="py-12 md:py-16">
          <SectionHeader stepLabel="Schritt 01" title="Dein Basispaket" subtitle="Alles inklusive zum Festpreis" />

          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-[var(--brand-dark)] px-6 py-4 md:px-8 md:py-5">
              <h3 className="text-white text-[24px] md:text-[28px] font-extrabold uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide">
                Fotobox mit Drucker
              </h3>
            </div>
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
                {INCLUDED_FEATURES.map((f) => (
                  <div key={f} className="flex items-start gap-3">
                    <CheckIconCircle />
                    <span className="text-[14px] text-[var(--brand-dark)] pt-1" style={{ fontWeight: 400, textTransform: "none" }}>{f}</span>
                  </div>
                ))}
              </div>
              <div className="flex-shrink-0 text-center md:text-right md:pl-8 md:border-l md:border-gray-200">
                <p className="text-[56px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
                  {BASE_PRICE}&euro;
                </p>
                <p className="text-gray-500 text-[13px] mt-1" style={{ fontWeight: 400, textTransform: "none" }}>Festpreis</p>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STEP 2: EXTRAS ===== */}
        <section className="py-12 md:py-16">
          <SectionHeader stepLabel="Schritt 02" title="Extras hinzufügen" subtitle="Optional — wähle was Du brauchst" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADDONS.map((addon) => {
              const active = selectedAddons.has(addon.id);
              return (
                <label
                  key={addon.id}
                  className={`flex gap-6 p-4 rounded-lg cursor-pointer transition-all border ${
                    active ? "bg-[var(--brand-dark)] text-white border-transparent" : "bg-white border-gray-200 hover:border-[#F3A300]/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleAddon(addon.id)}
                    className="sr-only"
                  />

                  <div className="w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={addon.image}
                      alt={addon.name}
                      className={`w-full h-auto ${active ? "invert" : ""}`}
                    />
                  </div>

                  <div className="flex-1 min-w-0 pt-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4
                        className={`font-bold text-[22px] md:text-[24px] leading-[1.1] uppercase tracking-[-0.5px] font-[family-name:var(--font-fira-condensed)] ${
                          active ? "text-white" : "text-[var(--brand-dark)]"
                        }`}
                      >
                        {addon.name}
                      </h4>
                      <span
                        className="text-[#F3A300] font-bold whitespace-nowrap text-[18px]"
                        style={{ fontFamily: "'Beyond The Mountains', cursive" }}
                      >
                        +{addon.price}&euro;
                      </span>
                    </div>
                    <p
                      className={`text-[13px] mt-3 line-clamp-2 ${
                        active ? "text-gray-300" : "text-[#666]"
                      }`}
                      style={{ fontWeight: 400, textTransform: "none" }}
                    >
                      {addon.description}
                    </p>
                  </div>

                  <div className="flex-shrink-0 self-center">
                    <div
                      className={`w-6 h-6 border-2 flex items-center justify-center rounded ${
                        active ? "bg-[#F3A300] border-[#F3A300]" : "bg-white border-gray-300"
                      }`}
                    >
                      {active && (
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </section>

        {/* ===== STEP 3: LIEFERUNG ===== */}
        <section className="py-12 md:py-16">
          <SectionHeader stepLabel="Schritt 03" title="Wohin liefern wir?" subtitle="Fahrtkosten automatisch berechnet" />

          <div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Left: Input + Results */}
              <div className="md:col-span-3 space-y-4">
                <div>
                  <label className="block text-[14px] font-extrabold text-[var(--brand-dark)] uppercase mb-2 font-[family-name:var(--font-fira-condensed)] tracking-wide">
                    Veranstaltungsort
                  </label>
                  <div className="relative">
                    <input
                      ref={destinationInputRef}
                      type="text"
                      value={destination}
                      onChange={handleDestinationChange}
                      placeholder="Location oder Adresse eingeben..."
                      className="w-full px-5 py-4 bg-[#F3F4F6] border-0 rounded-lg text-[var(--brand-dark)] text-[17px] placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none"
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runCalculation(destination); } }}
                    />
                    {deliveryLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F3A300] text-sm">
                        Berechne...
                      </div>
                    )}
                  </div>
                </div>

                {deliveryError && <p className="text-red-600 text-sm">{deliveryError}</p>}

                {delivery && (
                  <div
                    className="rounded-lg p-5 border-2"
                    style={delivery.outsideDeliveryArea
                      ? { borderColor: "#dc2626", backgroundColor: "#fef2f2" }
                      : { borderColor: "#F3A300", backgroundColor: "#FFF8E7" }
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[13px] font-extrabold uppercase text-[var(--brand-dark)] font-[family-name:var(--font-fira-condensed)] tracking-wider">
                          Entfernung
                        </span>
                        <p className="text-[24px] md:text-[28px] font-bold text-[var(--brand-dark)] mt-1" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                          {delivery.distanceKm} km
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[13px] font-extrabold uppercase text-[var(--brand-dark)] font-[family-name:var(--font-fira-condensed)] tracking-wider">
                          Fahrtkosten
                        </span>
                        <p className="text-[24px] md:text-[28px] font-bold text-[var(--brand-dark)] mt-1" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                          {delivery.price === 0 ? "Kostenlos" : `+${delivery.price.toFixed(2)} €`}
                        </p>
                      </div>
                    </div>
                    {delivery.outsideDeliveryArea && (
                      <p className="mt-3 text-red-700 font-bold text-[13px] uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide">
                        Außerhalb Liefergebiet — bitte kontaktiere uns direkt
                      </p>
                    )}
                  </div>
                )}

                {!delivery && !deliveryLoading && !deliveryError && (
                  <p className="text-[#666] text-[14px]" style={{ fontWeight: 400, textTransform: "none" }}>
                    Die ersten 15 km ab Rosenheim sind kostenlos. Gib Deine Location ein, um die Fahrtkosten zu berechnen.
                  </p>
                )}
              </div>

              {/* Right: Map */}
              <div className="md:col-span-2">
                <div className="bg-gray-100 rounded-lg overflow-hidden h-[200px] md:h-full md:min-h-[200px]">
                  {mapUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={mapUrl}
                      alt="Karte"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Karte</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== STEP 4: ZUSAMMENFASSUNG ===== */}
        <section className="py-12 md:py-16">
          <SectionHeader stepLabel="Schritt 04" title="Dein Preis" subtitle="Zusammenfassung Deiner Konfiguration" />

          <div className="bg-white rounded-lg overflow-hidden">
            <div className="bg-[var(--brand-dark)] px-6 py-4 md:px-8 md:py-5">
              <h3 className="text-white text-[20px] md:text-[22px] font-extrabold uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide">
                Deine Konfiguration
              </h3>
            </div>

            <div className="px-6 md:px-8">
              <div className="flex items-center justify-between py-5 border-b border-gray-200">
                <div className="flex items-center gap-4">
                  <CheckIconCircle />
                  <span className="font-bold text-[15px] md:text-[16px] text-[var(--brand-dark)]" style={{ textTransform: "none" }}>
                    Fotobox mit Drucker
                  </span>
                </div>
                <span className="font-semibold text-[15px] md:text-[16px] text-[var(--brand-dark)] whitespace-nowrap">
                  {BASE_PRICE.toFixed(2)} &euro;
                </span>
              </div>

              {selectedAddonsList.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between py-5 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <CheckIconCircle />
                    <span className="font-bold text-[15px] md:text-[16px] text-[var(--brand-dark)]" style={{ textTransform: "none" }}>
                      {addon.name}
                    </span>
                  </div>
                  <span className="font-semibold text-[15px] md:text-[16px] text-[var(--brand-dark)] whitespace-nowrap">
                    {addon.price.toFixed(2)} &euro;
                  </span>
                </div>
              ))}

              {deliveryPrice > 0 && (
                <div className="flex items-center justify-between py-5 border-b border-gray-200">
                  <div className="flex items-center gap-4">
                    <CheckIconCircle />
                    <span className="font-bold text-[15px] md:text-[16px] text-[var(--brand-dark)]" style={{ textTransform: "none" }}>
                      Fahrtkosten ({delivery?.distanceKm} km)
                    </span>
                  </div>
                  <span className="font-semibold text-[15px] md:text-[16px] text-[var(--brand-dark)] whitespace-nowrap">
                    {deliveryPrice.toFixed(2)} &euro;
                  </span>
                </div>
              )}
            </div>

            <div className="bg-[#F3F4F6] px-6 py-5 md:px-8 md:py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[14px] md:text-[15px] font-extrabold text-gray-500 uppercase tracking-wide font-[family-name:var(--font-fira-condensed)]">
                Gesamtpreis
              </span>
              <div className="flex items-center gap-6 flex-wrap justify-end">
                <span className="text-[36px] md:text-[44px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
                  {totalPrice.toFixed(2)} &euro;
                </span>
                {!showInquiry && submitStatus !== "success" && (
                  <button
                    type="button"
                    onClick={openInquiry}
                    className="btn-brand text-[16px] px-6 py-3 whitespace-nowrap"
                  >
                    Jetzt reservieren
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== INQUIRY FORM ===== */}
        {(showInquiry || submitStatus === "success") && (
          <section ref={inquiryRef} className="py-12 md:py-16 scroll-mt-28">
            <SectionHeader title="Jetzt reservieren" subtitle="Datum wählen und unverbindlich anfragen" />

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
              <div>
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <MiniCalendar
                      selected={inquiry.datum}
                      onSelect={(date) => setInquiry((prev) => ({ ...prev, datum: date }))}
                    />

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
                      className="btn-brand disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>
            )}
          </section>
        )}
      </div>

      {/* ===== STICKY BOTTOM BAR ===== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--brand-dark)] border-t border-white/10 transition-transform duration-300 ${
          stickyVisible && !showInquiry ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.3)" }}
      >
        <div className="max-w-[1100px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-[14px] hidden sm:inline uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide">
              Dein Preis:
            </span>
            <span className="text-[32px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
              {totalPrice.toFixed(2)}&euro;
            </span>
            {(selectedAddonsList.length > 0 || deliveryPrice > 0) && (
              <span className="text-gray-500 text-[12px] hidden md:inline" style={{ fontWeight: 400, textTransform: "none" }}>
                ({BASE_PRICE}€ Basis{selectedAddonsList.length > 0 ? ` + ${addonsTotal}€ Extras` : ""}{deliveryPrice > 0 ? ` + ${deliveryPrice}€ Fahrt` : ""})
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={openInquiry}
            className="bg-[#F3A300] hover:bg-[#d99200] text-[var(--brand-dark)] font-bold text-[16px] uppercase px-6 py-3 rounded-md transition-colors font-[family-name:var(--font-fira-condensed)] tracking-wide"
          >
            Jetzt reservieren
          </button>
        </div>
      </div>
    </>
  );
}
