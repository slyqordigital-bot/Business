"use client";
import { Lock } from "lucide-react";
import { useFunnel } from "@/components/funnel/Funnel";

/** A real preview, blurred, with "Unlock with <next plan>". */
export function Locked({ children, level, planName, reason }: { children: React.ReactNode; level: 1 | 2; planName: string; reason: string }) {
  const funnel = useFunnel();
  return (
    <button type="button" onClick={() => funnel.openUpgrade({ level, reason })} className="relative block w-full overflow-hidden rounded-[20px] text-left">
      <div aria-hidden className="pointer-events-none select-none blur-[7px]">{children}</div>
      <span className="absolute inset-0 flex items-center justify-center gap-2 bg-bg/30 text-[15px] font-semibold"><span className="flex items-center gap-2 rounded-full bg-fg px-4 py-2.5 text-bg shadow-lg"><Lock className="size-4" />Unlock with {planName}</span></span>
    </button>
  );
}
