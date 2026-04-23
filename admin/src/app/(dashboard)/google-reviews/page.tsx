import { prisma } from "@/lib/db";
import { IconBrandGoogle, IconStar } from "@tabler/icons-react";
import { ReviewSyncButton } from "./review-sync-button";

export default async function GoogleReviewsPage() {
  const reviews = await prisma.googleReview.findMany({
    orderBy: { time: "desc" },
  });

  const settings = await prisma.appSetting.findMany({
    where: { key: { in: ["googleReviewsTotalCount", "googleReviewsAvgRating", "googlePlaceId"] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center size-10 rounded-xl bg-[#4285F4]/10 text-[#4285F4] shrink-0">
            <IconBrandGoogle className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Google Bewertungen
            </h1>
            {map.googleReviewsTotalCount && (
              <p className="text-sm text-muted-foreground">
                {map.googleReviewsAvgRating}&nbsp;Sterne &middot; {map.googleReviewsTotalCount}&nbsp;Bewertungen auf Google
              </p>
            )}
          </div>
        </div>
        <ReviewSyncButton />
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <IconBrandGoogle className="size-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">
            Noch keine Bewertungen importiert.
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Konfiguriere den Google API Key und die Place ID unter Einstellungen, dann klicke &quot;Jetzt synchronisieren&quot;.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className={`rounded-xl border bg-card p-5 ${
                review.active ? "border-border" : "border-red-500/20 opacity-50"
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="size-10 rounded-full bg-[#4285F4] flex items-center justify-center text-white font-bold text-sm">
                  {review.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {review.authorName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(review.time).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    className={`size-4 ${
                      i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/50"
                    }`}
                  />
                ))}
              </div>
              {review.text && (
                <p className="text-sm text-muted-foreground line-clamp-4">
                  {review.text}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
