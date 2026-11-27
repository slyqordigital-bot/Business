import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Flame, Gamepad2, Shield, Sparkles, Swords, TrendingUp, Trophy } from "lucide-react";
import { getCtx, nextPlan, questQuota, requirePaid } from "@/lib/server/context";
import { admin, balance, dailyPace, goalReward, projection, rewards, streak } from "@/lib/server/game";
import { PageHead } from "@/components/app/AppShell";
import { ConfirmPaid } from "@/components/app/ConfirmPaid";
import { Locked } from "@/components/app/Locked";
import { RewardIcon } from "@/components/app/RewardIcon";
import { CountUp } from "@/components/ui/CountUp";
import { hasFeature, shortName } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ paid?: string; ref?: string }> }) {
  const sp = await searchParams;
  if (sp.paid === "1" && sp.ref && (await getCtx())) return <ConfirmPaid refId={sp.ref.slice(0, 120)} />;
  const ctx = await requirePaid();
  const uid = ctx.user.id;
  const db = admin();
  const [bal, st, q, list, { data: openQuests }, { data: ledger }, { count: games }] = await Promise.all([
    balance(uid),
    streak(uid, ctx.profile.tz_offset, ctx.plan.level),
    questQuota(uid, ctx.plan),
    rewards(),
    db.from("quests").select("id,title,rule,rarity,points").eq("user_id", uid).eq("status", "open").order("created_at", { ascending: false }).order("position").limit(1),
    db.from("points").select("id,amount,kind,note,created_at").eq("user_id", uid).order("created_at", { ascending: false }).limit(6),
    db.from("games").select("id", { count: "exact", head: true }).eq("user_id", uid),
  ]);
  const goal = goalReward(list, ctx.profile.answers.goal);
  const pace = dailyPace(ctx.plan.level, ctx.profile.answers.when);
  const proj = goal ? projection(bal, pace, goal.cost) : null;
  const next = nextPlan(ctx.plans, ctx.plan.level);
  const nextName = next ? shortName(next.name) : null;
  const today = openQuests?.[0];
  const name = ctx.profile.gamer_tag || ctx.user.name || "player";

  return (
    <div>
      <PageHead sub={`[ gg, ${name} ]`} title="Dashboard" />
      <div className="mx-auto grid max-w-[1040px] gap-4 px-4 pb-10 md:grid-cols-3 md:px-10">
        <section className="hud hud-corners p-5 md:col-span-2" data-testid="balance">
          <p className="label-mono text-fg-soft">[ points ]</p>
          <p className="mt-2 font-display text-[64px] font-bold leading-none text-lime md:text-[80px]"><CountUp to={bal} /></p>
          <p className="mt-2 text-[14px] text-fg-soft">{q.used} of {q.limit} quests cleared this month · {ctx.plan.plan ? shortName(ctx.plan.plan.name) : ""} boost ×{[1, 1, 1.5, 2][ctx.plan.level]}</p>
          <div className="xp-track mt-3 h-2"><div className="xp-fill" style={{ width: `${q.limit ? (100 * q.used) / q.limit : 0}%` }} /></div>
          {q.left === 0 && nextName && <p className="mt-3 text-[14px] text-pink">Monthly quests done. {nextName} gives you more.</p>}
        </section>

        <section className="hud p-5">
          <div className="flex items-center gap-3">
            <span className={cn("grid size-12 place-items-center rounded-[14px]", st.count ? "bg-pink/15 text-pink" : "bg-white/5 text-fg-soft")}><Flame className="size-6" /></span>
            <div><p className="font-display text-[32px] font-bold leading-none">{st.count} day{st.count === 1 ? "" : "s"}</p><p className="text-[13px] text-fg-soft">{st.today ? "Streak safe today" : st.count ? "Clear a quest to keep it" : "Clear a quest to start one"}</p></div>
          </div>
          <div className="mt-4 flex gap-1.5">{st.week.map((d) => <span key={d.day} title={d.day} className={cn("h-2 flex-1 rounded-full", d.on ? "bg-pink shadow-[0_0_8px_var(--pink)]" : "bg-white/10")} />)}</div>
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-fg-soft"><Shield className="size-3.5 text-cyan" />{hasFeature(ctx.plan.level, "shields") ? "Streak shields on: one missed day a week is covered." : "Streak shields come with Grinder."}</p>
        </section>

        <section className="hud p-5 md:col-span-2">
          <p className="label-mono flex items-center gap-2 text-fg-soft"><Swords className="size-3.5 text-cyan" />[ next quest ]</p>
          {today ? (
            <>
              <p className="mt-2 font-display text-[28px] font-bold uppercase leading-none">{today.title}</p>
              <p className="mt-2 text-[15px] text-fg/85">{today.rule}</p>
              <Link href="/quests" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-[15px] font-semibold text-void active:scale-[0.97]">Clear it · +{Math.round(today.points * [1, 1, 1.5, 2][ctx.plan.level])}<ArrowRight className="size-4" /></Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-[15px] text-fg-soft">You cleared every quest in your run. GG.</p>
              <Link href="/quests" className="mt-4 inline-flex h-11 items-center gap-2 rounded-full bg-lime px-5 text-[15px] font-semibold text-void"><Sparkles className="size-4" />Cook up 7 more</Link>
            </>
          )}
        </section>

        <section className="hud p-5">
          <p className="label-mono flex items-center gap-2 text-fg-soft"><Gamepad2 className="size-3.5 text-cyan" />[ game sync ]</p>
          <p className="mt-2 font-display text-[28px] font-bold leading-none">{games ?? 0} game{games === 1 ? "" : "s"} linked</p>
          <p className="mt-1 text-[13px] text-fg-soft">Start the session timer when you play: 1 pt every 5 min.</p>
          <Link href="/profile" className="mt-4 inline-flex h-10 items-center gap-2 rounded-full px-4 text-[14px] font-semibold ring-1 ring-line hover:bg-white/5">Open Game Sync<ArrowRight className="size-4" /></Link>
        </section>

        {goal && (
          <section className="hud p-5 md:col-span-2">
            <p className="label-mono flex items-center gap-2 text-fg-soft"><Trophy className="size-3.5 text-lime" />[ your goal ]</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid size-14 place-items-center rounded-[16px] bg-gradient-to-br from-violet/40 to-cyan/30"><RewardIcon name={goal.icon} className="size-7" /></span>
              <div className="min-w-0 flex-1"><p className="font-display text-[24px] font-bold uppercase leading-none">{goal.name}</p><p className="mt-1 text-[14px] text-fg-soft tabular">{bal.toLocaleString("en-US")} / {goal.cost.toLocaleString("en-US")} pts</p></div>
              <Link href="/rewards" className="hidden text-[14px] font-semibold text-lime sm:block">Reward Shop →</Link>
            </div>
            <div className="xp-track mt-4 h-3"><div className="xp-fill" style={{ width: `${Math.max(1.5, Math.min(100, (100 * bal) / goal.cost))}%` }} /></div>
            <Locked level={hasFeature(ctx.plan.level, "projection") ? 3 : ctx.plan.level} next={nextName} className="mt-4" reason="Your 30-day projection comes with Grinder.">
              <div className="flex items-start gap-3 rounded-[14px] bg-white/[0.04] p-3.5">
                <TrendingUp className="mt-0.5 size-5 shrink-0 text-lime" />
                <p className="text-[14px]">{proj?.days === 0 ? "You have enough points to redeem it now." : <>At your pace (~{pace} pts a day) you reach it around <b>{proj?.date ? new Date(proj.date).toLocaleDateString("en-US", { month: "long", day: "numeric" }) : "—"}</b>. About {proj?.in30.toLocaleString("en-US")} pts in 30 days. An estimate, not a promise.</>}</p>
              </div>
            </Locked>
          </section>
        )}

        <section className="hud p-5">
          <p className="label-mono text-fg-soft">[ recent ]</p>
          {ledger?.length ? (
            <ul className="mt-3 space-y-2.5">
              {ledger.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 text-[14px]">
                  <span className="min-w-0 truncate">{l.note}</span>
                  <span className={cn("shrink-0 font-display text-[17px] font-bold tabular", l.amount > 0 ? "text-lime" : "text-pink")}>{l.amount > 0 ? "+" : ""}{l.amount.toLocaleString("en-US")}</span>
                </li>
              ))}
            </ul>
          ) : <p className="mt-3 text-[14px] text-fg-soft">No points yet. Your first quest gets you on the board.</p>}
        </section>
      </div>
    </div>
  );
}
