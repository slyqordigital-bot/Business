import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle } from "lucide-react";
import { sharedRun } from "@/lib/server/shared";
import { Logo } from "@/components/ui/Logo";
import { MainButton } from "@/components/ui/MainButton";
import { KwopFlow } from "@/components/KwopFlow";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ token: string }> }): Promise<Metadata> {
  const r = await sharedRun((await params).token);
  if (!r) return { title: "Snack Quest" };
  return { title: `${r.title} · @${r.tag}`, description: `${r.cleared}/${r.total} quests cleared, ${r.points.toLocaleString("en-US")} points. ${r.game} × ${r.snack} on SnackQuest.` };
}

/** Public page of a shared quest run: brings the next player in. */
export default async function Shared({ params }: { params: Promise<{ token: string }> }) {
  const r = await sharedRun((await params).token);
  if (!r) notFound();
  const RC = { common: "text-cyan", rare: "text-violet", legendary: "text-lime" };
  return (
    <main className="relative min-h-dvh overflow-clip bg-void px-4 py-8">
      <KwopFlow />
      <div className="dot-grid pointer-events-none absolute inset-x-0 top-0 h-[480px] opacity-60" />
      <div className="relative mx-auto max-w-[640px]">
        <Logo />
        <p className="label-mono mt-10 text-cyan">[ @{r.tag} · {r.game} × {r.snack} ]</p>
        <h1 className="title-xl mt-2 text-[44px] md:text-[64px]">{r.title}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-lime px-4 py-1.5 font-display text-[22px] font-bold text-void tabular">{r.points.toLocaleString("en-US")} pts</span>
          <span className="rounded-full px-4 py-1.5 font-display text-[22px] font-bold ring-1 ring-line">{r.cleared}/{r.total} cleared</span>
        </div>
        <ul className="mt-8 space-y-2">
          {r.quests.map((q, i) => (
            <li key={i} className="hud flex items-center gap-3 px-4 py-3">
              {q.done ? <CheckCircle2 className="size-5 text-lime" /> : <Circle className="size-5 text-fg-soft" />}
              <span className={cn("flex-1 font-display text-[19px] font-bold uppercase", !q.done && "text-fg-soft")}>{q.title}</span>
              <span className={cn("label-mono text-[10px]", RC[q.rarity])}>{q.rarity}</span>
            </li>
          ))}
        </ul>
        <div className="hud hud-corners mt-10 p-6 text-center">
          <p className="font-display text-[30px] font-bold uppercase leading-none">Want your own snack quests?</p>
          <p className="mt-2 text-fg-soft">Built for your game and your snack in 60 seconds.</p>
          <div className="mt-5 flex justify-center"><MainButton href="/signup">Start my Snack Quest</MainButton></div>
        </div>
      </div>
    </main>
  );
}
