"use client";
import { LogoMark } from "@/components/ui/Logo";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 font-display text-[34px] font-bold uppercase">Lag spike.</h1>
        <p className="mt-2 text-fg-soft">Something went wrong on our side. Your points and quests are safe.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-lime px-6 py-3 font-semibold text-void">Try again</button>
      </div>
    </main>
  );
}
