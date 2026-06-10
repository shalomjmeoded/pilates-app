import type { AiMealEstimate } from '@/types/ai';
import type { MealInput } from '@/types/nutrition';

import { AiValidationError } from '@/services/ai/errors';

function getProxyErrorCode(error: unknown): string | undefined {
  if (error instanceof Error && 'code' in error && typeof error.code === 'string') {
    return error.code;
  }
  return undefined;
}

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

export function shouldFallbackToManual(error: unknown): boolean {
  const code = getProxyErrorCode(error);
  if (code === 'COOLDOWN' || code === 'UNAUTHORIZED') {
    return false;
  }
  if (error instanceof AiValidationError) {
    return true;
  }
  if (code) {
    return true;
  }
  return true;
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
