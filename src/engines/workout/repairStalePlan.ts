import type { Exercise } from '@/types/exercise';
import { getAllExercises } from '@/db/repositories/exerciseRepository';
import {
  deleteWorkoutPlanByDate,
  getWorkoutPlanByDate,
} from '@/db/repositories/workoutRepository';
import type { WorkoutPlan } from '@/types/workout';

import { ensureWorkoutPlanForDate, formatPlanDate } from './ensureDailyPlan';
import { validatePlanExerciseIds } from './planGenerator';

export async function planMatchesLibrary(
  plan: WorkoutPlan,
  library?: Exercise[],
): Promise<boolean> {
  const resolvedLibrary = library ?? (await getAllExercises());
  return validatePlanExerciseIds(plan.exercises, resolvedLibrary);
}

export async function refreshWorkoutPlanForDate(planDate: string): Promise<WorkoutPlan> {
  await deleteWorkoutPlanByDate(planDate);
  return ensureWorkoutPlanForDate(planDate);
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
