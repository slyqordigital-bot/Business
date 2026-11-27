import { NextResponse } from "next/server";
import { getCtx } from "@/lib/server/context";
import { supabaseAdmin, supabaseServer } from "@/lib/supabase/server";
import { cancelPlan } from "@/lib/kwop";

/** Deletes the account with all its quests, points and photos (and cancels any plan). */
export async function DELETE() {
  const ctx = await getCtx();
  const admin = supabaseAdmin();
  if (!ctx || !admin) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (ctx.plan.paid) await cancelPlan(ctx.user.email).catch(() => null);
  const { data: files } = await admin.storage.from("proofs").list(ctx.user.id, { limit: 1000 });
  if (files?.length) await admin.storage.from("proofs").remove(files.map((f) => `${ctx.user.id}/${f.name}`));
  const { error } = await admin.auth.admin.deleteUser(ctx.user.id);
  if (error) return NextResponse.json({ error: "Couldn't delete the account. Try again." }, { status: 500 });
  const sb = await supabaseServer();
  await sb?.auth.signOut();
  return NextResponse.json({ ok: true });
}
