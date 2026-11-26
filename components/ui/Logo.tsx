import { cn } from "@/lib/utils";

/** SnackQuest mark: a controller-shaped bite with a lime quest star. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-7", className)} aria-hidden>
      <defs>
        <linearGradient id="sqg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8B5CF6" />
          <stop offset="1" stopColor="#22E1FF" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#sqg)" />
      <path d="M8.5 13.2c0-2.3 1.8-4.2 4.1-4.2h6.8c2.3 0 4.1 1.9 4.1 4.2l.9 6.3c.3 2-1.3 3.7-3.3 3.7-1.1 0-2.1-.6-2.7-1.5L17.3 20h-2.6l-1.1 1.7c-.6.9-1.6 1.5-2.7 1.5-2 0-3.6-1.8-3.3-3.7z" fill="#07060D" />
      <circle cx="24.3" cy="9.6" r="2.6" fill="#07060D" />
      <path d="M12 13.4v3.2M10.4 15h3.2" stroke="#C8FF3D" strokeWidth="1.6" strokeLinecap="round" />
      <path d="m20.2 13.1.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="#C8FF3D" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-[21px] font-bold uppercase tracking-[0.02em] text-fg">Snack<span className="text-lime">Quest</span></span>
    </span>
  );
}
