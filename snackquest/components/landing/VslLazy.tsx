"use client";
import { useEffect, useRef, useState } from "react";
import { useInViewOnce } from "@/components/ui/motionLite";

type VslComp = (p: { hasVideo?: boolean }) => React.ReactNode;
const Box = () => <div className="hud aspect-[4/5] w-full !rounded-[28px] sm:aspect-video" aria-hidden />;

/**
 * The motion VSL (and framer-motion) load only as the VSL nears the screen, so the hero paints and
 * hydrates light. The placeholder has the same box size: no layout shift.
 */
export function VslLazy({ hasVideo }: { hasVideo?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const near = useInViewOnce(ref, "200px");
  const [Vsl, setVsl] = useState<VslComp | null>(null);
  useEffect(() => {
    if (!near || Vsl) return;
    import("./Vsl").then((m) => setVsl(() => m.Vsl as VslComp)).catch(() => {});
  }, [near, Vsl]);
  return <div ref={ref}>{Vsl ? <Vsl hasVideo={hasVideo} /> : <Box />}</div>;
}
