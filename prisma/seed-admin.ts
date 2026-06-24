import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";

function loadEnv() {
  try {
    for (const l of readFileSync(".env", "utf8").split("\n")) {
      const m = l.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
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
    // .env absent
  }
}
loadEnv();

const EMAIL = "admin@talenthub.test";
const PASSWORD = "Admin1234!";

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

  let userId: string | undefined;
  const created = await supabase.auth.admin.createUser({
    email: EMAIL,
    password: PASSWORD,
    email_confirm: true,
  });
  if (!created.error && created.data.user) {
    userId = created.data.user.id;
  } else {
    const list = await supabase.auth.admin.listUsers({ perPage: 1000 });
    const existing = list.data.users.find((u) => u.email === EMAIL);
    if (!existing) {
      console.error("❌", created.error?.message);
      process.exit(1);
    }
    userId = existing.id;
    await supabase.auth.admin.updateUserById(userId, {
      password: PASSWORD,
      email_confirm: true,
    });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: { email: EMAIL, role: "ADMIN", status: "ACTIVE" },
    create: { id: userId, email: EMAIL, role: "ADMIN", status: "ACTIVE" },
  });

  console.log("\n✅ Compte ADMINISTRATEUR prêt :");
  console.log("   ┌──────────────────────────────────────────");
  console.log(`   │ Email        : ${EMAIL}`                  );
  console.log(`   │ Mot de passe : ${PASSWORD}`               );
  console.log("   └──────────────────────────────────────────");
  console.log("   → Connexion sur /connexion, puis accès à /admin.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
