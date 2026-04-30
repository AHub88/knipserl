import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { IconMail } from "@tabler/icons-react";
import { EmailTemplateEditor } from "./email-template-editor";
import { isEmailConfigured } from "@/lib/email";
import { DEFAULT_INQUIRY_TEMPLATES } from "@/lib/inquiry-email";

export const dynamic = "force-dynamic";

const DEFAULT_TEMPLATES = DEFAULT_INQUIRY_TEMPLATES;

export default async function EmailTemplatesPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;

  const emailConfigured = await isEmailConfigured();

  const templates: Record<string, { subject: string; body: string }> = {};
  for (const key of Object.keys(DEFAULT_TEMPLATES)) {
    try {
      const setting = await prisma.appSetting.findUnique({ where: { key } });
      templates[key] = setting ? JSON.parse(setting.value) : DEFAULT_TEMPLATES[key];
    } catch {
      templates[key] = DEFAULT_TEMPLATES[key];
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary shrink-0">
          <IconMail className="size-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">E-Mail Templates</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Automatische E-Mails bei Anfrage-Zusage und -Absage
          </p>
        </div>
      </div>

      {!emailConfigured && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
          <p className="text-sm text-amber-400 font-medium">E-Mail nicht konfiguriert</p>
          <p className="text-xs text-amber-400/70 mt-1">
            AZURE_TENANT_ID, AZURE_CLIENT_ID und AZURE_CLIENT_SECRET müssen als Umgebungsvariablen gesetzt werden.
          </p>
        </div>
      )}

      <EmailTemplateEditor
        templates={templates}
        variables={["customerName", "customerEmail", "eventType", "eventDate", "locationName", "companyName"]}
      />
    </div>
  );
}
