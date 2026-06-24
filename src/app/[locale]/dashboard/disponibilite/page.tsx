import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/auth/user";
import { AvailabilityManager } from "@/components/dashboard/availability-manager";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireProvider();

  const listings = await prisma.listing.findMany({
    where: { providerId: user.profile.id },
    include: { category: true, subcategory: true },
    orderBy: { createdAt: "desc" },
  });

  const rows = listings.map((l) => ({
    id: l.id,
    title: l.title,
    category: l.subcategory
      ? `${l.category.name} · ${l.subcategory.name}`
      : l.category.name,
    availability: l.availability,
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Disponibilité</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Activez ou désactivez la disponibilité de chacune de vos annonces.
      </p>
      <div className="mt-8">
        <AvailabilityManager rows={rows} />
      </div>
    </div>
  );
}
