import { NextResponse } from "next/server";
import { analyzePlate, AiError } from "@/lib/ai";
import { readPhoto } from "@/lib/server/upload";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Owner-only accuracy check: runs the real AI on a photo, no quota, nothing stored. Bearer CRON_SECRET. */
export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return new Response("no", { status: 401 });
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "photo" }, { status: 400 });
  const photo = await readPhoto(form);
  if ("error" in photo) return NextResponse.json({ error: photo.error }, { status: 400 });
  const t0 = Date.now();
  try {
    const plate = await analyzePlate(photo.buf, photo.type);
    return NextResponse.json({ ms: Date.now() - t0, ...plate });
  } catch (e) {
    return NextResponse.json({ ms: Date.now() - t0, error: e instanceof AiError ? e.code : "failed" }, { status: 502 });
  }
}
