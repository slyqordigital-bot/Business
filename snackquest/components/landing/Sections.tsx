import Link from "next/link";
import { Check, Flame, Gift, Headphones, Link2, Package, Swords, Timer, X } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/ui/Reveal";
import { MainButton } from "@/components/ui/MainButton";
import { CountUp } from "@/components/ui/CountUp";
import { LogoMark } from "@/components/ui/Logo";
import { Phone } from "./Phone";
import { ConnectScreen, SnackScreen, CollectScreen, LoopSync, LoopQuests, LoopShop, LoopStreak, FaqList } from "./LandingClient";
import { cn } from "@/lib/utils";
import { steamReady } from "@/lib/steam";

export { StickyCta } from "./LandingClient";

const CTA = "Start my Snack Quest";

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("label-mono", className)}>[ {children} ]</p>;
}
function H2({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("title-xl text-[40px] md:text-[64px]", className)}>{children}</h2>;
}

/* ───────── the problem (light) ───────── */
export function Problem() {
  const items = [
    { icon: Headphones, big: "$129", t: "Gaming gear is too expensive", d: "A good headset costs more than most games. A controller, a keyboard… it adds up fast." },
    { icon: Package, big: "3 bags", t: "Snacking while playing feels like a waste", d: "You eat chips through every session. Nothing to show for it but crumbs on the desk." },
    { icon: Timer, big: "4h", t: "No motivation during long grinds", d: "The same queue, the same match, again. Long sessions need a little side quest." },
  ];
  return (
    <section className="light px-4 py-16 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><Label className="text-violet">the problem</Label></Reveal>
        <Reveal delay={0.05}><H2 className="mt-3 max-w-[820px]">You already snack and play. <span className="title-fade">You just don&apos;t get anything for it.</span></H2></Reveal>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {items.map(({ icon: I, big, t, d }) => (
            <StaggerItem key={t} className="rounded-[20px] border border-line bg-surface p-6 shadow-[0_20px_50px_-30px_rgb(14_11_24/0.25)]">
              <div className="flex items-center justify-between"><I className="size-6 text-violet" /><span className="font-display text-[34px] font-bold text-ink/90">{big}</span></div>
              <h3 className="mt-6 text-[19px] font-semibold leading-snug">{t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-fg-soft">{d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { n: "01", t: "Connect", d: steamReady() ? "Link your gaming profile in one tap. Steam syncs playtime by itself; console and Epic games use the session timer." : "Add the games you play in one tap. The session timer turns every minute you play into points, on any platform.", s: <ConnectScreen /> },
    { n: "02", t: "Snack & Play", d: "Accept funny food challenges while you queue. Snap your snack to prove it, and the AI referee checks it in seconds.", s: <SnackScreen /> },
    { n: "03", t: "Collect", d: "Trade your points in the Reward Shop for gift cards and gear, then track every reward until it reaches you.", s: <CollectScreen /> },
  ];
  return (
    <section id="how" className="scroll-mt-20 px-4 py-16 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><Label className="text-cyan">how it works</Label></Reveal>
        <Reveal delay={0.05}><H2 className="mt-3">Three steps. <span className="title-fade">Zero extra effort.</span></H2></Reveal>
        <Stagger className="mt-12 grid gap-10 md:grid-cols-3 md:gap-6">
          {steps.map((s) => (
            <StaggerItem key={s.n} className="text-center md:text-left">
              <Phone dark className="w-[230px] md:mx-0">{s.s}</Phone>
              <p className="label-mono mt-6 text-lime">step {s.n}</p>
              <h3 className="mt-1 font-display text-[30px] font-bold uppercase leading-none">{s.t}</h3>
              <p className="mx-auto mt-2 max-w-[340px] text-[15px] leading-relaxed text-fg-soft md:mx-0">{s.d}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

export function Features() {
  const f = [
    { t: "Game Sync", d: steamReady() ? "Connect your favorite titles. Steam playtime syncs on its own; every other platform counts with a tap-to-start session timer." : "Add your favorite titles and tap Start playing. The session timer counts your playtime on PC, console or mobile.", v: <LoopSync />, icon: Link2 },
    { t: "Snack Quests", d: "Daily food-themed achievements written for your game and your snack. Prove each one with a single photo.", v: <LoopQuests />, icon: Swords },
    { t: "Reward Shop", d: "Redeem gift cards and gaming gear with the points you earned. Track each reward from request to your door.", v: <LoopShop />, icon: Gift },
    { t: "Streak Tracker", d: "Keep your gaming appetite high: one quest a day keeps the flame alive, and shields cover a missed night.", v: <LoopStreak />, icon: Flame },
  ];
  return (
    <section id="features" className="light scroll-mt-20 px-4 py-16 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><Label className="text-violet">in action</Label></Reveal>
        <Reveal delay={0.05}><H2 className="mt-3">Built for the grind. <span className="title-fade">And the snacks.</span></H2></Reveal>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-2">
          {f.map(({ t, d, v, icon: I }) => (
            <StaggerItem key={t} className="grid gap-5 rounded-[22px] border border-line bg-surface p-5 shadow-[0_20px_50px_-30px_rgb(14_11_24/0.25)] sm:grid-cols-[1fr_200px]">
              <div>
                <span className="grid size-10 place-items-center rounded-[12px] bg-violet/10 text-violet"><I className="size-5" /></span>
                <h3 className="mt-4 font-display text-[28px] font-bold uppercase leading-none">{t}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-fg-soft">{d}</p>
              </div>
              <div className="dark-scope h-[190px]">{v}</div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

/* ───────── what changes (dark, true numbers) ───────── */
export function Changes() {
  const stats = [
    { n: 60, suf: " sec", t: "From sign-up to your first quest" },
    { n: 3000, suf: " pts", t: "For a $10 gift card in the Reward Shop" },
    { n: 1, suf: " photo", t: "Proves a quest. No forms, no receipts" },
  ];
  return (
    <section className="px-4 py-16 md:py-28">
      <div className="mx-auto max-w-[1120px]">
        <Reveal><Label className="text-cyan">what changes</Label></Reveal>
        <Reveal delay={0.05}><H2 className="mt-3 max-w-[860px]">Earn points automatically. <span className="title-fade">Turn snacks into quests. Unlock real gear.</span></H2></Reveal>
        <Stagger className="mt-10 grid gap-4 md:grid-cols-3">
          {stats.map((s) => (
            <StaggerItem key={s.t} className="hud hud-corners p-6">
              <p className="font-display text-[56px] font-bold leading-none text-lime"><CountUp to={s.n} suffix={s.suf} /></p>
              <p className="mt-3 text-[15px] text-fg-soft">{s.t}</p>
            </StaggerItem>
          ))}
        </Stagger>
        <p className="mt-6 text-[13px] text-fg-soft">Point costs are the Reward Shop&apos;s current prices. Rewards are redeemed with points only.</p>
      </div>
    </section>
  );
}

/* ───────── comparison (light) ───────── */
export function Compare() {
  const rows: [string, string, string][] = [
    ["Your snack breaks", "Just snacks", "Quests worth points"],
    ["Hours of playtime", "Nothing to show", "Points every session"],
    ["New gear", "Paid full price", "Redeemed with points"],
    ["Long grind sessions", "Same old queue", "A streak to keep alive"],
    ["Your first reward", "Never comes", "$10 card at 3,000 pts"],
  ];
  return (
    <section className="light px-4 py-16 md:py-28">
      <div className="mx-auto max-w-[920px]">
        <Reveal><Label className="text-violet">the usual way</Label></Reveal>
        <Reveal delay={0.05}><H2 className="mt-3">Same snacks. <span className="title-fade">Way more loot.</span></H2></Reveal>
        <Reveal delay={0.1} className="mt-10 overflow-hidden rounded-[22px] border border-line bg-surface">
          <div className="grid grid-cols-[1.1fr_1fr_1fr] border-b border-line bg-surface-2 px-4 py-3 text-[13px] font-semibold md:px-6">
            <span />
            <span className="text-fg-soft">The usual way</span>
            <span className="flex items-center gap-1.5"><LogoMark className="size-5" />SnackQuest</span>
          </div>
          {rows.map(([a, b, c]) => (
            <div key={a} className="grid grid-cols-[1.1fr_1fr_1fr] items-center gap-2 border-b border-line px-4 py-4 text-[14px] last:border-0 md:px-6 md:text-[15px]">
              <span className="font-semibold">{a}</span>
              <span className="flex items-center gap-1.5 text-fg-soft"><X className="size-4 shrink-0 text-pink" />{b}</span>
              <span className="flex items-center gap-1.5"><Check className="size-4 shrink-0 text-[#5b8a00]" strokeWidth={3} />{c}</span>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

/* ───────── questions (dark) ───────── */
const FAQ = () => [
  { q: "Does it work with my games?", a: steamReady()
    ? "Yes. Quests work with any game on any platform, because you prove them with a photo of your snack and your screen. Steam games sync playtime automatically. For console, Epic and mobile games, a website can't read your playtime, so you tap the session timer when you start playing."
    : "Yes. Quests work with any game on any platform, because you prove them with a photo of your snack and your screen. A website can't read your console or PC directly, so you tap the session timer when you start playing and it counts your minutes." },
  { q: "Are the rewards real?", a: "Yes. The Reward Shop has gift cards and gaming gear. When you redeem, your points are held right away and the SnackQuest team sends your reward: gift-card codes by email, gear shipped to your US address. You track the status in the app." },
  { q: "How much does it cost?", a: "You try it free first. The plans show up once your first Snack Quest is ready." },
  { q: "Do I have to eat a lot?", a: "No. Quests are about one normal snack, timing and fun, not eating more. Healthy snacks earn the same points, and energy-drink quests stay at one can with water breaks." },
  { q: "How does the photo check work?", a: "You snap one photo of the snack with your game screen or setup. Our AI referee checks it in a few seconds and tells you exactly what to add if something's missing." },
  { q: "Is SnackQuest made by a game company?", a: "No. SnackQuest is an independent app and isn't affiliated with Epic, Valve, Riot, Microsoft or any game publisher." },
];
export function Questions() {
  return (
    <section id="questions" className="scroll-mt-20 px-4 py-16 md:py-28">
      <div className="mx-auto max-w-[820px]">
        <Reveal><Label className="text-cyan">questions</Label></Reveal>
        <Reveal delay={0.05}><H2 className="mt-3">Before you press start.</H2></Reveal>
        <FaqList items={FAQ()} />
      </div>
    </section>
  );
}
/* ───────── final block ───────── */
export function FinalCta() {
  return (
    <section className="relative overflow-clip px-4 py-20 md:py-32">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.16),rgb(139_92_246/0.18),transparent)]" />
      <Reveal className="relative mx-auto max-w-[820px] text-center">
        <Label className="text-lime">tonight</Label>
        <H2 className="mt-4">One pizza. One match. <span className="text-neon">Your first +100.</span></H2>
        <p className="mx-auto mt-5 max-w-[520px] text-[17px] text-fg-soft">Build your Snack Quest now and clear quest #1 in your next session.</p>
        <div className="mt-9 flex justify-center"><MainButton href="/signup" data-testid="final-cta">{CTA}</MainButton></div>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-soft sm:text-[12px] sm:tracking-[0.16em]">Free to start · No card · <span className="whitespace-nowrap">Ready in 60 s</span></p>
      </Reveal>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative overflow-clip border-t border-line bg-night px-4 pt-14">
      <div className="mx-auto grid max-w-[1120px] gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2"><LogoMark /><span className="font-display text-[21px] font-bold uppercase">SnackQuest</span></Link>
          <p className="mt-3 max-w-xs text-[14px] text-fg-soft">Made for gamers who love snacks.</p>
        </div>
        <div className="space-y-2.5 text-[14px] text-fg-soft">
          <p className="label-mono text-fg-soft">Product</p>
          <a href="#how" className="block hover:text-fg">How it works</a>
          <a href="#features" className="block hover:text-fg">Features</a>
          <a href="#questions" className="block hover:text-fg">Questions</a>
        </div>
        <div className="space-y-2.5 text-[14px] text-fg-soft">
          <p className="label-mono text-fg-soft">Account</p>
          <Link href="/login" prefetch={false} className="block hover:text-fg">Log in</Link>
          <Link href="/terms" prefetch={false} className="block hover:text-fg">Terms</Link>
          <Link href="/privacy" prefetch={false} className="block hover:text-fg">Privacy</Link>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-[1120px] text-[12px] text-fg-soft">© {new Date().getFullYear()} SnackQuest. Not affiliated with any game publisher. Game names belong to their owners.</p>
      <div aria-hidden className="pointer-events-none mt-8 select-none md:mt-4 text-center font-display font-bold uppercase leading-[0.8] text-fg"
        style={{ fontSize: "clamp(64px, 17vw, 260px)", opacity: 0.13, maskImage: "linear-gradient(180deg,#000 20%,transparent 95%)", WebkitMaskImage: "linear-gradient(180deg,#000 20%,transparent 95%)" }}>
        SnackQuest
      </div>
    </footer>
  );
}

