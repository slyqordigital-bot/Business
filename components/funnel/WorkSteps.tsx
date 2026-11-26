"use client";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  "Finding every food on the plate",
  "Estimating portion sizes",
  "Matching nutrition data",
  "Adding up protein, carbs and fat",
  "Checking your totals",
];

/**
 * The work being done: 5 named steps tick one by one, a percentage counts up smoothly
 * and holds at 99 % until `done`. Calls onFinished once both the work and the minimum time are over.
 */
export function WorkSteps({ done, minMs = 3200, onFinished, dark }: { done: boolean; minMs?: number; onFinished: () => void; dark?: boolean }) {
  const reduce = useReducedMotion();
  const [pct, setPct] = useState(0);
  const start = useRef(performance.now());
  const finished = useRef(false);

  useEffect(() => {
    let raf = 0;
    const tick = (t: number) => {
      const el = t - start.current;
      const p = done && el >= minMs ? 100 : Math.min(99, 99 * (1 - Math.exp(-el / (minMs * 0.55))));
      setPct((prev) => Math.max(prev, p));
      if (p >= 100) {
        if (!finished.current) { finished.current = true; setTimeout(onFinished, 450); }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, minMs, onFinished]);

  const active = Math.min(STEPS.length - 1, Math.floor((pct / 100) * STEPS.length));
  const r = 30, c = 2 * Math.PI * r;

  return (
    <div className={cn("w-full", dark ? "text-cream" : "text-fg")} aria-live="polite">
      <div className="mb-5 flex items-center gap-4">
        <div className="relative size-[72px] shrink-0">
          <svg viewBox="0 0 72 72" className="-rotate-90">
            <circle cx="36" cy="36" r={r} strokeWidth="6" fill="none" className={dark ? "stroke-white/10" : "stroke-fg/10"} />
            <circle cx="36" cy="36" r={r} strokeWidth="6" fill="none" stroke="#C8FF3D" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
          </svg>
          <span className="absolute inset-0 grid place-items-center font-mono text-[15px] font-medium tabular-nums">{Math.floor(pct)}%</span>
        </div>
        <div>
          <p className="font-serif text-[22px] font-semibold leading-tight tracking-[-0.02em]">{pct >= 100 ? "Your plate's macros are ready." : "Reading your plate…"}</p>
          <p className={cn("mt-1 text-[14px]", dark ? "text-cream/60" : "text-fg-soft")}>{pct >= 100 ? "Here's what we found." : "This takes a few seconds."}</p>
        </div>
      </div>
      <ul className="space-y-2.5">
        {STEPS.map((s, i) => {
          const isDone = pct >= 100 || i < active;
          const isActive = i === active && pct < 100;
          return (
            <motion.li key={s} initial={reduce ? false : { opacity: 0, x: -6 }} animate={{ opacity: i <= active || pct >= 100 ? 1 : 0.35, x: 0 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 text-[15px]">
              <span className={cn("grid size-6 shrink-0 place-items-center rounded-full transition-colors duration-300",
                isDone ? "bg-lime text-night" : dark ? "bg-white/10" : "bg-fg/10")}>
                {isDone ? <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 20 }}><Check className="size-3.5" strokeWidth={3} /></motion.span>
                  : isActive ? <Loader2 className="size-3.5 animate-spin" /> : null}
              </span>
              {s}
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
