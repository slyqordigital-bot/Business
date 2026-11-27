"use client";
import { useEffect, useRef, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { shortName } from "@/lib/plans";
import type { ClientPlan, Period } from "./Paywall";

type WhopCheckout = { create: (n: string, opts?: Record<string, unknown>) => { mount: (sel: string) => void }; destroy?: () => void };
declare global {
  interface Window {
    WhopElements?: () => { checkout: { create: (o: Record<string, unknown>) => WhopCheckout } };
  }
}

let whopScript: Promise<void> | null = null;
function loadWhop() {
  if (window.WhopElements) return Promise.resolve();
  if (!whopScript) {
    whopScript = new Promise<void>((res, rej) => {
      const s = document.createElement("script");
      s.src = "https://cdn.whop.com/elements/amber/elements.js";
      s.setAttribute("data-whop-elements", "");
      s.async = true;
      s.onload = () => res();
      s.onerror = () => { whopScript = null; rej(new Error("whop")); };
      document.head.appendChild(s);
    });
  }
  return whopScript;
}

/**
 * The checkout, inside the page: a second sheet over the paywall with Whop's checkout embedded.
 * Kwop creates the checkout on the owner's Whop; this app never talks to Whop's API.
 */
export function CheckoutSheet({ plan, period, onClose, onPaid, onPaymentsOff }: {
  plan: ClientPlan | null;
  period: Period;
  onClose: () => void;
  onPaid: (ref: string) => void;
  onPaymentsOff: () => void;
}) {
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const ckRef = useRef<WhopCheckout | null>(null);

  useEffect(() => {
    if (!plan) return;
    let alive = true;
    let shown = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const show = () => { if (alive && !shown) { shown = true; setState("ready"); } };
    setState("loading");

    (async () => {
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan: plan.id, period }) }).catch(() => null);
      if (!alive) return;
      if (!r) return setState("error");
      if (r.status === 409) { onPaymentsOff(); return; }
      if (!r.ok) return setState("error");
      const { embed, ref, fallback_url, email } = await r.json();
      if (!embed) { if (fallback_url) location.assign(fallback_url); else setState("error"); return; }
      try {
        await loadWhop();
      } catch {
        if (fallback_url) location.assign(fallback_url); else setState("error");
        return;
      }
      if (!alive || !window.WhopElements) return;
      const dark = true;
      const ck = window.WhopElements().checkout.create({
        checkoutConfiguration: embed,
        returnUrl: location.origin + "/dashboard?paid=1&ref=" + encodeURIComponent(ref),
        appearance: { theme: { appearance: dark ? "dark" : "light" } },
        onLoadingChange: (st: unknown) => {
          const loading = st && typeof st === "object" ? (st as { loading?: boolean }).loading : st;
          if (loading === false) show();
        },
        onComplete: (res: { result?: string } | undefined) => { if (res && res.result === "payment") onPaid(ref); },
      });
      ckRef.current = ck;
      // the account email, filled in and locked: Kwop matches the payment to the account by this email
      ck.create("checkout", email ? { buyerEmail: email, lockBuyerEmail: true } : undefined).mount("#whop-checkout");
      timers.push(setTimeout(() => {
        if (document.querySelector("#whop-checkout iframe")) show();
      }, 2000));
      timers.push(setTimeout(() => {
        if (!shown && fallback_url) location.assign(fallback_url);
      }, 15000));
    })();

    return () => {
      alive = false;
      timers.forEach(clearTimeout);
      try { ckRef.current?.destroy?.(); } catch {}
      ckRef.current = null;
      const el = document.getElementById("whop-checkout");
      if (el) el.innerHTML = "";
    };
  }, [plan, period, onPaid, onPaymentsOff]);

  const price = plan ? (period === "year" && plan.yearly ? `$${(plan.yearly.price_cents / 100).toFixed(2)} / year` : `$${(plan.price_cents / 100).toFixed(2)} / month`) : "";

  return (
    <Sheet open={Boolean(plan)} onClose={onClose} variant="bottom" label="Checkout" z={70} closeSide="right">
      <div className="flex min-h-[60dvh] flex-col overflow-y-auto px-5 pb-6 pt-5 md:min-h-[560px] md:px-7" data-testid="checkout-sheet">
        <div className="pr-10">
          <p className="text-[13px] text-fg-soft">Checkout</p>
          <h3 className="font-display text-[26px] font-bold uppercase leading-none">{plan && `SnackQuest ${shortName(plan.name)}`}</h3>
          <p className="mt-1 text-[15px] text-fg-soft">{price}</p>
        </div>
        <div className="relative mt-4 flex-1">
          {state === "loading" && (
            <div className="absolute inset-x-0 top-6 flex items-center justify-center gap-2 text-[14px] text-fg-soft"><Loader2 className="size-4 animate-spin" />Loading secure checkout…</div>
          )}
          {state === "error" && (
            <div className="rounded-xl bg-surface-2 p-4 text-[14px]">The checkout didn&apos;t load. Close this and try again. Your quest is saved.</div>
          )}
          <div id="whop-checkout" className="min-h-[420px]" style={{ opacity: state === "ready" ? 1 : 0, transition: "opacity .3s" }} />
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-fg-soft"><Lock className="size-3.5" />Secure payment by Whop · Cancel in 1 click</p>
      </div>
    </Sheet>
  );
}
