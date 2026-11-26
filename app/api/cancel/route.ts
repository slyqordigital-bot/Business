import { NextResponse } from "next/server";
import { getCtx } from "@/lib/server/context";
import { cancelPlan } from "@/lib/kwop";

export async function POST() {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  try {
    const r = await cancelPlan(ctx.user.email);
    return NextResponse.json({ message: r.message || "Your subscription is canceled. You keep your plan until the end of this period.", manage_url: r.manage_url ?? null });
  } catch (e) {
    console.error("[cancel]", e);
    return NextResponse.json({ error: "We couldn't reach billing. Try again in a minute." }, { status: 502 });
  }
}
