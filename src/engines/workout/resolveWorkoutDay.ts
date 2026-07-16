import { getAllExercises, getExerciseById } from '@/db/repositories/exerciseRepository';
import { getSessionFeedback, getSessionForPlan, getWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { PlanGenerationError, type WorkoutDayView, type WorkoutPlanExerciseDetail } from '@/types/workout';

import { ensureWorkoutPlanForDate, isDateInFuture, isDateReadOnly, isDateToday } from './ensureDailyPlan';
import { planMatchesLibrary, refreshWorkoutPlanForDate } from './repairStalePlan';

async function hydratePlanExercises(
  plan: NonNullable<WorkoutDayView['plan']>,
): Promise<{ exercises: WorkoutPlanExerciseDetail[]; partialLibraryMatch: boolean }> {
  const exercises: WorkoutPlanExerciseDetail[] = [];

  for (const item of plan.exercises) {
    const exercise = await getExerciseById(item.exerciseId);
    if (!exercise) {
      continue;
    }
    exercises.push({ ...item, exercise });
  }

  return {
    exercises,
    partialLibraryMatch: exercises.length < plan.exercises.length,
  };
}

export async function loadWorkoutDay(planDate: string): Promise<WorkoutDayView> {
  const isToday = isDateToday(planDate);
  const isFuture = isDateInFuture(planDate);
  const isReadOnly = isDateReadOnly(planDate);
  let planRefreshed = false;

  let plan = await getWorkoutPlanByDate(planDate);

  if (plan) {
    const library = await getAllExercises();
    const isValid = await planMatchesLibrary(plan, library);

    if (!isValid) {
      if (isToday) {
        const session = await getSessionForPlan(plan.id);
        if (!session || session.status === 'abandoned') {
          plan = await refreshWorkoutPlanForDate(planDate);
          planRefreshed = true;
        }
      }
    }
  }

  if (!plan && isToday) {
    try {
      plan = await ensureWorkoutPlanForDate(planDate);
    } catch (error) {
      if (error instanceof PlanGenerationError) {
        throw error;
      }
      throw new PlanGenerationError('UNKNOWN', 'Unable to load workout plan.');
    }
  }

  let exercises: WorkoutPlanExerciseDetail[] = [];
  let partialLibraryMatch = false;

  if (plan) {
    const hydrated = await hydratePlanExercises(plan);
    exercises = hydrated.exercises;
    partialLibraryMatch = hydrated.partialLibraryMatch;

    if (isToday && exercises.length === 0) {
      const session = await getSessionForPlan(plan.id);
      if (session && session.status !== 'abandoned') {
        const sessionFeedback = await getSessionFeedback(session.id);
        return {
          planDate,
          plan,
          exercises,
          session,
          sessionFeedback,
          isReadOnly,
          isToday,
          isFuture,
          planRefreshed,
          partialLibraryMatch: true,
        };
      }
      plan = await refreshWorkoutPlanForDate(planDate);
      planRefreshed = true;
      const retry = await hydratePlanExercises(plan);
      exercises = retry.exercises;
      partialLibraryMatch = retry.partialLibraryMatch;
    }
  }

  const session = plan ? await getSessionForPlan(plan.id) : null;
  const sessionFeedback = session ? await getSessionFeedback(session.id) : [];

  return {
    planDate,
    plan,
    exercises,
    session,
    sessionFeedback,
    isReadOnly,
    isToday,
    isFuture,
    planRefreshed,
    partialLibraryMatch,
  };
}
