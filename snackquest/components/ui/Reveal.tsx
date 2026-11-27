"use client";
import { useRef } from "react";
import { useInViewOnce } from "./motionLite";
import { cn } from "@/lib/utils";

/**
 * Rises 14px and fades in once, in 0.5 s (cubic-bezier(.22,.8,.24,1)); Stagger's children follow 60 ms apart.
 * Pure CSS + one IntersectionObserver (no framer-motion on the landing page). Reduced motion: shown at once.
 */
export function Reveal({ children, className, delay = 0, as = "div" }: { children: React.ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const shown = useInViewOnce(ref);
  const Tag = as as "div";
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={cn("reveal", shown && "is-in", className)} style={delay ? { transitionDelay: `${delay}s` } : undefined}>
      {children}
    </Tag>
  );
}

export function Stagger({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const shown = useInViewOnce(ref);
  return <div ref={ref} className={cn("stagger", shown && "is-in", className)}>{children}</div>;
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("reveal-item", className)}>{children}</div>;
}
