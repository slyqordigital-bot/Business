import { redirect } from "next/navigation";
import { getCtx, questQuota } from "@/lib/server/context";
import { balance } from "@/lib/server/game";
import { supabaseReady } from "@/lib/env";
import { AppShell } from "@/components/app/AppShell";
import { shortName } from "@/lib/plans";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  if (!supabaseReady()) return <AppShell user={null} plan={null}>{children}</AppShell>;
  const ctx = await getCtx();
  if (!ctx) redirect("/login");
  const [q, pts] = ctx.plan.paid ? await Promise.all([questQuota(ctx.user.id, ctx.plan), balance(ctx.user.id)]) : [null, 0];
  return (
    <AppShell
      user={{ email: ctx.user.email, name: ctx.user.name, avatar: ctx.user.avatar }}
      plan={{ paid: ctx.plan.paid, level: ctx.plan.level, name: ctx.plan.plan ? shortName(ctx.plan.plan.name) : null, left: q?.left ?? null, limit: q?.limit ?? null, points: pts }}>
      {children}
    </AppShell>
  );
}
