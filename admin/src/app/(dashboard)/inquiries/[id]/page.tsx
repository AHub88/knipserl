import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { InquiryActions } from "./inquiry-actions";
import Link from "next/link";
import {
  IconArrowLeft,
  IconCalendar,
  IconMapPin,
  IconUser,
  IconMail,
  IconPhone,
  IconBriefcase,
  IconConfetti,
  IconClock,
  IconRuler,
  IconMessageCircle,
  IconPackage,
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
    include: { order: { include: { driver: true, company: true } } },
  });

  if (!inquiry) notFound();

  const statusConfig: Record<
    string,
    { label: string; className: string; dotColor: string }
  > = {
    NEW: {
      label: "Neu",
      className:
        "bg-amber-500/15 text-amber-400 border-amber-500/25",
      dotColor: "bg-amber-400",
    },
    ACCEPTED: {
      label: "Angenommen",
      className:
        "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
      dotColor: "bg-emerald-400",
    },
    REJECTED: {
      label: "Abgelehnt",
      className:
        "bg-red-500/15 text-red-400 border-red-500/25",
      dotColor: "bg-red-400",
    },
  };

  const status = statusConfig[inquiry.status] ?? statusConfig.NEW;

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
      {/* ── Hero Header ── */}
      <div className="rounded-2xl border border-white/[0.10] bg-card shadow-lg shadow-black/30 p-4 sm:p-6">
        {/* Top row: back + status */}
        <div className="flex items-center gap-2 sm:gap-3 mb-4">
          <Link
            href="/inquiries"
            className="flex items-center justify-center size-9 rounded-lg border border-white/[0.08] bg-[#1c1d20] text-zinc-400 hover:text-zinc-200 transition-colors shrink-0"
          >
            <IconArrowLeft className="size-4" />
          </Link>
          <span className="text-xs text-zinc-500">Anfrage</span>
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
          <IconCalendar className="size-5 text-[#F6A11C] shrink-0" />
          <span className="text-base sm:text-xl text-[#F6A11C] font-semibold">
            {formattedEventDate}
          </span>
          <span className="inline-flex items-center rounded-md bg-[#222326] px-2.5 py-0.5 text-xs font-semibold text-zinc-400 uppercase tracking-wide">
            {inquiry.eventType}
          </span>
        </div>

        {/* Customer Name */}
        <h1 className="text-xl sm:text-3xl font-bold text-zinc-100 mb-1.5">
          {inquiry.customerName}
        </h1>

        {/* Location */}
        <div className="flex items-start gap-2 text-zinc-400">
          <IconMapPin className="size-4 shrink-0 mt-0.5" />
          <span className="text-sm sm:text-base">
            <span className="text-zinc-300 font-medium">
              {inquiry.locationName}
            </span>
            {inquiry.locationAddress && (
              <span className="text-muted-foreground">
                {" "}
                &middot; {inquiry.locationAddress}
              </span>
            )}
            {inquiry.distanceKm != null && (
              <span className="text-zinc-400">
                {" "}
                &middot; {inquiry.distanceKm} km
              </span>
            )}
          </span>
        </div>

        {/* Created at - small */}
        <div className="flex items-center gap-1.5 mt-3 text-xs text-zinc-500">
          <IconClock className="size-3.5" />
          Eingegangen am {formattedCreatedAt}
        </div>
      </div>

      {/* ── Actions (prominent when NEW) ── */}
      {inquiry.status === "NEW" && (
        <InquiryActions
          inquiryId={inquiry.id}
          customerType={inquiry.customerType}
        />
      )}

      {/* ── Linked Order Banner ── */}
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
            <p className="text-xs text-zinc-400">
              {inquiry.order.company.name} &middot;{" "}
              {inquiry.order.price.toFixed(2)} &euro; &middot;{" "}
              {inquiry.order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
              {inquiry.order.driver && (
                <> &middot; {inquiry.order.driver.name}</>
              )}
            </p>
          </div>
          <IconExternalLink className="size-4 text-zinc-500 shrink-0" />
        </Link>
      )}

      {/* ── Info Cards Grid ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Customer Info */}
        <div className="rounded-xl border border-white/[0.10] bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Kundendaten
          </h3>
          <div className="space-y-3">
            <DetailRow
              icon={<IconUser className="size-4" />}
              label="Name"
              value={inquiry.customerName}
            />
            <DetailRow
              icon={<IconMail className="size-4" />}
              label="E-Mail"
              value={inquiry.customerEmail}
            />
            <DetailRow
              icon={<IconPhone className="size-4" />}
              label="Telefon"
              value={inquiry.customerPhone ?? "–"}
            />
            <DetailRow
              icon={<IconBriefcase className="size-4" />}
              label="Kundentyp"
              value={
                inquiry.customerType === "BUSINESS"
                  ? "Firmenkunde"
                  : "Privatkunde"
              }
            />
          </div>
        </div>

        {/* Event Info */}
        <div className="rounded-xl border border-white/[0.10] bg-card p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
            Event-Details
          </h3>
          <div className="space-y-3">
            <DetailRow
              icon={<IconConfetti className="size-4" />}
              label="Eventart"
              value={inquiry.eventType}
            />
            <DetailRow
              icon={<IconCalendar className="size-4" />}
              label="Datum"
              value={formattedEventDate}
            />
            <DetailRow
              icon={<IconMapPin className="size-4" />}
              label="Location"
              value={inquiry.locationName}
            />
            <DetailRow
              icon={<IconMapPin className="size-4" />}
              label="Adresse"
              value={inquiry.locationAddress}
            />
            {inquiry.distanceKm != null && (
              <DetailRow
                icon={<IconRuler className="size-4" />}
                label="Entfernung"
                value={`${inquiry.distanceKm} km`}
              />
            )}
          </div>
        </div>

        {/* Extras */}
        {inquiry.extras.length > 0 && (
          <div className="rounded-xl border border-white/[0.10] bg-card p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Gebuchte Extras
            </h3>
            <div className="flex flex-wrap gap-2">
              {inquiry.extras.map((extra) => (
                <Badge
                  key={extra}
                  variant="outline"
                  className="bg-[#F6A11C]/10 text-[#F6A11C] border-[#F6A11C]/25"
                >
                  {extra}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        {inquiry.comments && (
          <div className="rounded-xl border border-white/[0.10] bg-card p-5">
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Kommentare
            </h3>
            <div className="flex items-start gap-2">
              <IconMessageCircle className="size-4 text-zinc-500 shrink-0 mt-0.5" />
              <p className="text-sm text-zinc-300 whitespace-pre-wrap">
                {inquiry.comments}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-zinc-500 shrink-0">{icon}</span>
      <span className="text-xs text-zinc-500 w-20 shrink-0">{label}</span>
      <span className="text-sm font-medium text-zinc-200 truncate">
        {value}
      </span>
    </div>
  );
}
