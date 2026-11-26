import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

/** Google sign-in lands here; the session is exchanged, then /welcome attaches a saved try. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next")?.startsWith("/") ? url.searchParams.get("next")! : "/today";
  const sb = await supabaseServer();
  if (code && sb) {
    const { error } = await sb.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(`/welcome?next=${encodeURIComponent(next)}`, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=google", url.origin));
}
