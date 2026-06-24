"use client";

import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string };

export type FiltersData = {
  serviceCountries: Option[];
  cities: Option[];
  countries: Option[];
  categories: {
    slug: string;
    name: string;
    subcategories: { slug: string; name: string }[];
  }[];
};

export type CurrentFilters = {
  q?: string;
  country?: string;
  city?: string;
  category?: string;
  subcategory?: string;
  nationality?: string;
  available?: string;
};

export function FiltersForm({
  data,
  current,
}: {
  data: FiltersData;
  current: CurrentFilters;
}) {
  const t = useTranslations("search");
  const router = useRouter();

  function update(patch: Partial<CurrentFilters>) {
    const next = { ...current, ...patch };
    if (patch.category !== undefined) next.subcategory = "";
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
    }
    const qs = params.toString();
    router.push(`/recherche${qs ? `?${qs}` : ""}`);
  }

  const activeCategory = data.categories.find(
    (c) => c.slug === current.category,
  );
  const selectClass =
    "h-10 w-full rounded-lg border border-border bg-card px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-ring";

  return (
    <aside className="space-y-6 rounded-2xl border border-border bg-card p-5">
      <h2 className="text-lg font-bold text-ink">{t("filters")}</h2>

      {/* Pays */}
      <Field label={t("country")}>
        <select
          className={selectClass}
          value={current.country ?? ""}
          onChange={(e) => update({ country: e.target.value, city: "" })}
        >
          <option value="">—</option>
          {data.serviceCountries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Ville */}
      <Field label={t("city")}>
        <select
          className={selectClass}
          value={current.city ?? ""}
          onChange={(e) => update({ city: e.target.value })}
        >
          <option value="">{t("allCities")}</option>
          {data.cities.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Catégorie — cases à cocher */}
      <Field label={t("category")}>
        <div className="flex flex-col gap-2.5">
          {data.categories.map((c) => {
            const checked = current.category === c.slug;
            return (
              <button
                key={c.slug}
                type="button"
                aria-pressed={checked}
                onClick={() => update({ category: checked ? "" : c.slug })}
                className="flex items-center gap-2.5 text-left text-sm"
              >
                <span
                  className={cn(
                    "flex size-[18px] items-center justify-center rounded-[5px] border transition-colors",
                    checked
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-card",
                  )}
                >
                  {checked && <X className="size-3 rotate-45" strokeWidth={3} />}
                </span>
                <span
                  className={cn(
                    "font-medium",
                    checked ? "text-ink" : "text-muted-foreground",
                  )}
                >
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </Field>

      {/* Sous-catégorie — pills (si catégorie choisie) */}
      {activeCategory && activeCategory.subcategories.length > 0 && (
        <Field label={t("subcategory")}>
          <div className="flex flex-wrap gap-2">
            {activeCategory.subcategories.map((s) => {
              const selected = current.subcategory === s.slug;
              return (
                <button
                  key={s.slug}
                  type="button"
                  onClick={() =>
                    update({ subcategory: selected ? "" : s.slug })
                  }
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                    selected
                      ? "bg-primary text-white"
                      : "bg-secondary text-muted-foreground hover:text-ink",
                  )}
                >
                  {s.name}
                  {selected && <X className="size-3" />}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      {/* Nationalité */}
      <Field label={t("nationality")}>
        <select
          className={selectClass}
          value={current.nationality ?? ""}
          onChange={(e) => update({ nationality: e.target.value })}
        >
          <option value="">{t("allNationalities")}</option>
          {data.countries.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      {/* Disponible uniquement */}
      <button
        type="button"
        aria-pressed={current.available === "1"}
        onClick={() =>
          update({ available: current.available === "1" ? "" : "1" })
        }
        className="flex items-center gap-2.5 text-left text-sm font-semibold text-ink"
      >
        <span
          className={cn(
            "flex size-[18px] items-center justify-center rounded-[5px] border transition-colors",
            current.available === "1"
              ? "border-primary bg-primary text-white"
              : "border-border bg-card",
          )}
        >
          {current.available === "1" && (
            <X className="size-3 rotate-45" strokeWidth={3} />
          )}
        </span>
        {t("availabilityOnly")}
      </button>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
