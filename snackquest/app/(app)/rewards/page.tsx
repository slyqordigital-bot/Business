import type { Metadata } from "next";
import { requirePaid } from "@/lib/server/context";
import { admin, balance, rewards } from "@/lib/server/game";
import { PageHead } from "@/components/app/AppShell";
import { RewardsClient } from "@/components/app/RewardsClient";
import { hasFeature } from "@/lib/plans";

export const metadata: Metadata = { title: "Reward Shop" };
export const dynamic = "force-dynamic";

export default async function Rewards() {
  const ctx = await requirePaid();
  const [bal, list, { data: reds }] = await Promise.all([
    balance(ctx.user.id),
    rewards(),
    admin().from("redemptions").select("id,reward_name,cost,status,tracking,created_at").eq("user_id", ctx.user.id).order("created_at", { ascending: false }).limit(30),
  ]);
  return (
    <div>
      <PageHead sub="[ reward shop ]" title="Rewards" />
      <RewardsClient balance={bal} rewards={list} redemptions={reds || []} priority={hasFeature(ctx.plan.level, "priority")} goal={ctx.profile.answers.goal ?? null} />
    </div>
  );
}
