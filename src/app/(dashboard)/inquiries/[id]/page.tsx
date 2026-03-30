import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InquiryActions } from "./inquiry-actions";

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

  const statusMap: Record<string, { label: string; color: string }> = {
    NEW: { label: "Neu", color: "bg-blue-100 text-blue-800" },
    ACCEPTED: { label: "Angenommen", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Abgelehnt", color: "bg-red-100 text-red-800" },
  };

  const status = statusMap[inquiry.status] ?? statusMap.NEW;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Anfrage von {inquiry.customerName}</h1>
          <p className="text-muted-foreground">
            Eingegangen am{" "}
            {new Date(inquiry.createdAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <Badge className={status.color}>{status.label}</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kundendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Name" value={inquiry.customerName} />
            <DetailRow label="E-Mail" value={inquiry.customerEmail} />
            <DetailRow label="Telefon" value={inquiry.customerPhone ?? "–"} />
            <DetailRow
              label="Kundentyp"
              value={inquiry.customerType === "BUSINESS" ? "Firmenkunde" : "Privatkunde"}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Eventart" value={inquiry.eventType} />
            <DetailRow
              label="Datum"
              value={new Date(inquiry.eventDate).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
            <DetailRow label="Location" value={inquiry.locationName} />
            <DetailRow label="Adresse" value={inquiry.locationAddress} />
            {inquiry.distanceKm != null && (
              <DetailRow label="Entfernung" value={`${inquiry.distanceKm} km`} />
            )}
          </CardContent>
        </Card>

        {inquiry.extras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Gebuchte Extras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {inquiry.extras.map((extra) => (
                  <Badge key={extra} variant="secondary">
                    {extra}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {inquiry.comments && (
          <Card>
            <CardHeader>
              <CardTitle>Kommentare</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{inquiry.comments}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {inquiry.order && (
        <>
          <Separator />
          <Card>
            <CardHeader>
              <CardTitle>Auftrag #{inquiry.order.orderNumber}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow label="Firma" value={inquiry.order.company.name} />
              <DetailRow label="Preis" value={`${inquiry.order.price.toFixed(2)} €`} />
              <DetailRow
                label="Zahlart"
                value={inquiry.order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
              />
              <DetailRow
                label="Fahrer"
                value={inquiry.order.driver?.name ?? "Noch nicht zugewiesen"}
              />
              <DetailRow label="Status" value={inquiry.order.status} />
            </CardContent>
          </Card>
        </>
      )}

      {inquiry.status === "NEW" && (
        <>
          <Separator />
          <InquiryActions inquiryId={inquiry.id} customerType={inquiry.customerType} />
        </>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}
