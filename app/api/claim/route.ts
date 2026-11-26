import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { getUser, supabaseAdmin } from "@/lib/supabase/server";
import { saveMeal } from "@/lib/server/save";
import { track } from "@/lib/kwop";
import type { Plate } from "@/lib/ai";

const Body = z.object({ tryId: z.string().uuid().nullish(), tz: z.number().int().min(-840).max(840).optional() });

/** Right after sign-up / log-in: attach the try to the account, keep k / plan / utm, count the sign-up. */
export async function POST(req: Request) {
  const { user } = await getUser();
  const admin = supabaseAdmin();
  if (!user || !admin) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });

  const jar = await cookies();
  const { data: profile } = await admin.from("profiles").select("k,source,intended_plan").eq("id", user.id).maybeSingle();
  const patch: Record<string, unknown> = {};
  const k = jar.get("kwop_k")?.value;
  if (k && /^[A-Za-z0-9]{1,12}$/.test(k) && !profile?.k) patch.k = k;
  const plan = jar.get("ms_plan")?.value;
  if (plan && !profile?.intended_plan) patch.intended_plan = plan;
  const utm = jar.get("ms_utm")?.value;
  if (utm && (!profile?.source || Object.keys(profile.source).length === 0)) {
    try { patch.source = JSON.parse(utm); } catch {}
  }
  if (body.data.tz !== undefined) patch.tz_offset = body.data.tz;
  if (Object.keys(patch).length) await admin.from("profiles").upsert({ id: user.id, email: user.email, ...patch });

  const isNew = Date.now() - new Date(user.created_at).getTime() < 10 * 60_000;
  if (isNew) track("signup", user.email);

  let mealId: string | null = null;
  if (body.data.tryId) {
    const { data: t } = await admin.from("tries").select("id,result,photo_path,claimed_by").eq("id", body.data.tryId).maybeSingle();
    if (t && !t.claimed_by) {
      mealId = await saveMeal(admin, user.id, t.result as Plate, { fromPath: t.photo_path ?? undefined });
      await admin.from("tries").update({ claimed_by: user.id, photo_path: null }).eq("id", t.id);
    }
  }
  return NextResponse.json({ ok: true, mealId });
}
