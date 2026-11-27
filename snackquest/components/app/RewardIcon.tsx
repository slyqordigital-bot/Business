import { Gamepad2, Gift, Headphones, Keyboard, Mouse, Ticket } from "lucide-react";

const MAP = { gift: Gift, mouse: Mouse, gamepad: Gamepad2, keyboard: Keyboard, headphones: Headphones, ticket: Ticket };

export function RewardIcon({ name, className }: { name: string; className?: string }) {
  const I = MAP[name as keyof typeof MAP] ?? Gift;
  return <I className={className} />;
}
