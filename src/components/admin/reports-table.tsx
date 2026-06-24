"use client";

import { useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { setReportStatus } from "@/lib/admin/actions";

type Row = {
  id: string;
  targetType: "LISTING" | "USER";
  targetId: string;
  targetLabel: string;
  reason: string;
  reporterEmail: string;
  status: "OPEN" | "REVIEWED" | "CLOSED";
  date: string;
};

const statusBadge: Record<Row["status"], React.ReactNode> = {
  OPEN: <Badge variant="amber">● Ouvert</Badge>,
  REVIEWED: <Badge variant="neutral">● Examiné</Badge>,
  CLOSED: <Badge variant="green">● Clôturé</Badge>,
};

export function ReportsTable({ rows }: { rows: Row[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function run(fn: () => Promise<unknown>) {
    start(async () => {
      await fn();
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Aucun signalement. 🎉
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3">Cible</th>
            <th className="px-5 py-3">Motif</th>
            <th className="px-5 py-3">Date</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-hairline last:border-0 align-top">
              <td className="px-5 py-3">
                {r.targetType === "LISTING" ? (
                  <Link
                    href={`/annonce/${r.targetId}`}
                    className="font-semibold text-ink hover:text-terracotta-deep"
                  >
                    {r.targetLabel}
                  </Link>
                ) : (
                  <span className="font-semibold text-ink">{r.targetLabel}</span>
                )}
              </td>
              <td className="px-5 py-3 text-muted-foreground">
                <p className="max-w-xs">{r.reason}</p>
                <p className="mt-1 text-xs text-ink-muted">{r.reporterEmail}</p>
              </td>
              <td className="px-5 py-3 text-muted-foreground">{r.date}</td>
              <td className="px-5 py-3">{statusBadge[r.status]}</td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-3 font-medium">
                  {r.status !== "REVIEWED" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => setReportStatus(r.id, "REVIEWED"))}
                      className="text-muted-foreground hover:text-ink"
                    >
                      Examiné
                    </button>
                  )}
                  {r.status !== "CLOSED" && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => setReportStatus(r.id, "CLOSED"))}
                      className="text-green hover:underline"
                    >
                      Clôturer
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
