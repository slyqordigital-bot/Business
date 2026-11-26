import { NextResponse } from "next/server";
import { z } from "zod";
import { aiCount, getCtx, logAi } from "@/lib/server/context";
import { buildRun, admin } from "@/lib/server/game";
import { runView } from "@/lib/server/run";
import { linkSteam, SteamError } from "@/lib/server/steamsync";
import { AiError } from "@/lib/ai";
import { POINTS } from "@/lib/plans";
import { track } from "@/lib/kwop";
import { cleanTag } from "@/lib/utils";

export const maxDuration = 60;

const Ans = z.string().trim().min(1).max(60);
const Body = z.object({
  steam: z.string().trim().max(200).optional(),
  answers: z.object({ game: Ans, snack: Ans, when: Ans.optional(), goal: Ans.optional(), tag: z.string().trim().max(32).optional() }).optional(),
});

/** GET: the latest quest run (locked parts scrambled server side). */
export async function GET() {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const run = await runView(ctx.user.id, null, ctx.plan.level, ctx.profile.answers.when);
  return NextResponse.json({ run, paid: ctx.plan.paid, plan: ctx.plan.plan });
}

/** POST: the work of the personal flow. Links Steam if given, builds the quest run with the AI, saves it. */
export async function POST(req: Request) {
  const ctx = await getCtx();
  if (!ctx) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const body = Body.safeParse(await req.json().catch(() => ({})));
  if (!body.success) return NextResponse.json({ error: "Bad request" }, { status: 400 });
  // answers sent with the request win (the last per-question save may still be in flight)
  const a = { ...ctx.profile.answers, ...(body.data.answers || {}) };
  if (body.data.answers) {
    await admin().rpc("merge_answers", { uid: ctx.user.id, patch: body.data.answers });
    if (body.data.answers.tag) await admin().from("profiles").update({ gamer_tag: cleanTag(body.data.answers.tag) }).eq("id", ctx.user.id);
  }
  if (!a.game || !a.snack) return NextResponse.json({ error: "Answer the questions first." }, { status: 400 });
  if (!ctx.plan.paid && (await aiCount(ctx.user.id, "run", 86_400_000)) >= POINTS.runsPerDay)
    return NextResponse.json({ error: "You built a few quests today already. Your latest one is saved: unlock it, or come back tomorrow." }, { status: 429 });

  let steam: Awaited<ReturnType<typeof linkSteam>> | null = null;
  let steamError: string | null = null;
  if (body.data.steam) {
    try {
      steam = await linkSteam(ctx.user.id, body.data.steam, Math.max(1, ctx.plan.level) as 1);
    } catch (e) {
      steamError = e instanceof SteamError && e.code === "not_found" ? "We couldn't find that Steam profile. You can link it later in Profile." : "Steam didn't answer. You can link it later in Profile.";
    }
  }
  try {
    await logAi(ctx.user.id, "run");
    const id = await buildRun(ctx.user.id, { ...a, steamGames: steam?.games });
    if (!ctx.profile.onboarded) {
      await admin().from("profiles").update({ onboarded: true }).eq("id", ctx.user.id);
      track("onboarding_done", ctx.user.email);
    }
    const run = await runView(ctx.user.id, id, ctx.plan.level, a.when);
    return NextResponse.json({ run, steam, steamError });
  } catch (e) {
    if (e instanceof AiError && e.code === "not_configured") return NextResponse.json({ error: "Quest building opens in a moment. Your answers are saved." }, { status: 503 });
    console.error("[run]", e);
    return NextResponse.json({ error: "Our quest builder lagged. Try again." }, { status: 502 });
  }
}
