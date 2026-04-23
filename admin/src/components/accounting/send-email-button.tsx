"use client";

import { useState } from "react";
import { toast } from "sonner";
import { IconMail, IconLoader2, IconCheck } from "@tabler/icons-react";

interface SendEmailButtonProps {
  type: "quote" | "invoice" | "confirmation";
  id: string;
  recipientEmail?: string | null;
  alreadySent?: boolean;
}

export function SendEmailButton({ type, id, recipientEmail, alreadySent }: SendEmailButtonProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(alreadySent ?? false);

  const typeLabels = { quote: "Angebot", invoice: "Rechnung", confirmation: "Bestätigung" };

  async function handleSend() {
    if (!recipientEmail) {
      toast.error("Keine E-Mail-Adresse beim Empfänger hinterlegt");
      return;
    }

    if (!confirm(`${typeLabels[type]} per E-Mail an ${recipientEmail} senden?`)) return;

    setSending(true);
    try {
      const res = await fetch("/api/accounting/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Senden");
      }

      const data = await res.json();
      toast.success(`Gesendet an ${data.sentTo}`);
      setSent(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "E-Mail-Versand fehlgeschlagen");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-medium"
      >
        <IconCheck className="size-3.5" />
        <span className="hidden sm:inline">Gesendet</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleSend}
      disabled={sending || !recipientEmail}
      className={
        "flex items-center gap-1.5 h-8 px-3 rounded-lg border text-xs font-medium transition-colors " +
        (recipientEmail
          ? "border-border bg-card text-foreground/80 hover:bg-accent"
          : "border-border bg-card text-muted-foreground/50 cursor-not-allowed")
      }
      title={recipientEmail ? `Senden an ${recipientEmail}` : "Keine E-Mail-Adresse"}
    >
      {sending ? <IconLoader2 className="size-3.5 animate-spin" /> : <IconMail className="size-3.5" />}
      <span className="hidden sm:inline">{sending ? "Senden..." : "Per E-Mail"}</span>
    </button>
  );
}
