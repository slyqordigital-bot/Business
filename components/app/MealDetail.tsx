"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock, Pencil, Share2, Sparkles, Trash2, X } from "lucide-react";
import { ScanFrame } from "@/components/ui/ScanFrame";
import { MacroRing, MACRO_COLORS } from "@/components/ui/MacroRing";
import { CountUp } from "@/components/ui/CountUp";
import { LockedNumbers } from "@/components/funnel/LockedNumbers";
import { useFunnel } from "@/components/funnel/Funnel";
import { usePlans } from "@/components/funnel/Paywall";
import type { MealView } from "@/lib/meals";
import { cn } from "@/lib/utils";

export function MealDetail({ meal, shareUrl }: { meal: MealView; level?: number; shareUrl: string | null }) {
  const router = useRouter();
  const sp = useSearchParams();
  const funnel = useFunnel();
  const reduce = useReducedMotion();
  const { plans } = usePlans();
  const featured = plans?.find((p) => p.featured);
  const [editing, setEditing] = useState<number | null>(null);
  const [grams, setGrams] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [copied, setCopied] = useState(false);
  const celebrate = sp.get("celebrate") === "1";

  const n = meal.items.length;
  const openPaywall = () => funnel.openPaywall({ title: "Your plate's macros are ready.", line: `${n} food${n === 1 ? "" : "s"} found in your ${meal.name.toLowerCase()}. Unlock the numbers and log it in one tap.` });

  useEffect(() => {
    if (meal.locked && sp.get("paywall") === "1") openPaywall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function patch(body: Record<string, unknown>) {
    setBusy(true); setErr(null);
    const r = await fetch(`/api/meals/${meal.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    setBusy(false);
    if (!r?.ok) { setErr("Couldn't save. Try again."); return false; }
    router.refresh();
    return true;
  }
  async function del() {
    setBusy(true);
    const r = await fetch(`/api/meals/${meal.id}`, { method: "DELETE" }).catch(() => null);
    if (r?.ok) { router.replace("/today"); router.refresh(); } else { setBusy(false); setErr("Couldn't delete. Try again."); }
  }
  async function share() {
    if (!shareUrl) return;
    const data = { title: `My ${meal.name} macros`, text: meal.totals ? `${meal.totals.kcal} cal · ${meal.totals.protein}g protein, from one photo with MacroSnap` : "Macros from one photo", url: shareUrl };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {}
  }

  const t = meal.totals;
  return (
    <div className="mx-auto max-w-[1040px] px-4 pb-10 md:px-10">
      <div className="grid gap-6 md:grid-cols-[1fr_1.05fr] md:gap-10">
        <div>
          {meal.photoUrl ? <ScanFrame src={meal.photoUrl} pins={meal.items.slice(0, 6)} className="aspect-square" alt={meal.name} />
            : <div className="grid aspect-square place-items-center rounded-[20px] bg-surface-2 text-fg-soft">No photo</div>}
          {meal.insight && <p className="mt-3 rounded-[14px] border border-olive/20 bg-olive/[0.07] p-3 text-[14px]"><Sparkles className="mr-1.5 inline size-4 text-olive" />{meal.insight}</p>}
        </div>

        <div>
          <p className="label-mono text-olive">[ {new Date(meal.eatenAt).toLocaleString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" })} ]</p>
          <h1 className="mt-2 font-serif text-[32px] font-semibold leading-tight tracking-[-0.03em] first-letter:uppercase md:text-[40px]">{meal.name}</h1>

          {meal.locked || !t ? (
            <>
              <ul className="mt-3 flex flex-wrap gap-1.5">{meal.items.map((i, k) => <li key={k} className="rounded-full bg-surface-2 px-2.5 py-1 text-[13px] font-medium">{i.name}</li>)}</ul>
              <LockedNumbers className="mt-5" onUnlock={openPaywall} />
              <button onClick={openPaywall} data-testid="meal-unlock" className="mt-4 h-[56px] w-full rounded-full bg-tomato text-[17px] font-semibold text-white transition active:scale-[0.97]">See my full macros</button>
            </>
          ) : (
            <motion.div initial={celebrate && !reduce ? { filter: "blur(14px)", opacity: 0.4 } : false} animate={{ filter: "blur(0px)", opacity: 1 }} transition={{ duration: 0.9, ease: [0.22, 0.8, 0.24, 1] }}>
              <div className="mt-4 flex items-end gap-2">
                <span className="font-serif text-[64px] font-semibold leading-none tracking-[-0.04em]" data-testid="kcal"><CountUp to={t.kcal} /></span>
                <span className="pb-2 text-[16px] text-fg-soft">calories</span>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                {([["Protein", t.protein, MACRO_COLORS.protein], ["Carbs", t.carbs, MACRO_COLORS.carbs], ["Fat", t.fat, MACRO_COLORS.fat]] as const).map(([l, v, c]) => {
                  const kcal = l === "Fat" ? v * 9 : v * 4;
                  return (
                    <div key={l} className="flex flex-col items-center rounded-[18px] bg-surface p-3 ring-1 ring-line">
                      <MacroRing value={kcal} goal={Math.max(1, t.kcal)} color={c} size={76} stroke={8}>
                        <span className="font-serif text-[18px] font-semibold"><CountUp to={v} />g</span>
                      </MacroRing>
                      <span className="mt-1.5 text-[13px] text-fg-soft">{l}</span>
                    </div>
                  );
                })}
              </div>

              <h2 className="mt-7 text-[15px] font-semibold">Each food</h2>
              {meal.itemsLocked ? (
                <button onClick={() => funnel.openUpgrade({ level: 1, reason: "See what each food adds to your plate." })} className="relative mt-2 block w-full overflow-hidden rounded-[16px] bg-surface ring-1 ring-line">
                  <ul aria-hidden className="divide-y divide-line blur-[6px]">{meal.items.map((i, k) => <li key={k} className="flex justify-between px-4 py-3 text-[14px]"><span>{i.name}</span><span>●●● cal</span></li>)}</ul>
                  <span className="absolute inset-0 flex items-center justify-center gap-2 bg-bg/40 text-[14px] font-semibold"><Lock className="size-4" />Unlock with Plate</span>
                </button>
              ) : (
                <ul className="mt-2 divide-y divide-line rounded-[16px] bg-surface ring-1 ring-line">
                  {meal.items.map((i, k) => (
                    <li key={k} className="px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-medium first-letter:uppercase">{i.name}</p>
                          <p className="text-[12px] text-fg-soft tabular-nums">{i.grams} g · P {i.protein} · C {i.carbs} · F {i.fat}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="mr-1 font-mono text-[14px] tabular-nums">{i.kcal} cal</span>
                          <button aria-label={`Edit ${i.name}`} onClick={() => { setEditing(k); setGrams(String(i.grams ?? "")); }} className="grid size-8 place-items-center rounded-full text-fg-soft hover:bg-fg/5"><Pencil className="size-4" /></button>
                          {n > 1 && <button aria-label={`Remove ${i.name}`} disabled={busy} onClick={() => patch({ removeItem: k })} className="grid size-8 place-items-center rounded-full text-fg-soft hover:bg-fg/5"><X className="size-4" /></button>}
                        </div>
                      </div>
                      {editing === k && (
                        <form className="mt-2 flex items-center gap-2" onSubmit={async (e) => { e.preventDefault(); const g = Number(grams); if (g > 0 && g < 3000 && (await patch({ portion: { index: k, grams: g } }))) setEditing(null); }}>
                          <label className="text-[13px] text-fg-soft" htmlFor={`g${k}`}>Portion</label>
                          <input id={`g${k}`} inputMode="numeric" value={grams} onChange={(e) => setGrams(e.target.value.replace(/[^0-9]/g, ""))} className="h-10 w-24 rounded-[12px] border border-line bg-bg px-3 text-[15px] tabular-nums" />
                          <span className="text-[13px] text-fg-soft">g</span>
                          <button disabled={busy} className="ml-auto grid size-10 place-items-center rounded-full bg-fg text-bg"><Check className="size-4" /></button>
                        </form>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {meal.confidence === "low" && <p className="mt-3 text-[13px] text-fg-soft">This photo was hard to read. Check the portions above.</p>}
              <p className="mt-3 text-[12px] text-fg-soft">AI estimates from a photo, usually within 10–20%. Not medical advice.</p>

              <div className="mt-6 flex gap-2">
                <button onClick={share} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-fg text-[15px] font-semibold text-bg active:scale-[0.98]"><Share2 className="size-4" />{copied ? "Link copied" : "Share"}</button>
                {confirmDel ? (
                  <button onClick={del} disabled={busy} className="h-12 rounded-full bg-tomato px-5 text-[15px] font-semibold text-white">Delete for good</button>
                ) : (
                  <button onClick={() => setConfirmDel(true)} aria-label="Delete meal" className="grid size-12 place-items-center rounded-full ring-1 ring-line hover:bg-fg/5"><Trash2 className="size-4" /></button>
                )}
              </div>
              {err && <p className="mt-3 text-[13px] text-tomato" role="alert">{err}</p>}
            </motion.div>
          )}
        </div>
      </div>

      {meal.locked && (
        <button onClick={openPaywall} className={cn("fixed inset-x-3 bottom-[calc(84px+env(safe-area-inset-bottom))] z-20 flex h-14 items-center justify-between rounded-full bg-tomato px-6 text-[16px] font-semibold text-white shadow-xl md:bottom-6 md:left-auto md:right-8 md:w-[400px]")}>
          See my full macros <span className="font-normal opacity-90">{featured ? `${featured.per_day} / day` : ""}</span>
        </button>
      )}
    </div>
  );
}
