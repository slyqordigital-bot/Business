"use client";
import { useEffect, useState, type RefObject } from "react";

/** prefers-reduced-motion, without framer-motion (keeps the landing page light). */
export function useReducedMotionLite() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const f = () => setReduce(mq.matches);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);
  return reduce;
}

/** True once the element has scrolled into view (stays true). */
export function useInViewOnce(ref: RefObject<Element | null>, rootMargin = "-60px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") { setSeen(true); return; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect(); } }, { rootMargin: `0px 0px ${rootMargin} 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin, seen]);
  return seen;
}
