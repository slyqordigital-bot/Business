/** Shapes shared by the server and the browser. */
export type MealItem = {
  name: string;
  grams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  x: number;
  y: number;
};

export type Totals = { kcal: number; protein: number; carbs: number; fat: number };

/** What the browser receives. When locked, every number is null: the real values never leave the server. */
export type MealView = {
  id: string;
  name: string;
  photoUrl: string | null;
  insight: string | null;
  confidence: string | null;
  eatenAt: string;
  locked: boolean;
  totals: Totals | null;
  items: (Pick<MealItem, "name" | "x" | "y"> & Partial<Omit<MealItem, "name" | "x" | "y">>)[];
  /** per-food numbers hidden by the plan (Snack), shown blurred with "Unlock with Plate" */
  itemsLocked: boolean;
};

export type DbMeal = {
  id: string;
  name: string;
  photo_path: string | null;
  items: MealItem[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  insight: string | null;
  confidence: string | null;
  eaten_at: string;
};

export function toView(m: DbMeal, opts: { paid: boolean; breakdown: boolean; photoUrl: string | null }): MealView {
  const locked = !opts.paid;
  const showItems = opts.paid && opts.breakdown;
  return {
    id: m.id,
    name: m.name,
    photoUrl: opts.photoUrl,
    insight: m.insight,
    confidence: m.confidence,
    eatenAt: m.eaten_at,
    locked,
    totals: locked ? null : { kcal: m.kcal, protein: Number(m.protein), carbs: Number(m.carbs), fat: Number(m.fat) },
    items: (m.items || []).map((i) =>
      showItems ? i : { name: i.name, x: i.x, y: i.y },
    ),
    itemsLocked: !showItems,
  };
}
