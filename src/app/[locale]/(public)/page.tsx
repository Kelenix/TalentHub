import { getTranslations, setRequestLocale } from "next-intl/server";
import { Utensils, Scissors, Shirt, Wrench, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getCategories, getCities } from "@/lib/reference";
import {
  getLatestListings,
  getPopularListings,
  getListingsByCategory,
} from "@/lib/listings";
import { ListingCard } from "@/components/listings/listing-card";
import { SearchBar } from "@/components/search/search-bar";

export const dynamic = "force-dynamic";

const iconMap: Record<string, typeof Utensils> = {
  cuisine: Utensils,
  beaute: Scissors,
  couture: Shirt,
  "services-divers": Wrench,
};

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [t, tcat, tsearch] = await Promise.all([
    getTranslations("home"),
    getTranslations("categories"),
    getTranslations("search"),
  ]);

  const [categories, cities, latest, popular] = await Promise.all([
    getCategories(),
    getCities(),
    getLatestListings(8),
    getPopularListings(8),
  ]);

  // Annonces par catégorie (sections accueil, cf. cahier §10)
  const categorySections = await Promise.all(
    categories.map(async (c) => ({
      slug: c.slug,
      name: c.name,
      listings: await getListingsByCategory(c.slug, 4),
    })),
  );

  return (
    <div>
      {/* ── Hero : contenu centré et animé ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-secondary/60 to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 size-[40rem] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center lg:py-28">
          <p
            className="animate-in fade-in-0 slide-in-from-bottom-3 text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-deep duration-700"
          >
            {t("heroEyebrow")}
          </p>
          <h1
            className="animate-in fade-in-0 slide-in-from-bottom-4 mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-ink duration-700 sm:text-6xl"
            style={{ animationDelay: "80ms" }}
          >
            {t.rich("heroTitle", {
              em: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h1>
          <p
            className="animate-in fade-in-0 slide-in-from-bottom-4 mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground duration-700"
            style={{ animationDelay: "160ms" }}
          >
            {t("heroSubtitle")}
          </p>
          <div
            className="animate-in fade-in-0 slide-in-from-bottom-4 mt-9 w-full max-w-xl duration-700"
            style={{ animationDelay: "240ms" }}
          >
            <SearchBar
              placeholder={t("searchPlaceholder")}
              buttonLabel={t("searchButton")}
              cityLabel={tsearch("city")}
              cities={cities.map((c) => ({ id: c.id, name: c.name }))}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {/* ── Catégories ── */}
        {categories.length > 0 && (
          <section className="py-14">
            <h2 className="mb-6 text-2xl font-bold text-ink">
              {t("categories")}
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {categories.map((c) => {
                const Icon = iconMap[c.slug] ?? Wrench;
                return (
                  <Link
                    key={c.id}
                    href={`/recherche?category=${c.slug}`}
                    className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
                  >
                    <span className="flex size-11 items-center justify-center rounded-xl bg-secondary transition-colors group-hover:bg-terracotta-soft">
                      <Icon className="size-5 text-primary" />
                    </span>
                    <p className="mt-4 font-semibold text-ink">
                      {tcat.has(c.slug) ? tcat(c.slug) : c.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("specialties", { count: c.subcategories.length })}
                    </p>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        <ListingSection
          title={t("latestListings")}
          emptyLabel={t("noListings")}
          seeAllLabel={t("seeAll")}
          listings={latest}
        />
        <ListingSection
          title={t("popularServices")}
          emptyLabel={t("noListings")}
          seeAllLabel={t("seeAll")}
          listings={popular}
        />

        {/* Sections par catégorie (cahier §10) — masquées si vides */}
        {categorySections
          .filter((c) => c.listings.length > 0)
          .map((c) => (
            <ListingSection
              key={c.slug}
              title={tcat.has(c.slug) ? tcat(c.slug) : c.name}
              emptyLabel={t("noListings")}
              seeAllLabel={t("seeAll")}
              listings={c.listings}
              href={`/recherche?category=${c.slug}`}
            />
          ))}
      </div>
    </div>
  );
}

function ListingSection({
  title,
  emptyLabel,
  seeAllLabel,
  listings,
  href = "/recherche",
}: {
  title: string;
  emptyLabel: string;
  seeAllLabel: string;
  listings: Awaited<ReturnType<typeof getLatestListings>>;
  href?: string;
}) {
  return (
    <section className="py-8">
      <div className="mb-6 flex items-baseline justify-between">
        <h2 className="text-2xl font-bold text-ink">{title}</h2>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-terracotta-deep hover:underline"
        >
          {seeAllLabel} <ArrowRight className="size-4" />
        </Link>
      </div>
      {listings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}
