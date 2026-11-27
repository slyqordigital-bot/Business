"use client";
import { useEffect } from "react";
import { useFunnel } from "@/components/funnel/Funnel";
import { Logo } from "@/components/ui/Logo";

export function PricingClient({ level }: { level: number }) {
  const funnel = useFunnel();
  useEffect(() => {
    funnel.openPaywall(level ? { title: "Get more from SnackQuest.", line: "More quests, a bigger points boost, more linked games.", currentLevel: level } : { title: "Your Snack Quest is ready.", line: "Pick a plan to unlock every quest and start earning points." });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="grid min-h-[60dvh] place-items-center px-6 text-center">
      <div><Logo /><button onClick={() => funnel.openPaywall({ title: "Pick your plan.", currentLevel: level })} className="mt-6 block rounded-full bg-lime px-6 py-3 font-semibold text-void">See plans</button></div>
    </div>
  );
}
