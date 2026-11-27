"use client";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useId } from "react";

// open sheets, top-most last: only the top one reacts to Escape
const stack: string[] = [];
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
  const id = useId();
  useEffect(() => {
    if (!open) return;
    stack.push(id);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && stack[stack.length - 1] === id) { e.stopImmediatePropagation(); onClose(); } };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      const i = stack.lastIndexOf(id);
      if (i >= 0) stack.splice(i, 1);
    };
  }, [open, onClose, id]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0" style={{ zIndex: z }} role="dialog" aria-modal="true" aria-label={label}>
          <motion.div className="absolute inset-0 bg-void/70 backdrop-blur-[3px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            className={cn(
              "absolute flex flex-col overflow-hidden shadow-2xl md:inset-auto md:left-1/2 md:top-1/2 md:max-h-[88dvh] md:w-[480px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px]",
              dark ? "bg-void text-fg" : "bg-bg text-fg",
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
              className={cn("absolute top-3 z-20 grid size-10 place-items-center rounded-full backdrop-blur transition active:scale-95", dark ? "bg-night/70 hover:bg-white/10" : "bg-bg/85 hover:bg-surface-2", closeSide === "left" ? "left-3" : "right-3")}>
              <X className="size-5" />
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
