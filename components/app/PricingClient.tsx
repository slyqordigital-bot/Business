"use client";
import { useEffect } from "react";
import { useFunnel } from "@/components/funnel/Funnel";
import { Logo } from "@/components/ui/Logo";

export function PricingClient({ level }: { level: number }) {
  const funnel = useFunnel();
  useEffect(() => {
    funnel.openPaywall(level ? { title: "Get more from MacroSnap.", line: "Pick the plan that fits how you eat.", currentLevel: level } : { title: "Your macros are waiting.", line: "Pick a plan to unlock every meal you snap." });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 text-center">
      <div><Logo /><button onClick={() => funnel.openPaywall({ title: "Pick your plan.", currentLevel: level })} className="mt-6 block rounded-full bg-tomato px-6 py-3 font-semibold text-white">See plans</button></div>
    </div>
  );
}
