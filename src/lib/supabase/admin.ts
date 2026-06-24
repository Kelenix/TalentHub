import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase avec la clé service role.
 * SERVEUR UNIQUEMENT — contourne les politiques RLS. Ne jamais importer côté client.
 * Usage : tâches admin/back-office (modération, gestion d'utilisateurs).
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
