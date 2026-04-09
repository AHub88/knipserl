"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { ADDONS, BASE_PRICE } from "@/lib/constants";
import { calculateDeliveryCost } from "@/lib/distance";

interface DeliveryInfo {
  distanceKm: number;
  price: number;
  outsideDeliveryArea: boolean;
  destinationName: string;
  destinationLat: number;
  destinationLon: number;
  routePolyline: string;
}

interface PlaceSelection {
  address: string;
  lat: number;
  lon: number;
}

const INCLUDED_FEATURES = [
  "Kostenloser Auf- & Abbau (15 km ab Rosenheim)",
  "Druckflatrate (400 Bilder 10x15cm)",
  "Profi-Spiegelreflexkamera (16 MP)",
  "22 Zoll Full-HD Touchscreen",
  "Studioblitz mit Softbox",
  "Online-Galerie mit Passwortschutz",
  "Individuelles Drucklayout",
  "24/7 Telefonsupport",
];

function useGooglePlacesAutocomplete(
  inputRef: React.RefObject<HTMLInputElement | null>,
  onSelect: (place: PlaceSelection) => void
) {
  useEffect(() => {
    let autocomplete: google.maps.places.Autocomplete | null = null;
    async function init() {
      if (!inputRef.current) return;
      try {
        const res = await fetch("/api/maps-config");
        const data = await res.json();
        if (!data.apiKey) return;
        if (!window.google?.maps?.places) {
          await new Promise<void>((resolve, reject) => {
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&language=de&region=DE`;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject();
            document.head.appendChild(script);
          });
        }
        autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ["establishment", "geocode"],
          componentRestrictions: { country: ["de", "at"] },
          fields: ["formatted_address", "name", "geometry"],
        });
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete?.getPlace();
          const loc = place?.geometry?.location;
          if (place?.formatted_address && loc) {
            onSelect({
              address: place.name ? `${place.name}, ${place.formatted_address}` : place.formatted_address,
              lat: loc.lat(),
              lon: loc.lng(),
            });
          }
        });
      } catch { /* fallback to manual */ }
    }
    init();
    return () => { if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete); };
  }, [inputRef, onSelect]);
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

export default function PriceConfiguratorV2() {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [destination, setDestination] = useState("");
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [mapsApiKey, setMapsApiKey] = useState("");
  const [stickyVisible, setStickyVisible] = useState(false);
  const destinationInputRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

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
    runCalculation(place.address, { lat: place.lat, lon: place.lon });
  }, [runCalculation]);

  useGooglePlacesAutocomplete(destinationInputRef, handlePlaceSelect);

  useEffect(() => {
    fetch("/api/maps-config").then((r) => r.json()).then((d) => { if (d.apiKey) setMapsApiKey(d.apiKey); }).catch(() => {});
  }, []);

  // Show sticky bar after scrolling 200px
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

  const addonsTotal = ADDONS.filter((a) => selectedAddons.has(a.id)).reduce((sum, a) => sum + a.price, 0);
  const deliveryPrice = delivery?.price ?? 0;
  const totalPrice = BASE_PRICE + addonsTotal + deliveryPrice;
  const selectedAddonsList = ADDONS.filter((a) => selectedAddons.has(a.id));

  return (
    <>
      <div className="max-w-[1100px] mx-auto px-6 pb-32">
        {/* ===== STEP 1: BASISPAKET ===== */}
        <section id="step-1" className="py-12">
          <StepHeader step={1} title="Dein Basispaket" subtitle="Alles inklusive zum Festpreis" />

          <div
            className="bg-[var(--brand-dark)] rounded-lg p-6 md:p-8 text-white"
            style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-[32px] font-extrabold uppercase font-[family-name:var(--font-fira-condensed)]">
                  Fotobox mit Drucker
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 mt-4">
                  {INCLUDED_FEATURES.map((f) => (
                    <div key={f} className="flex items-start gap-2">
                      <CheckIcon />
                      <span className="text-[14px] text-gray-200" style={{ fontWeight: 400, textTransform: "none" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 text-center md:text-right">
                <p className="text-[56px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
                  {BASE_PRICE}&euro;
                </p>
                <p className="text-gray-400 text-[13px] mt-1" style={{ fontWeight: 400, textTransform: "none" }}>Festpreis inkl. MwSt.</p>
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
                  style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                  className={`flex items-center gap-4 p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    active
                      ? "border-[#F3A300] bg-[#FFF8E7]"
                      : "border-transparent bg-[#F3F4F6] hover:border-gray-300"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={() => toggleAddon(addon.id)}
                    className="sr-only"
                  />

                  {/* Checkbox */}
                  <div className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    active ? "bg-[#F3A300] border-[#F3A300]" : "bg-white border-gray-300"
                  }`}>
                    {active && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>

                  {/* Image */}
                  <div className="w-16 h-16 flex-shrink-0 flex items-center justify-center overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={addon.image} alt="" className="w-full h-auto" />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline gap-2">
                      <span className="font-bold text-[16px] text-[var(--brand-dark)] uppercase font-[family-name:var(--font-fira-condensed)] leading-tight">
                        {addon.name}
                      </span>
                      <span className="text-[#F3A300] font-bold text-[15px] whitespace-nowrap" style={{ fontFamily: "'Beyond The Mountains', cursive" }}>
                        +{addon.price}&euro;
                      </span>
                    </div>
                    <p className="text-[13px] text-[#666] mt-1" style={{ fontWeight: 400, textTransform: "none" }}>
                      {addon.description}
                    </p>
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
                  onChange={(e) => setDestination(e.target.value)}
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
                {mapsApiKey ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={delivery?.routePolyline
                      ? `https://maps.googleapis.com/maps/api/staticmap?size=500x300&scale=2&maptype=roadmap&style=feature:all|saturation:-100&style=feature:water|color:0xd4d4d4&path=color:0xF3A300ff|weight:5|enc:${encodeURIComponent(delivery.routePolyline)}&markers=color:0xF3A300|${delivery.destinationLat},${delivery.destinationLon}&markers=color:0xF3A300|47.8571,12.1181&key=${mapsApiKey}`
                      : `https://maps.googleapis.com/maps/api/staticmap?center=47.8571,12.1181&zoom=8&size=500x300&scale=2&maptype=roadmap&style=feature:all|saturation:-100&style=feature:water|color:0xd4d4d4&markers=color:0xF3A300|47.8571,12.1181&key=${mapsApiKey}`
                    }
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
        <section ref={summaryRef} className="py-12 border-t border-gray-200">
          <StepHeader step={4} title="Dein Preis" subtitle="Zusammenfassung Deiner Konfiguration" />

          <div
            className="bg-[var(--brand-dark)] rounded-lg p-6 md:p-8 text-white"
            style={{ boxShadow: "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)" }}
          >
            {/* Line items */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-[16px]">
                <span className="text-gray-300">Fotobox mit Drucker</span>
                <span className="font-semibold">{BASE_PRICE.toFixed(2)} &euro;</span>
              </div>
              {selectedAddonsList.map((addon) => (
                <div key={addon.id} className="flex justify-between items-center text-[16px]">
                  <span className="text-gray-300">{addon.name}</span>
                  <span className="font-semibold">+{addon.price.toFixed(2)} &euro;</span>
                </div>
              ))}
              {deliveryPrice > 0 && (
                <div className="flex justify-between items-center text-[16px]">
                  <span className="text-gray-300">Fahrtkosten ({delivery?.distanceKm} km)</span>
                  <span className="font-semibold">+{deliveryPrice.toFixed(2)} &euro;</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t border-white/20 pt-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-gray-400 text-[14px] uppercase font-[family-name:var(--font-fira-condensed)]">Gesamtpreis</span>
                <p className="text-[52px] md:text-[64px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
                  {totalPrice.toFixed(2)}&euro;
                </p>
                <span className="text-gray-500 text-[12px]" style={{ fontWeight: 400, textTransform: "none" }}>inkl. MwSt.</span>
              </div>
              <Link
                href="/termin-reservieren"
                className="btn-brand text-[20px] px-10 py-4"
              >
                Jetzt reservieren
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ===== STICKY BOTTOM BAR ===== */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[var(--brand-dark)] border-t border-white/10 transition-transform duration-300 ${
          stickyVisible ? "translate-y-0" : "translate-y-full"
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
          <Link
            href="/termin-reservieren"
            className="bg-[#F3A300] hover:bg-[#d99200] text-[var(--brand-dark)] font-bold text-[16px] uppercase px-6 py-3 rounded-md transition-colors font-[family-name:var(--font-fira-condensed)] tracking-wide"
          >
            Jetzt reservieren
          </Link>
        </div>
      </div>
    </>
  );
}
