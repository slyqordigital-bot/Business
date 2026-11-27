import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { admin, award, minutesToday, multiplier } from "@/lib/server/game";
import { POINTS, type Level } from "@/lib/plans";
import { track } from "@/lib/kwop";

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("start"), game: z.string().trim().min(1).max(60) }),
  z.object({ action: z.literal("beat"), id: z.string().uuid() }),
  z.object({ action: z.literal("stop"), id: z.string().uuid() }),
]);

type Row = { id: string; game: string; minutes: number; awarded: number; last_beat: string; started_at: string };

async function finish(userId: string, s: Row, level: Level) {
  const db = admin();
  const total = Math.floor((s.minutes / POINTS.perMinutes) * multiplier(level));
  const add = Math.max(0, total - (s.awarded || 0));
  const { data } = await db.from("sessions").update({ ended_at: new Date().toISOString(), awarded: total }).eq("id", s.id).is("ended_at", null).select("id");
  if (data?.length && add > 0) await award(userId, add, "session", s.id, `${s.game} · ${s.minutes} min`);
  return { minutes: s.minutes, points: data?.length ? add : 0 };
}

/**
 * The session timer (Game Sync for games a website can't read: console, Epic, mobile).
 * The open tab sends a beat every minute; only beats 50–150 s apart count, capped per day.
 */
export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  if (!ctx.plan.paid) return NextResponse.json({ error: "locked" }, { status: 402 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  const db = admin();
  const uid = ctx.user.id;
  const level = ctx.plan.level;
  const COLS = "id,game,minutes,awarded,last_beat,started_at";

  if (body.data.action === "start") {
    const { data: g } = await db.from("games").select("id").eq("user_id", uid).eq("name", body.data.game).maybeSingle();
    if (!g) return NextResponse.json({ error: "Link this game first." }, { status: 400 });
    const { data: open } = await db.from("sessions").select(COLS).eq("user_id", uid).eq("source", "timer").is("ended_at", null);
    for (const s of (open || []) as Row[]) await finish(uid, s, level);
    const { data: s, error } = await db.from("sessions").insert({ user_id: uid, game: body.data.game, source: "timer" }).select(COLS).single();
    if (error) return NextResponse.json({ error: "Couldn't start the timer. Try again." }, { status: 500 });
    track("feature_used", ctx.user.email, "session_timer");
    return NextResponse.json({ session: s });
  }

  const { data: s } = await db.from("sessions").select(COLS).eq("id", body.data.id).eq("user_id", uid).is("ended_at", null).maybeSingle();
  if (!s) return NextResponse.json({ error: "This session already ended." }, { status: 404 });

  if (body.data.action === "beat") {
    const gap = (Date.now() - new Date(s.last_beat).getTime()) / 1000;
    let minutes = s.minutes;
    let capped = false;
    if (gap >= 50 && gap <= 150) {
      const today = await minutesToday(uid, ctx.profile.tz_offset);
      if (today < POINTS.dailyMinutesCap) minutes += 1;
      else capped = true;
    }
    if (gap >= 50) await db.from("sessions").update({ minutes, last_beat: new Date().toISOString() }).eq("id", s.id);
    return NextResponse.json({ minutes, capped });
  }

  const r = await finish(uid, s as Row, level);
  return NextResponse.json({ ok: true, ...r });
}
