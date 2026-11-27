"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Package, Truck, X, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Sheet } from "@/components/ui/Sheet";
import { RewardIcon } from "./RewardIcon";
import { cn } from "@/lib/utils";

type Reward = { id: number; name: string; kind: string; blurb: string; cost: number; icon: string };
type Red = { id: string; reward_name: string; cost: number; status: string; tracking: string | null; created_at: string };

const STEPS = ["requested", "processing", "shipped", "delivered"];
const LABEL: Record<string, string> = { requested: "Requested", processing: "Processing", shipped: "On the way", delivered: "Delivered", canceled: "Canceled" };

export function RewardsClient({ balance, rewards, redemptions, priority, goal }: { balance: number; rewards: Reward[]; redemptions: Red[]; priority: boolean; goal: string | null }) {
  const router = useRouter();
  const [pick, setPick] = useState<Reward | null>(null);
  const goalKey = (goal || "").toLowerCase().replace("game gift card", "steam");
  return (
    <div className="mx-auto max-w-[1040px] px-4 pb-12 md:px-10">
      <div className="hud hud-corners flex flex-wrap items-center gap-4 p-5">
        <div><p className="label-mono text-fg-soft">[ your balance ]</p><p className="mt-1 font-display text-[48px] font-bold leading-none text-lime tabular">{balance.toLocaleString("en-US")} <span className="text-[18px] text-fg-soft">pts</span></p></div>
        <p className="text-[13px] text-fg-soft md:ml-auto md:max-w-[340px]">Gift cards arrive by email as a code. Gear ships to US addresses. Every reward is sent by the SnackQuest team, usually within 7 business days{priority ? "; Legend rewards go first in line" : ""}.</p>
      </div>

      {rewards.length === 0 ? (
        <div className="hud mt-5 p-8 text-center"><p className="font-display text-[24px] font-bold uppercase">Shop restocking</p><p className="mt-1 text-fg-soft">New rewards land here soon. Your points stay safe.</p></div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards.map((r) => {
            const pct = Math.min(100, (100 * balance) / r.cost);
            const can = balance >= r.cost;
            const isGoal = goalKey && r.name.toLowerCase().includes(goalKey);
            return (
              <article key={r.id} className={cn("hud relative flex flex-col p-5", isGoal && "glow-edge")} data-testid="reward">
                {isGoal && <span className="absolute -top-2.5 left-4 rounded-full bg-lime px-2.5 py-0.5 text-[11px] font-bold uppercase text-void">Your goal</span>}
                <div className="flex items-center gap-3">
                  <span className="grid size-14 place-items-center rounded-[16px] bg-gradient-to-br from-violet/40 to-cyan/30"><RewardIcon name={r.icon} className="size-7" /></span>
                  <div className="min-w-0"><p className="label-mono text-[10px] text-cyan">{r.kind}</p><p className="font-display text-[22px] font-bold uppercase leading-[1.02]">{r.name}</p></div>
                </div>
                <p className="mt-3 flex-1 text-[14px] text-fg-soft">{r.blurb}</p>
                <div className="mt-4 flex items-baseline justify-between text-[14px]"><span className="font-display text-[22px] font-bold text-lime tabular">{r.cost.toLocaleString("en-US")} pts</span><span className="text-fg-soft tabular">{Math.floor(pct)}%</span></div>
                <div className="xp-track mt-2 h-2"><div className="xp-fill" style={{ width: `${Math.max(1.5, pct)}%` }} /></div>
                <button onClick={() => setPick(r)} disabled={!can} className={cn("mt-4 h-11 rounded-full text-[15px] font-semibold transition active:scale-[0.97]", can ? "bg-lime text-void" : "bg-white/5 text-fg-soft")}>
                  {can ? "Redeem" : `${(r.cost - balance).toLocaleString("en-US")} pts to go`}
                </button>
              </article>
            );
          })}
        </div>
      )}

      <h2 className="mt-10 font-display text-[28px] font-bold uppercase">My rewards</h2>
      {redemptions.length === 0 ? (
        <p className="mt-2 text-fg-soft">Nothing redeemed yet. Your first reward shows up here with its status.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {redemptions.map((r) => <RedRow key={r.id} r={r} onChange={() => router.refresh()} />)}
        </ul>
      )}

      <RedeemSheet reward={pick} onClose={() => setPick(null)} onDone={() => router.refresh()} />
    </div>
  );
}

function RedRow({ r, onChange }: { r: Red; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  const idx = STEPS.indexOf(r.status);
  async function cancel() {
    if (!confirm("Cancel this reward? Your points come back right away.")) return;
    setBusy(true);
    await fetch("/api/redeem", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id }) }).catch(() => null);
    setBusy(false);
    onChange();
  }
  return (
    <li className="hud p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Package className="size-5 text-cyan" />
        <p className="font-semibold">{r.reward_name}</p>
        <span className="text-[13px] text-fg-soft tabular">{r.cost.toLocaleString("en-US")} pts · {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
        <span className={cn("ml-auto rounded-full px-2.5 py-0.5 text-[12px] font-bold uppercase", r.status === "canceled" ? "bg-white/5 text-fg-soft" : r.status === "delivered" ? "bg-lime text-void" : "bg-cyan/15 text-cyan")}>{LABEL[r.status] || r.status}</span>
      </div>
      {r.status !== "canceled" && (
        <div className="mt-3 flex items-center gap-1.5">
          {STEPS.map((s, i) => <span key={s} className={cn("h-1.5 flex-1 rounded-full", i <= idx ? "bg-lime" : "bg-white/10")} />)}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-fg-soft">
        {r.tracking && <span className="flex items-center gap-1.5"><Truck className="size-4" />Tracking: {r.tracking}</span>}
        {r.status === "requested" && <button onClick={cancel} disabled={busy} className="ml-auto flex items-center gap-1 font-semibold hover:text-fg"><X className="size-4" />Cancel</button>}
      </div>
    </li>
  );
}

function RedeemSheet({ reward, onClose, onDone }: { reward: Reward | null; onClose: () => void; onDone: () => void }) {
  const reduce = useReducedMotion();
  const gear = reward?.kind.toLowerCase() === "gear";
  const [f, setF] = useState({ name: "", line1: "", line2: "", city: "", state: "", zip: "" });
  const [st, setSt] = useState<"idle" | "busy" | "ok" | string>("idle");
  function close() { const ok = st === "ok"; setSt("idle"); onClose(); if (ok) onDone(); }
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!reward) return;
    setSt("busy");
    const r = await fetch("/api/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reward: reward.id, ship: gear ? f : undefined }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    setSt(r?.ok ? "ok" : j.error || "Couldn't redeem it. Try again.");
  }
  const field = "h-[50px] w-full rounded-[14px] border border-line bg-surface-2 px-4 text-[16px] outline-none focus:border-cyan/60";
  return (
    <Sheet open={Boolean(reward)} onClose={close} variant="bottom" label="Redeem" z={60} closeSide="right">
      <div className="overflow-y-auto px-5 pb-8 pt-6 md:px-7">
        {reward && (st === "ok" ? (
          <div className="py-6 text-center">
            <motion.span initial={reduce ? false : { scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }} className="glow-edge mx-auto grid size-20 place-items-center rounded-[24px] bg-lime text-void"><Check className="size-10" strokeWidth={3} /></motion.span>
            <h2 className="mt-5 font-display text-[34px] font-bold uppercase leading-none">Reward unlocked</h2>
            <p className="mt-2 text-fg-soft">{reward.name} is requested. {gear ? "We'll ship it and post tracking here." : "Your code arrives by email."}</p>
            <button onClick={close} className="mt-6 h-[54px] w-full rounded-full bg-lime font-semibold text-void">Nice</button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <p className="label-mono text-cyan">[ redeem ]</p>
            <h2 className="mt-1 pr-10 font-display text-[30px] font-bold uppercase leading-none">{reward.name}</h2>
            <p className="mt-2 flex items-center gap-1.5 text-[15px] text-fg-soft"><Zap className="size-4 text-lime" />{reward.cost.toLocaleString("en-US")} pts, held from your balance now</p>
            {gear ? (
              <div className="mt-5 space-y-2.5">
                <p className="text-[14px] font-semibold">Ship to (US only)</p>
                <input className={field} placeholder="Full name" autoComplete="name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} aria-label="Full name" />
                <input className={field} placeholder="Street address" autoComplete="address-line1" value={f.line1} onChange={(e) => setF({ ...f, line1: e.target.value })} aria-label="Street address" />
                <input className={field} placeholder="Apt, suite (optional)" autoComplete="address-line2" value={f.line2} onChange={(e) => setF({ ...f, line2: e.target.value })} aria-label="Apartment" />
                <div className="grid grid-cols-[1.4fr_0.8fr_1fr] gap-2">
                  <input className={field} placeholder="City" autoComplete="address-level2" value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} aria-label="City" />
                  <input className={field} placeholder="State" autoComplete="address-level1" maxLength={30} value={f.state} onChange={(e) => setF({ ...f, state: e.target.value })} aria-label="State" />
                  <input className={field} placeholder="ZIP" autoComplete="postal-code" inputMode="numeric" value={f.zip} onChange={(e) => setF({ ...f, zip: e.target.value })} aria-label="ZIP code" />
                </div>
              </div>
            ) : <p className="mt-5 rounded-[14px] bg-surface-2 p-4 text-[14px]">We send the code to the email of your account.</p>}
            {st !== "idle" && st !== "busy" && <p className="mt-3 text-[14px] text-pink" role="alert">{st}</p>}
            <button type="submit" disabled={st === "busy"} className="mt-5 flex h-[56px] w-full items-center justify-center gap-2 rounded-full bg-lime text-[17px] font-semibold text-void active:scale-[0.97] disabled:opacity-60">
              {st === "busy" && <Loader2 className="size-4 animate-spin" />}Redeem for {reward.cost.toLocaleString("en-US")} pts
            </button>
            <p className="mt-2.5 text-center text-[12px] text-fg-soft">Changed your mind? Cancel it in My rewards until it&apos;s processed.</p>
          </form>
        ))}
      </div>
    </Sheet>
  );
}
