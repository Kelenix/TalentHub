import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function dbReady() {
  return Boolean(process.env.DATABASE_URL);
}

export async function getAdminStats() {
  if (!dbReady())
    return { providers: 0, listings: 0, pending: 0, reports: 0 };
  const [providers, listings, pending, reports] = await prisma.$transaction([
    prisma.user.count({ where: { role: "PROVIDER" } }),
    prisma.listing.count(),
    prisma.providerProfile.count({ where: { verified: false } }),
    prisma.report.count({ where: { status: "OPEN" } }),
  ]);
  return { providers, listings, pending, reports };
}

export type UserFilter = "all" | "pending" | "suspended";

export async function listProviders(filter: UserFilter = "all", q?: string) {
  if (!dbReady()) return [];
  const where: Prisma.UserWhereInput = { role: "PROVIDER" };
  if (filter === "pending") where.profile = { verified: false };
  if (filter === "suspended") where.status = "SUSPENDED";
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { profile: { firstName: { contains: q, mode: "insensitive" } } },
      { profile: { lastName: { contains: q, mode: "insensitive" } } },
    ];
  }
  return prisma.user.findMany({
    where,
    include: {
      profile: {
        include: {
          city: true,
          _count: { select: { listings: true } },
          listings: { take: 1, orderBy: { createdAt: "desc" }, include: { category: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listAllListings(q?: string) {
  if (!dbReady()) return [];
  const where: Prisma.ListingWhereInput = {};
  if (q) where.title = { contains: q, mode: "insensitive" };
  return prisma.listing.findMany({
    where,
    include: {
      category: true,
      subcategory: true,
      provider: true,
      photos: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function listReports() {
  if (!dbReady()) return [];
  return prisma.report.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 100,
  });
}

/** Résout l'annonce ou l'utilisateur ciblé par un signalement (pour affichage). */
export async function resolveReportTargets(
  reports: { targetType: "LISTING" | "USER"; targetId: string }[],
) {
  if (!dbReady()) return { listings: new Map(), users: new Map() };
  const listingIds = reports
    .filter((r) => r.targetType === "LISTING")
    .map((r) => r.targetId);
  const userIds = reports
    .filter((r) => r.targetType === "USER")
    .map((r) => r.targetId);
  const [listings, profiles] = await Promise.all([
    prisma.listing.findMany({
      where: { id: { in: listingIds } },
      select: { id: true, title: true },
    }),
    prisma.providerProfile.findMany({
      where: { id: { in: userIds } },
      select: { id: true, firstName: true, lastName: true },
    }),
  ]);
  return {
    listings: new Map(listings.map((l) => [l.id, l.title])),
    users: new Map(profiles.map((p) => [p.id, `${p.firstName} ${p.lastName}`])),
  };
}

export async function getGlobalStats() {
  if (!dbReady())
    return { views: 0, whatsapp: 0, email: 0, published: 0, draft: 0 };
  const [views, whatsapp, email, published, draft] = await prisma.$transaction([
    prisma.contactEvent.count({ where: { type: "VIEW" } }),
    prisma.contactEvent.count({ where: { type: "WHATSAPP" } }),
    prisma.contactEvent.count({ where: { type: "EMAIL" } }),
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
    prisma.listing.count({ where: { status: "DRAFT" } }),
  ]);
  return { views, whatsapp, email, published, draft };
}
