import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { requireProvider } from "@/lib/auth/user";
import { getCategories, getCities, getCountries } from "@/lib/reference";
import { attr } from "@/lib/format";
import { ListingForm } from "@/components/dashboard/listing-form";

export const dynamic = "force-dynamic";

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const user = await requireProvider();

  const [listing, categories, cities, countries] = await Promise.all([
    prisma.listing.findFirst({
      where: { id, providerId: user.profile.id },
      include: {
        category: true,
        subcategory: true,
        countryOfOrigin: true,
        photos: { orderBy: { order: "asc" } },
      },
    }),
    getCategories(),
    getCities(),
    getCountries(),
  ]);

  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-3xl font-bold text-ink">Modifier l&apos;annonce</h1>
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
          initial={{
            id: listing.id,
            title: listing.title,
            description: listing.description,
            categorySlug: listing.category.slug,
            subcategorySlug: listing.subcategory?.slug ?? "",
            cityId: listing.cityId ?? "",
            countryIso: listing.countryOfOrigin?.iso ?? "",
            serviceZone: listing.serviceZone ?? "",
            availability: listing.availability,
            preparationTime: attr(listing.attributes, "preparationTime") ?? "",
            dishOrigin: attr(listing.attributes, "dishOrigin") ?? "",
            hairstyleType: attr(listing.attributes, "hairstyleType") ?? "",
            photos: listing.photos.map((p) => ({
              url: p.url,
              isCover: p.isCover,
            })),
          }}
        />
      </div>
    </div>
  );
}
