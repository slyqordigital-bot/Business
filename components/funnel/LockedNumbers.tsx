"use client";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * The blurred part of a locked result. The real numbers never reach the browser:
 * these shapes only stand in for them behind the blur.
 */
export function LockedNumbers({ onUnlock, label = "See my full macros", className, dark }: { onUnlock: () => void; label?: string; className?: string; dark?: boolean }) {
  return (
    <button type="button" onClick={onUnlock} data-testid="locked-numbers"
      className={cn("group relative block w-full overflow-hidden rounded-[18px] text-left", dark ? "bg-white/5" : "bg-surface-2", className)}>
      <div aria-hidden className="pointer-events-none select-none p-5 blur-[9px]">
        <div className="flex items-end gap-2">
          <span className="font-serif text-[56px] font-semibold leading-none">6●●</span>
          <span className="pb-2 text-[15px] opacity-70">calories</span>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-3">
          {[["Protein", "#E5482F"], ["Carbs", "#D9A441"], ["Fat", "#6B7B3A"]].map(([n, c]) => (
            <div key={n} className="rounded-xl p-3" style={{ background: c + "22" }}>
              <div className="text-[12px] opacity-70">{n}</div>
              <div className="font-serif text-[26px] font-semibold" style={{ color: c }}>●●g</div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          {[78, 64, 52].map((w) => <div key={w} className="h-3.5 rounded-full bg-current opacity-20" style={{ width: `${w}%` }} />)}
        </div>
      </div>
      <div className={cn("absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b", dark ? "from-night/10 via-night/40 to-night/70" : "from-transparent via-bg/30 to-bg/70")}>
        <span className="grid size-11 place-items-center rounded-full bg-ink text-cream shadow-lg transition group-hover:scale-105"><Lock className="size-5" /></span>
        <span className={cn("text-[14px] font-semibold", dark ? "text-cream" : "text-fg")}>{label}</span>
      </div>
    </button>
  );
}
