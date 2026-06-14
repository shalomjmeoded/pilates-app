import { createId } from '@/utils/createId';
import { addDays, format, parseISO, subDays } from 'date-fns';

import { getAllExercises } from '@/db/repositories/exerciseRepository';
import { getProfile } from '@/db/repositories/profileRepository';
import { getLatestPhysiqueAssessment } from '@/db/repositories/physiqueAssessmentRepository';
import {
  countWorkoutPlans,
  deleteWorkoutPlanByDate,
  getLatestWorkoutChangeFeedback,
  getLatestCompletedSessionFeedback,
  getRecentSkipCounts,
  getWorkoutChangeFeedbackForWeek,
  getWorkoutPlanByDate,
  saveWorkoutPlan,
} from '@/db/repositories/workoutRepository';
import { aiFacade } from '@/services/ai';
import type { Exercise } from '@/types/exercise';
import type { Profile } from '@/types/profile';
import {
  PlanGenerationError,
  type WorkoutFocusArea,
  type WorkoutGenerationOverrides,
  type WorkoutIntensity,
  type WorkoutPlan,
} from '@/types/workout';

import { getWeekStartDate } from '@/engines/coaching/weekStart';
import { generateWorkoutPlan, validatePlanExerciseIds } from './planGenerator';
import { applyFeedbackProgression, getDeprioritizedExerciseIds } from './progression';

const TARGET_MIN = 9;
const ONBOARDING_FOCUS_AREAS: WorkoutFocusArea[] = ['core', 'glutes', 'posture', 'mobility', 'full_body'];
const ONBOARDING_MINUTE_OPTIONS = [15, 25, 35] as const;
const ONBOARDING_INTENSITY_OPTIONS: WorkoutIntensity[] = ['lighter', 'balanced', 'challenging'];

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

interface EnsureWorkoutPlanOptions {
  allowFutureGeneration?: boolean;
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

function toDateFromPlanDate(planDate: string): Date {
  return parseISO(`${planDate}T00:00:00.000Z`);
}

async function resolveGenerationOverrides(
  profile: Profile,
  planDate: string,
  explicitOverrides?: WorkoutGenerationOverrides,
): Promise<WorkoutGenerationOverrides | undefined> {
  if (explicitOverrides) {
    return explicitOverrides;
  }

  const weekStart = getWeekStartDate(toDateFromPlanDate(planDate));
  const thisWeekFeedback = await getWorkoutChangeFeedbackForWeek(weekStart);
  if (thisWeekFeedback) {
    return {
      focusArea: thisWeekFeedback.focusArea,
      targetMinutes: thisWeekFeedback.targetMinutes,
      intensity: thisWeekFeedback.intensity,
    };
  }

  const priorFeedback = await getLatestWorkoutChangeFeedback(weekStart);
  if (!priorFeedback) {
    const workoutPlanCount = await countWorkoutPlans();
    if (workoutPlanCount === 0) {
      return resolveOnboardingSeedOverrides(profile);
    }
    return undefined;
  }

  return {
    focusArea: priorFeedback.focusArea,
    targetMinutes: priorFeedback.targetMinutes,
    intensity: priorFeedback.intensity,
  };
}

function defaultOnboardingRequest(profile: Profile): {
  focusArea: WorkoutFocusArea;
  targetMinutes: number;
  intensity: WorkoutIntensity;
} {
  const focusArea: WorkoutFocusArea =
    profile.fitnessGoal === 'build_muscle'
      ? 'glutes'
      : profile.fitnessGoal === 'maintain'
        ? 'mobility'
        : 'full_body';
  const targetMinutes =
    profile.trainingFrequency === 'none' ? 15 : profile.trainingFrequency === '1_2' ? 25 : 35;
  const intensity: WorkoutIntensity =
    profile.trainingFrequency === 'none' ? 'lighter' : profile.paceKgPerWeek >= 1 ? 'challenging' : 'balanced';

  return { focusArea, targetMinutes, intensity };
}

function normalizeOnboardingSuggestion(
  suggestion: {
    focusArea: WorkoutFocusArea;
    targetMinutes: number;
    intensity: WorkoutIntensity;
  },
): WorkoutGenerationOverrides {
  const focusArea = ONBOARDING_FOCUS_AREAS.includes(suggestion.focusArea)
    ? suggestion.focusArea
    : 'full_body';
  const targetMinutes = [...ONBOARDING_MINUTE_OPTIONS].sort(
    (a, b) => Math.abs(a - suggestion.targetMinutes) - Math.abs(b - suggestion.targetMinutes),
  )[0];
  const intensity = ONBOARDING_INTENSITY_OPTIONS.includes(suggestion.intensity)
    ? suggestion.intensity
    : 'balanced';

  return { focusArea, targetMinutes, intensity };
}

async function resolveOnboardingSeedOverrides(
  profile: Profile,
): Promise<WorkoutGenerationOverrides | undefined> {
  const request = defaultOnboardingRequest(profile);

  try {
    const suggestion = await aiFacade.suggestWorkoutChange({
      ...request,
      decisionMode: 'onboarding_seed',
      onboardingProfile: {
        fitnessGoal: profile.fitnessGoal,
        trainingFrequency: profile.trainingFrequency,
        exercisePreferences: profile.exercisePreferences,
        paceKgPerWeek: profile.paceKgPerWeek,
        weightTrajectory: profile.weightTrajectory,
      },
      availableMinuteOptions: [...ONBOARDING_MINUTE_OPTIONS],
      availableFocusAreas: [...ONBOARDING_FOCUS_AREAS],
      todayMovementCount: 0,
      todayEstimatedMinutes: 0,
    });

    return normalizeOnboardingSuggestion(suggestion);
  } catch {
    return normalizeOnboardingSuggestion(request);
  }
}

export async function ensureWorkoutPlanForDate(
  planDate: string,
  overrides?: WorkoutGenerationOverrides,
  options?: EnsureWorkoutPlanOptions,
): Promise<WorkoutPlan> {
  const profile = await getProfile();
  if (!profile) {
    throw new PlanGenerationError('NO_PROFILE', 'Complete onboarding to generate workouts.');
  }

  const resolvedOverrides = await resolveGenerationOverrides(profile, planDate, overrides);
  const existing = await getWorkoutPlanByDate(planDate);
  if (existing) {
    if (overrides) {
      await deleteWorkoutPlanByDate(planDate);
    } else {
      const library = await getAllExercises();
      if (validatePlanExerciseIds(existing.exercises, library)) {
        return existing;
      }
      await deleteWorkoutPlanByDate(planDate);
    }
  }

  if (isDateInFuture(planDate) && !options?.allowFutureGeneration) {
    throw new PlanGenerationError('UNKNOWN', 'Future workout plans are not generated yet.');
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
    resolvedOverrides,
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
