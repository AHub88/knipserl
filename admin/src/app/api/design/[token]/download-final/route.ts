import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import sharp from "sharp";

// GET /api/design/[token]/download-final
// Liefert das finale Layout-PNG für den Admin-Download.
// Bei Format "2x6" (5×15 cm Fotostreifen) wird das Quell-PNG zu einem
// 10×15 cm Hochformat-Ausdruck verdoppelt: zwei identische Streifen
// nebeneinander — damit ein Standard-10×15-Drucker den Ausdruck ausspuckt,
// der dann in der Mitte geschnitten = zwei Streifen für den Kunden ergibt.
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const session = await auth();
  if (!session?.user || session.user.role === "DRIVER") {
    return NextResponse.json({ error: "Keine Berechtigung" }, { status: 403 });
  }

  const { token } = await params;

  const ld = await prisma.layoutDesign.findUnique({ where: { token } });
  if (!ld) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const order = await prisma.order.findUnique({
    where: { id: ld.orderId },
    select: { id: true, orderNumber: true },
  });
  if (!order) return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });

  const filePath = path.join(process.cwd(), "uploads", order.id, "layout-final.png");
  let input: Buffer;
  try {
    input = await readFile(filePath);
  } catch {
    return NextResponse.json({ error: "Layout-PNG nicht gefunden" }, { status: 404 });
  }

  let output: Buffer;
  const filename = `layout-${order.orderNumber}.png`;

  if (ld.format === "2x6") {
    // Streifen-Auflösung: aus dem Quell-PNG ermitteln (robust gegen Skalierungen).
    const meta = await sharp(input).metadata();
    const stripW = meta.width ?? 600;
    const stripH = meta.height ?? 1800;

    // Ziel: zwei Streifen nebeneinander, vollflächig auf 10×15 cm Hochformat.
    // Canvas-Breite = 2 × Streifen-Breite, Höhe = Streifen-Höhe.
    output = await sharp({
      create: {
        width: stripW * 2,
        height: stripH,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input, left: 0, top: 0 },
        { input, left: stripW, top: 0 },
      ])
      .png()
      .toBuffer();
  } else {
    // 4x6 (10×15 quer): unverändert ausliefern.
    output = input;
  }

  return new NextResponse(new Uint8Array(output), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
