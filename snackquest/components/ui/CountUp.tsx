"use client";
import { useEffect, useRef, useState } from "react";
import { useInViewOnce } from "./motionLite";

/** Counts up in 1.3 s (ease-out) once visible; shows the final number at once with reduced motion. */
export function CountUp({ to, decimals = 0, prefix = "", suffix = "", className, duration = 1300 }: { to: number; decimals?: number; prefix?: string; suffix?: string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInViewOnce(ref, "0px");
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setV(to); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);
  const fmt = v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>{prefix}{fmt}{suffix}</span>;
}
