import type { MealInput, MealSource } from '@/types/nutrition';

export interface MealValidationResult {
  valid: boolean;
  errors: string[];
}

/** Atwater factors: protein/carbs 4 kcal/g, fat 9 kcal/g. */
export const KCAL_PER_G_PROTEIN = 4;
export const KCAL_PER_G_CARBS = 4;
export const KCAL_PER_G_FAT = 9;

/** AI estimates may drift; manual Quick Add stays tighter. */
export const MACRO_CALORIE_TOLERANCE_MANUAL = 0.02;
export const MACRO_CALORIE_TOLERANCE_AI = 0.1;

function isValidNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value) && value >= 0;
}

export function caloriesFromMacros(proteinG: number, carbsG: number, fatG: number): number {
  return (
    proteinG * KCAL_PER_G_PROTEIN + carbsG * KCAL_PER_G_CARBS + fatG * KCAL_PER_G_FAT
  );
}

export function roundCaloriesFromMacros(
  proteinG: number,
  carbsG: number,
  fatG: number,
): number {
  return Math.round(caloriesFromMacros(proteinG, carbsG, fatG));
}

function toleranceForSource(source: MealSource): number {
  return source === 'manual' ? MACRO_CALORIE_TOLERANCE_MANUAL : MACRO_CALORIE_TOLERANCE_AI;
}

export function macrosMatchCalories(
  calories: number,
  proteinG: number,
  carbsG: number,
  fatG: number,
  source: MealSource,
): boolean {
  const expected = caloriesFromMacros(proteinG, carbsG, fatG);
  if (expected === 0 && calories === 0) {
    return true;
  }
  if (expected === 0) {
    return calories === 0;
  }
  const tolerance = toleranceForSource(source);
  const delta = Math.abs(calories - expected);
  return delta <= Math.max(expected * tolerance, 1);
}

export function validateMealInput(input: MealInput): MealValidationResult {
  const errors: string[] = [];

  if (!input.title.trim()) {
    errors.push('Meal name is required.');
  }

  if (!isValidNumber(input.calories)) {
    errors.push('Calories must be zero or greater.');
  }

  if (!isValidNumber(input.proteinG)) {
    errors.push('Protein must be zero or greater.');
  }

  if (!isValidNumber(input.carbsG)) {
    errors.push('Carbs must be zero or greater.');
  }

  if (!isValidNumber(input.fatG)) {
    errors.push('Fat must be zero or greater.');
  }

  if (!isValidNumber(input.fiberG)) {
    errors.push('Fiber must be zero or greater.');
  }

  if (!['manual', 'ai_text', 'ai_photo'].includes(input.source)) {
    errors.push('Invalid meal source.');
  }

  if (
    isValidNumber(input.calories) &&
    isValidNumber(input.proteinG) &&
    isValidNumber(input.carbsG) &&
    isValidNumber(input.fatG) &&
    ['manual', 'ai_text', 'ai_photo'].includes(input.source) &&
    !macrosMatchCalories(
      input.calories,
      input.proteinG,
      input.carbsG,
      input.fatG,
      input.source,
    )
  ) {
    const expected = roundCaloriesFromMacros(input.proteinG, input.carbsG, input.fatG);
    errors.push(
      `Calories (${Math.round(input.calories)}) do not match macros (~${expected} from P/C/F).`,
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function parseMealNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || Number.isNaN(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}
