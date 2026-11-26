"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { Camera, History, Home, Settings, UserRound } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FunnelProvider } from "@/components/funnel/Funnel";
import { cn } from "@/lib/utils";

export type ShellPlan = { paid: boolean; level: number; name: string | null; left: number | null; limit: number | null };
type ShellUser = { email: string; name: string | null; avatar: string | null };

const ShellCtx = createContext<{ plan: ShellPlan | null; user: ShellUser | null }>({ plan: null, user: null });
export const useShell = () => useContext(ShellCtx);

const NAV = [
  { href: "/today", label: "Today", icon: Home },
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/history", label: "History", icon: History },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/account", label: "Account", icon: UserRound },
];

/** Sidebar on a computer, bottom tab bar on a phone. */
export function AppShell({ children, user, plan }: { children: React.ReactNode; user: ShellUser | null; plan: ShellPlan | null }) {
  const path = usePathname();
  const router = useRouter();
  if (!user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div className="max-w-sm"><Logo /><p className="mt-6 font-serif text-[24px] font-semibold">Accounts open in a moment.</p><p className="mt-2 text-fg-soft">Your meal is saved on this device. Come back shortly to log in.</p><Link href="/" className="mt-6 inline-block rounded-full bg-tomato px-6 py-3 font-semibold text-white">Back to the scanner</Link></div>
      </main>
    );
  }
  return (
    <ShellCtx.Provider value={{ user, plan }}>
      <FunnelProvider onUnlocked={() => router.refresh()}>
        <div className="min-h-dvh bg-bg md:flex">
          <aside className="sticky top-0 hidden h-dvh w-[248px] shrink-0 flex-col border-r border-line bg-surface px-4 py-6 md:flex">
            <Link href="/today" className="px-2"><Logo /></Link>
            <nav className="mt-8 space-y-1">
              {NAV.map(({ href, label, icon: I }) => {
                const on = path === href || path.startsWith(href + "/");
                return (
                  <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[15px] font-medium transition", on ? "bg-fg text-bg" : "text-fg-soft hover:bg-fg/5 hover:text-fg")}>
                    <I className="size-[18px]" />{label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto rounded-[16px] bg-surface-2 p-3.5 text-[13px]">
              {plan?.paid ? (
                <>
                  <p className="font-semibold">{plan.name}</p>
                  <p className="text-fg-soft">{plan.left} of {plan.limit} scans left</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fg/10"><div className="h-full rounded-full bg-tomato" style={{ width: `${plan.limit ? (100 * (plan.left ?? 0)) / plan.limit : 0}%` }} /></div>
                </>
              ) : (
                <Link href="/pricing" className="block"><p className="font-semibold">Free account</p><p className="text-fg-soft">Pick a plan to see your macros →</p></Link>
              )}
            </div>
          </aside>
          <div className="min-w-0 flex-1 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-surface/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
            {NAV.map(({ href, label, icon: I }) => {
              const on = path === href || path.startsWith(href + "/");
              const scan = href === "/scan";
              return (
                <Link key={href} href={href} className={cn("flex flex-1 flex-col items-center gap-1 py-2 text-[11px] font-medium transition active:scale-95", on ? "text-fg" : "text-fg-soft")}>
                  {scan ? <span className="-mt-5 grid size-12 place-items-center rounded-full bg-tomato text-white shadow-[0_8px_20px_-6px_rgb(229_72_47/0.7)]"><I className="size-5" /></span> : <I className="size-[22px]" strokeWidth={on ? 2.4 : 1.8} />}
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </FunnelProvider>
    </ShellCtx.Provider>
  );
}

export function PageHead({ title, sub, right }: { title: string; sub?: string; right?: React.ReactNode }) {
  return (
    <header className="flex items-end justify-between gap-4 px-4 pb-4 pt-6 md:px-10 md:pt-10">
      <div>
        {sub && <p className="text-[13px] text-fg-soft">{sub}</p>}
        <h1 className="font-serif text-[32px] font-semibold leading-tight tracking-[-0.03em] md:text-[40px]">{title}</h1>
      </div>
      {right}
    </header>
  );
}
