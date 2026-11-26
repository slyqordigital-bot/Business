"use client";
import { LogoMark } from "@/components/ui/Logo";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
      <div>
        <LogoMark className="mx-auto size-12" />
        <h1 className="mt-6 font-serif text-[30px] font-semibold tracking-[-0.03em]">Something went wrong.</h1>
        <p className="mt-2 text-fg-soft">Your meals are safe. Try again in a moment.</p>
        <button onClick={reset} className="mt-6 rounded-full bg-tomato px-6 py-3 font-semibold text-white">Try again</button>
      </div>
    </main>
  );
}
