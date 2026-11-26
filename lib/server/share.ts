import "server-only";
import { createHmac } from "crypto";

const secret = () => process.env.CRON_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "macrosnap";

/** An unguessable public link for one meal: <id-b64url>.<hmac>. */
export function shareToken(mealId: string) {
  const id = Buffer.from(mealId.replace(/-/g, ""), "hex").toString("base64url");
  return `${id}.${createHmac("sha256", secret()).update(mealId).digest("base64url").slice(0, 16)}`;
}

export function readToken(token: string): string | null {
  const [id, sig] = token.split(".");
  if (!id || !sig) return null;
  const hex = Buffer.from(id, "base64url").toString("hex");
  if (hex.length !== 32) return null;
  const mealId = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  return shareToken(mealId) === token ? mealId : null;
}
