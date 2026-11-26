"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { env } from "@/lib/env";
import { GoogleIcon } from "@/components/ui/GoogleIcon";
import { cn } from "@/lib/utils";

/**
 * Sign-up / log-in: "Continue with Google" first (only once it works), then email + password.
 * No email confirmation, no extra field. onDone runs once the session exists.
 */
export function AuthForm({ mode: initial = "signup", onDone, next = "/start", compact }: { mode?: "signup" | "login"; onDone?: () => void | Promise<void>; next?: string; compact?: boolean }) {
  const [mode, setMode] = useState(initial);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ field: "email" | "password" | "form"; msg: React.ReactNode } | null>(null);
  const sb = supabaseBrowser();

  async function google() {
    if (!sb) return;
    setBusy(true);
    const { error } = await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) { setErr({ field: "form", msg: "Google sign-in didn't open. Try again or use your email." }); setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!sb) { setErr({ field: "form", msg: "Accounts open in a moment. Try again shortly." }); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr({ field: "email", msg: "Enter a valid email, like you@gmail.com." });
    if (password.length < 8) return setErr({ field: "password", msg: "Use at least 8 characters." });
    setBusy(true);
    const res = mode === "signup"
      ? await sb.auth.signUp({ email, password })
      : await sb.auth.signInWithPassword({ email, password });
    if (res.error) {
      setBusy(false);
      const m = res.error.message.toLowerCase();
      if (m.includes("already")) return setErr({ field: "email", msg: <>This email already has an account. <button type="button" className="underline" onClick={() => { setMode("login"); setErr(null); }}>Log in?</button></> });
      if (m.includes("invalid login")) return setErr({ field: "password", msg: "That email and password don't match. Try again or reset your password." });
      if (m.includes("password")) return setErr({ field: "password", msg: "Pick a stronger password (8+ characters, not a common one)." });
      return setErr({ field: "form", msg: "Something went wrong. Try again." });
    }
    if (!res.data.session) {
      setBusy(false);
      return setErr({ field: "form", msg: "Almost there: log in with the same email and password." });
    }
    await onDone?.();
    setBusy(false);
  }

  const field = "h-[52px] w-full rounded-[14px] border border-line bg-surface-2 px-4 text-[16px] outline-none transition placeholder:text-fg-soft/70 focus:border-cyan/60 focus:ring-4 focus:ring-cyan/10";

  return (
    <div className={cn("w-full", compact ? "space-y-3" : "space-y-4")}>
      {env.googleEnabled && (
        <>
          <button type="button" onClick={google} disabled={busy} data-testid="google"
            className="flex h-[54px] w-full items-center justify-center gap-3 rounded-full border border-white/10 bg-white text-[16px] font-semibold text-[#1f1f1f] shadow-sm transition hover:shadow-md active:scale-[0.98]">
            <GoogleIcon /> Continue with Google
          </button>
          <div className="flex items-center gap-3 text-[13px] text-fg-soft"><span className="h-px flex-1 bg-line" />or<span className="h-px flex-1 bg-line" /></div>
        </>
      )}
      <form onSubmit={submit} className="space-y-3" noValidate>
        <div>
          <label htmlFor="email" className="sr-only">Email</label>
          <input id="email" type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className={cn(field, err?.field === "email" && "border-lime")} />
          {err?.field === "email" && <p className="mt-1.5 text-[13px] text-pink">{err.msg}</p>}
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <div className="relative">
            <input id="password" type={show ? "text" : "password"} autoComplete={mode === "signup" ? "new-password" : "current-password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={cn(field, "pr-12", err?.field === "password" && "border-lime")} />
            <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"} className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-fg-soft hover:bg-fg/5">
              {show ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
            </button>
          </div>
          {err?.field === "password" && <p className="mt-1.5 text-[13px] text-pink">{err.msg}</p>}
        </div>
        {err?.field === "form" && <p className="text-[13px] text-pink" role="alert">{err.msg}</p>}
        <button type="submit" disabled={busy} data-testid="auth-submit"
          className="flex h-[54px] w-full items-center justify-center gap-2 rounded-full bg-lime text-[16px] font-semibold text-white transition active:scale-[0.98] disabled:opacity-70">
          {busy && <Loader2 className="size-4 animate-spin" />}
          {mode === "signup" ? "Create my account" : "Log in"}
        </button>
      </form>
      <div className="flex items-center justify-between text-[14px] text-fg-soft">
        {mode === "signup"
          ? <span>Already have an account? <button type="button" className="font-semibold text-fg underline-offset-2 hover:underline" onClick={() => { setMode("login"); setErr(null); }}>Log in</button></span>
          : <span>New here? <button type="button" className="font-semibold text-fg underline-offset-2 hover:underline" onClick={() => { setMode("signup"); setErr(null); }}>Create an account</button></span>}
        {mode === "login" && <Link href="/forgot" className="underline-offset-2 hover:underline">Forgot password?</Link>}
      </div>
      <p className="text-center text-[12px] text-fg-soft">By continuing you agree to our <Link href="/terms" className="underline">Terms</Link> and <Link href="/privacy" className="underline">Privacy</Link>.</p>
    </div>
  );
}
