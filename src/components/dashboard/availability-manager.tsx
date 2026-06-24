"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { setAvailabilityAction } from "@/lib/listings/actions";
import { cn } from "@/lib/utils";

type Row = {
  id: string;
  title: string;
  category: string;
  availability: "AVAILABLE" | "UNAVAILABLE";
};

export function AvailabilityManager({ rows }: { rows: Row[] }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, start] = useTransition();

  function toggle(id: string, current: Row["availability"]) {
    start(async () => {
      await setAvailabilityAction(
        id,
        current === "AVAILABLE" ? "UNAVAILABLE" : "AVAILABLE",
      );
      router.refresh();
    });
  }

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
        Vous n&apos;avez pas encore d&apos;annonce.{" "}
        <Link
          href="/dashboard/annonces/nouvelle"
          className="font-semibold text-terracotta-deep hover:underline"
        >
          En créer une
        </Link>
        .
      </p>
    );
  }

  return (
    <div className="divide-y divide-hairline overflow-hidden rounded-2xl border border-border bg-card">
      {rows.map((r) => {
        const available = r.availability === "AVAILABLE";
        return (
          <div key={r.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{r.title}</p>
              <p className="text-xs text-muted-foreground">{r.category}</p>
            </div>
            <button
              type="button"
              disabled={pending}
              onClick={() => toggle(r.id, r.availability)}
              aria-pressed={available}
              className="flex shrink-0 items-center gap-2"
            >
              <span
                className={cn(
                  "relative h-6 w-11 rounded-full transition-colors",
                  available ? "bg-green" : "bg-border",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow transition-all",
                    available ? "left-[22px]" : "left-0.5",
                  )}
                />
              </span>
              <span
                className={cn(
                  "w-24 text-left text-sm font-medium",
                  available ? "text-green" : "text-muted-foreground",
                )}
              >
                {available ? t("available") : t("unavailable")}
              </span>
            </button>
          </div>
        );
      })}
    </div>
  );
}
