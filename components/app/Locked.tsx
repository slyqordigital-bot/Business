"use client";
import { Lock } from "lucide-react";
import { useFunnel } from "@/components/funnel/Funnel";
import { cn } from "@/lib/utils";

/** A locked part: its real preview blurred, with "Unlock with <next plan>". Tap → the upgrade sheet. */
export function Locked({ children, level, next, className, reason, skip }: { children: React.ReactNode; level: number; next: string | null; className?: string; reason?: string; skip?: boolean }) {
  const funnel = useFunnel();
  if (level >= 3 || !next) return <>{children}</>;
  // skip: the part needs a plan two levels up → the paywall with every higher plan
  const open = () => (skip ? funnel.openPaywall({ title: "Get more from SnackQuest.", line: reason, currentLevel: level }) : funnel.openUpgrade({ level: level as 1 | 2, reason }));
  return (
    <div className={cn("relative", className)}>
      <div className="pointer-events-none select-none blur-[7px]" aria-hidden>{children}</div>
      <button onClick={open} className="absolute inset-0 grid place-items-center rounded-[18px] bg-void/40" data-testid="locked-part">
        <span className="flex items-center gap-2 rounded-full bg-void/85 px-4 py-2 text-[14px] font-semibold ring-1 ring-lime/40"><Lock className="size-4 text-lime" />Unlock with {next}</span>
      </button>
    </div>
  );
}

export function UpgradeButton({ level, reason, children, className }: { level: number; reason?: string; children: React.ReactNode; className?: string }) {
  const funnel = useFunnel();
  if (level >= 3) return null;
  return <button onClick={() => funnel.openUpgrade({ level: level as 1 | 2, reason })} className={className}>{children}</button>;
}
