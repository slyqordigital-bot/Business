import { notFound } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCtx } from "@/lib/server/context";
import { supabaseServer } from "@/lib/supabase/server";
import { MEAL_COLS, viewMeals } from "@/lib/server/meals";
import { shareToken } from "@/lib/server/share";
import { MealDetail } from "@/components/app/MealDetail";
import type { DbMeal } from "@/lib/meals";
import { env } from "@/lib/env";

export const metadata = { title: "Your meal" };

export default async function MealPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const ctx = await getCtx();
  const sb = await supabaseServer();
  if (!ctx || !sb) notFound();
  const { data } = await sb.from("meals").select(MEAL_COLS).eq("id", id).maybeSingle();
  if (!data) notFound();
  const [meal] = await viewMeals(sb, [data as DbMeal], ctx.plan);
  const shareUrl = ctx.plan.paid ? `${env.siteUrl}/s/${shareToken(id)}` : null;
  return (
    <div>
      <div className="px-4 pt-4 md:px-10 md:pt-8">
        <Link href="/today" className="inline-flex items-center gap-1 rounded-full py-2 pr-3 text-[14px] text-fg-soft hover:text-fg"><ChevronLeft className="size-4" />Today</Link>
      </div>
      <Suspense><MealDetail meal={meal} level={ctx.plan.level} shareUrl={shareUrl} /></Suspense>
    </div>
  );
}
