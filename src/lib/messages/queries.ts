import { prisma } from "@/lib/prisma";

const participantSelect = {
  id: true,
  profile: { select: { firstName: true, lastName: true, photoUrl: true } },
} as const;

function displayName(profile: { firstName: string; lastName: string } | null) {
  return profile ? `${profile.firstName} ${profile.lastName}` : "Membre";
}

/** Liste des fils de l'utilisateur, le plus récent en tête, avec aperçu + non-lus. */
export async function getConversationsForUser(userId: string) {
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ participantAId: userId }, { participantBId: userId }] },
    orderBy: { updatedAt: "desc" },
    include: {
      participantA: { select: participantSelect },
      participantB: { select: participantSelect },
      listing: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
      _count: {
        select: {
          messages: { where: { senderId: { not: userId }, readAt: null } },
        },
      },
    },
  });

  return conversations.map((c) => {
    const other = c.participantAId === userId ? c.participantB : c.participantA;
    return {
      id: c.id,
      other: {
        id: other.id,
        name: displayName(other.profile),
        photoUrl: other.profile?.photoUrl ?? null,
      },
      listing: c.listing,
      lastMessage: c.messages[0] ?? null,
      unread: c._count.messages,
      updatedAt: c.updatedAt,
    };
  });
}

/** Un fil précis (messages dans l'ordre chronologique) — null si non-participant. */
export async function getConversation(id: string, userId: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participantA: { select: participantSelect },
      participantB: { select: participantSelect },
      listing: { select: { id: true, title: true } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conv || (conv.participantAId !== userId && conv.participantBId !== userId))
    return null;

  const other = conv.participantAId === userId ? conv.participantB : conv.participantA;
  return {
    id: conv.id,
    other: {
      id: other.id,
      name: displayName(other.profile),
      photoUrl: other.profile?.photoUrl ?? null,
    },
    listing: conv.listing,
    messages: conv.messages.map((m) => ({
      id: m.id,
      body: m.body,
      mine: m.senderId === userId,
      createdAt: m.createdAt,
    })),
  };
}

/** Nombre total de messages non lus de l'utilisateur (badge sidebar). */
export async function getUnreadMessageCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      senderId: { not: userId },
      readAt: null,
      conversation: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
    },
  });
}
