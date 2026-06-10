import { differenceInCalendarDays, format, parseISO } from 'date-fns';

import type { CoachingInsight, CoachingPayload } from '@/types/coaching';
import type { NutritionDailyTotalsRow } from '@/types/nutrition';
import type { WeightLog } from '@/types/progress';

export interface CoachingInput {
  nutritionRows: NutritionDailyTotalsRow[];
  completedWorkoutsThisWeek: number;
  weightLogs: WeightLog[];
  insightDate?: string;
}

export function buildCoachingInsights(input: CoachingInput): CoachingInsight {
  const insightDate = input.insightDate ?? format(new Date(), 'yyyy-MM-dd');
  const payload: CoachingPayload = {};

  const recentNutrition = input.nutritionRows.slice(0, 7);
  const proteinValues = recentNutrition
    .filter((row) => row.targetProteinG > 0)
    .map((row) => Math.round((row.proteinG / row.targetProteinG) * 100));
  const calorieValues = recentNutrition
    .filter((row) => row.targetCalories > 0)
    .map((row) => Math.round((row.caloriesConsumed / row.targetCalories) * 100));

  const proteinAdherence =
    proteinValues.length > 0
      ? Math.round(proteinValues.reduce((sum, value) => sum + value, 0) / proteinValues.length)
      : null;
  const calorieAdherence =
    calorieValues.length > 0
      ? Math.round(calorieValues.reduce((sum, value) => sum + value, 0) / calorieValues.length)
      : null;

  payload.proteinAdherencePercent = proteinAdherence ?? undefined;
  payload.calorieAdherencePercent = calorieAdherence ?? undefined;
  payload.workoutsThisWeek = input.completedWorkoutsThisWeek;

  const lastWeight = input.weightLogs[input.weightLogs.length - 1];
  const daysSinceLastWeightLog = lastWeight
    ? differenceInCalendarDays(new Date(), parseISO(lastWeight.loggedAt))
    : 99;
  payload.daysSinceLastWeightLog = daysSinceLastWeightLog;

  const dailyTip = pickDailyTip(payload);
  const weeklyInsight = pickWeeklyInsight(payload);

  return {
    insightDate,
    dailyTip,
    weeklyInsight,
    payload,
  };
}

function pickDailyTip(payload: CoachingPayload): string {
  if ((payload.proteinAdherencePercent ?? 100) < 70) {
    return 'Try increasing protein intake tomorrow.';
  }
  if ((payload.calorieAdherencePercent ?? 100) < 75) {
    return 'Your calorie intake appears lower than your target.';
  }
  if ((payload.daysSinceLastWeightLog ?? 0) >= 5) {
    return 'Log your weight to improve projections.';
  }
  if ((payload.workoutsThisWeek ?? 0) >= 3) {
    return 'Excellent consistency this week.';
  }
  return 'Small daily actions build lasting momentum.';
}

function pickWeeklyInsight(payload: CoachingPayload): string {
  if ((payload.workoutsThisWeek ?? 0) >= 4) {
    return 'Your movement rhythm is strong this week. Keep showing up.';
  }
  if ((payload.proteinAdherencePercent ?? 100) < 70) {
    return 'Protein has been below target most days — a steady breakfast can help.';
  }
  return 'Consistency matters more than perfection. Focus on the next small win.';
}
