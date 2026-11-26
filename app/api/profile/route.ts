import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { supabaseAdmin } from "@/lib/supabase/server";
import { track } from "@/lib/kwop";

const Body = z.object({ tz: z.number().int().min(-840).max(840).optional(), signup: z.boolean().optional() });

/** Right after sign-up / log-in: saves the timezone, the Kwop link (k), ?plan= and utm_ from the cookies. */
export async function POST(req: Request) {
  const ctx = await getCtx();
  const admin = supabaseAdmin();
  if (!ctx || !admin) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const jar = await cookies();
  const patch: Record<string, unknown> = {};
  if (body.data.tz !== undefined) patch.tz_offset = body.data.tz;
  const k = jar.get("kwop_k")?.value;
  if (k && /^[A-Za-z0-9]{1,12}$/.test(k) && !ctx.profile.k) patch.k = k;
  const plan = jar.get("sq_plan")?.value;
  if (plan) patch.intended_plan = plan.slice(0, 40);
  try {
    const utm = JSON.parse(jar.get("sq_utm")?.value || "null");
    if (utm && typeof utm === "object") patch.source = utm;
  } catch {}
  if (Object.keys(patch).length) await admin.from("profiles").update(patch).eq("id", ctx.user.id);
  if (body.data.signup && !ctx.profile.onboarded) track("signup", ctx.user.email);
  return NextResponse.json({ ok: true });
}
