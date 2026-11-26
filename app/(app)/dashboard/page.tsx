"use client";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { UnlockFilm } from "@/components/funnel/UnlockFilm";
import { shortName } from "@/lib/plans";

/** A buyer back from the fallback checkout page: confirm, play the unlock moment, go to today. */
function Confirm() {
  const router = useRouter();
  const sp = useSearchParams();
  const [film, setFilm] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const ref = sp.get("ref");
    if (sp.get("paid") !== "1" || !ref) { router.replace("/today"); return; }
    fetch("/api/checkout/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ref }) })
      .then((r) => r.json()).then((r) => (r.paid ? setFilm(r.plan?.name ? shortName(r.plan.name) : "your plan") : setFailed(true)))
      .catch(() => setFailed(true));
  }, [sp, router]);
  return (
    <div className="grid min-h-[70dvh] place-items-center px-6 text-center">
      {failed ? (
        <div><p className="font-serif text-[24px] font-semibold">We&apos;re confirming your payment.</p><p className="mt-2 text-fg-soft">This can take a minute. Your meals are saved.</p><button onClick={() => location.reload()} className="mt-5 rounded-full bg-tomato px-6 py-3 font-semibold text-white">Try again</button></div>
      ) : <div className="w-64 space-y-3"><div className="skeleton h-6" /><div className="skeleton h-32" /></div>}
      <AnimatePresence>{film && <UnlockFilm planName={film} onDone={() => { router.replace("/today"); router.refresh(); }} />}</AnimatePresence>
    </div>
  );
}
export default function Page() { return <Suspense><Confirm /></Suspense>; }
