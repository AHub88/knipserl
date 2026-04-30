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
  INQUIRY_EMAIL_VARIABLES,
  DRIVER_REMINDER_VARIABLES,
  getSampleVarsFor,
  replaceInquiryVars,
  replaceInquiryVarsHtml,
  wrapInquiryEmailHtml,
} from "@/lib/inquiry-email";

type TemplateConfig = {
  key: string;
  label: string;
  description: string;
  color: "emerald" | "red" | "amber";
  variables: readonly string[];
};

const TEMPLATE_CONFIG: TemplateConfig[] = [
  {
    key: "email_template_inquiry_accepted",
    label: "Anfrage zugesagt",
    description: "Wird automatisch gesendet, wenn eine Anfrage angenommen wird",
    color: "emerald",
    variables: INQUIRY_EMAIL_VARIABLES,
  },
  {
    key: "email_template_inquiry_rejected",
    label: "Anfrage abgesagt",
    description: "Wird automatisch gesendet, wenn eine Anfrage abgelehnt wird",
    color: "red",
    variables: INQUIRY_EMAIL_VARIABLES,
  },
  {
    key: "email_template_driver_reminder",
    label: "Fahrer-Erinnerung",
    description: "Wird automatisch an Fahrer geschickt, wenn ein Auftrag bald ansteht (gemäß Vorlauf-Einstellung im Fahrer-Profil)",
    color: "amber",
    variables: DRIVER_REMINDER_VARIABLES,
  },
];

type Templates = Record<string, { subject: string; body: string }>;

// Sample-Werte je Template-Key einmal beim Modul-Laden gecached.
const SAMPLE_VARS_BY_KEY: Record<string, Record<string, string>> = Object.fromEntries(
  TEMPLATE_CONFIG.map((c) => [c.key, getSampleVarsFor(c.key)]),
);

function buildPreviewHtml(templateKey: string, body: string): string {
  const sampleVars = SAMPLE_VARS_BY_KEY[templateKey] ?? {};
  // Body wird HTML-rendered → Werte escapen, Template-HTML durchlassen.
  const renderedBodyHtml = replaceInquiryVarsHtml(body, sampleVars);
  return wrapInquiryEmailHtml(renderedBodyHtml, { companyName: sampleVars.companyName });
}

function EmailPreview({
  templateKey,
  subject,
  body,
}: {
  templateKey: string;
  subject: string;
  body: string;
}) {
  const sampleVars = SAMPLE_VARS_BY_KEY[templateKey] ?? {};
  const renderedSubject = replaceInquiryVars(subject, sampleVars);
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
        srcDoc={buildPreviewHtml(templateKey, body)}
        title="E-Mail Vorschau"
        sandbox=""
        className="w-full h-[420px] bg-[#f5f5f5] border-0"
      />
    </div>
  );
}

export function EmailTemplateEditor({
  templates: initial,
}: {
  templates: Templates;
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
        body: JSON.stringify({ subject: t.subject, body: t.body, templateKey: key }),
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
      {/* Globaler HTML-Formatierungs-Hinweis */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border px-4 py-2.5 flex items-center gap-2">
          <IconCode className="size-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">HTML-Formatierung</h3>
        </div>
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground">
            Du kannst HTML im Body verwenden — Zeilenumbrüche bleiben erhalten:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {[
              "<strong>fett</strong>",
              "<em>kursiv</em>",
              "<a href=\"…\">Link</a>",
              "<ul><li>Liste</li></ul>",
              "<hr>",
              "<br>",
            ].map((html) => (
              <code key={html} className="text-[11px] bg-muted text-foreground/70 px-2 py-0.5 rounded font-mono">
                {html}
              </code>
            ))}
          </div>
        </div>
      </div>

      {/* Templates */}
      {TEMPLATE_CONFIG.map((config) => {
        const t = templates[config.key];
        if (!t) return null;
        const colorClasses =
          config.color === "emerald"
            ? "border-emerald-500/20 bg-emerald-500/5"
            : config.color === "amber"
              ? "border-amber-500/20 bg-amber-500/5"
              : "border-red-500/20 bg-red-500/5";
        const dotColor =
          config.color === "emerald"
            ? "bg-emerald-400"
            : config.color === "amber"
              ? "bg-amber-400"
              : "bg-red-400";

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

            {/* Verfügbare Platzhalter dieses Templates */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mr-1">
                Platzhalter:
              </span>
              {config.variables.map((v) => (
                <code
                  key={v}
                  className="text-[11px] bg-muted text-primary px-1.5 py-0.5 rounded font-mono"
                >
                  {`{{${v}}}`}
                </code>
              ))}
            </div>

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
              <EmailPreview templateKey={config.key} subject={t.subject} body={t.body} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
