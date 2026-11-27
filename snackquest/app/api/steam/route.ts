import { NextResponse } from "next/server";
import { z } from "zod";
import { getCtx } from "@/lib/server/context";
import { admin } from "@/lib/server/game";
import { linkSteam, syncSteam, SteamError } from "@/lib/server/steamsync";
import { track } from "@/lib/kwop";

const Body = z.discriminatedUnion("action", [
  z.object({ action: z.literal("link"), profile: z.string().trim().min(2).max(200) }),
  z.object({ action: z.literal("sync") }),
  z.object({ action: z.literal("unlink") }),
]);

const MSG: Record<string, string> = {
  off: "Steam sync opens in a moment. Use the session timer meanwhile.",
  not_found: "We couldn't find that Steam profile. Paste your profile link, like steamcommunity.com/id/yourname.",
  private: "Your Steam game details are private. Set them to Public in Steam → Privacy Settings, then sync again.",
  failed: "Steam didn't answer. Try again in a minute.",
};

export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx?.plan.paid) return NextResponse.json({ error: "locked" }, { status: 402 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  try {
    if (body.data.action === "link") {
      const r = await linkSteam(ctx.user.id, body.data.profile, ctx.plan.level);
      track("feature_used", ctx.user.email, "steam_link");
      return NextResponse.json({ ok: true, ...r, note: r.private ? MSG.private : null });
    }
    if (body.data.action === "unlink") {
      const db = admin();
      await db.from("games").delete().eq("user_id", ctx.user.id).eq("source", "steam");
      await db.from("profiles").update({ steam_id: null, steam_name: null, steam_avatar: null }).eq("id", ctx.user.id);
      return NextResponse.json({ ok: true });
    }
    if (!ctx.profile.steam_id) return NextResponse.json({ error: "Link Steam first." }, { status: 400 });
    if (ctx.profile.steam_synced_at && Date.now() - new Date(ctx.profile.steam_synced_at).getTime() < 60_000)
      return NextResponse.json({ error: "Synced a moment ago. Try again in a minute." }, { status: 429 });
    const r = await syncSteam(ctx.user.id, ctx.profile.steam_id, ctx.plan.level, ctx.profile.tz_offset);
    track("feature_used", ctx.user.email, "steam_sync");
    return NextResponse.json({ ok: true, ...r });
  } catch (e) {
    const code = e instanceof SteamError ? e.code : "failed";
    if (code === "failed") console.error("[steam]", e);
    return NextResponse.json({ error: MSG[code] }, { status: code === "off" ? 503 : 400 });
  }
}
