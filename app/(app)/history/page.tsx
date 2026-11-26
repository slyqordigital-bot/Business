import { Download } from "lucide-react";
import { requireCtx } from "@/lib/server/context";
import { supabaseServer } from "@/lib/supabase/server";
import { viewMeals } from "@/lib/server/meals";
import { dayStart, localDay, mealsSince } from "@/lib/server/data";
import { PageHead } from "@/components/app/AppShell";
import { MealRow } from "@/components/app/MealRow";
import { Locked } from "@/components/app/Locked";
import { Trends, type DayPoint } from "@/components/app/Trends";
import { QUOTAS, hasFeature, shortName } from "@/lib/plans";

export const metadata = { title: "History" };

export default async function History() {
  const ctx = await requireCtx();
  const sb = await supabaseServer();
  if (!sb) return null;
  const tz = ctx.profile?.tz_offset ?? 0;
  const goal = ctx.profile?.goals?.kcal ?? 2000;
  const histDays = QUOTAS[ctx.plan.level].historyDays;
  const since = dayStart(tz, histDays ?? 365);
  const meals = await mealsSince(sb, since, 1000);
  const views = await viewMeals(sb, meals, ctx.plan);
  const name = (lvl: number) => shortName(ctx.plans.find((p) => p.level === lvl)?.name ?? (lvl === 2 ? "Plate" : "Feast"));

  // days for trends (last 30)
  const byDay = new Map<string, DayPoint>();
  for (let i = 29; i >= 0; i--) { const d = localDay(new Date(Date.now() - i * 86_400_000), tz); byDay.set(d, { day: d, kcal: 0, protein: 0 }); }
  for (const m of meals) { const p = byDay.get(localDay(m.eaten_at, tz)); if (p) { p.kcal += m.kcal; p.protein += Number(m.protein); } }
  const points = [...byDay.values()];

  // week by week
  const week = (from: number) => {
    const ms = meals.filter((m) => { const t = new Date(m.eaten_at).getTime(); return t >= dayStart(tz, from + 6).getTime() && t < dayStart(tz, from - 1).getTime(); });
    const days = new Set(ms.map((m) => localDay(m.eaten_at, tz))).size || 1;
    return { kcal: Math.round(ms.reduce((a, m) => a + m.kcal, 0) / days), protein: Math.round(ms.reduce((a, m) => a + Number(m.protein), 0) / days), days: new Set(ms.map((m) => localDay(m.eaten_at, tz))).size };
  };
  const thisW = week(0), lastW = week(7);

  const groups = new Map<string, typeof views>();
  views.forEach((v, i) => { const k = localDay(meals[i].eaten_at, tz); groups.set(k, [...(groups.get(k) || []), v]); });

  const level = ctx.plan.level;
  const trends = <Trends days={points} goal={goal} />;
  const weekly = (
    <div className="recipe-card grid grid-cols-2 gap-4 p-5">
      {[["This week", thisW], ["Last week", lastW]].map(([l, w]) => {
        const x = w as typeof thisW;
        return <div key={l as string}><p className="text-[13px] text-fg-soft">{l as string}</p><p className="font-serif text-[26px] font-semibold tabular-nums">{x.kcal} <span className="text-[14px] font-normal text-fg-soft">cal / day</span></p><p className="text-[13px] text-fg-soft">{x.protein} g protein · {x.days} days logged</p></div>;
      })}
    </div>
  );

  return (
    <div>
      <PageHead title="History" sub={histDays ? `Your last ${histDays} days` : "Everything you've logged"}
        right={hasFeature(level, "export") ? <a href="/api/export" className="flex items-center gap-1.5 rounded-full bg-surface px-4 py-2 text-[14px] font-semibold ring-1 ring-line"><Download className="size-4" />CSV</a> : undefined} />
      <div className="mx-auto max-w-[900px] space-y-8 px-4 pb-10 md:px-10">
        {ctx.plan.paid && (
          <section className="space-y-3">
            <h2 className="font-serif text-[22px] font-semibold tracking-[-0.02em]">Trends</h2>
            {hasFeature(level, "trends") ? trends : <Locked level={1} planName={name(2)} reason="See how your calories and protein trend.">{trends}</Locked>}
            <h2 className="pt-3 font-serif text-[22px] font-semibold tracking-[-0.02em]">Week by week</h2>
            {hasFeature(level, "weekly") ? weekly : <Locked level={level >= 2 ? 2 : 1} planName={level >= 2 ? name(3) : name(2)} reason="Compare this week with last week.">{weekly}</Locked>}
          </section>
        )}
        <section className="space-y-6">
          {groups.size === 0 && (
            <div className="rounded-[20px] border border-dashed border-line p-8 text-center text-fg-soft">No meals yet. Snap your first one and it shows up here.</div>
          )}
          {[...groups.entries()].map(([day, list]) => {
            const kcal = list.reduce((a, m) => a + (m.totals?.kcal ?? 0), 0);
            return (
              <div key={day}>
                <div className="mb-2 flex items-baseline justify-between">
                  <h3 className="text-[15px] font-semibold">{new Date(day + "T12:00:00Z").toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", timeZone: "UTC" })}</h3>
                  {ctx.plan.paid && <span className="font-mono text-[13px] text-fg-soft tabular-nums">{kcal} cal</span>}
                </div>
                <div className="space-y-2.5">{list.map((m) => <MealRow key={m.id} m={m} />)}</div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}
