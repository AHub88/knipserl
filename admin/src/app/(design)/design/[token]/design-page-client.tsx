"use client";

import { useState } from "react";
import { LayoutEditorLoader as LayoutEditor } from "@/components/design-editor/layout-editor-loader";

type Props = {
  token: string;
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    eventType: string;
    eventDate: string | Date | null;
    locationName: string;
  };
  layoutDesign: {
    canvasJson: any;
    submitted: boolean;
    format: string;
  };
  isAdminEdit?: boolean;
};

export function DesignPageClient({ token, order, layoutDesign, isAdminEdit = false }: Props) {
  const [format, setFormat] = useState<string | null>(
    layoutDesign.format && layoutDesign.format.length > 0 ? layoutDesign.format : null
  );
  const [saving, setSaving] = useState(false);
  const [formatChanged, setFormatChanged] = useState(false);

  async function selectFormat(fmt: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/design/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ format: fmt }),
      });
      if (!res.ok) throw new Error();
      setFormat(fmt);
    } catch {
      alert("Fehler beim Speichern des Formats.");
    } finally {
      setSaving(false);
    }
  }

  // Show format picker if no format chosen yet
  if (!format) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center space-y-8 max-w-lg">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">Format wählen</h1>
            <p className="text-foreground/60">
              Wähle das gewünschte Format für dein Layout.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 2x6 - Fotostreifen */}
            <button
              onClick={() => selectFormat("2x6")}
              disabled={saving}
              className="group relative rounded-xl border-2 border-border hover:border-primary transition-all p-6 text-left disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-48 bg-foreground/10 rounded-lg border border-border group-hover:border-primary transition-colors" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">5 x 15 cm</div>
                  <div className="text-sm text-foreground/50">Fotostreifen</div>
                </div>
              </div>
            </button>

            {/* 4x6 - Fotoprint */}
            <button
              onClick={() => selectFormat("4x6")}
              disabled={saving}
              className="group relative rounded-xl border-2 border-border hover:border-primary transition-all p-6 text-left disabled:opacity-50"
            >
              <div className="flex flex-col items-center gap-4">
                <div className="w-32 h-48 bg-foreground/10 rounded-lg border border-border group-hover:border-primary transition-colors" />
                <div className="text-center">
                  <div className="text-lg font-semibold text-foreground">10 x 15 cm</div>
                  <div className="text-sm text-foreground/50">Fotoprint</div>
                </div>
              </div>
            </button>
          </div>

          {saving && (
            <p className="text-sm text-foreground/40">Wird gespeichert...</p>
          )}
        </div>
      </div>
    );
  }

  // Render the editor with the chosen format
  return (
    <LayoutEditor
      key={format}
      orderId={order.id}
      token={token}
      format={format}
      orderInfo={{
        customerName: order.customerName,
        eventType: order.eventType,
        eventDate: order.eventDate
          ? new Date(order.eventDate).toLocaleDateString("de-AT")
          : "",
        locationName: order.locationName,
      }}
      existingDesign={formatChanged ? null : {
        canvasJson: layoutDesign.canvasJson,
        submitted: layoutDesign.submitted,
      }}
      onFormatChange={async (newFmt) => {
        setSaving(true);
        try {
          const res = await fetch(`/api/design/${token}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ format: newFmt, canvasJson: {} }),
          });
          if (!res.ok) throw new Error();
          setFormatChanged(true);
          setFormat(newFmt);
        } catch {
          alert("Fehler beim Ändern des Formats.");
        } finally {
          setSaving(false);
        }
      }}
      isAdminEdit={isAdminEdit}
    />
  );
}
