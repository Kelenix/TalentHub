import { setRequestLocale } from "next-intl/server";
import { requireProvider } from "@/lib/auth/user";
import { getCategories, getCities, getCountries } from "@/lib/reference";
import { ListingForm } from "@/components/dashboard/listing-form";

export const dynamic = "force-dynamic";

export default async function NewListingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireProvider();

  const [categories, cities, countries] = await Promise.all([
    getCategories(),
    getCities(),
    getCountries(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Nouvelle annonce</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Les champs marqués d&apos;un * sont obligatoires
      </p>
      <div className="mt-8">
        <ListingForm
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
            subcategories: c.subcategories.map((s) => ({
              slug: s.slug,
              name: s.name,
            })),
          }))}
          cities={cities.map((c) => ({ id: c.id, name: c.name }))}
          countries={countries.map((c) => ({ iso: c.iso, name: c.name }))}
        />
      </div>
    </div>
  );
}
