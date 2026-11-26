import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Plate } from "../ai";

/** Inserts a meal from an AI result (service role) and returns its id. */
export async function saveMeal(admin: SupabaseClient, userId: string, plate: Plate, photo?: { buf?: Buffer; type?: string; fromPath?: string }) {
  const { data, error } = await admin
    .from("meals")
    .insert({
      user_id: userId,
      name: plate.dish || "Meal",
      items: plate.items,
      kcal: plate.totals.kcal,
      protein: plate.totals.protein,
      carbs: plate.totals.carbs,
      fat: plate.totals.fat,
      insight: plate.insight,
      confidence: plate.confidence,
    })
    .select("id")
    .single();
  if (error || !data) throw error || new Error("meal insert failed");
  const path = `${userId}/${data.id}.jpg`;
  let ok = false;
  if (photo?.buf) {
    ok = !(await admin.storage.from("meals").upload(path, photo.buf, { contentType: photo.type || "image/jpeg", upsert: true })).error;
  } else if (photo?.fromPath) {
    ok = !(await admin.storage.from("meals").move(photo.fromPath, path)).error;
  }
  if (ok) await admin.from("meals").update({ photo_path: path }).eq("id", data.id);
  return data.id as string;
}
