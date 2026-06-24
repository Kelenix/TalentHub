"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/user";

const schema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  whatsappNumber: z.string().min(5),
  contactEmail: z.string().email(),
  description: z.string().optional(),
  countryIso: z.string().optional(),
  cityId: z.string().optional(),
  languages: z.string().optional(),
  photoUrl: z.string().url().optional().or(z.literal("")),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  tiktok: z.string().optional(),
});

export type ProfileInput = z.input<typeof schema>;

export async function updateProfileAction(
  input: ProfileInput,
): Promise<{ error?: string; success?: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Formulaire invalide." };
  const user = await getCurrentUser();
  if (!user) return { error: "Non autorisé." };

  const d = parsed.data;
  const country = d.countryIso
    ? await prisma.country.findUnique({ where: { iso: d.countryIso } })
    : null;
  const city = d.cityId
    ? await prisma.city.findUnique({ where: { id: d.cityId } })
    : null;
  const languages = d.languages
    ? d.languages.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  const social: Record<string, string> = {};
  if (d.instagram?.trim()) social.instagram = d.instagram.trim();
  if (d.facebook?.trim()) social.facebook = d.facebook.trim();
  if (d.tiktok?.trim()) social.tiktok = d.tiktok.trim();

  const fields = {
    firstName: d.firstName,
    lastName: d.lastName,
    whatsappNumber: d.whatsappNumber,
    contactEmail: d.contactEmail,
    description: d.description || null,
    countryOfOriginId: country?.id ?? null,
    cityId: city?.id ?? null,
    region: city?.region ?? null,
    languages,
    photoUrl: d.photoUrl || null,
    socialLinks: Object.keys(social).length ? social : Prisma.DbNull,
  };

  await prisma.providerProfile.upsert({
    where: { userId: user.id },
    update: fields,
    create: { userId: user.id, ...fields },
  });

  revalidatePath("/dashboard");
  return { success: true };
}
