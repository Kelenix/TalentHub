import { prisma } from "@/lib/prisma";

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getCategories() {
  if (!dbReady()) return [];
  return prisma.category.findMany({
    where: { isActive: true },
    include: { subcategories: { orderBy: { order: "asc" } } },
    orderBy: { order: "asc" },
  });
}

export async function getCities(countryIso = "IT") {
  if (!dbReady()) return [];
  return prisma.city.findMany({
    where: { country: { iso: countryIso } },
    orderBy: { name: "asc" },
  });
}

export async function getCountries() {
  if (!dbReady()) return [];
  return prisma.country.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });
}

/** Pays où des services sont proposés (= pays ayant au moins une ville). */
export async function getServiceCountries() {
  if (!dbReady()) return [];
  return prisma.country.findMany({
    where: { isActive: true, cities: { some: {} } },
    orderBy: { name: "asc" },
  });
}
