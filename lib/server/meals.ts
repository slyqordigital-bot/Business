import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toView, type DbMeal, type MealView } from "../meals";
import { hasFeature } from "../plans";
import type { PlanState } from "../kwop";

export const MEAL_COLS = "id,name,photo_path,items,kcal,protein,carbs,fat,insight,confidence,eaten_at";

export async function signedUrls(sb: SupabaseClient, paths: (string | null)[]) {
  const list = paths.filter(Boolean) as string[];
  if (!list.length) return new Map<string, string>();
  const { data } = await sb.storage.from("meals").createSignedUrls(list, 60 * 60);
  const map = new Map<string, string>();
  (data || []).forEach((d) => d.signedUrl && d.path && map.set(d.path, d.signedUrl));
  return map;
}

export async function viewMeals(sb: SupabaseClient, meals: DbMeal[], plan: PlanState): Promise<MealView[]> {
  const urls = await signedUrls(sb, meals.map((m) => m.photo_path));
  return meals.map((m) =>
    toView(m, {
      paid: plan.paid,
      breakdown: hasFeature(plan.level, "breakdown"),
      photoUrl: m.photo_path ? urls.get(m.photo_path) ?? null : null,
    }),
  );
}
