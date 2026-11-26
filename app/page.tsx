import fs from "node:fs";
import path from "node:path";
import { TopBar } from "@/components/landing/TopBar";
import { Scanner } from "@/components/landing/Scanner";
import { Vsl } from "@/components/landing/Vsl";
import { Problem, HowItWorks, Features, Changes, Compare, Questions, FinalCta, Footer, StickyCta } from "@/components/landing/Sections";
import { KwopFlow } from "@/components/KwopFlow";

export default function Home() {
  const hasVideo = fs.existsSync(path.join(process.cwd(), "public", "vsl.mp4"));
  return (
    <main className="bg-night">
      <KwopFlow />
      <TopBar />
      <section className="relative overflow-hidden px-4 pb-14 pt-[104px] text-cream md:pb-24 md:pt-[150px]">
        <div className="dot-grid pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute left-1/2 top-[-120px] h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(229_72_47/0.35),rgb(217_164_65/0.12),transparent)] blur-2xl" />
        <div className="relative mx-auto max-w-[880px] text-center">
          <p className="label-mono text-lime/90">[ ai macro tracker ]</p>
          <h1 className="title-xl mt-5 text-[42px] sm:text-[56px] md:text-[78px]">
            Snap your plate.<br /><span className="title-fade">Get your macros.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-cream/70 md:text-[19px]">
            Track a <b className="font-semibold text-cream">500-calorie lunch in 2 seconds</b>, without typing anything. Calories, protein, carbs and fat from one photo.
          </p>
        </div>
        <div className="relative mx-auto mt-9 max-w-[880px] md:mt-12">
          <Scanner />
          <p className="mt-5 text-center font-mono text-[12px] uppercase tracking-[0.16em] text-cream/45">Free to try · No account · Ready in seconds</p>
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
