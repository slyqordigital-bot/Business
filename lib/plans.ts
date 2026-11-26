/**
 * Quotas and benefits per plan level. Names, ids and prices always come from Kwop
 * (GET KWOP_API); a plan's level is its position by price, cheapest first.
 */
export type Level = 0 | 1 | 2 | 3; // 0 = no paid plan

export type Feature = "breakdown" | "trends" | "history_all" | "weekly" | "export" | "priority";

export const QUOTAS: Record<Level, { scans: number; historyDays: number | null; features: Feature[] }> = {
  0: { scans: 0, historyDays: 0, features: [] },
  1: { scans: 40, historyDays: 30, features: [] },
  2: { scans: 150, historyDays: null, features: ["breakdown", "trends", "history_all"] },
  3: { scans: 400, historyDays: null, features: ["breakdown", "trends", "history_all", "weekly", "export", "priority"] },
};

export const TAGS: Record<1 | 2 | 3, string> = {
  1: "For casual tracking",
  2: "For daily goals",
  3: "For strict control",
};

export const UNLOCKS: Record<1 | 2 | 3, string[]> = {
  1: [
    "40 photo scans a month",
    "Calories, protein, carbs and fat for every meal",
    "Your daily log and streak",
    "30 days of history",
  ],
  2: [
    "150 photo scans a month — about 5 a day",
    "A breakdown for each food on the plate",
    "Unlimited history",
    "Streaks and trend charts for your macros",
    "Edit any portion in one tap",
  ],
  3: [
    "400 photo scans a month — every snack covered",
    "Everything in Plate",
    "Week-by-week comparisons",
    "CSV export for your coach or spreadsheet",
    "Priority scans, first in line",
  ],
};

/** What the next plan adds, for the upgrade sheet (3 lines). */
export const ADDS: Record<1 | 2, string[]> = {
  1: ["150 scans a month instead of 40", "A breakdown for each food", "Unlimited history and trend charts"],
  2: ["400 scans a month instead of 150", "Week-by-week comparisons", "CSV export and priority scans"],
};

export const FREE_TRIES_PER_DAY = 3;

export function hasFeature(level: Level, f: Feature) {
  return QUOTAS[level].features.includes(f);
}

export function shortName(name: string) {
  return name.replace(/^MacroSnap\s+/i, "");
}
