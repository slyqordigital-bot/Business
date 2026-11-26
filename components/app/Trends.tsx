"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type DayPoint = { day: string; kcal: number; protein: number };

/** Daily calories (bars) against the goal line, last 7 or 30 days. */
export function Trends({ days, goal }: { days: DayPoint[]; goal: number }) {
  const [range, setRange] = useState<7 | 30>(7);
  const data = days.slice(-range);
  const max = Math.max(goal * 1.25, ...data.map((d) => d.kcal), 1);
  const logged = data.filter((d) => d.kcal > 0);
  const avg = logged.length ? Math.round(logged.reduce((a, d) => a + d.kcal, 0) / logged.length) : 0;
  const avgP = logged.length ? Math.round(logged.reduce((a, d) => a + d.protein, 0) / logged.length) : 0;
  return (
    <div className="recipe-card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[13px] text-fg-soft">Average on days you logged</p>
          <p className="font-serif text-[28px] font-semibold tabular-nums">{avg} cal <span className="text-[16px] font-normal text-fg-soft">· {avgP} g protein</span></p>
        </div>
        <div className="flex rounded-full bg-surface-2 p-1 text-[13px]">
          {([7, 30] as const).map((r) => <button key={r} onClick={() => setRange(r)} className={cn("rounded-full px-3 py-1", range === r ? "bg-surface shadow-sm" : "text-fg-soft")}>{r} days</button>)}
        </div>
      </div>
      <div className="relative mt-5 flex h-40 items-end gap-[3px]">
        <div className="absolute inset-x-0 border-t border-dashed border-tomato/60" style={{ bottom: `${(goal / max) * 100}%` }}><span className="absolute -top-5 right-0 text-[11px] text-tomato">goal {goal}</span></div>
        {data.map((d) => (
          <div key={d.day} className="group relative flex-1" style={{ height: "100%" }} title={`${d.day}: ${d.kcal} cal`}>
            <div className={cn("absolute inset-x-0 bottom-0 rounded-t-[5px] transition-all", d.kcal > goal * 1.1 ? "bg-tomato" : "bg-olive")} style={{ height: `${(d.kcal / max) * 100}%`, minHeight: d.kcal ? 3 : 0 }} />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-fg-soft"><span>{data[0]?.day.slice(5)}</span><span>today</span></div>
    </div>
  );
}
