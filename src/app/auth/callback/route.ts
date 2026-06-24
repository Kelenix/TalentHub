import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

/** Callback de confirmation d'email Supabase : échange le code, active le compte. */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  let destination = "/dashboard";
  if (code && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user && process.env.DATABASE_URL) {
      try {
        await prisma.user.update({
          where: { id: data.user.id },
          data: { status: "ACTIVE" },
        });
        await prisma.providerProfile
          .update({ where: { userId: data.user.id }, data: { verified: true } })
          .catch(() => null);
        const dbUser = await prisma.user.findUnique({
          where: { id: data.user.id },
          select: { role: true },
        });
        if (dbUser?.role === "ADMIN") destination = "/admin";
      } catch {
        // ignoré
      }
    }
  }

  return NextResponse.redirect(`${origin}${destination}`);
}
