"use client";

import { useState } from "react";
import { IconBrandGoogle, IconDeviceFloppy, IconEye, IconEyeOff, IconLink, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function GoogleApiForm({
  initialApiKey,
  initialPlaceId,
  initialOAuthClientId,
  initialOAuthClientSecret,
  hasRefreshToken,
}: {
  initialApiKey: string;
  initialPlaceId: string;
  initialOAuthClientId: string;
  initialOAuthClientSecret: string;
  hasRefreshToken: boolean;
}) {
  const [apiKey, setApiKey] = useState(initialApiKey);
  const [placeId, setPlaceId] = useState(initialPlaceId);
  const [oauthClientId, setOAuthClientId] = useState(initialOAuthClientId);
  const [oauthClientSecret, setOAuthClientSecret] = useState(initialOAuthClientSecret);
  const [showKey, setShowKey] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleApiKey: apiKey,
          googlePlaceId: placeId,
          googleOAuthClientId: oauthClientId,
          googleOAuthClientSecret: oauthClientSecret,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success("Google API Einstellungen gespeichert");
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  function handleConnect() {
    // Redirect to Google OAuth consent screen
    window.location.href = "/api/google-oauth/authorize";
  }

  return (
    <div className="rounded-xl border border-white/[0.10] bg-card p-5">
      <div className="flex items-center gap-3 mb-4">
        <IconBrandGoogle className="size-5 text-[#4285F4]" />
        <h2 className="text-sm font-semibold text-zinc-300">
          Google API
        </h2>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showKey ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">
            F&uuml;r Adress-Autovervollst&auml;ndigung und Entfernungsberechnung
          </p>
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Google Place ID
          </label>
          <input
            type="text"
            value={placeId}
            onChange={(e) => setPlaceId(e.target.value)}
            placeholder="ChIJ..."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            F&uuml;r den automatischen Import von Google Bewertungen (Places API: max. 5 Reviews)
          </p>
        </div>

        <hr className="border-white/10" />

        <p className="text-xs text-zinc-400">
          <strong className="text-zinc-300">Google Business Profile</strong> — F&uuml;r alle Bewertungen (nicht nur 5) wird eine OAuth-Verbindung ben&ouml;tigt.
        </p>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            OAuth Client ID
          </label>
          <input
            type="text"
            value={oauthClientId}
            onChange={(e) => setOAuthClientId(e.target.value)}
            placeholder="123456789.apps.googleusercontent.com"
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
          />
        </div>

        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            OAuth Client Secret
          </label>
          <div className="relative">
            <input
              type={showSecret ? "text" : "password"}
              value={oauthClientSecret}
              onChange={(e) => setOAuthClientSecret(e.target.value)}
              placeholder="GOCSPX-..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showSecret ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#F6A11C]/90 disabled:opacity-50"
          >
            <IconDeviceFloppy className="size-4" />
            {saving ? "Speichert..." : "Speichern"}
          </button>

          {oauthClientId && oauthClientSecret && (
            <button
              onClick={handleConnect}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${
                hasRefreshToken
                  ? "bg-green-600/20 text-green-400 border border-green-500/30"
                  : "bg-[#4285F4] text-white hover:bg-[#4285F4]/90"
              }`}
            >
              {hasRefreshToken ? (
                <>
                  <IconCheck className="size-4" />
                  Verbunden — erneut verbinden
                </>
              ) : (
                <>
                  <IconLink className="size-4" />
                  Mit Google verbinden
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
