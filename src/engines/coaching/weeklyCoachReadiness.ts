import { addDays, format, parseISO } from 'date-fns';

import type { NutritionDailyTotalsRow } from '@/types/nutrition';
import type { WeightLog } from '@/types/progress';

export const WEEKLY_COACH_UNLOCK_PERCENT = 70;
const DAYS_IN_WEEK = 7;

export interface WeeklyCoachReadinessBucket {
  logged: number;
  expected: number;
  percent: number;
}

export interface WeeklyCoachReadiness {
  unlocked: boolean;
  overallPercent: number;
  unlockThreshold: number;
  weight: WeeklyCoachReadinessBucket;
  nutrition: WeeklyCoachReadinessBucket;
  sessions: WeeklyCoachReadinessBucket;
  reviewWeekStart: string;
  reviewWeekEnd: string;
}

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function datesInRange(start: string, end: string): string[] {
  const dates: string[] = [];
  let cursor = parseISO(`${start}T00:00:00`);
  const last = parseISO(`${end}T00:00:00`);
  while (cursor <= last) {
    dates.push(format(cursor, 'yyyy-MM-dd'));
    cursor = addDays(cursor, 1);
  }
  return dates;
}

function percentOf(logged: number, expected: number): number {
  if (expected <= 0) {
    return 0;
  }
  return clampPercent((logged / expected) * 100);
}

export function computeWeeklyCoachReadiness(input: {
  reviewWeekStart: string;
  reviewWeekEnd: string;
  weightLogs: WeightLog[];
  nutritionRows: NutritionDailyTotalsRow[];
  workoutsCompleted: number;
  workoutsPlanned: number;
}): WeeklyCoachReadiness {
  const weekDates = new Set(datesInRange(input.reviewWeekStart, input.reviewWeekEnd));

  const weightDays = new Set(
    input.weightLogs
      .map((log) => log.loggedAt.slice(0, 10))
      .filter((date) => weekDates.has(date)),
  );

  const nutritionDays = new Set(
    input.nutritionRows
      .filter((row) => weekDates.has(row.mealDate) && row.caloriesConsumed > 0)
      .map((row) => row.mealDate),
  );

  const planned = Math.max(0, input.workoutsPlanned);
  const completed = Math.max(0, input.workoutsCompleted);
  const sessionExpected = planned > 0 ? planned : DAYS_IN_WEEK;

  const weight = {
    logged: weightDays.size,
    expected: DAYS_IN_WEEK,
    percent: percentOf(weightDays.size, DAYS_IN_WEEK),
  };
  const nutrition = {
    logged: nutritionDays.size,
    expected: DAYS_IN_WEEK,
    percent: percentOf(nutritionDays.size, DAYS_IN_WEEK),
  };
  const sessions = {
    logged: Math.min(completed, sessionExpected),
    expected: sessionExpected,
    percent: percentOf(Math.min(completed, sessionExpected), sessionExpected),
  };

  const overallPercent = clampPercent(
    (weight.percent + nutrition.percent + sessions.percent) / 3,
  );

  return {
    unlocked: overallPercent >= WEEKLY_COACH_UNLOCK_PERCENT,
    overallPercent,
    unlockThreshold: WEEKLY_COACH_UNLOCK_PERCENT,
    weight,
    nutrition,
    sessions,
    reviewWeekStart: input.reviewWeekStart,
    reviewWeekEnd: input.reviewWeekEnd,
  };
}
