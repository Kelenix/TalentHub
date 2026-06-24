import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/user";
import {
  listProviders,
  getAdminStats,
  type UserFilter,
} from "@/lib/admin/queries";
import { UsersTable } from "@/components/admin/users-table";
import { LiveSearchInput } from "@/components/search/live-search-input";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

function str(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

const tabs: { key: UserFilter; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "pending", label: "En attente" },
  { key: "suspended", label: "Suspendus" },
];

export default async function AdminUsersPage({
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
  const filter = (str(sp.filter) as UserFilter) || "all";
  const q = str(sp.q) ?? "";

  const [stats, users] = await Promise.all([
    getAdminStats(),
    listProviders(filter, q || undefined),
  ]);

  const rows = users.map((u) => ({
    userId: u.id,
    name: u.profile
      ? `${u.profile.firstName} ${u.profile.lastName}`
      : u.email,
    city: u.profile?.city?.name ?? "—",
    category: u.profile?.listings[0]?.category.name ?? "—",
    count: u.profile?._count.listings ?? 0,
    verified: u.profile?.verified ?? false,
    suspended: u.status === "SUSPENDED",
    profileId: u.profile?.id ?? null,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Gestion des utilisateurs</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: "Prestataires", value: stats.providers },
          { label: "Annonces", value: stats.listings },
          { label: "En attente", value: stats.pending, accent: true },
          { label: "Signalements", value: stats.reports, accent: true },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {s.label}
            </p>
            <p
              className={cn(
                "mt-2 text-3xl font-bold",
                s.accent ? "text-primary" : "text-ink",
              )}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {tabs.map((tb) => {
            const active = filter === tb.key;
            const query = new URLSearchParams();
            if (tb.key !== "all") query.set("filter", tb.key);
            if (q) query.set("q", q);
            return (
              <Link
                key={tb.key}
                href={`/admin/utilisateurs${query.toString() ? `?${query}` : ""}`}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm font-semibold transition-colors",
                  active
                    ? "border-ink bg-ink text-white"
                    : "border-border bg-card text-muted-foreground hover:text-ink",
                )}
              >
                {tb.label}
              </Link>
            );
          })}
        </div>

        <div className="w-full sm:w-64">
          <LiveSearchInput
            pathname="/admin/utilisateurs"
            placeholder="Rechercher un utilisateur…"
          />
        </div>
      </div>

      <div className="mt-4">
        <UsersTable rows={rows} />
      </div>
    </div>
  );
}
