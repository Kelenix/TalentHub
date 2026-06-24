import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/user";
import { listAllListings } from "@/lib/admin/queries";
import { ModerationTable } from "@/components/admin/moderation-table";
import { LiveSearchInput } from "@/components/search/live-search-input";

export const dynamic = "force-dynamic";

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

export default async function AdminListingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const sp = await searchParams;
  const q = str(sp.q) ?? "";

  const listings = await listAllListings(q || undefined);
  const rows = listings.map((l) => ({
    id: l.id,
    title: l.title,
    provider: `${l.provider.firstName} ${l.provider.lastName}`,
    category: l.subcategory
      ? `${l.category.name} · ${l.subcategory.name}`
      : l.category.name,
    status: l.status,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold text-ink">Modération des annonces</h1>
        <div className="w-full sm:w-72">
          <LiveSearchInput
            pathname="/admin/annonces"
            placeholder="Rechercher une annonce…"
          />
        </div>
      </div>
      <div className="mt-6">
        <ModerationTable rows={rows} />
      </div>
    </div>
  );
}
