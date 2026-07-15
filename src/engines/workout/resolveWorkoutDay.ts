import { getAllExercises, getExerciseById } from '@/db/repositories/exerciseRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getSessionFeedback, getSessionForPlan, getWorkoutPlanByDate } from '@/db/repositories/workoutRepository';
import { getConfiguredWeekStartsOn } from '@/engines/coaching/weekStart';
import { PlanGenerationError, type WorkoutDayView, type WorkoutPlanExerciseDetail } from '@/types/workout';

import { ensureWorkoutPlanForDate, isDateInFuture, isDateReadOnly, isDateToday } from './ensureDailyPlan';
import { planMatchesLibrary, refreshWorkoutPlanForDate } from './repairStalePlan';
import { isScheduledWorkoutDay } from './weeklySchedule';

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

  const profile = await getProfile();
  const weekStartsOn = getConfiguredWeekStartsOn();
  const isRestDay = profile
    ? !isScheduledWorkoutDay(planDate, profile.trainingFrequency, weekStartsOn)
    : false;

  // #region agent log
  fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1efa2d' },
    body: JSON.stringify({
      sessionId: '1efa2d',
      runId: 'schedule-v1',
      hypothesisId: 'H2',
      location: 'resolveWorkoutDay.ts:loadWorkoutDay',
      message: 'day schedule classification',
      data: {
        planDate,
        isToday,
        isFuture,
        isRestDay,
        frequency: profile?.trainingFrequency ?? null,
        weekStartsOn,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (isRestDay) {
    return {
      planDate,
      plan: null,
      exercises: [],
      session: null,
      sessionFeedback: [],
      isReadOnly,
      isToday,
      isFuture,
      isRestDay: true,
    };
  }

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

  if (!plan && (isToday || isFuture)) {
    try {
      plan = await ensureWorkoutPlanForDate(planDate, undefined, {
        allowFutureGeneration: isFuture,
      });
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
          isRestDay: false,
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
    isRestDay: false,
    planRefreshed,
    partialLibraryMatch,
  };
}
