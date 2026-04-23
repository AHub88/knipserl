"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconDeviceFloppy, IconRefresh, IconEye, IconCode } from "@tabler/icons-react";
import { toast } from "sonner";
import { DEFAULT_IMPRESSUM_HTML, DEFAULT_DATENSCHUTZ_HTML } from "./default-content";

type TabKey = "impressum" | "datenschutz";

export function LegalPagesEditor({
  initialImpressum,
  initialDatenschutz,
}: {
  initialImpressum: string;
  initialDatenschutz: string;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>("impressum");
  const [impressum, setImpressum] = useState(initialImpressum);
  const [datenschutz, setDatenschutz] = useState(initialDatenschutz);
  const [saving, setSaving] = useState(false);

  const currentValue = tab === "impressum" ? impressum : datenschutz;
  const setCurrentValue = tab === "impressum" ? setImpressum : setDatenschutz;
  const currentKey = tab === "impressum" ? "legal_impressum_html" : "legal_datenschutz_html";
  const currentDefault = tab === "impressum" ? DEFAULT_IMPRESSUM_HTML : DEFAULT_DATENSCHUTZ_HTML;

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [currentKey]: currentValue }),
      });
      if (!res.ok) throw new Error();
      toast.success("Gespeichert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  function loadDefault() {
    if (currentValue.trim() && !confirm("Aktuellen Inhalt mit Standard-Text &uuml;berschreiben?")) {
      return;
    }
    setCurrentValue(currentDefault);
    toast.info("Standard-Text geladen — bitte speichern");
  }

  const tabClass = (active: boolean) =>
    `px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
      active
        ? "bg-primary text-black"
        : "bg-card text-foreground/80 hover:text-foreground border border-border"
    }`;

  return (
    <div className="space-y-4 max-w-6xl">
      <div className="flex items-center gap-2">
        <button onClick={() => setTab("impressum")} className={tabClass(tab === "impressum")}>
          Impressum
        </button>
        <button onClick={() => setTab("datenschutz")} className={tabClass(tab === "datenschutz")}>
          Datenschutzerkl&auml;rung
        </button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Editor */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconCode className="size-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground/80">HTML-Editor</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadDefault}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-foreground/80 hover:text-foreground text-xs font-semibold transition-colors"
                title="Vordefinierten Standard-Text laden"
              >
                <IconRefresh className="size-3.5" />
                Standard laden
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                <IconDeviceFloppy className="size-3.5" />
                {saving ? "..." : "Speichern"}
              </button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Erlaubtes HTML: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;ul&gt;/&lt;li&gt;, &lt;a&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;br&gt;
          </p>
          <textarea
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            spellCheck={false}
            className="w-full min-h-[600px] rounded-lg border border-border bg-muted p-3 text-xs font-mono text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors resize-y"
            placeholder={`<h2>&Uuml;berschrift</h2>\n<p>Text...</p>`}
          />
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-3">
          <div className="flex items-center gap-2">
            <IconEye className="size-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground/80">Live-Vorschau</h2>
          </div>
          <div className="rounded-lg border border-border bg-white p-6 min-h-[600px] overflow-auto">
            <div
              className="legal-preview text-[#666] text-[14px] leading-relaxed"
              style={{ fontFamily: "'Fira Sans', sans-serif" }}
              dangerouslySetInnerHTML={{ __html: currentValue || "<p style='color:#aaa'>(leer)</p>" }}
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .legal-preview h2 {
          font-size: 22px;
          line-height: 1.2;
          color: #1a171b;
          margin: 1rem 0 0.75rem;
          font-weight: 700;
        }
        .legal-preview h3 {
          font-size: 18px;
          line-height: 1.3;
          color: #1a171b;
          margin: 1rem 0 0.5rem;
          font-weight: 600;
        }
        .legal-preview p { margin: 0 0 0.75rem; }
        .legal-preview ul { margin: 0 0 0.75rem 1.25rem; list-style: disc; }
        .legal-preview a { color: #F3A300; text-decoration: underline; }
        .legal-preview strong { color: #1a171b; }
      `}</style>
    </div>
  );
}
