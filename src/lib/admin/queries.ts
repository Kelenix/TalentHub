import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { matchesQuery } from "@/lib/search";

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
  const users = await prisma.user.findMany({
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
    take: 300,
  });
  const term = q?.trim();
  if (!term) return users.slice(0, 100);
  return users
    .filter((u) =>
      matchesQuery(
        `${u.email} ${u.profile?.firstName ?? ""} ${u.profile?.lastName ?? ""} ${u.profile?.city?.name ?? ""}`,
        term,
      ),
    )
    .slice(0, 100);
}

export async function listAllListings(q?: string) {
  if (!dbReady()) return [];
  const all = await prisma.listing.findMany({
    include: {
      category: true,
      subcategory: true,
      provider: true,
      photos: { take: 1, orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 300,
  });
  const term = q?.trim();
  if (!term) return all.slice(0, 100);
  return all
    .filter((l) =>
      matchesQuery(
        `${l.title} ${l.provider.firstName} ${l.provider.lastName} ${l.category.name} ${l.subcategory?.name ?? ""}`,
        term,
      ),
    )
    .slice(0, 100);
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

export async function getListingsPerCategory() {
  if (!dbReady()) return [];
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    select: { name: true, _count: { select: { listings: true } } },
  });
  return cats.map((c) => ({ label: c.name, value: c._count.listings }));
}

export async function getProvidersPerCity() {
  if (!dbReady()) return [];
  const cities = await prisma.city.findMany({
    where: { profiles: { some: {} } },
    orderBy: { name: "asc" },
    select: { name: true, _count: { select: { profiles: true } } },
  });
  return cities
    .map((c) => ({ label: c.name, value: c._count.profiles }))
    .sort((a, b) => b.value - a.value);
}

export async function getListingStatusBreakdown() {
  if (!dbReady()) return { published: 0, draft: 0, suspended: 0 };
  const [published, draft, suspended] = await prisma.$transaction([
    prisma.listing.count({ where: { status: "PUBLISHED" } }),
    prisma.listing.count({ where: { status: "DRAFT" } }),
    prisma.listing.count({ where: { status: "SUSPENDED" } }),
  ]);
  return { published, draft, suspended };
}

export async function getAvailabilityBreakdown() {
  if (!dbReady()) return { available: 0, unavailable: 0 };
  const [available, unavailable] = await prisma.$transaction([
    prisma.listing.count({ where: { availability: "AVAILABLE" } }),
    prisma.listing.count({ where: { availability: "UNAVAILABLE" } }),
  ]);
  return { available, unavailable };
}

export async function getTotalViews() {
  if (!dbReady()) return 0;
  const agg = await prisma.listing.aggregate({ _sum: { viewsCount: true } });
  return agg._sum.viewsCount ?? 0;
}

export async function getTopProviders(limit = 5) {
  if (!dbReady()) return [];
  const providers = await prisma.providerProfile.findMany({
    select: {
      firstName: true,
      lastName: true,
      listings: { select: { viewsCount: true } },
    },
  });
  return providers
    .map((p) => ({
      label: `${p.firstName} ${p.lastName}`,
      value: p.listings.reduce((s, l) => s + l.viewsCount, 0),
    }))
    .filter((p) => p.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

/** Vues par jour sur les 7 derniers jours (événements ContactEvent VIEW). */
export async function getActivityLast7Days() {
  if (!dbReady()) return [];
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  since.setDate(since.getDate() - 6);

  const events = await prisma.contactEvent.findMany({
    where: { type: "VIEW", createdAt: { gte: since } },
    select: { createdAt: true },
  });

  const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short" });
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    return { key: d.toISOString().slice(0, 10), label: fmt.format(d), value: 0 };
  });

  for (const e of events) {
    const key = new Date(e.createdAt).toISOString().slice(0, 10);
    const day = days.find((d) => d.key === key);
    if (day) day.value++;
  }
  return days.map(({ label, value }) => ({ label, value }));
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
