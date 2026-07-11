import type { AiMealEstimate } from '@/types/ai';
import type { MealInput } from '@/types/nutrition';

export const MEAL_TEXT_ESTIMATE_COPY =
  'Text is recommended — faster, cheaper, and easier to correct.';

export interface ReviewedMealFields {
  title: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
}

export function buildManualFallbackParams(
  mealDate: string,
  description: string,
): { mealDate: string; prefilledTitle: string } {
  return {
    mealDate,
    prefilledTitle: description.trim(),
  };
}

export type AiMealEstimateSource = 'ai_text' | 'ai_photo';

export function buildMealInputFromAiReview(
  estimate: AiMealEstimate,
  fields: ReviewedMealFields,
  mealDate: string,
  source: AiMealEstimateSource = 'ai_text',
): MealInput {
  return {
    title: fields.title.trim(),
    calories: fields.calories,
    proteinG: fields.proteinG,
    carbsG: fields.carbsG,
    fatG: fields.fatG,
    fiberG: fields.fiberG,
    source,
    mealDate,
    aiConfidence: estimate.confidence,
    aiIngredients: estimate.ingredients,
  };
}
