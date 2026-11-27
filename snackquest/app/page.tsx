import fs from "node:fs";
import path from "node:path";
import { TopBar } from "@/components/landing/TopBar";
import { NotifPhone } from "@/components/landing/NotifPhone";
import { VslLazy as Vsl } from "@/components/landing/VslLazy";
import { Problem, HowItWorks, Features, Changes, Compare, Questions, FinalCta, Footer, StickyCta } from "@/components/landing/Sections";
import { MainButton } from "@/components/ui/MainButton";
import { KwopFlow } from "@/components/KwopFlow";

export default function Home() {
  const hasVideo = fs.existsSync(path.join(process.cwd(), "public", "vsl.mp4"));
  return (
    <main className="bg-void">
      <KwopFlow />
      <TopBar />
      <section className="relative overflow-clip px-4 pb-14 pt-[108px] md:pb-24 md:pt-[150px]">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[480px] w-[860px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.45),rgb(34_225_255/0.12),transparent)]" />
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-12 md:grid-cols-[1.15fr_1fr] md:gap-8">
          <div className="text-center md:text-left">
            <p className="label-mono text-cyan">[ snacks × games × rewards ]</p>
            <h1 className="title-xl mt-5 text-[46px] sm:text-[60px] md:text-[80px]">
              Snack. Play.<br /><span className="text-neon">Unlock real gear.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[520px] text-[17px] leading-relaxed text-fg-soft md:mx-0 md:text-[19px]">
              Turn your <b className="font-semibold text-fg">snack breaks</b> into quests and your <b className="font-semibold text-fg">playtime</b> into points you trade for gift cards and gaming gear.
            </p>
            <div id="hero-cta" className="mt-8 flex justify-center md:justify-start">
              <MainButton href="/signup" data-testid="hero-cta">Start my Snack Quest</MainButton>
            </div>
            <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.1em] text-fg-soft sm:text-[12px] sm:tracking-[0.16em]">Free to start · No card · <span className="whitespace-nowrap">Ready in 60 s</span></p>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute left-1/2 top-1/2 size-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(200_255_61/0.18),transparent)]" />
            <NotifPhone />
          </div>
        </div>
      </section>
      <section className="px-4 pb-16 md:pb-28">
        <div className="mx-auto max-w-[1000px]">
          <Vsl hasVideo={hasVideo} />
        </div>
      </section>
      <Problem />
      <HowItWorks />
      <Features />
      <Changes />
      <Compare />
      <Questions />
      <FinalCta />
      <Footer />
      <StickyCta />
    </main>
  );
}
