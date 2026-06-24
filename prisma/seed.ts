import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ── Catégories & sous-catégories (cf. cahier des charges §5) ──
const categories: {
  name: string;
  slug: string;
  icon: string;
  order: number;
  subcategories: { name: string; slug: string }[];
}[] = [
  {
    name: "Cuisine",
    slug: "cuisine",
    icon: "utensils",
    order: 1,
    subcategories: [
      { name: "Camerounaise", slug: "camerounaise" },
      { name: "Ivoirienne", slug: "ivoirienne" },
      { name: "Sénégalaise", slug: "senegalaise" },
      { name: "Congolaise", slug: "congolaise" },
      { name: "Nigériane", slug: "nigeriane" },
      { name: "Ghanéenne", slug: "ghaneenne" },
      { name: "Marocaine", slug: "marocaine" },
    ],
  },
  {
    name: "Beauté",
    slug: "beaute",
    icon: "scissors",
    order: 2,
    subcategories: [
      { name: "Tresses", slug: "tresses" },
      { name: "Coiffure", slug: "coiffure" },
      { name: "Maquillage", slug: "maquillage" },
      { name: "Onglerie", slug: "onglerie" },
    ],
  },
  {
    name: "Couture",
    slug: "couture",
    icon: "shirt",
    order: 3,
    subcategories: [
      { name: "Couture africaine", slug: "couture-africaine" },
      { name: "Retouches", slug: "retouches" },
      { name: "Création de vêtements", slug: "creation-vetements" },
    ],
  },
  {
    name: "Services divers",
    slug: "services-divers",
    icon: "wrench",
    order: 4,
    subcategories: [
      { name: "Informatique", slug: "informatique" },
      { name: "Réparation", slug: "reparation" },
      { name: "Traduction", slug: "traduction" },
      { name: "Soutien scolaire", slug: "soutien-scolaire" },
      { name: "Transport", slug: "transport" },
      { name: "Ménage", slug: "menage" },
    ],
  },
];

// ── Pays (Italie = pays hôte + pays d'origine de la diaspora) ──
const countries: { name: string; iso: string }[] = [
  { name: "Italie", iso: "IT" },
  { name: "Cameroun", iso: "CM" },
  { name: "Côte d'Ivoire", iso: "CI" },
  { name: "Sénégal", iso: "SN" },
  { name: "Congo", iso: "CG" },
  { name: "RD Congo", iso: "CD" },
  { name: "Nigeria", iso: "NG" },
  { name: "Ghana", iso: "GH" },
  { name: "Maroc", iso: "MA" },
  { name: "Mali", iso: "ML" },
  { name: "Togo", iso: "TG" },
  { name: "Bénin", iso: "BJ" },
  { name: "Gabon", iso: "GA" },
  { name: "Guinée", iso: "GN" },
];

// ── Villes d'Italie (V1) ──
const italianCities: { name: string; region: string }[] = [
  { name: "Milano", region: "Lombardia" },
  { name: "Roma", region: "Lazio" },
  { name: "Napoli", region: "Campania" },
  { name: "Torino", region: "Piemonte" },
  { name: "Bologna", region: "Emilia-Romagna" },
  { name: "Firenze", region: "Toscana" },
  { name: "Brescia", region: "Lombardia" },
  { name: "Bergamo", region: "Lombardia" },
  { name: "Verona", region: "Veneto" },
  { name: "Padova", region: "Veneto" },
  { name: "Genova", region: "Liguria" },
  { name: "Palermo", region: "Sicilia" },
  { name: "Bari", region: "Puglia" },
  { name: "Venezia", region: "Veneto" },
];

async function main() {
  console.log("🌱 Seed TalentHub…");

  // Catégories + sous-catégories
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: cat.order },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, order: cat.order },
    });
    for (const [i, sub] of cat.subcategories.entries()) {
      await prisma.subcategory.upsert({
        where: { categoryId_slug: { categoryId: category.id, slug: sub.slug } },
        update: { name: sub.name, order: i + 1 },
        create: { categoryId: category.id, name: sub.name, slug: sub.slug, order: i + 1 },
      });
    }
  }
  console.log(`  ✓ ${categories.length} catégories`);

  // Pays
  for (const c of countries) {
    await prisma.country.upsert({
      where: { iso: c.iso },
      update: { name: c.name },
      create: { name: c.name, iso: c.iso },
    });
  }
  console.log(`  ✓ ${countries.length} pays`);

  // Villes d'Italie
  const italy = await prisma.country.findUniqueOrThrow({ where: { iso: "IT" } });
  for (const city of italianCities) {
    await prisma.city.upsert({
      where: { countryId_name: { countryId: italy.id, name: city.name } },
      update: { region: city.region },
      create: { countryId: italy.id, name: city.name, region: city.region },
    });
  }
  console.log(`  ✓ ${italianCities.length} villes (Italie)`);

  console.log("✅ Seed terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
