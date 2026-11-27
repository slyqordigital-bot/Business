import type { Metadata } from "next";
import { nextPlan, requirePaid } from "@/lib/server/context";
import { admin, balance, minutesToday } from "@/lib/server/game";
import { steamReady } from "@/lib/steam";
import { PageHead } from "@/components/app/AppShell";
import { ProfileClient } from "@/components/app/ProfileClient";
import { POINTS, QUOTAS, shortName } from "@/lib/plans";

export const metadata: Metadata = { title: "Profile" };
export const dynamic = "force-dynamic";

export default async function Profile() {
  const ctx = await requirePaid();
  const db = admin();
  const uid = ctx.user.id;
  const [{ data: games }, { data: active }, { data: earned }, { count: cleared }, { data: mins }, bal, today, { data: run }] = await Promise.all([
    db.from("games").select("id,name,source").eq("user_id", uid).order("created_at"),
    db.from("sessions").select("id,game,minutes,started_at,last_beat").eq("user_id", uid).eq("source", "timer").is("ended_at", null).gte("last_beat", new Date(Date.now() - 10 * 60_000).toISOString()).limit(1).maybeSingle(),
    db.from("points").select("amount").eq("user_id", uid).gt("amount", 0),
    db.from("quests").select("id", { count: "exact", head: true }).eq("user_id", uid).eq("status", "done"),
    db.from("sessions").select("minutes").eq("user_id", uid),
    balance(uid),
    minutesToday(uid, ctx.profile.tz_offset),
    db.from("runs").select("share_token").eq("user_id", uid).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);
  const next = nextPlan(ctx.plans, ctx.plan.level);
  return (
    <div>
      <PageHead sub="[ player card ]" title="Profile" />
      <ProfileClient
        tag={ctx.profile.gamer_tag || "Player 1"}
        answers={{ game: ctx.profile.answers.game, snack: ctx.profile.answers.snack, when: ctx.profile.answers.when, goal: ctx.profile.answers.goal }}
        level={ctx.plan.level}
        nextName={next ? shortName(next.name) : null}
        games={games || []}
        gamesLimit={QUOTAS[ctx.plan.level].games}
        active={active ?? null}
        steam={{ enabled: steamReady(), name: ctx.profile.steam_name, avatar: ctx.profile.steam_avatar, synced: ctx.profile.steam_synced_at }}
        stats={{ balance: bal, earned: (earned || []).reduce((a, r) => a + r.amount, 0), cleared: cleared ?? 0, minutes: (mins || []).reduce((a, r) => a + (r.minutes || 0), 0) }}
        today={{ minutes: today, cap: POINTS.dailyMinutesCap }}
        shareToken={run?.share_token ?? null}
      />
    </div>
  );
}
