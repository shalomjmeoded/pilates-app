export const MIN_WEIGHT_KG = 0.1;
export const MAX_WEIGHT_KG = 500;
const DUPLICATE_WINDOW_MS = 60_000;

export interface WeightValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateWeightKg(weightKg: number): WeightValidationResult {
  const errors: string[] = [];

  if (!Number.isFinite(weightKg) || Number.isNaN(weightKg)) {
    errors.push('Enter a valid weight.');
  } else if (weightKg <= 0) {
    errors.push('Weight must be greater than zero.');
  } else if (weightKg > MAX_WEIGHT_KG) {
    errors.push(`Weight must be ${MAX_WEIGHT_KG} kg or less.`);
  }

  return { valid: errors.length === 0, errors };
}

export function isDuplicateTimestamp(
  newLoggedAt: string,
  existingTimestamps: string[],
): boolean {
  const next = new Date(newLoggedAt).getTime();
  return existingTimestamps.some((stamp) => {
    const diff = Math.abs(new Date(stamp).getTime() - next);
    return diff < DUPLICATE_WINDOW_MS;
  });
}

export function parseWeightInput(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }
  const parsed = Number(trimmed.replace(',', '.'));
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return null;
  }
  return parsed;
}
