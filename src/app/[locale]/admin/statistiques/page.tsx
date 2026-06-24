import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/user";
import {
  getAdminStats,
  getGlobalStats,
  getTotalViews,
  getListingsPerCategory,
  getProvidersPerCity,
  getListingStatusBreakdown,
  getAvailabilityBreakdown,
  getTopProviders,
  getActivityLast7Days,
} from "@/lib/admin/queries";
import {
  ChartCard,
  BarChart,
  DonutChart,
  AreaChart,
} from "@/components/admin/charts";

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

export default async function AdminStatsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const [
    admin,
    global,
    totalViews,
    perCategory,
    perCity,
    status,
    avail,
    topProviders,
    activity,
  ] = await Promise.all([
    getAdminStats(),
    getGlobalStats(),
    getTotalViews(),
    getListingsPerCategory(),
    getProvidersPerCity(),
    getListingStatusBreakdown(),
    getAvailabilityBreakdown(),
    getTopProviders(5),
    getActivityLast7Days(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Statistiques</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Vue d&apos;ensemble de l&apos;activité de la plateforme.
      </p>

      {/* KPIs */}
      <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Prestataires" value={admin.providers} />
        <StatCard label="Annonces publiées" value={global.published} />
        <StatCard label="Vues totales" value={totalViews} />
        <StatCard label="Signalements" value={admin.reports} accent />
      </div>

      {/* Diagrammes */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <ChartCard title="Activité — vues sur 7 jours">
            <AreaChart data={activity} />
          </ChartCard>
        </div>

        <ChartCard title="Top prestataires (par vues)">
          {topProviders.length > 0 ? (
            <BarChart data={topProviders} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Pas encore de vues enregistrées.
            </p>
          )}
        </ChartCard>

        <ChartCard title="Annonces par catégorie">
          <BarChart data={perCategory} />
        </ChartCard>

        <ChartCard title="Prestataires par ville">
          <BarChart data={perCity} />
        </ChartCard>

        <ChartCard title="Statut des annonces">
          <DonutChart
            segments={[
              { label: "Publiées", value: status.published, color: "#047857" },
              { label: "Brouillons", value: status.draft, color: "#94a3b8" },
              { label: "Suspendues", value: status.suspended, color: "#d97706" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Disponibilité des annonces">
          <DonutChart
            segments={[
              { label: "Disponible", value: avail.available, color: "#047857" },
              {
                label: "Indisponible",
                value: avail.unavailable,
                color: "#94a3b8",
              },
            ]}
          />
        </ChartCard>

        <ChartCard title="Contacts par canal">
          <DonutChart
            segments={[
              { label: "WhatsApp", value: global.whatsapp, color: "#047857" },
              { label: "Email", value: global.email, color: "#ea580c" },
            ]}
          />
        </ChartCard>

        <ChartCard title="Catalogue">
          <BarChart
            data={[
              { label: "Publiées", value: global.published },
              { label: "Brouillons", value: global.draft },
              { label: "En attente vérif.", value: admin.pending },
            ]}
          />
        </ChartCard>
      </div>
    </div>
  );
}
