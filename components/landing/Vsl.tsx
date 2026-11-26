"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Flame, Pause, Play, RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The motion-design VSL (no video file): 8 scenes, ~64 s, muted autoplay when visible,
 * big captions, replay button. public/vsl.mp4 replaces it once it exists (see VSL.md).
 */
const SCENES: { d: number; cap: string; sub?: string }[] = [
  { d: 7000, cap: "Logging lunch shouldn't take 10 minutes.", sub: "the problem" },
  { d: 8000, cap: "You search. You scroll. You guess.", sub: "the usual way" },
  { d: 7000, cap: "By week two, most people stop logging.", sub: "why it fails" },
  { d: 7000, cap: "What if you just took a photo?", sub: "the moment it clicks" },
  { d: 9000, cap: "MacroSnap reads every food on your plate.", sub: "macrosnap in action" },
  { d: 9000, cap: "Your macros, in seconds.", sub: "the result" },
  { d: 9000, cap: "Every meal logged. Every day. Without typing.", sub: "what changes" },
  { d: 8000, cap: "Snap your first meal. It's free to try.", sub: "your turn" },
];
const TOTAL = SCENES.reduce((a, s) => a + s.d, 0);

const SEARCH = [
  ["Chicken bowl (generic)", "140 cal"],
  ["Chicken burrito bowl, restaurant", "1,240 cal"],
  ["chicken bowl w/ rice", "520 cal"],
  ["Bowl, chicken, homemade??", "88 cal"],
  ["Chicken teriyaki bowl", "760 cal"],
];

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
    <div ref={box} className="relative overflow-hidden rounded-[28px] bg-night-2 ring-1 ring-white/10" data-testid="vsl">
      <div className="relative aspect-[4/5] w-full sm:aspect-video">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <AnimatePresence mode="wait">
          <motion.div key={idx} className="absolute inset-0" initial={{ opacity: 0, scale: 1.02 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.6, ease: [0.22, 0.8, 0.24, 1] }}>
            <SceneVisual i={idx} p={p} />
          </motion.div>
        </AnimatePresence>
        {/* captions */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-night via-night/85 to-transparent px-5 pb-12 pt-20 sm:px-10">
          <AnimatePresence mode="wait">
            <motion.div key={idx} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5 }}>
              <p className="label-mono text-lime/80">[ {SCENES[idx].sub} ]</p>
              <p className="mt-2 max-w-[640px] font-serif text-[28px] font-semibold leading-[1.08] tracking-[-0.03em] text-cream sm:text-[42px]">{SCENES[idx].cap}</p>
            </motion.div>
          </AnimatePresence>
        </div>
        {/* progress + controls */}
        <div className="absolute inset-x-5 bottom-4 flex items-center gap-3 sm:inset-x-10">
          <div className="flex flex-1 gap-1">
            {SCENES.map((s, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/15" style={{ flexGrow: s.d }}>
                <div className="h-full bg-lime" style={{ width: `${i < idx ? 100 : i === idx ? p * 100 : 0}%` }} />
              </div>
            ))}
          </div>
          <button aria-label={ended ? "Replay" : playing ? "Pause" : "Play"} onClick={() => { if (ended) { setT(0); setPlaying(true); } else setPlaying(!playing); }}
            className="grid size-9 place-items-center rounded-full bg-white/10 text-cream backdrop-blur transition hover:bg-white/20">
            {ended ? <RotateCcw className="size-4" /> : playing ? <Pause className="size-4" /> : <Play className="size-4" />}
          </button>
        </div>
        {ended && (
          <a href="#try" className="absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-lime px-7 py-4 text-[16px] font-semibold text-night shadow-[0_0_40px_rgb(200_255_61/0.4)]">Snap my macros</a>
        )}
      </div>
    </div>
  );
}

function SceneVisual({ i, p }: { i: number; p: number }) {
  const center = "absolute inset-x-0 top-[8%] bottom-[34%] flex items-center justify-center px-6";
  switch (i) {
    case 0: {
      const mins = Math.floor(p * 9.5);
      return (
        <div className={center}>
          <div className="text-center">
            <div className="font-mono text-[72px] font-medium tabular-nums text-cream sm:text-[120px]">{String(mins).padStart(2, "0")}:{String(Math.floor((p * 570) % 60)).padStart(2, "0")}</div>
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-tomato">time spent logging one lunch</p>
          </div>
        </div>
      );
    }
    case 1:
      return (
        <div className={center}>
          <div className="w-full max-w-[420px] rounded-[20px] bg-cream p-4 text-ink shadow-2xl">
            <div className="flex items-center gap-2 rounded-xl bg-paper px-3 py-2.5 text-[15px]">
              <Search className="size-4 text-ink-soft" />
              <span>{"chicken bowl".slice(0, Math.ceil(Math.min(1, p * 3) * 12))}</span>
              <span className="h-4 w-0.5 animate-[blink_1s_steps(1)_infinite] bg-ink" />
            </div>
            <ul className="mt-2 divide-y divide-ink/10">
              {SEARCH.map(([n, c], k) => (
                <li key={n} className="flex justify-between py-2.5 text-[14px] transition-opacity duration-500" style={{ opacity: p > 0.3 + k * 0.08 ? 1 : 0 }}>
                  <span>{n}</span><span className={cn("font-mono", k % 2 ? "text-tomato" : "text-ink-soft")}>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    case 2:
      return (
        <div className={center}>
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {Array.from({ length: 14 }).map((_, k) => {
              const logged = k < 6 || (k === 7 && p < 0.5);
              const show = p > k / 16;
              return (
                <div key={k} className={cn("grid size-10 place-items-center rounded-xl text-[13px] font-semibold transition-all duration-500 sm:size-14",
                  !show ? "opacity-0" : logged ? "bg-lime text-night" : "bg-white/[0.06] text-cream/30")}>{k + 1}</div>
              );
            })}
          </div>
        </div>
      );
    case 3:
      return (
        <div className={center}>
          <div className="relative grid size-40 place-items-center rounded-full border-4 border-cream/80 sm:size-52">
            <div className={cn("size-28 rounded-full bg-cream transition-transform duration-200 sm:size-40", p > 0.55 && p < 0.62 && "scale-90")} />
            <Camera className="absolute size-12 text-night" />
            {p > 0.58 && <div className="absolute inset-0 animate-ping rounded-full bg-white/30" />}
          </div>
        </div>
      );
    case 4:
      return (
        <div className={center}>
          <div className="relative aspect-square h-full max-h-[340px] overflow-hidden rounded-[22px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/examples/chicken-bowl.svg" alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-x-2 h-[3px] rounded-full bg-lime shadow-[0_0_24px_6px_rgb(200_255_61/0.55)]" style={{ top: `${8 + 84 * Math.abs(Math.sin(p * Math.PI * 1.5))}%` }} />
            {[["white rice", 30, 28], ["grilled chicken", 70, 30], ["avocado", 30, 72], ["broccoli", 72, 66], ["black beans", 50, 82]].map(([n, x, y], k) => (
              <span key={n as string} className="absolute -translate-x-1/2 rounded-full bg-cream px-2.5 py-1 text-[12px] font-medium text-ink shadow-lg transition-all duration-500"
                style={{ left: `${x}%`, top: `${y}%`, opacity: p > 0.25 + k * 0.1 ? 1 : 0, transform: `translate(-50%, ${p > 0.25 + k * 0.1 ? 0 : 8}px)` }}>
                <span className="mr-1 inline-block size-1.5 rounded-full bg-tomato align-middle" />{n}
              </span>
            ))}
          </div>
        </div>
      );
    case 5: {
      const e = 1 - Math.pow(1 - Math.min(1, p * 1.6), 3);
      return (
        <div className={center}>
          <div className="w-full max-w-[460px] rounded-[22px] bg-cream p-5 text-ink sm:p-7">
            <p className="label-mono text-ink-soft">example plate · chicken bowl</p>
            <p className="mt-1 font-serif text-[56px] font-semibold leading-none tabular-nums sm:text-[72px]">{Math.round(640 * e)}<span className="ml-2 text-[18px] font-normal text-ink-soft">cal</span></p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[["Protein", 42, "#E5482F"], ["Carbs", 68, "#D9A441"], ["Fat", 21, "#6B7B3A"]].map(([n, v, c]) => (
                <div key={n as string} className="rounded-xl p-3" style={{ background: (c as string) + "1f" }}>
                  <div className="text-[12px] text-ink-soft">{n}</div>
                  <div className="font-serif text-[26px] font-semibold tabular-nums" style={{ color: c as string }}>{Math.round((v as number) * e)}g</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case 6: {
      const n = Math.min(30, Math.round(p * 34));
      return (
        <div className={center}>
          <div className="text-center">
            <Flame className="mx-auto size-16 text-tomato" fill="#E5482F" />
            <div className="mt-2 font-serif text-[96px] font-semibold leading-none tabular-nums text-cream sm:text-[128px]">{n}</div>
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-lime">day streak</p>
          </div>
        </div>
      );
    }
    default:
      return (
        <div className={center}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-lime/30 blur-2xl animate-breathe" />
            <div className="relative grid size-32 place-items-center rounded-[34px] bg-tomato shadow-2xl sm:size-40">
              <Camera className="size-14 text-white" strokeWidth={1.6} />
            </div>
          </div>
        </div>
      );
  }
}
