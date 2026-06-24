"use client";

import { useTransition } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { setUserStatus, setProviderVerified } from "@/lib/admin/actions";

type Row = {
  userId: string;
  name: string;
  city: string;
  category: string;
  count: number;
  verified: boolean;
  suspended: boolean;
  profileId: string | null;
};

export function UsersTable({ rows }: { rows: Row[] }) {
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
        Aucun utilisateur.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary/60 text-left text-xs font-semibold uppercase tracking-wide text-ink-muted">
            <th className="px-5 py-3">Prestataire</th>
            <th className="px-5 py-3">Ville</th>
            <th className="px-5 py-3">Catégorie</th>
            <th className="px-5 py-3">Annonces</th>
            <th className="px-5 py-3">Statut</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.userId} className="border-b border-hairline last:border-0">
              <td className="px-5 py-3 font-semibold text-ink">{r.name}</td>
              <td className="px-5 py-3 text-muted-foreground">{r.city}</td>
              <td className="px-5 py-3 text-muted-foreground">{r.category}</td>
              <td className="px-5 py-3 text-ink">{r.count}</td>
              <td className="px-5 py-3">
                {r.suspended ? (
                  <Badge variant="muted">● Suspendu</Badge>
                ) : r.verified ? (
                  <Badge variant="green">● Vérifié</Badge>
                ) : (
                  <Badge variant="amber">● En attente</Badge>
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-3 font-medium">
                  {r.profileId && (
                    <Link
                      href={`/prestataire/${r.profileId}`}
                      className="text-muted-foreground hover:text-ink"
                    >
                      Voir
                    </Link>
                  )}
                  {!r.verified && !r.suspended && (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => setProviderVerified(r.userId, true))}
                      className="text-green hover:underline"
                    >
                      Vérifier
                    </button>
                  )}
                  {r.suspended ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => setUserStatus(r.userId, "ACTIVE"))}
                      className="text-green hover:underline"
                    >
                      Réactiver
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() =>
                        run(() => setUserStatus(r.userId, "SUSPENDED"))
                      }
                      className="text-destructive hover:underline"
                    >
                      Suspendre
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
