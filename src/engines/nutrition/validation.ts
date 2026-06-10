import type { MealInput } from '@/types/nutrition';

export interface MealValidationResult {
  valid: boolean;
  errors: string[];
}

function isValidNumber(value: number): boolean {
  return Number.isFinite(value) && !Number.isNaN(value) && value >= 0;
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
