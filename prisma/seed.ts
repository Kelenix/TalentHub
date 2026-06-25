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
  // Pays de service (Europe) — V1 Italie, extension Europe
  { name: "Italie", iso: "IT" },
  { name: "France", iso: "FR" },
  { name: "Belgique", iso: "BE" },
  { name: "Espagne", iso: "ES" },
  { name: "Allemagne", iso: "DE" },
  { name: "Portugal", iso: "PT" },
  { name: "Pays-Bas", iso: "NL" },
  { name: "Suisse", iso: "CH" },
  { name: "Royaume-Uni", iso: "GB" },
  // Pays d'origine (diaspora)
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

// ── Villes par pays de service (Europe) ──
const citiesByCountry: Record<string, { name: string; region: string }[]> = {
  FR: [
    { name: "Paris", region: "Île-de-France" },
    { name: "Lyon", region: "Auvergne-Rhône-Alpes" },
    { name: "Marseille", region: "PACA" },
    { name: "Lille", region: "Hauts-de-France" },
    { name: "Toulouse", region: "Occitanie" },
    { name: "Bordeaux", region: "Nouvelle-Aquitaine" },
  ],
  BE: [
    { name: "Bruxelles", region: "Bruxelles-Capitale" },
    { name: "Anvers", region: "Flandre" },
    { name: "Liège", region: "Wallonie" },
    { name: "Charleroi", region: "Wallonie" },
  ],
  ES: [
    { name: "Madrid", region: "Communauté de Madrid" },
    { name: "Barcelone", region: "Catalogne" },
    { name: "Valence", region: "Communauté valencienne" },
    { name: "Séville", region: "Andalousie" },
  ],
  DE: [
    { name: "Berlin", region: "Berlin" },
    { name: "Munich", region: "Bavière" },
    { name: "Francfort", region: "Hesse" },
    { name: "Cologne", region: "Rhénanie-du-Nord-Westphalie" },
  ],
  PT: [
    { name: "Lisbonne", region: "Lisbonne" },
    { name: "Porto", region: "Nord" },
  ],
  NL: [
    { name: "Amsterdam", region: "Hollande-Septentrionale" },
    { name: "Rotterdam", region: "Hollande-Méridionale" },
  ],
  CH: [
    { name: "Genève", region: "Genève" },
    { name: "Zurich", region: "Zurich" },
    { name: "Lausanne", region: "Vaud" },
  ],
  GB: [
    { name: "Londres", region: "Grand Londres" },
    { name: "Manchester", region: "Grand Manchester" },
    { name: "Birmingham", region: "West Midlands" },
  ],
};

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

  // Villes des autres pays de service (extension Europe)
  let euCount = 0;
  for (const [iso, cities] of Object.entries(citiesByCountry)) {
    const country = await prisma.country.findUniqueOrThrow({ where: { iso } });
    for (const city of cities) {
      await prisma.city.upsert({
        where: { countryId_name: { countryId: country.id, name: city.name } },
        update: { region: city.region },
        create: { countryId: country.id, name: city.name, region: city.region },
      });
      euCount++;
    }
  }
  console.log(`  ✓ ${euCount} villes (autres pays d'Europe)`);

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
