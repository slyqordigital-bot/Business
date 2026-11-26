"use client";
import { MacroRing, MACRO_COLORS } from "@/components/ui/MacroRing";
import { CountUp } from "@/components/ui/CountUp";
import type { Totals } from "@/lib/meals";

export function DayRings({ t, goals }: { t: Totals; goals: Totals }) {
  const left = Math.max(0, goals.kcal - t.kcal);
  return (
    <div className="recipe-card flex flex-col items-center gap-6 p-5 sm:flex-row sm:p-7">
      <MacroRing value={t.kcal} goal={goals.kcal} color={MACRO_COLORS.kcal} size={164} stroke={14}>
        <div>
          <div className="font-serif text-[40px] font-semibold leading-none tracking-[-0.03em]"><CountUp to={Math.round(t.kcal)} /></div>
          <div className="mt-1 text-[12px] text-fg-soft">of {goals.kcal} cal</div>
        </div>
      </MacroRing>
      <div className="w-full flex-1">
        <p className="text-[14px] text-fg-soft"><b className="text-fg">{left}</b> calories left today</p>
        <div className="mt-4 space-y-3.5">
          {([["Protein", t.protein, goals.protein, MACRO_COLORS.protein], ["Carbs", t.carbs, goals.carbs, MACRO_COLORS.carbs], ["Fat", t.fat, goals.fat, MACRO_COLORS.fat]] as const).map(([l, v, g, c]) => (
            <div key={l}>
              <div className="flex justify-between text-[14px]"><span className="font-medium">{l}</span><span className="tabular-nums text-fg-soft">{Math.round(v)} / {g} g</span></div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-fg/[0.07]"><div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${Math.min(100, (100 * v) / Math.max(1, g))}%`, background: c }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
