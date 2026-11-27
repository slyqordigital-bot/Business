"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type QOption = { value: string; line: string };
export type Question = { key: string; text: string; options: QOption[] };

/** Types itself, 18 ms a letter, with a blinking caret. */
export function TypeLine({ text, className, onDone }: { text: string; className?: string; onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? text.length : 0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    if (reduce) { setN(text.length); done.current?.(); return; }
    setN(0);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setN(i);
      if (i >= text.length) { clearInterval(t); done.current?.(); }
    }, 18);
    return () => clearInterval(t);
  }, [text, reduce]);
  return (
    <span className={className} aria-label={text}>
      <span aria-hidden className={n < text.length ? "caret" : ""}>{text.slice(0, n)}</span>
    </span>
  );
}

/**
 * One question per screen, like Kwop's quiz: a plain list with a small square tick, the chosen
 * answer's line opens under it like a drawer, then it moves on by itself after 1.3 s.
 */
export function Quiz({ questions, answers, step, onAnswer, onBack, total }: {
  questions: Question[];
  answers: Record<string, string | undefined>;
  step: number;
  total: number;
  onAnswer: (key: string, value: string) => void;
  onBack: () => void;
}) {
  const q = questions[step];
  const [picked, setPicked] = useState<string | null>(null);
  const [typed, setTyped] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setPicked(null);
    setTyped(false);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [step]);
  if (!q) return null;

  function pick(v: string) {
    if (picked) return;
    setPicked(v);
    timer.current = setTimeout(() => onAnswer(q.key, v), 1300);
  }
  const prev = answers[q.key];

  return (
    <div className="mx-auto w-full max-w-[560px]">
      <div className="xp-track h-1" aria-hidden><motion.div className="xp-fill" initial={false} animate={{ width: `${((step + (picked ? 1 : 0)) / total) * 100}%` }} transition={{ duration: 0.4 }} /></div>
      <div className="mt-4 flex h-8 items-center justify-between text-[13px] text-fg-soft">
        {step > 0 ? <button onClick={onBack} className="flex items-center gap-1.5 rounded-full px-1 hover:text-fg"><ArrowLeft className="size-4" />Previous question</button> : <span />}
        <span className="label-mono">{step + 1} / {total}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35, ease: [0.22, 0.8, 0.24, 1] }}>
          <h1 className="mt-6 min-h-[2.1em] font-display text-[34px] font-bold uppercase leading-[1.02] md:text-[44px]">
            <TypeLine text={q.text} onDone={() => setTyped(true)} />
          </h1>
          <ul className="mt-6 space-y-2.5" role="radiogroup" aria-label={q.text}>
            {q.options.map((o, i) => {
              const on = picked === o.value || (!picked && prev === o.value);
              return (
                <motion.li key={o.value} initial={{ opacity: 0, y: 8 }} animate={{ opacity: typed ? 1 : 0.0, y: typed ? 0 : 8 }} transition={{ delay: typed ? i * 0.05 : 0, duration: 0.3 }}>
                  <button type="button" role="radio" aria-checked={on} onClick={() => pick(o.value)} data-testid={`opt-${o.value}`}
                    className={cn("w-full rounded-[16px] border px-4 py-3.5 text-left transition active:scale-[0.99]",
                      on ? "border-lime/70 bg-lime/[0.07] glow-edge" : "border-line bg-surface hover:border-white/20 hover:bg-surface-2")}>
                    <span className="flex items-center gap-3">
                      <span className={cn("grid size-5 shrink-0 place-items-center rounded-[5px] border-2 transition", on ? "border-lime bg-lime text-void" : "border-white/25")}>
                        {on && <Check className="size-3.5" strokeWidth={3.5} />}
                      </span>
                      <span className="text-[17px] font-semibold">{o.value}</span>
                    </span>
                    <AnimatePresence initial={false}>
                      {picked === o.value && (
                        <motion.span initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="block overflow-hidden">
                          <span className="block pl-8 pt-2 text-[14px] text-fg-soft">{o.line}</span>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </motion.li>
              );
            })}
          </ul>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
