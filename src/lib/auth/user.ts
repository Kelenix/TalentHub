import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.DATABASE_URL,
  );
}

/** Utilisateur courant (ligne applicative + profil) ou null. Ne lève jamais. */
export async function getCurrentUser() {
  if (!configured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const existing = await prisma.user.findUnique({
    where: { id: user.id },
    include: { profile: true },
  });
  if (existing) return existing;

  // Auto-réparation : session Supabase valide mais ligne applicative absente
  // (compte créé hors flux normal, données réinitialisées, etc.).
  try {
    return await prisma.user.create({
      data: {
        id: user.id,
        email: user.email ?? `${user.id}@unknown.local`,
        role: "PROVIDER",
        status: user.email_confirmed_at ? "ACTIVE" : "PENDING",
      },
      include: { profile: true },
    });
  } catch {
    // Création concurrente : on relit.
    return prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
  }
}

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Exige un utilisateur connecté, sinon redirige vers /connexion. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

/** Exige un prestataire dont le profil est complété. */
export async function requireProvider() {
  const user = await requireUser();
  if (!user.profile) redirect("/dashboard/profil");
  return { ...user, profile: user.profile };
}

/** Exige un administrateur. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") redirect("/connexion");
  return user;
}
