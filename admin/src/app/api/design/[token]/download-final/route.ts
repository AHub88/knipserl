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

  // Zielauflösung bei 300 dpi:
  //   5×15 cm Streifen = 600×1800 px (ein Streifen)
  //   10×15 cm Quer    = 1800×1200 px
  //   10×15 cm Hoch (verdoppelter Streifen) = 1200×1800 px (zwei Streifen à 600 px)
  // Das Quell-PNG kann je nach Browser-DPR kleiner exportiert worden sein
  // (Fabric's toDataURL-Retina-Workaround halbiert bei dpr=2). Daher immer
  // auf die Soll-Größe hochskalieren, bevor wir zusammenbauen.
  if (ld.format === "2x6") {
    const STRIP_W = 600;
    const STRIP_H = 1800;

    const resizedStrip = await sharp(input)
      .resize(STRIP_W, STRIP_H, { fit: "fill" })
      .png()
      .toBuffer();

    output = await sharp({
      create: {
        width: STRIP_W * 2,
        height: STRIP_H,
        channels: 4,
        background: { r: 255, g: 255, b: 255, alpha: 1 },
      },
    })
      .composite([
        { input: resizedStrip, left: 0, top: 0 },
        { input: resizedStrip, left: STRIP_W, top: 0 },
      ])
      .png()
      .toBuffer();
  } else {
    // 4x6 (10×15 quer): auf exakt 1800×1200 px normalisieren.
    output = await sharp(input)
      .resize(1800, 1200, { fit: "fill" })
      .png()
      .toBuffer();
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
