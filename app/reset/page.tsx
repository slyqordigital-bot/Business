"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Reset() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 8) return setErr("Use at least 8 characters.");
    const sb = supabaseBrowser();
    const r = await sb?.auth.updateUser({ password: pw });
    if (!r || r.error) return setErr("The link expired. Ask for a new one from the log-in page.");
    router.replace("/today");
  }
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-4 text-ink">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <form onSubmit={submit} className="recipe-card space-y-3 p-6 sm:p-8">
          <h1 className="font-serif text-[28px] font-semibold tracking-[-0.03em]">Pick a new password</h1>
          <input type="password" autoComplete="new-password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} aria-label="New password"
            className="h-[52px] w-full rounded-[14px] border border-line bg-surface px-4 text-[16px] outline-none focus:border-fg/40" />
          {err && <p className="text-[13px] text-tomato">{err}</p>}
          <button className="h-[54px] w-full rounded-full bg-tomato font-semibold text-white">Save and continue</button>
        </form>
      </div>
    </main>
  );
}
