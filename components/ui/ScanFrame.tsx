"use client";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type Pin = { name: string; x: number; y: number };

/** Keeps labels inside the frame and pushes overlapping ones apart (top to bottom). */
function layout(pins: Pin[]) {
  const placed: { name: string; x: number; y: number }[] = [];
  const sorted = pins.map((p) => ({ ...p, x: Math.min(0.8, Math.max(0.2, p.x)), y: Math.min(0.88, Math.max(0.12, p.y)) })).sort((a, b) => a.y - b.y);
  for (const p of sorted) {
    let y = p.y;
    for (let guard = 0; guard < 12; guard++) {
      const hit = placed.find((q) => Math.abs(q.x - p.x) < 0.34 && Math.abs(q.y - y) < 0.085);
      if (!hit) break;
      y = hit.y + 0.09;
    }
    if (y > 0.9) y = 0.9 - 0.09 * placed.filter((q) => q.y > 0.8).length;
    placed.push({ name: p.name, x: p.x, y });
  }
  return placed;
}

/** The signature scan frame: corner brackets, a lime scan line, scan points and pinned food labels. */
export function ScanFrame({ src, scanning, pins = [], className, alt = "Your meal" }: { src: string; scanning?: boolean; pins?: Pin[]; className?: string; alt?: string }) {
  const reduce = useReducedMotion();
  return (
    <div className={cn("relative overflow-hidden rounded-[20px] bg-night", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-3">
        {["left-0 top-0 border-l-[3px] border-t-[3px] rounded-tl-xl", "right-0 top-0 border-r-[3px] border-t-[3px] rounded-tr-xl", "left-0 bottom-0 border-l-[3px] border-b-[3px] rounded-bl-xl", "right-0 bottom-0 border-r-[3px] border-b-[3px] rounded-br-xl"].map((c) => (
          <span key={c} className={cn("absolute size-8 border-lime", c)} />
        ))}
      </div>
      {scanning && (
        <>
          <div className="absolute inset-0 bg-night/25" />
          <div className="animate-scanline pointer-events-none absolute inset-x-3 h-[3px] rounded-full bg-lime shadow-[0_0_24px_6px_rgb(200_255_61/0.55)]" />
          {!reduce && [[22, 30], [64, 24], [40, 58], [72, 66], [30, 78], [55, 42]].map(([x, y], i) => (
            <motion.span key={i} className="absolute size-2 rounded-full bg-lime" style={{ left: `${x}%`, top: `${y}%` }}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.7] }}
              transition={{ delay: 0.4 + i * 0.35, duration: 0.6, repeat: Infinity, repeatDelay: 2.2 }} />
          ))}
        </>
      )}
      <AnimatePresence>
        {layout(pins).map((p, i) => (
          <motion.span key={p.name + i}
            initial={reduce ? false : { opacity: 0, y: 6, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.15 * i, type: "spring", stiffness: 400, damping: 26 }}
            className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-cream/95 py-1 pl-1.5 pr-2.5 text-[12px] font-medium text-ink shadow-lg"
            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}>
            <span className="mr-1.5 inline-block size-2 rounded-full bg-tomato align-middle" />{p.name}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
