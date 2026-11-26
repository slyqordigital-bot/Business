"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, ImageUp, RotateCcw, Sparkles } from "lucide-react";
import { ScanFrame } from "@/components/ui/ScanFrame";
import { WorkSteps } from "@/components/funnel/WorkSteps";
import { LockedNumbers } from "@/components/funnel/LockedNumbers";
import { useFunnel, FunnelProvider } from "@/components/funnel/Funnel";
import { usePlans } from "@/components/funnel/Paywall";
import { deviceId, preparePhoto, tryStore, type SavedTry } from "@/lib/client";
import { cn } from "@/lib/utils";

export const EXAMPLES = [
  { key: "avocado-toast", label: "Avocado toast", src: "/examples/avocado-toast.jpg" },
  { key: "poke-bowl", label: "Poke bowl", src: "/examples/poke-bowl.jpg" },
  { key: "spaghetti", label: "Spaghetti", src: "/examples/spaghetti.jpg" },
];

type State =
  | { s: "idle" }
  | { s: "working"; preview: string; done: boolean }
  | { s: "teaser"; t: SavedTry; fresh: boolean }
  | { s: "error"; msg: string; limit?: boolean };

export function Scanner() {
  const router = useRouter();
  const mealId = useRef<string | null>(null);
  const [paywallClosed, setPaywallClosed] = useState(false);
  return (
    <FunnelProvider onPaywallClosed={() => setPaywallClosed(true)}
      onUnlocked={() => { tryStore.clear(); router.push(mealId.current ? `/meal/${mealId.current}?celebrate=1` : "/today"); }}>
      <ScannerInner mealId={mealId} paywallClosed={paywallClosed} />
    </FunnelProvider>
  );
}

function ScannerInner({ mealId, paywallClosed }: { mealId: React.RefObject<string | null>; paywallClosed: boolean }) {
  const [st, setSt] = useState<State>({ s: "idle" });
  const [drag, setDrag] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const pending = useRef<SavedTry | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const funnel = useFunnel();
  const reduce = useReducedMotion();
  const { plans } = usePlans();
  const featured = plans?.find((p) => p.featured);

  // a returning visitor lands on their result
  useEffect(() => {
    const t = tryStore.get();
    if (t && Date.now() - t.at < 7 * 86_400_000) setSt({ s: "teaser", t, fresh: false });
  }, []);

  const run = useCallback(async (src: File | string) => {
    let prepared: { blob: Blob; preview: string };
    try {
      prepared = await preparePhoto(src);
    } catch {
      setSt({ s: "error", msg: "We couldn't open that image. Try another photo." });
      return;
    }
    setSt({ s: "working", preview: prepared.preview, done: false });
    document.getElementById("try")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    const fd = new FormData();
    fd.append("photo", prepared.blob, "meal.jpg");
    fd.append("device", deviceId());
    let res: Response | null = null;
    for (let i = 0; i < 2; i++) {
      res = await fetch("/api/try", { method: "POST", body: fd }).catch(() => null);
      if (res && res.status !== 502) break;
    }
    const j = res ? await res.json().catch(() => ({})) : {};
    if (!res || !res.ok) {
      setSt({ s: "error", msg: j.message || "The scan didn't go through. Check your connection and try again.", limit: j.error === "limit" });
      return;
    }
    const t: SavedTry = { id: j.id, dish: j.dish, insight: j.insight, items: j.items, preview: prepared.preview, at: Date.now() };
    tryStore.set(t);
    pending.current = t;
    setSt((s) => (s.s === "working" ? { ...s, done: true } : s));
  }, [reduce]);

  const onFinished = useCallback(() => {
    if (pending.current) setSt({ s: "teaser", t: pending.current, fresh: true });
  }, []);

  const openUnlock = useCallback((t: SavedTry) => {
    const n = t.items.length;
    funnel.unlock({
      signedIn,
      signupTitle: "Save this meal to your log",
      title: "Your plate's macros are ready.",
      line: `${n} food${n === 1 ? "" : "s"} found in your ${t.dish.toLowerCase()}. Unlock the numbers and log it in one tap.`,
      afterAuth: async () => {
        setSignedIn(true);
        const r = await fetch("/api/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tryId: t.id, tz: new Date().getTimezoneOffset() }) })
          .then((x) => x.json()).catch(() => null);
        mealId.current = r?.mealId ?? null;
      },
    });
  }, [funnel, signedIn, mealId]);

  return (
    <div id="try" className="scroll-mt-24">
      <AnimatePresence mode="wait" initial={false}>
        {st.s === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.25 }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) run(f); }}
              className={cn("relative rounded-[28px] border-2 border-dashed bg-white/[0.04] p-2 transition-colors", drag ? "border-lime bg-lime/10" : "border-white/20")}>
              <button type="button" onClick={() => fileRef.current?.click()} data-testid="dropzone"
                className="group flex w-full flex-col items-center justify-center gap-4 rounded-[22px] bg-cream px-6 py-9 text-ink transition active:scale-[0.99] md:py-12">
                <span className="relative grid size-[76px] place-items-center rounded-[24px] bg-tomato text-white shadow-[0_12px_30px_-8px_rgb(229_72_47/0.7)] transition group-hover:scale-105">
                  <Camera className="size-9" strokeWidth={1.8} />
                  <span className="absolute -right-1.5 -top-1.5 grid size-7 place-items-center rounded-full bg-lime text-night"><Sparkles className="size-3.5" /></span>
                </span>
                <span>
                  <span className="block font-serif text-[24px] font-semibold tracking-[-0.02em] md:text-[28px]">Snap my macros</span>
                  <span className="mt-1 flex items-center justify-center gap-1.5 text-[15px] text-ink-soft"><ImageUp className="size-4" />Take a photo of your meal or upload one</span>
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" data-testid="file-input"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) run(f); e.target.value = ""; }} />
            </div>
            <div className="mt-5">
              <p className="label-mono mb-3 text-center text-cream/50">or try an example</p>
              <div className="grid grid-cols-3 gap-2.5 md:gap-3">
                {EXAMPLES.map((ex) => (
                  <button key={ex.key} type="button" onClick={() => run(ex.src)} data-testid={`example-${ex.key}`}
                    className="group overflow-hidden rounded-[16px] bg-white/5 ring-1 ring-white/10 transition hover:ring-lime/60 active:scale-[0.97]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={ex.src} alt={ex.label} width={160} height={160} className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105" />
                    <span className="block py-2 text-[13px] font-medium text-cream/85">{ex.label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-[11px] text-cream/35">Example photos: <a href="/credits" className="underline underline-offset-2 hover:text-cream/60">credits</a></p>
            </div>
          </motion.div>
        )}

        {st.s === "working" && (
          <motion.div key="working" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="grid gap-6 rounded-[28px] bg-white/[0.04] p-3 ring-1 ring-white/10 md:grid-cols-[1fr_1fr] md:p-4" data-testid="working">
            <ScanFrame src={st.preview} scanning className="aspect-square" />
            <div className="flex items-center px-2 pb-3 md:px-4">
              <WorkSteps dark done={st.done} onFinished={onFinished} />
            </div>
          </motion.div>
        )}

        {st.s === "teaser" && (
          <motion.div key="teaser" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="rounded-[28px] bg-cream p-3 text-ink md:p-4" data-testid="teaser">
            <div className="grid gap-4 md:grid-cols-[1fr_1fr] md:gap-6">
              <ScanFrame src={st.t.preview} pins={st.t.items.slice(0, 5)} className="aspect-square" />
              <div className="flex flex-col px-1 pb-1 md:py-2 md:pr-2">
                <p className="label-mono text-olive">[ your plate ]</p>
                <h3 className="mt-2 font-serif text-[26px] font-semibold leading-tight tracking-[-0.02em] first-letter:uppercase">{st.t.dish}</h3>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {st.t.items.map((i, k) => <li key={i.name + k} className="rounded-full bg-paper px-2.5 py-1 text-[13px] font-medium">{i.name}</li>)}
                </ul>
                <p className="mt-3 rounded-[14px] border border-olive/20 bg-olive/[0.07] p-3 text-[14px] leading-snug"><Sparkles className="mr-1.5 inline size-4 text-olive" />{st.t.insight}</p>
                <LockedNumbers className="mt-4" onUnlock={() => openUnlock(st.t)} />
                <button type="button" onClick={() => openUnlock(st.t)} data-testid="unlock"
                  className="mt-4 h-[56px] w-full rounded-full bg-tomato text-[17px] font-semibold text-white shadow-[0_12px_30px_-10px_rgb(229_72_47/0.7)] transition active:scale-[0.97]">
                  See my full macros
                </button>
                <button type="button" onClick={() => { tryStore.clear(); setSt({ s: "idle" }); }} className="mx-auto mt-3 flex items-center gap-1.5 text-[13px] text-ink-soft hover:text-ink">
                  <RotateCcw className="size-3.5" />Scan another plate
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {st.s === "error" && (
          <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="rounded-[28px] bg-cream p-8 text-center text-ink" role="alert">
            <p className="font-serif text-[22px] font-semibold">{st.limit ? "That's today's free scans." : "Hmm, let's try that again."}</p>
            <p className="mx-auto mt-2 max-w-sm text-[15px] text-ink-soft">{st.msg}</p>
            <div className="mt-5 flex justify-center gap-3">
              {st.limit ? (
                <a href="/signup" className="rounded-full bg-tomato px-6 py-3 text-[15px] font-semibold text-white">Create my free account</a>
              ) : (
                <button onClick={() => setSt({ s: "idle" })} className="rounded-full bg-tomato px-6 py-3 text-[15px] font-semibold text-white">Try again</button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* after closing the paywall: the locked result stays, with a sticky bar that reopens it */}
      {st.s === "teaser" && signedIn && paywallClosed && (
        <button onClick={() => openUnlock(st.t)} className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-40 flex h-14 items-center justify-between rounded-full bg-tomato px-6 text-[16px] font-semibold text-white shadow-xl md:inset-x-auto md:left-1/2 md:w-[420px] md:-translate-x-1/2">
          See my full macros <span className="font-normal opacity-90">{featured?.per_day} / day</span>
        </button>
      )}
    </div>
  );
}
