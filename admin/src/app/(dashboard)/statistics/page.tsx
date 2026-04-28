import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { loadAnalytics, type AnalyticsRange } from "./_queries";
import { StatisticsView } from "./statistics-view";

export const dynamic = "force-dynamic";

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; range?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // Sidebar zeigt /statistics nur Admins; Direktaufruf durch andere Rollen abfangen
  if (session.user.role !== "ADMIN") redirect("/");

  const sp = await searchParams;
  const rangeRaw = Number(sp.range);
  const range: AnalyticsRange = rangeRaw === 7 || rangeRaw === 90 ? rangeRaw : 30;
  const domain = sp.domain && sp.domain !== "all" ? sp.domain : null;
  const initialTab = sp.tab && ["live", "pageviews", "visitors", "events", "funnel"].includes(sp.tab) ? sp.tab : "pageviews";

  const data = await loadAnalytics({ range, domain });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Webseite
        </p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Besucherstatistik
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cookieless &amp; DSGVO-konform — keine Cookies, keine IP-Speicherung,
          keine Drittanbieter.
        </p>
      </div>

      <StatisticsView data={data} initialTab={initialTab as "live" | "pageviews" | "visitors" | "events" | "funnel"} />
    </div>
  );
}
