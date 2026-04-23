"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  IconArrowLeft,
  IconPlus,
  IconCheck,
  IconX,
  IconPencil,
  IconTrash,
} from "@tabler/icons-react";
import { toast } from "sonner";

type StandardItem = {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  category: string | null;
  sortOrder: number;
  active: boolean;
};

const inputClass =
  "h-9 w-full rounded-lg border border-border bg-muted px-3 text-sm text-foreground outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25 transition-colors";

export function StandardItemsManager({
  initialItems,
}: {
  initialItems: StandardItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<StandardItem>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    title: "",
    description: "",
    unitPrice: "",
    category: "",
  });
  const [saving, setSaving] = useState(false);
  const [showInactive, setShowInactive] = useState(false);

  const activeItems = items.filter((i) => i.active);
  const inactiveItems = items.filter((i) => !i.active);
  const displayItems = showInactive ? items : activeItems;

  async function handleAdd() {
    if (!addForm.title || !addForm.unitPrice) {
      toast.error("Titel und Preis sind Pflichtfelder");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/standard-line-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: addForm.title,
          description: addForm.description || null,
          unitPrice: Number(addForm.unitPrice),
          category: addForm.category || null,
        }),
      });
      if (!res.ok) throw new Error();
      const created = await res.json();
      setItems((prev) => [...prev, created]);
      setAddForm({ title: "", description: "", unitPrice: "", category: "" });
      setShowAdd(false);
      toast.success("Position erstellt");
      router.refresh();
    } catch {
      toast.error("Fehler beim Erstellen");
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: StandardItem) {
    setEditingId(item.id);
    setEditForm({
      title: item.title,
      description: item.description || "",
      unitPrice: item.unitPrice,
      category: item.category || "",
    });
  }

  async function saveEdit() {
    if (!editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/standard-line-items/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editForm.title,
          description: editForm.description || null,
          unitPrice: Number(editForm.unitPrice),
          category: editForm.category || null,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await res.json();
      setItems((prev) => prev.map((i) => (i.id === editingId ? updated : i)));
      setEditingId(null);
      toast.success("Position aktualisiert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Speichern");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Position wirklich deaktivieren?")) return;
    try {
      const res = await fetch(`/api/standard-line-items/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, active: false } : i))
      );
      toast.success("Position deaktiviert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Deaktivieren");
    }
  }

  async function handleReactivate(id: string) {
    try {
      const res = await fetch(`/api/standard-line-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: true }),
      });
      if (!res.ok) throw new Error();
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, active: true } : i))
      );
      toast.success("Position reaktiviert");
      router.refresh();
    } catch {
      toast.error("Fehler beim Reaktivieren");
    }
  }

  function formatPrice(price: number) {
    return price.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <IconArrowLeft className="size-4" />
          Einstellungen
        </Link>
        <div className="flex items-center gap-2">
          {inactiveItems.length > 0 && (
            <button
              onClick={() => setShowInactive((v) => !v)}
              className="h-9 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {showInactive
                ? "Inaktive ausblenden"
                : `${inactiveItems.length} inaktive`}
            </button>
          )}
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <IconPlus className="size-4" />
            Neue Position
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="rounded-xl border border-primary/30 bg-card p-4 sm:p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Neue Position erstellen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Titel *
              </label>
              <input
                className={inputClass}
                value={addForm.title}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="z.B. Fotobox 3 Stunden"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Einzelpreis *
              </label>
              <input
                className={inputClass}
                type="number"
                step="0.01"
                value={addForm.unitPrice}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, unitPrice: e.target.value }))
                }
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Beschreibung
              </label>
              <input
                className={inputClass}
                value={addForm.description}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optionale Beschreibung"
              />
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1">
                Kategorie
              </label>
              <input
                className={inputClass}
                value={addForm.category}
                onChange={(e) =>
                  setAddForm((f) => ({ ...f, category: e.target.value }))
                }
                placeholder="z.B. Fotobox, Extra, Fahrt"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAdd}
              disabled={saving}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <IconCheck className="size-3.5" />
              Erstellen
            </button>
            <button
              onClick={() => setShowAdd(false)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <IconX className="size-3.5" />
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {displayItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Noch keine Standard-Positionen vorhanden.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl border bg-card p-4 sm:p-5 space-y-3 ${
                !item.active
                  ? "border-border/50 opacity-50"
                  : "border-border"
              }`}
            >
              {editingId === item.id ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Titel
                      </label>
                      <input
                        className={inputClass}
                        value={editForm.title || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, title: e.target.value }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Einzelpreis
                      </label>
                      <input
                        className={inputClass}
                        type="number"
                        step="0.01"
                        value={editForm.unitPrice ?? ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            unitPrice: Number(e.target.value),
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Beschreibung
                      </label>
                      <input
                        className={inputClass}
                        value={(editForm.description as string) || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            description: e.target.value,
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">
                        Kategorie
                      </label>
                      <input
                        className={inputClass}
                        value={(editForm.category as string) || ""}
                        onChange={(e) =>
                          setEditForm((f) => ({
                            ...f,
                            category: e.target.value,
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-primary text-black text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      <IconCheck className="size-3.5" />
                      Speichern
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <IconX className="size-3.5" />
                      Abbrechen
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-foreground truncate">
                        {item.title}
                      </h3>
                      {item.category && (
                        <span className="shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full bg-foreground/[0.06] text-muted-foreground">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-mono font-semibold text-foreground tabular-nums">
                      {formatPrice(item.unitPrice)} &euro;
                    </span>
                    <div className="flex items-center gap-1">
                      {item.active ? (
                        <>
                          <button
                            onClick={() => startEdit(item)}
                            className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-foreground hover:bg-foreground/[0.06] transition-colors"
                            title="Bearbeiten"
                          >
                            <IconPencil className="size-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-muted-foreground/70 hover:text-red-400 hover:bg-red-400/[0.06] transition-colors"
                            title="Deaktivieren"
                          >
                            <IconTrash className="size-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivate(item.id)}
                          className="h-7 px-2.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Reaktivieren
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
