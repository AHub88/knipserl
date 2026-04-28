// Client-Helper für Custom-Events. Im Tracker-Component wird window.knipTrack
// installiert; dieser Wrapper ist sicher in Server-Components/SSR.
//
// Nutzung in Client-Komponenten:
//   import { trackEvent } from "@/lib/track-client";
//   trackEvent("anfrage_submitted", { preset: "fotobox" });

export function trackEvent(type: string, meta?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  const fn = (window as unknown as {
    knipTrack?: (t: string, m?: Record<string, unknown>) => void;
  }).knipTrack;
  if (typeof fn === "function") {
    try {
      fn(type, meta);
    } catch {
      /* noop */
    }
  }
}
