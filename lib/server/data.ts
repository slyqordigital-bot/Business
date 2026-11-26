import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DbMeal } from "../meals";
import { MEAL_COLS } from "./meals";

/** Local day key for a timestamp, using the user's saved timezone offset (minutes, JS convention). */
export function localDay(iso: string | Date, tz: number) {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  return new Date(d.getTime() - tz * 60_000).toISOString().slice(0, 10);
}

/** Start of the user's local day `daysAgo` days back, as a UTC Date. */
export function dayStart(tz: number, daysAgo = 0) {
  const key = localDay(new Date(Date.now() - daysAgo * 86_400_000), tz);
  return new Date(new Date(key + "T00:00:00Z").getTime() + tz * 60_000);
}

export async function mealsSince(sb: SupabaseClient, since: Date, limit = 500) {
  const { data } = await sb.from("meals").select(MEAL_COLS).gte("eaten_at", since.toISOString()).order("eaten_at", { ascending: false }).limit(limit);
  return (data || []) as DbMeal[];
}

/** Consecutive days with at least one meal, ending today (or yesterday if today has none yet). */
export async function streak(sb: SupabaseClient, tz: number) {
  const { data } = await sb.from("meals").select("eaten_at").gte("eaten_at", dayStart(tz, 400).toISOString()).order("eaten_at", { ascending: false }).limit(3000);
  const days = new Set((data || []).map((m) => localDay(m.eaten_at, tz)));
  let n = 0;
  let i = days.has(localDay(new Date(), tz)) ? 0 : 1;
  while (days.has(localDay(new Date(Date.now() - i * 86_400_000), tz))) { n++; i++; }
  return { n, loggedToday: days.has(localDay(new Date(), tz)) };
}

export function sumMeals(meals: DbMeal[]) {
  return meals.reduce((a, m) => ({ kcal: a.kcal + m.kcal, protein: a.protein + Number(m.protein), carbs: a.carbs + Number(m.carbs), fat: a.fat + Number(m.fat) }), { kcal: 0, protein: 0, carbs: 0, fat: 0 });
}
