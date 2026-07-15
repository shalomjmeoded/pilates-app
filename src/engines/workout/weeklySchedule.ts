import { addDays, format, parseISO } from 'date-fns';

import { getConfiguredWeekStartsOn, getWeekStartDate } from '@/engines/coaching/weekStart';
import { trainingFrequencyToWorkoutsPerWeek } from '@/engines/monetization/premiumAccess';
import { preferencesStorage } from '@/storage/mmkv';
import type { TrainingFrequency } from '@/types/profile';
import type { WeekStartsOn } from '@/types/preferences';

/** Day offsets from week start (0–6) for N workout days — spaced for recovery. */
const WORKOUT_OFFSET_PATTERNS: Record<number, number[]> = {
  1: [2],
  2: [1, 4],
  3: [0, 2, 4],
  4: [0, 2, 4, 5],
  5: [0, 1, 3, 4, 6],
  6: [0, 1, 2, 3, 4, 5],
  7: [0, 1, 2, 3, 4, 5, 6],
};

const SCHEDULE_PHASE_KEY = 'schedule_phase_offset';

export function workoutDayOffsetsForCount(count: number): number[] {
  const clamped = Math.max(0, Math.min(7, Math.round(count)));
  if (clamped === 0) {
    return [];
  }
  return WORKOUT_OFFSET_PATTERNS[clamped] ?? WORKOUT_OFFSET_PATTERNS[3];
}

export function getWeekDates(weekStart: string): string[] {
  const start = parseISO(`${weekStart}T00:00:00`);
  return Array.from({ length: 7 }, (_, index) => format(addDays(start, index), 'yyyy-MM-dd'));
}

export function getWeekCalendarDates(
  weekOffset = 0,
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
  today: Date = new Date(),
): string[] {
  const anchor = addDays(today, weekOffset * 7);
  const weekStart = getWeekStartDate(anchor, weekStartsOn);
  return getWeekDates(weekStart);
}

/** Offset of `date` within its configured week (0–6). */
export function weekDayOffset(
  date: Date | string,
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): number {
  const planDate = typeof date === 'string' ? date : format(date, 'yyyy-MM-dd');
  const weekStart = getWeekStartDate(parseISO(`${planDate}T00:00:00`), weekStartsOn);
  const dates = getWeekDates(weekStart);
  const index = dates.indexOf(planDate);
  return index >= 0 ? index : 0;
}

/**
 * Persist the weekday (offset from week start) of the user's first workout day.
 * Called at onboarding finish so day 1 is never a rest day.
 */
export function setSchedulePhaseFromDate(
  date: Date | string = new Date(),
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): number {
  const phase = weekDayOffset(date, weekStartsOn);
  preferencesStorage.setCachedFlag(SCHEDULE_PHASE_KEY, phase);
  return phase;
}

/**
 * Phase rotates the pattern so the first workout after onboarding lands on a work day.
 * If unset (legacy installs), anchors to today once.
 */
export function getOrCreateSchedulePhaseOffset(
  today: Date = new Date(),
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): number {
  const flags = preferencesStorage.getCachedFlags();
  const stored = flags[SCHEDULE_PHASE_KEY];
  if (typeof stored === 'number' && stored >= 0 && stored <= 6) {
    return stored;
  }
  return setSchedulePhaseFromDate(today, weekStartsOn);
}

/** Rotate pattern so offset `phase` is always a scheduled workout day. */
export function applySchedulePhase(offsets: number[], phase: number): number[] {
  if (offsets.length === 0) {
    return [];
  }
  const base = offsets[0];
  return [...new Set(offsets.map((offset) => (offset - base + phase + 7) % 7))].sort(
    (a, b) => a - b,
  );
}

export function getScheduledWorkoutDatesForWeek(
  weekStart: string,
  frequency: TrainingFrequency,
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
  today: Date = new Date(),
): string[] {
  const dates = getWeekDates(weekStart);
  const phase = getOrCreateSchedulePhaseOffset(today, weekStartsOn);
  const baseOffsets = workoutDayOffsetsForCount(trainingFrequencyToWorkoutsPerWeek(frequency));
  const offsets = applySchedulePhase(baseOffsets, phase);

  // #region agent log
  fetch('http://127.0.0.1:7686/ingest/ee46ee9f-47bb-4280-943b-99e933d45b4f', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '1efa2d' },
    body: JSON.stringify({
      sessionId: '1efa2d',
      runId: 'schedule-phase-v1',
      hypothesisId: 'S1',
      location: 'weeklySchedule.ts:getScheduledWorkoutDatesForWeek',
      message: 'schedule phase applied',
      data: { weekStart, frequency, phase, baseOffsets, offsets, workoutDates: offsets.map((o) => dates[o]) },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  return offsets.map((offset) => dates[offset]).filter(Boolean);
}

export function isScheduledWorkoutDay(
  planDate: string,
  frequency: TrainingFrequency,
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): boolean {
  const weekStart = getWeekStartDate(parseISO(`${planDate}T00:00:00`), weekStartsOn);
  return getScheduledWorkoutDatesForWeek(weekStart, frequency, weekStartsOn).includes(planDate);
}

/** 0-based index among scheduled workout days this week, or -1 if rest. */
export function workoutDayIndexInWeek(
  planDate: string,
  frequency: TrainingFrequency,
  weekStartsOn: WeekStartsOn = getConfiguredWeekStartsOn(),
): number {
  const weekStart = getWeekStartDate(parseISO(`${planDate}T00:00:00`), weekStartsOn);
  return getScheduledWorkoutDatesForWeek(weekStart, frequency, weekStartsOn).indexOf(planDate);
}
