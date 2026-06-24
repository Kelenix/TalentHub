"use client";

import { useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { setListingStatus, deleteListingAdmin } from "@/lib/admin/actions";

type Row = {
  id: string;
  title: string;
  provider: string;
  category: string;
  status: "DRAFT" | "PUBLISHED" | "SUSPENDED";
};

const statusBadge: Record<Row["status"], React.ReactNode> = {
  PUBLISHED: <Badge variant="green">● Publiée</Badge>,
  DRAFT: <Badge variant="muted">● Brouillon</Badge>,
  SUSPENDED: <Badge variant="amber">● Suspendue</Badge>,
};

export function ModerationTable({ rows }: { rows: Row[] }) {
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
        Aucune annonce.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3">Annonce</th>
            <th className="px-5 py-3">Prestataire</th>
            <th className="px-5 py-3">Catégorie</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-b border-hairline last:border-0">
              <td className="px-5 py-3 font-semibold text-ink">{r.title}</td>
              <td className="px-5 py-3 text-muted-foreground">{r.provider}</td>
              <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
              <td className="px-5 py-3">{statusBadge[r.status]}</td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-3 font-medium">
                  <Link
                    href={`/annonce/${r.id}`}
                    className="text-muted-foreground hover:text-ink"
                  >
                    Voir
                  </Link>
                  {r.status === "SUSPENDED" ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => setListingStatus(r.id, "PUBLISHED"))}
                      className="text-green hover:underline"
                    >
                      Republier
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => setListingStatus(r.id, "SUSPENDED"))}
                      className="text-amber-700 hover:underline"
                    >
                      Suspendre
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      if (window.confirm("Supprimer définitivement cette annonce ?"))
                        run(() => deleteListingAdmin(r.id));
                    }}
                    className="text-destructive hover:underline"
                  >
                    Supprimer
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
