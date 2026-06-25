"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/user";
import { notifyUser } from "@/lib/notifications/service";

const bodySchema = z
  .string()
  .trim()
  .min(1, "Le message ne peut pas être vide.")
  .max(2000, "Message trop long (2000 caractères max).");

type Result = { ok?: boolean; error?: string; conversationId?: string };

/** Couple canonique : on stocke toujours (min, max) pour un fil unique par paire. */
function canonicalPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

/**
 * Envoie un message à un utilisateur. Crée le fil s'il n'existe pas encore.
 * Tout utilisateur connecté peut écrire à un prestataire (visiteurs : WhatsApp/email).
 */
export async function sendMessage(input: {
  recipientId: string;
  body: string;
  listingId?: string | null;
}): Promise<Result> {
  const me = await requireUser();

  const parsed = bodySchema.safeParse(input.body);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  if (input.recipientId === me.id)
    return { error: "Vous ne pouvez pas vous envoyer un message." };

  const recipient = await prisma.user.findUnique({
    where: { id: input.recipientId },
    select: {
      id: true,
      email: true,
      profile: { select: { firstName: true, lastName: true, contactEmail: true } },
    },
  });
  if (!recipient) return { error: "Destinataire introuvable." };

  const [a, b] = canonicalPair(me.id, recipient.id);
  const conversation = await prisma.conversation.upsert({
    where: { participantAId_participantBId: { participantAId: a, participantBId: b } },
    update: {
      updatedAt: new Date(),
      ...(input.listingId ? { listingId: input.listingId } : {}),
    },
    create: {
      participantAId: a,
      participantBId: b,
      listingId: input.listingId ?? null,
    },
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: me.id,
      body: parsed.data,
    },
  });

  const senderName = me.profile
    ? `${me.profile.firstName} ${me.profile.lastName}`
    : "Un membre";
  await notifyUser(
    recipient.id,
    {
      type: "NEW_MESSAGE",
      title: "Nouveau message",
      body: `${senderName} vous a envoyé un message sur TalentHub.`,
      link: `/dashboard/messages/${conversation.id}`,
    },
    recipient.profile?.contactEmail ?? recipient.email,
  );

  revalidatePath("/dashboard/messages");
  revalidatePath(`/dashboard/messages/${conversation.id}`);
  return { ok: true, conversationId: conversation.id };
}

/** Marque comme lus tous les messages reçus dans un fil. */
export async function markConversationRead(
  conversationId: string,
): Promise<Result> {
  const me = await requireUser();

  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    select: { participantAId: true, participantBId: true },
  });
  if (!conv || (conv.participantAId !== me.id && conv.participantBId !== me.id))
    return { error: "Conversation introuvable." };

  await prisma.message.updateMany({
    where: { conversationId, senderId: { not: me.id }, readAt: null },
    data: { readAt: new Date() },
  });

  revalidatePath("/dashboard/messages");
  return { ok: true };
}
