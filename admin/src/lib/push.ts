import webpush from "web-push";
import { prisma } from "@/lib/db";

const publicKey = process.env.VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT ?? "mailto:info@knipserl.de";

let configured = false;
function configure() {
  if (configured) return true;
  if (!publicKey || !privateKey) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
  return true;
}

export function getPublicVapidKey(): string | null {
  return publicKey ?? null;
}

export function isPushConfigured(): boolean {
  return !!publicKey && !!privateKey;
}

export type PushPayload = {
  title: string;
  body: string;
  url?: string;
  tag?: string;
};

export type PushResult = {
  sent: number;
  removed: number;
  failed: number;
};

export async function sendPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<PushResult> {
  if (!configure()) {
    throw new Error("VAPID keys missing — VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY in env setzen");
  }

  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  const body = JSON.stringify(payload);

  let sent = 0;
  let removed = 0;
  let failed = 0;

  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: s.endpoint,
            keys: { p256dh: s.p256dh, auth: s.auth },
          },
          body,
        );
        sent++;
      } catch (err) {
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
          removed++;
        } else {
          failed++;
          console.error("[push] send failed", { endpoint: s.endpoint, statusCode, err });
        }
      }
    }),
  );

  return { sent, removed, failed };
}
