"use client";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/** A realistic iPhone drawn in CSS: frame, dynamic island, status bar with the live time. */
export function Phone({ children, className, dark }: { children: React.ReactNode; className?: string; dark?: boolean }) {
  const [time, setTime] = useState("9:41");
  useEffect(() => {
    const f = () => setTime(new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, ""));
    f();
    const t = setInterval(f, 30_000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className={cn("relative mx-auto aspect-[9/19.3] w-[260px] rounded-[46px] bg-[#0b0a08] p-[10px] shadow-[0_40px_80px_-30px_rgb(0_0_0/0.6),inset_0_0_0_2px_#2b2823]", className)}>
      <div className={cn("relative h-full w-full overflow-hidden rounded-[37px]", dark ? "bg-night text-cream" : "bg-cream text-ink")}>
        <div className="absolute inset-x-0 top-0 z-20 flex h-11 items-center justify-between px-7 text-[13px] font-semibold">
          <span suppressHydrationWarning>{time}</span>
          <span className="flex items-center gap-1">
            <svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="1" /><rect x="4.5" y="5" width="3" height="6" rx="1" /><rect x="9" y="2.5" width="3" height="8.5" rx="1" /><rect x="13.5" y="0" width="3" height="11" rx="1" /></svg>
            <svg width="24" height="11" viewBox="0 0 24 11"><rect x=".5" y=".5" width="20" height="10" rx="3" fill="none" stroke="currentColor" opacity=".4" /><rect x="2" y="2" width="15" height="7" rx="1.5" fill="currentColor" /><rect x="21.5" y="3.5" width="1.5" height="4" rx=".7" fill="currentColor" opacity=".4" /></svg>
          </span>
        </div>
        <div className="absolute left-1/2 top-2.5 z-30 h-[26px] w-[86px] -translate-x-1/2 rounded-full bg-black" />
        <div className="h-full pt-11">{children}</div>
      </div>
    </div>
  );
}
