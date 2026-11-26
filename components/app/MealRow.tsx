import Link from "next/link";
import { ChevronRight, Lock } from "lucide-react";
import type { MealView } from "@/lib/meals";

export function MealRow({ m }: { m: MealView }) {
  return (
    <Link href={`/meal/${m.id}`} className="flex items-center gap-3 rounded-[18px] bg-surface p-2.5 pr-4 ring-1 ring-line transition hover:ring-fg/20 active:scale-[0.99]">
      {m.photoUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={m.photoUrl} alt="" className="size-16 shrink-0 rounded-[14px] object-cover" loading="lazy" />
        : <div className="size-16 shrink-0 rounded-[14px] bg-surface-2" />}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[16px] font-semibold first-letter:uppercase">{m.name}</p>
        <p className="text-[13px] text-fg-soft">
          {new Date(m.eatenAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          {m.totals && <span className="tabular-nums"> · P {Math.round(m.totals.protein)} · C {Math.round(m.totals.carbs)} · F {Math.round(m.totals.fat)}</span>}
        </p>
      </div>
      {m.totals ? <span className="font-mono text-[15px] font-medium tabular-nums">{m.totals.kcal}<span className="text-fg-soft"> cal</span></span>
        : <span className="flex items-center gap-1 text-[13px] text-fg-soft"><Lock className="size-3.5" />Locked</span>}
      <ChevronRight className="size-4 text-fg-soft" />
    </Link>
  );
}
