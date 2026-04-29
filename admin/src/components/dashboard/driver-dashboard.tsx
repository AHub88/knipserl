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
  IconBoxAlignBottomLeft,
  IconBoxAlignTopRight,
} from "@tabler/icons-react";
import {
  AssignedCard,
  DeliveryBox,
  type OrderItem,
} from "@/app/(dashboard)/my-orders/my-orders-tabs";

function formatDateLong(date: Date) {
  return date.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function daysUntilNumber(date: Date, now: Date) {
  const a = new Date(date);
  a.setHours(0, 0, 0, 0);
  const b = new Date(now);
  b.setHours(0, 0, 0, 0);
  return Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

function daysUntil(date: Date, now: Date) {
  const diff = daysUntilNumber(date, now);
  if (diff <= 0) return "Heute";
  if (diff === 1) return "Morgen";
  if (diff < 7) return `in ${diff} Tagen`;
  if (diff < 14) return "in 1 Woche";
  return `in ${Math.floor(diff / 7)} Wochen`;
}

const HERO_THRESHOLD_DAYS = 14;

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

  const daysToNext = nextOrder ? daysUntilNumber(new Date(nextOrder.eventDate), now) : null;
  const showHero = daysToNext !== null && daysToNext <= HERO_THRESHOLD_DAYS;

  const mapsUrl = nextOrder
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(nextOrder.locationAddress)}`
    : null;

  const heroCompensation = nextOrder ? Math.abs(nextOrder.setupCost ?? 0) : 0;
  const heroExtras = nextOrder?.extras ?? [];
  const heroHasDelivery = !!(nextOrder?.setupDate || nextOrder?.teardownDate);

  const hero = showHero && nextOrder ? (
    <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-primary/[0.04] to-transparent overflow-hidden">
      <Link
        href={`/orders/${nextOrder.id}`}
        className="block p-5 sm:p-6 lg:p-7 hover:bg-primary/[0.03] transition-colors space-y-3"
      >
        <div className="flex items-center gap-2">
          <IconCalendarEvent className="size-4 text-primary" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-primary">
            Nächste Fahrt
          </span>
          <span className="ml-auto text-[10px] font-bold uppercase tracking-wider rounded-md bg-primary/15 text-primary px-2 py-0.5">
            {daysUntil(new Date(nextOrder.eventDate), now)}
          </span>
        </div>
        <div>
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
        </div>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1">
          <span className="text-sm font-medium text-foreground/90">{nextOrder.customerName}</span>
          <span className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-semibold text-muted-foreground">
            {nextOrder.eventType}
          </span>
          {heroCompensation > 0 && (
            <span className="ml-auto text-sm font-bold text-emerald-500">
              {heroCompensation} €
            </span>
          )}
        </div>
        {heroExtras.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {heroExtras.map((e) => (
              <span
                key={e}
                className="px-2 py-0.5 rounded-md border border-primary/20 bg-primary/8 text-[11px] font-semibold text-primary"
              >
                {e}
              </span>
            ))}
          </div>
        )}
        {heroHasDelivery && (
          <div className="grid grid-cols-2 gap-2">
            <DeliveryBox
              label="Aufbau"
              iso={nextOrder.setupDate?.toISOString() ?? null}
              time={nextOrder.setupTime ?? null}
              tone="emerald"
              icon={<IconBoxAlignBottomLeft className="size-3.5" />}
            />
            <DeliveryBox
              label="Abbau"
              iso={nextOrder.teardownDate?.toISOString() ?? null}
              time={nextOrder.teardownTime ?? null}
              tone="rose"
              icon={<IconBoxAlignTopRight className="size-3.5" />}
            />
          </div>
        )}
      </Link>
      {mapsUrl && (
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 lg:px-7 lg:pb-7">
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
  ) : null;

  const emptyState = !nextOrder ? (
    <div className="rounded-2xl border border-border bg-card p-8 lg:p-12 text-center">
      <IconCalendarEvent className="size-8 lg:size-10 text-muted-foreground/40 mx-auto mb-2" />
      <p className="text-sm font-medium text-foreground">
        Aktuell kein Auftrag geplant
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Schau bei den freien Aufträgen vorbei.
      </p>
    </div>
  ) : null;

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

  // Wenn der Hero sichtbar ist, ist der nächste Auftrag dort schon abgebildet —
  // Liste lassen wir ohne ihn. Wenn der Hero ausgeblendet ist (weil > 14 Tage weg),
  // gehört die nächste Fahrt in die Liste rein.
  const listOrders = showHero
    ? upcomingOrders.filter((o) => o.id !== nextOrder?.id)
    : upcomingOrders;
  const listItems: OrderItem[] = listOrders.map((o) => ({
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
    listItems.length > 0 ? (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconRoute className="size-4 text-primary" />
          <h2 className="text-sm font-semibold text-foreground">
            {showHero ? "Weitere Aufträge" : "Anstehende Aufträge"}
          </h2>
        </div>
        <div className="space-y-2">
          {listItems.map((order) => (
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

      {/* Adaptives Top-Layout:
          - Hero sichtbar (≤14 Tage zur nächsten Fahrt) → Hero links, Stats rechts daneben
          - Hero unsichtbar → Stats füllen die ganze Breite, Liste ist die Hauptbühne
          - Kein Auftrag → freundlicher Empty-State + Stats */}
      {showHero ? (
        <div className="grid gap-5 sm:gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">{hero}</div>
          <div className="lg:col-span-1">{quickActions}</div>
        </div>
      ) : (
        <div className="space-y-5 sm:space-y-6">
          {emptyState}
          {quickActions}
        </div>
      )}

      {/* Vacation oben drüber (auffälliger Hinweis), wenn vorhanden */}
      {vacationCard}

      {/* Aufträge — adaptiver Titel je nach Hero-Sichtbarkeit */}
      {upcomingList}
    </div>
  );
}
