"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/utils";

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
      <nav className={cn("mx-auto flex h-[60px] max-w-[980px] items-center justify-between rounded-[24px] border border-white/[0.09] pl-4 pr-2 text-cream backdrop-blur-xl transition-colors duration-300",
        scrolled ? "bg-night/80 shadow-[0_10px_40px_-12px_rgb(0_0_0/0.5)]" : "bg-night/40")}>
        <Link href="/" aria-label="MacroSnap home"><Logo dark /></Link>
        <div className="hidden items-center gap-7 text-[14px] text-cream/70 md:flex">
          <a href="#how" className="transition hover:text-cream">How it works</a>
          <a href="#features" className="transition hover:text-cream">Features</a>
          <a href="#questions" className="transition hover:text-cream">Questions</a>
        </div>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="whitespace-nowrap rounded-full px-2.5 py-2 text-[14px] font-medium text-cream/80 transition hover:text-cream sm:px-3.5">Log in</Link>
          <a href="#try" className="whitespace-nowrap rounded-full bg-lime px-4 py-2.5 text-[14px] font-semibold text-night transition active:scale-[0.96]"><span className="sm:hidden">Try it free</span><span className="hidden sm:inline">Snap my macros</span></a>
        </div>
      </nav>
    </header>
  );
}
