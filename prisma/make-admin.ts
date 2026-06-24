import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Promeut un utilisateur existant en ADMIN.
 * Usage : npx tsx prisma/make-admin.ts <email>
 * (l'utilisateur doit d'abord s'être inscrit via le site)
 */
async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage : npx tsx prisma/make-admin.ts <email>");
    process.exit(1);
  }
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`❌ Aucun utilisateur avec l'email ${email}.`);
    console.error("   Inscris-toi d'abord sur le site, puis relance ce script.");
    process.exit(1);
  }
  await prisma.user.update({
    where: { email },
    data: { role: "ADMIN", status: "ACTIVE" },
  });
  console.log(`✅ ${email} est maintenant ADMIN.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
