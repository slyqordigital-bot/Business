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
    <main className="grid min-h-dvh place-items-center bg-void px-4">
      <div className="w-full max-w-[420px]">
        <Link href="/" className="mb-8 flex justify-center"><Logo /></Link>
        <div className="hud hud-corners p-6 sm:p-8">
          <h1 className="font-display text-[30px] font-bold uppercase">Reset your password</h1>
          {state === "sent" ? (
            <p className="mt-3 text-[15px] text-fg-soft">Check your inbox: we sent a link to <b className="text-fg">{email}</b>. It opens a page to pick a new password.</p>
          ) : (
            <form onSubmit={submit} className="mt-5 space-y-3">
              <input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email"
                className="h-[52px] w-full rounded-[14px] border border-line bg-surface-2 px-4 text-[16px] outline-none focus:border-fg/40" />
              {state === "error" && <p className="text-[13px] text-pink">Enter the email of your account and try again.</p>}
              <button disabled={state === "busy"} className="h-[54px] w-full rounded-full bg-lime font-semibold text-void disabled:opacity-70">Send me a reset link</button>
            </form>
          )}
          <Link href="/login" className="mt-5 block text-center text-[14px] text-fg-soft underline-offset-2 hover:underline">Back to log in</Link>
        </div>
      </div>
    </main>
  );
}
