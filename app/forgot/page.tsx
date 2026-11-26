"use client";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Forgot() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "sent" | "error">("idle");
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabaseBrowser();
    if (!sb || !/^\S+@\S+\.\S+$/.test(email)) return setState("error");
    setState("busy");
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: `${location.origin}/auth/callback?next=/reset` });
    setState(error ? "error" : "sent");
  }
  return (
    <main className="grid min-h-dvh place-items-center bg-cream px-4 text-ink">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <div className="recipe-card p-6 sm:p-8">
          <h1 className="font-serif text-[28px] font-semibold tracking-[-0.03em]">Reset your password</h1>
          {state === "sent" ? (
            <p className="mt-3 text-[15px] text-ink-soft">Check your inbox: we sent a link to <b className="text-ink">{email}</b>. It opens a page to pick a new password.</p>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email"
                className="h-[52px] w-full rounded-[14px] border border-line bg-surface px-4 text-[16px] outline-none focus:border-fg/40" />
              {state === "error" && <p className="text-[13px] text-tomato">Enter the email of your account and try again.</p>}
              <button disabled={state === "busy"} className="h-[54px] w-full rounded-full bg-tomato font-semibold text-white disabled:opacity-70">Send me a reset link</button>
            </form>
          )}
          <Link href="/login" className="mt-5 block text-center text-[14px] text-ink-soft underline-offset-2 hover:underline">Back to log in</Link>
        </div>
      </div>
    </main>
  );
}
