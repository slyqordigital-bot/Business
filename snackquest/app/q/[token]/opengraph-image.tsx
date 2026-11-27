import { ogCard } from "@/lib/og";
import { sharedRun } from "@/lib/server/shared";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A SnackQuest run";

export default async function Og({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return ogCard(await sharedRun(token));
}
