import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IconLock } from "@tabler/icons-react";
import { CredentialsForm } from "./credentials-form";

export const dynamic = "force-dynamic";

export default async function EmailCredentialsPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  const keys = ["azure_tenant_id", "azure_client_id", "azure_client_secret", "mail_from"];
  const credentials: Record<string, string> = {};

  for (const key of keys) {
    try {
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      if (setting?.value) {
        credentials[key] = key === "azure_client_secret"
          ? "••••••••" + setting.value.slice(-4)
          : setting.value;
      } else {
        credentials[key] = "";
      }
    } catch {
      credentials[key] = "";
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-purple-500/10 text-purple-400 shrink-0">
          <IconLock className="size-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">E-Mail Zugangsdaten</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Microsoft Azure / Graph API Credentials für den E-Mail-Versand
          </p>
        </div>
      </div>

      <CredentialsForm initial={credentials} />
    </div>
  );
}
