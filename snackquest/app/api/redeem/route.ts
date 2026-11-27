import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { admin, award, balance } from "@/lib/server/game";
import { track } from "@/lib/kwop";

const Ship = z.object({
  name: z.string().trim().min(2).max(80),
  line1: z.string().trim().min(3).max(120),
  line2: z.string().trim().max(120).optional().default(""),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(30),
  zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, "ZIP"),
});
const Body = z.object({ reward: z.number().int().positive(), ship: Ship.optional() });
const Cancel = z.object({ id: z.string().uuid() });

/** Redeems points for a reward: points are held at once; the SnackQuest team fulfills it by hand. */
export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx?.plan.paid) return NextResponse.json({ error: "locked" }, { status: 402 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) {
    const zip = body.error.issues.some((i) => i.message === "ZIP");
    return NextResponse.json({ error: zip ? "Enter a 5-digit US ZIP code." : "Fill in every shipping field." }, { status: 400 });
  }
  const db = admin();
  const { data: r } = await db.from("rewards").select("id,name,kind,cost").eq("id", body.data.reward).eq("active", true).maybeSingle();
  if (!r) return NextResponse.json({ error: "This reward isn't available anymore." }, { status: 404 });
  const physical = r.kind.toLowerCase() === "gear";
  if (physical && !body.data.ship) return NextResponse.json({ error: "Add where we should ship it." }, { status: 400 });
  const { count } = await db.from("redemptions").select("id", { count: "exact", head: true }).eq("user_id", ctx.user.id).in("status", ["requested", "processing"]);
  if ((count ?? 0) >= 3) return NextResponse.json({ error: "You have 3 rewards on the way already. New ones open once they ship." }, { status: 429 });
  const bal = await balance(ctx.user.id);
  if (bal < r.cost) return NextResponse.json({ error: `You need ${(r.cost - bal).toLocaleString("en-US")} more points.` }, { status: 400 });
  const { data: red, error } = await db
    .from("redemptions")
    .insert({ user_id: ctx.user.id, reward_id: r.id, reward_name: r.name, cost: r.cost, ship_to: physical ? body.data.ship : { email: ctx.user.email } })
    .select("id")
    .single();
  if (error || !red) return NextResponse.json({ error: "Couldn't redeem it. Try again." }, { status: 500 });
  await award(ctx.user.id, -r.cost, "redeem", red.id, r.name);
  // a race could push the balance below 0: undo that one
  if ((await balance(ctx.user.id)) < 0) {
    await db.from("redemptions").update({ status: "canceled" }).eq("id", red.id);
    await award(ctx.user.id, r.cost, "refund", red.id, `${r.name} (not enough points)`);
    return NextResponse.json({ error: "Not enough points." }, { status: 400 });
  }
  track("feature_used", ctx.user.email, `redeem:${r.name}`);
  return NextResponse.json({ ok: true, id: red.id });
}

/** Cancels a redemption that hasn't been processed yet; the points come back. */
export async function DELETE(req: Request) {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Cancel.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const db = admin();
  const { data } = await db
    .from("redemptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("id", body.data.id)
    .eq("user_id", ctx.user.id)
    .eq("status", "requested")
    .select("id,cost,reward_name");
  const row = data?.[0];
  if (!row) return NextResponse.json({ error: "This one is already being processed." }, { status: 409 });
  await award(ctx.user.id, row.cost, "refund", row.id, `${row.reward_name} canceled`);
  return NextResponse.json({ ok: true });
}
