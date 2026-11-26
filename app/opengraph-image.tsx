import { ogCard } from "@/lib/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MacroSnap — snap your plate, get your macros";

export default function Og() {
  return ogCard(null);
}
