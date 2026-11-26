import "server-only";
import { supabaseAdmin } from "../supabase/server";

/** A shared quest run, by its public token (titles and counts only, never photos or emails). */
export async function sharedRun(token: string) {
  if (!/^[a-f0-9]{18}$/.test(token)) return null;
  const db = supabaseAdmin();
  if (!db) return null;
  const { data: run } = await db.from("runs").select("id,user_id,title,game,snack").eq("share_token", token).maybeSingle();
  if (!run) return null;
  const [{ data: quests }, { data: prof }, { data: pts }] = await Promise.all([
    db.from("quests").select("title,rarity,status,points").eq("run_id", run.id).order("position"),
    db.from("profiles").select("gamer_tag").eq("id", run.user_id).maybeSingle(),
    db.rpc("points_balance", { uid: run.user_id }),
  ]);
  const q = quests || [];
  return {
    title: run.title,
    game: run.game,
    snack: run.snack,
    tag: prof?.gamer_tag || "player",
    quests: q.map((x) => ({ title: x.title, rarity: x.rarity as "common" | "rare" | "legendary", done: x.status === "done", points: x.points })),
    cleared: q.filter((x) => x.status === "done").length,
    total: q.length,
    points: Number(pts ?? 0),
  };
}
