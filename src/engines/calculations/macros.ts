import { calculateLeanMassKg } from '@/engines/physique/bodyFatAssumptions';
import type { MacroPlan } from '@/types/calculations';
import type { FitnessGoal } from '@/types/profile';

const PROTEIN_PER_KG: Record<FitnessGoal, number> = {
  get_toned: 2.0,
  maintain: 1.8,
  build_muscle: 2.2,
};

const FAT_CALORIE_RATIO = 0.25;

export function calculateFiberTarget(weightKg: number): number {
  return Math.min(38, Math.max(25, Math.round(weightKg * 0.4)));
}

export function calculateMacros(
  goalCalories: number,
  currentWeightKg: number,
  fitnessGoal: FitnessGoal,
  effectiveDate: string,
  bodyFatPercent?: number,
): MacroPlan {
  const proteinBasisKg =
    bodyFatPercent !== undefined
      ? calculateLeanMassKg(currentWeightKg, bodyFatPercent)
      : currentWeightKg;
  const proteinG = Math.round(PROTEIN_PER_KG[fitnessGoal] * proteinBasisKg);
  const proteinCalories = proteinG * 4;
  const fatCalories = goalCalories * FAT_CALORIE_RATIO;
  const fatG = Math.round(fatCalories / 9);
  const carbCalories = goalCalories - proteinCalories - fatG * 9;
  const carbsG = Math.max(0, Math.round(carbCalories / 4));
  const fiberG = calculateFiberTarget(currentWeightKg);

  return {
    effectiveDate,
    calories: goalCalories,
    proteinG,
    carbsG,
    fatG,
    fiberG,
    isManualOverride: false,
  };
}
