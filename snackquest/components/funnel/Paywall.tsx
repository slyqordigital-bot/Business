"use client";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Lock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TAGS, UNLOCKS, shortName } from "@/lib/plans";
import { cn } from "@/lib/utils";

export type ClientPlan = {
  id: number;
  name: string;
  price_cents: number;
  per_day: string;
  yearly: { price_cents: number; per_day: string } | null;
  level: 1 | 2 | 3;
  featured: boolean;
};

export type Period = "month" | "year";

const money = (c: number) => `$${(c / 100).toFixed(2)}`;

const FAQ = [
  { q: "Will it work with my games?", a: "Yes. Quests work with any game on any platform: you prove them with one photo of your snack and screen. Your playtime counts with the session timer on PC, console or mobile." },
  { q: "Can I cancel anytime?", a: "Yes. Account → Billing → Cancel my subscription. Two taps, no email, no call. You keep your plan until the end of the period you paid for." },
  { q: "What happens right after I pay?", a: "Your whole quest run unlocks right here, with your 30-day projection. Clear your first quest tonight and the points land in your balance right away." },
];

let plansCache: ClientPlan[] | null = null;
let plansReq: Promise<ClientPlan[]> | null = null;

/** Loads the plans once per page (call it early, e.g. while the result is being made). */
export function prefetchPlans() {
  if (!plansReq) {
    plansReq = fetch("/api/plans").then((r) => r.json()).then((j) => (plansCache = (j.plans || []) as ClientPlan[]));
    plansReq.catch(() => { plansReq = null; });
  }
  return plansReq;
}

export function usePlans() {
  const [plans, setPlans] = useState<ClientPlan[] | null>(plansCache);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (plansCache) { setPlans(plansCache); return; }
    let alive = true;
    prefetchPlans().then((p) => alive && setPlans(p)).catch(() => alive && setError(true));
    return () => { alive = false; };
  }, []);
  return { plans, error };
}

function PlanRows({ plans, selected, setSelected, period, idPrefix }: { plans: ClientPlan[]; selected: number | null; setSelected: (id: number) => void; period: Period; idPrefix: string }) {
  return (
    <div role="radiogroup" aria-label="Plans" className="space-y-3">
      {plans.map((p) => {
        const on = p.id === selected;
        const yearly = period === "year" && p.yearly;
        return (
          <button key={p.id} type="button" role="radio" aria-checked={on} onClick={() => setSelected(p.id)} data-testid={`${idPrefix}-plan-${p.level}`}
            className={cn("relative flex w-full items-center gap-3.5 rounded-[18px] border-2 bg-surface px-4 py-4 text-left transition active:scale-[0.99]",
              on ? "border-lime shadow-[0_8px_30px_-12px_rgb(200_255_61/0.35)]" : "border-line hover:border-fg/20")}>
            {p.featured && <span className="absolute -top-2.5 left-4 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-void">Most popular</span>}
            <span className={cn("grid size-[22px] shrink-0 place-items-center rounded-full border-2 transition", on ? "border-lime bg-lime" : "border-fg/25")}>
              {on && <span className="size-2 rounded-full bg-void" />}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-semibold leading-tight">{shortName(p.name)}</span>
              <span className="block text-[13px] text-fg-soft">{yearly ? `${money(p.yearly!.price_cents)} / year` : `${money(p.price_cents)} / month`}</span>
              <span className="mt-0.5 block text-[13px] text-fg-soft">{TAGS[p.level]}</span>
            </span>
            <span className="text-right">
              <span className="block font-display text-[30px] font-bold leading-none tracking-[-0.01em] tabular">{yearly ? p.yearly!.per_day : p.per_day}</span>
              <span className="text-[12px] text-fg-soft">/ day</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** The paywall content (lives in a sheet over the result, and at /pricing). */
export function Paywall({ title, line, onContinue, busy, notice, currentLevel = 0 }: {
  title: string;
  line?: string;
  onContinue: (plan: ClientPlan, period: Period) => void;
  busy?: boolean;
  notice?: string | null;
  currentLevel?: number;
}) {
  const { plans: all, error } = usePlans();
  const plans = all?.filter((p) => p.level > currentLevel) ?? null;
  const [period, setPeriod] = useState<Period>("month");
  const [selected, setSelected] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const btnRef = useRef<HTMLDivElement>(null);
  const [btnVisible, setBtnVisible] = useState(true);

  useEffect(() => {
    if (plans && selected === null && plans.length) setSelected((plans.find((p) => p.featured) ?? plans[0]).id);
  }, [plans, selected]);

  useEffect(() => {
    const el = btnRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setBtnVisible(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, [plans]);

  const plan = plans?.find((p) => p.id === selected) ?? null;
  const hasYearly = plans?.some((p) => p.yearly);
  const due = plan ? (period === "year" && plan.yearly ? plan.yearly.price_cents : plan.price_cents) : 0;

  const ContinueBtn = ({ floating }: { floating?: boolean }) => (
    <button type="button" disabled={!plan || busy} onClick={() => plan && onContinue(plan, period)} data-testid={floating ? undefined : "paywall-continue"}
      className={cn("flex h-[58px] w-full items-center justify-center rounded-full bg-lime text-[17px] font-semibold text-void transition active:scale-[0.97] disabled:opacity-60",
        floating && "shadow-[0_10px_30px_-8px_rgb(200_255_61/0.5)]")}>
      {plan ? `Continue with ${shortName(plan.name)}` : "Continue"}
    </button>
  );

  return (
    <div className="relative">
      <div className="px-5 pb-8 pt-16 md:px-7">
        <h2 className="font-display text-[32px] font-bold uppercase leading-[1] tracking-[-0.01em]" data-testid="paywall-title">{title}</h2>
        {line && <p className="mt-2 text-[15px] text-fg-soft">{line}</p>}

        <div className="mt-8 flex items-center justify-between">
          <p className="text-[17px] font-semibold">Choose your plan.</p>
          {hasYearly && (
            <div className="flex rounded-full bg-surface-2 p-1 text-[13px] font-medium" role="tablist">
              {(["month", "year"] as const).map((p) => (
                <button key={p} role="tab" aria-selected={period === p} onClick={() => setPeriod(p)}
                  className={cn("rounded-full px-3 py-1.5 transition", period === p ? "bg-lime text-void shadow-sm" : "text-fg-soft")}>
                  {p === "month" ? "Monthly" : <>Yearly <span className={period === p ? "" : "text-lime"}>−20%</span></>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4">
          {!plans && !error && <div className="space-y-3">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-[92px]" />)}</div>}
          {error && <p className="rounded-xl bg-surface-2 p-4 text-[14px]">We couldn&apos;t load the plans. Check your connection and try again.</p>}
          {plans && plans.length === 0 && <p className="rounded-xl bg-surface-2 p-4 text-[14px]">You&apos;re already on our biggest plan.</p>}
          {plans && plans.length > 0 && <PlanRows plans={plans} selected={selected} setSelected={setSelected} period={period} idPrefix="top" />}
        </div>

        {notice && <p className="mt-4 rounded-xl bg-lime/15 text-lime p-3 text-[14px] font-medium" role="status">{notice}</p>}

        <div ref={btnRef} className="mt-5">
          <ContinueBtn />
          {plan && <p className="mt-2.5 text-center text-[13px] text-fg-soft">{money(due)} due today, then every {period === "year" ? "year" : "month"} · Cancel anytime</p>}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[12px] text-fg-soft">
          <Lock className="size-3.5" /> Secure payment, processed by Whop
          <span className="rounded-md border border-line px-1.5 py-0.5 font-medium">Whop</span>
          <span className="rounded-md border border-line px-1.5 py-0.5 font-medium">Card</span>
        </div>

        {plan && (
          <div className="mt-8 rounded-[20px] bg-surface-2 p-5">
            <p className="text-[15px] font-semibold">What you unlock with {shortName(plan.name)}</p>
            <ul className="mt-3 space-y-2.5">
              {UNLOCKS[plan.level].map((u) => (
                <li key={u} className="flex gap-2.5 text-[15px]"><Check className="mt-0.5 size-[18px] shrink-0 text-lime" strokeWidth={2.5} />{u}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex items-start gap-3 rounded-[18px] border border-line p-4 text-[14px]">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-lime" />
          <p><span className="font-semibold">Cancel in 2 taps.</span> No call, no email. You keep your plan until the end of the period you paid for.</p>
        </div>

        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map((f, i) => (
            <div key={f.q}>
              <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between py-4 text-left text-[15px] font-medium">
                {f.q}<ChevronDown className={cn("size-4 transition", open === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-4 text-[14px] text-fg-soft">{f.a}</motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {plans && plans.length > 1 && (
          <div className="mt-10">
            <p className="mb-3 text-[17px] font-semibold">Pick up where you left off</p>
            <PlanRows plans={plans} selected={selected} setSelected={setSelected} period={period} idPrefix="bottom" />
          </div>
        )}

        <p className="mt-6 text-center text-[12px] leading-relaxed text-fg-soft">Renews automatically until canceled. Prices in USD. Rewards are redeemed with points, never with cash.</p>
      </div>

      <AnimatePresence>
        {!btnVisible && plan && (
          <motion.div initial={{ y: 80 }} animate={{ y: 0 }} exit={{ y: 80 }} transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="sticky bottom-0 z-10 bg-gradient-to-t from-bg via-bg/95 to-transparent px-5 pb-[max(16px,env(safe-area-inset-bottom))] pt-6 md:px-7">
            <ContinueBtn floating />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
