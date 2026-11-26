import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { supabaseAdmin } from "@/lib/supabase/server";
import { cleanTag } from "@/lib/utils";

const Body = z.object({
  key: z.enum(["game", "snack", "when", "goal", "tag"]),
  value: z.string().trim().min(1).max(60),
});

/** Saves one onboarding answer at once (profiles.answers). */
export async function POST(req: Request) {
  const ctx = await getCtx();
  const admin = supabaseAdmin();
  if (!ctx || !admin) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  await admin.rpc("merge_answers", { uid: ctx.user.id, patch: { [body.data.key]: body.data.value } });
  if (body.data.key === "tag") await admin.from("profiles").update({ gamer_tag: cleanTag(body.data.value) }).eq("id", ctx.user.id);
  return NextResponse.json({ ok: true });
}
