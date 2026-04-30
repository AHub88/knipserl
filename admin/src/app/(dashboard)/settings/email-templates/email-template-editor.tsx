"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  IconDeviceFloppy,
  IconCheck,
  IconCode,
  IconEye,
  IconSend,
} from "@tabler/icons-react";
import {
  getSampleInquiryVars,
  replaceInquiryVars,
  wrapInquiryEmailHtml,
} from "@/lib/inquiry-email";

const TEMPLATE_CONFIG = [
  {
    key: "email_template_inquiry_accepted",
    label: "Anfrage zugesagt",
    description: "Wird automatisch gesendet wenn eine Anfrage angenommen wird",
    color: "emerald",
  },
  {
    key: "email_template_inquiry_rejected",
    label: "Anfrage abgesagt",
    description: "Wird automatisch gesendet wenn eine Anfrage abgelehnt wird",
    color: "red",
  },
];

type Templates = Record<string, { subject: string; body: string }>;

// Sample-Werte einmal beim Modul-Laden eingefroren — ein Tag drift in 30 Tagen
// reicht völlig, dafür rendert die Preview deterministisch.
const SAMPLE_VARS = getSampleInquiryVars();

function buildPreviewHtml(body: string): string {
  const rendered = replaceInquiryVars(body, SAMPLE_VARS);
  const inner = wrapInquiryEmailHtml(rendered);
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8" />
  <style>html,body{margin:0;padding:0;background:#f5f5f5;}</style>
</head>
<body>${inner}</body>
</html>`;
}

function EmailPreview({ subject, body }: { subject: string; body: string }) {
  const renderedSubject = replaceInquiryVars(subject, SAMPLE_VARS);
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden flex flex-col">
      <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
        <IconEye className="size-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vorschau</h3>
        <span className="ml-auto text-[10px] text-muted-foreground/70">Beispiel-Werte</span>
      </div>
      <div className="px-4 py-2.5 border-b border-border bg-muted/30">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">
          Betreff
        </div>
        <div className="text-sm text-foreground font-medium break-words">
          {renderedSubject || <span className="text-muted-foreground italic">(leer)</span>}
        </div>
      </div>
      <iframe
        srcDoc={buildPreviewHtml(body)}
        title="E-Mail Vorschau"
        sandbox=""
        className="w-full h-[420px] bg-[#f5f5f5] border-0"
      />
    </div>
  );
}

export function EmailTemplateEditor({
  templates: initial,
  variables,
}: {
  templates: Templates;
  variables: string[];
}) {
  const [templates, setTemplates] = useState<Templates>(initial);
  const [saving, setSaving] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState<string | null>(null);

  async function handleSave(key: string) {
    setSaving(key);
    try {
      const t = templates[key];
      const res = await fetch("/api/settings/email-templates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, subject: t.subject, body: t.body }),
      });
      if (!res.ok) throw new Error("Fehler beim Speichern");
      toast.success("Template gespeichert");
      setSaved(key);
      setTimeout(() => setSaved(null), 2000);
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(null);
    }
  }

  async function handleSendTest(key: string) {
    setSendingTest(key);
    try {
      const t = templates[key];
      const res = await fetch("/api/settings/email-templates/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: t.subject, body: t.body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Versand fehlgeschlagen");
      toast.success(`Test an ${data.sentTo ?? "dich"} gesendet`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Versand fehlgeschlagen");
    } finally {
      setSendingTest(null);
    }
  }

  function updateTemplate(key: string, field: "subject" | "body", value: string) {
    setTemplates((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  }

  const inputClass =
    "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

  return (
    <div className="space-y-6">
      {/* Variables hint */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
          <IconCode className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Verfügbare Platzhalter</h3>
        </div>
        <div className="p-4">
        <div className="flex flex-wrap gap-1.5">
          {variables.map((v) => (
            <code key={v} className="text-xs bg-muted text-primary px-2 py-0.5 rounded font-mono">
              {`{{${v}}}`}
            </code>
          ))}
        </div>
        </div>
      </div>

      {/* Templates */}
      {TEMPLATE_CONFIG.map((config) => {
        const t = templates[config.key];
        if (!t) return null;
        const colorClasses = config.color === "emerald"
          ? "border-emerald-500/20 bg-emerald-500/5"
          : "border-red-500/20 bg-red-500/5";
        const dotColor = config.color === "emerald" ? "bg-emerald-400" : "bg-red-400";

        return (
          <div key={config.key} className={`rounded-xl border ${colorClasses} p-4 sm:p-5 space-y-4`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`size-2 rounded-full ${dotColor}`} />
                <h3 className="text-sm font-semibold text-foreground">{config.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSendTest(config.key)}
                  disabled={sendingTest === config.key || saving === config.key}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-foreground/80 hover:text-foreground hover:bg-accent text-xs font-semibold disabled:opacity-50 transition-colors"
                  title="Test-Mail an dein Konto senden"
                >
                  {sendingTest === config.key ? (
                    "Sende..."
                  ) : (
                    <><IconSend className="size-3.5" /> Test senden</>
                  )}
                </button>
                <button
                  onClick={() => handleSave(config.key)}
                  disabled={saving === config.key}
                  className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                >
                  {saved === config.key ? (
                    <><IconCheck className="size-3.5" /> Gespeichert</>
                  ) : saving === config.key ? (
                    "Speichern..."
                  ) : (
                    <><IconDeviceFloppy className="size-3.5" /> Speichern</>
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">{config.description}</p>

            <div className="grid lg:grid-cols-2 gap-4">
              {/* Editor */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Betreff
                  </label>
                  <input
                    className={inputClass}
                    value={t.subject}
                    onChange={(e) => updateTemplate(config.key, "subject", e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Nachricht
                  </label>
                  <textarea
                    className={inputClass + " h-[420px] py-2 resize-y font-mono text-xs leading-relaxed"}
                    value={t.body}
                    onChange={(e) => updateTemplate(config.key, "body", e.target.value)}
                  />
                </div>
              </div>

              {/* Live-Preview */}
              <EmailPreview subject={t.subject} body={t.body} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
