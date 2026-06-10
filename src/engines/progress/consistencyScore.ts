import type { NutritionDailyTotalsRow } from '@/types/nutrition';
import type { ConsistencyBreakdown } from '@/types/progress';

interface ConsistencyInput {
  completedWorkoutsLast7Days: number;
  plannedWorkoutDaysLast7: number;
  nutritionRows: NutritionDailyTotalsRow[];
  weightLogDaysLast7: number;
}

export function calculateConsistencyScore(input: ConsistencyInput): ConsistencyBreakdown {
  const workoutScore =
    input.plannedWorkoutDaysLast7 > 0
      ? Math.min(100, Math.round((input.completedWorkoutsLast7Days / input.plannedWorkoutDaysLast7) * 100))
      : input.completedWorkoutsLast7Days > 0
        ? 100
        : 0;

  const recent = input.nutritionRows.slice(0, 7);
  const calorieScores = recent
    .filter((row) => row.targetCalories > 0)
    .map((row) => Math.min(100, Math.round((row.caloriesConsumed / row.targetCalories) * 100)));
  const proteinScores = recent
    .filter((row) => row.targetProteinG > 0)
    .map((row) => Math.min(100, Math.round((row.proteinG / row.targetProteinG) * 100)));

  const calorieScore =
    calorieScores.length > 0
      ? Math.round(calorieScores.reduce((a, b) => a + b, 0) / calorieScores.length)
      : 0;
  const proteinScore =
    proteinScores.length > 0
      ? Math.round(proteinScores.reduce((a, b) => a + b, 0) / proteinScores.length)
      : 0;

  const weightLoggingScore = Math.round((input.weightLogDaysLast7 / 7) * 100);

  const score = Math.round(
    workoutScore * 0.3 +
      calorieScore * 0.25 +
      proteinScore * 0.25 +
      weightLoggingScore * 0.2,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    workoutScore,
    calorieScore,
    proteinScore,
    weightLoggingScore,
  };
}
