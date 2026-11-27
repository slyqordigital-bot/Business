import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdmin } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { env, supabaseReady } from "../env";

/** Supabase as the signed-in user (RLS applies). Null when Supabase is not configured yet. */
export async function supabaseServer() {
  if (!supabaseReady()) return null;
  const store = await cookies();
  return createServerClient(env.supabaseUrl, env.supabaseAnon, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          /* called from a server component: middleware refreshes the session */
        }
      },
    },
  });
}

/** Service-role client for server-only work (anonymous tries, quotas, deletes). */
export function supabaseAdmin() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseReady() || !key) return null;
  return createAdmin(env.supabaseUrl, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

export async function getUser() {
  const sb = await supabaseServer();
  if (!sb) return { sb: null, user: null };
  const { data } = await sb.auth.getUser();
  return { sb, user: data.user };
}
