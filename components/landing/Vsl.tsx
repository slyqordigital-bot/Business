"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Check, Flame, Gamepad2, Headphones, Pause, Play, RotateCcw, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The motion-design VSL (no video file): 8 scenes, ~64 s, muted autoplay when visible,
 * big captions, replay button. public/vsl.mp4 replaces it once it exists (see VSL.md).
 */
const SCENES: { d: number; cap: string; sub: string }[] = [
  { d: 7000, cap: "Gaming gear costs a fortune.", sub: "the problem" },
  { d: 8000, cap: "And you snack through every match anyway.", sub: "the usual way" },
  { d: 8000, cap: "What if every snack break was a quest?", sub: "the moment it clicks" },
  { d: 9000, cap: "Snap your snack. Quest cleared.", sub: "snackquest in action" },
  { d: 8000, cap: "Your playtime earns points too.", sub: "game sync" },
  { d: 9000, cap: "Points stack up. Gear unlocks.", sub: "the result" },
  { d: 8000, cap: "A streak to keep. A reason to grind.", sub: "what changes" },
  { d: 7000, cap: "Your first quest is one tap away.", sub: "your turn" },
];
const TOTAL = SCENES.reduce((a, s) => a + s.d, 0);

export function Vsl({ hasVideo }: { hasVideo?: boolean }) {
  const reduce = useReducedMotion();
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [visible, setVisible] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const last = useRef<number | null>(null);

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.4 });
    if (box.current) io.observe(box.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => { if (visible && !reduce && t === 0) setPlaying(true); }, [visible, reduce, t]);

  useEffect(() => {
    if (!playing || !visible) { last.current = null; return; }
    let raf = 0;
    const tick = (now: number) => {
      if (last.current != null) setT((x) => Math.min(TOTAL, x + (now - last.current!)));
      last.current = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, visible]);
  useEffect(() => { if (t >= TOTAL) setPlaying(false); }, [t]);

  let acc = 0, idx = 0;
  for (let i = 0; i < SCENES.length; i++) { if (t < acc + SCENES[i].d) { idx = i; break; } acc += SCENES[i].d; idx = i; }
  const p = Math.min(1, (t - acc) / SCENES[idx].d);
  const ended = t >= TOTAL;

  if (hasVideo) {
    return (
      <div className="overflow-hidden rounded-[28px] ring-1 ring-white/10">
        <video src="/vsl.mp4" autoPlay muted playsInline controls loop className="aspect-video w-full" />
      </div>
    );
  }

  return (
    <div ref={box} className="hud relative overflow-hidden !rounded-[28px]" data-testid="vsl">
      <div className="relative aspect-[4/5] w-full sm:aspect-video">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute left-1/2 top-[-30%] h-[70%] w-[80%] -translate-x-1/2 rounded-full bg-violet/25 blur-[90px]" />
        <AnimatePresence mode="wait">
          <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.6, ease: [0.22, 0.8, 0.24, 1] }}>
            <SceneVisual i={idx} p={p} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/85 to-transparent px-5 pb-12 pt-20 sm:px-10">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }}>
              <p className="label-mono text-cyan">[ {SCENES[idx].sub} ]</p>
              <p className="mt-2 max-w-[700px] font-display text-[32px] font-bold uppercase leading-[1] sm:text-[50px]">{SCENES[idx].cap}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="absolute inset-x-5 bottom-4 flex items-center gap-3 sm:inset-x-10">
          <div className="flex flex-1 gap-1">
            {SCENES.map((s, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15" style={{ flexGrow: s.d }}>
                <div className="h-full bg-lime" style={{ width: `${i < idx ? 100 : i === idx ? p * 100 : 0}%` }} />
              </div>
            ))}
          </div>
          <button aria-label={ended ? "Replay" : playing ? "Pause" : "Play"} onClick={() => { if (ended) { setT(0); setPlaying(true); } else setPlaying(!playing); }}
            className="grid size-9 place-items-center rounded-full bg-white/10 backdrop-blur transition hover:bg-white/20">
            {ended ? <RotateCcw className="size-4" /> : playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        </div>
        {ended && (
          <Link href="/signup" className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-lime px-7 py-4 text-[16px] font-semibold text-void shadow-[0_0_40px_rgb(200_255_61/0.4)]">Start my Snack Quest</Link>
        )}
      </div>
    </div>
  );
}

function SceneVisual({ i, p }: { i: number; p: number }) {
  const center = "absolute inset-x-0 top-[6%] bottom-[36%] flex items-center justify-center px-6";
  switch (i) {
    case 0: {
      const tags: [string, number, string][] = [["Headset", 129, "text-pink"], ["Controller", 69, "text-cyan"], ["Keyboard", 149, "text-violet"]];
      return (
        <div className={center}>
          <div className="flex flex-wrap justify-center gap-3">
            {tags.map(([n, v, c], k) => (
              <div key={n} className="hud px-5 py-4 text-center transition-all duration-500" style={{ opacity: p > k * 0.18 ? 1 : 0, transform: `translateY(${p > k * 0.18 ? 0 : 12}px)` }}>
                <p className="label-mono text-fg-soft">{n}</p>
                <p className={cn("font-display text-[44px] font-bold tabular sm:text-[60px]", c)}>${Math.round(v * Math.min(1, p * 1.6))}</p>
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 1: {
      const mins = Math.floor(p * 192);
      return (
        <div className={center}>
          <div className="grid w-full max-w-[460px] grid-cols-2 gap-3">
            <div className="hud p-4 text-center"><p className="label-mono text-fg-soft">played tonight</p><p className="font-display text-[44px] font-bold tabular text-fg">{Math.floor(mins / 60)}h {String(mins % 60).padStart(2, "0")}m</p></div>
            <div className="hud p-4 text-center"><p className="label-mono text-fg-soft">snacks</p><p className="font-display text-[44px] font-bold tabular text-fg">{1 + Math.floor(p * 3)}</p></div>
            <div className="hud col-span-2 p-4 text-center"><p className="label-mono text-fg-soft">rewards earned</p><p className="font-display text-[56px] font-bold text-pink">0</p></div>
          </div>
        </div>
      );
    }
    case 2:
      return (
        <div className={center}>
          <motion.div initial={{ y: 40, opacity: 0, rotate: -3 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 160, damping: 16, delay: 0.3 }}
            className="hud rarity-legendary rarity-stripe w-full max-w-[420px] p-5">
            <p className="label-mono text-lime">legendary</p>
            <p className="mt-1 font-display text-[34px] font-bold uppercase leading-none">Crust Shield Protocol</p>
            <p className="mt-2 text-[15px] text-fg/85">Save your pizza crust. Eat it only after your first win of the night.</p>
            <p className="mt-3 inline-block rounded-full bg-lime px-3 py-1 font-display text-[20px] font-bold text-void">+100 pts</p>
          </motion.div>
        </div>
      );
    case 3:
      return (
        <div className={center}>
          <div className="relative aspect-[4/3] w-full max-w-[400px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#2a1650] via-[#1a1236] to-[#0c0a16] ring-1 ring-white/10">
            <div className="absolute bottom-[14%] left-[10%] h-[44%] w-[58%] rounded-[12px] bg-gradient-to-b from-cyan/30 to-violet/30 ring-1 ring-cyan/40"><p className="mt-[14%] text-center font-display text-[20px] font-bold uppercase text-cyan/90">Victory</p></div>
            <div className="absolute bottom-[10%] right-[8%] size-[38%] rounded-full bg-[conic-gradient(from_200deg,#ffb84d,#e8742f,#ffb84d)] ring-4 ring-[#f6d08a]/60" />
            <div className="absolute inset-x-0 h-0.5 bg-lime shadow-[0_0_14px_var(--lime)]" style={{ top: `${10 + Math.abs(Math.sin(p * Math.PI * 2)) * 80}%` }} />
            {["tl", "tr", "bl", "br"].map((c) => <span key={c} className={cn("absolute size-6 border-lime", c[0] === "t" ? "top-3 border-t-2" : "bottom-3 border-b-2", c[1] === "l" ? "left-3 border-l-2" : "right-3 border-r-2")} />)}
            <Camera className="absolute left-4 top-4 size-5 text-white/70" />
            {p > 0.55 && (
              <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 16 }} className="absolute inset-0 grid place-items-center bg-void/50">
                <span className="glow-edge flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-display text-[22px] font-bold uppercase text-void"><Check className="size-5" strokeWidth={3} />Quest cleared · +60</span>
              </motion.div>
            )}
          </div>
        </div>
      );
    case 4: {
      const m = Math.floor(p * 48);
      return (
        <div className={center}>
          <div className="hud w-full max-w-[400px] p-5">
            <div className="flex items-center gap-3"><Gamepad2 className="size-6 text-cyan" /><p className="font-display text-[24px] font-bold uppercase">Fortnite session</p><Timer className="ml-auto size-5 text-lime" /></div>
            <p className="mt-3 font-display text-[64px] font-bold leading-none tabular">{String(m).padStart(2, "0")}:{String(Math.floor((p * 2880) % 60)).padStart(2, "0")}</p>
            <p className="mt-2 text-[15px] text-fg-soft">1 point every 5 minutes played · <span className="font-semibold text-lime tabular">+{Math.floor(m / 5)} pts</span></p>
          </div>
        </div>
      );
    }
    case 5: {
      const v = Math.min(1, p * 1.25);
      return (
        <div className={center}>
          <div className="w-full max-w-[460px]">
            <div className="flex items-center gap-3"><span className="grid size-14 place-items-center rounded-[16px] bg-gradient-to-br from-violet/50 to-cyan/40"><Headphones className="size-7" /></span><div><p className="font-display text-[28px] font-bold uppercase leading-none">Pro Gaming Headset</p><p className="text-[14px] text-fg-soft tabular">{Math.round(v * 30000).toLocaleString("en-US")} / 30,000 pts</p></div></div>
            <div className="xp-track mt-4 h-4"><div className="xp-fill" style={{ width: `${v * 100}%` }} /></div>
            {v >= 1 && <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center font-display text-[30px] font-bold uppercase text-lime">Reward unlocked</motion.p>}
          </div>
        </div>
      );
    }
    case 6:
      return (
        <div className={center}>
          <div className="flex gap-2 sm:gap-3">
            {Array.from({ length: 7 }).map((_, k) => {
              const on = p > k / 8;
              return (
                <div key={k} className={cn("grid size-11 place-items-center rounded-[14px] transition-all duration-300 sm:size-16", on ? "bg-pink/20 text-pink shadow-[0_0_20px_-4px_var(--pink)]" : "bg-white/5 text-white/20")}>
                  <Flame className="size-5 sm:size-7" />
                </div>
              );
            })}
          </div>
        </div>
      );
    default:
      return (
        <div className={center}>
          <div className="text-center">
            <p className="font-display text-[56px] font-bold uppercase leading-none sm:text-[88px]">Snack. Play.</p>
            <p className="text-neon font-display text-[56px] font-bold uppercase leading-none sm:text-[88px]">Unlock.</p>
          </div>
        </div>
      );
  }
}
