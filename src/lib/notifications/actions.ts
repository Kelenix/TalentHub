"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

export async function markNotificationRead(id: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const where =
    user.role === "ADMIN"
      ? { id, forAdmin: true }
      : { id, userId: user.id };
  await prisma.notification.updateMany({ where, data: { read: true } });
  revalidatePath(
    user.role === "ADMIN" ? "/admin/notifications" : "/dashboard/notifications",
  );
}

export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const where =
    user.role === "ADMIN"
      ? { forAdmin: true, read: false }
      : { userId: user.id, read: false };
  await prisma.notification.updateMany({ where, data: { read: true } });
  revalidatePath(
    user.role === "ADMIN" ? "/admin/notifications" : "/dashboard/notifications",
  );
}
