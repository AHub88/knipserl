"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Cookieless Tracker — sendet Pageview-Events an /api/track/pageview und
// am Ende per sendBeacon Duration+Scroll.
// Keine Browser-Storage-API verwendet (kein Cookie, kein localStorage,
// kein sessionStorage) — Plausible-Modell.
//
// Respektiert DNT/GPC. Wenn der Browser das Header-Signal sendet,
// wird gar nichts erfasst.

declare global {
  interface Window {
    knipTrack?: (type: string, meta?: Record<string, unknown>) => void;
    __knipTrackInit?: boolean;
  }
}

function shouldOptOut(): boolean {
  if (typeof window === "undefined") return true;
  const nav = window.navigator as Navigator & { globalPrivacyControl?: boolean; doNotTrack?: string };
  if (nav.globalPrivacyControl === true) return true;
  // DNT: "1" bedeutet opt-out
  const dnt = nav.doNotTrack ?? (typeof document !== "undefined" ? (document as unknown as { doNotTrack?: string }).doNotTrack : undefined);
  if (dnt === "1") return true;
  // Lokales Dev-Subdomain ausschließen, optional via env nicht möglich (Client) — daher: localhost ausnehmen
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return true;
  return false;
}

function utmFrom(search: URLSearchParams) {
  return {
    utmSource: search.get("utm_source") || null,
    utmMedium: search.get("utm_medium") || null,
    utmCampaign: search.get("utm_campaign") || null,
    utmTerm: search.get("utm_term") || null,
    utmContent: search.get("utm_content") || null,
  };
}

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const stateRef = useRef<{
    pageviewId: string | null;
    startedAt: number;
    maxScrollPct: number;
    currentPath: string | null;
  }>({ pageviewId: null, startedAt: 0, maxScrollPct: 0, currentPath: null });

  // Globale knipTrack-Funktion einmalig registrieren
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.__knipTrackInit) return;
    window.__knipTrackInit = true;
    window.knipTrack = (type: string, meta?: Record<string, unknown>) => {
      if (shouldOptOut()) return;
      try {
        fetch("/api/track/event", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            type,
            domain: window.location.host,
            path: window.location.pathname,
            meta: meta ?? null,
          }),
          keepalive: true,
        }).catch(() => {});
      } catch {
        /* noop */
      }
    };
  }, []);

  // Pageview tracken bei Pfadwechsel + Beacon-Cleanup beim Verlassen
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldOptOut()) return;

    // Vorherige Pageview abschließen, falls vorhanden
    flushPrevious(stateRef.current);

    // Neue Pageview anlegen
    const path = pathname || "/";
    const search = searchParams ? new URLSearchParams(searchParams.toString()) : new URLSearchParams();
    const utm = utmFrom(search);

    const payload = {
      domain: window.location.host,
      path,
      referrer: document.referrer || null,
      language: (navigator.language || "").slice(0, 16),
      screenWidth: window.screen?.width ?? null,
      screenHeight: window.screen?.height ?? null,
      ...utm,
    };

    stateRef.current = {
      pageviewId: null,
      startedAt: Date.now(),
      maxScrollPct: 0,
      currentPath: path,
    };

    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    })
      .then((r) => r.json())
      .then((data: { id?: string | null }) => {
        // Nur setzen wenn der Pfad noch derselbe ist (sonst ist die View weitergewandert)
        if (data?.id && stateRef.current.currentPath === path) {
          stateRef.current.pageviewId = data.id;
        }
      })
      .catch(() => {});
  }, [pathname, searchParams]);

  // Scroll-Tiefe messen
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldOptOut()) return;

    const onScroll = () => {
      const docH = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight,
      );
      const winH = window.innerHeight;
      const scrolled = window.scrollY + winH;
      const pct = docH <= winH ? 100 : Math.min(100, Math.round((scrolled / docH) * 100));
      if (pct > stateRef.current.maxScrollPct) stateRef.current.maxScrollPct = pct;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  // Beim Verlassen: durationMs + scrollPct via sendBeacon
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (shouldOptOut()) return;
    const handler = () => flushPrevious(stateRef.current);
    window.addEventListener("pagehide", handler);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushPrevious(stateRef.current);
    });
    return () => window.removeEventListener("pagehide", handler);
  }, []);

  return null;
}

function flushPrevious(state: {
  pageviewId: string | null;
  startedAt: number;
  maxScrollPct: number;
  currentPath: string | null;
}) {
  if (!state.pageviewId) return;
  const durationMs = Math.max(0, Date.now() - state.startedAt);
  const scrollPct = state.maxScrollPct;
  const id = state.pageviewId;
  // Verbrauchen — nicht doppelt patchen
  state.pageviewId = null;

  const payload = JSON.stringify({ id, durationMs, scrollPct });
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      // Beacon kann nur POST. Wir nutzen einen Tunnel-Endpoint: PATCH wird via
      // method-Override-Header an die echte Route geschickt.
      // Einfacher: wir machen einen separaten Beacon-PATCH-Endpoint? Nein —
      // Beacon = POST. Lösung: wir mappen POST + spezieller Body als PATCH-Update.
      // Cleaner: separater "POST"-Endpoint zum Schließen.
      navigator.sendBeacon("/api/track/pageview/close", blob);
    } else {
      fetch("/api/track/pageview/close", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* noop */
  }
}
