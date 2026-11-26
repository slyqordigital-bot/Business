import { ogCard } from "@/lib/og";
import { sharedMeal } from "@/lib/server/shared-meal";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Macros from one photo, with MacroSnap";

export default async function Og({ params }: { params: Promise<{ token: string }> }) {
  const m = await sharedMeal((await params).token);
  return ogCard(m ? { title: m.name, kcal: m.kcal, p: m.protein, c: m.carbs, f: m.fat } : null);
}
