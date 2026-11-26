import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

/** Daily: delete photos and results of tries never claimed after 7 days. */
export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) return new Response("no", { status: 401 });
  const admin = supabaseAdmin();
  if (!admin) return NextResponse.json({ ok: false });
  const before = new Date(Date.now() - 7 * 86_400_000).toISOString();
  const { data } = await admin.from("tries").select("id,photo_path").is("claimed_by", null).lt("created_at", before).limit(1000);
  const paths = (data || []).map((t) => t.photo_path).filter(Boolean) as string[];
  if (paths.length) await admin.storage.from("meals").remove(paths);
  if (data?.length) await admin.from("tries").delete().in("id", data.map((t) => t.id));
  return NextResponse.json({ ok: true, removed: data?.length ?? 0 });
}
