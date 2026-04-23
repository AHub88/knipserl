import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  IconMapPin,
  IconCalendar,
  IconCalendarEvent,
  IconUser,
  IconPhone,
  IconMail,
  IconExternalLink,
  IconStar,
  IconNotes,
} from "@tabler/icons-react";

export default async function DriverOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { company: { select: { id: true, name: true } } },
  });

  if (!order) notFound();
  if (order.driverId !== session!.user.id) notFound();

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.locationAddress)}`;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">Auftrag #{order.orderNumber}</h1>
        <div className="mt-1 flex items-center gap-2">
          <Badge variant="secondary">{order.eventType}</Badge>
          <Badge variant={order.status === "COMPLETED" ? "outline" : "default"}>
            {order.status === "ASSIGNED" ? "Zugewiesen" : "Abgeschlossen"}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconCalendarEvent className="size-4 text-primary" />
          <CardTitle className="text-base">Event</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <IconCalendar className="h-4 w-4 text-muted-foreground" />
            {new Date(order.eventDate).toLocaleDateString("de-DE", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </div>
          <div className="flex items-start gap-2 text-sm">
            <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div>
              <div className="font-medium">{order.locationName}</div>
              <div className="text-muted-foreground">{order.locationAddress}</div>
            </div>
          </div>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <IconExternalLink className="h-4 w-4" />
            Route in Google Maps
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b flex-row items-center gap-2">
          <IconUser className="size-4 text-primary" />
          <CardTitle className="text-base">Kunde</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <IconUser className="h-4 w-4 text-muted-foreground" />
            {order.customerName}
          </div>
          <div className="flex items-center gap-2 text-sm">
            <IconMail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${order.customerEmail}`} className="underline">
              {order.customerEmail}
            </a>
          </div>
          {order.customerPhone && (
            <div className="flex items-center gap-2 text-sm">
              <IconPhone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${order.customerPhone}`} className="underline">
                {order.customerPhone}
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {order.extras.length > 0 && (
        <Card>
          <CardHeader className="border-b flex-row items-center gap-2">
            <IconStar className="size-4 text-primary" />
            <CardTitle className="text-base">Extras</CardTitle>
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
        <Card>
          <CardHeader className="border-b flex-row items-center gap-2">
            <IconNotes className="size-4 text-primary" />
            <CardTitle className="text-base">Notizen</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{order.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
