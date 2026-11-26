"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

/**
 * A spring sheet: full-screen (or bottom sheet with a grab handle) on a phone,
 * a centered card on a computer.
 */
export function Sheet({ open, onClose, children, variant = "full", className, label, z = 50, closeSide = "left", dark }: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: "full" | "bottom";
  className?: string;
  label: string;
  z?: number;
  closeSide?: "left" | "right";
  dark?: boolean;
}) {
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: z }} role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-night/55 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn(
              "absolute flex flex-col overflow-hidden shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88dvh] md:w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px]",
              dark ? "bg-night text-cream" : "bg-bg text-fg",
              variant === "full" ? "inset-0" : "inset-x-0 bottom-0 max-h-[92dvh] rounded-t-[24px]",
              className,
            )}
            initial={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduce ? { opacity: 0 } : { y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 420, damping: 38 }}
            drag={variant === "bottom" && !reduce ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, i) => { if (i.offset.y > 120) onClose(); }}
          >
            {variant === "bottom" && <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-fg/15 md:hidden" aria-hidden />}
            <button onClick={onClose} aria-label="Close"
              className={cn("absolute top-3 z-10 grid size-10 place-items-center rounded-full transition hover:bg-fg/5 active:scale-95", closeSide === "left" ? "left-3" : "right-3", dark && "hover:bg-white/10")}>
              <X className="size-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
