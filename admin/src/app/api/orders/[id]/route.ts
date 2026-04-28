import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { shouldHideCashOrders } from "@/lib/view-mode";
import {
  loadDriverBonusPrices,
  computeDriverBonusBreakdown,
} from "@/lib/driver-compensation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      driver: true,
      secondDriver: true,
      company: { select: { id: true, name: true } },
      inquiry: { select: { id: true, distanceKm: true } },
      quotes: true,
      invoices: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Auftrag nicht gefunden" }, { status: 404 });
  }

  const hideCash = await shouldHideCashOrders(session.user.role ?? "");
  if (hideCash && order.paymentMethod === "CASH") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  // Handle "self" claim — driver or admin impersonating
  if (body.driverId === "self") {
    let claimDriverId = session.user.id;
    if (session.user.role === "ADMIN") {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const impersonateId = cookieStore.get("impersonateDriverId")?.value;
      if (impersonateId) claimDriverId = impersonateId;
    }
    const order = await prisma.order.update({
      where: { id },
      data: { driverId: claimDriverId, status: "ASSIGNED" },
    });
    return NextResponse.json(order);
  }

  // Drivers: self-claim ODER internalNotes auf eigenen Aufträgen bearbeiten
  if (session.user.role === "DRIVER") {
    const current = await prisma.order.findUnique({
      where: { id },
      select: { driverId: true, secondDriverId: true },
    });
    const isAssigned =
      current != null &&
      (current.driverId === session.user.id || current.secondDriverId === session.user.id);

    // Self-claim
    if (body.driverId !== undefined) {
      if (body.driverId && body.driverId !== session.user.id) {
        return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
      }
      const order = await prisma.order.update({
        where: { id },
        data: { driverId: session.user.id, status: "ASSIGNED" },
      });
      return NextResponse.json(order);
    }

    // Internen Kommentar auf zugewiesenem Auftrag bearbeiten
    if (body.internalNotes !== undefined && isAssigned) {
      const order = await prisma.order.update({
        where: { id },
        data: { internalNotes: body.internalNotes || null },
      });
      return NextResponse.json(order);
    }

    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  // Admins can update everything
  const data: Record<string, unknown> = {};

  // Basic fields
  if (body.driverId !== undefined) data.driverId = body.driverId || null;
  if (body.secondDriverId !== undefined) data.secondDriverId = body.secondDriverId || null;
  if (body.status) data.status = body.status;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.paymentMethod) data.paymentMethod = body.paymentMethod;
  if (body.notes !== undefined) data.notes = body.notes || null;
  if (body.internalNotes !== undefined) data.internalNotes = body.internalNotes || null;

  // Customer & event
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.customerPhone !== undefined) data.customerPhone = body.customerPhone || null;
  if (body.eventType !== undefined) data.eventType = body.eventType;
  if (body.eventDate !== undefined) data.eventDate = new Date(body.eventDate);
  if (body.locationName !== undefined) data.locationName = body.locationName;
  if (body.locationAddress !== undefined) data.locationAddress = body.locationAddress;
  if (body.distanceKm !== undefined) data.distanceKm = body.distanceKm != null && body.distanceKm !== "" ? Number(body.distanceKm) : null;

  // Lieferung / Aufbau & Abbau
  if (body.setupDate !== undefined) data.setupDate = body.setupDate ? new Date(body.setupDate) : null;
  if (body.setupTime !== undefined) data.setupTime = body.setupTime || null;
  if (body.teardownDate !== undefined) data.teardownDate = body.teardownDate ? new Date(body.teardownDate) : null;
  if (body.teardownTime !== undefined) data.teardownTime = body.teardownTime || null;

  // Ansprechpartner vor Ort
  if (body.onSiteContactName !== undefined) data.onSiteContactName = body.onSiteContactName || null;
  if (body.onSiteContactPhone !== undefined) data.onSiteContactPhone = body.onSiteContactPhone || null;
  if (body.onSiteContactNotes !== undefined) data.onSiteContactNotes = body.onSiteContactNotes || null;

  // Extra Papierrollen (Anzahl)
  if (body.extraPaperRolls !== undefined) {
    const n = Number(body.extraPaperRolls);
    data.extraPaperRolls = Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
  }

  // Pricing
  if (body.travelCost !== undefined) data.travelCost = body.travelCost != null ? Number(body.travelCost) : null;
  if (body.boxPrice !== undefined) data.boxPrice = body.boxPrice != null ? Number(body.boxPrice) : null;
  if (body.extrasCost !== undefined) data.extrasCost = body.extrasCost != null ? Number(body.extrasCost) : null;
  if (body.setupCost !== undefined) data.setupCost = body.setupCost != null ? Number(body.setupCost) : null;
  if (body.materialCost !== undefined) data.materialCost = body.materialCost != null ? Number(body.materialCost) : null;
  if (body.discount !== undefined) data.discount = body.discount != null ? Number(body.discount) : null;
  if (body.discountType !== undefined) data.discountType = body.discountType || "AMOUNT";

  // Extras (bei Änderung: Bonus-Snapshot neu einfrieren)
  if (body.extras !== undefined) {
    data.extras = body.extras;
    const bonusPrices = await loadDriverBonusPrices();
    data.driverBonus = computeDriverBonusBreakdown(body.extras ?? [], bonusPrices);
  }

  // Status flags
  if (body.confirmed !== undefined) data.confirmed = body.confirmed;
  if (body.designReady !== undefined) data.designReady = body.designReady;
  if (body.planned !== undefined) data.planned = body.planned;
  if (body.paid !== undefined) data.paid = body.paid;

  // Company
  if (body.companyId !== undefined) data.companyId = body.companyId;

  // Auto-set completedAt
  if (body.status === "COMPLETED") data.completedAt = new Date();

  const order = await prisma.order.update({
    where: { id },
    data,
  });

  return NextResponse.json(order);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { id } = await params;

  // Reset linked inquiry back to NEW if exists
  await prisma.inquiry.updateMany({
    where: { order: { id } },
    data: { status: "NEW" },
  });

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
