import type { Metadata } from "next";
import { nextPlan, questQuota, requirePaid } from "@/lib/server/context";
import { admin } from "@/lib/server/game";
import { PageHead } from "@/components/app/AppShell";
import { QuestsClient } from "@/components/app/QuestsClient";
import { QUOTAS, hasFeature, shortName } from "@/lib/plans";

export const metadata: Metadata = { title: "Quests" };
export const dynamic = "force-dynamic";

export default async function Quests() {
  const ctx = await requirePaid();
  const db = admin();
  const uid = ctx.user.id;
  const days = QUOTAS[ctx.plan.level].historyDays;
  let hist = db.from("quests").select("id,title,rule,proof,rarity,points,status,verdict,awarded,custom,photo_path,completed_at").eq("user_id", uid).eq("status", "done").order("completed_at", { ascending: false }).limit(60);
  if (days) hist = hist.gte("completed_at", new Date(Date.now() - days * 86_400_000).toISOString());
  const [{ data: open }, { data: done }, q, { data: run }] = await Promise.all([
    db.from("quests").select("id,title,rule,proof,rarity,points,status,custom,created_at,position").eq("user_id", uid).eq("status", "open").order("created_at", { ascending: false }).order("position").limit(30),
    hist,
    questQuota(uid, ctx.plan),
    db.from("runs").select("title,share_token").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const paths = (done || []).map((d) => d.photo_path).filter(Boolean) as string[];
  const signed = paths.length ? (await db.storage.from("proofs").createSignedUrls(paths, 3600)).data || [] : [];
  const urlOf = new Map(signed.map((s) => [s.path, s.signedUrl]));
  const next = nextPlan(ctx.plans, ctx.plan.level);
  return (
    <div>
      <PageHead sub="[ snack quests ]" title="Quests" />
      <QuestsClient
        level={ctx.plan.level}
        mult={QUOTAS[ctx.plan.level].multiplier}
        open={(open || []).map((x) => ({ ...x, status: "open" as const }))}
        done={(done || []).map((x) => ({ ...x, status: "done" as const, photo: x.photo_path ? urlOf.get(x.photo_path) ?? null : null }))}
        quota={q}
        nextName={next ? shortName(next.name) : null}
        custom={hasFeature(ctx.plan.level, "custom_quests")}
        historyDays={days}
        run={run ? { title: run.title, token: run.share_token } : null}
      />
    </div>
  );
}
