import { createId } from '@/utils/createId';
import { addDays, format, parseISO, subDays } from 'date-fns';

import { getAllExercises } from '@/db/repositories/exerciseRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getLatestPhysiqueAssessment } from '@/db/repositories/physiqueAssessmentRepository';
import {
  deleteWorkoutPlanByDate,
  getLatestCompletedSessionFeedback,
  getRecentSkipCounts,
  getWorkoutPlanByDate,
  saveWorkoutPlan,
} from '@/db/repositories/workoutRepository';
import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';
import { PlanGenerationError, type WorkoutPlan } from '@/types/workout';

import { generateWorkoutPlan, validatePlanExerciseIds } from './planGenerator';
import { applyFeedbackProgression, getDeprioritizedExerciseIds } from './progression';

const TARGET_MIN = 9;

export function formatPlanDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getCalendarDates(anchor: Date = new Date()): string[] {
  return Array.from({ length: 7 }, (_, index) =>
    formatPlanDate(addDays(subDays(anchor, 3), index)),
  );
}

export function isDateInFuture(planDate: string, today: Date = new Date()): boolean {
  return planDate > formatPlanDate(today);
}

export function isDateToday(planDate: string, today: Date = new Date()): boolean {
  return planDate === formatPlanDate(today);
}

export function isDateReadOnly(planDate: string, today: Date = new Date()): boolean {
  return planDate < formatPlanDate(today) || isDateInFuture(planDate, today);
}

async function buildAdaptationContext(library: Exercise[], beforeDate: string) {
  const skipCounts = await getRecentSkipCounts(14);
  const skippedFrequentIds = getDeprioritizedExerciseIds(skipCounts);
  const lastSessionFeedback = await getLatestCompletedSessionFeedback(beforeDate);
  const libraryById = new Map(library.map((exercise) => [exercise.id, exercise]));

  return {
    skippedFrequentIds,
    lastSessionFeedback,
    libraryById,
  };
}

export async function ensureWorkoutPlanForDate(planDate: string): Promise<WorkoutPlan> {
  const existing = await getWorkoutPlanByDate(planDate);
  if (existing) {
    const library = await getAllExercises();
    if (validatePlanExerciseIds(existing.exercises, library)) {
      return existing;
    }
    await deleteWorkoutPlanByDate(planDate);
  }

  if (isDateInFuture(planDate)) {
    throw new PlanGenerationError('UNKNOWN', 'Future workout plans are not generated yet.');
  }

  const profile = await getProfile();
  if (!profile) {
    throw new PlanGenerationError('NO_PROFILE', 'Complete onboarding to generate workouts.');
  }

  const library = await getAllExercises();
  if (library.length === 0) {
    throw new PlanGenerationError('EMPTY_LIBRARY', 'Exercise library is empty. Restart the app.');
  }

  if (library.length < TARGET_MIN) {
    throw new PlanGenerationError(
      'INSUFFICIENT_EXERCISES',
      `Need at least ${TARGET_MIN} exercises in the library.`,
    );
  }

  const adaptation = await buildAdaptationContext(library, planDate);
  const latestPhysique = await getLatestPhysiqueAssessment();
  const physiqueContext = latestPhysique
    ? { physiqueCategory: latestPhysique.physiqueCategory }
    : undefined;
  let plan = generateWorkoutPlan(
    profile,
    library,
    planDate,
    createId(),
    adaptation,
    physiqueContext,
  );

  if (adaptation.lastSessionFeedback.length > 0) {
    plan = {
      ...plan,
      exercises: applyFeedbackProgression(plan.exercises, adaptation.lastSessionFeedback),
    };
  }

  if (plan.exercises.length < TARGET_MIN) {
    throw new PlanGenerationError(
      'INSUFFICIENT_EXERCISES',
      'Could not build a full workout plan for this day.',
    );
  }

  if (!validatePlanExerciseIds(plan.exercises, library)) {
    throw new PlanGenerationError(
      'INVALID_LIBRARY_IDS',
      'Generated plan referenced unknown exercises.',
    );
  }

  await saveWorkoutPlan(plan);
  return plan;
}

export async function ensureNextDayPlanAdapted(completedPlanDate: string): Promise<void> {
  const nextDate = formatPlanDate(addDays(parseISO(completedPlanDate), 1));
  if (isDateInFuture(nextDate)) {
    return;
  }

  const existing = await getWorkoutPlanByDate(nextDate);
  if (existing) {
    return;
  }

  await ensureWorkoutPlanForDate(nextDate);
}

export async function resolveProfileOrThrow(): Promise<Profile> {
  const profile = await getProfile();
  if (!profile) {
    throw new PlanGenerationError('NO_PROFILE', 'Complete onboarding to access workouts.');
  }
  return profile;
}
