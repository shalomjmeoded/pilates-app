import type { AiMealEstimate } from '@/types/ai';
import type { MealInput } from '@/types/nutrition';

export const MEAL_TEXT_ESTIMATE_COPY =
  'Text is recommended — faster, cheaper, and easier to correct. Estimates are most accurate when you include grams where you can (e.g. 150g chicken). If oil was used or the food was cooked in oil/butter, say so — that keeps fat calories honest.';

export const MEAL_TEXT_ESTIMATE_PLACEHOLDER =
  '150g grilled salmon, 1 cup quinoa, roasted broccoli, 1 tbsp olive oil';

export const MEAL_PHOTO_ESTIMATE_COPY =
  'Photo estimates work best for simple visible meals. Optional: add a short description with grams and oil/cooking notes — that makes the estimate much more accurate.';

export const MEAL_PHOTO_DESCRIPTION_HINT =
  'Optional — for max accuracy. Example: 150g chicken, cooked in 1 tbsp olive oil.';

export const MEAL_PHOTO_DESCRIPTION_PLACEHOLDER =
  'e.g. grilled chicken bowl, ~150g chicken, cooked with olive oil';

export const MEAL_LOW_CONFIDENCE_THRESHOLD = 0.7;

export const MEAL_LOW_CONFIDENCE_NUDGE =
  'This estimate may be off. Add grams where you can, mention oil or butter if used, and adjust macros before saving. Photo-only meals are especially hard to nail without portions.';

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
