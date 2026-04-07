import { prisma } from "@/lib/db";
import { IconTypography } from "@tabler/icons-react";
import { CustomFontsManager } from "./custom-fonts-manager";

export default async function DesignFontsPage() {
  const fonts = await prisma.customFont.findMany({
    where: { active: true },
    orderBy: [{ family: "asc" }, { weight: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconTypography className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Eigene Schriften
          </h1>
          <p className="text-sm text-muted-foreground">
            Eigene Schriftarten hochladen und im Layout-Editor verwenden
          </p>
        </div>
      </div>

      <CustomFontsManager initialFonts={JSON.parse(JSON.stringify(fonts))} />
    </div>
  );
}
