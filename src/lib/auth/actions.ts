"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { notifyAdmins } from "@/lib/notifications/service";

export type AuthState = { error?: string; success?: boolean };

const signUpSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  whatsappNumber: z.string().min(5),
  email: z.string().email(),
  password: z.string().min(8),
});

function supabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export async function signUpAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = signUpSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      error:
        "Champs invalides. Vérifiez vos informations (mot de passe ≥ 8 caractères).",
    };
  }
  if (!supabaseConfigured()) return { error: "Supabase n'est pas configuré." };

  const { firstName, lastName, whatsappNumber, email, password } = parsed.data;
  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });
  if (error) return { error: error.message };

  if (data.user && process.env.DATABASE_URL) {
    try {
      await prisma.user.upsert({
        where: { id: data.user.id },
        update: {},
        create: {
          id: data.user.id,
          email,
          role: "PROVIDER",
          status: "PENDING",
          profile: {
            create: { firstName, lastName, whatsappNumber, contactEmail: email },
          },
        },
      });
    } catch {
      // ligne déjà existante : on ignore
    }
    await notifyAdmins({
      type: "NEW_USER",
      title: "Nouvelle inscription",
      body: `${firstName} ${lastName} · ${email}`,
      link: "/admin/utilisateurs",
    });
  }

  return { success: true };
}

export async function signInAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Email et mot de passe requis." };
  if (!supabaseConfigured()) return { error: "Supabase n'est pas configuré." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) return { error: "Identifiants incorrects." };

  // Redirection selon le rôle : admin → back-office, prestataire → tableau de bord
  let destination = "/dashboard";
  if (data.user && process.env.DATABASE_URL) {
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      select: { role: true },
    });
    if (dbUser?.role === "ADMIN") destination = "/admin";
  }
  redirect(destination);
}

export async function signOutAction() {
  if (supabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  redirect("/");
}
