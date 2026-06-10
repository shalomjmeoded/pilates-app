import { buildBaselinePlan } from '@/engines/calculations';
import type { CalculationInput } from '@/types/calculations';
import type { NutritionTargets } from '@/types/nutrition';

export function computeNutritionTargets(input: CalculationInput): NutritionTargets {
  const plan = buildBaselinePlan(input);
  return plan.macros;
}
