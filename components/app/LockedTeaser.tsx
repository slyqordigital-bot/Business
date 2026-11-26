"use client";
import { Suspense } from "react";
import { MealDetail } from "./MealDetail";
import type { MealView } from "@/lib/meals";

export function LockedTeaser({ meal }: { meal: MealView }) {
  return <div className="-mx-4 md:-mx-10"><Suspense><MealDetail meal={meal} level={0} shareUrl={null} /></Suspense></div>;
}
