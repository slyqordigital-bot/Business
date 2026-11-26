import "server-only";
import { supabaseAdmin } from "../supabase/server";
import { readToken } from "./share";

/** A shared meal: the dish, foods and totals only (never the photo, never who ate it). */
export async function sharedMeal(token: string) {
  const id = readToken(token);
  const admin = supabaseAdmin();
  if (!id || !admin) return null;
  const { data } = await admin.from("meals").select("name,items,kcal,protein,carbs,fat").eq("id", id).maybeSingle();
  if (!data) return null;
  return { name: data.name as string, foods: (data.items as { name: string }[]).map((i) => i.name), kcal: data.kcal as number, protein: Math.round(Number(data.protein)), carbs: Math.round(Number(data.carbs)), fat: Math.round(Number(data.fat)) };
}
