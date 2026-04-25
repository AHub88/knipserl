"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconBell, IconBellOff, IconBellRinging } from "@tabler/icons-react";

type State =
  | { kind: "loading" }
  | { kind: "unsupported" }
  | { kind: "needs-install" } // iOS Safari außerhalb PWA
  | { kind: "denied" }
  | { kind: "idle" }
  | { kind: "subscribed"; endpoint: string }
  | { kind: "busy" }
  | { kind: "error"; message: string };

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Std = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64Std);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function PushToggle() {
  const [state, setState] = useState<State>({ kind: "loading" });

  const refresh = useCallback(async () => {
    if (typeof window === "undefined") return;

    const hasSW = "serviceWorker" in navigator;
    const hasPush = "PushManager" in window;
    const hasNotification = "Notification" in window;

    if (!hasSW || !hasPush || !hasNotification) {
      // iOS Safari im Browser-Tab hat weder PushManager noch Notification.
      // Wenn iOS erkannt + nicht standalone → Install-Hint, sonst hartes "unsupported".
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      // @ts-expect-error — standalone ist nur auf iOS Safari verfügbar
      const isStandalone = window.navigator.standalone === true
        || window.matchMedia("(display-mode: standalone)").matches;
      if (isIOS && !isStandalone) {
        setState({ kind: "needs-install" });
        return;
      }
      setState({ kind: "unsupported" });
      return;
    }

    if (Notification.permission === "denied") {
      setState({ kind: "denied" });
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      setState({ kind: "subscribed", endpoint: sub.endpoint });
    } else {
      setState({ kind: "idle" });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function subscribe() {
    setState({ kind: "busy" });
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Benachrichtigungen wurden nicht erlaubt");
        await refresh();
        return;
      }

      const keyRes = await fetch("/api/push/vapid-key");
      if (!keyRes.ok) throw new Error("VAPID-Key nicht verfügbar");
      const { publicKey } = await keyRes.json();

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const json = sub.toJSON();
      const saveRes = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!saveRes.ok) throw new Error("Speichern fehlgeschlagen");

      toast.success("Erinnerungen aktiviert");
      setState({ kind: "subscribed", endpoint: sub.endpoint });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      toast.error("Konnte nicht aktivieren: " + msg);
      setState({ kind: "error", message: msg });
    }
  }

  async function unsubscribe() {
    setState({ kind: "busy" });
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      toast.success("Erinnerungen deaktiviert");
      setState({ kind: "idle" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unbekannter Fehler";
      toast.error("Konnte nicht deaktivieren: " + msg);
      await refresh();
    }
  }

  async function sendTest() {
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Testversand fehlgeschlagen");
        return;
      }
      if (data.sent === 0) {
        toast.error("Kein aktives Gerät gefunden");
      } else {
        toast.success(`Test an ${data.sent} Gerät${data.sent === 1 ? "" : "e"} gesendet`);
      }
    } catch {
      toast.error("Testversand fehlgeschlagen");
    }
  }

  return (
    <Card>
      <CardHeader className="border-b flex-row items-center gap-2">
        <IconBell className="size-4 text-primary" />
        <CardTitle className="text-base">Erinnerungen</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {state.kind === "loading" && (
          <p className="text-sm text-muted-foreground">Wird geprüft…</p>
        )}

        {state.kind === "unsupported" && (
          <p className="text-sm text-muted-foreground">
            Dein Browser unterstützt keine Push-Benachrichtigungen.
          </p>
        )}

        {state.kind === "needs-install" && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Auf iPhone funktionieren Erinnerungen nur als installierte App.</p>
            <p>
              So geht&apos;s: In Safari unten auf <strong>Teilen</strong> tippen →{" "}
              <strong>Zum Home-Bildschirm</strong>. Danach die App vom Homescreen
              öffnen und hier wiederkommen.
            </p>
          </div>
        )}

        {state.kind === "denied" && (
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Benachrichtigungen sind für diese Seite blockiert.</p>
            <p>
              Bitte in den Browser-Einstellungen für diese Seite wieder erlauben —
              dann hier zurückkommen.
            </p>
          </div>
        )}

        {state.kind === "idle" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Bekomme Push-Benachrichtigungen auf diesem Gerät, z.B. Erinnerungen
              vor deinen Aufträgen.
            </p>
            <Button onClick={subscribe} className="w-full" size="sm">
              <IconBell className="h-4 w-4" /> Erinnerungen aktivieren
            </Button>
          </div>
        )}

        {state.kind === "busy" && (
          <Button disabled className="w-full" size="sm">
            Bitte warten…
          </Button>
        )}

        {state.kind === "subscribed" && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <IconBellRinging className="h-4 w-4 text-primary" />
              Aktiv auf diesem Gerät.
            </p>
            <div className="flex gap-2">
              <Button onClick={sendTest} variant="secondary" size="sm" className="flex-1">
                Test senden
              </Button>
              <Button onClick={unsubscribe} variant="outline" size="sm" className="flex-1">
                <IconBellOff className="h-4 w-4" /> Deaktivieren
              </Button>
            </div>
          </div>
        )}

        {state.kind === "error" && (
          <div className="space-y-2">
            <p className="text-sm text-destructive">{state.message}</p>
            <Button onClick={refresh} variant="outline" size="sm">
              Erneut versuchen
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
