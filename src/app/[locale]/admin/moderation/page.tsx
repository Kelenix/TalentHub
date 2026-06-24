import { setRequestLocale } from "next-intl/server";
import { requireAdmin } from "@/lib/auth/user";
import { listReports, resolveReportTargets } from "@/lib/admin/queries";
import { formatDate } from "@/lib/format";
import { ReportsTable } from "@/components/admin/reports-table";

export const dynamic = "force-dynamic";

export default async function AdminModerationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireAdmin();

  const reports = await listReports();
  const targets = await resolveReportTargets(reports);

  const rows = reports.map((r) => ({
    id: r.id,
    targetType: r.targetType,
    targetId: r.targetId,
    targetLabel:
      r.targetType === "LISTING"
        ? targets.listings.get(r.targetId) ?? "(annonce supprimée)"
        : targets.users.get(r.targetId) ?? "(profil supprimé)",
    reason: r.reason,
    reporterEmail: r.reporterEmail ?? "—",
    status: r.status,
    date: formatDate(r.createdAt, locale),
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Signalements</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Contenus signalés par les visiteurs — à examiner et traiter.
      </p>
      <div className="mt-6">
        <ReportsTable rows={rows} />
      </div>
    </div>
  );
}
