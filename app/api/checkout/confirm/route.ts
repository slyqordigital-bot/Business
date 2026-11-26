import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { cancelPlan, confirmCheckout, getPlan, track } from "@/lib/kwop";

const Body = z.object({ ref: z.string().min(4).max(120), previousPlanId: z.number().int().nullish() });

export async function POST(req: Request) {
  const ctx = await getCtx({ fresh: true });
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const before = ctx.plan;
  const c = await confirmCheckout(body.data.ref).catch(() => ({ ok: false, paid: false }));
  const plan = await getPlan(ctx.user.email, { fresh: true });
  // an upgrade: stop the old plan at the end of its period, never two plans billed
  if (plan.paid && before.paid && before.plan && plan.plan && before.plan.id !== plan.plan.id) {
    cancelPlan(ctx.user.email, body.data.ref).catch((e) => console.error("[confirm] cancel old", e));
  }
  if (plan.paid && !before.paid) track("aha", ctx.user.email);
  return NextResponse.json({ ok: Boolean(c.ok), paid: plan.paid, plan: plan.plan, level: plan.level });
}
