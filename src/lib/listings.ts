import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchesQuery } from "@/lib/search";

/** Tant que la base n'est pas configurée, les requêtes renvoient du vide (états vides gracieux). */
function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

const listingInclude = {
  provider: true,
  category: true,
  subcategory: true,
  city: true,
  countryOfOrigin: true,
  photos: { orderBy: { order: "asc" } },
} satisfies Prisma.ListingInclude;

export type ListingWithRelations = Prisma.ListingGetPayload<{
  include: typeof listingInclude;
}>;

const PUBLISHED = { status: "PUBLISHED" } satisfies Prisma.ListingWhereInput;

export async function getLatestListings(limit = 8) {
  if (!dbReady()) return [];
  return prisma.listing.findMany({
    where: PUBLISHED,
    include: listingInclude,
    orderBy: [{ promoted: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getListingsByCategory(slug: string, limit = 4) {
  if (!dbReady()) return [];
  return prisma.listing.findMany({
    where: { ...PUBLISHED, category: { slug } },
    include: listingInclude,
    orderBy: [{ promoted: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export async function getPopularListings(limit = 8) {
  if (!dbReady()) return [];
  return prisma.listing.findMany({
    where: PUBLISHED,
    include: listingInclude,
    orderBy: [{ viewsCount: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
}

export type ListingSearch = {
  q?: string;
  country?: string; // Country.iso (pays où le service est proposé, via la ville)
  city?: string; // City.id
  category?: string; // Category.slug
  subcategory?: string; // Subcategory.slug
  nationality?: string; // Country.iso (origine du prestataire / de l'annonce)
  available?: string; // "1"
};

export const SEARCH_PAGE_SIZE = 12;

export type SearchResult = {
  items: ListingWithRelations[];
  total: number;
};

export async function searchListings(
  params: ListingSearch,
  page = 1,
): Promise<SearchResult> {
  if (!dbReady()) return { items: [], total: 0 };

  const where: Prisma.ListingWhereInput = { ...PUBLISHED };
  if (params.available === "1") where.availability = "AVAILABLE";
  if (params.category) where.category = { slug: params.category };
  if (params.subcategory) where.subcategory = { slug: params.subcategory };
  if (params.city) {
    where.cityId = params.city;
  } else if (params.country) {
    where.city = { country: { iso: params.country } };
  }
  if (params.nationality) where.countryOfOrigin = { iso: params.nationality };

  const safePage = Math.max(1, page);
  const orderBy: Prisma.ListingOrderByWithRelationInput[] = [
    { promoted: "desc" },
    { publishedAt: "desc" },
    { createdAt: "desc" },
  ];
  const q = params.q?.trim();

  // Recherche texte tolérante (sans accent, multi-mots) côté application.
  if (q) {
    const candidates = await prisma.listing.findMany({
      where,
      include: listingInclude,
      orderBy,
      take: 500,
    });
    const filtered = candidates.filter((l) =>
      matchesQuery(
        `${l.title} ${l.description} ${l.category.name} ${l.subcategory?.name ?? ""} ${l.provider.firstName} ${l.provider.lastName}`,
        q,
      ),
    );
    return {
      items: filtered.slice(
        (safePage - 1) * SEARCH_PAGE_SIZE,
        safePage * SEARCH_PAGE_SIZE,
      ),
      total: filtered.length,
    };
  }

  const [items, total] = await prisma.$transaction([
    prisma.listing.findMany({
      where,
      include: listingInclude,
      orderBy,
      skip: (safePage - 1) * SEARCH_PAGE_SIZE,
      take: SEARCH_PAGE_SIZE,
    }),
    prisma.listing.count({ where }),
  ]);

  return { items, total };
}

export async function getListingById(id: string) {
  if (!dbReady()) return null;
  // Renvoie l'annonce quel que soit son statut ; la visibilité (public vs
  // propriétaire/admin pour les annonces non publiées) est gérée par la page.
  return prisma.listing.findUnique({
    where: { id },
    include: listingInclude,
  });
}

export async function getProviderById(id: string) {
  if (!dbReady()) return null;
  return prisma.providerProfile.findUnique({
    where: { id },
    include: { city: true, countryOfOrigin: true, user: true },
  });
}

export async function getProviderListings(providerId: string) {
  if (!dbReady()) return [];
  return prisma.listing.findMany({
    where: { providerId, status: "PUBLISHED" },
    include: listingInclude,
    orderBy: { createdAt: "desc" },
  });
}
