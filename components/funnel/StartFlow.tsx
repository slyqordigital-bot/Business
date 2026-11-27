"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Flame, Gamepad2, Lock, Share2, TrendingUp } from "lucide-react";
import type { RunView } from "@/lib/server/run";
import { Quiz, type Question } from "./Quiz";
import { FunnelProvider, useFunnel } from "./Funnel";
import { usePlans } from "./Paywall";
import { QuestCard } from "@/components/app/QuestCard";
import { RewardIcon } from "@/components/app/RewardIcon";
import { Logo } from "@/components/ui/Logo";
import { MainButton } from "@/components/ui/MainButton";
import { cn } from "@/lib/utils";

type Answers = { game?: string; snack?: string; when?: string; goal?: string; tag?: string };

const GAME_LINES: Record<string, string> = {
  Fortnite: "Builds, boxes and Victory Royales. We'll snack around all of it.",
  Valorant: "Rounds, clutches and aces. Your snack breaks fit right between them.",
  Minecraft: "Mining runs and long builds: perfect for slow-snack quests.",
  "Call of Duty": "Killstreaks, respawns and loadouts. Every one can be a quest.",
  "League of Legends": "Queue times, laning and back-to-base. Lots of snack windows.",
  Roblox: "So many games in one. Your quests can hop between them.",
  "Something else": "Any game works: quests are proven with a photo of your setup.",
};
const SNACK_LINES: Record<string, string> = {
  Pizza: "A classic. Crusts are about to become a game mechanic.",
  Chips: "Crunchy, loud and perfect for between-round quests.",
  Wings: "Sauce on your fingers, controller safe: we'll keep it clean.",
  Candy: "Sweet. Small bites make great reward moments.",
  "Energy drinks": "We'll keep it to one can and plenty of water breaks.",
  "Healthy stuff": "Fruit, nuts, veggies: healthy snacks earn the same points.",
};
const WHEN_LINES: Record<string, string> = {
  "After school or work": "Your quests will fit a 1 to 2 hour session.",
  "Late night": "Late-night quests, built for snacks and long sessions.",
  Weekends: "Bigger quests for long weekend sessions.",
  "All the time": "Daily quests plus bonus ones for the long grinds.",
};
const GOAL_LINES: Record<string, string> = {
  Headset: "Good pick. We'll plot when your points can get you there.",
  Controller: "We'll plot when your points can get you there.",
  Keyboard: "Clicky. We'll plot when your points can get you there.",
  Mouse: "Quick win. We'll plot when your points can get you there.",
  "Game gift card": "The fastest reward to unlock. Let's plot it.",
};

function questions(a: Answers): Question[] {
  const g = a.game && a.game !== "Something else" ? a.game : "gaming";
  return [
    { key: "game", text: "What do you play the most?", options: Object.keys(GAME_LINES).map((v) => ({ value: v, line: GAME_LINES[v] })) },
    { key: "snack", text: `And what's your go-to ${g} snack?`, options: Object.keys(SNACK_LINES).map((v) => ({ value: v, line: SNACK_LINES[v] })) },
    { key: "when", text: `When do you usually grind ${g}?`, options: Object.keys(WHEN_LINES).map((v) => ({ value: v, line: WHEN_LINES[v] })) },
    { key: "goal", text: `Last one: what gear should your ${(a.snack || "snacks").toLowerCase()} unlock first?`, options: Object.keys(GOAL_LINES).map((v) => ({ value: v, line: GOAL_LINES[v] })) },
  ];
}

function suggestTag(a: Answers) {
  const s = (a.snack || "Snack").split(" ")[0].replace(/[^A-Za-z]/g, "");
  const g = { Fortnite: "Royale", Valorant: "Clutch", Minecraft: "Miner", "Call of Duty": "Sniper", "League of Legends": "Carry", Roblox: "Builder" }[a.game || ""] || "Player";
  return `${s}${g}${(s.length * 7 + g.length * 3) % 90 + 10}`;
}

type Phase = "quiz" | "input" | "work" | "result";

export function StartFlow(props: { initialAnswers: Answers; initialRun: RunView | null; paid: boolean; steamEnabled: boolean; planName: string | null }) {
  const router = useRouter();
  const [run, setRun] = useState<RunView | null>(props.initialRun);
  const [paid, setPaid] = useState(props.paid);
  const [justUnlocked, setJustUnlocked] = useState(false);
  const reload = useCallback(async () => {
    const r = await fetch("/api/run").then((x) => x.json()).catch(() => null);
    if (r?.run) setRun(r.run);
    if (r?.paid) { setPaid(true); setJustUnlocked(true); }
    router.refresh();
  }, [router]);
  return (
    <FunnelProvider onUnlocked={reload}>
      <Flow {...props} run={run} setRun={setRun} paid={paid} justUnlocked={justUnlocked} />
    </FunnelProvider>
  );
}

function Flow({ initialAnswers, steamEnabled, run, setRun, paid, justUnlocked }: { initialAnswers: Answers; steamEnabled: boolean; run: RunView | null; setRun: (r: RunView) => void; paid: boolean; justUnlocked: boolean }) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const qs = useMemo(() => questions(answers), [answers]);
  const firstOpen = qs.findIndex((q) => !answers[q.key as keyof Answers]);
  const [phase, setPhase] = useState<Phase>(run ? "result" : firstOpen === -1 ? "input" : "quiz");
  const [step, setStep] = useState(firstOpen === -1 ? 0 : firstOpen);
  const [steam, setSteam] = useState("");

  function save(key: string, value: string) {
    fetch("/api/onboard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key, value }) }).catch(() => {});
  }

  return (
    <main className="relative min-h-dvh overflow-clip bg-void">
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[520px] opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-[-220px] h-[480px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.32),transparent)]" />
      <header className="relative mx-auto flex max-w-[1040px] items-center justify-between px-4 pt-5 md:px-8">
        <Logo />
        {phase === "result" && paid && <Link href="/dashboard" className="text-[14px] font-semibold text-fg-soft hover:text-fg">Dashboard →</Link>}
      </header>
      <div className="relative px-4 pb-32 pt-6 md:px-8 md:pt-10">
        {phase === "quiz" && (
          <Quiz questions={qs} answers={answers} step={step} total={qs.length}
            onBack={() => setStep((s) => Math.max(0, s - 1))}
            onAnswer={(k, v) => {
              setAnswers((a) => ({ ...a, [k]: v }));
              save(k, v);
              if (step + 1 < qs.length) setStep(step + 1);
              else setPhase("input");
            }} />
        )}
        {phase === "input" && (
          <InputStep answers={answers} steamEnabled={steamEnabled} steam={steam} setSteam={setSteam}
            onBack={() => { setPhase("quiz"); setStep(qs.length - 1); }}
            onGo={(tag) => { setAnswers((a) => ({ ...a, tag })); save("tag", tag); setPhase("work"); }} />
        )}
        {phase === "work" && <Work answers={answers} steam={steam} onDone={(r) => { setRun(r); setPhase("result"); }} onBack={() => setPhase("input")} />}
        {phase === "result" && run && <Result run={run} answers={answers} paid={paid} justUnlocked={justUnlocked} autoPaywall={!paid} />}
      </div>
    </main>
  );
}

function InputStep({ answers, steamEnabled, steam, setSteam, onGo, onBack }: { answers: Answers; steamEnabled: boolean; steam: string; setSteam: (s: string) => void; onGo: (tag: string) => void; onBack: () => void }) {
  const [tag, setTag] = useState(answers.tag || suggestTag(answers));
  const [err, setErr] = useState<string | null>(null);
  function go(e: React.FormEvent) {
    e.preventDefault();
    const t = tag.trim();
    if (t.length < 2) return setErr("Pick a gamer tag with at least 2 characters.");
    if (steam && !/steamcommunity\.com\/(id|profiles)\/|^7656\d{13}$|^[A-Za-z0-9_-]{2,32}$/.test(steam.trim())) return setErr("Paste your Steam profile link, like steamcommunity.com/id/yourname.");
    onGo(t.slice(0, 32));
  }
  return (
    <form onSubmit={go} className="mx-auto w-full max-w-[560px]">
      <div className="xp-track h-1"><div className="xp-fill" style={{ width: "100%" }} /></div>
      <div className="mt-4 flex h-8 items-center text-[13px] text-fg-soft">
        <button type="button" onClick={onBack} className="flex items-center gap-1.5 hover:text-fg">← Previous question</button>
      </div>
      <p className="label-mono mt-6 text-cyan">[ player card ]</p>
      <h1 className="mt-2 font-display text-[34px] font-bold uppercase leading-[1.02] md:text-[44px]">What should we call you on the board?</h1>
      <p className="mt-2 text-[15px] text-fg-soft">Your gamer tag goes on your quests and your share card. Keep ours or type yours.</p>
      <label htmlFor="tag" className="sr-only">Gamer tag</label>
      <input id="tag" value={tag} onChange={(e) => { setTag(e.target.value); setErr(null); }} maxLength={32} autoComplete="nickname" data-testid="tag-input"
        className="mt-6 h-[60px] w-full rounded-[16px] border border-line bg-surface-2 px-5 font-display text-[24px] font-bold tracking-wide outline-none transition focus:border-lime/60 focus:ring-4 focus:ring-lime/10" />
      {steamEnabled ? (
        <div className="mt-5">
          <label htmlFor="steam" className="flex items-center gap-2 text-[15px] font-semibold"><Gamepad2 className="size-4 text-cyan" />Link your Steam profile <span className="font-normal text-fg-soft">(optional)</span></label>
          <input id="steam" value={steam} onChange={(e) => { setSteam(e.target.value); setErr(null); }} placeholder="steamcommunity.com/id/yourname" inputMode="url"
            className="mt-2 h-[52px] w-full rounded-[14px] border border-line bg-surface-2 px-4 text-[16px] outline-none focus:border-cyan/60" />
          <p className="mt-1.5 text-[13px] text-fg-soft">We read your recent playtime (public profiles only). Console or Epic? Skip it: the session timer counts those.</p>
        </div>
      ) : (
        <p className="mt-4 text-[13px] text-fg-soft">Playing on console, Epic or mobile? Your playtime counts with the in-app session timer.</p>
      )}
      {err && <p className="mt-3 text-[14px] text-pink" role="alert">{err}</p>}
      <MainButton type="submit" className="mt-7 w-full" data-testid="build-quest">Build my Snack Quest</MainButton>
    </form>
  );
}

function Work({ answers, steam, onDone, onBack }: { answers: Answers; steam: string; onDone: (r: RunView) => void; onBack: () => void }) {
  const reduce = useReducedMotion();
  const steps = useMemo(() => [
    "Reading your gamer profile",
    steam ? "Syncing your Steam games" : `Locking in ${answers.game && answers.game !== "Something else" ? answers.game : "your main game"}`,
    `Cooking up ${(answers.snack || "snack").toLowerCase()} quests`,
    `Pricing your ${(answers.goal || "reward").toLowerCase()}`,
    "Plotting your 30-day run",
  ], [answers, steam]);
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState<RunView | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const started = useRef(0);

  useEffect(() => {
    let alive = true;
    setErr(null);
    setResult(null);
    setPct(0);
    setReady(false);
    started.current = performance.now();
    (async () => {
      for (let tryN = 0; tryN < 2; tryN++) {
        const r = await fetch("/api/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers, ...(steam ? { steam } : {}) }) }).catch(() => null);
        if (!alive) return;
        const j = r ? await r.json().catch(() => null) : null;
        if (r?.ok && j?.run) { setResult(j.run); return; }
        if (r && (r.status === 429 || r.status === 503 || r.status === 400)) { setErr(j?.error || "Something went wrong."); return; }
      }
      if (alive) setErr("Our quest builder lagged. Try again.");
    })();
    return () => { alive = false; };
  }, [steam, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  // percentage: smooth, at least 6 s, holds at 99 % until the real work is done
  useEffect(() => {
    if (err) return;
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - started.current) / 1000;
      const target = Math.min(99, (t / 6.5) * 99);
      setPct((p) => {
        if (result && t >= (reduce ? 1 : 6)) return Math.min(100, p + 2.5);
        return Math.max(p, Math.min(99, target));
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [result, err, reduce]);

  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    if (pct >= 100 && result && !ready) setReady(true);
  }, [pct, result, ready]);
  useEffect(() => {
    if (!ready || !result) return;
    const t = setTimeout(() => doneRef.current(result), 1500);
    return () => clearTimeout(t);
  }, [ready, result]);

  const doneSteps = Math.min(steps.length, Math.floor((pct / 100) * (steps.length + 0.2)));
  const r = 52;
  const c = 2 * Math.PI * r;

  return (
    <div className="mx-auto w-full max-w-[520px] text-center" data-testid="work">
      <AnimatePresence mode="wait">
        {!ready ? (
          <motion.div key="w" exit={{ opacity: 0, scale: 0.97 }}>
            <p className="label-mono text-cyan">[ building your snack quest ]</p>
            <div className="relative mx-auto mt-8 size-[160px]">
              <svg viewBox="0 0 120 120" className="size-full -rotate-90">
                <circle cx="60" cy="60" r={r} stroke="rgb(255 255 255 / .08)" strokeWidth="8" fill="none" />
                <circle cx="60" cy="60" r={r} stroke="url(#wg)" strokeWidth="8" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} style={{ filter: "drop-shadow(0 0 8px rgb(200 255 61 / .6))" }} />
                <defs><linearGradient id="wg"><stop offset="0" stopColor="#22E1FF" /><stop offset="1" stopColor="#C8FF3D" /></linearGradient></defs>
              </svg>
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-[44px] font-bold tabular" data-testid="work-pct">{Math.floor(Math.min(pct, 99.9))}%</span>
              </div>
            </div>
            <ul className="mx-auto mt-8 max-w-[360px] space-y-3 text-left">
              {steps.map((s, i) => {
                const done = i < doneSteps;
                const active = i === doneSteps;
                return (
                  <li key={s} className={cn("flex items-center gap-3 text-[15px] transition", done ? "text-fg" : active ? "text-fg" : "text-fg-soft/50")}>
                    <span className={cn("grid size-6 shrink-0 place-items-center rounded-[6px] border transition", done ? "border-lime bg-lime text-void" : active ? "border-cyan" : "border-white/15")}>
                      {done ? <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }}><Check className="size-4" strokeWidth={3} /></motion.span> : active ? <span className="size-2 animate-pulse rounded-full bg-cyan" /> : null}
                    </span>
                    {s}
                  </li>
                );
              })}
            </ul>
            {err && (
              <div className="mt-8 rounded-[16px] border border-line bg-surface p-4 text-[15px]" role="alert">
                <p>{err}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <button onClick={() => setAttempt((a) => a + 1)} className="rounded-full bg-lime px-5 py-2.5 font-semibold text-void">Try again</button>
                  <button onClick={onBack} className="rounded-full px-5 py-2.5 font-semibold ring-1 ring-line">Back</button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="r" initial={reduce ? false : { opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 18 }} className="pt-16">
            <motion.span initial={reduce ? false : { scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
              className="glow-edge mx-auto grid size-20 place-items-center rounded-[24px] bg-lime text-void"><Check className="size-10" strokeWidth={3} /></motion.span>
            <h2 className="title-xl mt-6 text-[40px] md:text-[56px]">Your Snack Quest<br /><span className="text-neon">is ready.</span></h2>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function fmtDate(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "";
}

function Result({ run, answers, paid, justUnlocked, autoPaywall }: { run: RunView; answers: Answers; paid: boolean; justUnlocked: boolean; autoPaywall: boolean }) {
  const funnel = useFunnel();
  const { plans } = usePlans();
  const featured = plans?.find((p) => p.featured) ?? plans?.[0];
  const reduce = useReducedMotion();
  const [paywallSeen, setPaywallSeen] = useState(false);
  const snack = run.snack.toLowerCase();
  const title = `Your ${run.game === "Something else" ? "gaming" : run.game} × ${snack} quest is ready.`;
  const when = (answers.when || "gaming").toLowerCase().replace("all the time", "daily");
  const line = `${run.quests.length} quests built around your ${when} sessions. Unlock them and start earning toward your ${run.goal?.name || "first reward"}.`;
  const open = useCallback(() => { setPaywallSeen(true); funnel.openPaywall({ title, line }); }, [funnel, title, line]);

  useEffect(() => {
    if (!autoPaywall) return;
    const t = setTimeout(open, 1400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const first = run.quests[0];
  const rest = run.quests.slice(1);
  const goalPct = run.goal ? Math.min(100, (run.balance / run.goal.cost) * 100) : 0;

  async function share() {
    const url = `${location.origin}/q/${run.share_token}`;
    try {
      if (navigator.share) await navigator.share({ title: run.title, text: `My SnackQuest run: ${run.title}`, url });
      else { await navigator.clipboard.writeText(url); alert("Link copied."); }
    } catch {}
  }

  return (
    <div className="mx-auto w-full max-w-[1040px]" data-testid="result">
      <motion.div initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <p className="label-mono text-cyan">[ {paid ? "quest run unlocked" : "your snack quest"} ]</p>
        <h1 className="title-xl mt-2 text-[40px] md:text-[64px]" data-testid="run-title">{run.title}</h1>
        <p className="mt-2 text-[15px] text-fg-soft">{run.game} · {run.snack} · {answers.tag ? `@${answers.tag}` : "Player 1"}</p>
      </motion.div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1.25fr_1fr]">
        <div className="space-y-4">
          {first && <QuestCard q={first} index={0} />}
          <div className="relative">
            <div className={cn("space-y-3 transition-[filter] duration-700", !paid && "pointer-events-none select-none blur-[7px]")} aria-hidden={!paid}>
              {rest.map((q, i) => <QuestCard key={q.id} q={q} index={i + 1} />)}
            </div>
            {!paid && (
              <button onClick={open} className="absolute inset-0 flex flex-col items-center justify-start bg-gradient-to-b from-void/10 via-void/50 to-void/90 pt-16 text-center" data-testid="locked-quests">
                <span className="glow-edge grid size-14 place-items-center rounded-[18px] bg-surface-2"><Lock className="size-6 text-lime" /></span>
                <span className="mt-3 font-display text-[22px] font-bold uppercase">{rest.length} more quests locked</span>
                <span className="mt-1 text-[14px] text-fg-soft">Rare and legendary ones included</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="hud hud-corners p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-[14px] bg-pink/15 text-pink"><Flame className="size-6" /></span>
              <div>
                <p className="font-display text-[24px] font-bold uppercase leading-none">Day 1 started</p>
                <p className="mt-1 text-[13px] text-fg-soft">Clear one quest a day to keep the streak alive.</p>
              </div>
            </div>
            <div className="mt-4 flex gap-1.5">{Array.from({ length: 7 }).map((_, i) => <span key={i} className={cn("h-2 flex-1 rounded-full", i === 0 ? "bg-pink shadow-[0_0_10px_var(--pink)]" : "bg-white/10")} />)}</div>
          </div>

          {run.goal && (
            <div className="hud p-5">
              <p className="label-mono text-fg-soft">[ your goal ]</p>
              <div className="mt-3 flex items-center gap-3">
                <span className="grid size-14 place-items-center rounded-[16px] bg-gradient-to-br from-violet/40 to-cyan/30"><RewardIcon name={run.goal.icon} className="size-7" /></span>
                <div className="min-w-0">
                  <p className="font-display text-[22px] font-bold uppercase leading-none">{run.goal.name}</p>
                  <p className="mt-1 text-[14px] text-fg-soft tabular">{run.balance.toLocaleString("en-US")} / {run.goal.cost.toLocaleString("en-US")} pts</p>
                </div>
              </div>
              <div className="xp-track mt-4 h-3"><motion.div className="xp-fill" initial={{ width: 0 }} animate={{ width: `${Math.max(2, goalPct)}%` }} transition={{ duration: 1.2, ease: "easeOut" }} /></div>
            </div>
          )}

          <div className="hud relative overflow-hidden p-5">
            <p className="label-mono flex items-center gap-2 text-fg-soft"><TrendingUp className="size-3.5 text-lime" />[ 30-day projection ]</p>
            <div className={cn("transition-[filter] duration-700", !paid && "select-none blur-[8px]")} aria-hidden={!paid}>
              {paid && run.projection ? (
                <>
                  <p className="mt-3 font-display text-[30px] font-bold uppercase leading-[1.02]">
                    {run.projection.days === 0 ? "Ready to redeem" : <>{run.goal?.name} around <span className="text-lime">{fmtDate(run.projection.date)}</span></>}
                  </p>
                  <p className="mt-1 text-[14px] text-fg-soft">About {run.projection.in30.toLocaleString("en-US")} pts in 30 days at your pace ({run.pace} pts a day). An estimate, not a promise.</p>
                </>
              ) : (
                <>
                  <p className="mt-3 font-display text-[30px] font-bold uppercase leading-[1.02]">{run.goal?.name || "Reward"} around xxx xx</p>
                  <p className="mt-1 text-[14px] text-fg-soft">About x,xxx pts in 30 days at your pace.</p>
                </>
              )}
              <svg viewBox="0 0 300 70" className="mt-4 h-[70px] w-full" aria-hidden>
                <defs><linearGradient id="pg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#C8FF3D" stopOpacity=".35" /><stop offset="1" stopColor="#C8FF3D" stopOpacity="0" /></linearGradient></defs>
                <path d="M0 66 C60 62 100 52 150 40 S240 14 300 6 V70 H0Z" fill="url(#pg)" />
                <path d="M0 66 C60 62 100 52 150 40 S240 14 300 6" stroke="#C8FF3D" strokeWidth="2.5" fill="none" />
              </svg>
            </div>
            {!paid && <button onClick={open} className="absolute inset-0 grid place-items-center" aria-label="Unlock my quests"><span className="flex items-center gap-2 rounded-full bg-void/80 px-4 py-2 text-[14px] font-semibold ring-1 ring-line"><Lock className="size-4 text-lime" />Unlock my progress</span></button>}
          </div>

          {paid && (
            <div className="flex flex-wrap gap-2">
              <MainButton href="/quests" size="md">{justUnlocked ? "Clear quest #1" : "Go to my quests"}</MainButton>
              <button onClick={share} className="inline-flex h-[54px] items-center gap-2 rounded-full px-5 font-semibold ring-1 ring-line hover:bg-white/5"><Share2 className="size-4" />Share</button>
            </div>
          )}
        </div>
      </div>

      {!paid && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-night/90 px-4 pb-[max(14px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl" data-testid="sticky-unlock">
          <button onClick={open} className="mx-auto flex h-[56px] w-full max-w-[560px] items-center justify-between rounded-full bg-lime pl-6 pr-2 font-semibold text-void active:scale-[0.97]">
            <span>Unlock my quests{featured ? ` · ${featured.per_day} / day` : ""}</span>
            <span className="grid size-10 place-items-center rounded-full bg-void text-lime"><ArrowRight className="size-[18px] animate-nudge" /></span>
          </button>
          {paywallSeen && <span className="sr-only">Paywall was opened</span>}
        </div>
      )}
    </div>
  );
}
