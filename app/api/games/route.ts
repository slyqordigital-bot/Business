import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx, nextPlan } from "@/lib/server/context";
import { admin } from "@/lib/server/game";
import { QUOTAS, shortName } from "@/lib/plans";

const Add = z.object({ name: z.string().trim().min(1).max(60) });
const Del = z.object({ id: z.string().uuid() });

/** Linked games (the plan's quota: Snacker 1, Grinder 3, Legend 10). */
export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx?.plan.paid) return NextResponse.json({ error: "locked" }, { status: 402 });
  const body = Add.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Type the game's name." }, { status: 400 });
  const db = admin();
  const { count } = await db.from("games").select("id", { count: "exact", head: true }).eq("user_id", ctx.user.id);
  const limit = QUOTAS[ctx.plan.level].games;
  if ((count ?? 0) >= limit) {
    const next = nextPlan(ctx.plans, ctx.plan.level);
    return NextResponse.json({ error: "quota", next: next ? shortName(next.name) : null, limit }, { status: 402 });
  }
  const { error } = await db.from("games").insert({ user_id: ctx.user.id, name: body.data.name, source: "manual" });
  if (error) return NextResponse.json({ error: error.code === "23505" ? "This game is already linked." : "Couldn't add it. Try again." }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Del.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await admin().from("games").delete().eq("id", body.data.id).eq("user_id", ctx.user.id);
  return NextResponse.json({ ok: true });
}
