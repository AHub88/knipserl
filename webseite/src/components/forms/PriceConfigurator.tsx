"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ADDONS, BASE_PRICE } from "@/lib/constants";
import { calculateDeliveryCost } from "@/lib/distance";

interface DeliveryInfo {
  distanceKm: number;
  price: number;
  outsideDeliveryArea: boolean;
  destinationName: string;
}

export default function PriceConfigurator() {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [destination, setDestination] = useState("");
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState("");

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

  const calculateDistance = useCallback(async () => {
    if (!destination.trim()) return;
    setDeliveryLoading(true);
    setDeliveryError("");
    setDelivery(null);

    try {
      const result = await calculateDeliveryCost(destination);
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
  }, [destination]);

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
              <div className="flex-1 min-w-0">
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
        <div className="text-center mb-10">
          <h2 className="heading-decorated text-4xl md:text-[52px] text-[var(--brand-dark)] inline-block">
            Fahrtkosten
          </h2>
        </div>

        <div className="bg-white shadow-md p-6">
          <p className="text-[#666] text-[15px] mb-1" style={{ fontWeight: 400, textTransform: "none" }}>
            Wir liefern die Fotobox zu Deiner Location und kümmern uns um den kompletten Auf- und Abbau.
            Die ersten 15 km ab Rosenheim sind kostenlos. Berechne Dir Deine individuelle Anfahrt.
          </p>

          <div className="mt-6 space-y-4">
            <div>
              <label className="block text-[13px] font-extrabold uppercase text-[var(--brand-dark)] mb-1 font-[family-name:var(--font-fira-condensed)]">
                Veranstaltungsort / Adresse
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="z.B. Schloss Herrenchiemsee"
                  className="flex-1 px-4 py-3 bg-[rgba(0,0,0,0.07)] border-0 text-[var(--brand-dark)] text-base placeholder:text-gray-400 focus:ring-2 focus:ring-[#F3A300] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      calculateDistance();
                    }
                  }}
                />
                <button
                  onClick={calculateDistance}
                  disabled={deliveryLoading || !destination.trim()}
                  className="px-6 py-3 bg-[#1a171b] text-white font-bold uppercase text-[14px] tracking-wide hover:bg-[#333] transition-colors disabled:opacity-50 font-[family-name:var(--font-fira-condensed)]"
                >
                  {deliveryLoading ? "..." : "Berechnen"}
                </button>
              </div>
            </div>

            {deliveryError && (
              <p className="text-red-600 text-sm">{deliveryError}</p>
            )}

            {delivery && (
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <span className="block text-[13px] font-extrabold uppercase text-[var(--brand-dark)] mb-1 font-[family-name:var(--font-fira-condensed)]">
                    Berechnete Zufahrt
                  </span>
                  <span className="text-[#666] text-base">{delivery.distanceKm} km</span>
                </div>
                <div>
                  <span className="block text-[13px] font-extrabold uppercase text-[var(--brand-dark)] mb-1 font-[family-name:var(--font-fira-condensed)]">
                    Fahrtkosten
                  </span>
                  <span className="text-[#666] text-base">
                    {delivery.price === 0 ? "Kostenlos" : `${delivery.price.toFixed(2)} €`}
                  </span>
                  {delivery.outsideDeliveryArea && (
                    <p className="text-red-600 text-sm mt-1">
                      Liegt außerhalb unseres regulären Liefergebiets. Bitte kontaktiere uns direkt.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ===== GESAMTPREIS ===== */}
      <div className="text-center py-4">
        <p className="text-[60px] md:text-[80px] font-extrabold text-[#F3A300] leading-none font-[family-name:var(--font-fira-condensed)]">
          {totalPrice.toFixed(2)} &euro;
        </p>
        {(addonsTotal > 0 || deliveryPrice > 0) && (
          <div className="mt-3 text-[#666] text-[14px] space-y-1" style={{ fontWeight: 400, textTransform: "none" }}>
            <p>Fotobox mit Drucker: {BASE_PRICE.toFixed(2)} &euro;</p>
            {ADDONS.filter((a) => selectedAddons.has(a.id)).map((addon) => (
              <p key={addon.id}>+ {addon.name}: {addon.price.toFixed(2)} &euro;</p>
            ))}
            {deliveryPrice > 0 && (
              <p>+ Fahrtkosten ({delivery?.distanceKm} km): {deliveryPrice.toFixed(2)} &euro;</p>
            )}
          </div>
        )}

        <a
          href="/termin-reservieren"
          className="btn-brand mt-8 inline-block"
        >
          Jetzt reservieren
        </a>
      </div>
    </div>
  );
}
