import { parseISO } from 'date-fns';

import {
  countWorkoutChangeEventsForDate,
  logWorkoutChangeEvent,
  upsertWorkoutChangeFeedback,
} from '@/db/repositories/workoutRepository';
import { getWeekStartDate } from '@/engines/coaching/weekStart';
import { aiFacade } from '@/services/ai';
import type { AiWorkoutChangeSuggestion } from '@/types/ai';
import type {
  WorkoutChangeRequest,
  WorkoutFocusArea,
  WorkoutGenerationOverrides,
  WorkoutIntensity,
} from '@/types/workout';

import {
  WORKOUT_CHANGE_FOCUS_OPTIONS,
  WORKOUT_CHANGE_INTENSITY_OPTIONS,
  WORKOUT_CHANGE_MINUTE_OPTIONS,
} from './workoutChangeOptions';
import { regenerateUpcomingWorkoutPlans } from './regenerateUpcomingWorkoutPlans';

/**
 * Applies a user-requested workout change, asks AI coach for refinement,
 * persists weekly preference, then regenerates the upcoming 7-day window.
 */
export interface ApplyWorkoutChangeInput {
  planDate: string;
  request: WorkoutChangeRequest;
  todayMovementCount: number;
  todayEstimatedMinutes: number;
}

export interface ApplyWorkoutChangeResult {
  appliedRequest: WorkoutChangeRequest;
  coachingRationale: string;
  regeneratedDates: string[];
  skippedDates: string[];
  remainingChangesToday: number;
}

const DAILY_WORKOUT_CHANGE_LIMIT = 2;

const ALLOWED_FOCUS_AREAS = WORKOUT_CHANGE_FOCUS_OPTIONS.map(
  (option) => option.value,
) as WorkoutFocusArea[];
const ALLOWED_INTENSITIES = WORKOUT_CHANGE_INTENSITY_OPTIONS.map(
  (option) => option.value,
) as WorkoutIntensity[];

function normalizeToNearestMinute(value: number): number {
  return [...WORKOUT_CHANGE_MINUTE_OPTIONS]
    .sort((a, b) => Math.abs(a - value) - Math.abs(b - value))[0];
}

function deterministicFallback(request: WorkoutChangeRequest): AiWorkoutChangeSuggestion {
  return {
    focusArea: request.focusArea,
    targetMinutes: request.targetMinutes,
    intensity: request.intensity,
    coachRationale:
      'Nice adjustment. This keeps your routine aligned to your focus while preserving steady week-over-week progress.',
  };
}

function normalizeSuggestion(
  request: WorkoutChangeRequest,
  suggestion: AiWorkoutChangeSuggestion,
): WorkoutChangeRequest {
  const focusArea = ALLOWED_FOCUS_AREAS.includes(suggestion.focusArea)
    ? suggestion.focusArea
    : request.focusArea;
  const intensity = ALLOWED_INTENSITIES.includes(suggestion.intensity)
    ? suggestion.intensity
    : request.intensity;

  return {
    focusArea,
    targetMinutes: normalizeToNearestMinute(suggestion.targetMinutes),
    intensity,
    coachNote: request.coachNote,
  };
}

export async function applyWorkoutChangeRequest(
  input: ApplyWorkoutChangeInput,
): Promise<ApplyWorkoutChangeResult> {
  const { planDate, request, todayMovementCount, todayEstimatedMinutes } = input;
  const changesUsedToday = await countWorkoutChangeEventsForDate(planDate);

  if (changesUsedToday >= DAILY_WORKOUT_CHANGE_LIMIT) {
    throw new Error('You already changed today’s workout twice. You can change it again tomorrow.');
  }

  let suggestion = deterministicFallback(request);
  try {
    suggestion = await aiFacade.suggestWorkoutChange({
      ...request,
      availableMinuteOptions: [...WORKOUT_CHANGE_MINUTE_OPTIONS],
      availableFocusAreas: ALLOWED_FOCUS_AREAS,
      todayMovementCount,
      todayEstimatedMinutes,
    });
  } catch {
    // Fall through to deterministic suggestion.
  }

  const appliedRequest = normalizeSuggestion(request, suggestion);
  const overrides: WorkoutGenerationOverrides = {
    focusArea: appliedRequest.focusArea,
    targetMinutes: appliedRequest.targetMinutes,
    intensity: appliedRequest.intensity,
  };

  const weekStart = getWeekStartDate(parseISO(`${planDate}T00:00:00.000Z`));
  await upsertWorkoutChangeFeedback(weekStart, planDate, appliedRequest);

  const regeneration = await regenerateUpcomingWorkoutPlans(planDate, overrides, 7);
  await logWorkoutChangeEvent(planDate, planDate, appliedRequest);
  const remainingChangesToday = Math.max(0, DAILY_WORKOUT_CHANGE_LIMIT - (changesUsedToday + 1));

  return {
    appliedRequest,
    coachingRationale: suggestion.coachRationale,
    regeneratedDates: regeneration.regeneratedDates,
    skippedDates: regeneration.skippedDates,
    remainingChangesToday,
  };
}
