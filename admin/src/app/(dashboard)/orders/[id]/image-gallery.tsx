"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  IconUpload,
  IconX,
  IconTrash,
  IconPhoto,
  IconLoader2,
} from "@tabler/icons-react";
import { toast } from "sonner";

type Props = {
  orderId: string;
  images: string[];
  isAdmin: boolean;
  singleColumn?: boolean;
};

export function ImageGallery({ orderId, images, isAdmin, singleColumn }: Props) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith("image/")
      );
      if (imageFiles.length === 0) {
        toast.error("Nur Bilder (PNG, JPG) erlaubt");
        return;
      }

      setUploading(true);
      try {
        const formData = new FormData();
        for (const file of imageFiles) {
          formData.append("files", file);
        }

        const res = await fetch(`/api/orders/${orderId}/images`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error();
        toast.success(
          `${imageFiles.length} ${imageFiles.length === 1 ? "Bild" : "Bilder"} hochgeladen`
        );
        router.refresh();
      } catch {
        toast.error("Fehler beim Hochladen");
      } finally {
        setUploading(false);
      }
    },
    [orderId, router]
  );

  async function handleDelete(imageUrl: string) {
    try {
      const res = await fetch(`/api/orders/${orderId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      });
      if (!res.ok) throw new Error();
      toast.success("Bild entfernt");
      router.refresh();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setDragging(true);
  }

  function handleDragLeave() {
    setDragging(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  return (
    <div className="space-y-3">
      {/* Image grid */}
      {images.length > 0 && (
        <div className={singleColumn ? "space-y-3" : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3"}>
          {images.map((img) => (
            <div key={img} className="relative group rounded-lg overflow-hidden border border-border bg-card">
              <button
                onClick={() => setModalImage(img)}
                className="block w-full"
              >
                <img
                  src={img}
                  alt="Drucklayout"
                  className="w-full h-auto object-contain"
                />
              </button>
              {isAdmin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(img);
                  }}
                  className="absolute top-1.5 right-1.5 size-6 flex items-center justify-center rounded-md bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                >
                  <IconTrash className="size-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload zone */}
      {isAdmin && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={
            "flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-3 cursor-pointer transition-colors " +
            (dragging
              ? "border-primary bg-primary/10"
              : "border-border bg-card hover:border-border hover:bg-accent")
          }
        >
          {uploading ? (
            <IconLoader2 className="size-5 text-primary animate-spin" />
          ) : (
            <IconUpload
              className={
                "size-5 " + (dragging ? "text-primary" : "text-muted-foreground")
              }
            />
          )}
          <p className="text-sm text-muted-foreground">
            {uploading
              ? "Hochladen..."
              : dragging
              ? "Hier ablegen"
              : "Bilder hierher ziehen oder klicken"}
          </p>
          <p className="text-[10px] text-muted-foreground">PNG, JPG</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) uploadFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {/* Empty state */}
      {images.length === 0 && !isAdmin && (
        <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
          <IconPhoto className="size-8 mb-2" />
          <p className="text-sm">Keine Drucklayouts vorhanden</p>
        </div>
      )}

      {/* Modal */}
      {modalImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            className="absolute top-4 right-4 size-10 flex items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          >
            <IconX className="size-5" />
          </button>
          <img
            src={modalImage}
            alt="Drucklayout"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
