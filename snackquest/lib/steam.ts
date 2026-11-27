import "server-only";

/** Steam Web API (public profiles only). Game Sync reads real recent playtime. */
const KEY = process.env.STEAM_API_KEY || "";
const BASE = "https://api.steampowered.com";

export const steamReady = () => Boolean(KEY);

async function sget(path: string) {
  const r = await fetch(`${BASE}${path}${path.includes("?") ? "&" : "?"}key=${KEY}&format=json`, {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!r.ok) throw new Error(`steam ${r.status}`);
  return r.json();
}

/** Accepts a profile URL (/id/name or /profiles/7656…), a vanity name or a 17-digit id. */
export async function resolveSteamId(input: string): Promise<string | null> {
  const s = input.trim();
  const num = s.match(/(7656\d{13})/);
  if (num) return num[1];
  const vanity = s.match(/steamcommunity\.com\/id\/([A-Za-z0-9_-]{2,32})/)?.[1] ?? (/^[A-Za-z0-9_-]{2,32}$/.test(s) ? s : null);
  if (!vanity) return null;
  const j = await sget(`/ISteamUser/ResolveVanityURL/v1/?vanityurl=${encodeURIComponent(vanity)}`);
  return j?.response?.success === 1 ? String(j.response.steamid) : null;
}

export async function steamSummary(steamId: string) {
  const j = await sget(`/ISteamUser/GetPlayerSummaries/v2/?steamids=${steamId}`);
  const p = j?.response?.players?.[0];
  if (!p) return null;
  return { name: String(p.personaname || "Steam player").slice(0, 40), avatar: String(p.avatarfull || p.avatar || ""), visible: p.communityvisibilitystate === 3 };
}

export type SteamGame = { appid: number; name: string; minutes2w: number; minutesTotal: number };

/** Games played in the last 2 weeks, most played first. Empty when the profile's game details are private. */
export async function recentGames(steamId: string): Promise<SteamGame[]> {
  const j = await sget(`/IPlayerService/GetRecentlyPlayedGames/v1/?steamid=${steamId}&count=20`);
  const games = (j?.response?.games || []) as { appid: number; name: string; playtime_2weeks?: number; playtime_forever?: number }[];
  return games
    .map((g) => ({ appid: g.appid, name: String(g.name || `App ${g.appid}`).slice(0, 60), minutes2w: g.playtime_2weeks || 0, minutesTotal: g.playtime_forever || 0 }))
    .sort((a, b) => b.minutes2w - a.minutes2w);
}
