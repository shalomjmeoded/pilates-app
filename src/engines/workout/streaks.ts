import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns';

export interface WorkoutStreakStats {
  currentStreak: number;
  longestStreak: number;
  monthlyCompletionPercent: number;
  completedDaysThisMonth: number;
  plannedDaysThisMonth: number;
}

function normalizeDate(date: string | Date): string {
  if (date instanceof Date) {
    return format(date, 'yyyy-MM-dd');
  }
  return date.slice(0, 10);
}

function sortDatesAsc(dates: string[]): string[] {
  return [...new Set(dates.map(normalizeDate))].sort();
}

export function calculateCurrentStreak(completedDates: string[], anchorDate: string = normalizeDate(new Date().toISOString())): number {
  const completed = new Set(sortDatesAsc(completedDates));
  let streak = 0;
  let cursor = parseISO(anchorDate);

  while (completed.has(normalizeDate(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function calculateLongestStreak(completedDates: string[]): number {
  const sorted = sortDatesAsc(completedDates);
  if (sorted.length === 0) {
    return 0;
  }

  let longest = 1;
  let current = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const gap = differenceInCalendarDays(parseISO(sorted[index]), parseISO(sorted[index - 1]));
    if (gap === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (gap > 1) {
      current = 1;
    }
  }

  return longest;
}

export function calculateMonthlyCompletion(
  completedDates: string[],
  plannedDates: string[],
  monthPrefix: string,
): { percent: number; completed: number; planned: number } {
  const completed = completedDates.filter((date) => normalizeDate(date).startsWith(monthPrefix)).length;
  const planned = plannedDates.filter((date) => normalizeDate(date).startsWith(monthPrefix)).length;
  const percent = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  return { percent, completed, planned };
}

export function monthPrefix(date: Date = new Date()): string {
  return date.toISOString().slice(0, 7);
}

export function buildWorkoutStreakStats(
  completedDates: string[],
  plannedDates: string[],
  monthPrefix: string,
): WorkoutStreakStats {
  const monthly = calculateMonthlyCompletion(completedDates, plannedDates, monthPrefix);
  return {
    currentStreak: calculateCurrentStreak(completedDates),
    longestStreak: calculateLongestStreak(completedDates),
    monthlyCompletionPercent: monthly.percent,
    completedDaysThisMonth: monthly.completed,
    plannedDaysThisMonth: monthly.planned,
  };
}
