"use client";
import { motion, useReducedMotion } from "framer-motion";

export const MACRO_COLORS = { kcal: "#E5482F", protein: "#E5482F", carbs: "#D9A441", fat: "#6B7B3A" } as const;

/** A progress ring for one macro. value/goal; children in the middle. */
export function MacroRing({ value, goal, color, size = 88, stroke = 9, children, track = "var(--line)" }: { value: number; goal: number; color: string; size?: number; stroke?: number; children?: React.ReactNode; track?: string }) {
  const reduce = useReducedMotion();
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <motion.circle cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - p) }}
          transition={reduce ? { duration: 0 } : { duration: 1.3, ease: [0.22, 0.8, 0.24, 1] }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}
