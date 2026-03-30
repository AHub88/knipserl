import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const isAccountingAdmin = session.user.role === "ADMIN_ACCOUNTING";

  const orders = await prisma.order.findMany({
    where: isAccountingAdmin ? { paymentMethod: "INVOICE" } : {},
    orderBy: { eventDate: "desc" },
    include: {
      driver: true,
      company: true,
    },
  });

  return NextResponse.json(orders);
}
