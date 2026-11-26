import { NextResponse } from "next/server";
import { z } from "zod";
import { aiCount, getCtx, logAi, questQuota, nextPlan } from "@/lib/server/context";
import { admin, award, multiplier } from "@/lib/server/game";
import { readPhoto } from "@/lib/server/photo";
import { verifyProof, AiError } from "@/lib/ai";
import { POINTS, shortName } from "@/lib/plans";
import { track } from "@/lib/kwop";

export const maxDuration = 60;
const Id = z.string().uuid();

/** Clears a quest: the snack photo is checked by the AI, then points land (× the plan's boost). */
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Id.safeParse(id).success) return NextResponse.json({ error: "Unknown quest." }, { status: 404 });
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!ctx.plan.paid) return NextResponse.json({ error: "locked" }, { status: 402 });
  const db = admin();
  const { data: q } = await db.from("quests").select("id,title,rule,proof,points,status").eq("id", id).eq("user_id", ctx.user.id).maybeSingle();
  if (!q) return NextResponse.json({ error: "Unknown quest." }, { status: 404 });
  if (q.status === "done") return NextResponse.json({ error: "Already cleared." }, { status: 409 });
  const quota = await questQuota(ctx.user.id, ctx.plan);
  if (quota.left <= 0) {
    const next = nextPlan(ctx.plans, ctx.plan.level);
    return NextResponse.json({ error: "quota", next: next ? shortName(next.name) : null, limit: quota.limit }, { status: 402 });
  }
  if ((await aiCount(ctx.user.id, "verify", 86_400_000)) >= POINTS.verifyPerDay)
    return NextResponse.json({ error: "That's a lot of photo checks today. Try again tomorrow." }, { status: 429 });
  const photo = await readPhoto(await req.formData().catch(() => new FormData()));
  if ("error" in photo) return NextResponse.json({ error: photo.error }, { status: 400 });

  try {
    await logAi(ctx.user.id, "verify");
    const v = await verifyProof(photo.buf, photo.mime, q);
    if (!v.ok) return NextResponse.json({ ok: false, reason: v.reason });
    const path = `${ctx.user.id}/${q.id}.jpg`;
    await db.storage.from("proofs").upload(path, photo.buf, { contentType: photo.mime, upsert: true });
    const pts = Math.round(q.points * multiplier(ctx.plan.level));
    // only one request can flip open → done
    const { data: flipped } = await db
      .from("quests")
      .update({ status: "done", photo_path: path, verdict: v.reason, awarded: pts, completed_at: new Date().toISOString() })
      .eq("id", q.id)
      .eq("status", "open")
      .select("id");
    if (!flipped?.length) return NextResponse.json({ error: "Already cleared." }, { status: 409 });
    await award(ctx.user.id, pts, "quest", q.id, q.title);
    track("feature_used", ctx.user.email, "snack_quest");
    return NextResponse.json({ ok: true, reason: v.reason, points: pts, left: quota.left - 1 });
  } catch (e) {
    if (e instanceof AiError && e.code === "not_configured") return NextResponse.json({ error: "Photo checks open in a moment." }, { status: 503 });
    console.error("[quest]", e);
    return NextResponse.json({ error: "The referee lagged. Try again." }, { status: 502 });
  }
}

/** Removes an open quest you don't want (cleared quests stay in your history). */
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!Id.safeParse(id).success) return NextResponse.json({ error: "Unknown quest." }, { status: 404 });
  const ctx = await getCtx();
  if (!ctx?.plan.paid) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { error } = await admin().from("quests").delete().eq("id", id).eq("user_id", ctx.user.id).eq("status", "open");
  if (error) return NextResponse.json({ error: "Couldn't remove it. Try again." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
