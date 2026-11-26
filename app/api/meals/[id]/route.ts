import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { supabaseServer } from "@/lib/supabase/server";
import { MEAL_COLS, viewMeals } from "@/lib/server/meals";
import { sumItems } from "@/lib/ai";
import type { DbMeal } from "@/lib/meals";

type P = { params: Promise<{ id: string }> };
const Id = z.string().uuid();

export async function GET(_: Request, { params }: P) {
  const id = Id.safeParse((await params).id);
  const ctx = await getCtx();
  const sb = await supabaseServer();
  if (!ctx || !sb) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!id.success) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data } = await sb.from("meals").select(MEAL_COLS).eq("id", id.data).maybeSingle();
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [view] = await viewMeals(sb, [data as DbMeal], ctx.plan);
  return NextResponse.json(view);
}

const Patch = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  eatenAt: z.string().datetime().optional(),
  // edit a portion: index + new grams; numbers scale from the AI estimate
  portion: z.object({ index: z.number().int().min(0).max(20), grams: z.number().min(0).max(3000) }).optional(),
  removeItem: z.number().int().min(0).max(20).optional(),
});

export async function PATCH(req: Request, { params }: P) {
  const id = Id.safeParse((await params).id);
  const ctx = await getCtx();
  const sb = await supabaseServer();
  if (!ctx || !sb) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!ctx.plan.paid) return NextResponse.json({ error: "Pick a plan to edit meals." }, { status: 402 });
  const body = Patch.safeParse(await req.json().catch(() => ({})));
  if (!id.success || !body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { data: meal } = await sb.from("meals").select(MEAL_COLS).eq("id", id.data).maybeSingle();
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const patch: Record<string, unknown> = {};
  if (body.data.name) patch.name = body.data.name;
  if (body.data.eatenAt) patch.eaten_at = body.data.eatenAt;
  let items = (meal as DbMeal).items;
  if (body.data.portion) {
    const it = items[body.data.portion.index];
    if (it && it.grams > 0) {
      const f = body.data.portion.grams / it.grams;
      items = items.map((x, i) =>
        i === body.data.portion!.index
          ? { ...x, grams: Math.round(body.data.portion!.grams), kcal: Math.round(x.kcal * f), protein: +(x.protein * f).toFixed(1), carbs: +(x.carbs * f).toFixed(1), fat: +(x.fat * f).toFixed(1) }
          : x,
      );
    }
  }
  if (body.data.removeItem !== undefined) items = items.filter((_, i) => i !== body.data.removeItem);
  if (body.data.portion || body.data.removeItem !== undefined) {
    const t = sumItems(items);
    Object.assign(patch, { items, kcal: t.kcal, protein: t.protein, carbs: t.carbs, fat: t.fat });
  }
  const { error } = await sb.from("meals").update(patch).eq("id", id.data);
  if (error) return NextResponse.json({ error: "Couldn't save. Try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: P) {
  const id = Id.safeParse((await params).id);
  const sb = await supabaseServer();
  if (!sb) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { data: u } = await sb.auth.getUser();
  if (!u.user || !id.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { data: meal } = await sb.from("meals").select("photo_path").eq("id", id.data).maybeSingle();
  if (!meal) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (meal.photo_path) await sb.storage.from("meals").remove([meal.photo_path]);
  await sb.from("meals").delete().eq("id", id.data);
  return NextResponse.json({ ok: true });
}
