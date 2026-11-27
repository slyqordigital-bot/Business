import "server-only";
import { redirect } from "next/navigation";
import { getUser, supabaseAdmin } from "../supabase/server";
import { getPlan, getPlans, type PlanState, type PublicPlan } from "../kwop";
import { QUOTAS, type Level } from "../plans";
import type { Answers } from "../ai";

export type Profile = {
  id: string;
  email: string | null;
  k: string | null;
  answers: Answers;
  gamer_tag: string | null;
  steam_id: string | null;
  steam_name: string | null;
  steam_avatar: string | null;
  steam_synced_at: string | null;
  tz_offset: number;
  seen_unlock: boolean;
  onboarded: boolean;
};

export type Ctx = {
  user: { id: string; email: string; name: string | null; avatar: string | null };
  profile: Profile;
  plan: PlanState;
  plans: PublicPlan[];
};

const COLS = "id,email,k,answers,gamer_tag,steam_id,steam_name,steam_avatar,steam_synced_at,tz_offset,seen_unlock,onboarded";

/** Everything a signed-in page or route needs. Null when signed out. */
export async function getCtx(opts: { fresh?: boolean } = {}): Promise<Ctx | null> {
  const { sb, user } = await getUser();
  if (!sb || !user?.email) return null;
  const [{ data: profile }, plan, { plans }] = await Promise.all([
    sb.from("profiles").select(COLS).eq("id", user.id).maybeSingle(),
    getPlan(user.email, opts),
    getPlans(),
  ]);
  const meta = (user.user_metadata || {}) as Record<string, string>;
  const p = (profile as Profile | null) ?? {
    id: user.id, email: user.email, k: null, answers: {}, gamer_tag: null, steam_id: null, steam_name: null,
    steam_avatar: null, steam_synced_at: null, tz_offset: 0, seen_unlock: false, onboarded: false,
  };
  return {
    user: { id: user.id, email: user.email, name: meta.full_name || meta.name || null, avatar: meta.avatar_url || null },
    profile: { ...p, answers: p.answers || {} },
    plan,
    plans,
  };
}

/** Start of the current billing period: one month before the renewal date, else the 1st of the month. */
export function periodStart(plan: PlanState) {
  const now = new Date();
  if (plan.until) {
    const d = new Date(plan.until);
    if (!isNaN(d.getTime())) {
      while (d > now) d.setMonth(d.getMonth() - 1);
      return d;
    }
  }
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
}

/** Quests cleared this billing period vs. the plan's quota. */
export async function questQuota(userId: string, plan: PlanState) {
  const admin = supabaseAdmin();
  const limit = QUOTAS[plan.level].quests;
  if (!admin) return { used: 0, limit, left: limit };
  const { count } = await admin
    .from("quests")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "done")
    .gte("completed_at", periodStart(plan).toISOString());
  const used = count ?? 0;
  return { used, limit, left: Math.max(0, limit - used) };
}

export function nextPlan(plans: PublicPlan[], level: Level) {
  return plans.find((p) => p.level === level + 1) ?? null;
}

/** For pages inside the app: signed in, onboarded and paid; otherwise back to where they stopped. */
export async function requirePaid(): Promise<Ctx> {
  const ctx = await getCtx();
  if (!ctx) redirect("/login");
  if (!ctx.plan.paid) redirect("/start");
  return ctx;
}

export async function requireCtx(): Promise<Ctx> {
  const ctx = await getCtx();
  if (!ctx) redirect("/login");
  return ctx;
}

/** Counts AI calls of a kind since a date (abuse and cost limits). */
export async function aiCount(userId: string, kind: string, sinceMs: number) {
  const admin = supabaseAdmin();
  if (!admin) return 0;
  const { count } = await admin
    .from("ai_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("kind", kind)
    .gte("created_at", new Date(Date.now() - sinceMs).toISOString());
  return count ?? 0;
}

export async function logAi(userId: string, kind: string) {
  await supabaseAdmin()?.from("ai_events").insert({ user_id: userId, kind });
}
