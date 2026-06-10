import type { Meal, NutritionDaySummary, NutritionTargets } from '@/types/nutrition';

import { sumMealTotals } from './portion';
import { calculateNutritionScore } from './score';

export function buildNutritionDaySummary(
  mealDate: string,
  targets: NutritionTargets,
  meals: Meal[],
): NutritionDaySummary {
  const consumed = sumMealTotals(meals);
  const remainingCalories = Math.round(targets.calories - consumed.calories);

  return {
    mealDate,
    targets,
    consumed,
    remainingCalories,
    nutritionScore: calculateNutritionScore(consumed, targets),
    mealCount: meals.length,
  };
}

export function macroProgress(consumed: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.min(1, consumed / target);
}
