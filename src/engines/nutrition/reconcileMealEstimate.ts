import type { AiMealEstimate } from '@/types/ai';

import { MACRO_CALORIE_TOLERANCE_AI, roundCaloriesFromMacros } from './validation';

export interface MealReconciliationResult {
  estimate: AiMealEstimate;
  /** True when the provided calories were overridden to match the macros. */
  corrected: boolean;
}

/** Confidence ceiling applied when we had to correct the model's arithmetic. */
export const CORRECTED_CONFIDENCE_CEILING = 0.6;

function round1(value: number): number {
  if (!Number.isFinite(value) || value < 0) {
    return 0;
  }
  return Math.round(value * 10) / 10;
}

function clampConfidence(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(1, Math.max(0, value));
}

/**
 * Anti-hallucination guard for AI meal estimates. Language models frequently
 * return a calorie total that does not add up to the macros they reported.
 * We recompute calories from the macros (Atwater 4/4/9) whenever the model's
 * total drifts beyond the AI tolerance, so a logged meal is always internally
 * consistent. When we correct the model we also cap the confidence shown to the
 * user, signalling that the estimate needed adjustment.
 */
export function reconcileMealEstimate(estimate: AiMealEstimate): MealReconciliationResult {
  const proteinG = round1(estimate.proteinG);
  const carbsG = round1(estimate.carbsG);
  const fatG = round1(estimate.fatG);
  const fiberG = round1(estimate.fiberG);

  const providedCalories = Math.max(0, Math.round(estimate.calories));
  const expectedCalories = roundCaloriesFromMacros(proteinG, carbsG, fatG);

  let calories = providedCalories;
  let corrected = false;

  if (expectedCalories > 0) {
    const tolerance = Math.max(expectedCalories * MACRO_CALORIE_TOLERANCE_AI, 1);
    if (Math.abs(providedCalories - expectedCalories) > tolerance) {
      calories = expectedCalories;
      corrected = true;
    }
  }

  const confidence = corrected
    ? Math.min(clampConfidence(estimate.confidence), CORRECTED_CONFIDENCE_CEILING)
    : clampConfidence(estimate.confidence);

  return {
    corrected,
    estimate: {
      ...estimate,
      proteinG,
      carbsG,
      fatG,
      fiberG,
      calories,
      confidence,
      ingredients: estimate.ingredients.map((ingredient) => ({
        name: ingredient.name,
        grams: round1(ingredient.grams),
      })),
    },
  };
}
