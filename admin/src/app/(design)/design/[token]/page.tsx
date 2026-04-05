import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { LayoutEditorLoader as LayoutEditor } from "@/components/design-editor/layout-editor-loader";

type Props = {
  params: Promise<{ token: string }>;
};

export default async function DesignPage({ params }: Props) {
  const { token } = await params;

  let layoutDesign;
  try {
    layoutDesign = await prisma.layoutDesign.findUnique({
      where: { token },
      include: {
        order: {
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
        },
      },
    });
  } catch {
    // DB error - treat as not found
  }

  const order = layoutDesign?.order;

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
    <LayoutEditor
      orderId={order.id}
      token={token}
      orderInfo={{
        customerName: order.customerName,
        eventType: order.eventType,
        eventDate: order.eventDate
          ? new Date(order.eventDate).toLocaleDateString("de-AT")
          : "",
        locationName: order.locationName,
      }}
      existingDesign={{ canvasJson: layoutDesign!.canvasJson, submitted: layoutDesign!.submitted }}
    />
  );
}
