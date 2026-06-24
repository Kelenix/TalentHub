import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/auth/user";
import { Button } from "@/components/ui/button";
import { ListingsTable } from "@/components/dashboard/listings-table";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-ink">{value}</p>
    </div>
  );
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireProvider();
  const t = await getTranslations("dashboard");

  const listings = await prisma.listing.findMany({
    where: { providerId: user.profile.id },
    include: { category: true, subcategory: true, photos: true },
    orderBy: { createdAt: "desc" },
  });

  const activeCount = listings.filter((l) => l.status === "PUBLISHED").length;
  const totalViews = listings.reduce((sum, l) => sum + l.viewsCount, 0);
  const whatsappContacts = await prisma.contactEvent.count({
    where: { type: "WHATSAPP", listing: { providerId: user.profile.id } },
  });

  const rows = listings.map((l) => {
    const cover = l.photos.find((p) => p.isCover) ?? l.photos[0];
    return {
      id: l.id,
      title: l.title,
      category: l.subcategory
        ? `${l.category.name} · ${l.subcategory.name}`
        : l.category.name,
      views: l.viewsCount,
      availability: l.availability,
      coverUrl: cover?.url ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-ink">{t("myListings")}</h1>
          <p className="mt-1 text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Link href="/dashboard/annonces/nouvelle">
          <Button>+ {t("addListing")}</Button>
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("activeListings")} value={activeCount} />
        <StatCard label={t("viewsThisMonth")} value={totalViews} />
        <StatCard label={t("whatsappContacts")} value={whatsappContacts} />
      </div>

      <div className="mt-8">
        <ListingsTable rows={rows} />
      </div>
    </div>
  );
}
