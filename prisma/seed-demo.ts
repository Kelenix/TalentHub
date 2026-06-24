import { readFileSync } from "node:fs";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

// Charge .env (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
function loadEnv() {
  try {
    const txt = readFileSync(".env", "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
      if (m && !process.env[m[1]]) {
        let v = m[2].trim();
        if (
          (v.startsWith('"') && v.endsWith('"')) ||
          (v.startsWith("'") && v.endsWith("'"))
        )
          v = v.slice(1, -1);
        process.env[m[1]] = v;
      }
    }
  } catch {
    // .env absent : on continue
  }
}
loadEnv();

const DEMO_PASSWORD = "Demo1234!";
const prisma = new PrismaClient();

/** Crée (ou réinitialise le mot de passe d') un utilisateur Supabase Auth confirmé. */
async function ensureAuthUser(
  supabase: SupabaseClient,
  email: string,
): Promise<string> {
  const created = await supabase.auth.admin.createUser({
    email,
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  if (!created.error && created.data.user) return created.data.user.id;

  const list = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = list.data.users.find((u) => u.email === email);
  if (!existing) throw new Error(`Auth user introuvable: ${email}`);
  await supabase.auth.admin.updateUserById(existing.id, {
    password: DEMO_PASSWORD,
    email_confirm: true,
  });
  return existing.id;
}

// Pools d'images locales (public/img). Supprimables en fin de dev.
const imagePool: Record<string, string[]> = {
  cuisine: [
    "/img/ima1.jpg",
    "/img/im2.jpg",
    "/img/cuisine-1.jpg",
    "/img/cuisine-2.jpg",
    "/img/cuisine-3.jpg",
    "/img/cuisine-4.jpg",
    "/img/cuisine-5.jpg",
    "/img/cuisine-6.jpg",
  ],
  beaute: [
    "/img/beaute-1.jpg",
    "/img/beaute-2.jpg",
    "/img/beaute-3.jpg",
    "/img/beaute-4.jpg",
    "/img/beaute-5.jpg",
    "/img/beaute-6.jpg",
    "/img/im4.jpg",
  ],
  couture: [
    "/img/couture-1.jpg",
    "/img/couture-2.jpg",
    "/img/couture-3.jpg",
    "/img/couture-4.jpg",
    "/img/couture-5.jpg",
    "/img/couture-6.jpg",
  ],
  "services-divers": [
    "/img/services-1.jpg",
    "/img/services-2.jpg",
    "/img/services-3.jpg",
    "/img/services-4.jpg",
    "/img/services-5.jpg",
    "/img/services-6.jpg",
  ],
};

type ListingSpec = {
  title: string;
  sub: string;
  desc: string;
  prep?: string;
  available?: boolean;
  views: number;
};

type ProviderSpec = {
  first: string;
  last: string;
  origin: string; // iso
  city: string;
  category: string; // category slug
  avatar?: string;
  desc: string;
  langs: string[];
  listings: ListingSpec[];
};

const D = "Préparé / réalisé sur commande pour particuliers et événements. Qualité et soin garantis, contact direct.";

const providers: ProviderSpec[] = [
  {
    first: "Aïcha", last: "Mballa", origin: "CM", city: "Milano", category: "cuisine",
    desc: "Cuisinière passionnée depuis plus de 10 ans, spécialités camerounaises authentiques à Milano et alentours.",
    langs: ["Français", "Anglais", "Italien"],
    listings: [
      { title: "Ndolé Camerounais", sub: "camerounaise", desc: D, prep: "2 heures", views: 248 },
      { title: "Poulet DG & plantains", sub: "camerounaise", desc: D, prep: "1 h 30", views: 176 },
      { title: "Eru & water fufu", sub: "camerounaise", desc: D, prep: "2 heures", available: false, views: 92 },
      { title: "Okok (koki) traditionnel", sub: "camerounaise", desc: D, prep: "3 heures", views: 134 },
      { title: "Sauce gombo & bâton de manioc", sub: "camerounaise", desc: D, prep: "2 heures", views: 88 },
      { title: "Beignets haricot (puff-puff)", sub: "camerounaise", desc: D, prep: "1 heure", views: 201 },
    ],
  },
  {
    first: "Mariama", last: "Sow", origin: "SN", city: "Torino", category: "cuisine",
    desc: "Saveurs sénégalaises maison, plats généreux pour familles et célébrations à Torino.",
    langs: ["Français", "Wolof", "Italien"],
    listings: [
      { title: "Thiéboudienne complet", sub: "senegalaise", desc: D, prep: "3 heures", views: 312 },
      { title: "Mafé bœuf & riz", sub: "senegalaise", desc: D, prep: "2 heures", views: 145 },
      { title: "Poulet Yassa", sub: "senegalaise", desc: D, prep: "1 h 30", views: 220 },
      { title: "Domoda (sauce arachide)", sub: "senegalaise", desc: D, prep: "2 heures", views: 76 },
      { title: "Pastels (fataya) poisson", sub: "senegalaise", desc: D, prep: "1 h 30", available: false, views: 64 },
      { title: "Thiakry (dessert)", sub: "senegalaise", desc: D, prep: "45 min", views: 99 },
    ],
  },
  {
    first: "Fatou", last: "Koné", origin: "CI", city: "Roma", category: "beaute",
    avatar: "/img/im4.jpg",
    desc: "Coiffeuse spécialisée en tresses et coiffures protectrices, pose soignée pour tous types de cheveux.",
    langs: ["Français", "Italien"],
    listings: [
      { title: "Knotless Braids", sub: "tresses", desc: D, prep: "4 heures", views: 203 },
      { title: "Box Braids classiques", sub: "tresses", desc: D, prep: "5 heures", views: 167 },
      { title: "Cornrows / nattes collées", sub: "tresses", desc: D, prep: "2 heures", views: 142 },
      { title: "Twists sénégalais", sub: "tresses", desc: D, prep: "4 heures", views: 118 },
      { title: "Crochet braids", sub: "tresses", desc: D, prep: "2 h 30", available: false, views: 73 },
      { title: "Tresses enfant", sub: "coiffure", desc: D, prep: "1 h 30", views: 95 },
    ],
  },
  {
    first: "Grace", last: "Okoro", origin: "NG", city: "Milano", category: "beaute",
    desc: "Maquilleuse & prothésiste ongulaire, mises en beauté pour mariages et événements.",
    langs: ["Anglais", "Italien"],
    listings: [
      { title: "Maquillage mariage", sub: "maquillage", desc: D, prep: "1 h 30", views: 188 },
      { title: "Maquillage soirée", sub: "maquillage", desc: D, prep: "1 heure", views: 132 },
      { title: "Pose d'ongles & nail art", sub: "onglerie", desc: D, prep: "1 h 30", views: 156 },
      { title: "Soin visage éclat", sub: "maquillage", desc: D, prep: "1 heure", views: 84 },
      { title: "Perruque sur-mesure (pose)", sub: "coiffure", desc: D, prep: "2 heures", views: 121 },
      { title: "Entretien locks", sub: "coiffure", desc: D, prep: "2 heures", available: false, views: 67 },
    ],
  },
  {
    first: "Ibrahim", last: "Traoré", origin: "ML", city: "Bologna", category: "couture",
    avatar: "/img/im3.jpg",
    desc: "Tailleur sur-mesure, créations africaines et retouches soignées à Bologna.",
    langs: ["Français", "Bambara", "Italien"],
    listings: [
      { title: "Boubou homme sur-mesure", sub: "couture-africaine", desc: D, prep: "Sur rendez-vous", views: 142 },
      { title: "Ensemble traditionnel homme", sub: "couture-africaine", desc: D, prep: "Sur rendez-vous", views: 110 },
      { title: "Robe en pagne (wax)", sub: "couture-africaine", desc: D, prep: "Sur rendez-vous", views: 176 },
      { title: "Costume sur-mesure", sub: "creation-vetements", desc: D, prep: "Sur rendez-vous", views: 134 },
      { title: "Tenue de mariage", sub: "creation-vetements", desc: D, prep: "Sur rendez-vous", views: 205 },
      { title: "Retouches express", sub: "retouches", desc: D, prep: "48 h", available: false, views: 58 },
    ],
  },
  {
    first: "Abena", last: "Mensah", origin: "GH", city: "Firenze", category: "couture",
    desc: "Créatrice de vêtements en pagne et retouches, pièces uniques pour toute la famille.",
    langs: ["Anglais", "Italien"],
    listings: [
      { title: "Robe de soirée sur-mesure", sub: "creation-vetements", desc: D, prep: "Sur rendez-vous", views: 164 },
      { title: "Jupe & top en wax", sub: "couture-africaine", desc: D, prep: "Sur rendez-vous", views: 121 },
      { title: "Tenue enfant en pagne", sub: "couture-africaine", desc: D, prep: "Sur rendez-vous", views: 89 },
      { title: "Ourlets & retouches", sub: "retouches", desc: D, prep: "24-48 h", views: 73 },
      { title: "Chemise sur-mesure", sub: "creation-vetements", desc: D, prep: "Sur rendez-vous", views: 102 },
      { title: "Accessoires en pagne", sub: "couture-africaine", desc: D, prep: "Sur rendez-vous", available: false, views: 47 },
    ],
  },
  {
    first: "David", last: "Mavungu", origin: "CG", city: "Napoli", category: "services-divers",
    avatar: "/img/im3.jpg",
    desc: "Technicien informatique et logistique, dépannage rapide et transport à Napoli.",
    langs: ["Français", "Lingala", "Italien"],
    listings: [
      { title: "Réparation PC & téléphones", sub: "reparation", desc: D, prep: "Diagnostic gratuit", views: 210 },
      { title: "Dépannage informatique à domicile", sub: "informatique", desc: D, prep: "Sur RDV", views: 154 },
      { title: "Installation TV / box internet", sub: "reparation", desc: D, prep: "Sur RDV", views: 98 },
      { title: "Récupération de données", sub: "informatique", desc: D, prep: "Sur devis", available: false, views: 61 },
      { title: "Déménagement & transport", sub: "transport", desc: D, prep: "Sur devis", views: 133 },
      { title: "Livraison express", sub: "transport", desc: D, prep: "Le jour même", views: 87 },
    ],
  },
  {
    first: "Youssef", last: "El Amrani", origin: "MA", city: "Roma", category: "services-divers",
    desc: "Soutien scolaire, traduction et aide administrative pour la communauté à Roma.",
    langs: ["Français", "Arabe", "Italien"],
    listings: [
      { title: "Soutien scolaire maths", sub: "soutien-scolaire", desc: D, prep: "Collège & lycée", views: 178 },
      { title: "Cours d'italien débutant", sub: "soutien-scolaire", desc: D, prep: "En ligne / présentiel", views: 142 },
      { title: "Traduction FR / IT / AR", sub: "traduction", desc: D, prep: "Sous 48 h", views: 165 },
      { title: "Aide administrative & démarches", sub: "traduction", desc: D, prep: "Sur RDV", views: 119 },
      { title: "Ménage à domicile", sub: "menage", desc: D, prep: "Sur RDV", views: 96 },
      { title: "Garde d'enfants", sub: "menage", desc: D, prep: "Sur RDV", available: false, views: 54 },
    ],
  },
];

async function main() {
  console.log("🌱 Seed démo TalentHub (jeu étoffé)…");

  // 1. Purge des données de démonstration existantes (cascade users → profils → annonces → photos)
  await prisma.user.deleteMany({
    where: { email: { endsWith: "@talenthub.test" } },
  });

  // 2. Référentiels
  const italy = await prisma.country.findUniqueOrThrow({ where: { iso: "IT" } });
  const countries = await prisma.country.findMany();
  const isoToId = new Map(countries.map((c) => [c.iso, c.id]));
  const isoToName = new Map(countries.map((c) => [c.iso, c.name]));
  const cities = await prisma.city.findMany({ where: { countryId: italy.id } });
  const cityByName = new Map(cities.map((c) => [c.name, c]));
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
  });
  const catBySlug = new Map(categories.map((c) => [c.slug, c]));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error(
      "❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY manquants dans .env",
    );
    process.exit(1);
  }
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const credentials: string[] = [];

  let total = 0;

  for (const p of providers) {
    const category = catBySlug.get(p.category);
    if (!category) throw new Error(`Catégorie inconnue: ${p.category}`);
    const subBySlug = new Map(
      category.subcategories.map((s) => [s.slug, s.id]),
    );
    const city = cityByName.get(p.city);
    if (!city) throw new Error(`Ville inconnue: ${p.city}`);
    const originId = isoToId.get(p.origin) ?? null;
    const pool = imagePool[p.category] ?? [];
    const email = `${p.first}.${p.last}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z]/g, "")
      .concat("@talenthub.test");
    const authId = await ensureAuthUser(supabase, email);
    credentials.push(email);

    await prisma.user.create({
      data: {
        id: authId,
        email,
        status: "ACTIVE",
        profile: {
          create: {
            firstName: p.first,
            lastName: p.last,
            description: p.desc,
            photoUrl: p.avatar ?? null,
            countryOfOriginId: originId,
            cityId: city.id,
            region: city.region,
            whatsappNumber: "+39 351 000 00" + String(total).padStart(2, "0"),
            contactEmail: email,
            languages: p.langs,
            verified: true,
            listings: {
              create: p.listings.map((l, i) => {
                const attributes: Record<string, string> = {};
                if (l.prep) attributes.preparationTime = l.prep;
                if (p.category === "cuisine")
                  attributes.dishOrigin = isoToName.get(p.origin) ?? "";
                const img = pool[(i + total) % pool.length];
                return {
                  title: l.title,
                  description: l.desc,
                  categoryId: category.id,
                  subcategoryId: subBySlug.get(l.sub) ?? null,
                  countryOfOriginId: originId,
                  cityId: city.id,
                  region: city.region,
                  serviceZone: `${p.city} et environs`,
                  availability:
                    l.available === false ? "UNAVAILABLE" : "AVAILABLE",
                  status: "PUBLISHED",
                  publishedAt: new Date(),
                  viewsCount: l.views,
                  attributes:
                    Object.keys(attributes).length > 0 ? attributes : undefined,
                  photos: { create: [{ url: img, order: 0, isCover: true }] },
                };
              }),
            },
          },
        },
      },
    });
    total += p.listings.length;
  }

  console.log(`  ✓ ${providers.length} prestataires, ${total} annonces`);
  console.log("\n✅ Comptes de démonstration CONNECTABLES :");
  console.log("   ┌────────────────────────────────────────────────");
  console.log(`   │ Mot de passe commun : ${DEMO_PASSWORD}`);
  console.log("   ├────────────────────────────────────────────────");
  for (const email of credentials) {
    console.log(`   │ ${email}`);
  }
  console.log("   └────────────────────────────────────────────────");
  console.log("   → Connexion sur /connexion, puis /dashboard.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
