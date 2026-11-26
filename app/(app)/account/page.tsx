import { requireCtx, quota } from "@/lib/server/context";
import { PageHead } from "@/components/app/AppShell";
import { AccountPanel } from "@/components/app/AccountPanel";
import { shortName } from "@/lib/plans";

export const metadata = { title: "Account" };

export default async function Account() {
  const ctx = await requireCtx();
  const q = ctx.plan.paid ? await quota(ctx.user.id, ctx.plan) : null;
  return (
    <div>
      <PageHead title="Account" />
      <div className="mx-auto max-w-[640px] px-4 pb-10 md:px-10">
        <AccountPanel email={ctx.user.email} name={ctx.user.name} level={ctx.plan.level}
          plan={ctx.plan.plan ? shortName(ctx.plan.plan.name) : null} status={ctx.plan.status} until={ctx.plan.until} used={q?.used ?? 0} limit={q?.limit ?? 0} />
      </div>
    </div>
  );
}
