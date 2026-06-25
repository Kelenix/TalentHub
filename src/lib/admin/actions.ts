"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";
import { slugify } from "@/lib/slug";
import { notifyUser } from "@/lib/notifications/service";

async function recipientEmail(userId: string): Promise<string | null> {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, profile: { select: { contactEmail: true } } },
  });
  return u?.profile?.contactEmail ?? u?.email ?? null;
}

type Result = { error?: string; ok?: boolean };

async function ensureAdmin(): Promise<Result | null> {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return { error: "Non autorisé." };
  return null;
}

// ── Utilisateurs ──
export async function setUserStatus(
  userId: string,
  status: "ACTIVE" | "SUSPENDED",
): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await prisma.user.update({ where: { id: userId }, data: { status } });
  const email = await recipientEmail(userId);
  if (status === "SUSPENDED") {
    await notifyUser(
      userId,
      {
        type: "ACCOUNT_SUSPENDED",
        title: "Compte suspendu",
        body: "Votre compte a été suspendu par l'administration. Contactez-nous pour plus d'informations.",
        link: "/dashboard",
      },
      email,
    );
  } else {
    await notifyUser(
      userId,
      {
        type: "ACCOUNT_REACTIVATED",
        title: "Compte réactivé",
        body: "Votre compte est de nouveau actif.",
        link: "/dashboard",
      },
      email,
    );
  }
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

export async function setProviderVerified(
  userId: string,
  verified: boolean,
): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await prisma.providerProfile.update({
    where: { userId },
    data: { verified },
  });
  if (verified) {
    await notifyUser(
      userId,
      {
        type: "PROFILE_VERIFIED",
        title: "Profil vérifié ✓",
        body: "Votre profil a été vérifié par l'administration. Le badge « vérifié » est désormais affiché sur vos annonces.",
        link: "/dashboard/profil",
      },
      await recipientEmail(userId),
    );
  }
  revalidatePath("/admin/utilisateurs");
  return { ok: true };
}

// ── Annonces ──
export async function setListingStatus(
  id: string,
  status: "PUBLISHED" | "SUSPENDED",
): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  const listing = await prisma.listing.update({
    where: { id },
    data: { status },
    select: {
      title: true,
      provider: { select: { userId: true, contactEmail: true } },
    },
  });
  if (status === "SUSPENDED") {
    await notifyUser(
      listing.provider.userId,
      {
        type: "LISTING_SUSPENDED",
        title: "Annonce suspendue",
        body: `Votre annonce « ${listing.title} » a été suspendue par la modération. Elle reste visible depuis votre tableau de bord — contactez l'administration pour toute justification.`,
        link: "/dashboard",
      },
      listing.provider.contactEmail,
    );
  } else {
    await notifyUser(
      listing.provider.userId,
      {
        type: "LISTING_REPUBLISHED",
        title: "Annonce republiée",
        body: `Votre annonce « ${listing.title} » est de nouveau visible publiquement.`,
        link: "/dashboard",
      },
      listing.provider.contactEmail,
    );
  }
  revalidatePath("/admin/annonces");
  return { ok: true };
}

export async function deleteListingAdmin(id: string): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await prisma.listing.delete({ where: { id } });
  revalidatePath("/admin/annonces");
  return { ok: true };
}

/** Pub sponsorisée : met en avant (ou retire) une annonce pour 30 jours. */
export async function setListingPromoted(
  id: string,
  promoted: boolean,
): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await prisma.listing.update({
    where: { id },
    data: {
      promoted,
      promotedUntil: promoted
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        : null,
    },
  });
  revalidatePath("/admin/annonces");
  return { ok: true };
}

// ── Catégories ──
const categorySchema = z.object({ name: z.string().min(2), icon: z.string().optional() });

export async function createCategory(input: {
  name: string;
  icon?: string;
}): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) return { error: "Nom invalide." };
  const count = await prisma.category.count();
  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: slugify(parsed.data.name),
      icon: parsed.data.icon ?? "wrench",
      order: count + 1,
    },
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  const used = await prisma.listing.count({ where: { categoryId: id } });
  if (used > 0)
    return { error: `Impossible : ${used} annonce(s) utilisent cette catégorie.` };
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function createSubcategory(input: {
  categoryId: string;
  name: string;
}): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  if (!input.name || input.name.length < 2) return { error: "Nom invalide." };
  const count = await prisma.subcategory.count({
    where: { categoryId: input.categoryId },
  });
  await prisma.subcategory.create({
    data: {
      categoryId: input.categoryId,
      name: input.name,
      slug: slugify(input.name),
      order: count + 1,
    },
  });
  revalidatePath("/admin/categories");
  return { ok: true };
}

export async function deleteSubcategory(id: string): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await prisma.subcategory.delete({ where: { id } });
  revalidatePath("/admin/categories");
  return { ok: true };
}

// ── Signalements ──
export async function setReportStatus(
  id: string,
  status: "OPEN" | "REVIEWED" | "CLOSED",
): Promise<Result> {
  const denied = await ensureAdmin();
  if (denied) return denied;
  await prisma.report.update({ where: { id }, data: { status } });
  revalidatePath("/admin/moderation");
  return { ok: true };
}
