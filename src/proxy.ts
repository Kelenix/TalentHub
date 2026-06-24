import createIntlMiddleware from "next-intl/middleware";
import type { NextRequest } from "next/server";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";

const intlMiddleware = createIntlMiddleware(routing);

// Next.js 16 « proxy » (ex-middleware) : routing i18n + refresh session Supabase.
export default async function proxy(request: NextRequest) {
  // 1. Routing i18n (préfixe de langue, redirections)
  const response = intlMiddleware(request);
  // 2. Rafraîchit la session Supabase en recopiant les cookies sur la réponse i18n
  return updateSession(request, response);
}

export const config = {
  // Toutes les routes sauf api, auth (callback Supabase), assets statiques et fichiers.
  matcher: ["/((?!api|auth|_next|_vercel|.*\\..*).*)"],
};
