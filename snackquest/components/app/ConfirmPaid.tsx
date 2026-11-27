"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { UnlockFilm } from "@/components/funnel/UnlockFilm";
import { shortName } from "@/lib/plans";

/** A buyer back from the fallback checkout page: confirm, play the unlock moment, then the dashboard. */
export function ConfirmPaid({ refId }: { refId: string }) {
  const router = useRouter();
  const [film, setFilm] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref: refId }) })
      .then((r) => r.json()).then((r) => (r.paid ? setFilm(r.plan?.name ? shortName(r.plan.name) : "your plan") : setFailed(true)))
      .catch(() => setFailed(true));
  }, [refId]);
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      {failed ? (
        <div><p className="font-display text-[28px] font-bold uppercase">We&apos;re confirming your payment.</p><p className="mt-2 text-fg-soft">This can take a minute. Your Snack Quest is saved.</p><button onClick={() => location.reload()} className="mt-5 rounded-full bg-lime px-6 py-3 font-semibold text-void">Try again</button></div>
      ) : <div className="w-64 space-y-3"><div className="skeleton h-6" /><div className="skeleton h-32" /></div>}
      <AnimatePresence>{film && <UnlockFilm planName={film} onDone={() => { router.replace("/start"); router.refresh(); }} />}</AnimatePresence>
    </div>
  );
}
