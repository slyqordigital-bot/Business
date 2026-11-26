import { NextResponse } from "next/server";
import { getPlans } from "@/lib/kwop";

/** Public plan list (names, ids, prices from Kwop). */
export async function GET() {
  const { plans, checkout } = await getPlans();
  return NextResponse.json({ plans, checkout }, { headers: { "Cache-Control": "public, s-maxage=60" } });
}
