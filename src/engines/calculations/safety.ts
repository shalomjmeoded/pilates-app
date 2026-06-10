import type { GenderIdentity } from '@/types/profile';
import type { SafetyWarning } from '@/types/calculations';

export const SAFETY_WARNING_MESSAGE =
  'Caution: Your configured calorie or macro target is very low. Tune does not recommend maintaining this routine long-term.';

const THRESHOLDS: Record<GenderIdentity, number> = {
  female: 1200,
  non_binary: 1200,
  prefer_not_to_say: 1200,
  male: 1500,
};

export function getCalorieSafetyThreshold(genderIdentity: GenderIdentity): number {
  return THRESHOLDS[genderIdentity];
}

export function evaluateCalorieSafety(
  goalCalories: number,
  genderIdentity: GenderIdentity,
): SafetyWarning {
  const threshold = getCalorieSafetyThreshold(genderIdentity);
  const triggered = goalCalories < threshold;

  return {
    triggered,
    message: SAFETY_WARNING_MESSAGE,
    threshold,
  };
}
