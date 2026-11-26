import "server-only";
import { getUser, supabaseAdmin } from "../supabase/server";
import { getPlan, getPlans, type PlanState, type PublicPlan } from "../kwop";
import { QUOTAS, type Level } from "../plans";

export type Profile = {
  id: string;
  email: string | null;
  k: string | null;
  goals: { kcal: number; protein: number; carbs: number; fat: number };
  tz_offset: number;
  seen_unlock: boolean;
};

export type Ctx = {
  user: { id: string; email: string; name: string | null; avatar: string | null };
  profile: Profile | null;
  plan: PlanState;
  plans: PublicPlan[];
};

/** Everything a signed-in page or route needs. Null when signed out. */
export async function getCtx(opts: { fresh?: boolean } = {}): Promise<Ctx | null> {
  const { sb, user } = await getUser();
  if (!sb || !user?.email) return null;
  const [{ data: profile }, plan, { plans }] = await Promise.all([
    sb.from("profiles").select("id,email,k,goals,tz_offset,seen_unlock").eq("id", user.id).maybeSingle(),
    getPlan(user.email, opts),
    getPlans(),
  ]);
  const meta = (user.user_metadata || {}) as Record<string, string>;
  return {
    user: { id: user.id, email: user.email, name: meta.full_name || meta.name || null, avatar: meta.avatar_url || null },
    profile: (profile as Profile) ?? null,
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

export async function scansUsed(userId: string, plan: PlanState) {
  const admin = supabaseAdmin();
  if (!admin) return 0;
  const { count } = await admin
    .from("scan_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", periodStart(plan).toISOString());
  return count ?? 0;
}

export async function quota(userId: string, plan: PlanState) {
  const limit = QUOTAS[plan.level].scans;
  const used = await scansUsed(userId, plan);
  return { used, limit, left: Math.max(0, limit - used) };
}

export function nextPlan(plans: PublicPlan[], level: Level) {
  return plans.find((p) => p.level === level + 1) ?? null;
}
