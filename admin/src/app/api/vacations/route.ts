import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

const createVacationSchema = z.object({
  startDate: z.string().transform((s) => new Date(s)),
  endDate: z.string().transform((s) => new Date(s)),
  note: z.string().optional(),
  type: z.enum(["ABSENT", "LIMITED"]).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const where =
      session.user.role === "DRIVER" ? { driverId: session.user.id } : {};

    const vacations = await prisma.vacation.findMany({
      where,
      orderBy: { startDate: "asc" },
      include: { driver: { select: { id: true, name: true } } },
    });

    return NextResponse.json(vacations);
  } catch (error) {
    console.error("[vacations GET]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = createVacationSchema.parse(body);

    // Use provided driverId, or impersonated driver, or self
    let driverId = body.driverId || session.user.id;

    // If admin is impersonating a driver via cookie
    if (session.user.role === "ADMIN" && !body.driverId) {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const impersonateId = cookieStore.get("impersonateDriverId")?.value;
      if (impersonateId) driverId = impersonateId;
    }

    const vacation = await prisma.vacation.create({
      data: {
        driverId,
        type: data.type ?? "ABSENT",
        startDate: data.startDate,
        endDate: data.endDate,
        note: data.note,
      },
    });

    return NextResponse.json(vacation, { status: 201 });
  } catch (error) {
    console.error("[vacations POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validierungsfehler", details: error.issues },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
