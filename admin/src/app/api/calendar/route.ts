import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getPaymentFilter } from "@/lib/view-mode";

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

  try {
    const paymentFilter = await getPaymentFilter(session.user.role ?? "");

    const orders = await prisma.order.findMany({
      where: {
        eventDate: { gte: startOfMonth, lte: endOfMonth },
        ...paymentFilter,
      },
      include: { driver: { select: { id: true, name: true, initials: true } } },
      orderBy: { eventDate: "asc" },
    });

    // Vacations query - gracefully handle if table doesn't exist
    let vacations: unknown[] = [];
    try {
      vacations = await prisma.vacation.findMany({
        where: {
          OR: [
            { startDate: { gte: startOfMonth, lte: endOfMonth } },
            { endDate: { gte: startOfMonth, lte: endOfMonth } },
            { startDate: { lte: startOfMonth }, endDate: { gte: endOfMonth } },
          ],
        },
        include: { driver: { select: { id: true, name: true } } },
      });
    } catch {
      // vacations table might not exist yet - continue without
      vacations = [];
    }

    return NextResponse.json({ orders, vacations });
  } catch (error) {
    console.error("[calendar API]", error);
    return NextResponse.json(
      { error: "Interner Fehler", detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
