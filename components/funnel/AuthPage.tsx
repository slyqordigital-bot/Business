"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { AuthForm } from "./AuthForm";
import { tryStore } from "@/lib/client";

/** /signup and /login: a centered card on a calm background. A try made before is attached at once. */
export function AuthPage({ mode }: { mode: "signup" | "login" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") && sp.get("next")!.startsWith("/") ? sp.get("next")! : "/today";
  const [pending, setPending] = useState(false);
  useEffect(() => setPending(Boolean(tryStore.get())), []);

  async function done() {
    const t = tryStore.get();
    const r = await fetch("/api/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tryId: t?.id ?? null, tz: new Date().getTimezoneOffset() }) })
      .then((x) => x.json()).catch(() => null);
    if (r?.mealId) { tryStore.clear(); router.replace(`/meal/${r.mealId}?paywall=1`); return; }
    router.replace(next);
    router.refresh();
  }

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-cream px-4 py-10 text-ink">
      <div className="pointer-events-none absolute left-1/2 top-[-160px] h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(229_72_47/0.16),transparent)]" />
      <div className="relative w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <div className="recipe-card p-6 shadow-[0_30px_60px_-30px_rgb(29_26_21/0.35)] sm:p-8">
          <h1 className="font-serif text-[28px] font-semibold leading-tight tracking-[-0.03em]">
            {mode === "signup" ? (pending ? "Save this meal to your log" : "Sign up so MacroSnap can read your plates") : "Welcome back"}
          </h1>
          <p className="mb-6 mt-1.5 text-[15px] text-ink-soft">{mode === "signup" ? "Free account. No card needed." : "Log in to see today's macros."}</p>
          <AuthForm mode={mode} onDone={done} next={next} />
        </div>
      </div>
    </main>
  );
}
