"use client";
import { createBrowserClient } from "@supabase/ssr";
import { env, supabaseReady } from "../env";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function supabaseBrowser() {
  if (!supabaseReady()) return null;
  if (!client) client = createBrowserClient(env.supabaseUrl, env.supabaseAnon);
  return client;
}
