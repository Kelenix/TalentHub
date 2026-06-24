import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/user";
import { getAdminStats, getGlobalStats } from "@/lib/admin/queries";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-ink">
        {value.toLocaleString("fr-FR")}
      </p>
    </div>
  );
}

export default async function AdminStatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [admin, global] = await Promise.all([
    getAdminStats(),
    getGlobalStats(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Statistiques</h1>

      <h2 className="mt-8 mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Catalogue
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Prestataires" value={admin.providers} />
        <StatCard label="Annonces publiées" value={global.published} />
        <StatCard label="Brouillons" value={global.draft} />
        <StatCard label="En attente vérif." value={admin.pending} />
      </div>

      <h2 className="mt-10 mb-3 text-sm font-semibold uppercase tracking-wide text-ink-muted">
        Engagement
      </h2>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Vues totales" value={global.views} />
        <StatCard label="Contacts WhatsApp" value={global.whatsapp} />
        <StatCard label="Contacts email" value={global.email} />
        <StatCard label="Signalements ouverts" value={admin.reports} />
      </div>
    </div>
  );
}
