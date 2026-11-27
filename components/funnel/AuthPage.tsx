"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { AuthForm } from "./AuthForm";

/** /signup and /login: a centered HUD card on a calm dark background. After sign-up: straight into the personal flow. */
export function AuthPage({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") && sp.get("next")!.startsWith("/") ? sp.get("next")! : mode === "signup" ? "/start" : "/dashboard";

  async function done() {
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tz: new Date().getTimezoneOffset(), signup: mode === "signup" }) }).catch(() => null);
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-clip bg-void px-4 py-10">
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-70" />
      <div className="pointer-events-none absolute left-1/2 top-[-200px] h-[460px] w-[760px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(139_92_246/0.35),transparent)]" />
      <div className="relative w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <div className="hud hud-corners p-6 sm:p-8">
          <p className="label-mono text-cyan">{mode === "signup" ? "[ player 1 ]" : "[ continue ]"}</p>
          <h1 className="mt-2 font-display text-[30px] font-bold uppercase leading-[1.02]">
            {mode === "signup" ? "Sign up so SnackQuest can build your quest" : "Welcome back, player"}
          </h1>
          <p className="mb-6 mt-2 text-[15px] text-fg-soft">{mode === "signup" ? "Free account. No card. Your first quest in 60 seconds." : "Log in to pick up your streak."}</p>
          <AuthForm mode={mode} onDone={done} next={next} />
        </div>
      </div>
    </main>
  );
}
