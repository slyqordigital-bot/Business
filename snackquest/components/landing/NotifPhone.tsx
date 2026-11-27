"use client";
import { useEffect, useState } from "react";
import { Camera, Flashlight } from "lucide-react";
import { Phone } from "./Phone";
import { LogoMark } from "@/components/ui/Logo";
import { useReducedMotionLite } from "@/components/ui/motionLite";

/** Example notifications (example values only). */
const NOTIFS = [
  { title: "Quest cleared: Crust Shield", body: "Pizza slice + Victory Royale screen. +120 pts" },
  { title: "Fortnite session synced", body: "48 min counted · +10 pts" },
  { title: "Streak: 6 days", body: "One quest tonight keeps it alive." },
  { title: "Reward unlocked: Pro Gaming Headset", body: "Redeemed with points. Tracking soon." },
  { title: "New legendary quest", body: "Chip Clutch: one chip per round you win." },
  { title: "+200 pts this week", body: "You're 1,240 pts from your controller." },
];

function useClock() {
  const [t, setT] = useState({ time: "9:41", date: "Thursday, November 26" });
  useEffect(() => {
    const f = () => {
      const d = new Date();
      setT({
        time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/, ""),
        date: d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }),
      });
    };
    f();
    const i = setInterval(f, 30_000);
    return () => clearInterval(i);
  }, []);
  return t;
}

/**
 * The magic moment: a lock screen where SnackQuest notifications slide in with Kwop's timings
 * (0 / 0.9 / 1.8 s, then one every 2.6 s; 3 visible on a computer, 2 on a phone; older ones dim, "now" → "1m ago").
 */
export function NotifPhone() {
  const reduce = useReducedMotionLite();
  const clock = useClock();
  const [items, setItems] = useState<{ id: number; n: (typeof NOTIFS)[number]; at: number; fresh?: boolean }[]>([]);
  const [max, setMax] = useState(3);
  const [now, setNow] = useState(0);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const f = () => setMax(mq.matches ? 2 : 3);
    f();
    mq.addEventListener("change", f);
    return () => mq.removeEventListener("change", f);
  }, []);

  useEffect(() => {
    if (reduce) {
      const t0 = Date.now();
      setItems(NOTIFS.slice(0, 3).map((n, i) => ({ id: i, n, at: t0 - (2 - i) * 70_000 })));
      return;
    }
    let id = 0;
    const push = () => {
      const k = id++;
      setItems((s) => [...s, { id: k, n: NOTIFS[k % NOTIFS.length], at: Date.now(), fresh: true }].slice(-6));
    };
    const timers = [setTimeout(push, 0), setTimeout(push, 900), setTimeout(push, 1800)];
    let iv: ReturnType<typeof setInterval> | null = null;
    timers.push(setTimeout(() => { iv = setInterval(push, 2600); }, 1800));
    return () => { timers.forEach(clearTimeout); if (iv) clearInterval(iv); };
  }, [reduce]);

  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  // the newest on top; one extra (the oldest) stays rendered to fade out
  const shown = items.slice(-(max + 1)).reverse();
  const ROW = 70;
  return (
    <Phone dark className="w-[270px] md:w-[300px]">
      <div className="relative h-full bg-[radial-gradient(120%_70%_at_50%_0%,#3b1f7a_0%,#140f24_45%,#07060d_100%)] px-3">
        <div className="pt-8 text-center">
          <p className="text-[14px] font-medium text-white/75" suppressHydrationWarning>{clock.date}</p>
          <p className="mt-0.5 font-display text-[78px] font-bold leading-none tracking-[-0.02em] text-white/95" suppressHydrationWarning>{clock.time}</p>
        </div>
        <div className="relative mt-6" style={{ height: max * ROW }} aria-live="off">
          {shown.map((it, i) => {
            const age = Math.max(i, now ? Math.floor((now - it.at) / 60_000) : 0);
            const gone = i >= max;
            return (
              <div key={it.id}
                className={`notif absolute inset-x-0 top-0 flex h-[62px] gap-2.5 rounded-[18px] bg-white/[0.13] p-2.5 text-white backdrop-blur-xl ${!reduce && it.fresh ? "notif-new" : ""}`}
                style={{ transform: `translateY(${i * ROW}px) scale(${i === 0 ? 1 : 0.985})`, opacity: gone ? 0 : i === 0 ? 1 : 0.62 }}>
                <LogoMark className="size-[34px] shrink-0 rounded-[9px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-white/60">SnackQuest</p>
                    <p className="shrink-0 text-[11px] text-white/55">{age < 1 ? "now" : `${age}m ago`}</p>
                  </div>
                  <p className="truncate text-[13px] font-semibold leading-tight">{it.n.title}</p>
                  <p className="truncate text-[12.5px] leading-tight text-white/80">{it.n.body}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-6 bottom-7 flex justify-between" aria-hidden>
          <span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Flashlight className="size-5 text-white/85" /></span>
          <span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur"><Camera className="size-5 text-white/85" /></span>
        </div>
        <div className="absolute inset-x-0 bottom-2 mx-auto h-1 w-28 rounded-full bg-white/70" />
      </div>
    </Phone>
  );
}
