import type { Exercise } from '@/types/exercise';
import { getAllExercises } from '@/db/repositories/exerciseRepository';
import {
  deleteWorkoutPlanByDate,
  getWorkoutPlanByDate,
} from '@/db/repositories/workoutRepository';
import type { WorkoutGenerationOverrides, WorkoutPlan } from '@/types/workout';

import { ensureWorkoutPlanForDate, formatPlanDate } from './ensureDailyPlan';
import { validatePlanExerciseIds } from './planGenerator';

interface RefreshWorkoutPlanOptions {
  allowFutureGeneration?: boolean;
}

export async function planMatchesLibrary(
  plan: WorkoutPlan,
  library?: Exercise[],
): Promise<boolean> {
  const resolvedLibrary = library ?? (await getAllExercises());
  return validatePlanExerciseIds(plan.exercises, resolvedLibrary);
}

export async function refreshWorkoutPlanForDate(
  planDate: string,
  overrides?: WorkoutGenerationOverrides,
  options?: RefreshWorkoutPlanOptions,
): Promise<WorkoutPlan> {
  await deleteWorkoutPlanByDate(planDate);
  return ensureWorkoutPlanForDate(planDate, overrides, options);
}

export async function repairTodayWorkoutPlanIfStale(): Promise<boolean> {
  const today = formatPlanDate(new Date());
  const plan = await getWorkoutPlanByDate(today);

  if (!plan) {
    return false;
  }

  if (await planMatchesLibrary(plan)) {
    return false;
  }

  await refreshWorkoutPlanForDate(plan.planDate);
  return true;
}
