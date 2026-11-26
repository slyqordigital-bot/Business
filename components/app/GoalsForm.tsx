"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import type { Totals } from "@/lib/meals";

const PRESETS: { label: string; f: (k: number) => Totals }[] = [
  { label: "Balanced", f: (k) => ({ kcal: k, protein: Math.round((k * 0.25) / 4), carbs: Math.round((k * 0.45) / 4), fat: Math.round((k * 0.3) / 9) }) },
  { label: "High protein", f: (k) => ({ kcal: k, protein: Math.round((k * 0.35) / 4), carbs: Math.round((k * 0.35) / 4), fat: Math.round((k * 0.3) / 9) }) },
  { label: "Low carb", f: (k) => ({ kcal: k, protein: Math.round((k * 0.3) / 4), carbs: Math.round((k * 0.15) / 4), fat: Math.round((k * 0.55) / 9) }) },
];

export function GoalsForm({ initial }: { initial: Totals }) {
  const router = useRouter();
  const [g, setG] = useState(initial);
  const [state, setState] = useState<"idle" | "busy" | "saved" | "error">("idle");
  const set = (k: keyof Totals, v: string) => { setState("idle"); setG({ ...g, [k]: Number(v.replace(/[^0-9]/g, "")) || 0 }); };
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setState("busy");
    const r = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ goals: g }) }).catch(() => null);
    setState(r?.ok ? "saved" : "error");
    if (r?.ok) router.refresh();
  }
  return (
    <form onSubmit={save} className="space-y-5">
      <div className="recipe-card p-5">
        <p className="text-[14px] font-semibold">Quick start</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => <button type="button" key={p.label} onClick={() => { setG(p.f(g.kcal || 2000)); setState("idle"); }} className="rounded-full bg-surface-2 px-3.5 py-2 text-[14px] font-medium hover:bg-fg/10">{p.label}</button>)}
        </div>
      </div>
      <div className="recipe-card divide-y divide-line">
        {([["kcal", "Calories", "cal"], ["protein", "Protein", "g"], ["carbs", "Carbs", "g"], ["fat", "Fat", "g"]] as const).map(([k, l, u]) => (
          <label key={k} className="flex items-center justify-between gap-4 px-5 py-4">
            <span className="text-[16px] font-medium">{l}</span>
            <span className="flex items-center gap-2"><input inputMode="numeric" value={g[k] || ""} onChange={(e) => set(k, e.target.value)} className="h-11 w-28 rounded-[12px] border border-line bg-bg px-3 text-right text-[16px] tabular-nums" /><span className="w-6 text-[14px] text-fg-soft">{u}</span></span>
          </label>
        ))}
      </div>
      {state === "error" && <p className="text-[14px] text-tomato">Calories must be between 800 and 8000. Check the numbers and try again.</p>}
      <button disabled={state === "busy"} className="flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-tomato font-semibold text-white disabled:opacity-70">
        {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : state === "saved" ? <Check className="size-4" /> : null}{state === "saved" ? "Saved" : "Save my goals"}
      </button>
      <p className="text-[13px] text-fg-soft">Not sure? Most adults land between 1,600 and 2,600 calories. A registered dietitian can set goals for you.</p>
    </form>
  );
}
