import { prisma } from "@/lib/db";
import { DesignPageClient } from "./design-page-client";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function DesignPage({ params }: Props) {
  const { token } = await params;

  let layoutDesign: any = null;
  let order: any = null;

  try {
    layoutDesign = await prisma.layoutDesign.findUnique({ where: { token } });
    if (layoutDesign) {
      order = await prisma.order.findUnique({
        where: { id: layoutDesign.orderId },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          eventType: true,
          eventDate: true,
          locationName: true,
          designReady: true,
          graphicUrl: true,
        },
      });
    }
  } catch {
    // DB error - treat as not found
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Link ungültig</h1>
          <p className="text-white/60">
            Dieser Design-Link ist ungültig oder abgelaufen.
          </p>
        </div>
      </div>
    );
  }

  if (order.designReady) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-white">Design bereits abgesendet</h1>
          <p className="text-white/60">
            Das Layout für Bestellung #{order.orderNumber} wurde bereits eingereicht.
          </p>
          {order.graphicUrl && (
            <img
              src={order.graphicUrl}
              alt="Fertiges Layout"
              className="max-w-xs mx-auto rounded-lg border border-white/10"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <DesignPageClient
      token={token}
      order={order}
      layoutDesign={{
        canvasJson: layoutDesign.canvasJson,
        submitted: layoutDesign.submitted,
        format: layoutDesign.format,
      }}
    />
  );
}
