import { NextResponse } from "next/server";
import { aiCount, getCtx, logAi } from "@/lib/server/context";
import { admin, buildRun } from "@/lib/server/game";
import { readPhoto } from "@/lib/server/photo";
import { questFromSnackPhoto, AiError } from "@/lib/ai";
import { POINTS, hasFeature } from "@/lib/plans";
import { track } from "@/lib/kwop";

export const maxDuration = 60;

/**
 * POST JSON → "Cook up 7 more": a new quest run.
 * POST multipart (photo) → Legend: a custom quest from a photo of your own snack.
 */
export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!ctx.plan.paid) return NextResponse.json({ error: "locked" }, { status: 402 });
  const db = admin();
  const isForm = (req.headers.get("content-type") || "").includes("multipart/form-data");

  try {
    if (isForm) {
      if (!hasFeature(ctx.plan.level, "custom_quests")) return NextResponse.json({ error: "locked", feature: "custom_quests" }, { status: 402 });
      if ((await aiCount(ctx.user.id, "custom", 86_400_000)) >= 10) return NextResponse.json({ error: "10 custom quests a day is the max. Try again tomorrow." }, { status: 429 });
      const photo = await readPhoto(await req.formData());
      if ("error" in photo) return NextResponse.json({ error: photo.error }, { status: 400 });
      await logAi(ctx.user.id, "custom");
      const q = await questFromSnackPhoto(photo.buf, photo.mime, ctx.profile.answers);
      const { data: run } = await db.from("runs").select("id").eq("user_id", ctx.user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      const { data: max } = await db.from("quests").select("position").eq("run_id", run?.id ?? "").order("position", { ascending: false }).limit(1).maybeSingle();
      const { data: row, error } = await db
        .from("quests")
        .insert({ user_id: ctx.user.id, run_id: run?.id ?? null, position: (max?.position ?? 0) + 1, title: q.title, rule: q.rule, proof: q.proof, rarity: "rare", points: POINTS.rarity.rare, custom: true })
        .select("id")
        .single();
      if (error) throw error;
      track("feature_used", ctx.user.email, "custom_quest");
      return NextResponse.json({ ok: true, id: row.id });
    }
    if ((await aiCount(ctx.user.id, "run", 86_400_000)) >= 6) return NextResponse.json({ error: "You cooked up plenty today. New quests tomorrow." }, { status: 429 });
    const { data: old } = await db.from("quests").select("title").eq("user_id", ctx.user.id).order("created_at", { ascending: false }).limit(20);
    await logAi(ctx.user.id, "run");
    const id = await buildRun(ctx.user.id, ctx.profile.answers, { avoid: (old || []).map((o) => o.title) });
    track("feature_used", ctx.user.email, "new_run");
    return NextResponse.json({ ok: true, id });
  } catch (e) {
    if (e instanceof AiError && e.code === "not_snack") return NextResponse.json({ error: "We couldn't spot a snack in that photo. Try one with the snack in clear view." }, { status: 400 });
    if (e instanceof AiError && e.code === "not_configured") return NextResponse.json({ error: "Quest building opens in a moment." }, { status: 503 });
    console.error("[quests]", e);
    return NextResponse.json({ error: "Our quest builder lagged. Try again." }, { status: 502 });
  }
}
