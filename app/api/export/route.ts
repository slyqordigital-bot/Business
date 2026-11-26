import { getCtx } from "@/lib/server/context";
import { supabaseServer } from "@/lib/supabase/server";
import { hasFeature } from "@/lib/plans";
import { track } from "@/lib/kwop";

const esc = (s: unknown) => `"${String(s ?? "").replace(/"/g, '""')}"`;

export async function GET() {
  const ctx = await getCtx();
  const sb = await supabaseServer();
  if (!ctx || !sb) return new Response("Please log in.", { status: 401 });
  if (!hasFeature(ctx.plan.level, "export")) return new Response("CSV export comes with Feast.", { status: 402 });
  const { data } = await sb.from("meals").select("name,eaten_at,kcal,protein,carbs,fat,items").order("eaten_at", { ascending: false }).limit(5000);
  const rows = [["date", "time", "meal", "calories", "protein_g", "carbs_g", "fat_g", "foods"].join(",")];
  for (const m of data || []) {
    const d = new Date(m.eaten_at);
    rows.push([d.toISOString().slice(0, 10), d.toISOString().slice(11, 16), esc(m.name), m.kcal, m.protein, m.carbs, m.fat,
      esc((m.items as { name: string }[]).map((i) => i.name).join("; "))].join(","));
  }
  track("feature_used", ctx.user.email, "csv_export");
  return new Response(rows.join("\n"), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="macrosnap-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
