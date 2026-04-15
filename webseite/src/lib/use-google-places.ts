"use client";

import { useEffect } from "react";

export interface PlaceSelection {
  /** Combined display-friendly string: "Name, Formatted Address" */
  address: string;
  /** Venue name (e.g. "Ferienwohnung ...") — empty for plain addresses */
  name: string;
  /** Street + zip + city */
  formattedAddress: string;
  lat: number;
  lon: number;
}

/**
 * Attaches a Google Places Autocomplete to an input ref.
 * Silently no-ops when no API key is configured.
 */
export function useGooglePlacesAutocomplete(
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
            const existing = document.querySelector<HTMLScriptElement>(
              'script[data-google-maps-places]'
            );
            if (existing) {
              existing.addEventListener("load", () => resolve());
              existing.addEventListener("error", () => reject());
              return;
            }
            const script = document.createElement("script");
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places&language=de&region=DE`;
            script.async = true;
            script.dataset.googleMapsPlaces = "1";
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
            const name = place.name && place.name !== place.formatted_address ? place.name : "";
            onSelect({
              name,
              formattedAddress: place.formatted_address,
              address: name ? `${name}, ${place.formatted_address}` : place.formatted_address,
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
