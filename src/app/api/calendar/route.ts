import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") ?? new Date().getFullYear().toString());
  const month = parseInt(searchParams.get("month") ?? (new Date().getMonth() + 1).toString());

  const startOfMonth = new Date(year, month - 1, 1);
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);

  const isAccountingAdmin = session.user.role === "ADMIN_ACCOUNTING";

  const [orders, vacations] = await Promise.all([
    prisma.order.findMany({
      where: {
        eventDate: { gte: startOfMonth, lte: endOfMonth },
        ...(isAccountingAdmin ? { paymentMethod: "INVOICE" } : {}),
      },
      include: { driver: { select: { id: true, name: true } } },
      orderBy: { eventDate: "asc" },
    }),
    prisma.vacation.findMany({
      where: {
        OR: [
          { startDate: { gte: startOfMonth, lte: endOfMonth } },
          { endDate: { gte: startOfMonth, lte: endOfMonth } },
          { startDate: { lte: startOfMonth }, endDate: { gte: endOfMonth } },
        ],
      },
      include: { driver: { select: { id: true, name: true } } },
    }),
  ]);

  return NextResponse.json({ orders, vacations });
}
