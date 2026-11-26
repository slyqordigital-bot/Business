"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { useFunnel } from "@/components/funnel/Funnel";

export function AccountPanel({ email, name, level, plan, status, until, used, limit }: { email: string; name: string | null; level: number; plan: string | null; status: string | null; until: string | null; used: number; limit: number }) {
  const router = useRouter();
  const funnel = useFunnel();
  const [cancel, setCancel] = useState<"idle" | "confirm" | "busy" | { message: string; manage_url: string | null }>("idle");
  const [del, setDel] = useState<"idle" | "confirm" | "busy" | "error">("idle");
  const canceled = status && /cancel/i.test(status);

  async function doCancel() {
    setCancel("busy");
    const r = await fetch("/api/cancel", { method: "POST" }).then((x) => x.json()).catch(() => ({ error: "We couldn't reach billing. Try again in a minute." }));
    setCancel({ message: r.message || r.error, manage_url: r.manage_url ?? null });
    router.refresh();
  }
  async function doDelete() {
    setDel("busy");
    const r = await fetch("/api/account", { method: "DELETE" }).catch(() => null);
    if (r?.ok) { await supabaseBrowser()?.auth.signOut(); location.assign("/"); } else setDel("error");
  }
  async function logout() { await supabaseBrowser()?.auth.signOut(); location.assign("/"); }

  const card = "recipe-card p-5";
  return (
    <div className="space-y-4">
      <section className={card}>
        <p className="text-[13px] text-fg-soft">Profile</p>
        <p className="mt-1 text-[17px] font-semibold">{name || email}</p>
        {name && <p className="text-[14px] text-fg-soft">{email}</p>}
        <p className="mt-3 text-[14px] text-fg-soft">Language: English (US)</p>
      </section>

      <section className={card} data-testid="billing">
        <p className="text-[13px] text-fg-soft">Plan and billing</p>
        {plan ? (
          <>
            <p className="mt-1 font-serif text-[24px] font-semibold">{plan}</p>
            <p className="text-[14px] text-fg-soft">{used} of {limit} scans used this period{until ? ` · ${canceled ? "ends" : "renews"} ${new Date(until).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}` : ""}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {level < 3 && <button onClick={() => funnel.openUpgrade({ level: level as 1 | 2 })} className="rounded-full bg-fg px-4 py-2.5 text-[14px] font-semibold text-bg">Change plan</button>}
              {!canceled && cancel === "idle" && <button onClick={() => setCancel("confirm")} className="rounded-full px-4 py-2.5 text-[14px] font-semibold ring-1 ring-line">Cancel my subscription</button>}
            </div>
            {cancel === "confirm" && (
              <div className="mt-4 rounded-[14px] bg-surface-2 p-4 text-[14px]">
                <p>You keep {plan} until the end of this period. Then no more charges.</p>
                <div className="mt-3 flex gap-2"><button onClick={doCancel} className="rounded-full bg-tomato px-4 py-2 font-semibold text-white">Yes, cancel</button><button onClick={() => setCancel("idle")} className="rounded-full px-4 py-2 font-semibold ring-1 ring-line">Keep my plan</button></div>
              </div>
            )}
            {cancel === "busy" && <p className="mt-3 text-[14px] text-fg-soft">Canceling…</p>}
            {typeof cancel === "object" && <p className="mt-3 rounded-[14px] bg-surface-2 p-3 text-[14px]" role="status">{cancel.message}{cancel.manage_url && <> <a href={cancel.manage_url} className="font-semibold underline" target="_blank" rel="noreferrer">Manage billing</a></>}</p>}
          </>
        ) : (
          <>
            <p className="mt-1 font-serif text-[24px] font-semibold">Free account</p>
            <p className="text-[14px] text-fg-soft">Your meals are saved. Pick a plan to see their macros.</p>
            <Link href="/pricing" className="mt-4 inline-block rounded-full bg-tomato px-5 py-2.5 text-[14px] font-semibold text-white">See plans</Link>
          </>
        )}
      </section>

      <section className={card}>
        <p className="text-[13px] text-fg-soft">Your data</p>
        <p className="mt-1 text-[14px]">Meal photos are stored privately in your account. Only you can see them.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={logout} className="flex items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-semibold ring-1 ring-line"><LogOut className="size-4" />Log out</button>
          {del === "idle" && <button onClick={() => setDel("confirm")} className="rounded-full px-4 py-2.5 text-[14px] font-semibold text-tomato ring-1 ring-tomato/30">Delete my account</button>}
        </div>
        {(del === "confirm" || del === "busy" || del === "error") && (
          <div className="mt-4 rounded-[14px] bg-tomato/10 p-4 text-[14px]">
            <p>This deletes your account, every meal and every photo, for good.{plan ? " Your subscription is canceled too." : ""}</p>
            {del === "error" && <p className="mt-2 text-tomato">That didn&apos;t work. Try again.</p>}
            <div className="mt-3 flex gap-2"><button disabled={del === "busy"} onClick={doDelete} className="rounded-full bg-tomato px-4 py-2 font-semibold text-white">Delete everything</button><button onClick={() => setDel("idle")} className="rounded-full px-4 py-2 font-semibold ring-1 ring-line">Keep my account</button></div>
          </div>
        )}
      </section>
      <p className="text-center text-[13px] text-fg-soft"><Link href="/terms" className="underline">Terms</Link> · <Link href="/privacy" className="underline">Privacy</Link></p>
    </div>
  );
}
