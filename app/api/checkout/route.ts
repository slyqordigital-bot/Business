import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { createCheckout, getPlans, track } from "@/lib/kwop";

const Body = z.object({ plan: z.number().int().positive(), period: z.enum(["month", "year"]) });

export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const { plans } = await getPlans();
  if (!plans.some((p) => p.id === body.data.plan)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  try {
    const r = await createCheckout({ ...body.data, email: ctx.user.email, k: ctx.profile?.k });
    if (r.status === 409) return NextResponse.json({ error: "payments_off" }, { status: 409 });
    if (r.status >= 400) {
      console.error("[checkout]", r.status, r.body);
      return NextResponse.json({ error: "failed" }, { status: 502 });
    }
    // email: the buyer's own account email, prefilled and locked in Whop so the payment lands on this account
    return NextResponse.json({ embed: r.body.embed ?? null, ref: r.body.ref, fallback_url: r.body.fallback_url, email: ctx.user.email });
  } catch (e) {
    console.error("[checkout]", e);
    return NextResponse.json({ error: "failed" }, { status: 502 });
  }
}

/** paywall_view, reported from the paywall sheet */
export async function PUT() {
  const ctx = await getCtx();
  if (ctx) track("paywall_view", ctx.user.email);
  return NextResponse.json({ ok: true });
}
