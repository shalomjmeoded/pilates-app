import { PORTION_PRESETS, type Meal, type PortionPreset } from '@/types/nutrition';
import type { MacroTotals } from '@/types/nutrition';

const PORTION_STEP = 0.1;
const MIN_PORTION = 0.1;
const MAX_PORTION = 3;

export function clampPortion(multiplier: number): number {
  return Math.round(Math.min(MAX_PORTION, Math.max(MIN_PORTION, multiplier)) * 10) / 10;
}

export function adjustPortionByStep(current: number, direction: 1 | -1): number {
  return clampPortion(current + direction * PORTION_STEP);
}

export function isPortionPreset(value: number): value is PortionPreset {
  return (PORTION_PRESETS as readonly number[]).includes(value);
}

export function applyPortionToMeal(meal: Meal): MacroTotals {
  return {
    calories: round(meal.calories * meal.portionMultiplier),
    proteinG: round(meal.proteinG * meal.portionMultiplier),
    carbsG: round(meal.carbsG * meal.portionMultiplier),
    fatG: round(meal.fatG * meal.portionMultiplier),
    fiberG: round(meal.fiberG * meal.portionMultiplier),
  };
}

export function sumMealTotals(meals: Meal[]): MacroTotals {
  return meals.reduce<MacroTotals>(
    (acc, meal) => {
      const scaled = applyPortionToMeal(meal);
      return {
        calories: round(acc.calories + scaled.calories),
        proteinG: round(acc.proteinG + scaled.proteinG),
        carbsG: round(acc.carbsG + scaled.carbsG),
        fatG: round(acc.fatG + scaled.fatG),
        fiberG: round(acc.fiberG + scaled.fiberG),
      };
    },
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 },
  );
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
