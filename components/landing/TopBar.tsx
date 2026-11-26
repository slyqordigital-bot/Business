"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

/** Floating rounded top bar: logo, 3 links, Log in, the main button. */
export function TopBar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className="fixed inset-x-0 top-[14px] z-40 px-3">
      <nav className={cn("mx-auto flex h-[60px] max-w-[980px] items-center justify-between rounded-[24px] border border-white/[0.09] pl-4 pr-2 backdrop-blur-xl transition-colors duration-300",
        scrolled ? "bg-void/80 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.6)]" : "bg-void/40")}>
        <Link href="/" aria-label="SnackQuest home"><Logo /></Link>
        <div className="hidden items-center gap-7 text-[14px] text-fg-soft md:flex">
          <a href="#how" className="transition hover:text-fg">How it works</a>
          <a href="#features" className="transition hover:text-fg">Features</a>
          <a href="#questions" className="transition hover:text-fg">Questions</a>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="whitespace-nowrap rounded-full px-2.5 py-2 text-[14px] font-medium text-fg-soft transition hover:text-fg sm:px-3.5">Log in</Link>
          <Link href="/signup" className="whitespace-nowrap rounded-full bg-lime px-4 py-2.5 text-[14px] font-semibold text-void transition active:scale-[0.96]" data-testid="topbar-cta"><span className="sm:hidden">Start free</span><span className="hidden sm:inline">Start my Snack Quest</span></Link>
        </div>
      </nav>
    </header>
  );
}
