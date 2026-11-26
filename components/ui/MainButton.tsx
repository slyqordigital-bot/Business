"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  size?: "lg" | "md" | "sm";
  tone?: "tomato" | "lime" | "ink" | "cream";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  glow?: boolean;
  arrow?: boolean;
  "data-testid"?: string;
};

const tones = {
  tomato: { btn: "bg-tomato text-white", dot: "bg-white text-tomato", glow: "bg-tomato" },
  lime: { btn: "bg-lime text-night", dot: "bg-night text-lime", glow: "bg-lime" },
  ink: { btn: "bg-ink text-cream", dot: "bg-cream text-ink", glow: "bg-ink" },
  cream: { btn: "bg-cream text-ink", dot: "bg-tomato text-white", glow: "bg-cream" },
};
const sizes = {
  lg: "h-[64px] pl-7 pr-2.5 text-[17px] gap-4",
  md: "h-[54px] pl-6 pr-2 text-[16px] gap-3",
  sm: "h-10 pl-4 pr-1.5 text-[14px] gap-2",
};
const dots = { lg: "size-[46px]", md: "size-[40px]", sm: "size-7" };

/** The one main action: a pill with a breathing glow and a nudging arrow. */
export function MainButton({ children, href, onClick, size = "lg", tone = "tomato", className, type = "button", disabled, glow = true, arrow = true, ...rest }: Props) {
  const t = tones[tone];
  const inner = (
    <>
      {glow && <span aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 rounded-full blur-xl animate-breathe", t.glow)} />}
      <span className="font-semibold tracking-[-0.01em] whitespace-nowrap">{children}</span>
      {arrow && (
        <span className={cn("relative grid shrink-0 place-items-center overflow-hidden rounded-full", dots[size], t.dot)}>
          <ArrowRight className="size-[18px] animate-nudge transition-transform duration-300 group-hover:translate-x-8" />
          <ArrowRight className="absolute size-[18px] -translate-x-8 transition-transform duration-300 group-hover:translate-x-0" />
        </span>
      )}
    </>
  );
  const cls = cn(
    "group relative isolate inline-flex items-center justify-between rounded-full transition-transform duration-150 ease-out active:scale-[0.955] disabled:opacity-60 disabled:active:scale-100 select-none",
    sizes[size], t.btn, !arrow && "pr-7 justify-center", className,
  );
  if (href) return <Link href={href} className={cls} data-testid={rest["data-testid"]}>{inner}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} data-testid={rest["data-testid"]}>{inner}</button>;
}
