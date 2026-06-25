import { prisma } from "@/lib/prisma";

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getAdminNotifications(take = 40) {
  if (!dbReady()) return [];
  return prisma.notification.findMany({
    where: { forAdmin: true },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getAdminUnreadCount() {
  if (!dbReady()) return 0;
  return prisma.notification.count({ where: { forAdmin: true, read: false } });
}

export async function getUserNotifications(userId: string, take = 40) {
  if (!dbReady()) return [];
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take,
  });
}

export async function getUserUnreadCount(userId: string) {
  if (!dbReady()) return 0;
  return prisma.notification.count({ where: { userId, read: false } });
}
