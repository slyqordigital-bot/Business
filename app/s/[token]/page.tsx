import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sharedMeal } from "@/lib/server/shared-meal";
import { Logo } from "@/components/ui/Logo";
import { MainButton } from "@/components/ui/MainButton";
import { KwopFlow } from "@/components/KwopFlow";

type P = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const m = await sharedMeal((await params).token);
  if (!m) return { title: "MacroSnap" };
  return { title: `${m.kcal} cal · ${m.name}`, description: `${m.protein}g protein, ${m.carbs}g carbs, ${m.fat}g fat — from one photo with MacroSnap.` };
}

export default async function Shared({ params }: P) {
  const m = await sharedMeal((await params).token);
  if (!m) notFound();
  return (
    <main className="relative min-h-dvh overflow-hidden bg-night px-4 py-10 text-cream">
      <KwopFlow />
      <div className="dot-grid absolute inset-0" />
      <div className="relative mx-auto max-w-[520px]">
        <Logo dark />
        <div className="mt-10 rounded-[28px] bg-cream p-6 text-ink sm:p-8">
          <p className="label-mono text-olive">[ snapped with macrosnap ]</p>
          <h1 className="mt-2 font-serif text-[34px] font-semibold leading-tight tracking-[-0.03em] first-letter:uppercase">{m.name}</h1>
          <p className="mt-4 font-serif text-[64px] font-semibold leading-none tracking-[-0.04em]">{m.kcal}<span className="ml-2 text-[18px] font-normal text-ink-soft">cal</span></p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {[["Protein", m.protein, "#E5482F"], ["Carbs", m.carbs, "#D9A441"], ["Fat", m.fat, "#6B7B3A"]].map(([l, v, c]) => (
              <div key={l as string} className="rounded-xl p-3" style={{ background: `${c}1f` }}><div className="text-[12px] text-ink-soft">{l}</div><div className="font-serif text-[26px] font-semibold" style={{ color: c as string }}>{v}g</div></div>
            ))}
          </div>
          <ul className="mt-5 flex flex-wrap gap-1.5">{m.foods.map((f, i) => <li key={i} className="rounded-full bg-paper px-2.5 py-1 text-[13px]">{f}</li>)}</ul>
        </div>
        <div className="mt-10 text-center">
          <p className="font-serif text-[28px] font-semibold tracking-[-0.02em]">Your turn. Snap your plate.</p>
          <MainButton href="/" tone="lime" className="mt-5">Snap my macros</MainButton>
        </div>
      </div>
    </main>
  );
}
