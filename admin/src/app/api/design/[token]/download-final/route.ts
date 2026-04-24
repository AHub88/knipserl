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

  // Zielauflösung für den Fotoprint-Drucker: 3600×2400 px (Querformat),
  // DPI-Metadatum 72. Egal ob der Kunde einen 10×15-Quer oder einen
  // 5×15-Streifen gestaltet hat — der Drucker bekommt immer dasselbe
  // Querformat-Input-Format.
  const TARGET_W = 3600;
  const TARGET_H = 2400;
  const TARGET_DPI = 72;

  if (ld.format === "2x6") {
    // 5×15 cm Streifen → auf Soll-Streifengröße normalisieren, dann zwei
    // nebeneinander zu Hochformat (2400×3600), am Ende um 90° rotieren
    // → 3600×2400 Querformat für den Drucker.
    const STRIP_W = TARGET_H / 2;  // 1200 px
    const STRIP_H = TARGET_W;      // 3600 px

    const resizedStrip = await sharp(input)
      .resize(STRIP_W, STRIP_H, { fit: "fill" })
      .png()
      .toBuffer();

    const doubled = await sharp({
      create: {
        width: STRIP_W * 2, // 2400 px
        height: STRIP_H,    // 3600 px
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

    output = await sharp(doubled)
      .rotate(90)
      .withMetadata({ density: TARGET_DPI })
      .png()
      .toBuffer();
  } else {
    // 4x6 (10×15 quer): direkt auf Zielauflösung strecken.
    output = await sharp(input)
      .resize(TARGET_W, TARGET_H, { fit: "fill" })
      .withMetadata({ density: TARGET_DPI })
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
