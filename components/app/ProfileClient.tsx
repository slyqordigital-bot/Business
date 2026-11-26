"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Gamepad2, Link2, Loader2, Pause, Play, Plus, RefreshCw, Share2, Timer, Trash2 } from "lucide-react";
import { useFunnel } from "@/components/funnel/Funnel";
import { GAMES, GOALS, SNACKS, WHENS } from "@/lib/plans";
import { cn } from "@/lib/utils";

type Game = { id: string; name: string; source: string };
type Active = { id: string; game: string; minutes: number; started_at: string; last_beat: string } | null;

export function ProfileClient(p: {
  tag: string; answers: Record<string, string | undefined>; level: number; nextName: string | null; games: Game[]; gamesLimit: number; active: Active;
  steam: { enabled: boolean; name: string | null; avatar: string | null; synced: string | null };
  stats: { balance: number; earned: number; cleared: number; minutes: number }; today: { minutes: number; cap: number }; shareToken: string | null;
}) {
  const router = useRouter();
  const funnel = useFunnel();
  const [add, setAdd] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  async function addGame(e: React.FormEvent) {
    e.preventDefault();
    if (!add.trim()) return;
    const r = await fetch("/api/games", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: add.trim() }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) { setAdd(""); setMsg(null); router.refresh(); }
    else if (j.error === "quota") { if (j.next) funnel.openUpgrade({ level: p.level as 1 | 2, reason: `Your plan links ${j.limit} game${j.limit === 1 ? "" : "s"}.` }); else setMsg(`You linked the max of ${j.limit} games.`); }
    else setMsg(j.error || "Couldn't add it. Try again.");
  }
  async function delGame(id: string) {
    await fetch("/api/games", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) }).catch(() => null);
    router.refresh();
  }
  async function share() {
    if (!p.shareToken) return;
    const url = `${location.origin}/q/${p.shareToken}`;
    try {
      if (navigator.share) await navigator.share({ title: `${p.tag} on SnackQuest`, url });
      else { await navigator.clipboard.writeText(url); alert("Link copied."); }
    } catch {}
  }

  return (
    <div className="mx-auto grid max-w-[1040px] gap-4 px-4 pb-12 md:grid-cols-2 md:px-10">
      <section className="hud hud-corners p-5 md:col-span-2">
        <div className="flex flex-wrap items-center gap-4">
          <span className="grid size-16 place-items-center rounded-[18px] bg-gradient-to-br from-violet to-cyan font-display text-[30px] font-bold text-void">{p.tag.slice(0, 1).toUpperCase()}</span>
          <div className="min-w-0"><p className="font-display text-[32px] font-bold uppercase leading-none">{p.tag}</p><p className="mt-1 text-[14px] text-fg-soft">{p.answers.game || "Gamer"} · {p.answers.snack || "Snacks"} · goal: {p.answers.goal || "gear"}</p></div>
          {p.shareToken && <button onClick={share} className="ml-auto inline-flex h-11 items-center gap-2 rounded-full px-4 font-semibold ring-1 ring-line hover:bg-white/5"><Share2 className="size-4" />Share my card</button>}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {[["Balance", p.stats.balance.toLocaleString("en-US"), "pts"], ["Earned", p.stats.earned.toLocaleString("en-US"), "pts"], ["Quests cleared", String(p.stats.cleared), ""], ["Played", `${Math.floor(p.stats.minutes / 60)}h ${p.stats.minutes % 60}m`, ""]].map(([l, v, u]) => (
            <div key={l} className="rounded-[14px] bg-white/[0.04] p-3"><p className="text-[12px] text-fg-soft">{l}</p><p className="font-display text-[26px] font-bold leading-tight tabular">{v} <span className="text-[13px] text-fg-soft">{u}</span></p></div>
          ))}
        </div>
      </section>

      <SessionTimer games={p.games} active={p.active} today={p.today} onDone={() => router.refresh()} />

      <section className="hud p-5">
        <p className="label-mono flex items-center gap-2 text-fg-soft"><Gamepad2 className="size-3.5 text-cyan" />[ game sync · {p.games.length}/{p.gamesLimit} linked ]</p>
        {p.games.length === 0 ? <p className="mt-3 text-[14px] text-fg-soft">No games linked yet. Add the one you play most.</p> : (
          <ul className="mt-3 space-y-2">
            {p.games.map((g) => (
              <li key={g.id} className="flex items-center gap-3 rounded-[12px] bg-white/[0.04] px-3 py-2.5">
                <Gamepad2 className="size-4 text-cyan" /><span className="flex-1 truncate text-[15px] font-semibold">{g.name}</span>
                <span className="text-[11px] font-bold uppercase text-fg-soft">{g.source === "steam" ? "Steam" : "Timer"}</span>
                <button onClick={() => delGame(g.id)} aria-label={`Unlink ${g.name}`} className="grid size-8 place-items-center rounded-full hover:bg-white/10"><Trash2 className="size-4 text-fg-soft" /></button>
              </li>
            ))}
          </ul>
        )}
        <form onSubmit={addGame} className="mt-3 flex gap-2">
          <input value={add} onChange={(e) => setAdd(e.target.value)} list="game-list" placeholder="Add a game, e.g. Fortnite" maxLength={60} aria-label="Game name" className="h-11 min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 text-[15px] outline-none focus:border-cyan/60" />
          <datalist id="game-list">{GAMES.filter((g) => g !== "Something else").map((g) => <option key={g} value={g} />)}</datalist>
          <button className="grid size-11 shrink-0 place-items-center rounded-full bg-lime text-void" aria-label="Add game"><Plus className="size-5" /></button>
        </form>
        {msg && <p className="mt-2 text-[13px] text-pink">{msg}</p>}
        <SteamBox {...p.steam} onChange={() => router.refresh()} />
      </section>

      <Preferences answers={p.answers} onSaved={() => router.refresh()} />
    </div>
  );
}

function SteamBox({ enabled, name, synced, onChange }: { enabled: boolean; name: string | null; avatar: string | null; synced: string | null; onChange: () => void }) {
  const [url, setUrl] = useState("");
  const [st, setSt] = useState<"idle" | "busy" | string>("idle");
  async function call(body: object) {
    setSt("busy");
    const r = await fetch("/api/steam", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) { setSt(j.note || (j.points !== undefined ? `Synced: ${j.minutes} new minutes, +${j.points} pts.` : "idle")); onChange(); } else setSt(j.error || "Steam didn't answer. Try again.");
  }
  if (!enabled) return <p className="mt-4 rounded-[12px] bg-white/[0.04] p-3 text-[13px] text-fg-soft">Automatic Steam sync is coming soon. Until then, the session timer counts every game, Steam included.</p>;
  return (
    <div className="mt-4 rounded-[14px] bg-white/[0.04] p-3.5">
      <p className="flex items-center gap-2 text-[14px] font-semibold"><Link2 className="size-4 text-cyan" />Steam {name ? <span className="text-lime">· {name}</span> : null}</p>
      {name ? (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button onClick={() => call({ action: "sync" })} disabled={st === "busy"} className="inline-flex h-10 items-center gap-2 rounded-full bg-cyan px-4 text-[14px] font-semibold text-void">{st === "busy" ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Sync playtime</button>
          <button onClick={() => call({ action: "unlink" })} className="text-[13px] font-semibold text-fg-soft hover:text-fg">Unlink</button>
          {synced && <span className="text-[12px] text-fg-soft">Last sync {new Date(synced).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>}
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); if (url.trim()) call({ action: "link", profile: url.trim() }); }} className="mt-2 flex gap-2">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="steamcommunity.com/id/yourname" aria-label="Steam profile" className="h-10 min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 text-[14px] outline-none" />
          <button disabled={st === "busy"} className="h-10 rounded-full bg-cyan px-4 text-[14px] font-semibold text-void">Link</button>
        </form>
      )}
      {st !== "idle" && st !== "busy" && <p className="mt-2 text-[13px] text-fg-soft">{st}</p>}
      <p className="mt-2 text-[12px] text-fg-soft">Public profiles only. New playtime since your last sync becomes points.</p>
    </div>
  );
}

function SessionTimer({ games, active, today, onDone }: { games: Game[]; active: Active; today: { minutes: number; cap: number }; onDone: () => void }) {
  const [game, setGame] = useState(active?.game || games[0]?.name || "");
  const [sess, setSess] = useState<{ id: string; minutes: number; start: number } | null>(active ? { id: active.id, minutes: active.minutes, start: new Date(active.started_at).getTime() } : null);
  const [now, setNow] = useState(Date.now());
  const [st, setSt] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const beat = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sess) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    beat.current = setInterval(async () => {
      if (document.visibilityState !== "visible") return;
      const r = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "beat", id: sess.id }) }).catch(() => null);
      const j = r ? await r.json().catch(() => null) : null;
      if (j?.minutes !== undefined) setSess((s) => (s ? { ...s, minutes: j.minutes } : s));
      if (j?.capped) setSt("Daily playtime cap reached: quests still earn points.");
      if (r?.status === 404) setSess(null);
    }, 60_000);
    return () => { clearInterval(tick); if (beat.current) clearInterval(beat.current); };
  }, [sess?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function start() {
    if (!game) return setSt("Link a game first.");
    setBusy(true);
    const r = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start", game }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    if (r?.ok) { setSess({ id: j.session.id, minutes: 0, start: Date.now() }); setSt(null); } else setSt(j.error || "Couldn't start. Try again.");
  }
  async function stop() {
    if (!sess) return;
    setBusy(true);
    const r = await fetch("/api/sessions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "stop", id: sess.id }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setBusy(false);
    setSess(null);
    setSt(r?.ok ? `GG. ${j.minutes} min counted · +${j.points} pts.` : "Session ended.");
    onDone();
  }
  const secs = sess ? Math.max(0, Math.floor((now - sess.start) / 1000)) : 0;
  return (
    <section className="hud p-5" data-testid="session-timer">
      <p className="label-mono flex items-center gap-2 text-fg-soft"><Timer className="size-3.5 text-lime" />[ session timer ]</p>
      <p className={cn("mt-2 font-display text-[64px] font-bold leading-none tabular", sess ? "text-lime" : "text-fg")}>{String(Math.floor(secs / 3600)).padStart(1, "0")}:{String(Math.floor((secs % 3600) / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</p>
      <p className="mt-1 text-[13px] text-fg-soft">{sess ? `${sess.minutes} min counted so far · keep this tab open` : `1 pt every 5 min · ${today.minutes} of ${today.cap} min counted today`}</p>
      {!sess && (
        <select value={game} onChange={(e) => setGame(e.target.value)} aria-label="Game" className="mt-4 h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-[15px] outline-none">
          {games.length === 0 && <option value="">Link a game first</option>}
          {games.map((g) => <option key={g.id} value={g.name}>{g.name}</option>)}
        </select>
      )}
      <button onClick={sess ? stop : start} disabled={busy || (!sess && !games.length)} className={cn("mt-3 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-[16px] font-semibold transition active:scale-[0.97] disabled:opacity-60", sess ? "bg-pink text-void" : "bg-lime text-void")}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : sess ? <Pause className="size-4" /> : <Play className="size-4" />}{sess ? "End session" : "Start playing"}
      </button>
      {st && <p className="mt-2 text-[13px] text-fg-soft" role="status">{st}</p>}
      <p className="mt-3 text-[12px] text-fg-soft">Honest note: a website can&apos;t see console, Epic or mobile games, so the timer counts the minutes this tab stays open while you play.</p>
    </section>
  );
}

function Preferences({ answers, onSaved }: { answers: Record<string, string | undefined>; onSaved: () => void }) {
  const [a, setA] = useState(answers);
  const [saved, setSaved] = useState(false);
  async function save(k: string, v: string) {
    setA({ ...a, [k]: v });
    await fetch("/api/onboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key: k, value: v }) }).catch(() => null);
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
    onSaved();
  }
  const rows: [string, string, readonly string[]][] = [["game", "Main game", GAMES], ["snack", "Go-to snack", SNACKS], ["when", "When you play", WHENS], ["goal", "Goal reward", GOALS]];
  return (
    <section className="hud p-5 md:col-span-2">
      <p className="label-mono text-fg-soft">[ quest preferences ] {saved && <span className="text-lime">saved</span>}</p>
      <p className="mt-1 text-[13px] text-fg-soft">New quest runs use these.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {rows.map(([k, l, opts]) => (
          <label key={k} className="block text-[13px] text-fg-soft">{l}
            <select value={a[k] || ""} onChange={(e) => save(k, e.target.value)} className="mt-1 h-11 w-full rounded-full border border-line bg-surface-2 px-4 text-[15px] text-fg outline-none">
              {!a[k] && <option value="">Pick one</option>}
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        ))}
      </div>
    </section>
  );
}
