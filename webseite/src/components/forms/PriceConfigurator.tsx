"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { ADDONS, BASE_PRICE, BASE_FEATURES } from "@/lib/constants";
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

  // Form fields for the inquiry
  const [formData, setFormData] = useState({
    vorname: "",
    nachname: "",
    telefon: "",
    email: "",
    eventType: "",
    datum: "",
    nachricht: "",
  });
  const [submitStatus, setSubmitStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");

    const payload = {
      art: "Preiskonfigurator",
      ...formData,
      location: destination,
      addons: ADDONS.filter((a) => selectedAddons.has(a.id)).map((a) => a.name),
      deliveryDistance: delivery?.distanceKm,
      deliveryPrice,
      totalPrice,
    };

    try {
      const res = await fetch("/api/anfrage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error();
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center max-w-2xl mx-auto">
        <svg className="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <h3 className="text-xl font-semibold text-green-800 mb-2">Anfrage erfolgreich gesendet!</h3>
        <p className="text-green-700 mb-2">
          Deine Konfiguration mit einem Gesamtpreis von <strong>{totalPrice.toFixed(2)} &euro;</strong> wurde übermittelt.
        </p>
        <p className="text-green-600 text-sm">Wir melden uns schnellstmöglich bei Dir.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Base package */}
      <section className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
        <div className="bg-amber-600 text-white px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Fotobox mit Drucker</h3>
              <p className="text-amber-100">Unser Komplettpaket</p>
            </div>
            <div className="text-right">
              <span className="text-4xl font-bold">{BASE_PRICE}&euro;</span>
            </div>
          </div>
        </div>
        <div className="p-6">
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {BASE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-stone-700">
                <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Addons */}
      <section>
        <h3 className="text-2xl font-bold text-stone-800 mb-2">Fotobox Zubehör</h3>
        <p className="text-stone-600 mb-6">Zusätzlich buchbar</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ADDONS.map((addon) => (
            <label
              key={addon.id}
              className={`flex gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                selectedAddons.has(addon.id)
                  ? "border-amber-500 bg-amber-50 shadow-md"
                  : "border-stone-200 bg-white hover:border-stone-300"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedAddons.has(addon.id)}
                onChange={() => toggleAddon(addon.id)}
                className="sr-only"
              />
              <div className="w-20 h-20 relative flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
                <Image
                  src={addon.image}
                  alt={addon.name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-semibold text-stone-800">{addon.name}</h4>
                  <span className="text-amber-700 font-bold whitespace-nowrap">
                    +{addon.price},00 &euro;
                  </span>
                </div>
                <p className="text-sm text-stone-500 mt-1 line-clamp-2">
                  {addon.description}
                </p>
                {addon.link && (
                  <a
                    href={addon.link}
                    className="text-xs text-amber-600 hover:underline mt-1 inline-block"
                    onClick={(e) => e.stopPropagation()}
                  >
                    mehr Infos
                  </a>
                )}
              </div>
              <div className="flex items-center">
                <div
                  className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                    selectedAddons.has(addon.id)
                      ? "bg-amber-500 border-amber-500"
                      : "border-stone-300"
                  }`}
                >
                  {selectedAddons.has(addon.id) && (
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Distance / delivery cost */}
      <section className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6">
        <h3 className="text-2xl font-bold text-stone-800 mb-2">Fahrtkosten</h3>
        <p className="text-stone-600 mb-1">Für den Auf- und Abbau</p>
        <p className="text-sm text-stone-500 mb-6">
          Wir liefern die Fotobox zu Deiner Location und kümmern uns um den kompletten Auf- und Abbau.
          Die ersten 15 km ab Rosenheim sind kostenlos.
        </p>

        <div className="flex gap-3">
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Name oder Adresse der Location eingeben..."
            className="flex-1 px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            className="px-6 py-3 bg-stone-700 text-white rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-50 font-medium"
          >
            {deliveryLoading ? "..." : "Berechnen"}
          </button>
        </div>

        {deliveryError && (
          <p className="mt-3 text-red-600 text-sm">{deliveryError}</p>
        )}

        {delivery && (
          <div className="mt-4 p-4 bg-stone-50 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-stone-700">
                  Entfernung: <strong>{delivery.distanceKm} km</strong>
                </p>
                {delivery.outsideDeliveryArea && (
                  <p className="text-red-600 text-sm mt-1">
                    Liegt außerhalb unseres regulären Liefergebiets (120 km). Bitte kontaktiere uns direkt.
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-xl font-bold text-stone-800">
                  {delivery.price === 0 ? "Kostenlos" : `${delivery.price.toFixed(2)} €`}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Total price */}
      <section className="bg-stone-800 text-white rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-stone-300">Fotobox mit Drucker</span>
          <span>{BASE_PRICE.toFixed(2)} &euro;</span>
        </div>
        {ADDONS.filter((a) => selectedAddons.has(a.id)).map((addon) => (
          <div key={addon.id} className="flex justify-between items-center mb-2 text-sm">
            <span className="text-stone-400">{addon.name}</span>
            <span>+{addon.price.toFixed(2)} &euro;</span>
          </div>
        ))}
        {deliveryPrice > 0 && (
          <div className="flex justify-between items-center mb-2 text-sm">
            <span className="text-stone-400">Fahrtkosten ({delivery?.distanceKm} km)</span>
            <span>+{deliveryPrice.toFixed(2)} &euro;</span>
          </div>
        )}
        <div className="border-t border-stone-600 pt-4 mt-4 flex justify-between items-center">
          <span className="text-lg font-semibold">Gesamtsumme</span>
          <span className="text-3xl font-bold text-amber-400">{totalPrice.toFixed(2)} &euro;</span>
        </div>
      </section>

      {/* Inquiry form */}
      <section className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6">
        <h3 className="text-2xl font-bold text-stone-800 mb-6">Unverbindliche Anfrage abschicken</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="cfg-datum" className="block text-sm font-medium text-stone-700 mb-1">
                Wunschdatum *
              </label>
              <input
                type="date"
                id="cfg-datum"
                required
                value={formData.datum}
                onChange={(e) => setFormData((p) => ({ ...p, datum: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="cfg-event" className="block text-sm font-medium text-stone-700 mb-1">
                Art des Events *
              </label>
              <select
                id="cfg-event"
                required
                value={formData.eventType}
                onChange={(e) => setFormData((p) => ({ ...p, eventType: e.target.value }))}
                className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="">Bitte wählen...</option>
                <option value="Hochzeit">Hochzeit</option>
                <option value="Geburtstag">Geburtstag</option>
                <option value="Firmenevent">Firmenevent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              required
              placeholder="Vorname *"
              value={formData.vorname}
              onChange={(e) => setFormData((p) => ({ ...p, vorname: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="text"
              required
              placeholder="Nachname *"
              value={formData.nachname}
              onChange={(e) => setFormData((p) => ({ ...p, nachname: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="tel"
              required
              placeholder="Telefon *"
              value={formData.telefon}
              onChange={(e) => setFormData((p) => ({ ...p, telefon: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
            <input
              type="email"
              required
              placeholder="E-Mail *"
              value={formData.email}
              onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            />
          </div>

          <textarea
            rows={3}
            placeholder="Fragen / Anmerkungen"
            value={formData.nachricht}
            onChange={(e) => setFormData((p) => ({ ...p, nachricht: e.target.value }))}
            className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-y"
          />

          <p className="text-xs text-stone-500">
            Detaillierte Informationen zum Umgang mit Nutzerdaten finden Sie in unserer{" "}
            <a href="/datenschutzerklaerung" className="underline hover:text-amber-700">
              Datenschutzerklärung
            </a>.
          </p>

          <button
            type="submit"
            disabled={submitStatus === "loading"}
            className="w-full py-4 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 text-lg"
          >
            {submitStatus === "loading"
              ? "Wird gesendet..."
              : `Unverbindliche Anfrage jetzt abschicken`}
          </button>

          {submitStatus === "error" && (
            <p className="text-red-600 text-sm text-center">
              Fehler beim Senden. Bitte versuche es erneut.
            </p>
          )}
        </form>
      </section>
    </div>
  );
}
