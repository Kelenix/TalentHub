import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { routing } from "@/i18n/routing";

function baseUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const entries: MetadataRoute.Sitemap = [];

  // Pages statiques (toutes langues)
  const staticPaths = [
    "/",
    "/recherche",
    "/mentions-legales",
    "/confidentialite",
  ];
  for (const locale of routing.locales) {
    const prefix = locale === routing.defaultLocale ? "" : `/${locale}`;
    for (const path of staticPaths) {
      const suffix = path === "/" ? "" : path;
      entries.push({
        url: `${base}${prefix}${suffix || "/"}`,
        changeFrequency: "daily",
        priority: path === "/" ? 1 : 0.7,
      });
    }
  }

  // Contenu dynamique (langue par défaut) — résilient sans base
  if (process.env.DATABASE_URL) {
    try {
      const listings = await prisma.listing.findMany({
        where: { status: "PUBLISHED" },
        select: { id: true, updatedAt: true },
        take: 5000,
      });
      for (const l of listings) {
        entries.push({
          url: `${base}/annonce/${l.id}`,
          lastModified: l.updatedAt,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
      const providers = await prisma.providerProfile.findMany({
        select: { id: true, updatedAt: true },
        take: 5000,
      });
      for (const p of providers) {
        entries.push({
          url: `${base}/prestataire/${p.id}`,
          lastModified: p.updatedAt,
          changeFrequency: "weekly",
          priority: 0.5,
        });
      }
    } catch {
      // base indisponible : on garde uniquement les pages statiques
    }
  }

  return entries;
}
