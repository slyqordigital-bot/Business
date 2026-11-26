"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { tryStore } from "@/lib/client";

function Welcome() {
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const t = tryStore.get();
    const next = sp.get("next")?.startsWith("/") ? sp.get("next")! : "/today";
    fetch("/api/claim", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tryId: t?.id ?? null, tz: new Date().getTimezoneOffset() }) })
      .then((r) => r.json()).catch(() => null)
      .then((r) => {
        if (r?.mealId) { tryStore.clear(); router.replace(`/meal/${r.mealId}?paywall=1`); }
        else router.replace(next);
      });
  }, [router, sp]);
  return (
    <main className="grid min-h-dvh place-items-center bg-cream text-ink">
      <div className="w-64 space-y-3"><div className="skeleton h-6 w-40" /><div className="skeleton h-40" /></div>
    </main>
  );
}
export default function Page() { return <Suspense><Welcome /></Suspense>; }
