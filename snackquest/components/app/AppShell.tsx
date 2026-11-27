"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext } from "react";
import { Gift, LayoutDashboard, Swords, UserRound, Gamepad2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { FunnelProvider } from "@/components/funnel/Funnel";
import { cn } from "@/lib/utils";

export type ShellPlan = { paid: boolean; level: number; name: string | null; left: number | null; limit: number | null; points: number };
type ShellUser = { email: string; name: string | null; avatar: string | null };

const ShellCtx = createContext<{ plan: ShellPlan | null; user: ShellUser | null }>({ plan: null, user: null });
export const useShell = () => useContext(ShellCtx);

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/quests", label: "Quests", icon: Swords },
  { href: "/rewards", label: "Rewards", icon: Gift },
  { href: "/profile", label: "Profile", icon: Gamepad2 },
  { href: "/account", label: "Account", icon: UserRound },
];

/** Sidebar on a computer, bottom tab bar on a phone. */
export function AppShell({ children, user, plan }: { children: React.ReactNode; user: ShellUser | null; plan: ShellPlan | null }) {
  const path = usePathname();
  const router = useRouter();
  if (!user) {
    return (
      <main className="grid min-h-dvh place-items-center bg-bg px-6 text-center">
        <div className="max-w-sm"><Logo /><p className="mt-6 font-display text-[26px] font-bold uppercase">Accounts open in a moment.</p><p className="mt-2 text-fg-soft">Come back shortly to log in.</p><Link href="/" className="mt-6 inline-block rounded-full bg-lime px-6 py-3 font-semibold text-void">Back to SnackQuest</Link></div>
      </main>
    );
  }
  return (
    <ShellCtx.Provider value={{ user, plan }}>
      <FunnelProvider onUnlocked={() => router.refresh()}>
        <div className="min-h-dvh bg-bg md:flex">
          <aside className="sticky top-0 hidden h-dvh w-[252px] shrink-0 flex-col border-r border-line bg-night px-4 py-6 md:flex">
            <Link href="/dashboard" className="px-2"><Logo /></Link>
            <nav className="mt-8 space-y-1">
              {NAV.map(({ href, label, icon: I }) => {
                const on = path === href || path.startsWith(href + "/");
                return (
                  <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-[14px] px-3 py-2.5 text-[15px] font-medium transition", on ? "bg-lime/10 text-lime shadow-[inset_2px_0_0_var(--lime)]" : "text-fg-soft hover:bg-white/5 hover:text-fg")}>
                    <I className="size-[18px]" />{label}
                  </Link>
                );
              })}
            </nav>
            {plan?.paid && (
              <div className="hud mt-auto p-3.5 text-[13px]">
                <p className="label-mono text-cyan">[ {plan.name} ]</p>
                <p className="mt-1.5 font-display text-[26px] font-bold leading-none tabular text-lime">{plan.points.toLocaleString("en-US")} <span className="text-[13px] font-semibold text-fg-soft">pts</span></p>
                <p className="mt-2 text-fg-soft">{plan.left} of {plan.limit} quests left this month</p>
                <div className="xp-track mt-2 h-1.5"><div className="xp-fill" style={{ width: `${plan.limit ? (100 * (plan.left ?? 0)) / plan.limit : 0}%` }} /></div>
              </div>
            )}
          </aside>
          <div className="min-w-0 flex-1 pb-[calc(76px+env(safe-area-inset-bottom))] md:pb-0">{children}</div>
          <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-night/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
            {NAV.map(({ href, label, icon: I }) => {
              const on = path === href || path.startsWith(href + "/");
              return (
                <Link key={href} href={href} className={cn("relative flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition active:scale-95", on ? "text-lime" : "text-fg-soft")}>
                  {on && <span className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-lime shadow-[0_0_10px_var(--lime)]" />}
                  <I className="size-[22px]" strokeWidth={on ? 2.4 : 1.8} />
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
    <header className="mx-auto flex max-w-[1040px] items-end justify-between gap-4 px-4 pb-4 pt-6 md:px-10 md:pt-10">
      <div className="min-w-0">
        {sub && <p className="label-mono text-cyan">{sub}</p>}
        <h1 className="mt-1 font-display text-[36px] font-bold uppercase leading-[1] md:text-[46px]">{title}</h1>
      </div>
      {right}
    </header>
  );
}
