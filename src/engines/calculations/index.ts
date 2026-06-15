import { format } from 'date-fns';

import type { BaselinePlanResult, CalculationInput } from '@/types/calculations';

import { calculateBmr } from './bmr';
import { calculateBmi } from './bmi';
import { calculateGoalCalories } from './goalCalories';
import { calculateMacros } from './macros';
import { buildRoadmapProjection } from './roadmap';
import { evaluateCalorieSafety } from './safety';
import { calculateTdee } from './tdee';

export { MIN_AUTO_CALORIE_TARGET } from './constants';
export { calculateAge } from './age';
export { calculateBmr } from './bmr';
export { calculateTdee, getTdeeMultiplier } from './tdee';
export { calculateGoalCalories, paceToDailyDeficit } from './goalCalories';
export { calculateMacros, calculateFiberTarget } from './macros';
export { calculateBmi } from './bmi';
export { evaluateCalorieSafety, getCalorieSafetyThreshold, SAFETY_WARNING_MESSAGE } from './safety';
export {
  buildRoadmapProjection,
  estimateWeeksToGoal,
  formatFirstMilestone,
  formatRoadmapTargetDate,
} from './roadmap';

export function buildBaselinePlan(input: CalculationInput): BaselinePlanResult {
  const { bmr } = calculateBmr({
    genderIdentity: input.genderIdentity,
    weightKg: input.currentWeightKg,
    heightCm: input.heightCm,
    birthYear: input.birthYear,
    bodyFatPercent: input.bodyFatPercent,
  });

  const { tdee } = calculateTdee(bmr, input.trainingFrequency);
  const goalCalories = calculateGoalCalories(tdee, input.fitnessGoal, input.paceKgPerWeek);
  const effectiveDate = format(new Date(), 'yyyy-MM-dd');
  const macros = calculateMacros(
    goalCalories,
    input.currentWeightKg,
    input.fitnessGoal,
    effectiveDate,
    input.bodyFatPercent,
  );
  const bmi = calculateBmi(input.currentWeightKg, input.heightCm);
  const safetyWarning = evaluateCalorieSafety(goalCalories, input.genderIdentity);
  const roadmap = buildRoadmapProjection(
    input.currentWeightKg,
    input.weightTrajectory,
    input.paceKgPerWeek,
  );

  return {
    bmr,
    tdee,
    goalCalories,
    macros,
    bmi,
    safetyWarning,
    roadmap,
  };
}
