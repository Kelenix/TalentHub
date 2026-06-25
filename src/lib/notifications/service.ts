import { prisma } from "@/lib/prisma";
import { sendEmail, emailLayout } from "@/lib/email";

type Payload = {
  type: string;
  title: string;
  body?: string;
  link?: string;
};

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

/** Notifie tous les administrateurs (une notification partagée `forAdmin`). */
export async function notifyAdmins(payload: Payload): Promise<void> {
  if (!dbReady()) return;
  try {
    await prisma.notification.create({ data: { forAdmin: true, ...payload } });
  } catch (e) {
    console.error("notifyAdmins error:", e);
  }
}

/**
 * Notifie un utilisateur précis (dashboard) et, si un email est fourni,
 * envoie aussi un email transactionnel.
 */
export async function notifyUser(
  userId: string,
  payload: Payload,
  email?: string | null,
): Promise<void> {
  if (!dbReady()) return;
  try {
    await prisma.notification.create({ data: { userId, ...payload } });
  } catch (e) {
    console.error("notifyUser error:", e);
  }
  if (email) {
    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const ctaUrl = payload.link ? `${site}${payload.link}` : site;
    await sendEmail(
      email,
      payload.title,
      emailLayout(payload.title, payload.body ?? payload.title, ctaUrl),
    );
  }
}
