import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { OrderActions } from "./order-actions";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      driver: true,
      company: true,
      inquiry: true,
    },
  });

  if (!order) notFound();

  // Hide cash orders from accounting admin
  if (session?.user?.role === "ADMIN_ACCOUNTING" && order.paymentMethod === "CASH") {
    notFound();
  }

  const drivers = await prisma.user.findMany({
    where: { role: "DRIVER", active: true },
    orderBy: { name: "asc" },
  });

  const statusColors: Record<string, string> = {
    OPEN: "bg-yellow-100 text-yellow-800",
    ASSIGNED: "bg-blue-100 text-blue-800",
    COMPLETED: "bg-green-100 text-green-800",
    CANCELLED: "bg-red-100 text-red-800",
  };

  const statusLabels: Record<string, string> = {
    OPEN: "Offen",
    ASSIGNED: "Zugewiesen",
    COMPLETED: "Abgeschlossen",
    CANCELLED: "Storniert",
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            Auftrag #{order.orderNumber}
          </h1>
          <p className="text-muted-foreground">
            {order.customerName} · {order.eventType}
          </p>
        </div>
        <Badge className={statusColors[order.status] ?? ""}>
          {statusLabels[order.status] ?? order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Kundendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Name" value={order.customerName} />
            <DetailRow label="E-Mail" value={order.customerEmail} />
            <DetailRow label="Telefon" value={order.customerPhone ?? "–"} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Event-Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Eventart" value={order.eventType} />
            <DetailRow
              label="Datum"
              value={new Date(order.eventDate).toLocaleDateString("de-DE", {
                weekday: "long",
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            />
            <DetailRow label="Location" value={order.locationName} />
            <DetailRow label="Adresse" value={order.locationAddress} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Auftragsdaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow label="Firma" value={order.company.name} />
            <DetailRow label="Preis" value={`${order.price.toFixed(2)} €`} />
            <DetailRow
              label="Zahlart"
              value={order.paymentMethod === "CASH" ? "Bar" : "Rechnung"}
            />
            <DetailRow
              label="Fahrer"
              value={order.driver?.name ?? "Nicht zugewiesen"}
            />
          </CardContent>
        </Card>

        {order.extras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Extras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {order.extras.map((extra) => (
                  <Badge key={extra} variant="secondary">
                    {extra}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {order.notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notizen</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {(session?.user?.role === "ADMIN" || session?.user?.role === "ADMIN_ACCOUNTING") && (
        <>
          <Separator />
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentDriverId={order.driverId}
            drivers={drivers.map((d) => ({ id: d.id, name: d.name }))}
          />
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
