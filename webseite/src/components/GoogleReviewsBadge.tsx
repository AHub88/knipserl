export type ReviewSummary = {
  totalCount: number;
  averageRating: number;
};

export default function GoogleReviewsBadge({ data }: { data: ReviewSummary | null }) {
  if (!data || data.totalCount === 0) return null;

  return (
    <div className="inline-flex items-center gap-4 mt-4 bg-white/10 backdrop-blur-sm rounded-lg px-5 py-3.5">
      {/* Google G icon */}
      <svg width="40" height="40" viewBox="0 0 48 48" className="flex-shrink-0">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      </svg>
      <div className="flex flex-col">
        <span className="text-white text-base font-semibold leading-tight">
          Google bewertet
        </span>
        <div className="flex items-center gap-2">
          <span className="text-white text-lg font-bold">{data.averageRating}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <svg
                key={i}
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill={i < Math.round(data.averageRating) ? "#FBBC04" : "#666"}
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
