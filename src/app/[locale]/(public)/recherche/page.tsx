import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  searchListings,
  SEARCH_PAGE_SIZE,
  type ListingSearch,
} from "@/lib/listings";
import {
  getCategories,
  getCities,
  getCountries,
  getServiceCountries,
} from "@/lib/reference";
import { ListingCard } from "@/components/listings/listing-card";
import { FiltersForm } from "@/components/search/filters-form";
import { Pagination } from "@/components/search/pagination";

export const dynamic = "force-dynamic";

function str(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations("search");

  const current: ListingSearch = {
    q: str(sp.q),
    country: str(sp.country),
    city: str(sp.city),
    category: str(sp.category),
    subcategory: str(sp.subcategory),
    nationality: str(sp.nationality),
    available: str(sp.available),
  };
  const page = Math.max(1, Number(str(sp.page)) || 1);

  const [{ items: results, total }, categories, cities, countries, serviceCountries] =
    await Promise.all([
      searchListings(current, page),
      getCategories(),
      getCities(),
      getCountries(),
      getServiceCountries(),
    ]);
  const totalPages = Math.ceil(total / SEARCH_PAGE_SIZE);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[270px_1fr]">
        <FiltersForm
          data={{
            serviceCountries: serviceCountries.map((c) => ({
              value: c.iso,
              label: c.name,
            })),
            cities: cities.map((c) => ({ value: c.id, label: c.name })),
            countries: countries.map((c) => ({ value: c.iso, label: c.name })),
            categories: categories.map((c) => ({
              slug: c.slug,
              name: c.name,
              subcategories: c.subcategories.map((s) => ({
                slug: s.slug,
                name: s.name,
              })),
            })),
          }}
          current={{
            q: current.q ?? "",
            country: current.country ?? "",
            city: current.city ?? "",
            category: current.category ?? "",
            subcategory: current.subcategory ?? "",
            nationality: current.nationality ?? "",
            available: current.available ?? "",
          }}
        />

        <section>
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-ink">
              {t("resultsFor", { count: total })}
              {current.q && (
                <span className="ml-1 text-base font-normal text-muted-foreground">
                  · «&nbsp;{current.q}&nbsp;»
                </span>
              )}
            </h1>
          </div>

          {results.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
              {t("noResults")}
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {results.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                params={{
                  q: current.q ?? "",
                  country: current.country ?? "",
                  city: current.city ?? "",
                  category: current.category ?? "",
                  subcategory: current.subcategory ?? "",
                  nationality: current.nationality ?? "",
                  available: current.available ?? "",
                }}
              />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
