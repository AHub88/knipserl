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

function StepHeader({ step, title, subtitle }: { step: number; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-12 h-12 rounded-full bg-[#F3A300] flex items-center justify-center flex-shrink-0">
        <span className="text-white text-[22px] font-bold">{step}</span>
      </div>
      <div>
        <h2 className="text-[28px] md:text-[36px] font-extrabold uppercase tracking-wide text-[var(--brand-dark)] font-[family-name:var(--font-fira-condensed)] leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[16px] text-[#F3A300] font-semibold font-[family-name:var(--font-fira-condensed)]">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIconCircle() {
  return (
    <span className="w-8 h-8 rounded-full bg-[#F3A300]/15 border border-[#F3A300]/30 flex items-center justify-center flex-shrink-0">
      <svg className="w-4 h-4 text-[#F3A300]" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

export default function PriceConfiguratorV2() {
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
          source: "preiskonfigurator-v2",
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

  // Map URL: bei outsideDeliveryArea Polyline weglassen (Route existiert nicht /
  // URL sonst zu lang). Stattdessen beide Marker + Auto-Fit.
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
      <div className="max-w-[1100px] mx-auto px-6 pb-32">
        {/* ===== STEP 1: BASISPAKET — 3 VARIANTEN ZUM VERGLEICHEN ===== */}
        <section id="step-1" className="py-12">
          <StepHeader step={1} title="Dein Basispaket" subtitle="Alles inklusive zum Festpreis" />

          <div className="space-y-16">

            {/* ========== VARIANTE A: Helle Card mit dunkler Header-Leiste ========== */}
            <div>
              <div className="mb-4 flex flex-wrap items-baseline gap-3">
                <span className="inline-block bg-[#F3A300] text-white text-[14px] font-extrabold uppercase tracking-wider px-3 py-1 rounded font-[family-name:var(--font-fira-condensed)]">
                  Variante A
                </span>
                <span className="text-[14px] text-gray-500" style={{ fontWeight: 400, textTransform: "none" }}>
                  Helle Card mit dunkler Header-Leiste — spiegelt die Summary-Box aus Step 4
                </span>
              </div>

              <div
                className="bg-white rounded-lg overflow-hidden"
                style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
              >
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
            </div>

            {/* ========== VARIANTE B: Dunkle Holz-Textur mit rough-Kanten ========== */}
            <div>
              <div className="mb-4 flex flex-wrap items-baseline gap-3">
                <span className="inline-block bg-[#F3A300] text-white text-[14px] font-extrabold uppercase tracking-wider px-3 py-1 rounded font-[family-name:var(--font-fira-condensed)]">
                  Variante B
                </span>
                <span className="text-[14px] text-gray-500" style={{ fontWeight: 400, textTransform: "none" }}>
                  Dunkle Holz-Textur mit gerissenen Papierrändern — wie die MOMENTE-Sections auf den Landingpages
                </span>
              </div>

              <section
                className="relative z-10 py-12 md:py-14 rough-top rough-bottom text-white"
                style={{ background: "#1a171b url('/images/misc/main_back_gr-2.webp') repeat", backgroundSize: "1000px 500px" }}
              >
                <div className="px-6 md:px-12">
                  <div className="text-center mb-8">
                    <h3 className="heading-decorated text-[30px] md:text-[42px] inline-block leading-[1.05]">
                      Fotobox mit Drucker
                    </h3>
                  </div>
                  <div className="flex flex-col md:flex-row md:items-center gap-10 max-w-[1000px] mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 flex-1">
                      {INCLUDED_FEATURES.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <CheckIcon />
                          <span className="text-[14px] text-gray-200" style={{ fontWeight: 400, textTransform: "none" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex-shrink-0 text-center md:text-right md:pl-8 md:border-l md:border-white/20">
                      <p className="text-[56px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
                        {BASE_PRICE}&euro;
                      </p>
                      <p className="text-gray-400 text-[13px] mt-1" style={{ fontWeight: 400, textTransform: "none" }}>Festpreis</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* ========== VARIANTE C: Pappschild-Look mit gedrehtem Preis-Badge ========== */}
            <div>
              <div className="mb-4 flex flex-wrap items-baseline gap-3">
                <span className="inline-block bg-[#F3A300] text-white text-[14px] font-extrabold uppercase tracking-wider px-3 py-1 rounded font-[family-name:var(--font-fira-condensed)]">
                  Variante C
                </span>
                <span className="text-[14px] text-gray-500" style={{ fontWeight: 400, textTransform: "none" }}>
                  Pappschild-Look — helles Papier, orange Akzentkante, gedrehtes Preis-Pappschild
                </span>
              </div>

              <div
                className="relative bg-white rounded-md border-l-[6px] border-[#F3A300] p-6 md:p-10"
                style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.15), 0 6px 6px rgba(0,0,0,0.20)" }}
              >
                <div className="flex flex-col md:flex-row md:items-start gap-8">
                  <div className="flex-1">
                    <h3 className="text-[28px] md:text-[36px] text-[var(--brand-dark)] font-extrabold uppercase mb-6 font-[family-name:var(--font-fira-condensed)] leading-[1.05]">
                      Fotobox mit Drucker
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                      {INCLUDED_FEATURES.map((f) => (
                        <div key={f} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-[#F3A300] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-[14px] text-[var(--brand-dark)]" style={{ fontWeight: 400, textTransform: "none" }}>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preis-Pappschild */}
                  <div
                    className="flex-shrink-0 self-center md:self-start md:mt-2 bg-[var(--brand-dark)] px-6 py-4 rotate-[-2deg]"
                    style={{ boxShadow: "0 8px 18px rgba(0,0,0,0.35)" }}
                  >
                    <p className="text-[40px] md:text-[48px] leading-none font-extrabold text-[#F3A300] font-[family-name:var(--font-fira-condensed)] tracking-tight">
                      {BASE_PRICE}&euro;
                    </p>
                    <p className="text-[11px] text-gray-400 text-center uppercase tracking-[0.15em] mt-2 font-[family-name:var(--font-fira-condensed)] font-bold">
                      Festpreis
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ===== STEP 2: EXTRAS ===== */}
        <section className="py-12 border-t border-gray-200">
          <StepHeader step={2} title="Extras hinzufügen" subtitle="Optional — wähle was Du brauchst" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ADDONS.map((addon) => {
              const active = selectedAddons.has(addon.id);
              return (
                <label
                  key={addon.id}
                  style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
                  className={`flex gap-6 p-4 rounded-lg cursor-pointer transition-all ${
                    active ? "bg-[var(--brand-dark)] text-white" : "bg-[#F3F4F6]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleAddon(addon.id)}
                    className="sr-only"
                  />

                  {/* Image */}
                  <div className="w-[120px] h-[120px] flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={addon.image}
                      alt={addon.name}
                      className={`w-full h-auto ${active ? "invert" : ""}`}
                    />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0 pt-3">
                    <div className="flex justify-between items-start gap-2">
                      <h4
                        className={`font-bold text-[24px] leading-[1.1] uppercase tracking-[-0.5px] font-[family-name:var(--font-fira-condensed)] ${
                          active ? "text-white" : "text-[var(--brand-dark)]"
                        }`}
                      >
                        {addon.name}
                      </h4>
                      <span
                        className="text-[#F3A300] font-bold whitespace-nowrap text-[15px]"
                        style={{ fontFamily: "'Beyond The Mountains', cursive" }}
                      >
                        +{addon.price}&euro;
                      </span>
                    </div>
                    <p
                      className={`text-[13px] mt-3 line-clamp-2 ${
                        active ? "text-gray-300" : "text-[var(--brand-dark)]"
                      }`}
                      style={{ fontWeight: 400, textTransform: "none" }}
                    >
                      {addon.description}
                    </p>
                  </div>

                  {/* Checkbox rechts */}
                  <div className="flex-shrink-0 self-center">
                    <div
                      className={`w-6 h-6 border-2 flex items-center justify-center ${
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
        <section className="py-12 border-t border-gray-200">
          <StepHeader step={3} title="Wohin liefern wir?" subtitle="Fahrtkosten automatisch berechnet" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Left: Input + Results (3 cols) */}
            <div className="md:col-span-3 space-y-4">
              <div className="relative">
                <input
                  ref={destinationInputRef}
                  type="text"
                  value={destination}
                  onChange={handleDestinationChange}
                  placeholder="Location oder Adresse eingeben..."
                  className="w-full px-5 py-4 bg-white border-2 border-gray-200 rounded-lg text-[var(--brand-dark)] text-[17px] placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:border-[#F3A300] focus:outline-none"
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); runCalculation(destination); } }}
                />
                {deliveryLoading && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[#F3A300] text-sm">
                    Berechne...
                  </div>
                )}
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
                      <span className="text-[14px] font-bold uppercase text-[var(--brand-dark)] font-[family-name:var(--font-fira-condensed)]">
                        Entfernung
                      </span>
                      <p className="text-[24px] font-bold text-[var(--brand-dark)]" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                        {delivery.distanceKm} km
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] font-bold uppercase text-[var(--brand-dark)] font-[family-name:var(--font-fira-condensed)]">
                        Fahrtkosten
                      </span>
                      <p className="text-[24px] font-bold text-[var(--brand-dark)]" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                        {delivery.price === 0 ? "Kostenlos" : `+${delivery.price.toFixed(2)} €`}
                      </p>
                    </div>
                  </div>
                  {delivery.outsideDeliveryArea && (
                    <p className="mt-3 text-red-700 font-bold text-[14px] uppercase font-[family-name:var(--font-fira-condensed)]">
                      Außerhalb Liefergebiet — bitte kontaktiere uns direkt
                    </p>
                  )}
                </div>
              )}

              {!delivery && !deliveryLoading && !deliveryError && (
                <p className="text-[#999] text-[14px]" style={{ fontWeight: 400, textTransform: "none" }}>
                  Die ersten 15 km ab Rosenheim sind kostenlos. Gib Deine Location ein, um die Fahrtkosten zu berechnen.
                </p>
              )}
            </div>

            {/* Right: Map (2 cols) */}
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
        </section>

        {/* ===== ZUSAMMENFASSUNG ===== */}
        <section className="py-12 border-t border-gray-200">
          <StepHeader step={4} title="Dein Preis" subtitle="Zusammenfassung Deiner Konfiguration" />

          <div
            className="bg-white rounded-lg overflow-hidden"
            style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
          >
            {/* Header */}
            <div className="bg-[var(--brand-dark)] px-6 py-4 md:px-8 md:py-5">
              <h3 className="text-white text-[20px] md:text-[22px] font-extrabold uppercase font-[family-name:var(--font-fira-condensed)] tracking-wide">
                Deine Konfiguration
              </h3>
            </div>

            {/* Line items */}
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

            {/* Total footer */}
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
          <section ref={inquiryRef} className="py-12 border-t border-gray-200 scroll-mt-28">
            <div className="text-center mb-8">
              <h2 className="heading-decorated text-4xl md:text-[52px] text-[var(--brand-dark)] inline-block">
                Jetzt reservieren
              </h2>
              <p className="text-[23px] text-[#F3A300] font-semibold mt-0 font-[family-name:var(--font-fira-condensed)]">
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
            <span className="text-gray-400 text-[14px] hidden sm:inline uppercase font-[family-name:var(--font-fira-condensed)]">
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
