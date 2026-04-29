import Link from "next/link";
import { prisma } from "@/lib/db";
import {
  IconClipboardCheck,
  IconClipboardList,
  IconCalendar,
  IconMapPin,
  IconExternalLink,
  IconCalendarEvent,
  IconRoute,
  IconBeach,
} from "@tabler/icons-react";
import { AssignedCard, type OrderItem } from "@/app/(dashboard)/my-orders/my-orders-tabs";

function formatDateLong(date: Date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function daysUntil(date: Date, now: Date) {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  const diff = Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff < 7) return `in ${diff} Tagen`;
  if (diff < 14) return "in 1 Woche";
  return `in ${Math.floor(diff / 7)} Wochen`;
}

function extractCity(address: string): string {
  return address.match(/\d{5}\s+(.+)$/)?.[1]?.trim() ?? "";
}

async function safe<T>(label: string, fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch (e) {
    console.error(`[driver-dashboard] ${label} query failed`, e);
    return fallback;
  }
}

export async function DriverDashboard({
  driverId,
  driverName,
}: {
  driverId: string;
  driverName: string | null;
}) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const [nextOrder, freeOrdersCount, myOrdersCount, upcomingOrders, activeVacation] =
    await Promise.all([
      safe(
        "nextOrder",
        () =>
          prisma.order.findFirst({
            where: {
              driverId,
              status: { not: "CANCELLED" },
              eventDate: { gte: startOfToday },
            },
            orderBy: { eventDate: "asc" },
          }),
        null,
      ),
      safe(
        "freeOrdersCount",
        () =>
          prisma.order.count({
            where: {
              status: "OPEN",
              driverId: null,
              secondDriverId: null,
              eventDate: { gte: startOfToday },
            },
          }),
        0,
      ),
      safe(
        "myOrdersCount",
        () =>
          prisma.order.count({
            where: {
              driverId,
              status: { not: "CANCELLED" },
              eventDate: { gte: startOfToday },
            },
          }),
        0,
      ),
      safe(
        "upcomingOrders",
        () =>
          prisma.order.findMany({
            where: {
              driverId,
              status: { not: "CANCELLED" },
              eventDate: { gte: startOfToday },
            },
            orderBy: { eventDate: "asc" },
          }),
        [] as Awaited<ReturnType<typeof prisma.order.findMany>>,
      ),
      safe(
        "activeVacation",
        () =>
          prisma.vacation.findFirst({
            where: {
              driverId,
              endDate: { gte: startOfToday },
            },
            orderBy: { startDate: "asc" },
          }),
        null,
      ),
    ]);

  const firstName = (driverName ?? "").split(" ")[0] || "Hallo";

  const mapsUrl = nextOrder
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextOrder.locationAddress)}`
    : null;

  const hero = nextOrder ? (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent overflow-hidden">
      <Link
        href={`/orders/${nextOrder.id}`}
        className="block p-5 sm:p-6 lg:p-7 hover:bg-primary/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2 mb-3">
          <IconCalendarEvent className="size-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Nächste Fahrt
          </span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/15 text-primary px-2 py-0.5">
            {daysUntil(new Date(nextOrder.eventDate), now)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {formatDateLong(new Date(nextOrder.eventDate))}
        </p>
        <p className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground mt-1 leading-snug">
          {nextOrder.locationName ||
            extractCity(nextOrder.locationAddress) ||
            nextOrder.locationAddress}
        </p>
        <div className="flex items-center gap-1.5 mt-1 text-sm text-muted-foreground">
          <IconMapPin className="size-3.5 shrink-0" />
          <span className="truncate">{nextOrder.locationAddress}</span>
        </div>
        <p className="text-sm text-foreground/80 mt-2">
          <span className="font-medium">{nextOrder.customerName}</span>
          <span className="text-muted-foreground"> · {nextOrder.eventType}</span>
        </p>
      </Link>
      {mapsUrl && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 lg:px-7 lg:pb-7 -mt-1">
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <IconExternalLink className="size-4" />
            Route in Google Maps
          </a>
        </div>
      )}
    </div>
  ) : (
    <div className="rounded-2xl border border-border bg-card p-8 lg:p-12 text-center">
      <IconCalendarEvent className="size-8 lg:size-10 text-muted-foreground/40 mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">
        Aktuell kein Auftrag geplant
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Schau bei den freien Aufträgen vorbei.
      </p>
    </div>
  );

  const quickActions = (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      <Link
        href="/free-orders"
        className="rounded-xl border border-border bg-card hover:border-emerald-500/30 transition-colors p-3 sm:p-4 flex flex-col items-center gap-1.5"
      >
        <IconClipboardCheck className="size-5 sm:size-6 text-emerald-500" />
        <span className="text-lg sm:text-2xl font-extrabold text-foreground tabular-nums leading-none">
          {freeOrdersCount}
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Frei</span>
      </Link>
      <Link
        href="/my-orders"
        className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-3 sm:p-4 flex flex-col items-center gap-1.5"
      >
        <IconClipboardList className="size-5 sm:size-6 text-primary" />
        <span className="text-lg sm:text-2xl font-extrabold text-foreground tabular-nums leading-none">
          {myOrdersCount}
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Meine</span>
      </Link>
      <Link
        href="/calendar"
        className="rounded-xl border border-border bg-card hover:border-primary/30 transition-colors p-3 sm:p-4 flex flex-col items-center gap-1.5"
      >
        <IconCalendar className="size-5 sm:size-6 text-primary" />
        <span className="text-lg sm:text-2xl font-extrabold text-muted-foreground/40 tabular-nums leading-none">
          ·
        </span>
        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground">Kalender</span>
      </Link>
    </div>
  );

  // Hero zeigt bereits den nächsten Auftrag — Liste enthält alles ab #2,
  // damit es keine Doppelung zwischen Hero und Listen-Topentry gibt.
  const restOrders = upcomingOrders.filter((o) => o.id !== nextOrder?.id);
  const restItems: OrderItem[] = restOrders.map((o) => ({
    id: o.id,
    customerName: o.customerName,
    eventDate: o.eventDate.toISOString(),
    eventType: o.eventType,
    locationName: o.locationName,
    locationAddress: o.locationAddress,
    extras: o.extras,
    notes: o.notes,
    status: o.status,
    compensation: Math.abs(o.setupCost ?? 0),
    setupDate: o.setupDate?.toISOString() ?? null,
    setupTime: o.setupTime ?? null,
    teardownDate: o.teardownDate?.toISOString() ?? null,
    teardownTime: o.teardownTime ?? null,
  }));

  const upcomingList =
    restItems.length > 0 ? (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconRoute className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">Weitere Aufträge</h2>
        </div>
        <div className="space-y-2">
          {restItems.map((order) => (
            <AssignedCard key={order.id} order={order} now={now} />
          ))}
        </div>
      </div>
    ) : null;

  const vacationCard = activeVacation ? (
    <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-4 flex items-start gap-3">
      <div className="flex items-center justify-center size-9 rounded-lg bg-amber-500/15 shrink-0">
        <IconBeach className="size-4 text-amber-500" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">
          {activeVacation.type === "ABSENT" ? "Abwesenheit" : "Eingeschränkt"}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(activeVacation.startDate).toLocaleDateString("de-DE")} –{" "}
          {new Date(activeVacation.endDate).toLocaleDateString("de-DE")}
          {activeVacation.note && ` · ${activeVacation.note}`}
        </p>
      </div>
      <Link
        href="/my-vacation"
        className="text-[11px] font-semibold text-amber-500 hover:text-amber-400 transition-colors shrink-0"
      >
        Bearbeiten →
      </Link>
    </div>
  ) : null;

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
          Hallo, {firstName} 👋
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {nextOrder
            ? `Deine nächste Fahrt: ${daysUntil(new Date(nextOrder.eventDate), now)}`
            : "Aktuell kein Auftrag geplant"}
        </p>
      </div>

      {/* Hero + Schnellaktionen — auf Desktop nebeneinander, Hero dominant */}
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">{hero}</div>
        <div className="lg:col-span-1">{quickActions}</div>
      </div>

      {/* Vacation oben drüber (auffälliger Hinweis), wenn vorhanden */}
      {vacationCard}

      {/* Anstehende Aufträge — Boxen wie freie Aufträge */}
      {upcomingList}
    </div>
  );
}
