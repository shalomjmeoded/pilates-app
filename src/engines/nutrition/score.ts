import type { MacroTotals, NutritionTargets } from '@/types/nutrition';

const CALORIE_WEIGHT = 0.4;
const PROTEIN_WEIGHT = 0.35;
const FIBER_WEIGHT = 0.25;

function calorieAdherenceScore(consumed: number, target: number): number {
  if (target <= 0) {
    return 0;
  }

  const ratio = consumed / target;
  const deviation = Math.abs(1 - ratio);

  if (deviation <= 0.15) {
    return 100;
  }

  const penalty = Math.min(100, ((deviation - 0.15) / 0.35) * 100);
  return Math.max(0, 100 - penalty);
}

function targetRatioScore(consumed: number, target: number): number {
  if (target <= 0) {
    return 0;
  }
  return Math.min(100, (consumed / target) * 100);
}

export function calculateNutritionScore(
  consumed: MacroTotals,
  targets: NutritionTargets,
): number {
  const calorieScore = calorieAdherenceScore(consumed.calories, targets.calories);
  const proteinScore = targetRatioScore(consumed.proteinG, targets.proteinG);
  const fiberScore = targetRatioScore(consumed.fiberG, targets.fiberG);

  const weighted =
    calorieScore * CALORIE_WEIGHT +
    proteinScore * PROTEIN_WEIGHT +
    fiberScore * FIBER_WEIGHT;

  return Math.max(0, Math.min(100, Math.round(weighted)));
}
