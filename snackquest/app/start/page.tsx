import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getCtx } from "@/lib/server/context";
import { runView } from "@/lib/server/run";
import { steamReady } from "@/lib/steam";
import { StartFlow } from "@/components/funnel/StartFlow";
import { shortName } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Build your Snack Quest", robots: { index: false } };

/** The personal flow: 4 questions → gamer tag (or Steam) → the work → the locked result under the paywall. */
export default async function Start() {
  const ctx = await getCtx();
  if (!ctx) redirect("/signup");
  const run = ctx.profile.onboarded ? await runView(ctx.user.id, null, ctx.plan.level, ctx.profile.answers.when) : null;
  if (ctx.plan.paid && run) redirect("/dashboard");
  const a = ctx.profile.answers;
  return (
    <StartFlow
      initialAnswers={{ game: a.game, snack: a.snack, when: a.when, goal: a.goal, tag: a.tag }}
      initialRun={run}
      paid={ctx.plan.paid}
      steamEnabled={steamReady()}
      planName={ctx.plan.plan ? shortName(ctx.plan.plan.name) : null}
    />
  );
}
