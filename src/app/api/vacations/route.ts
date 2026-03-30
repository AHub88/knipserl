import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const createVacationSchema = z.object({
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  note: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const where =
    session.user.role === "DRIVER" ? { driverId: session.user.id } : {};

  const vacations = await prisma.vacation.findMany({
    where,
    orderBy: { startDate: "asc" },
    include: { driver: { select: { id: true, name: true } } },
  });

  return NextResponse.json(vacations);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createVacationSchema.parse(body);

    const driverId =
      session.user.role === "DRIVER" ? session.user.id : body.driverId;

    if (!driverId) {
      return NextResponse.json({ error: "Fahrer-ID erforderlich" }, { status: 400 });
    }

    const vacation = await prisma.vacation.create({
      data: {
        driverId,
        startDate: data.startDate,
        endDate: data.endDate,
        note: data.note,
      },
    });

    return NextResponse.json(vacation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Interner Serverfehler" }, { status: 500 });
  }
}
