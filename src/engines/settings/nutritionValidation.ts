import { evaluateCalorieSafety } from '@/engines/calculations';
import type { MacroTotals } from '@/types/nutrition';
import type { GenderIdentity } from '@/types/profile';
import type { SafetyWarning } from '@/types/calculations';

export interface ManualTargetValidation {
  valid: boolean;
  errors: string[];
  safetyWarning: SafetyWarning | null;
}

export function validateManualTargets(
  targets: MacroTotals,
  genderIdentity: GenderIdentity,
): ManualTargetValidation {
  const errors: string[] = [];
  const fields: Array<[string, number]> = [
    ['Calories', targets.calories],
    ['Protein', targets.proteinG],
    ['Carbs', targets.carbsG],
    ['Fat', targets.fatG],
    ['Fiber', targets.fiberG],
  ];

  for (const [label, value] of fields) {
    if (!Number.isFinite(value) || Number.isNaN(value)) {
      errors.push(`${label} must be a valid number.`);
    } else if (value < 0) {
      errors.push(`${label} cannot be negative.`);
    }
  }

  const safetyWarning =
    Number.isFinite(targets.calories) && targets.calories >= 0
      ? evaluateCalorieSafety(targets.calories, genderIdentity)
      : null;

  return {
    valid: errors.length === 0,
    errors,
    safetyWarning: safetyWarning?.triggered ? safetyWarning : null,
  };
}
