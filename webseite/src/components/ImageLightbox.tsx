"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

type LightboxImage = { src: string; alt: string };

export default function ImageLightbox({ images }: { images: LightboxImage[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const close = useCallback(() => setOpenIdx(null), []);
  const next = useCallback(
    () => setOpenIdx((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length]
  );
  const prev = useCallback(
    () => setOpenIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length)),
    [images.length]
  );

  useEffect(() => {
    if (openIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [openIdx, close, next, prev]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > 60 && absDx > absDy) {
        // Horizontal swipe: left = next, right = prev
        if (dx < 0) next();
        else prev();
      } else if (dy > 80 && absDy > absDx) {
        // Swipe down = close
        close();
      }
      touchStart.current = null;
    },
    [close, next, prev]
  );

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <button
            key={img.src}
            type="button"
            onClick={() => setOpenIdx(idx)}
            className="relative aspect-[4/3] overflow-hidden group cursor-zoom-in block focus:outline-none focus:ring-2 focus:ring-[#F3A300]"
            aria-label={`Bild ${idx + 1} öffnen: ${img.alt}`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          </button>
        ))}
      </div>

      {openIdx !== null && createPortal(
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 md:p-8"
          onClick={close}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          role="dialog"
          aria-modal="true"
          aria-label="Bildvergrößerung"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              close();
            }}
            className="absolute top-3 left-3 md:top-4 md:right-4 md:left-auto z-20 flex items-center justify-center w-11 h-11 md:w-10 md:h-10 rounded-full bg-black/60 text-white active:bg-black/80 md:bg-transparent md:hover:text-white md:text-white/80"
            aria-label="Schließen"
          >
            <svg className="w-7 h-7 md:w-8 md:h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-20 hidden md:block"
              aria-label="Vorheriges Bild"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          <div className="relative w-full max-w-[1400px] h-[80vh] md:h-[85vh] pointer-events-none">
            <Image
              src={images[openIdx].src}
              alt={images[openIdx].alt}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-2 z-20 hidden md:block"
              aria-label="Nächstes Bild"
            >
              <svg className="w-12 h-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-[14px] font-[family-name:var(--font-fira-condensed)] tracking-wide">
              {openIdx + 1} / {images.length}
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
