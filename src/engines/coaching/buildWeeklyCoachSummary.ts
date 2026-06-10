import type { WeeklyCoachSummary } from '@/types/coaching';
import type { NutritionDailyTotalsRow } from '@/types/nutrition';
import type { WeightLog } from '@/types/progress';
import type { FitnessGoal } from '@/types/profile';

import { getWeekStartDate } from './weekStart';

function averageAdherencePercent(
  rows: NutritionDailyTotalsRow[],
  consumedKey: 'caloriesConsumed' | 'proteinG',
  targetKey: 'targetCalories' | 'targetProteinG',
): number | null {
  const values = rows
    .filter((row) => row[targetKey] > 0)
    .map((row) => Math.round((row[consumedKey] / row[targetKey]) * 100));

  if (values.length === 0) {
    return null;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function deriveWeightTrend(logs: WeightLog[]): WeeklyCoachSummary['weightTrend'] {
  const recent = logs.slice(-2);
  if (recent.length < 2) {
    return 'unknown';
  }

  const delta = recent[1].weightKg - recent[0].weightKg;
  if (Math.abs(delta) < 0.2) {
    return 'stable';
  }
  return delta < 0 ? 'down' : 'up';
}

export interface BuildWeeklyCoachSummaryInput {
  nutritionRows: NutritionDailyTotalsRow[];
  workoutsCompleted: number;
  workoutsPlanned: number;
  weightLogs: WeightLog[];
  skippedExerciseNames: string[];
  goal: FitnessGoal;
  referenceDate?: Date;
}

export function buildWeeklyCoachSummary(
  input: BuildWeeklyCoachSummaryInput,
): WeeklyCoachSummary {
  return {
    weekStart: getWeekStartDate(input.referenceDate),
    workoutsCompleted: input.workoutsCompleted,
    workoutsPlanned: input.workoutsPlanned,
    calorieAdherencePercent: averageAdherencePercent(
      input.nutritionRows,
      'caloriesConsumed',
      'targetCalories',
    ),
    proteinAdherencePercent: averageAdherencePercent(
      input.nutritionRows,
      'proteinG',
      'targetProteinG',
    ),
    weightTrend: deriveWeightTrend(input.weightLogs),
    skippedExerciseCount: input.skippedExerciseNames.length,
    topSkippedExerciseNames: input.skippedExerciseNames.slice(0, 3),
    goal: input.goal,
  };
}
