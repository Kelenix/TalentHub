"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";
import { notifyAdmins } from "@/lib/notifications/service";

const photoSchema = z.object({ url: z.string().url(), isCover: z.boolean() });

const listingSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2),
  description: z.string().min(10),
  categorySlug: z.string().min(1),
  subcategorySlug: z.string().optional(),
  cityId: z.string().optional(),
  countryIso: z.string().optional(),
  serviceZone: z.string().optional(),
  availability: z.enum(["AVAILABLE", "UNAVAILABLE"]),
  status: z.enum(["DRAFT", "PUBLISHED"]),
  preparationTime: z.string().optional(),
  dishOrigin: z.string().optional(),
  hairstyleType: z.string().optional(),
  photos: z.array(photoSchema).default([]),
});

export type ListingInput = z.input<typeof listingSchema>;
export type ListingResult = { error?: string; id?: string };

function buildAttributes(
  categorySlug: string,
  preparationTime?: string,
  dishOrigin?: string,
  hairstyleType?: string,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const a: Record<string, string> = {};
  if (preparationTime) a.preparationTime = preparationTime;
  if (categorySlug === "cuisine" && dishOrigin) a.dishOrigin = dishOrigin;
  if (categorySlug === "beaute" && hairstyleType)
    a.hairstyleType = hairstyleType;
  return Object.keys(a).length ? a : Prisma.DbNull;
}

export async function saveListingAction(
  input: ListingInput,
): Promise<ListingResult> {
  const parsed = listingSchema.safeParse(input);
  if (!parsed.success) return { error: "Formulaire invalide." };
  const data = parsed.data;

  const user = await getCurrentUser();
  if (!user?.profile) return { error: "Non autorisé." };

  const category = await prisma.category.findUnique({
    where: { slug: data.categorySlug },
  });
  if (!category) return { error: "Catégorie inconnue." };

  const subcategory = data.subcategorySlug
    ? await prisma.subcategory.findFirst({
        where: { categoryId: category.id, slug: data.subcategorySlug },
      })
    : null;
  const country = data.countryIso
    ? await prisma.country.findUnique({ where: { iso: data.countryIso } })
    : null;

  const attributes = buildAttributes(
    category.slug,
    data.preparationTime,
    data.dishOrigin,
    data.hairstyleType,
  );
  const publishedAt = data.status === "PUBLISHED" ? new Date() : null;

  const common = {
    title: data.title,
    description: data.description,
    categoryId: category.id,
    subcategoryId: subcategory?.id ?? null,
    countryOfOriginId: country?.id ?? null,
    cityId: data.cityId || null,
    serviceZone: data.serviceZone || null,
    availability: data.availability,
    status: data.status,
    attributes,
  };

  if (data.id) {
    const existing = await prisma.listing.findFirst({
      where: { id: data.id, providerId: user.profile.id },
      select: { id: true, publishedAt: true },
    });
    if (!existing) return { error: "Annonce introuvable." };

    await prisma.listing.update({
      where: { id: data.id },
      data: {
        ...common,
        // ne pas écraser une date de publication existante
        publishedAt: existing.publishedAt ?? publishedAt,
      },
    });
    await prisma.listingPhoto.deleteMany({ where: { listingId: data.id } });
    if (data.photos.length) {
      await prisma.listingPhoto.createMany({
        data: data.photos.map((p, i) => ({
          listingId: data.id!,
          url: p.url,
          order: i,
          isCover: p.isCover,
        })),
      });
    }
    revalidatePath("/dashboard");
    return { id: data.id };
  }

  const created = await prisma.listing.create({
    data: {
      ...common,
      providerId: user.profile.id,
      publishedAt,
      photos: {
        create: data.photos.map((p, i) => ({
          url: p.url,
          order: i,
          isCover: p.isCover,
        })),
      },
    },
  });
  if (data.status === "PUBLISHED") {
    await notifyAdmins({
      type: "NEW_LISTING",
      title: "Nouvelle annonce publiée",
      body: `« ${data.title} » par ${user.profile.firstName} ${user.profile.lastName}`,
      link: "/admin/annonces",
    });
  }
  revalidatePath("/dashboard");
  return { id: created.id };
}

export async function setAvailabilityAction(
  id: string,
  availability: "AVAILABLE" | "UNAVAILABLE",
): Promise<ListingResult> {
  const user = await getCurrentUser();
  if (!user?.profile) return { error: "Non autorisé." };
  const result = await prisma.listing.updateMany({
    where: { id, providerId: user.profile.id },
    data: { availability },
  });
  if (result.count === 0) return { error: "Annonce introuvable." };
  revalidatePath("/dashboard");
  return { id };
}

export async function deleteListingAction(id: string): Promise<ListingResult> {
  const user = await getCurrentUser();
  if (!user?.profile) return { error: "Non autorisé." };
  const result = await prisma.listing.deleteMany({
    where: { id, providerId: user.profile.id },
  });
  if (result.count === 0) return { error: "Annonce introuvable." };
  revalidatePath("/dashboard");
  return { id };
}
