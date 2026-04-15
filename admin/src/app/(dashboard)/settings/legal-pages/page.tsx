import { prisma } from "@/lib/db";
import Link from "next/link";
import { IconChevronLeft, IconFileText } from "@tabler/icons-react";
import { LegalPagesEditor } from "./legal-pages-editor";

export default async function LegalPagesSettingsPage() {
  const settings = await prisma.appSetting.findMany({
    where: { key: { in: ["legal_impressum_html", "legal_datenschutz_html"] } },
  });
  const map: Record<string, string> = {};
  for (const s of settings) map[s.key] = s.value;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/settings" className="flex items-center gap-1 hover:text-zinc-300 transition-colors">
          <IconChevronLeft className="size-3.5" />
          Einstellungen
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-[#F6A11C]/10 text-[#F6A11C]">
          <IconFileText className="size-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Rechtliche Seiten
          </h1>
          <p className="text-sm text-muted-foreground">
            Impressum und Datenschutzerkl&auml;rung als HTML pflegen
          </p>
        </div>
      </div>

      <LegalPagesEditor
        initialImpressum={map.legal_impressum_html ?? ""}
        initialDatenschutz={map.legal_datenschutz_html ?? ""}
      />
    </div>
  );
}
