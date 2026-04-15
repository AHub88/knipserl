"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
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

        // Load Google Maps script if not already loaded
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
      } catch {
        // Google Maps not available — fallback to manual input
      }
    }

    init();
    return () => {
      if (autocomplete) google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, [inputRef, onSelect]);
}

export default function PriceConfigurator() {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [destination, setDestination] = useState("");
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");
  const [mapsApiKey, setMapsApiKey] = useState("");
  const destinationInputRef = useRef<HTMLInputElement>(null);

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
    runCalculation(place.address, { lat: place.lat, lon: place.lon });
  }, [runCalculation]);

  useGooglePlacesAutocomplete(destinationInputRef, handlePlaceSelect);

  // Fetch Google Maps API key via own proxy endpoint
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
                  onChange={(e) => setDestination(e.target.value)}
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

          <div className="mt-8 text-center">
            <a href="/termin-reservieren" className="btn-brand">
              Jetzt reservieren
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
