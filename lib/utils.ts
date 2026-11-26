import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function round(n: number, d = 0) {
  const p = 10 ** d;
  return Math.round(n * p) / p;
}

export function fmtDay(d: Date) {
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

/** YYYY-MM-DD in the user's timezone offset (minutes, as from Date#getTimezoneOffset) */
export function dayKey(d: Date, tzOffsetMin = 0) {
  const t = new Date(d.getTime() - tzOffsetMin * 60_000);
  return t.toISOString().slice(0, 10);
}
