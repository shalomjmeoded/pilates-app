import { saveMeal } from '@/db/repositories/nutritionRepository';
import { upsertSavedMeal } from '@/db/repositories/savedMealRepository';
import type { Meal, MealInput } from '@/types/nutrition';

export interface SaveReviewedAiMealInput {
  meal: MealInput;
  saveToLibrary: boolean;
}

export async function saveReviewedAiMeal(input: SaveReviewedAiMealInput): Promise<Meal> {
  const saved = await saveMeal(input.meal);

  if (input.saveToLibrary) {
    await upsertSavedMeal({
      title: input.meal.title,
      calories: input.meal.calories,
      proteinG: input.meal.proteinG,
      carbsG: input.meal.carbsG,
      fatG: input.meal.fatG,
      fiberG: input.meal.fiberG,
    });
  }

  return saved;
}
