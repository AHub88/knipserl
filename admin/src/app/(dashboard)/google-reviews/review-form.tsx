"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  time: string;
  active: boolean;
};

export function AddReviewForm() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [time, setTime] = useState(new Date().toISOString().split("T")[0]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!authorName.trim()) {
      toast.error("Name ist erforderlich");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/google-reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: authorName.trim(), rating, text: text.trim(), time }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Fehler");
      }
      toast.success("Bewertung hinzugefügt");
      setAuthorName("");
      setRating(5);
      setText("");
      setTime(new Date().toISOString().split("T")[0]);
      setOpen(false);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#F6A11C]/90"
      >
        <IconPlus className="size-4" />
        Bewertung hinzufügen
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-white/[0.10] bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-zinc-200">Neue Bewertung</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="Max M."
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
            required
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Datum</label>
          <input
            type="date"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100"
          />
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Sterne</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="text-2xl"
            >
              <span className={star <= rating ? "text-yellow-400" : "text-zinc-600"}>&#9733;</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Text</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Bewertungstext..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 resize-none"
        />
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F6A11C] px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-[#F6A11C]/90 disabled:opacity-50"
        >
          {saving ? "Speichert..." : "Speichern"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Bewertung wirklich löschen?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/google-reviews/${reviewId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Bewertung gelöscht");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="absolute top-3 right-3 text-zinc-600 hover:text-red-400 transition-colors"
      title="Löschen"
    >
      <IconTrash className="size-4" />
    </button>
  );
}
