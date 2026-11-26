"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, ImageUp } from "lucide-react";
import { PageHead, useShell } from "@/components/app/AppShell";
import { ScanFrame } from "@/components/ui/ScanFrame";
import { WorkSteps } from "@/components/funnel/WorkSteps";
import { useFunnel } from "@/components/funnel/Funnel";
import { preparePhoto } from "@/lib/client";
import { cn } from "@/lib/utils";

export default function Scan() {
  const router = useRouter();
  const { plan } = useShell();
  const funnel = useFunnel();
  const fileRef = useRef<HTMLInputElement>(null);
  const [st, setSt] = useState<{ s: "idle" } | { s: "working"; preview: string; done: boolean } | { s: "error"; msg: string }>({ s: "idle" });
  const [drag, setDrag] = useState(false);
  const result = useRef<string | null>(null);
  const out = plan?.paid && plan.left === 0;

  const blocked = useCallback(() => {
    if (!plan?.paid) funnel.openPaywall({ title: "Pick a plan to keep scanning.", line: "Your meals are saved. Unlock their macros and every scan after." });
    else if (plan.level < 3) funnel.openUpgrade({ level: plan.level as 1 | 2, reason: `You've used all ${plan.limit} scans this month.` });
    else setSt({ s: "error", msg: `You've used all ${plan.limit} scans this month. They reset with your next billing period.` });
  }, [plan, funnel]);

  const run = useCallback(async (f: File) => {
    if (out) return blocked();
    let p: { blob: Blob; preview: string };
    try { p = await preparePhoto(f); } catch { return setSt({ s: "error", msg: "We couldn't open that image. Try another photo." }); }
    setSt({ s: "working", preview: p.preview, done: false });
    const fd = new FormData();
    fd.append("photo", p.blob, "meal.jpg");
    const r = await fetch("/api/scan", { method: "POST", body: fd }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.status === 402) { setSt({ s: "idle" }); return blocked(); }
    if (!r?.ok) return setSt({ s: "error", msg: j.message || "The scan didn't go through. Try again." });
    result.current = j.id;
    setSt((s) => (s.s === "working" ? { ...s, done: true } : s));
  }, [out, blocked]);

  const onFinished = useCallback(() => { if (result.current) router.push(`/meal/${result.current}?celebrate=1`); }, [router]);

  return (
    <div>
      <PageHead title="Scan a meal" sub={plan?.paid ? `${plan.left} of ${plan.limit} scans left this month` : "Free account"} />
      <div className="mx-auto max-w-[760px] px-4 pb-10 md:px-10">
        {st.s === "working" ? (
          <div className="grid gap-6 rounded-[24px] bg-surface p-3 ring-1 ring-line md:grid-cols-2 md:p-4">
            <ScanFrame src={st.preview} scanning className="aspect-square" />
            <div className="flex items-center px-2 pb-3"><WorkSteps done={st.done} onFinished={onFinished} /></div>
          </div>
        ) : (
          <>
            <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) run(f); }}
              className={cn("rounded-[28px] border-2 border-dashed p-2 transition", drag ? "border-tomato bg-tomato/5" : "border-line")}>
              <button onClick={() => (out ? blocked() : fileRef.current?.click())} data-testid="app-dropzone"
                className="recipe-card flex w-full flex-col items-center gap-4 px-6 py-14 transition active:scale-[0.99]">
                <span className="grid size-20 place-items-center rounded-[24px] bg-tomato text-white shadow-[0_12px_30px_-8px_rgb(229_72_47/0.7)]"><Camera className="size-9" strokeWidth={1.8} /></span>
                <span className="font-serif text-[26px] font-semibold tracking-[-0.02em]">Snap my macros</span>
                <span className="flex items-center gap-1.5 text-[15px] text-fg-soft"><ImageUp className="size-4" />Take a photo or upload one</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) run(f); e.target.value = ""; }} />
            </div>
            {st.s === "error" && <div className="mt-4 rounded-[16px] bg-tomato/10 p-4 text-[15px]" role="alert">{st.msg} <button className="font-semibold underline" onClick={() => setSt({ s: "idle" })}>Try again</button></div>}
            <ul className="mt-6 grid gap-3 text-[14px] text-fg-soft sm:grid-cols-3">
              <li className="rounded-[16px] bg-surface p-4 ring-1 ring-line"><b className="block text-fg">Shoot from above</b>The whole plate in the frame.</li>
              <li className="rounded-[16px] bg-surface p-4 ring-1 ring-line"><b className="block text-fg">Good light</b>Daylight or a bright kitchen.</li>
              <li className="rounded-[16px] bg-surface p-4 ring-1 ring-line"><b className="block text-fg">Private</b>Only you can see your photos.</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
