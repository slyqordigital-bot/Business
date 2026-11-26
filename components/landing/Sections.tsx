"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Check, ChevronDown, Clock, Flame, ListChecks, PieChart, ScanLine, Search, Scale, X } from "lucide-react";
import { Phone } from "./Phone";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { MacroRing } from "@/components/ui/MacroRing";
import { CountUp } from "@/components/ui/CountUp";
import { LogoMark } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

function Label({ children, className }: { children: string; className?: string }) {
  return <p className={cn("label-mono text-olive", className)}>[ {children} ]</p>;
}
function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("title-xl mt-4 text-[40px] md:text-[60px]", className)}>{children}</h2>;
}

/* ───────── the problem ───────── */
export function Problem() {
  const items = [
    { icon: Clock, t: "Logging takes forever", d: "Search, scroll, pick, adjust. For every single food. Three meals a day." },
    { icon: Search, t: "The database is a mess", d: "Forty entries for “chicken bowl”, from 88 to 1,240 calories. Which one is yours?" },
    { icon: Flame, t: "So the streak dies", d: "It's not you. When logging is a chore, nobody keeps it up past week one." },
  ];
  return (
    <section className="bg-cream px-4 py-16 text-ink md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><Label>the problem</Label><H2>Counting macros<br /><span className="text-ink-soft">shouldn&apos;t feel like homework.</span></H2></Reveal>
        <Stagger className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
          {items.map(({ icon: I, t, d }) => (
            <StaggerItem key={t} className="recipe-card relative p-6">
              <span className="absolute right-5 top-5 size-3 rounded-full bg-cream ring-1 ring-ink/10" aria-hidden />
              <span className="grid size-11 place-items-center rounded-[14px] bg-tomato/10 text-tomato"><I className="size-5" /></span>
              <h3 className="mt-5 font-serif text-[22px] font-semibold tracking-[-0.02em]">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-ink-soft">{d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ───────── how it works: a phone looping snap → analyze → log ───────── */
const HOW = [
  { icon: Camera, t: "Snap", d: "Take a quick photo of your meal or snack. From above works best." },
  { icon: ScanLine, t: "Analyze", d: "MacroSnap finds each food, estimates the portion and does the math." },
  { icon: ListChecks, t: "Log", d: "Check the breakdown, fix a portion if you want, and save it in one tap." },
];

export function HowItWorks() {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setStep((s) => (s + 1) % 3), 2800);
    return () => clearInterval(t);
  }, [reduce]);
  return (
    <section id="how" className="scroll-mt-20 bg-paper px-4 py-16 text-ink md:py-28">
      <div className="mx-auto grid max-w-[1120px] items-center gap-12 md:grid-cols-2">
        <div>
          <Reveal><Label>how it works</Label><H2>Three taps.<br /><span className="text-ink-soft">That&apos;s the whole log.</span></H2></Reveal>
          <ol className="mt-10 space-y-3">
            {HOW.map(({ icon: I, t, d }, i) => (
              <li key={t}>
                <button onClick={() => setStep(i)} className={cn("flex w-full gap-4 rounded-[20px] p-4 text-left transition", step === i ? "bg-cream shadow-[0_10px_30px_-16px_rgb(29_26_21/0.4)]" : "opacity-60 hover:opacity-90")}>
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-[14px] transition", step === i ? "bg-tomato text-white" : "bg-ink/5")}><I className="size-5" /></span>
                  <span>
                    <span className="font-mono text-[12px] text-ink-soft">0{i + 1}</span>
                    <span className="ml-2 font-serif text-[21px] font-semibold tracking-[-0.02em]">{t}</span>
                    <span className="mt-1 block text-[15px] leading-relaxed text-ink-soft">{d}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <Reveal className="relative">
          <div className="absolute inset-0 -z-0 m-auto size-[340px] rounded-full bg-tomato/15 blur-3xl" />
          <Phone className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={step} className="h-full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }}>
                {step === 0 && <PhoneSnap />}
                {step === 1 && <PhoneScan />}
                {step === 2 && <PhoneLog />}
              </motion.div>
            </AnimatePresence>
          </Phone>
        </Reveal>
      </div>
    </section>
  );
}

function PhoneSnap() {
  return (
    <div className="relative h-full bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/examples/spaghetti.svg" alt="" className="h-[78%] w-full object-cover" />
      <div className="pointer-events-none absolute inset-x-6 top-[14%] h-[52%]">
        {["left-0 top-0 border-l-2 border-t-2", "right-0 top-0 border-r-2 border-t-2", "left-0 bottom-0 border-l-2 border-b-2", "right-0 bottom-0 border-r-2 border-b-2"].map((c) => <span key={c} className={cn("absolute size-6 rounded-sm border-lime", c)} />)}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-[22%] items-center justify-center">
        <span className="grid size-16 place-items-center rounded-full border-4 border-white"><span className="size-12 rounded-full bg-white" /></span>
      </div>
    </div>
  );
}
function PhoneScan() {
  return (
    <div className="h-full bg-night px-4 pt-3 text-cream">
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/examples/spaghetti.svg" alt="" className="h-full w-full object-cover" />
        <div className="animate-scanline absolute inset-x-1 h-[3px] rounded-full bg-lime shadow-[0_0_18px_4px_rgb(200_255_61/0.6)]" />
      </div>
      <p className="mt-4 font-serif text-[18px] font-semibold">Reading your plate…</p>
      <ul className="mt-2 space-y-1.5 text-[12px] text-cream/80">
        {["Finding every food", "Estimating portions", "Adding up macros"].map((s, i) => (
          <li key={s} className="flex items-center gap-2"><span className={cn("grid size-4 place-items-center rounded-full", i < 2 ? "bg-lime text-night" : "bg-white/15")}>{i < 2 && <Check className="size-2.5" strokeWidth={3} />}</span>{s}</li>
        ))}
      </ul>
    </div>
  );
}
function PhoneLog() {
  return (
    <div className="h-full px-4 pt-3">
      <p className="text-[11px] text-ink-soft">Example · spaghetti & meatballs</p>
      <p className="font-serif text-[34px] font-semibold leading-none">780<span className="ml-1 text-[13px] font-normal text-ink-soft">cal</span></p>
      <div className="mt-3 flex justify-between">
        {[["P", 36, 130, "#E5482F"], ["C", 92, 220, "#D9A441"], ["F", 28, 70, "#6B7B3A"]].map(([l, v, g, c]) => (
          <MacroRing key={l as string} value={v as number} goal={g as number} color={c as string} size={62} stroke={6}>
            <span className="text-[12px] font-semibold">{v}g</span>
          </MacroRing>
        ))}
      </div>
      <ul className="mt-3 space-y-1.5 text-[12px]">
        {[["spaghetti", "350 cal"], ["meatballs", "310 cal"], ["tomato sauce", "90 cal"], ["parmesan", "30 cal"]].map(([n, c]) => (
          <li key={n} className="flex justify-between rounded-lg bg-paper px-2.5 py-2"><span>{n}</span><span className="font-mono text-ink-soft">{c}</span></li>
        ))}
      </ul>
      <div className="mt-3 rounded-full bg-tomato py-2.5 text-center text-[13px] font-semibold text-white">Save to today</div>
    </div>
  );
}

/* ───────── the product in action: one short loop per feature ───────── */
export function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-night px-4 py-16 text-cream md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><p className="label-mono text-lime">[ in action ]</p><h2 className="title-xl mt-4 text-[40px] md:text-[60px]">Everything your log needs.<br /><span className="title-fade">Nothing you have to type.</span></h2></Reveal>
        <Stagger className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2">
          <FeatureCard icon={ScanLine} t="Photo recognition" d="Point, snap, done. Every food on the plate is found and named for you."><LoopScan /></FeatureCard>
          <FeatureCard icon={PieChart} t="Macro breakdown" d="Calories, protein, carbs and fat, for the whole plate and for each food."><LoopBars /></FeatureCard>
          <FeatureCard icon={ListChecks} t="Daily history" d="A clean log of every meal, by day. Edit a portion or delete in a tap."><LoopHistory /></FeatureCard>
          <FeatureCard icon={Flame} t="Streak counter" d="See your streak grow and your macros trend over the weeks."><LoopStreak /></FeatureCard>
        </Stagger>
      </div>
    </section>
  );
}
function FeatureCard({ icon: I, t, d, children }: { icon: typeof Camera; t: string; d: string; children: React.ReactNode }) {
  return (
    <StaggerItem className="overflow-hidden rounded-[24px] bg-night-2 ring-1 ring-white/[0.08]">
      <div className="relative h-[220px] overflow-hidden border-b border-white/[0.06] bg-[radial-gradient(ellipse_at_top,rgb(200_255_61/0.08),transparent_70%)]">{children}</div>
      <div className="p-6">
        <div className="flex items-center gap-2.5"><I className="size-5 text-lime" /><h3 className="font-serif text-[22px] font-semibold tracking-[-0.02em]">{t}</h3></div>
        <p className="mt-2 text-[15px] leading-relaxed text-cream/65">{d}</p>
      </div>
    </StaggerItem>
  );
}
function useLoop(n: number, ms: number) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  useEffect(() => { if (reduce) return; const t = setInterval(() => setI((x) => (x + 1) % n), ms); return () => clearInterval(t); }, [n, ms, reduce]);
  return i;
}
function LoopScan() {
  const i = useLoop(4, 1100);
  const pins = [["sourdough toast", 38, 30], ["avocado", 52, 52], ["fried egg", 50, 44], ["cherry tomatoes", 74, 74]] as const;
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative size-[190px] overflow-hidden rounded-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/examples/avocado-toast.svg" alt="" className="h-full w-full object-cover" />
        <div className="animate-scanline absolute inset-x-1 h-[3px] rounded-full bg-lime shadow-[0_0_18px_4px_rgb(200_255_61/0.6)]" />
        {pins.slice(0, i + 1).map(([n, x, y]) => (
          <motion.span key={n} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-cream px-2 py-0.5 text-[10px] font-medium text-ink" style={{ left: `${x}%`, top: `${y}%` }}>{n}</motion.span>
        ))}
      </div>
    </div>
  );
}
function LoopBars() {
  const i = useLoop(2, 2200);
  const v = i ? [0.62, 0.8, 0.45] : [0.35, 0.5, 0.7];
  return (
    <div className="absolute inset-0 flex items-end justify-center gap-6 px-10 pb-8">
      {[["Protein", "#E5482F"], ["Carbs", "#D9A441"], ["Fat", "#6B7B3A"]].map(([n, c], k) => (
        <div key={n} className="flex h-full w-16 flex-col items-center justify-end gap-2 pt-8">
          <motion.div className="w-full rounded-t-xl" style={{ background: c }} animate={{ height: `${v[k] * 100}%` }} transition={{ type: "spring", stiffness: 120, damping: 18 }} />
          <span className="text-[12px] text-cream/60">{n}</span>
        </div>
      ))}
    </div>
  );
}
function LoopHistory() {
  const i = useLoop(3, 1600);
  const rows = [["Breakfast", "avocado toast", "410"], ["Lunch", "chicken bowl", "640"], ["Dinner", "spaghetti", "780"]];
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 px-8">
      {rows.slice(0, i + 1).map(([m, n, c]) => (
        <motion.div key={m} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between rounded-xl bg-white/[0.06] px-4 py-3 text-[13px]">
          <span><span className="text-cream/50">{m} · </span>{n}</span><span className="font-mono text-lime">{c} cal</span>
        </motion.div>
      ))}
    </div>
  );
}
function LoopStreak() {
  const i = useLoop(7, 700);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="flex gap-2">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, k) => (
          <div key={k} className={cn("grid size-9 place-items-center rounded-xl text-[12px] font-semibold transition-colors duration-300", k <= i ? "bg-lime text-night" : "bg-white/[0.06] text-cream/40")}>{d}</div>
        ))}
      </div>
      <p className="font-mono text-[13px] text-cream/70"><Flame className="mr-1 inline size-4 text-tomato" fill="#E5482F" />{i + 1}-day streak</p>
    </div>
  );
}

/* ───────── what changes (true product facts) ───────── */
export function Changes() {
  const stats = [
    { n: 1, s: " photo", l: "is all a meal takes. No typing, no search bar." },
    { n: 3, s: " taps", l: "from opening the app to a saved meal." },
    { n: 0, s: " grams to weigh", l: "Portions are estimated from the photo. Fix one in a tap if you want." },
  ];
  return (
    <section className="bg-cream px-4 py-16 text-ink md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><Label>what changes</Label><H2>Logging goes from a chore<br /><span className="text-ink-soft">to a habit you keep.</span></H2></Reveal>
        <Stagger className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
          {stats.map((x) => (
            <StaggerItem key={x.s} className="recipe-card p-7">
              <p className="font-serif text-[64px] font-semibold leading-none tracking-[-0.04em] text-tomato"><CountUp to={x.n} /><span className="text-[26px] tracking-[-0.02em] text-ink">{x.s}</span></p>
              <p className="mt-4 text-[15px] leading-relaxed text-ink-soft">{x.l}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ───────── comparison with the usual way ───────── */
export function Compare() {
  const rows: [string, string][] = [
    ["Search a database for each food", "Snap one photo of the plate"],
    ["Pick from dozens of look-alike entries", "Every food found and named for you"],
    ["Weigh or guess every portion", "Portions estimated from the photo"],
    ["Type it all again tomorrow", "Your day adds up by itself"],
  ];
  return (
    <section className="bg-paper px-4 py-16 text-ink md:py-28">
      <div className="mx-auto max-w-[920px]">
        <Reveal className="text-center"><Label>the difference</Label><H2>The usual way vs. MacroSnap</H2></Reveal>
        <Reveal className="mt-10 grid gap-3 md:mt-14 md:grid-cols-2">
          <div className="rounded-[24px] border border-ink/10 bg-cream/60 p-6">
            <p className="flex items-center gap-2 font-semibold text-ink-soft"><Scale className="size-5" />The usual way</p>
            <ul className="mt-4 space-y-3">{rows.map(([a]) => <li key={a} className="flex gap-3 text-[15px] text-ink-soft"><X className="mt-0.5 size-[18px] shrink-0 text-tomato/70" />{a}</li>)}</ul>
          </div>
          <div className="rounded-[24px] bg-night p-6 text-cream shadow-[0_30px_60px_-30px_rgb(20_18_14/0.6)]">
            <p className="flex items-center gap-2 font-semibold"><LogoMark className="size-6" />MacroSnap</p>
            <ul className="mt-4 space-y-3">{rows.map(([, b]) => <li key={b} className="flex gap-3 text-[15px]"><Check className="mt-0.5 size-[18px] shrink-0 text-lime" strokeWidth={2.5} />{b}</li>)}</ul>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── questions ───────── */
const QUESTIONS = [
  { q: "How accurate is it?", a: "MacroSnap estimates portions from your photo and uses USDA nutrition data. For most plates it lands close to a careful manual log, without the 10 minutes. Sauces and oils hidden under food are the hardest part, so you can fix any portion in one tap." },
  { q: "Does it work for restaurant and takeout food?", a: "Yes. Burrito bowls, pizza, sushi, a diner breakfast: if you can see it, MacroSnap can read it. It even adds the dressing and oil it can see." },
  { q: "Where do my photos go?", a: "Your photos are stored privately in your account. Only you can see them. Delete a meal and its photo is deleted too. Delete your account and everything goes." },
  { q: "Will it work with my diet?", a: "Yes. Keto, high-protein, cutting, bulking, or just eating better: set your own daily calorie and macro goals and MacroSnap tracks against them." },
  { q: "How much does it cost?", a: "You try it free first. The plans show up once your first macros are ready." },
  { q: "Is this medical advice?", a: "No. MacroSnap gives nutrition estimates to help you track. For medical diets, talk to your doctor or a registered dietitian." },
];
export function Questions() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="questions" className="scroll-mt-20 bg-cream px-4 py-16 text-ink md:py-28">
      <div className="mx-auto max-w-[760px]">
        <Reveal className="text-center"><Label>questions</Label><H2>Good questions.</H2></Reveal>
        <Reveal className="mt-10 divide-y divide-ink/10 border-y border-ink/10">
          {QUESTIONS.map((f, i) => (
            <div key={f.q}>
              <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} className="flex w-full items-center justify-between gap-4 py-5 text-left font-serif text-[19px] font-semibold tracking-[-0.01em] md:text-[21px]">
                {f.q}<ChevronDown className={cn("size-5 shrink-0 transition", open === i && "rotate-180")} />
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden pb-5 text-[16px] leading-relaxed text-ink-soft">{f.a}</motion.p>
                )}
              </AnimatePresence>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── final block ───────── */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-night px-4 py-20 text-center text-cream md:py-32">
      <div className="dot-grid absolute inset-0" />
      <div className="absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-tomato/25 blur-[100px]" />
      <Reveal className="relative mx-auto max-w-[760px]">
        <p className="label-mono text-lime">[ tonight ]</p>
        <h2 className="title-xl mt-4 text-[44px] md:text-[72px]">Snap dinner tonight.<br /><span className="title-fade">Know your macros in seconds.</span></h2>
        <a href="#try" className="group relative isolate mt-10 inline-flex h-[64px] items-center gap-4 rounded-full bg-lime pl-7 pr-2.5 text-[17px] font-semibold text-night transition active:scale-[0.955]">
          <span className="absolute inset-0 -z-10 rounded-full bg-lime blur-xl animate-breathe" />
          Snap my macros
          <span className="grid size-[46px] place-items-center rounded-full bg-night text-lime"><Camera className="size-5" /></span>
        </a>
        <p className="mt-5 font-mono text-[12px] uppercase tracking-[0.18em] text-cream/50">Free to try · No account needed</p>
      </Reveal>
    </section>
  );
}

/* ───────── footer with the giant wordmark ───────── */
export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-night px-4 pt-14 text-cream">
      <div className="mx-auto grid max-w-[1120px] gap-10 border-t border-white/10 pt-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2"><LogoMark /><span className="font-serif text-[19px] font-semibold">MacroSnap</span></Link>
          <p className="mt-3 max-w-xs text-[14px] text-cream/55">Snap your meal, track your macros instantly.</p>
        </div>
        <div className="space-y-2.5 text-[14px] text-cream/70">
          <p className="label-mono text-cream/40">Product</p>
          <a href="#how" className="block hover:text-cream">How it works</a>
          <a href="#features" className="block hover:text-cream">Features</a>
          <a href="#questions" className="block hover:text-cream">Questions</a>
        </div>
        <div className="space-y-2.5 text-[14px] text-cream/70">
          <p className="label-mono text-cream/40">Account</p>
          <Link href="/login" className="block hover:text-cream">Log in</Link>
          <Link href="/terms" className="block hover:text-cream">Terms</Link>
          <Link href="/privacy" className="block hover:text-cream">Privacy</Link>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-[1120px] text-[12px] text-cream/40">© {new Date().getFullYear()} MacroSnap. Nutrition values are estimates, not medical advice.</p>
      <div aria-hidden className="pointer-events-none mt-4 select-none text-center font-serif font-semibold leading-[0.8] tracking-[-0.06em] text-cream"
        style={{ fontSize: "clamp(72px, 19vw, 280px)", opacity: 0.13, maskImage: "linear-gradient(180deg,#000 20%,transparent 95%)", WebkitMaskImage: "linear-gradient(180deg,#000 20%,transparent 95%)" }}>
        MacroSnap
      </div>
    </footer>
  );
}

/* ───────── sticky main button on phones ───────── */
export function StickyCta() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = document.getElementById("try");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <AnimatePresence>
      {show && (
        <motion.a href="#try" initial={{ y: 90 }} animate={{ y: 0 }} exit={{ y: 90 }} transition={{ type: "spring", stiffness: 400, damping: 34 }}
          className="fixed inset-x-3 bottom-[max(12px,env(safe-area-inset-bottom))] z-30 flex h-14 items-center justify-center gap-2 rounded-full bg-tomato text-[16px] font-semibold text-white shadow-[0_12px_30px_-8px_rgb(229_72_47/0.7)] md:hidden">
          <Camera className="size-5" />Snap my macros
        </motion.a>
      )}
    </AnimatePresence>
  );
}
