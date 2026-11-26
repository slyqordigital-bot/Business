import { NextResponse } from "next/server";
import { analyzePlate, AiError } from "@/lib/ai";
import { supabaseAdmin } from "@/lib/supabase/server";
import { getCtx, quota } from "@/lib/server/context";
import { readPhoto } from "@/lib/server/upload";
import { saveMeal } from "@/lib/server/save";
import { FREE_TRIES_PER_DAY } from "@/lib/plans";
import { track } from "@/lib/kwop";

export const runtime = "nodejs";
export const maxDuration = 60;

/** A scan by a signed-in user, counted against their plan on the server. */
export async function POST(req: Request) {
  const ctx = await getCtx();
  const admin = supabaseAdmin();
  if (!ctx || !admin) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  if (ctx.plan.paid) {
    const q = await quota(ctx.user.id, ctx.plan);
    if (q.left <= 0) return NextResponse.json({ error: "quota", message: `You've used all ${q.limit} scans this month.` }, { status: 402 });
  } else {
    const { count } = await admin
      .from("scan_events")
      .select("id", { count: "exact", head: true })
      .eq("user_id", ctx.user.id)
      .gte("created_at", new Date(Date.now() - 86_400_000).toISOString());
    if ((count ?? 0) >= FREE_TRIES_PER_DAY) return NextResponse.json({ error: "quota", message: "You've used today's free scans." }, { status: 402 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Add a photo of your meal." }, { status: 400 });
  const photo = await readPhoto(form);
  if ("error" in photo) return NextResponse.json({ error: photo.error }, { status: 400 });

  try {
    const plate = await analyzePlate(photo.buf, photo.type);
    await admin.from("scan_events").insert({ user_id: ctx.user.id });
    const id = await saveMeal(admin, ctx.user.id, plate, { buf: photo.buf, type: photo.type });
    track("feature_used", ctx.user.email, "photo_recognition");
    return NextResponse.json({ id });
  } catch (e) {
    if (e instanceof AiError && e.code === "not_food")
      return NextResponse.json({ error: "not_food", message: "We couldn't spot any food in that photo. Try a clear shot from above." }, { status: 422 });
    if (e instanceof AiError && e.code === "not_configured")
      return NextResponse.json({ error: "offline", message: "The scanner opens in a moment. Please try again shortly." }, { status: 503 });
    console.error("[scan]", e);
    return NextResponse.json({ error: "failed", message: "The scan didn't go through. Try again." }, { status: 502 });
  }
}
