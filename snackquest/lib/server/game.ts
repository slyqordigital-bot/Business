import "server-only";
import { supabaseAdmin } from "../supabase/server";
import { POINTS, QUOTAS, GOAL_MATCH, hasFeature, type Level } from "../plans";
import { generateQuests, type Answers } from "../ai";
import { dayKey } from "../utils";

export type Reward = { id: number; name: string; kind: string; blurb: string; cost: number; icon: string };

export function admin() {
  const a = supabaseAdmin();
  if (!a) throw new Error("Supabase is not configured");
  return a;
}

export async function balance(userId: string) {
  const { data } = await admin().rpc("points_balance", { uid: userId });
  return Number(data ?? 0);
}

export async function rewards(): Promise<Reward[]> {
  const { data } = await admin().from("rewards").select("id,name,kind,blurb,cost,icon").eq("active", true).order("sort");
  return (data as Reward[]) || [];
}

export function goalReward(list: Reward[], goal?: string) {
  const key = GOAL_MATCH[goal || ""] || "Headset";
  return list.find((r) => r.name.toLowerCase().includes(key.toLowerCase())) ?? list[list.length - 1] ?? null;
}

/** Average points of one quest with the usual rarity mix (4 common, 2 rare, 1 legendary). */
const AVG_QUEST = (4 * POINTS.rarity.common + 2 * POINTS.rarity.rare + POINTS.rarity.legendary) / 7;

const PLAY_MIN: Record<string, number> = { "After school or work": 90, "Late night": 120, Weekends: 60, "All the time": 150 };

/** Points a day at a plan's pace, from their schedule (an honest estimate, shown as one). */
export function dailyPace(level: Level, when?: string) {
  const q = QUOTAS[level === 0 ? 2 : level];
  const questsPerDay = Math.min(q.quests / 30, 2.5);
  const minutes = Math.min(PLAY_MIN[when || ""] ?? 90, POINTS.dailyMinutesCap);
  return Math.round((questsPerDay * AVG_QUEST + minutes / POINTS.perMinutes) * q.multiplier);
}

export function projection(bal: number, pace: number, cost: number) {
  const days = pace > 0 ? Math.max(0, Math.ceil((cost - bal) / pace)) : null;
  const date = days === null ? null : new Date(Date.now() + days * 86_400_000);
  return { days, date: date?.toISOString() ?? null, in30: bal + pace * 30 };
}

/** Builds a quest run with the AI and saves it. Returns the run id. */
export async function buildRun(userId: string, a: Answers, opts: { avoid?: string[] } = {}) {
  const db = admin();
  const list = await rewards();
  const goal = goalReward(list, a.goal);
  const gen = await generateQuests(a, 7, opts.avoid);
  const { data: run, error } = await db
    .from("runs")
    .insert({ user_id: userId, title: gen.title, game: a.game || "Games", snack: a.snack || "Snacks", goal_reward_id: goal?.id ?? null })
    .select("id")
    .single();
  if (error || !run) throw error || new Error("run insert");
  const rows = gen.quests.map((q, i) => ({
    user_id: userId,
    run_id: run.id,
    position: i,
    title: q.title,
    rule: q.rule,
    proof: q.proof,
    rarity: q.rarity,
    points: POINTS.rarity[q.rarity],
  }));
  // the first quest is always a common one (the clear part of the teaser)
  const first = rows.findIndex((r) => r.rarity === "common");
  if (first > 0) [rows[0], rows[first]] = [rows[first], rows[0]];
  rows.forEach((r, i) => (r.position = i));
  const { error: qe } = await db.from("quests").insert(rows);
  if (qe) throw qe;
  return run.id as string;
}

/** Days (in the user's timezone) on which they cleared a quest or played 10+ counted minutes. */
async function activeDays(userId: string, tz: number) {
  const db = admin();
  const since = new Date(Date.now() - 400 * 86_400_000).toISOString();
  const [{ data: q }, { data: s }] = await Promise.all([
    db.from("quests").select("completed_at").eq("user_id", userId).eq("status", "done").gte("completed_at", since),
    db.from("sessions").select("started_at,minutes").eq("user_id", userId).gte("started_at", since).gte("minutes", 10),
  ]);
  const days = new Set<string>();
  (q || []).forEach((r) => r.completed_at && days.add(dayKey(new Date(r.completed_at), tz)));
  (s || []).forEach((r) => days.add(dayKey(new Date(r.started_at), tz)));
  return days;
}

/**
 * The streak: consecutive active days ending today (or yesterday, still alive).
 * With shields (Grinder and up), one missed day per 7 is forgiven.
 */
export async function streak(userId: string, tz: number, level: Level) {
  const days = await activeDays(userId, tz);
  const shields = hasFeature(level, "shields");
  const today = dayKey(new Date(), tz);
  let d = new Date();
  if (!days.has(today)) d = new Date(Date.now() - 86_400_000);
  let count = 0;
  let used = 0;
  let sinceShield = 99;
  for (let i = 0; i < 400; i++) {
    const k = dayKey(d, tz);
    if (days.has(k)) {
      count++;
      sinceShield++;
    } else if (shields && sinceShield >= 7 && count > 0 && i > 0) {
      used++;
      sinceShield = 0;
    } else break;
    d = new Date(d.getTime() - 86_400_000);
  }
  const week: { day: string; on: boolean }[] = [];
  for (let i = 6; i >= 0; i--) {
    const k = dayKey(new Date(Date.now() - i * 86_400_000), tz);
    week.push({ day: k, on: days.has(k) });
  }
  return { count, shieldsUsed: used, today: days.has(today), week };
}

/** Counted play minutes today (timer + Steam), for the daily cap. */
export async function minutesToday(userId: string, tz: number) {
  const start = new Date(`${dayKey(new Date(), tz)}T00:00:00Z`);
  const from = new Date(start.getTime() + tz * 60_000).toISOString();
  const { data } = await admin().from("sessions").select("minutes").eq("user_id", userId).gte("started_at", from);
  return (data || []).reduce((a, r) => a + (r.minutes || 0), 0);
}

export async function award(userId: string, amount: number, kind: "quest" | "session" | "steam" | "redeem" | "refund" | "bonus", ref: string, note: string) {
  if (!amount) return;
  await admin().from("points").insert({ user_id: userId, amount, kind, ref, note });
}

export function multiplier(level: Level) {
  return QUOTAS[level].multiplier;
}
