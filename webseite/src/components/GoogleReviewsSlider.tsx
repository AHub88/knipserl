"use client";

import { useState, useEffect, useCallback } from "react";

type Review = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  time: string;
};

type ReviewData = {
  reviews: Review[];
  totalCount: number;
  averageRating: number;
};

function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={i < rating ? "#FBBC04" : "#dadce0"}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

// Google "G" logo as inline SVG
function GoogleLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

const AVATAR_COLORS = ["#4285F4", "#EA4335", "#FBBC05", "#34A853", "#7B1FA2", "#FF6D00"];

function ReviewCard({ review, index }: { review: Review; index: number }) {
  const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const date = new Date(review.time).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-5 flex flex-col h-full min-w-0">
      <div className="flex items-center gap-3 mb-3">
        <div
          className="size-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
          style={{ backgroundColor: color }}
        >
          {review.authorName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {review.authorName}
          </p>
          <p className="text-xs text-gray-500">{date}</p>
        </div>
        <GoogleLogo size={20} />
      </div>
      <StarRating rating={review.rating} size={14} />
      {review.text && (
        <p className="text-sm text-gray-700 mt-3 leading-relaxed line-clamp-5">
          {review.text}
        </p>
      )}
    </div>
  );
}

export default function GoogleReviewsSlider({ apiBaseUrl }: { apiBaseUrl: string }) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`${apiBaseUrl}/api/google-reviews`, { cache: "no-store" })
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, [apiBaseUrl]);

  // How many cards visible at once
  const [visibleCount, setVisibleCount] = useState(3);
  useEffect(() => {
    function update() {
      if (window.innerWidth < 640) setVisibleCount(1);
      else if (window.innerWidth < 1024) setVisibleCount(2);
      else setVisibleCount(3);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const maxIndex = data ? Math.max(0, data.reviews.length - visibleCount) : 0;

  const prev = useCallback(
    () => setCurrentIndex((i) => Math.max(0, i - 1)),
    []
  );
  const next = useCallback(
    () => setCurrentIndex((i) => Math.min(maxIndex, i + 1)),
    [maxIndex]
  );

  if (!data || data.reviews.length === 0) return null;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
      {/* Left: aggregate rating */}
      <div className="flex-shrink-0 text-center">
        <p
          className="text-[22px] font-extrabold text-[#1a171b] uppercase tracking-wide mb-2"
          style={{ fontFamily: "'Fira Sans Extra Condensed', sans-serif" }}
        >
          Ausgezeichnet
        </p>
        <div className="flex justify-center mb-2">
          <StarRating rating={Math.round(data.averageRating)} size={28} />
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Basierend auf{" "}
          <span className="font-semibold underline">{data.totalCount} Bewertungen</span>
        </p>
        <div className="flex justify-center">
          <GoogleLogo size={40} />
        </div>
      </div>

      {/* Right: slider */}
      <div className="flex-1 min-w-0 w-full">
        <div className="relative">
          {/* Arrow left */}
          {currentIndex > 0 && (
            <button
              onClick={prev}
              className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Vorherige Bewertung"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
          )}

          {/* Cards */}
          <div className="overflow-hidden">
            <div
              className="flex gap-4 transition-transform duration-300"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
              }}
            >
              {data.reviews.map((review, i) => (
                <div
                  key={review.id}
                  className="flex-shrink-0"
                  style={{ width: `calc(${100 / visibleCount}% - ${((visibleCount - 1) * 16) / visibleCount}px)` }}
                >
                  <ReviewCard review={review} index={i} />
                </div>
              ))}
            </div>
          </div>

          {/* Arrow right */}
          {currentIndex < maxIndex && (
            <button
              onClick={next}
              className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 size-10 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Nächste Bewertung"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
