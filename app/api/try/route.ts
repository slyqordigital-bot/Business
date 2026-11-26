import { NextResponse } from "next/server";
import { z } from "zod";
import { analyzePlate, AiError } from "@/lib/ai";
import { supabaseAdmin } from "@/lib/supabase/server";
import { readPhoto, clientIp, hashIp } from "@/lib/server/upload";
import { FREE_TRIES_PER_DAY } from "@/lib/plans";

export const runtime = "nodejs";
export const maxDuration = 60;

// fallback limiter for when the database is not configured yet (per server instance)
const mem = new Map<string, number[]>();

function memLimited(key: string) {
  const now = Date.now();
  const list = (mem.get(key) || []).filter((t) => now - t < 86_400_000);
  if (list.length >= FREE_TRIES_PER_DAY) return true;
  list.push(now);
  mem.set(key, list);
  return false;
}

/** A scan before sign-up: the foods and one insight come back, the numbers stay on the server. */
export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Add a photo of your meal." }, { status: 400 });
  const device = z.string().regex(/^[a-zA-Z0-9-]{8,64}$/).safeParse(form.get("device"));
  if (!device.success) return NextResponse.json({ error: "Please reload the page and try again." }, { status: 400 });
  const photo = await readPhoto(form);
  if ("error" in photo) return NextResponse.json({ error: photo.error }, { status: 400 });

  const ipHash = hashIp(clientIp(req));
  const admin = supabaseAdmin();
  const since = new Date(Date.now() - 86_400_000).toISOString();

  if (admin) {
    const [a, b] = await Promise.all([
      admin.from("tries").select("id", { count: "exact", head: true }).eq("device_id", device.data).gte("created_at", since),
      admin.from("tries").select("id", { count: "exact", head: true }).eq("ip_hash", ipHash).gte("created_at", since),
    ]);
    if ((a.count ?? 0) >= FREE_TRIES_PER_DAY || (b.count ?? 0) >= FREE_TRIES_PER_DAY)
      return NextResponse.json({ error: "limit", message: "You've used today's 3 free scans. Sign up to keep scanning." }, { status: 429 });
  } else if (memLimited(device.data) || memLimited(ipHash)) {
    return NextResponse.json({ error: "limit", message: "You've used today's 3 free scans. Sign up to keep scanning." }, { status: 429 });
  }

  try {
    const plate = await analyzePlate(photo.buf, photo.type);
    let id: string | null = null;
    if (admin) {
      const { data, error } = await admin
        .from("tries")
        .insert({ device_id: device.data, ip_hash: ipHash, result: plate })
        .select("id")
        .single();
      if (error) console.error("[try] insert", error);
      id = data?.id ?? null;
      if (id) {
        const up = await admin.storage.from("meals").upload(`tries/${id}.jpg`, photo.buf, { contentType: photo.type, upsert: true });
        if (!up.error) await admin.from("tries").update({ photo_path: `tries/${id}.jpg` }).eq("id", id);
      }
    }
    return NextResponse.json({
      id,
      dish: plate.dish,
      insight: plate.insight,
      confidence: plate.confidence,
      items: plate.items.map((i) => ({ name: i.name, x: i.x, y: i.y })),
    });
  } catch (e) {
    if (e instanceof AiError && e.code === "not_food")
      return NextResponse.json({ error: "not_food", message: "We couldn't spot any food in that photo. Try a clear shot of your plate from above." }, { status: 422 });
    if (e instanceof AiError && e.code === "quota")
      return NextResponse.json({ error: "offline", message: "Scanning is very busy right now. Please try again in a little while." }, { status: 503 });
    if (e instanceof AiError && e.code === "not_configured")
      return NextResponse.json({ error: "offline", message: "The scanner opens in a moment. Please try again shortly." }, { status: 503 });
    return NextResponse.json({ error: "failed", message: "The scan didn't go through. Try again." }, { status: 502 });
  }
}
