"use client";
import dynamic from "next/dynamic";

/** The motion VSL loads after the hero (keeps the first paint light); same box size, so no layout shift. */
const Vsl = dynamic(() => import("./Vsl").then((m) => m.Vsl), {
  ssr: false,
  loading: () => <div className="hud aspect-[4/5] w-full !rounded-[28px] sm:aspect-video" aria-hidden />,
});

export function VslLazy({ hasVideo }: { hasVideo?: boolean }) {
  return <Vsl hasVideo={hasVideo} />;
}
