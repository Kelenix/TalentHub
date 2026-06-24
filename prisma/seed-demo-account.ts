import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
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
    // .env absent : on continue avec l'environnement existant
  }
}
loadEnv();

const EMAIL = "demo@talenthub.test";
const PASSWORD = "Demo1234!";

const prisma = new PrismaClient();

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("❌ Supabase non configuré dans .env.");
    process.exit(1);
  }
  const supabase = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // 1. Crée (ou réinitialise) l'utilisateur Supabase Auth — email confirmé d'office
  let userId: string | undefined;
  const created = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (created.error) {
    const list = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existing = list.data.users.find((u) => u.email === EMAIL);
    if (!existing) {
      console.error("❌", created.error.message);
      process.exit(1);
    }
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, {
      password: PASSWORD,
      email_confirm: true,
    });
  } else {
    userId = created.data.user?.id;
  }
  if (!userId) {
    console.error("❌ Impossible de créer le compte démo.");
    process.exit(1);
  }

  // 2. Référentiels
  const italy = await prisma.country.findUniqueOrThrow({ where: { iso: "IT" } });
  const cameroun = await prisma.country.findUniqueOrThrow({
    where: { iso: "CM" },
  });
  const milano = await prisma.city.findFirstOrThrow({
    where: { countryId: italy.id, name: "Milano" },
  });
  const cuisine = await prisma.category.findUniqueOrThrow({
    where: { slug: "cuisine" },
    include: { subcategories: true },
  });
  const sub = cuisine.subcategories.find((s) => s.slug === "camerounaise");

  // 3. Ligne applicative User + ProviderProfile (idempotent)
  await prisma.user.upsert({
    where: { id: userId },
    update: { email: EMAIL, status: "ACTIVE", role: "PROVIDER" },
    create: { id: userId, email: EMAIL, status: "ACTIVE", role: "PROVIDER" },
  });
  const profile = await prisma.providerProfile.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      firstName: "Démo",
      lastName: "Prestataire",
      description:
        "Compte de démonstration pour tester l'espace prestataire (modifier / supprimer librement).",
      countryOfOriginId: cameroun.id,
      cityId: milano.id,
      region: milano.region,
      whatsappNumber: "+39 351 000 9999",
      contactEmail: EMAIL,
      languages: ["Français", "Italien"],
      verified: true,
      photoUrl: "/img/im3.jpg",
    },
  });

  // 4. Quelques annonces si le compte est vide
  const count = await prisma.listing.count({
    where: { providerId: profile.id },
  });
  if (count === 0) {
    const demo = [
      { title: "Ndolé Camerounais (démo)", prep: "2 heures", img: "/img/ima1.jpg", views: 12 },
      { title: "Poulet DG (démo)", prep: "1 h 30", img: "/img/cuisine-1.jpg", views: 8 },
    ];
    for (const l of demo) {
      await prisma.listing.create({
        data: {
          providerId: profile.id,
          title: l.title,
          description:
            "Annonce de démonstration. Modifiez-la ou supprimez-la depuis votre tableau de bord.",
          categoryId: cuisine.id,
          subcategoryId: sub?.id ?? null,
          countryOfOriginId: cameroun.id,
          cityId: milano.id,
          region: milano.region,
          serviceZone: "Milano et environs",
          availability: "AVAILABLE",
          status: "PUBLISHED",
          publishedAt: new Date(),
          viewsCount: l.views,
          attributes: { dishOrigin: "Cameroun", preparationTime: l.prep },
          photos: { create: [{ url: l.img, order: 0, isCover: true }] },
        },
      });
    }
  }

  console.log("\n✅ Compte de démonstration prêt (connectable) :");
  console.log("   ┌──────────────────────────────────────────");
  console.log(`   │ Email        : ${EMAIL}`);
  console.log(`   │ Mot de passe : ${PASSWORD}`);
  console.log("   └──────────────────────────────────────────");
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
