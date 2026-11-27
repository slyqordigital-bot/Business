"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Camera, Check, ImagePlus, Loader2, Share2, Sparkles, Trash2, Upload } from "lucide-react";
import { QuestCard, type QuestLite } from "./QuestCard";
import { Locked, UpgradeButton } from "./Locked";
import { Sheet } from "@/components/ui/Sheet";
import { useFunnel } from "@/components/funnel/Funnel";
import { shrinkPhoto } from "@/lib/client";
import { cn } from "@/lib/utils";

type Done = QuestLite & { photo: string | null; completed_at: string | null };

export function QuestsClient({ level, mult, open, done, quota, nextName, custom, historyDays, run }: {
  level: number; mult: number; open: QuestLite[]; done: Done[]; quota: { used: number; limit: number; left: number };
  nextName: string | null; custom: boolean; historyDays: number | null; run: { title: string; token: string } | null;
}) {
  const router = useRouter();
  const funnel = useFunnel();
  const [active, setActive] = useState<QuestLite | null>(null);
  const [more, setMore] = useState<"idle" | "busy" | string>("idle");
  const [tab, setTab] = useState<"open" | "done">("open");

  async function cookMore() {
    setMore("busy");
    const r = await fetch("/api/quests", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) { setMore("idle"); router.refresh(); } else setMore(j.error || "Couldn't cook new quests. Try again.");
  }
  async function remove(id: string) {
    if (!confirm("Remove this quest from your list?")) return;
    await fetch(`/api/quests/${id}`, { method: "DELETE" }).catch(() => null);
    router.refresh();
  }
  async function share() {
    if (!run) return;
    const url = `${location.origin}/q/${run.token}`;
    try {
      if (navigator.share) await navigator.share({ title: run.title, text: `My SnackQuest run: ${run.title}`, url });
      else { await navigator.clipboard.writeText(url); alert("Link copied."); }
    } catch {}
  }
  function start(q: QuestLite) {
    if (quota.left <= 0) {
      if (nextName) funnel.openUpgrade({ level: level as 1 | 2, reason: `You cleared all ${quota.limit} quests this month.` });
      else alert(`You cleared all ${quota.limit} quests this month. New quests open with your next billing period.`);
      return;
    }
    setActive(q);
  }

  return (
    <div className="mx-auto max-w-[1040px] px-4 pb-12 md:px-10">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full bg-surface p-1 text-[14px] font-semibold ring-1 ring-line" role="tablist">
          {(["open", "done"] as const).map((t) => (
            <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn("rounded-full px-4 py-2 transition", tab === t ? "bg-lime text-void" : "text-fg-soft hover:text-fg")}>
              {t === "open" ? `To do · ${open.length}` : `Cleared · ${done.length}`}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[13px] text-fg-soft tabular">{quota.left} of {quota.limit} left this month</span>
      </div>

      {tab === "open" && (
        <div className="mt-5 space-y-4">
          {open.length === 0 && (
            <div className="hud p-8 text-center">
              <p className="font-display text-[26px] font-bold uppercase">Quest log empty</p>
              <p className="mt-1 text-fg-soft">You cleared everything. Cook up a fresh run.</p>
            </div>
          )}
          <div className="grid gap-4 md:grid-cols-2">
            {open.map((q, i) => (
              <QuestCard key={q.id} q={q} index={i} mult={mult}>
                <div className="mt-4 flex items-center gap-2">
                  <button onClick={() => start(q)} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-lime text-[15px] font-semibold text-void transition active:scale-[0.97]" data-testid="clear-quest"><Camera className="size-4" />Clear it</button>
                  <button onClick={() => remove(q.id)} aria-label="Remove quest" className="grid size-11 place-items-center rounded-full ring-1 ring-line hover:bg-white/5"><Trash2 className="size-4 text-fg-soft" /></button>
                </div>
              </QuestCard>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <button onClick={cookMore} disabled={more === "busy"} className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold ring-1 ring-lime/50 text-lime hover:bg-lime/10 disabled:opacity-60">
              {more === "busy" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}{more === "busy" ? "Cooking up quests…" : "Cook up 7 more"}
            </button>
            {run && <button onClick={share} className="inline-flex h-12 items-center gap-2 rounded-full px-5 font-semibold ring-1 ring-line hover:bg-white/5"><Share2 className="size-4" />Share my run</button>}
          </div>
          {more !== "idle" && more !== "busy" && <p className="text-[14px] text-pink" role="alert">{more}</p>}

          <div className="pt-4">
            {custom ? <CustomQuest onDone={() => router.refresh()} /> : (
              <Locked level={level} next={level === 2 ? nextName : "Legend"} skip={level === 1} reason="Custom quests from your own snack come with Legend.">
                <CustomPreview />
              </Locked>
            )}
          </div>
        </div>
      )}

      {tab === "done" && (
        <div className="mt-5">
          {done.length === 0 ? (
            <div className="hud p-8 text-center"><p className="font-display text-[26px] font-bold uppercase">No clears yet</p><p className="mt-1 text-fg-soft">Clear your first quest and it shows up here with its photo.</p></div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {done.map((q) => (
                <QuestCard key={q.id} q={q}>
                  <div className="mt-3 flex items-center gap-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {q.photo && <img src={q.photo} alt="" className="size-14 rounded-[12px] object-cover ring-1 ring-line" />}
                    <p className="text-[13px] text-fg-soft">{q.completed_at && new Date(q.completed_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</p>
                  </div>
                </QuestCard>
              ))}
            </div>
          )}
          {historyDays && <p className="mt-5 text-[13px] text-fg-soft">Showing the last {historyDays} days. <UpgradeButton level={level} reason="Full quest history comes with Grinder." className="font-semibold text-lime underline-offset-2 hover:underline">Unlock full history with {nextName}</UpgradeButton></p>}
        </div>
      )}

      <ProofSheet quest={active} mult={mult} onClose={() => setActive(null)} onCleared={() => router.refresh()} />
    </div>
  );
}

function CustomPreview() {
  return (
    <div className="hud flex items-center gap-4 p-5">
      <span className="grid size-12 place-items-center rounded-[14px] bg-pink/15 text-pink"><ImagePlus className="size-6" /></span>
      <div><p className="font-display text-[22px] font-bold uppercase leading-none">Custom quest from your snack</p><p className="mt-1 text-[14px] text-fg-soft">Snap whatever you&apos;re eating. We build a quest around it.</p></div>
    </div>
  );
}

function CustomQuest({ onDone }: { onDone: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<"idle" | "busy" | string>("idle");
  async function go(f: File) {
    setState("busy");
    const blob = await shrinkPhoto(f).catch(() => f);
    const fd = new FormData();
    fd.append("photo", blob, "snack.jpg");
    const r = await fetch("/api/quests", { method: "POST", body: fd }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) { setState("idle"); onDone(); } else setState(j.error || "Couldn't build that quest. Try again.");
  }
  return (
    <div className="hud p-5">
      <div className="flex items-center gap-4">
        <span className="grid size-12 place-items-center rounded-[14px] bg-pink/15 text-pink"><ImagePlus className="size-6" /></span>
        <div className="min-w-0 flex-1"><p className="font-display text-[22px] font-bold uppercase leading-none">Custom quest from your snack</p><p className="mt-1 text-[14px] text-fg-soft">Snap whatever you&apos;re eating. We build a quest around it.</p></div>
      </div>
      <input ref={input} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files?.[0] && go(e.target.files[0])} />
      <button onClick={() => input.current?.click()} disabled={state === "busy"} className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-pink px-5 text-[15px] font-semibold text-void disabled:opacity-60">
        {state === "busy" ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}{state === "busy" ? "Building your quest…" : "Snap my snack"}
      </button>
      {state !== "idle" && state !== "busy" && <p className="mt-2 text-[14px] text-pink">{state}</p>}
    </div>
  );
}

function ProofSheet({ quest, mult, onClose, onCleared }: { quest: QuestLite | null; mult: number; onClose: () => void; onCleared: () => void }) {
  const reduce = useReducedMotion();
  const cam = useRef<HTMLInputElement>(null);
  const file = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [state, setState] = useState<{ k: "idle" } | { k: "busy" } | { k: "ok"; reason: string; points: number } | { k: "no"; reason: string }>({ k: "idle" });

  function reset() { setPreview(null); setState({ k: "idle" }); }
  function close() { const ok = state.k === "ok"; reset(); onClose(); if (ok) onCleared(); }

  async function go(f: File) {
    if (!quest) return;
    setPreview(URL.createObjectURL(f));
    setState({ k: "busy" });
    const blob = await shrinkPhoto(f).catch(() => f);
    const fd = new FormData();
    fd.append("photo", blob, "proof.jpg");
    const r = await fetch(`/api/quests/${quest.id}`, { method: "POST", body: fd }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok && j.ok) setState({ k: "ok", reason: j.reason, points: j.points });
    else if (r?.ok && j.ok === false) setState({ k: "no", reason: j.reason });
    else setState({ k: "no", reason: j.error === "quota" ? "You used every quest this month." : j.error || "The referee lagged. Try again." });
  }

  return (
    <Sheet open={Boolean(quest)} onClose={close} variant="bottom" label="Clear quest" z={60} closeSide="right">
      <div className="overflow-y-auto px-5 pb-8 pt-6 md:px-7" data-testid="proof-sheet">
        {quest && (
          <>
            <p className="label-mono text-cyan">[ prove it ]</p>
            <h2 className="mt-1 pr-10 font-display text-[30px] font-bold uppercase leading-[1]">{quest.title}</h2>
            <p className="mt-2 text-[15px] text-fg/85">{quest.rule}</p>
            <p className="mt-2 flex gap-2 text-[14px] text-fg-soft"><Camera className="mt-0.5 size-4 shrink-0 text-cyan" />Snap: {quest.proof}</p>

            <div className="relative mt-5 aspect-[4/3] overflow-hidden rounded-[18px] bg-surface-2 ring-1 ring-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {preview ? <img src={preview} alt="Your proof" className="size-full object-cover" /> : (
                <div className="grid size-full place-items-center text-center text-fg-soft"><div><Camera className="mx-auto size-8" /><p className="mt-2 text-[14px]">Your snack + your screen</p></div></div>
              )}
              {["tl", "tr", "bl", "br"].map((c) => <span key={c} className={cn("absolute size-6 border-lime", c[0] === "t" ? "top-3 border-t-2" : "bottom-3 border-b-2", c[1] === "l" ? "left-3 border-l-2" : "right-3 border-r-2")} />)}
              {state.k === "busy" && <div className="absolute inset-x-0 h-0.5 animate-[floaty_1.6s_ease-in-out_infinite] bg-lime shadow-[0_0_14px_var(--lime)]" style={{ top: "50%" }} />}
              <AnimatePresence>
                {state.k === "ok" && (
                  <motion.div initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 grid place-items-center bg-void/60">
                    <motion.span initial={reduce ? false : { scale: 0.5, rotate: -8 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 320, damping: 14 }}
                      className="glow-edge flex items-center gap-2 rounded-full bg-lime px-5 py-2.5 font-display text-[26px] font-bold uppercase text-void"><Check className="size-6" strokeWidth={3} />+{state.points}</motion.span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {state.k === "busy" && <p className="mt-4 flex items-center gap-2 text-[15px] text-fg-soft"><Loader2 className="size-4 animate-spin" />The referee is checking your photo…</p>}
            {state.k === "ok" && <p className="mt-4 text-[15px] text-lime" role="status">Quest cleared. {state.reason}</p>}
            {state.k === "no" && <p className="mt-4 text-[15px] text-pink" role="alert">{state.reason}</p>}

            <input ref={cam} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) go(f); }} />
            <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; if (f) go(f); }} />
            {state.k === "ok" ? (
              <button onClick={close} className="mt-5 h-[56px] w-full rounded-full bg-lime text-[17px] font-semibold text-void active:scale-[0.97]">GG, next quest</button>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-2">
                <button onClick={() => cam.current?.click()} disabled={state.k === "busy"} className="flex h-[56px] items-center justify-center gap-2 rounded-full bg-lime font-semibold text-void active:scale-[0.97] disabled:opacity-60"><Camera className="size-5" />Take photo</button>
                <button onClick={() => file.current?.click()} disabled={state.k === "busy"} className="flex h-[56px] items-center justify-center gap-2 rounded-full font-semibold ring-1 ring-line hover:bg-white/5 disabled:opacity-60"><Upload className="size-5" />Upload</button>
              </div>
            )}
            <p className="mt-3 text-center text-[12px] text-fg-soft">+{Math.round(quest.points * mult)} pts when it&apos;s approved. Photos stay private in your account.</p>
          </>
        )}
      </div>
    </Sheet>
  );
}
