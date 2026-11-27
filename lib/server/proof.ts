import "server-only";
import { unstable_cache } from "next/cache";
import { supabaseAdmin } from "@/lib/supabase/server";

/** Shown under the hero only once it is worth showing (a TRUE count, never invented). */
export const PROOF_MIN = 500;

/** Real number of plates scanned (saved meals + scans tried before sign-up), refreshed hourly. */
export const platesScanned = unstable_cache(
  async (): Promise<number | null> => {
    try {
      const sb = supabaseAdmin();
      if (!sb) return null;
      const [m, t] = await Promise.all([
        sb.from("meals").select("id", { count: "exact", head: true }),
        sb.from("tries").select("id", { count: "exact", head: true }).is("claimed_by", null),
      ]);
      if (m.error || t.error) return null;
      return (m.count ?? 0) + (t.count ?? 0);
    } catch {
      return null;
    }
  },
  ["plates-scanned"],
  { revalidate: 3600 },
);
