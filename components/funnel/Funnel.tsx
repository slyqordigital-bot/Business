"use client";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { Sheet } from "@/components/ui/Sheet";
import { LogoMark } from "@/components/ui/Logo";
import { AuthForm } from "./AuthForm";
import { Paywall, usePlans, type ClientPlan, type Period } from "./Paywall";
import { ADDS } from "@/lib/plans";
import { Check } from "lucide-react";
import { CheckoutSheet } from "./Checkout";
import { UnlockFilm } from "./UnlockFilm";
import { shortName } from "@/lib/plans";

type PaywallOpts = { title: string; line?: string; currentLevel?: number };
type Ctx = {
  /** sign-up first if needed, then the paywall */
  unlock: (o: PaywallOpts & { signedIn: boolean; signupTitle: string; afterAuth?: () => Promise<void> }) => void;
  openPaywall: (o: PaywallOpts) => void;
  /** the next plan only, what it adds, its price a day, one button */
  openUpgrade: (o: { level: 1 | 2; reason?: string }) => void;
};

const FunnelCtx = createContext<Ctx | null>(null);
export const useFunnel = () => {
  const c = useContext(FunnelCtx);
  if (!c) throw new Error("FunnelProvider missing");
  return c;
};

/**
 * Sign-up sheet → paywall sheet → checkout sheet → unlock film, shared by the landing page and the app.
 * onUnlocked runs after the payment is confirmed and the film has played.
 */
export function FunnelProvider({ children, onUnlocked, onPaywallClosed }: { children: React.ReactNode; onUnlocked: (r: { level: number }) => void; onPaywallClosed?: () => void }) {
  const [signup, setSignup] = useState<null | { title: string; after?: () => Promise<void>; pw: PaywallOpts }>(null);
  const [pw, setPw] = useState<PaywallOpts | null>(null);
  const [ck, setCk] = useState<{ plan: ClientPlan; period: Period } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [film, setFilm] = useState<{ name: string; level: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [up, setUp] = useState<{ level: 1 | 2; reason?: string } | null>(null);
  const { plans } = usePlans();
  const nextPlan = up ? plans?.find((p) => p.level === up.level + 1) ?? null : null;

  const openPaywall = useCallback((o: PaywallOpts) => {
    setNotice(null);
    setPw(o);
    fetch("/api/checkout", { method: "PUT" }).catch(() => {});
  }, []);

  const unlock: Ctx["unlock"] = useCallback((o) => {
    if (o.signedIn) openPaywall(o);
    else setSignup({ title: o.signupTitle, after: o.afterAuth, pw: o });
  }, [openPaywall]);

  const onPaid = useCallback(async (ref: string) => {
    setBusy(true);
    const r = await fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref }) }).then((x) => x.json()).catch(() => null);
    setBusy(false);
    setCk(null);
    setPw(null);
    setFilm({ name: r?.plan?.name ? shortName(r.plan.name) : "your plan", level: r?.level ?? 1 });
  }, []);

  const onPaymentsOff = useCallback(() => {
    setCk(null);
    setNotice("Payments open in a moment. Your Snack Quest is saved.");
  }, []);

  const value = useMemo(() => ({ unlock, openPaywall, openUpgrade: setUp }), [unlock, openPaywall]);
  return (
    <FunnelCtx.Provider value={value}>
      {children}

      <Sheet open={Boolean(signup)} onClose={() => setSignup(null)} variant="bottom" label="Sign up" z={60}>
        <div className="overflow-y-auto px-5 pb-8 pt-14 md:px-8" data-testid="signup-sheet">
          <LogoMark className="size-10" />
          <h2 className="mt-4 font-display text-[30px] font-bold uppercase leading-[1.02]">{signup?.title}</h2>
          <p className="mb-6 mt-1.5 text-[15px] text-fg-soft">Free account. No card needed.</p>
          <AuthForm compact onDone={async () => {
            const s = signup;
            await s?.after?.();
            setSignup(null);
            if (s) openPaywall(s.pw);
          }} />
        </div>
      </Sheet>

      <Sheet open={Boolean(pw)} onClose={() => { setPw(null); onPaywallClosed?.(); }} label="Choose your plan" z={60}>
        <div className="overflow-y-auto" data-testid="paywall">
          {pw && <Paywall title={pw.title} line={pw.line} currentLevel={pw.currentLevel} busy={busy} notice={notice}
            onContinue={(plan, period) => { setNotice(null); setCk({ plan, period }); }} />}
        </div>
      </Sheet>

      <Sheet open={Boolean(up)} onClose={() => setUp(null)} variant="bottom" label="Upgrade" z={60}>
        <div className="px-5 pb-8 pt-14 md:px-8" data-testid="upgrade-sheet">
          {up?.reason && <p className="text-[14px] text-fg-soft">{up.reason}</p>}
          {!nextPlan ? <div className="skeleton mt-3 h-40" /> : (
            <>
              <h2 className="mt-1 font-display text-[30px] font-bold uppercase leading-[1.02]">Get more with {shortName(nextPlan.name)}</h2>
              <ul className="mt-5 space-y-3">
                {up && ADDS[up.level].map((a) => <li key={a} className="flex gap-2.5 text-[16px]"><Check className="mt-0.5 size-5 shrink-0 text-lime" strokeWidth={2.5} />{a}</li>)}
              </ul>
              <p className="mt-6"><span className="font-display text-[38px] font-bold tabular">{nextPlan.per_day}</span><span className="text-fg-soft"> / day · ${(nextPlan.price_cents / 100).toFixed(2)} a month</span></p>
              <button onClick={() => { const p = nextPlan; setUp(null); setCk({ plan: p, period: "month" }); }} data-testid="upgrade-continue"
                className="mt-5 h-[58px] w-full rounded-full bg-lime text-[17px] font-semibold text-void transition active:scale-[0.97]">Upgrade to {shortName(nextPlan.name)}</button>
              <p className="mt-2.5 text-center text-[13px] text-fg-soft">Your current plan stops at the end of its period. Never billed twice.</p>
            </>
          )}
        </div>
      </Sheet>

      <CheckoutSheet plan={ck?.plan ?? null} period={ck?.period ?? "month"} onClose={() => setCk(null)} onPaid={onPaid} onPaymentsOff={onPaymentsOff} />

      <AnimatePresence>
        {film && <UnlockFilm planName={film.name} onDone={() => { const f = film; setFilm(null); onUnlocked({ level: f.level }); }} />}
      </AnimatePresence>
    </FunnelCtx.Provider>
  );
}
