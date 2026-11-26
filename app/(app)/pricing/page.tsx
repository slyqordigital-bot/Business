import { requireCtx } from "@/lib/server/context";
import { PricingClient } from "@/components/app/PricingClient";

export const metadata = { title: "Plans" };

/** The paywall for logged-in users (never linked from the landing page; checkouts return here when canceled). */
export default async function Pricing() {
  const ctx = await requireCtx();
  return <PricingClient level={ctx.plan.level} />;
}
