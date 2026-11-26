/**
 * Quotas and benefits per plan level. Names, ids and prices always come from Kwop
 * (GET KWOP_API); a plan's level is its position by price, cheapest first.
 */
export type Level = 0 | 1 | 2 | 3; // 0 = no paid plan

export type Feature = "projection" | "history_all" | "shields" | "custom_quests" | "priority";

export const QUOTAS: Record<Level, { quests: number; games: number; multiplier: number; historyDays: number | null; features: Feature[] }> = {
  0: { quests: 0, games: 0, multiplier: 1, historyDays: 0, features: [] },
  1: { quests: 20, games: 1, multiplier: 1, historyDays: 30, features: [] },
  2: { quests: 60, games: 3, multiplier: 1.5, historyDays: null, features: ["projection", "history_all", "shields"] },
  3: { quests: 150, games: 10, multiplier: 2, historyDays: null, features: ["projection", "history_all", "shields", "custom_quests", "priority"] },
};

export const TAGS: Record<1 | 2 | 3, string> = {
  1: "For casual snackers",
  2: "For daily grinders",
  3: "For hardcore players",
};

export const UNLOCKS: Record<1 | 2 | 3, string[]> = {
  1: [
    "20 snack quests a month, checked from your photo",
    "Points for every quest and every play session",
    "1 linked game",
    "The Reward Shop: gift cards and gear",
    "30 days of quest history",
  ],
  2: [
    "60 snack quests a month, about 2 a day",
    "1.5× points on everything",
    "3 linked games",
    "Streak shields: miss a day, keep your streak",
    "Your 30-day projection and full history",
  ],
  3: [
    "150 snack quests a month, 5 a day",
    "2× points on everything",
    "10 linked games",
    "Custom quests from a photo of your own snack",
    "Everything in Grinder, and rewards handled first",
  ],
};

/** What the next plan adds, for the upgrade sheet (3 lines). */
export const ADDS: Record<1 | 2, string[]> = {
  1: ["60 quests a month instead of 20", "1.5× points and 3 linked games", "Streak shields and your 30-day projection"],
  2: ["150 quests a month instead of 60", "2× points and 10 linked games", "Custom quests from your own snacks"],
};

/** Points economy (the owner can tune it here and in the rewards table). */
export const POINTS = {
  rarity: { common: 40, rare: 60, legendary: 100 } as Record<"common" | "rare" | "legendary", number>,
  perMinutes: 5, // 1 point per 5 minutes played
  dailyMinutesCap: 180, // play minutes counted per day (timer + Steam)
  verifyPerDay: 20, // photo checks per day (AI cost cap, also for failed checks)
  runsPerDay: 4, // quest runs a free account can build per day
};

export function hasFeature(level: Level, f: Feature) {
  return QUOTAS[level].features.includes(f);
}

export function shortName(name: string) {
  return name.replace(/^SnackQuest\s+/i, "");
}

export const GAMES = ["Fortnite", "Valorant", "Minecraft", "Call of Duty", "League of Legends", "Roblox", "Something else"] as const;
export const SNACKS = ["Pizza", "Chips", "Wings", "Candy", "Energy drinks", "Healthy stuff"] as const;
export const WHENS = ["After school or work", "Late night", "Weekends", "All the time"] as const;
export const GOALS = ["Headset", "Controller", "Keyboard", "Mouse", "Game gift card"] as const;

/** Onboarding goal → the reward it points to in the catalog (by name match). */
export const GOAL_MATCH: Record<string, string> = {
  Headset: "Headset",
  Controller: "Controller",
  Keyboard: "Keyboard",
  Mouse: "Mouse",
  "Game gift card": "Steam",
};
