import { Camera, CheckCircle2, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export type QuestLite = {
  id: string;
  title: string;
  rule: string;
  proof: string;
  rarity: "common" | "rare" | "legendary";
  points: number;
  status: "open" | "done";
  verdict?: string | null;
  awarded?: number | null;
  custom?: boolean;
  locked?: boolean;
};

const RAR = {
  common: { label: "Common", cls: "text-cyan" },
  rare: { label: "Rare", cls: "text-violet" },
  legendary: { label: "Legendary", cls: "text-lime" },
};

/** Signature 3: a quest card with its rarity stripe. */
export function QuestCard({ q, index, mult = 1, children, className }: { q: QuestLite; index?: number; mult?: number; children?: React.ReactNode; className?: string }) {
  const r = RAR[q.rarity];
  const pts = q.awarded ?? Math.round(q.points * mult);
  return (
    <article className={cn("hud rarity-stripe relative overflow-hidden p-4 md:p-5", `rarity-${q.rarity}`, q.status === "done" && "opacity-90", className)} data-testid="quest-card">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="label-mono flex items-center gap-2 text-[10px]">
            {index !== undefined && <span className="text-fg-soft">Quest {String(index + 1).padStart(2, "0")}</span>}
            <span className={r.cls}>{r.label}</span>
            {q.custom && <span className="flex items-center gap-1 text-pink"><Sparkles className="size-3" />Custom</span>}
          </p>
          <h3 className="mt-1.5 font-display text-[22px] font-bold uppercase leading-[1.05] md:text-[24px]">{q.title}</h3>
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-1 font-display text-[17px] font-bold tabular", q.status === "done" ? "bg-lime text-void" : "bg-lime/10 text-lime")}>
          {q.locked ? <Lock className="my-0.5 size-4" /> : <>+{pts}</>}
        </span>
      </div>
      <p className="mt-2 text-[15px] leading-snug text-fg/90">{q.rule}</p>
      <p className="mt-2.5 flex items-start gap-2 text-[13px] text-fg-soft"><Camera className="mt-0.5 size-3.5 shrink-0 text-cyan" />Proof: {q.proof}</p>
      {q.status === "done" && q.verdict && (
        <p className="mt-3 flex items-start gap-2 rounded-[12px] bg-lime/10 px-3 py-2 text-[13px] text-lime"><CheckCircle2 className="mt-0.5 size-4 shrink-0" />{q.verdict}</p>
      )}
      {children}
    </article>
  );
}
