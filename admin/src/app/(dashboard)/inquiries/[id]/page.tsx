import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { InquiryActions } from "./inquiry-actions";
import { InquiryDetails } from "./inquiry-details";
import { normalizeExtraKey } from "@/lib/extras-pricing";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconPackage,
  IconClock,
  IconExternalLink,
} from "@tabler/icons-react";

export default async function InquiryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
    include: { order: { include: { driver: true, company: { select: { id: true, name: true } } } } },
  });

  if (!inquiry) notFound();

  const statusConfig: Record<
    string,
    { label: string; className: string; dotColor: string }
  > = {
    NEW: {
      label: "Neu",
      className: "bg-amber-500/15 text-amber-400 border-amber-500/25",
      dotColor: "bg-amber-400",
    },
    CONTACTED: {
      label: "Kontaktiert",
      className: "bg-blue-500/15 text-blue-400 border-blue-500/25",
      dotColor: "bg-blue-400",
    },
    WAITING: {
      label: "Warte auf Zusage",
      className: "bg-purple-500/15 text-purple-400 border-purple-500/25",
      dotColor: "bg-purple-400",
    },
    ACCEPTED: {
      label: "Angenommen",
      className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      dotColor: "bg-emerald-400",
    },
    REJECTED: {
      label: "Abgelehnt",
      className: "bg-red-500/15 text-red-400 border-red-500/25",
      dotColor: "bg-red-400",
    },
  };

  const status = statusConfig[inquiry.status] ?? statusConfig.NEW;

  // Legacy-Inquiries haben u.U. lange Marketing-Namen gespeichert.
  // Für Preis-Preview + Extras-Button-Preselection auf Admin-Keys normalisieren.
  const normalizedExtras = Array.from(
    new Set(inquiry.extras.filter(Boolean).map(normalizeExtraKey))
  );

  const formattedEventDate = new Date(inquiry.eventDate).toLocaleDateString(
    "de-DE",
    {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  const formattedCreatedAt = new Date(inquiry.createdAt).toLocaleDateString(
    "de-DE",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl border border-border bg-card shadow-lg shadow-black/5 dark:shadow-black/25 p-4 sm:p-6">
        {/* Top row: back + status */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Link
            href="/inquiries"
            className="flex items-center justify-center size-9 rounded-lg border border-border bg-muted text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            <IconArrowLeft className="size-4" />
          </Link>
          <span className="text-xs text-muted-foreground/70">Anfrage</span>
          <Badge
            variant="outline"
            className={"ml-auto text-xs px-2.5 py-0.5 " + status.className}
          >
            <span
              className={
                "inline-block size-1.5 rounded-full mr-1.5 " + status.dotColor
              }
            />
            {status.label}
          </Badge>
        </div>

        {/* Date */}
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <IconCalendar className="size-5 text-primary shrink-0" />
          <span className="text-base sm:text-xl text-primary font-semibold">
            {formattedEventDate}
          </span>
          <span className="inline-flex items-center rounded-md bg-accent px-2.5 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {inquiry.eventType}
          </span>
        </div>

        {/* Customer Name */}
        <h1 className="text-xl sm:text-3xl font-bold text-foreground mb-1.5">
          {inquiry.customerName}
        </h1>

        {/* Location */}
        <div className="flex items-start gap-2 text-muted-foreground">
          <IconMapPin className="size-4 shrink-0 mt-0.5" />
          <span className="text-sm sm:text-base">
            <span className="text-foreground/80 font-medium">
              {inquiry.locationName}
            </span>
            {inquiry.locationAddress &&
              inquiry.locationAddress !== inquiry.locationName && (
                <span className="text-muted-foreground">
                  {" "}
                  &middot; {inquiry.locationAddress}
                </span>
              )}
            {inquiry.distanceKm != null && (
              <span className="text-muted-foreground">
                {" "}
                &middot; {inquiry.distanceKm} km
              </span>
            )}
          </span>
        </div>

        {/* Created at */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-muted-foreground/70">
          <IconClock className="size-3.5" />
          Eingegangen am {formattedCreatedAt}
        </div>
      </div>

      {/* Linked Order Banner */}
      {inquiry.order && (
        <Link
          href={`/orders/${inquiry.order.id}`}
          className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 transition-colors hover:bg-emerald-500/15"
        >
          <IconPackage className="size-5 text-emerald-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-emerald-400">
              Auftrag #{inquiry.order.orderNumber}
            </p>
            <p className="text-xs text-muted-foreground">
              {inquiry.order.company.name} &middot;{" "}
              {inquiry.order.price.toFixed(2)} &euro; &middot;{" "}
              {inquiry.order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
              {inquiry.order.driver && (
                <> &middot; {inquiry.order.driver.name}</>
              )}
            </p>
          </div>
          <IconExternalLink className="size-4 text-muted-foreground/70 shrink-0" />
        </Link>
      )}

      {/* Info Cards (now ABOVE actions) */}
      <InquiryDetails
        inquiry={{
          id: inquiry.id,
          customerName: inquiry.customerName,
          customerEmail: inquiry.customerEmail,
          customerPhone: inquiry.customerPhone,
          customerType: inquiry.customerType,
          eventType: inquiry.eventType,
          eventDate: inquiry.eventDate.toISOString(),
          locationName: inquiry.locationName,
          locationAddress: inquiry.locationAddress,
          locationLat: inquiry.locationLat,
          locationLng: inquiry.locationLng,
          distanceKm: inquiry.distanceKm,
          extras: normalizedExtras,
          comments: inquiry.comments,
        }}
      />

      {/* Actions (now BELOW info cards) */}
      {["NEW", "CONTACTED", "WAITING"].includes(inquiry.status) && (
        <InquiryActions
          inquiryId={inquiry.id}
          customerType={inquiry.customerType}
          inquiryExtras={normalizedExtras}
          distanceKm={inquiry.distanceKm}
        />
      )}
    </div>
  );
}
