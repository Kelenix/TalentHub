"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  listingId: z.string().min(1),
  reason: z.string().min(5).max(500),
  reporterEmail: z.string().email().optional().or(z.literal("")),
});

export type ReportInput = z.input<typeof schema>;

export async function reportListingAction(
  input: ReportInput,
): Promise<{ error?: string; ok?: boolean }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success)
    return { error: "Merci d'indiquer un motif (au moins 5 caractères)." };
  if (!process.env.DATABASE_URL) return { ok: true };

  const listing = await prisma.listing.findUnique({
    where: { id: parsed.data.listingId },
    select: { id: true },
  });
  if (!listing) return { error: "Annonce introuvable." };

  await prisma.report.create({
    data: {
      targetType: "LISTING",
      targetId: parsed.data.listingId,
      reason: parsed.data.reason,
      reporterEmail: parsed.data.reporterEmail || null,
    },
  });
  return { ok: true };
}
