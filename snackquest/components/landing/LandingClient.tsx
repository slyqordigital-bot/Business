"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotionLite as useReducedMotion } from "@/components/ui/motionLite";
import { ArrowRight, Check, ChevronDown, Flame, Gamepad2, Gift, Headphones, Package, Swords, Timer } from "lucide-react";
import { cn } from "@/lib/utils";

const CTA = "Start my Snack Quest";

/* ───────── how it works: 3 animated phones (dark) ───────── */
export function ConnectScreen() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? 3 : 0);
  useEffect(() => { if (reduce) return; const i = setInterval(() => setN((x) => (x + 1) % 5), 1100); return () => clearInterval(i); }, [reduce]);
  const games = ["Fortnite", "Valorant", "Minecraft"];
  return (
    <div className="px-4 pt-6">
      <p className="label-mono text-[9px] text-cyan">[ game sync ]</p>
      <p className="mt-1 font-display text-[22px] font-bold uppercase leading-none">Link your games</p>
      <div className="mt-4 space-y-2">
        {games.map((g, i) => (
          <div key={g} className="flex items-center gap-2.5 rounded-[12px] bg-white/5 p-2.5 ring-1 ring-white/10">
            <Gamepad2 className="size-4 text-cyan" /><span className="flex-1 text-[13px] font-semibold">{g}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-bold uppercase transition", i < n ? "bg-lime text-void" : "bg-white/10 text-white/50")}>{i < n ? "Linked" : "Link"}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-[12px] bg-white/5 p-2.5 text-[11px] text-fg-soft ring-1 ring-white/10"><Timer className="mr-1 inline size-3.5 text-lime" />Session timer: 1 pt / 5 min</div>
    </div>
  );
}
export function SnackScreen() {
  const reduce = useReducedMotion();
  const [ok, setOk] = useState(false);
  useEffect(() => { if (reduce) { setOk(true); return; } const i = setInterval(() => setOk((x) => !x), 1800); return () => clearInterval(i); }, [reduce]);
  return (
    <div className="px-4 pt-6">
      <p className="label-mono text-[9px] text-violet">[ quest 02 · rare ]</p>
      <p className="mt-1 font-display text-[22px] font-bold uppercase leading-none">Chip Per Kill</p>
      <p className="mt-1.5 text-[11px] text-fg-soft">One chip for every elimination. Snap the bag next to your score.</p>
      <div className="relative mt-3 aspect-square overflow-hidden rounded-[14px] bg-gradient-to-br from-[#2a1650] to-[#0c0a16] ring-1 ring-white/10">
        <div className="absolute left-[12%] top-[16%] h-[40%] w-[60%] rounded-md bg-cyan/20 ring-1 ring-cyan/40" />
        <div className="absolute bottom-[12%] right-[12%] h-[46%] w-[36%] rotate-6 rounded-[10px] bg-gradient-to-b from-[#ffc53d] to-[#e8742f]" />
        <div className="absolute inset-x-0 h-0.5 animate-[floaty_2s_ease-in-out_infinite] bg-lime shadow-[0_0_12px_var(--lime)]" style={{ top: "50%" }} />
        <div aria-hidden={!ok} className={cn("absolute inset-0 grid place-items-center bg-void/50 transition duration-300", ok ? "scale-100 opacity-100" : "scale-90 opacity-0")}><span className="rounded-full bg-lime px-3 py-1.5 font-display text-[16px] font-bold uppercase text-void">Cleared +60</span></div>
      </div>
    </div>
  );
}
export function CollectScreen() {
  const reduce = useReducedMotion();
  const [v, setV] = useState(reduce ? 72 : 20);
  useEffect(() => { if (reduce) return; const i = setInterval(() => setV((x) => (x >= 100 ? 20 : x + 8)), 450); return () => clearInterval(i); }, [reduce]);
  return (
    <div className="px-4 pt-6">
      <p className="label-mono text-[9px] text-lime">[ reward shop ]</p>
      <p className="mt-1 font-display text-[22px] font-bold uppercase leading-none">Collect</p>
      {[["Wireless Controller", "20,000", v], ["$10 Steam Gift Card", "3,000", 100]].map(([n, c, w]) => (
        <div key={n as string} className="mt-3 rounded-[12px] bg-white/5 p-2.5 ring-1 ring-white/10">
          <div className="flex justify-between text-[12px] font-semibold"><span>{n}</span><span className="text-lime">{c}</span></div>
          <div className="xp-track mt-2 h-1.5"><div className="xp-fill transition-all duration-500" style={{ width: `${Math.min(100, w as number)}%` }} /></div>
        </div>
      ))}
      <div className="mt-3 flex items-center gap-2 rounded-[12px] bg-lime/10 p-2.5 text-[11px] text-lime ring-1 ring-lime/30"><Package className="size-3.5" />Gift card: code sent · Controller: processing</div>
    </div>
  );
}

/* ───────── the product in action: 4 feature loops (light) ───────── */
export function LoopSync() {
  const reduce = useReducedMotion();
  const [m, setM] = useState(reduce ? 48 : 0);
  useEffect(() => { if (reduce) return; const i = setInterval(() => setM((x) => (x >= 60 ? 0 : x + 1)), 120); return () => clearInterval(i); }, [reduce]);
  return (
    <div className="flex h-full flex-col justify-center rounded-[16px] bg-void p-5 text-fg">
      <div className="flex items-center gap-2 text-[13px] font-semibold"><span className="size-2 animate-pulse rounded-full bg-lime" />Fortnite · live</div>
      <p className="mt-2 font-display text-[54px] font-bold leading-none tabular">{String(m).padStart(2, "0")}:00</p>
      <p className="mt-1 text-[13px] text-fg-soft">+{Math.floor(m / 5)} pts this session</p>
    </div>
  );
}
export function LoopQuests() {
  const reduce = useReducedMotion();
  const qs = ["Crust Shield Protocol", "Chip Per Kill", "Hydration Respawn"];
  const [i, setI] = useState(0);
  useEffect(() => { if (reduce) return; const t = setInterval(() => setI((x) => (x + 1) % qs.length), 1700); return () => clearInterval(t); }, [reduce, qs.length]);
  return (
    <div className="flex h-full flex-col justify-center gap-2 rounded-[16px] bg-void p-4 text-fg">
      {qs.map((q, k) => (
        <div key={q} className={cn("flex items-center gap-2 rounded-[12px] p-2.5 text-[13px] font-semibold ring-1 transition-all duration-300", k === i ? "bg-lime/10 text-lime ring-lime/40" : "bg-white/5 ring-white/10")}>
          <span className={cn("grid size-5 place-items-center rounded-[5px] border", k <= i ? "border-lime bg-lime text-void" : "border-white/25")}>{k <= i && <Check className="size-3.5" strokeWidth={3} />}</span>{q}
        </div>
      ))}
    </div>
  );
}
export function LoopShop() {
  return (
    <div className="grid h-full grid-cols-2 gap-2 rounded-[16px] bg-void p-3 text-fg">
      {[[Headphones, "Headset", "30k"], [Gamepad2, "Controller", "20k"], [Gift, "$10 Steam", "3k"], [Swords, "Mouse", "12k"]].map(([I, n, c], k) => {
        const Icon = I as typeof Gift;
        return (
          <div key={n as string} className="animate-floaty rounded-[12px] bg-white/5 px-2.5 py-2 ring-1 ring-white/10" style={{ animationDelay: `${k * 0.4}s` }}>
            <Icon className="size-4 text-cyan" /><p className="mt-1 truncate text-[12px] font-semibold leading-tight">{n as string}</p><p className="text-[11px] font-bold text-lime">{c as string} pts</p>
          </div>
        );
      })}
    </div>
  );
}
export function LoopStreak() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? 6 : 0);
  useEffect(() => { if (reduce) return; const i = setInterval(() => setN((x) => (x >= 7 ? 0 : x + 1)), 600); return () => clearInterval(i); }, [reduce]);
  return (
    <div className="flex h-full flex-col justify-center rounded-[16px] bg-void p-5 text-fg">
      <p className="font-display text-[44px] font-bold leading-none tabular text-pink">{n} day{n === 1 ? "" : "s"}</p>
      <div className="mt-3 flex gap-1.5">{Array.from({ length: 7 }).map((_, k) => <span key={k} className={cn("grid size-8 place-items-center rounded-[9px] transition", k < n ? "bg-pink/20 text-pink" : "bg-white/5 text-white/20")}><Flame className="size-4" /></span>)}</div>
      <p className="mt-2 text-[12px] text-fg-soft">Streak shields save a missed day.</p>
    </div>
  );
}

/* ───────── sticky main button on phones ───────── */
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById("hero-cta");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div aria-hidden={!show} className={cn("fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 transition-[transform,opacity,visibility] duration-300 ease-[cubic-bezier(.22,.8,.24,1)] md:hidden", show ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible translate-y-[140%] opacity-0")}>
      <Link href="/signup" prefetch={false} tabIndex={show ? 0 : -1} className="flex h-14 items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-semibold text-void shadow-[0_12px_30px_-8px_rgb(200_255_61/0.55)] transition active:scale-[0.96]">
        {CTA}<ArrowRight className="size-5" />
      </Link>
    </div>
  );
}
export function FaqList({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
<div className="mt-10 divide-y divide-line border-y border-line">
          {items.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-semibold md:text-[19px]">
                {f.q}<ChevronDown className={cn("size-5 shrink-0 text-fg-soft transition", open === i && "rotate-180 text-lime")} />
              </button>
              <div className={cn("drawer", open === i && "open")}>
                <div><p className="pb-5 text-[15px] leading-relaxed text-fg-soft md:text-[16px]">{f.a}</p></div>
              </div>
            </div>
          ))}
        </div>
  );
}
