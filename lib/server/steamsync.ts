import "server-only";
import { admin, award, minutesToday, multiplier } from "./game";
import { recentGames, resolveSteamId, steamReady, steamSummary } from "../steam";
import { POINTS, QUOTAS, type Level } from "../plans";

export class SteamError extends Error {
  constructor(public code: "off" | "not_found" | "private" | "failed") {
    super(code);
  }
}

/** Links a Steam profile and its most played games (up to the plan's linked-games quota). No points for past playtime. */
export async function linkSteam(userId: string, input: string, level: Level) {
  if (!steamReady()) throw new SteamError("off");
  let id: string | null = null;
  try {
    id = await resolveSteamId(input);
  } catch {
    throw new SteamError("failed");
  }
  if (!id) throw new SteamError("not_found");
  const sum = await steamSummary(id).catch(() => null);
  if (!sum) throw new SteamError("not_found");
  const games = await recentGames(id).catch(() => []);
  const db = admin();
  await db.from("profiles").update({ steam_id: id, steam_name: sum.name, steam_avatar: sum.avatar, steam_synced_at: new Date().toISOString() }).eq("id", userId);
  const max = Math.max(1, QUOTAS[level].games);
  const { data: existing } = await db.from("games").select("id").eq("user_id", userId);
  const room = Math.max(0, max - (existing?.length ?? 0));
  const pick = games.slice(0, room);
  if (pick.length) {
    await db.from("games").upsert(
      pick.map((g) => ({ user_id: userId, name: g.name, source: "steam", steam_appid: g.appid, steam_minutes_total: g.minutesTotal })),
      { onConflict: "user_id,name" },
    );
  }
  return { name: sum.name, avatar: sum.avatar, visible: sum.visible, games: games.slice(0, 8).map((g) => g.name), private: !sum.visible || games.length === 0 };
}

/** New Steam playtime since the last sync becomes points (daily cap shared with the session timer). */
export async function syncSteam(userId: string, steamId: string, level: Level, tz: number) {
  if (!steamReady()) throw new SteamError("off");
  const db = admin();
  const games = await recentGames(steamId).catch(() => {
    throw new SteamError("failed");
  });
  const { data: linked } = await db.from("games").select("id,name,steam_appid,steam_minutes_total").eq("user_id", userId).eq("source", "steam");
  let room = Math.max(0, POINTS.dailyMinutesCap - (await minutesToday(userId, tz)));
  let total = 0;
  let pts = 0;
  for (const g of linked || []) {
    const now = games.find((x) => x.appid === g.steam_appid);
    if (!now) continue;
    const delta = Math.max(0, now.minutesTotal - (g.steam_minutes_total ?? now.minutesTotal));
    await db.from("games").update({ steam_minutes_total: now.minutesTotal }).eq("id", g.id);
    const counted = Math.min(delta, room);
    if (counted <= 0) continue;
    room -= counted;
    const p = Math.round((counted / POINTS.perMinutes) * multiplier(level));
    const { data: s } = await db
      .from("sessions")
      .insert({ user_id: userId, game: g.name, source: "steam", minutes: counted, awarded: p, ended_at: new Date().toISOString() })
      .select("id")
      .single();
    await award(userId, p, "steam", s?.id ?? "", `${g.name} · ${counted} min on Steam`);
    total += counted;
    pts += p;
  }
  await db.from("profiles").update({ steam_synced_at: new Date().toISOString() }).eq("id", userId);
  return { minutes: total, points: pts, capped: room === 0 };
}
