import "server-only";
import { admin, balance, dailyPace, projection, rewards, type Reward } from "./game";
import type { Level } from "../plans";

export type QuestView = {
  id: string;
  title: string;
  rule: string;
  proof: string;
  rarity: "common" | "rare" | "legendary";
  points: number;
  status: "open" | "done";
  verdict: string | null;
  awarded: number | null;
  custom: boolean;
  locked: boolean;
};

export type RunView = {
  id: string;
  title: string;
  game: string;
  snack: string;
  share_token: string;
  created_at: string;
  quests: QuestView[];
  goal: Reward | null;
  balance: number;
  pace: number | null;
  projection: { days: number | null; date: string | null; in30: number } | null;
};

/** Same length, unreadable: locked text never reaches the browser. */
export function scramble(s: string) {
  const glyphs = "abcdefghijklmnopqrstuvwxyz";
  let seed = s.length * 7;
  return s.replace(/[A-Za-z0-9]/g, () => {
    seed = (seed * 9301 + 49297) % 233280;
    return glyphs[seed % 26];
  });
}

/** A run as the browser may see it: unpaid → quest #1 clear, the rest and the projection locked. */
export async function runView(userId: string, runId: string | null, level: Level, when?: string): Promise<RunView | null> {
  const db = admin();
  let q = db.from("runs").select("id,title,game,snack,goal_reward_id,share_token,created_at").eq("user_id", userId);
  q = runId ? q.eq("id", runId) : q.order("created_at", { ascending: false }).limit(1);
  const { data: runs } = await q;
  const run = runs?.[0];
  if (!run) return null;
  const [{ data: quests }, list, bal] = await Promise.all([
    db.from("quests").select("id,title,rule,proof,rarity,points,status,verdict,awarded,custom,position").eq("run_id", run.id).order("position"),
    rewards(),
    balance(userId),
  ]);
  const paid = level > 0;
  const goal = list.find((r) => r.id === run.goal_reward_id) ?? null;
  const pace = dailyPace(level, when);
  return {
    id: run.id,
    title: run.title,
    game: run.game,
    snack: run.snack,
    share_token: run.share_token,
    created_at: run.created_at,
    goal,
    balance: bal,
    pace: paid ? pace : null,
    projection: paid && goal ? projection(bal, pace, goal.cost) : null,
    quests: (quests || []).map((x, i) => {
      const locked = !paid && i > 0;
      return {
        id: x.id,
        title: locked ? scramble(x.title) : x.title,
        rule: locked ? scramble(x.rule) : x.rule,
        proof: locked ? scramble(x.proof) : x.proof,
        rarity: x.rarity,
        points: locked ? 0 : x.points,
        status: x.status,
        verdict: locked ? null : x.verdict,
        awarded: locked ? null : x.awarded,
        custom: x.custom,
        locked,
      } as QuestView;
    }),
  };
}
