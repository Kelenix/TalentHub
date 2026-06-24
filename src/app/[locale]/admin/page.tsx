import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { requireAdmin } from "@/lib/auth/user";
import { getAdminStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p
        className={`mt-2 text-3xl font-bold ${accent ? "text-primary" : "text-ink"}`}
      >
        {value.toLocaleString("fr-FR")}
      </p>
    </div>
  );
}

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();
  const stats = await getAdminStats();

  const links = [
    { href: "/admin/utilisateurs", label: "Gérer les utilisateurs" },
    { href: "/admin/annonces", label: "Modérer les annonces" },
    { href: "/admin/categories", label: "Gérer les catégories" },
    { href: "/admin/moderation", label: "Traiter les signalements" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Tableau de bord</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Prestataires" value={stats.providers} />
        <StatCard label="Annonces" value={stats.listings} />
        <StatCard label="En attente" value={stats.pending} accent />
        <StatCard label="Signalements" value={stats.reports} accent />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xl border border-border bg-card px-5 py-4 font-semibold text-ink transition-colors hover:border-primary"
          >
            {l.label} →
          </Link>
        ))}
      </div>
    </div>
  );
}
