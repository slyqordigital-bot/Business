import "server-only";
import type { Level } from "./plans";

/** Server-only client for Kwop (payments, plans, owner dashboard). Never import from a client component. */
const API = process.env.KWOP_API || "";

export type KwopPlan = {
  id: number;
  name: string;
  price_cents: number;
  currency: string;
  interval: string;
  per_day: string;
  yearly: { price_cents: number; per_day: string } | null;
};

export type PublicPlan = KwopPlan & { level: 1 | 2 | 3; featured: boolean };

let plansCache: { at: number; plans: PublicPlan[]; checkout: string | null } | null = null;

async function kfetch(path: string, init?: RequestInit) {
  if (!API) throw new Error("KWOP_API is not set");
  return fetch(API + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
    signal: init?.signal ?? AbortSignal.timeout(10_000),
  });
}

/** Plans sorted cheapest first, with their level (1..3). Cached 5 minutes. */
export async function getPlans(): Promise<{ plans: PublicPlan[]; checkout: string | null }> {
  if (plansCache && Date.now() - plansCache.at < 300_000) return plansCache;
  try {
    const r = await kfetch("");
    const j = await r.json();
    const sorted: KwopPlan[] = [...(j.plans || [])].sort((a, b) => a.price_cents - b.price_cents).slice(0, 3);
    const plans = sorted.map((p, i) => ({
      id: p.id,
      name: p.name,
      price_cents: p.price_cents,
      currency: p.currency,
      interval: p.interval,
      per_day: p.per_day,
      yearly: p.yearly,
      level: (i + 1) as 1 | 2 | 3,
      featured: i === Math.min(1, sorted.length - 1),
    }));
    plansCache = { at: Date.now(), plans, checkout: j.checkout ?? null };
    return plansCache;
  } catch (e) {
    console.error("[kwop] getPlans failed", e);
    if (plansCache) return plansCache;
    return { plans: [], checkout: null };
  }
}

export type PlanState = {
  paid: boolean;
  plan: { id: number; name: string } | null;
  status: string | null;
  until: string | null;
  level: Level;
};

const planCache = new Map<string, { at: number; v: PlanState }>();

/** The user's plan, from Kwop only (never the browser). Cached 60 s per email. */
export async function getPlan(email: string | null | undefined, opts: { fresh?: boolean } = {}): Promise<PlanState> {
  const none: PlanState = { paid: false, plan: null, status: null, until: null, level: 0 };
  if (!email) return none;
  const key = email.toLowerCase();
  // local development only: preview the paid app as one test email (never active in production builds)
  if (process.env.NODE_ENV === "development" && process.env.DEV_PAID_EMAIL && process.env.DEV_PAID_EMAIL.toLowerCase() === key) {
    const { plans } = await getPlans();
    const lvl = Number(process.env.DEV_PAID_LEVEL || 2) as 1 | 2 | 3;
    const p = plans.find((x) => x.level === lvl);
    return { paid: true, plan: p ? { id: p.id, name: p.name } : null, status: "active", until: new Date(Date.now() + 20 * 86_400_000).toISOString(), level: lvl };
  }
  const hit = planCache.get(key);
  if (!opts.fresh && hit && Date.now() - hit.at < 60_000) return hit.v;
  try {
    const r = await kfetch(`/plan?email=${encodeURIComponent(key)}`);
    if (!r.ok) throw new Error(`plan ${r.status}`);
    const j = await r.json();
    const { plans } = await getPlans();
    const match = j.plan ? plans.find((p) => p.id === j.plan.id) : undefined;
    const level: Level = j.paid ? (match?.level ?? 1) : 0;
    const v: PlanState = { paid: Boolean(j.paid), plan: j.plan ?? null, status: j.status ?? null, until: j.until ?? null, level };
    planCache.set(key, { at: Date.now(), v });
    return v;
  } catch (e) {
    console.error("[kwop] getPlan failed, keeping last known plan", e);
    return hit?.v ?? none;
  }
}

export async function createCheckout(body: { plan: number; period: "month" | "year"; email: string; k?: string | null }) {
  // a buyer is waiting: give Kwop 20 s, and try once more if it timed out or failed to answer (an unpaid checkout costs nothing)
  const once = () => kfetch("/checkout", { method: "POST", body: JSON.stringify({ ...body, k: body.k || undefined }), signal: AbortSignal.timeout(20_000) });
  let r: Response;
  try {
    r = await once();
    if (r.status >= 500) r = await once();
  } catch (e) {
    console.warn("[kwop] checkout slow, retrying once", (e as Error)?.name);
    r = await once();
  }
  const j = await r.json().catch(() => ({}));
  return { status: r.status, body: j as { embed?: unknown; ref?: string; fallback_url?: string; error?: string } };
}

export async function confirmCheckout(ref: string) {
  const r = await kfetch("/confirm", { method: "POST", body: JSON.stringify({ ref }) });
  return (await r.json().catch(() => ({}))) as { ok?: boolean; paid?: boolean };
}

export async function cancelPlan(email: string, exceptRef?: string) {
  const r = await kfetch("/cancel", {
    method: "POST",
    body: JSON.stringify(exceptRef ? { email, except_ref: exceptRef } : { email }),
  });
  planCache.delete(email.toLowerCase());
  return (await r.json().catch(() => ({}))) as { message?: string; manage_url?: string };
}

export type KwopEvent = "signup" | "onboarding_done" | "aha" | "paywall_view" | "feature_used";

/** Fire-and-forget: never blocks, never throws. */
export function track(type: KwopEvent, email: string | null | undefined, detail?: string) {
  if (!API || !email) return;
  kfetch("/event", { method: "POST", body: JSON.stringify({ type, email, detail }) }).catch((e) =>
    console.error("[kwop] event failed", type, e?.message),
  );
}

export function perDay(cents: number, days: number) {
  return `$${(cents / 100 / days).toFixed(2)}`;
}
