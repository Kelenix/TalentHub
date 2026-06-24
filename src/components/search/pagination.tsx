import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

function buildHref(params: Record<string, string>, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  else sp.delete("page");
  const qs = sp.toString();
  return `/recherche${qs ? `?${qs}` : ""}`;
}

/** Fenêtre de numéros de page autour de la page courante. */
function pageWindow(page: number, totalPages: number): number[] {
  const span = 1;
  const pages = new Set<number>([1, totalPages, page]);
  for (let i = page - span; i <= page + span; i++) {
    if (i >= 1 && i <= totalPages) pages.add(i);
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function Pagination({
  page,
  totalPages,
  params,
}: {
  page: number;
  totalPages: number;
  params: Record<string, string>;
}) {
  if (totalPages <= 1) return null;

  const windowed = pageWindow(page, totalPages);
  const base =
    "inline-flex h-10 min-w-10 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors";

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={buildHref(params, page - 1)}
          className={cn(base, "border-border bg-card text-ink hover:bg-secondary")}
          aria-label="Page précédente"
        >
          <ChevronLeft className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(base, "border-border bg-secondary text-muted-foreground/50")}
          aria-disabled
        >
          <ChevronLeft className="size-4" />
        </span>
      )}

      {windowed.map((p, i) => {
        const gap = i > 0 && p - windowed[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-2">
            {gap && <span className="px-1 text-muted-foreground">…</span>}
            {p === page ? (
              <span
                aria-current="page"
                className={cn(base, "border-primary bg-primary text-white")}
              >
                {p}
              </span>
            ) : (
              <Link
                href={buildHref(params, p)}
                className={cn(
                  base,
                  "border-border bg-card text-ink hover:bg-secondary",
                )}
              >
                {p}
              </Link>
            )}
          </span>
        );
      })}

      {page < totalPages ? (
        <Link
          href={buildHref(params, page + 1)}
          className={cn(base, "border-border bg-card text-ink hover:bg-secondary")}
          aria-label="Page suivante"
        >
          <ChevronRight className="size-4" />
        </Link>
      ) : (
        <span
          className={cn(base, "border-border bg-secondary text-muted-foreground/50")}
          aria-disabled
        >
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  );
}
