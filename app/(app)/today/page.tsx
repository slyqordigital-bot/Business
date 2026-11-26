import Link from "next/link";
import { Camera, Flame } from "lucide-react";
import { requireCtx } from "@/lib/server/context";
import { supabaseServer } from "@/lib/supabase/server";
import { viewMeals, MEAL_COLS } from "@/lib/server/meals";
import { dayStart, mealsSince, streak, sumMeals } from "@/lib/server/data";
import { PageHead } from "@/components/app/AppShell";
import { MealRow } from "@/components/app/MealRow";
import { DayRings } from "@/components/app/DayRings";
import { LockedTeaser } from "@/components/app/LockedTeaser";
import type { DbMeal } from "@/lib/meals";

export const metadata = { title: "Today" };

export default async function Today() {
  const ctx = await requireCtx();
  const sb = await supabaseServer();
  if (!sb) return null;
  const tz = ctx.profile?.tz_offset ?? 0;
  const goals = ctx.profile?.goals ?? { kcal: 2000, protein: 130, carbs: 220, fat: 70 };
  const hello = ctx.user.name ? `Hi ${ctx.user.name.split(" ")[0]}` : "Hi there";

  if (!ctx.plan.paid) {
    // a returning visitor who did not pay lands on their result under the paywall
    const { data } = await sb.from("meals").select(MEAL_COLS).order("eaten_at", { ascending: false }).limit(1);
    const [latest] = data?.length ? await viewMeals(sb, data as DbMeal[], ctx.plan) : [];
    return (
      <div>
        <PageHead title="Today" sub={hello} />
        <div className="mx-auto max-w-[760px] px-4 md:px-10">
          {latest ? <LockedTeaser meal={latest} /> : (
            <div className="recipe-card p-8 text-center">
              <p className="font-serif text-[24px] font-semibold">Snap your first meal.</p>
              <p className="mt-2 text-fg-soft">One photo. MacroSnap finds every food on the plate.</p>
              <Link href="/scan" className="mt-5 inline-flex items-center gap-2 rounded-full bg-tomato px-6 py-3.5 font-semibold text-white"><Camera className="size-5" />Snap my macros</Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  const meals = await mealsSince(sb, dayStart(tz));
  const [views, s] = await Promise.all([viewMeals(sb, meals, ctx.plan), streak(sb, tz)]);
  const t = sumMeals(meals);

  return (
    <div>
      <PageHead title="Today" sub={hello}
        right={<span className="flex items-center gap-1.5 rounded-full bg-surface px-3.5 py-2 text-[14px] font-semibold ring-1 ring-line" title="Days in a row with at least one meal logged"><Flame className="size-4 text-tomato" fill={s.n ? "#E5482F" : "none"} />{s.n}-day streak</span>} />
      <div className="mx-auto max-w-[900px] space-y-6 px-4 pb-10 md:px-10">
        <DayRings t={t} goals={goals} />
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-[22px] font-semibold tracking-[-0.02em]">Meals</h2>
            <Link href="/scan" className="flex items-center gap-1.5 rounded-full bg-tomato px-4 py-2 text-[14px] font-semibold text-white active:scale-95"><Camera className="size-4" />Snap a meal</Link>
          </div>
          {views.length ? <div className="space-y-2.5">{views.map((m) => <MealRow key={m.id} m={m} />)}</div> : (
            <div className="rounded-[20px] border border-dashed border-line p-8 text-center">
              <p className="text-fg-soft">{s.n ? `Keep your ${s.n}-day streak going: snap your first meal today.` : "Nothing logged yet today. Snap your next meal."}</p>
              <Link href="/scan" className="mt-4 inline-flex items-center gap-2 rounded-full bg-fg px-5 py-3 text-[15px] font-semibold text-bg"><Camera className="size-4" />Snap a meal</Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
