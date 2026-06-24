"use client";

import Image from "next/image";
import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import {
  setAvailabilityAction,
  deleteListingAction,
} from "@/lib/listings/actions";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  category: string;
  views: number;
  availability: "AVAILABLE" | "UNAVAILABLE";
  coverUrl: string | null;
};

export function ListingsTable({ rows }: { rows: Row[] }) {
  const t = useTranslations("dashboard");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (rows.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Vous n&apos;avez pas encore d&apos;annonce.
      </p>
    );
  }

  function toggle(row: Row) {
    startTransition(async () => {
      await setAvailabilityAction(
        row.id,
        row.availability === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
      );
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!window.confirm("Supprimer cette annonce ?")) return;
    startTransition(async () => {
      await deleteListingAction(id);
      router.refresh();
    });
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3">{t("annonceCol")}</th>
            <th className="px-5 py-3">{t("categoryCol")}</th>
            <th className="px-5 py-3">{t("viewsCol")}</th>
            <th className="px-5 py-3">{t("availability")}</th>
            <th className="px-5 py-3 text-right">{t("actionsCol")}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const available = row.availability === "AVAILABLE";
            return (
              <tr key={row.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="relative size-10 overflow-hidden rounded-md bg-secondary">
                      {row.coverUrl && (
                        <Image
                          src={row.coverUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      )}
                    </div>
                    <span className="font-semibold text-ink">{row.title}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">
                  {row.category}
                </td>
                <td className="px-5 py-3 text-ink">{row.views}</td>
                <td className="px-5 py-3">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => toggle(row)}
                    className="flex items-center gap-2"
                    aria-pressed={available}
                  >
                    <span
                      className={cn(
                        "relative h-5 w-9 rounded-full transition-colors",
                        available ? "bg-green" : "bg-border",
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 size-4 rounded-full bg-white transition-all",
                          available ? "left-[18px]" : "left-0.5",
                        )}
                      />
                    </span>
                    <span className="text-ink">
                      {available ? tc("available") : tc("unavailable")}
                    </span>
                  </button>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/dashboard/annonces/${row.id}/modifier`}
                    className="font-medium text-terracotta hover:underline"
                  >
                    {t("edit")}
                  </Link>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => remove(row.id)}
                    className="ml-3 font-medium text-muted-foreground hover:text-destructive"
                  >
                    {t("delete")}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
