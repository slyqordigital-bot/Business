"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Flame, PieChart, X } from "lucide-react";

/** After paying: 3 short scenes in ~5 s, skippable. */
export function UnlockFilm({ planName, onDone }: { planName: string; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const t = [setTimeout(() => setScene(1), 1700), setTimeout(() => setScene(2), 3600), setTimeout(onDone, 5200)];
    return () => t.forEach(clearTimeout);
  }, [onDone]);
  const anim = reduce ? {} : { initial: { opacity: 0, y: 16, scale: 0.98 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -16 } };
  return (
    <motion.div className="fixed inset-0 z-[90] grid place-items-center overflow-hidden bg-night text-cream" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} data-testid="unlock-film">
      <div className="dot-grid absolute inset-0 opacity-60" />
      <div className="absolute left-1/2 top-0 h-[60vh] w-[80vw] -translate-x-1/2 rounded-full bg-lime/20 blur-[120px]" />
      <button onClick={onDone} aria-label="Skip" className="absolute left-4 top-4 grid size-10 place-items-center rounded-full hover:bg-white/10"><X className="size-5" /></button>
      <AnimatePresence mode="wait">
        {scene === 0 && (
          <motion.div key="a" {...anim} transition={{ duration: 0.5 }} className="relative text-center">
            <p className="label-mono text-lime">[ unlocked ]</p>
            <h2 className="title-xl mt-4 text-[48px] md:text-[72px]">You&apos;re on {planName}</h2>
          </motion.div>
        )}
        {scene === 1 && (
          <motion.div key="b" {...anim} transition={{ duration: 0.5 }} className="relative flex gap-6 md:gap-12">
            {[[Camera, "Photo scans"], [PieChart, "Full breakdown"], [Flame, "Daily streaks"]].map(([I, l], i) => {
              const Icon = I as typeof Camera;
              return (
                <motion.div key={l as string} initial={reduce ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.15, type: "spring", stiffness: 300, damping: 22 }} className="flex flex-col items-center gap-3">
                  <span className="grid size-[72px] place-items-center rounded-[22px] bg-lime text-night md:size-24"><Icon className="size-8 md:size-10" /></span>
                  <span className="text-[14px] font-medium">{l as string}</span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
        {scene === 2 && (
          <motion.div key="c" {...anim} transition={{ duration: 0.5 }} className="relative text-center">
            <h2 className="title-xl text-[56px] md:text-[88px]">Let&apos;s log it.</h2>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
