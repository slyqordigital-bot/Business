import "server-only";
import { createHash } from "crypto";

const MAX = 6 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export async function readPhoto(form: FormData) {
  const f = form.get("photo");
  if (!(f instanceof Blob)) return { error: "Add a photo of your meal." } as const;
  if (f.size === 0 || f.size > MAX) return { error: "That photo is too large. Try one under 6 MB." } as const;
  const type = f.type || "image/jpeg";
  if (!TYPES.includes(type)) return { error: "Use a JPG, PNG, WEBP or HEIC photo." } as const;
  return { buf: Buffer.from(await f.arrayBuffer()), type } as const;
}

export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "0.0.0.0").trim();
}

export function hashIp(ip: string) {
  return createHash("sha256").update(ip + (process.env.SUPABASE_SERVICE_ROLE_KEY || "ms")).digest("hex").slice(0, 32);
}
