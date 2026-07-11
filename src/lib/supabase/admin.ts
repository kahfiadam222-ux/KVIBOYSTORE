import { createClient } from "@supabase/supabase-js";

// Service-role client: bypasses RLS, so it must only ever be imported from
// server-only code (server actions, route handlers) — never from a Client Component.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
